/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import {
    SourceFile,
    Node,
    TextContentNode,
    Token
} from "./nodes";
import {
    Position
} from "./types";
import {
    isTextContentKind,
    isTokenKind,
    SyntaxKind,
    tokenToString
} from "./tokens";
import { Scanner } from "./scanner";
import { NullDiagnosticMessages } from "./diagnostics";
import { getNodeAccessor } from "./nodeInternal";

const perFileLeadingTokensMap = new WeakMap<SourceFile, Map<Node, readonly Token[] | null>>();
const perFileTrailingTokensMap = new WeakMap<SourceFile, Map<Node, readonly Token[] | null>>();

/**
 * Navigates the syntax-tree of a {@link SourceFile}.
 * {@docCategory Compiler}
 *
 * @remarks
 * Nodes in Grammarkdown's syntax tree are immutable and do not maintain pointers to their parents.
 * This can make traversing through a document somewhat difficult. The NodeNavigator class is intended
 * to improve this process by providing an API that can traverse a syntax tree starting from the root.
 *
 * A NodeNavigator focuses on a specific {@link Node} within a syntax tree, and maintains the
 * path to that node from the root. Various methods on the navigator move the focus, allowing you to
 * navigate to any other node within the syntax tree.
 */
export class NodeNavigator {
    private _sourceFile: SourceFile;
    private _nodeStack: (Node | undefined)[];
    private _edgeStack: (number | undefined)[];
    private _arrayStack: (ReadonlyArray<Node> | undefined)[];
    private _offsetStack: (number | undefined)[];
    private _currentDepth: number;
    private _currentNode!: Node;
    private _currentEdge!: number;
    private _currentOffset!: number;
    private _currentArray: ReadonlyArray<Node> | undefined;
    private _parentNode: Node | undefined;
    private _hasAnyChildren: boolean | undefined;
    private _leadingTokens: readonly Token[] | undefined | null;
    private _trailingTokens: readonly Token[] | undefined | null;
    private _tokenOffset: number;
    private _copyOnNavigate: boolean = false;

    /**
     * @param sourceFile The {@link SourceFile} to use as the root of the navigator.
     */
    public constructor(sourceFile: SourceFile);
    /**
     * @param other A {@link NodeNavigator} whose position information is used to create this navigator.
     */
    public constructor(other: NodeNavigator);
    public constructor(sourceFileOrNavigator: SourceFile | NodeNavigator) {
        if (sourceFileOrNavigator instanceof NodeNavigator) {
            const navigator = <NodeNavigator>sourceFileOrNavigator;
            this._sourceFile = navigator._sourceFile;
            this._edgeStack = navigator._edgeStack.slice();
            this._arrayStack = navigator._arrayStack.slice();
            this._offsetStack = navigator._offsetStack.slice();
            this._nodeStack = navigator._nodeStack.slice();
            this._currentDepth = this._nodeStack.length - 1;
            this._leadingTokens = navigator._leadingTokens;
            this._trailingTokens = navigator._trailingTokens;
            this._tokenOffset = navigator._tokenOffset;
        }
        else {
            this._sourceFile = <SourceFile>sourceFileOrNavigator;
            this._edgeStack = [-1];
            this._arrayStack = [undefined];
            this._offsetStack = [0];
            this._nodeStack = [this._sourceFile];
            this._currentDepth = 0;
            this._leadingTokens = undefined;
            this._trailingTokens = undefined;
            this._tokenOffset = -1;
        }
        this._afterNavigate();
    }

    /**
     * Creates a copy of this {@link NodeNavigator} at the same position.
     */
    public clone() {
        return new NodeNavigator(this);
    }

    /**
     * Gets the root {@link SourceFile} node for this navigator.
     */
    public getRoot() {
        return this._sourceFile;
    }

    /**
     * Gets the parent {@link Node} of the {@link Node} the navigator is currently focused on.
     */
    public getParent() {
        return this._parentNode;
    }

    /**
     * Gets the {@link Node} the navigator is currently focused on.
     */
    public getNode() {
        return this._currentNode;
    }

    /**
     * If the {@link Node} the navigator is currently focused on is a {@link TextContentNode}, returns the `text` of the node;
     * Otherwise, returns `undefined`.
     */
    public getTextContent() {
        if (isTextContentKind(this.getKind())) {
            return (this._currentNode as TextContentNode).text;
        }
    }

    /**
     * Gets the {@link SyntaxKind} of the {@link Node} the navigator is currently focused on.
     */
    public getKind() {
        return this._currentNode.kind;
    }

    /**
     * Gets the string representation of the {@link SyntaxKind} of the {@link Node} the navigator is currently focused on.
     */
    public getKindString() {
        return tokenToString(this.getKind());
    }

    /**
     * Gets the name of the property on the parent {@link Node} the navigator is currently focused on.
     */
    public getName() {
        return this._leadingTokens ? "(leadingTokens)" :
            this._trailingTokens ? "(trailingTokens)" :
            this._parentNode && getNodeAccessor().edgeName(this._parentNode, this._currentEdge);
    }

    /**
     * Gets the containing node array of {@link Node} the navigator is currently focused on.
     */
    public getArray() {
        return this._leadingTokens || this._trailingTokens || this._currentArray;
    }

    /**
     * Gets the ordinal offset within the containing node array of {@link Node} the navigator is currently focused on.
     */
    public getOffset() {
        return this._leadingTokens || this._trailingTokens ? this._tokenOffset : this._currentOffset;
    }

    /**
     * Gets the current depth within the syntax-tree of the current focus of the navigator.
     */
    public getDepth() {
        return this._getDepth();
    }

    /**
     * Returns a value indicating whether the focus of the navigator points to a {@link Node} in an array.
     */
    public isArray(): boolean {
        return this._leadingTokens !== undefined ||
            this._trailingTokens !== undefined ||
            this._currentArray !== undefined;
    }

    /**
     * Returns a value indicating whether the navigator is focused on a leading token of the actual current node.
     */
    public isLeadingToken() {
        return !!this._leadingTokens;
    }

    /**
     * Returns a value indicating whether the navigator is focused on a trailing token of the actual current node.
     */
    public isTrailingToken() {
        return !!this._trailingTokens;
    }

    /**
     * Returns a value indicating whether the focus of the navigator points to either a {@link Token}, {@link TextContentNode}, or {@link InvalidSymbol} (as long as that `InvalidSymbol` has no trailing tokens).
     */
    public isToken(): boolean {
        const kind = this.getKind();
        return isTokenKind(kind)
            || isTextContentKind(kind)
            || !!this._leadingTokens
            || !!this._trailingTokens
            || kind === SyntaxKind.InvalidSymbol && !(scanInterveningTokens(this._currentNode, this._sourceFile), getTrailingTokens(this._currentNode, this._sourceFile));
    }

    /**
     * Creates an iterator for the ancestors of the focused {@link Node}.
     * @param predicate An optional callback that can be used to filter the ancestors of the node.
     */
    public ancestors(predicate?: (ancestor: Node) => boolean): IterableIterator<Node>;
    /**
     * Creates an iterator for the parse tree ancestors of the focused {@link Node}.
     * @param kind The {@link SyntaxKind} that any yielded ancestor must match.
     */
    public ancestors(kind: SyntaxKind): IterableIterator<Node>;
    public * ancestors(predicateOrKind?: SyntaxKind | ((ancestor: Node) => boolean)): IterableIterator<Node> {
        const navigator = this.clone();
        while (navigator.moveToParent()) {
            if (matchPredicateOrKind(navigator._currentNode, predicateOrKind)) yield navigator._currentNode;
        }
    }

    /**
     * Creates an iterator for the parse tree children of the focused {@link Node}.
     * @param predicate An optional callback that can be used to filter the children of the node.
     * @remarks This does not account for tokens not included in the parse tree.
     */
    public children(predicate?: (child: Node) => boolean): IterableIterator<Node>;
    /**
     * Creates an iterator for the parse tree children of the focused {@link Node}.
     * @param kind The {@link SyntaxKind} that any yielded child must match.
     * @remarks This does not account for tokens not included in the parse tree.
     */
    public children(kind: SyntaxKind): IterableIterator<Node>;
    public * children(predicateOrKind?: SyntaxKind | ((child: Node) => boolean)): IterableIterator<Node> {
        const navigator = this.clone();
        if (navigator.moveToFirstChild()) {
            do {
                if (matchPredicateOrKind(navigator._currentNode, predicateOrKind)) yield navigator._currentNode;
            }
            while (navigator.moveToNextSibling());
        }
    }

    /**
     * Creates an iterator for the tokens of the focused {@link Node}.
     * @param predicate An optional callback that can be used to filter the tokens of the node.
     */
    public tokens(predicate?: (token: Node) => boolean): IterableIterator<Node>;
    /**
     * Creates an iterator for the tokens of the focused {@link Node}.
     * @param kind The {@link SyntaxKind} that any yielded token must match.
     */
    public tokens(kind: SyntaxKind): IterableIterator<Node>;
    public * tokens(predicateOrKind?: SyntaxKind | ((child: Node) => boolean)): IterableIterator<Node> {
        const navigator = this.clone();
        if (navigator.moveToFirstToken()) {
            do {
                if (matchPredicateOrKind(navigator._currentNode, predicateOrKind)) yield navigator._currentNode;
            }
            while (navigator.moveToNextToken());
        }
    }

    /**
     * Determines whether the focused {@link Node} has an ancestor that matches the supplied predicate.
     * @param predicate An optional callback used to filter the ancestors of the node.
     * @returns `true` if the focused {@link Node} contains an ancestor that matches the supplied predicate; otherwise, `false`.
     */
    public hasAncestor(predicate?: (ancestor: Node) => boolean): boolean;
    /**
     * Determines whether the focused {@link Node} has an ancestor that matches the supplied predicate.
     * @param predicate An optional callback used to filter the ancestors of the node.
     * @returns `true` if the focused {@link Node} contains an ancestor that matches the supplied predicate; otherwise, `false`.
     */
    public hasAncestor(kind: SyntaxKind): boolean;
    public hasAncestor(predicateOrKind?: SyntaxKind | ((ancestor: Node) => boolean)): boolean {
        for (let nextDepth = this._getDepth() - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this._nodeStack[nextDepth]!;
            if (matchPredicateOrKind(nextNode, predicateOrKind)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determines whether the focused {@link Node} has any children that match the supplied predicate.
     * @param predicate An optional callback that can be used to filter the children of the node.
     * @returns `true` if the focused {@link Node} contains a child that matches the supplied predicate; otherwise, `false`.
     * @remarks This does not account for tokens not included in the parse tree.
     */
    public hasChildren(predicate?: (child: Node) => boolean): boolean;
    /**
     * Determines whether the focused {@link Node} has any children with the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that at least one child must match.
     * @returns `true` if the focused {@link Node} contains a matching child; otherwise, `false`.
     * @remarks This does not account for tokens not included in the parse tree.
     */
    public hasChildren(kind: SyntaxKind): boolean;
    public hasChildren(predicateOrKind?: SyntaxKind | ((child: Node) => boolean)): boolean {
        if (this._hasAnyChildren === false || getNodeAccessor().edgeCount(this._currentNode) === 0) {
            return false;
        }
        if (predicateOrKind === undefined && this._hasAnyChildren !== undefined) {
            return this._hasAnyChildren;
        }
        for (let nextEdge = 0; nextEdge < getNodeAccessor().edgeCount(this._currentNode); nextEdge++) {
            const next = getNodeAccessor().edgeValue(this._currentNode, nextEdge);
            if (isNodeArray(next)) {
                for (let nextOffset = 0; nextOffset < next.length; nextOffset++) {
                    const nextNode = next[nextOffset];
                    if (nextNode && matchPredicateOrKind(nextNode, predicateOrKind)) {
                        return this._hasAnyChildren = true;
                    }
                }
            }
            else if (next && matchPredicateOrKind(next, predicateOrKind)) {
                return this._hasAnyChildren = true;
            }
        }
        if (!predicateOrKind) {
            this._hasAnyChildren = false;
        }
        return false;
    }

    /**
     * Determines whether the focused {@link Node} matches the supplied predicate.
     * @param predicate A callback used to match the focused {@link Node}.
     * @returns `true` if the focused {@link Node} matches; otherwise, `false`.
     */
    public isMatch(predicate: (node: Node) => boolean): boolean;
    /**
     * Determines whether the focused {@link Node} matches the supplied {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the focused {@link Node} must match.
     * @returns `true` if the focused {@link Node} matches; otherwise, `false`.
     */
    public isMatch(kind: SyntaxKind): boolean;
    public isMatch(predicateOrKind: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._isMatch(predicateOrKind);
    }

    /**
     * Determines whether this navigator is focused on the same location within the tree as another navigator.
     * @param other The other navigator.
     * @returns `true` if both navigators are focused on the same location within the tree; otherwise, `false`.
     */
    public isSamePosition(other: NodeNavigator) {
        if (this === other) {
            return true;
        }

        return this._sourceFile === other._sourceFile
            && this._currentDepth === other._currentDepth
            && this._currentEdge === other._currentEdge
            && this._currentArray === other._currentArray
            && this._currentOffset === other._currentOffset
            && this._currentNode === other._currentNode
            && this._leadingTokens === other._leadingTokens
            && this._trailingTokens === other._trailingTokens
            && this._tokenOffset === other._tokenOffset;
    }

    /**
     * Moves the focus of this navigator to the same position within the syntax tree as another navigator.
     * @param other The other navigator.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveTo(other: NodeNavigator) {
        if (this === other) {
            return true;
        }

        if (this._sourceFile !== other._sourceFile) {
            return false;
        }

        this._currentDepth = other._currentDepth;
        this._edgeStack = other._edgeStack.slice();
        this._arrayStack = other._arrayStack.slice();
        this._offsetStack = other._offsetStack.slice();
        this._nodeStack = other._nodeStack.slice();
        this._leadingTokens = other._leadingTokens;
        this._trailingTokens = other._trailingTokens;
        this._tokenOffset = other._tokenOffset;
        this._afterNavigate();
        return true;
    }

    /**
     * Moves the focus of the navigator to the root of the syntax tree.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToRoot(): boolean {
        if (this._getDepth() > 0) {
            this._beforeNavigate();
            this._reset();
            this._afterNavigate();
        }

        return true;
    }

    /**
     * Moves the focus of the navigator to the parent {@link Node} of the focused {@link Node}.
     * @param predicate An optional callback that determines whether the focus should move to the parent node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToParent(predicate?: (parent: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the parent {@link Node} of the focused {@link Node}.
     * @param kind The required {@link SyntaxKind} of the parent node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToParent(kind: SyntaxKind): boolean;
    public moveToParent(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        if (this._getDepth() > 0) {
            if (matchPredicateOrKind(this._parentNode!, predicateOrKind)) {
                this._beforeNavigate();
                this._popEdge();
                this._afterNavigate();
                return true;
            }
        }

        return false;
    }

    /**
     * Moves the focus of the navigator to the nearest ancestor matching the supplied predicate. If the current node
     * matches the predicate, the focus does not change.
     * @param predicate A callback used to match an ancestor.
     * @returns `true` if the current node matched the predicate or the navigator's focus changed; otherwise, `false`.
     */
    public moveToAncestorOrSelf(predicate: (ancestorOrSelf: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the nearest ancestor matching the supplied predicate. If the current node
     * matches the predicate, the focus does not change.
     * @param kind The {@link SyntaxKind} that the focused {@link Node} or one of its ancestors must match.
     * @returns `true` if the current node matched the predicate or the navigator's focus changed; otherwise, `false`.
     */
    public moveToAncestorOrSelf(kind: SyntaxKind): boolean;
    public moveToAncestorOrSelf(predicateOrKind: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._isMatch(predicateOrKind as SyntaxKind)
            || this.moveToAncestor(predicateOrKind as SyntaxKind);
    }

    /**
     * Moves the focus of the navigator to the nearest ancestor matching the supplied predicate.
     * @param predicate A callback used to match an ancestor.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToAncestor(predicate: (ancestor: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the nearest ancestor matching the supplied {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the ancestor must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToAncestor(kind: SyntaxKind): boolean;
    public moveToAncestor(predicateOrKind: SyntaxKind | ((node: Node) => boolean)): boolean {
        for (let nextDepth = this._getDepth() - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this._nodeStack[nextDepth]!;
            if (matchPredicateOrKind(nextNode, predicateOrKind)) {
                this._beforeNavigate();
                while (this._getDepth() !== nextDepth) {
                    this._popEdge();
                }
                this._afterNavigate();
                return true;
            }
        }

        return false;
    }

    /**
     * Moves the focus of the navigator to the parent of the focused {@link Node} if that parent is a {@link SourceElement}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToSourceElement(): boolean {
        return this.moveToParent(matchSourceElement);
    }

    /**
     * Moves the focus of the navigator to the parent of the focused {@link Node} if that parent is either a {@link Parameter} or a {@link Production}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToDeclaration(): boolean {
        return this.moveToParent(SyntaxKind.Parameter)
            || this.moveToParent(SyntaxKind.Production);
    }

    /**
     * Moves the focus of the navigator to the nearest {@link Identifier}.
     * @returns `true` if the current node is an {@link Identifier} or the navigator's focus changed; otherwise, `false`.
     * @remarks
     * The "nearest {@link Identifier}" is determined using the following rules:
     * <ul>
     * <li>If the focus or its nearest ancestor is a {@link Parameter}, move to the `name` of the {@link Parameter}.</li>
     * <li>If the focus or its nearest ancestor is an {@link Argument}, move to the `name` of the {@link Argument}.</li>
     * <li>If the focus or its nearest ancestor is a {@link Nonterminal}, move to the `name` of the {@link Nonterminal}.</li>
     * <li>If the focus or its nearest ancestor is a {@link LexicalGoalAssertion}, move to the `symbol` of the of the {@link LexicalGoalAssertion}.</li>
     * <li>If the focus or its nearest ancestor is a {@link Define}, move to the `key` of the {@link Define}.</li>
     * <li>If the focus or its nearest ancestor is a {@link Constraints}, move to the `name` of the of the first {@link Argument} of the {@link Constraints}.</li>
     * <li>If the focus is not within the `body` of a {@link Production} and the focus or its nearest ancestor is a {@link Production}, move to the `name` of the {@link Production}.</li>
     * </ul>
     */
    public moveToName(): boolean {
        if (this.getKind() === SyntaxKind.Identifier) {
            return true;
        }
        else {
            const navigator = this.clone();
            if (navigator.moveToAncestorOrSelf(SyntaxKind.Parameter)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(SyntaxKind.Argument)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(SyntaxKind.Nonterminal)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(SyntaxKind.LexicalGoalAssertion)
                && navigator.moveToFirstChild("symbol")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToAncestorOrSelf(SyntaxKind.Constraints)
                && navigator.moveToFirstChild("elements")
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (!navigator.hasAncestor(matchProductionBody)
                && navigator.moveToAncestorOrSelf(SyntaxKind.Production)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }

            navigator.moveTo(this);
            if (navigator.moveToParent(SyntaxKind.InvalidAssertion)
                && navigator.moveToParent(SyntaxKind.SymbolSpan)
                && navigator.moveToPreviousSibling(SyntaxKind.Nonterminal)
                && navigator.moveToFirstChild("name")) {
                return this.moveTo(navigator);
            }
        }

        return false;
    }

    /**
     * Moves the focus of the navigator to the first child of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstChild(): boolean;
    /**
     * Moves the focus of the navigator to the first child of the focused {@link Node} with the provided property name.
     * @param name The name of the property on the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstChild(name: string): boolean;
    /**
     * Moves the focus of the navigator to the first child of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a child node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstChild(predicate: (child: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the first child of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the child must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstChild(kind: SyntaxKind): boolean;
    public moveToFirstChild(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToChild(Navigation.first, Navigation.next, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the last child of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastChild(): boolean;
    /**
     * Moves the focus of the navigator to the last child of the focused {@link Node} with the provided property name.
     * @param name The name of the property on the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastChild(name: string): boolean;
    /**
     * Moves the focus of the navigator to the last child of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a child node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastChild(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the last child of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the child must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastChild(kind: SyntaxKind): boolean;
    public moveToLastChild(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToChild(Navigation.last, Navigation.previous, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the first element of the containing array of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstElement(predicate?: (element: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the first element of the containing array of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the element must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstElement(kind: SyntaxKind): boolean;
    public moveToFirstElement(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToElement(Navigation.first, Navigation.next, this._currentEdge, this._currentArray, this._currentOffset, predicateOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the previous element in the containing array of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousElement(predicate?: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the previous element in the containing array of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the element must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousElement(kind: SyntaxKind): boolean;
    public moveToPreviousElement(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToElement(Navigation.previous, Navigation.previous, this._currentEdge, this._currentArray, this._currentOffset, predicateOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the next element in the containing array of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextElement(predicate?: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the next element in the containing array of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the element must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextElement(kind: SyntaxKind): boolean;
    public moveToNextElement(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToElement(Navigation.next, Navigation.next, this._currentEdge, this._currentArray, this._currentOffset, predicateOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the last element of the containing array of the focused {@link Node} matching the supplied predicate.
     * @param predicate A callback used to match a node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastElement(predicate?: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the last element of the containing array of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the element must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastElement(kind: SyntaxKind): boolean;
    public moveToLastElement(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToElement(Navigation.last, Navigation.previous, this._currentEdge, this._currentArray, this._currentOffset, predicateOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the first sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstSibling(): boolean;
    /**
     * Moves the focus of the navigator to the first sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstSibling(name: string): boolean;
    /**
     * Moves the focus of the navigator to the first sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstSibling(predicate: (sibling: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the first sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstSibling(kind: SyntaxKind): boolean;
    public moveToFirstSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.first, undefined, Navigation.first, Navigation.next, this._parentNode, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the previous sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousSibling(): boolean;
    /**
     * Moves the focus of the navigator to the previous sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousSibling(name: string): boolean;
    /**
     * Moves the focus of the navigator to the previous sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousSibling(predicate: (sibling: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the previous sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousSibling(kind: SyntaxKind): boolean;
    public moveToPreviousSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.previous, Navigation.previous, Navigation.last, Navigation.previous, this._parentNode, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Tests whether the navigator can move the focus of the navigator to the previous sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasPreviousSibling(): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the previous sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasPreviousSibling(name: string): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the previous sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasPreviousSibling(predicate: (sibling: Node) => boolean): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the previous sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasPreviousSibling(kind: SyntaxKind): boolean;
    public hasPreviousSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.previous, Navigation.previous, Navigation.last, Navigation.previous, this._parentNode, predicateOrNameOrKind, /*speculative*/ true);
    }

    /**
     * Moves the focus of the navigator to the next sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextSibling(): boolean;
    /**
     * Moves the focus of the navigator to the next sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextSibling(name: string): boolean;
    /**
     * Moves the focus of the navigator to the next sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextSibling(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the next sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextSibling(kind: SyntaxKind): boolean;
    public moveToNextSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.next, Navigation.next, Navigation.first, Navigation.next, this._parentNode, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Tests whether the navigator can move the focus of the navigator to the next sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasNextSibling(): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the next sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasNextSibling(name: string): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the next sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasNextSibling(predicate: (node: Node) => boolean): boolean;
    /**
     * Tests whether the navigator can move the focus of the navigator to the next sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus can change; otherwise, `false`.
     */
    public hasNextSibling(kind: SyntaxKind): boolean;
    public hasNextSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.next, Navigation.next, Navigation.first, Navigation.next, this._parentNode, predicateOrNameOrKind, /*speculative*/ true);
    }

    /**
     * Moves the focus of the navigator to the last sibling of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastSibling(): boolean;
    /**
     * Moves the focus of the navigator to the last sibling of the focused {@link Node} with the provided property name.
     * @param name The name of a property on the parent of the focused {@link Node}.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastSibling(name: string): boolean;
    /**
     * Moves the focus of the navigator to the last sibling of the focused {@link Node} that matches the provided predicate.
     * @param predicate A callback used to match a sibling node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastSibling(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the last sibling of the focused {@link Node} matching the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that the sibling must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastSibling(kind: SyntaxKind): boolean;
    public moveToLastSibling(predicateOrNameOrKind?: string | SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._moveToSibling(Navigation.last, undefined, Navigation.last, Navigation.previous, this._parentNode, predicateOrNameOrKind, /*speculative*/ false);
    }

    /**
     * Moves the focus of the navigator to the first {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstToken(): boolean;
    /**
     * Moves the focus of the navigator to the first {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @param predicate A callback used to match a token node.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstToken(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the first {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @param kind The {@link SyntaxKind} that the previous token must match.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToFirstToken(kind: SyntaxKind): boolean;
    public moveToFirstToken(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)) {
        return this._speculate(() => this._moveToFirstTokenWorker() && this._isMatch(predicateOrKind));
    }

    /**
     * Moves the focus of the navigator to the last {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastToken(): boolean;
    /**
     * Moves the focus of the navigator to the last {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @param predicate A callback used to match a token node.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastToken(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the last {@link Token}, {@link TextContent} or {@link InvalidSymbol} descendant (or self) of the focused {@link Node}.
     * @param kind The {@link SyntaxKind} that the previous token must match.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToLastToken(kind: SyntaxKind): boolean;
    public moveToLastToken(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)) {
        return this._speculate(() => this._moveToLastTokenWorker() && this._isMatch(predicateOrKind));
    }

    /**
     * Moves the focus of the navigator to the next {@link Token}, {@link TextContent} or {@link InvalidSymbol} following the focused {@link Node} in document order.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextToken(): boolean;
    /**
     * Moves the focus of the navigator to the next {@link Token}, {@link TextContent} or {@link InvalidSymbol} following the focused {@link Node} in document order.
     * @param predicate A callback used to match a token node.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextToken(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the next {@link Token}, {@link TextContent} or {@link InvalidSymbol} following the focused {@link Node} in document order.
     * @param kind The {@link SyntaxKind} that the previous token must match.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToNextToken(kind: SyntaxKind): boolean;
    public moveToNextToken(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)) {
        return this._speculate(() => this._moveToNextTokenWorker() && this._isMatch(predicateOrKind));
    }

    /**
     * Moves the focus of the navigator to the previous {@link Token}, {@link TextContent} or {@link InvalidSymbol} preceding the focused {@link Node} in document order.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousToken(): boolean;
    /**
     * Moves the focus of the navigator to the previous {@link Token}, {@link TextContent} or {@link InvalidSymbol} preceding the focused {@link Node} in document order.
     * @param predicate A callback used to match a token node.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousToken(predicate: (node: Node) => boolean): boolean;
    /**
     * Moves the focus of the navigator to the previous {@link Token}, {@link TextContent} or {@link InvalidSymbol} preceding the focused {@link Node} in document order.
     * @param kind The {@link SyntaxKind} that the previous token must match.
     * @returns `true` if the current focus is a {@link Token}, {@link TextContent} or {@link InvalidSymbol} or if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPreviousToken(kind: SyntaxKind): boolean;
    public moveToPreviousToken(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)) {
        return this._speculate(() => this._moveToPreviousTokenWorker() && this._isMatch(predicateOrKind));
    }

    /**
     * Moves the focus of the navigator to the {@link Node} that contains the provided [Position](xref:grammarkdown!Position:interface).
     * @param position The [Position](xref:grammarkdown!Position:interface) at which to focus the navigator.
     * @param outermost When `true`, moves to the outermost node containing the provided position.
     * When `false` or not specified, moves to the innermost node containing the provided position.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToPosition(position: Position, outermost?: boolean) {
        const pos = this._sourceFile.lineMap.offsetAt(position);
        return this._speculate(() => {
            this.moveToRoot();
            if (pos === 0) {
                if (outermost) {
                    this.moveToFirstChild();
                }
                else {
                    this.moveToFirstToken();
                }
                return true;
            }
            if (pos === this._sourceFile.text.length) {
                if (outermost) {
                    this.moveToLastChild();
                }
                else {
                    this.moveToLastToken();
                }
                return true;
            }
            if (this._moveToPositionWorker(pos, outermost)) {
                return true;
            }
            return false;
        });
    }

    /**
     * Moves the focus of the navigator to the nearest {@link Token}, {@link TextContentNode}, or {@link InvalidSymbol} that is touching the provided [Position](xref:grammarkdown!Position:interface).
     * @param position The [Position](xref:grammarkdown!Position:interface) at which to focus the navigator.
     * @param predicate A callback used to match a token node.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToTouchingToken(position: Position, predicate?: SyntaxKind): boolean;
    /**
     * Moves the focus of the navigator to the nearest {@link Token}, {@link TextContentNode}, or {@link InvalidSymbol} that is touching the provided [Position](xref:grammarkdown!Position:interface).
     * @param position The [Position](xref:grammarkdown!Position:interface) at which to focus the navigator.
     * @param kind The {@link SyntaxKind} that the previous token must match.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToTouchingToken(position: Position, kind: SyntaxKind): boolean;
    public moveToTouchingToken(position: Position, predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return this._speculate(() => this._moveToTouchingTokenWorker(position) && this._isMatch(predicateOrKind));
    }

    private _isMatch(predicateOrKind?: SyntaxKind | ((node: Node) => boolean)): boolean {
        return matchPredicateOrKind(this._currentNode, predicateOrKind);
    }

    private _moveToPositionWorker(pos: number, outermost?: boolean) {
        if (pos >= this._currentNode.pos && pos < this._currentNode.end) {
            if (!outermost) {
                if (this.moveToFirstChild()) {
                    do {
                        if (this._moveToPositionWorker(pos)) {
                            return true;
                        }
                    }
                    while (this.moveToNextSibling());
                    this.moveToParent();
                }
            }

            return true;
        }

        return false;
    }

    private _moveToTouchingTokenWorker(position: Position) {
        if (this.moveToPosition(position)) {
            // If the position is inside the trivia of the current node, move to the previous node.
            const tokenPosition = this._sourceFile.lineMap.positionAt(this._currentNode.getStart(this._sourceFile));
            if (Position.compare(position, tokenPosition) < 0) {
                return this.moveToPreviousToken();
            }
            return true;
        }
        return false;
    }

    private _moveToFirstLeadingToken() {
        if (this._parentNode) scanInterveningTokens(this._parentNode, this._sourceFile);
        const leadingTokens = getLeadingTokens(this._currentNode, this._sourceFile);
        if (leadingTokens) {
            this._beforeNavigate();
            this._leadingTokens = leadingTokens;
            this._trailingTokens = undefined;
            this._tokenOffset = 0;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToPreviousLeadingToken() {
        if (this._leadingTokens && this._tokenOffset > 0) {
            this._beforeNavigate();
            this._tokenOffset--;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToNextLeadingToken() {
        if (this._leadingTokens && this._tokenOffset < this._leadingTokens.length - 1) {
            this._beforeNavigate();
            this._tokenOffset++;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToLastLeadingToken() {
        if (this._parentNode) scanInterveningTokens(this._parentNode, this._sourceFile);
        const leadingTokens = getLeadingTokens(this._currentNode, this._sourceFile);
        if (leadingTokens) {
            this._beforeNavigate();
            this._leadingTokens = leadingTokens;
            this._trailingTokens = undefined;
            this._tokenOffset = leadingTokens.length - 1;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToFirstTrailingToken() {
        scanInterveningTokens(this._currentNode, this._sourceFile);
        const trailingTokens = getTrailingTokens(this._currentNode, this._sourceFile);
        if (trailingTokens) {
            this._beforeNavigate();
            this._leadingTokens = undefined;
            this._trailingTokens = trailingTokens;
            this._tokenOffset = 0;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToLastTrailingToken() {
        scanInterveningTokens(this._currentNode, this._sourceFile);
        const trailingTokens = getTrailingTokens(this._currentNode, this._sourceFile);
        if (trailingTokens) {
            this._beforeNavigate();
            this._leadingTokens = undefined;
            this._trailingTokens = trailingTokens;
            this._tokenOffset = trailingTokens.length - 1;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToPreviousTrailingToken() {
        if (this._trailingTokens && this._tokenOffset > 0) {
            this._beforeNavigate();
            this._tokenOffset--;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToNextTrailingToken() {
        if (this._trailingTokens && this._tokenOffset < this._trailingTokens.length - 1) {
            this._beforeNavigate();
            this._tokenOffset++;
            this._afterNavigate();
            return true;
        }
        return false;
    }

    private _moveToFirstTokenWorker() {
        // find the first token within the `pos` and `end` of the current node.
        while (!this.isToken()) {
            // not a token, try its children
            if (!this.moveToFirstChild()) {
                // no children, try trailing tokens...
                return this._moveToFirstTrailingToken();
            }
            // found a child, try leading tokens...
            if (this._moveToFirstLeadingToken()) return true;
            // try again with the child...
        }
        return true;
    }

    private _moveToLastTokenWorker() {
        // find the last token within the `pos` and `end` of the current node
        while (!this.isToken()) {
            // not a token, try this node's trailing tokens...
            if (this._moveToLastTrailingToken()) return true;
            // no trailing tokens...
            if (!this.moveToLastChild()) return false; // no children, nothing else to try
            // try again with the child...
        }
        return true;
    }

    private _moveToNextTokenWorker() {
        if (this._leadingTokens) {
            if (this._moveToNextLeadingToken()) return true; // we got the next leading token

            // done processing leading tokens
            this._beforeNavigate();
            this._leadingTokens = undefined;
            this._tokenOffset = -1;
            this._afterNavigate();

            // we should now be on the node following the leading tokens
            return this._moveToFirstTokenWorker();
        }
        else if (this._trailingTokens) {
            if (this._moveToNextTrailingToken()) return true; // we got the next trailing token

            // done processing trailing tokens
            this._beforeNavigate();
            this._trailingTokens = undefined;
            this._tokenOffset = -1;
            this._afterNavigate();

            // we should now be on the parent node containing the trailing tokens,
            // need to try with its next sibling...
        }

        // move to the next sibling of this node
        while (!this.moveToNextSibling()) {
            // no sibling, try parents...
            if (!this.moveToParent()) return false; // no parent, nothing else to try
            // found parent, try trailing tokens...
            if (this._moveToFirstTrailingToken()) return true; // moved to first trailing token
            // no trailing token, try next sibling of parent...
        }

        // we are at the next sibling, start with its leading tokens (if any)
        if (this._moveToFirstLeadingToken()) return true;

        // If we are here, we are in some node adjacent to the starting node
        return this._moveToFirstTokenWorker();
    }

    private _moveToPreviousTokenWorker() {
        if (this._leadingTokens) {
            if (this._moveToPreviousLeadingToken()) return true; // we got the previous leading token

            // done processing leading tokens
            this._beforeNavigate();
            this._leadingTokens = undefined;
            this._tokenOffset = -1;
            this._afterNavigate();

            // we should now be on the node following the leading tokens, need to try with
            // the previous sibling...
        }
        else {
            if (this._trailingTokens) {
                if (this._moveToPreviousTrailingToken()) return true; // we got the previous trailing token

                // done processing trailing tokens
                this._beforeNavigate();
                this._trailingTokens = undefined;
                this._tokenOffset = -1;
                this._afterNavigate();

                // we should now be on the parent node containing the trailing tokens, need to try
                // with the last child...
                if (this.moveToLastChild()) {
                    // move to the last token of the last child
                    return this._moveToLastTokenWorker();
                }
            }

            // current node is a token, move to any leading tokens
            if (this._moveToLastLeadingToken()) return true;

            // no leading tokens, need to try with the previous sibling...
        }

        while (!this.moveToPreviousSibling()) {
            // no sibling, try parents...
            if (!this.moveToParent()) return false; // no parent, nothing else to try
            // found parent, try leading tokens...
            if (this._moveToLastLeadingToken()) return true; // found leading token of parent
            // no leading token, try next sibling of parent...
        }

        // If we are here, we are in some node adjacent to the starting node
        return this._moveToLastTokenWorker();
    }

    private _getDepth() {
        return (this._leadingTokens || this._trailingTokens) ?
            this._currentDepth + 1 :
            this._currentDepth;
    }

    private _speculate(cb: () => boolean) {
        const currentDepth = this._currentDepth;
        const edgeStack = this._edgeStack;
        const arrayStack = this._arrayStack;
        const offsetStack = this._offsetStack;
        const nodeStack = this._nodeStack;
        const hasChild = this._hasAnyChildren;
        const leadingTokens = this._leadingTokens;
        const trailingTokens = this._trailingTokens;
        const tokenOffset = this._tokenOffset;
        // The following nodes are set by _afterNavigate based on the saved information above:
        //   this._currentEdge
        //   this._currentArray
        //   this._currentOffset
        //   this._currentNode
        //   this._parentNode
        this._copyOnNavigate = true;
        let result = false;
        try {
            result = cb();
        }
        finally {
            if (!result) {
                this._currentDepth = currentDepth;
                this._edgeStack = edgeStack;
                this._arrayStack = arrayStack;
                this._offsetStack = offsetStack;
                this._nodeStack = nodeStack;
                this._hasAnyChildren = hasChild;
                this._leadingTokens = leadingTokens;
                this._trailingTokens = trailingTokens;
                this._tokenOffset = tokenOffset;
                this._afterNavigate();
            }
        }
        return result;
    }

    private _beforeNavigate() {
        if (this._copyOnNavigate) {
            this._edgeStack = this._edgeStack.slice();
            this._arrayStack = this._arrayStack.slice();
            this._offsetStack = this._offsetStack.slice();
            this._nodeStack = this._nodeStack.slice();
            this._copyOnNavigate = false;
        }
    }

    private _afterNavigate() {
        this._currentEdge = this._edgeStack[this._currentDepth]!;
        this._currentArray = this._arrayStack[this._currentDepth];
        this._currentOffset = this._offsetStack[this._currentDepth]!;
        this._currentNode =
            this._leadingTokens ? this._leadingTokens[this._tokenOffset] :
            this._trailingTokens ? this._trailingTokens[this._tokenOffset] :
            this._nodeStack[this._currentDepth]!;
        this._parentNode =
            (this._leadingTokens || this._trailingTokens) ? this._nodeStack[this._currentDepth] :
            this._currentDepth > 0 ? this._nodeStack[this._currentDepth - 1] :
            undefined;
        this._copyOnNavigate = false;
    }

    private _pushEdge() {
        this._edgeStack.push(undefined);
        this._arrayStack.push(undefined);
        this._offsetStack.push(undefined);
        this._nodeStack.push(undefined);
        this._hasAnyChildren = undefined;
        this._leadingTokens = undefined;
        this._trailingTokens = undefined;
        this._tokenOffset = -1;
        this._currentDepth++;
    }

    private _setEdge(edge: number, array: ReadonlyArray<Node> | undefined, offset: number | undefined, node: Node) {
        this._edgeStack[this._currentDepth] = edge;
        this._arrayStack[this._currentDepth] = array;
        this._offsetStack[this._currentDepth] = offset;
        this._nodeStack[this._currentDepth] = node;
        this._leadingTokens = undefined;
        this._trailingTokens = undefined;
        this._tokenOffset = -1;
        this._hasAnyChildren = undefined;
    }

    private _popEdge() {
        // if we have trailing tokens we are in a virtual edge. There's no need to reset the depth.
        if (this._trailingTokens) {
            this._trailingTokens = undefined;
            this._tokenOffset = -1;
        }
        else {
            this._currentDepth--;
            this._edgeStack.pop();
            this._arrayStack.pop();
            this._offsetStack.pop();
            this._nodeStack.pop();
            this._leadingTokens = undefined;
            this._tokenOffset = -1;
            this._hasAnyChildren = this._currentNode !== undefined;
        }
    }

    private _moveToChild(initializer: SeekOperation, seekDirection: SeekOperation, predicateOrNameOrKind: string | SyntaxKind | ((node: Node) => boolean) | undefined, speculative: boolean) {
        const name = typeof predicateOrNameOrKind === "string" ? predicateOrNameOrKind : undefined;
        const predicateOrKind = typeof predicateOrNameOrKind !== "string" ? predicateOrNameOrKind : undefined;
        const offset = this._currentEdge;
        const length = getNodeAccessor().edgeCount(this._currentNode);
        for (let nextEdge = initializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
            if (!name || getNodeAccessor().edgeName(this._currentNode, nextEdge) === name) {
                const next = getNodeAccessor().edgeValue(this._currentNode, nextEdge);
                if (isNodeArray(next)) {
                    const length = next.length;
                    for (let nextOffset = initializer(0, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
                        const nextNode = next[nextOffset];
                        if (nextNode && matchPredicateOrKind(nextNode, predicateOrKind)) {
                            if (!speculative) {
                                this._beforeNavigate();
                                this._pushEdge();
                                this._setEdge(nextEdge, next, nextOffset, nextNode);
                                this._afterNavigate();
                            }
                            return true;
                        }
                    }
                }
                else if (next && matchPredicateOrKind(next, predicateOrKind)) {
                    if (!speculative) {
                        this._beforeNavigate();
                        this._pushEdge();
                        this._setEdge(nextEdge, /*array*/ undefined, /*offset*/ undefined, next);
                        this._afterNavigate();
                    }
                    return true;
                }
            }
        }
        return false;
    }

    private _moveToElement(currentArrayInitializer: SeekOperation, seekDirection: SeekOperation, currentEdge: number, currentArray: ReadonlyArray<Node> | undefined, currentOffset: number, predicateOrKind: SyntaxKind | ((node: Node) => boolean) | undefined, speculative: boolean) {
        if (!currentArray) {
            return false;
        }

        const offset = currentOffset;
        const length = currentArray.length;
        for (let nextOffset = currentArrayInitializer(offset, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
            const nextNode = currentArray[nextOffset];
            if (nextNode && matchPredicateOrKind(nextNode, predicateOrKind)) {
                if (!speculative) {
                    this._beforeNavigate();
                    this._setEdge(currentEdge, currentArray, nextOffset, nextNode);
                    this._afterNavigate();
                }
                return true;
            }
        }

        return false;
    }

    private _moveToSibling(currentEdgeInitializer: SeekOperation, currentArrayInitializer: SeekOperation | undefined, nextArrayInitializer: SeekOperation, seekDirection: SeekOperation, parentNode: Node | undefined, predicateOrNameOrKind: string | SyntaxKind | ((node: Node) => boolean) | undefined, speculative: boolean) {
        if (!parentNode) {
            return false;
        }

        const name = typeof predicateOrNameOrKind === "string" ? predicateOrNameOrKind : undefined;
        const predicateOrKind = typeof predicateOrNameOrKind !== "string" ? predicateOrNameOrKind : undefined;

        if (currentArrayInitializer && this._moveToElement(currentArrayInitializer, seekDirection, this._currentEdge, this._currentArray, this._currentOffset, predicateOrKind, speculative)) {
            return true;
        }

        const offset = this._currentEdge;
        const length = getNodeAccessor().edgeCount(parentNode);
        for (let nextEdge = currentEdgeInitializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
            if (!name || getNodeAccessor().edgeName(parentNode, nextEdge) === name) {
                const next = getNodeAccessor().edgeValue(parentNode, nextEdge);
                if (isNodeArray(next)) {
                    if (this._moveToElement(nextArrayInitializer, seekDirection, nextEdge, next, 0, predicateOrKind, speculative)) {
                        return true;
                    }
                }
                else {
                    if (next && matchPredicateOrKind(next, predicateOrKind)) {
                        if (!speculative) {
                            this._beforeNavigate();
                            this._setEdge(nextEdge, /*array*/ undefined, /*offset*/ undefined, next);
                            this._afterNavigate();
                        }
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private _reset() {
        this._currentDepth = 0;
        this._nodeStack.length = 1;
        this._edgeStack.length = 1;
        this._arrayStack.length = 1;
        this._offsetStack.length = 1;
        this._leadingTokens = undefined;
        this._trailingTokens = undefined;
        this._tokenOffset = -1;
    }
}

type SeekOperation = (offset: number, length: number) => number;

namespace Navigation {
    export function first(offset: number, length: number) {
        return 0;
    }

    export function previous(offset: number, length: number) {
        return offset - 1;
    }

    export function same(offset: number, length: number) {
        return offset;
    }

    export function next(offset: number, length: number) {
        return offset + 1;
    }

    export function last(offset: number, length: number) {
        return length - 1;
    }
}

function bounded(offset: number, length: number) {
    return offset >= 0 && offset < length;
}

function matchProductionBody(node: Node) {
    return node.kind === SyntaxKind.OneOfList
        || node.kind === SyntaxKind.RightHandSideList
        || node.kind === SyntaxKind.RightHandSide;
}

function matchSourceElement(node: Node) {
    return node.kind === SyntaxKind.Import
        || node.kind === SyntaxKind.Production;
}

function isNodeArray(value: any): value is ReadonlyArray<Node> {
    return Array.isArray(value);
}

function matchPredicateOrKind(node: Node, predicateOrKind: SyntaxKind | ((node: Node) => boolean) | undefined): boolean {
    return typeof predicateOrKind === "function" ? predicateOrKind(node) :
        typeof predicateOrKind === "number" ? node.kind === predicateOrKind :
        true;
}

function getLeadingTokensMap(sourceFile: SourceFile) {
    let leadingTokensMap = perFileLeadingTokensMap.get(sourceFile);
    if (!leadingTokensMap) perFileLeadingTokensMap.set(sourceFile, leadingTokensMap = new Map());
    return leadingTokensMap;
}

function getTrailingTokensMap(sourceFile: SourceFile) {
    let trailingTokensMap = perFileTrailingTokensMap.get(sourceFile);
    if (!trailingTokensMap) perFileTrailingTokensMap.set(sourceFile, trailingTokensMap = new Map());
    return trailingTokensMap;
}

function getLeadingTokens(node: Node, sourceFile: SourceFile) {
    return perFileLeadingTokensMap.get(sourceFile)?.get(node);
}

function getTrailingTokens(node: Node, sourceFile: SourceFile) {
    return perFileTrailingTokensMap.get(sourceFile)?.get(node);
}

function scanInterveningTokens(parent: Node, sourceFile: SourceFile) {
    const trailingTokensMap = getTrailingTokensMap(sourceFile);
    if (trailingTokensMap.has(parent)) return;
    const leadingTokensMap = getLeadingTokensMap(sourceFile);
    const scanner = new Scanner(sourceFile.filename, sourceFile.text, NullDiagnosticMessages.instance);
    let pos = parent.pos;
    const processNode = (child: Node) => {
        const tokens = getTokens(pos, child.pos);
        leadingTokensMap.set(child, tokens);
        pos = child.end;
    };
    const processNodes = (nodes: readonly Node[]) => {
        for (const child of nodes) {
            const tokens = getTokens(pos, child.pos);
            leadingTokensMap.set(child, tokens);
            pos = child.end;
        }
    };
    const getTokens = (pos: number, end: number) => {
        let tokens: Token[] | null = null;
        scanner.scanRange(pos, () => {
            while (pos < end) {
                const token = scanner.scan();
                if (token === SyntaxKind.EndOfFileToken) break;
                if (!isTokenKind(token)) throw new Error("Unexpected non-token in trivia");
                const node = new Token(token);
                getNodeAccessor().setTextRange(node, pos, pos = scanner.getPos());
                (tokens ??= []).push(node);
            }
        });
        return tokens;
    };
    for (let i = 0; i < getNodeAccessor().edgeCount(parent); i++) {
        const edge = getNodeAccessor().edgeValue(parent, i);
        if ((Array.isArray as (array: any) => array is readonly any[])(edge)) {
            processNodes(edge);
        }
        else if (edge) {
            processNode(edge);
        }
    }
    trailingTokensMap.set(parent, getTokens(pos, parent.end));
}
