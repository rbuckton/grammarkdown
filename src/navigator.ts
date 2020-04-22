/*!
 *  Copyright 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {
    SourceFile,
    Node
} from "./nodes";
import {
    Position
} from "./core";
import {
    SyntaxKind
} from "./tokens";

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
    private _sourceFile!: SourceFile;
    private _nodeStack!: (Node | undefined)[];
    private _edgeStack!: (number | undefined)[];
    private _arrayStack!: (ReadonlyArray<Node> | undefined)[];
    private _offsetStack!: (number | undefined)[];
    private _currentDepth!: number;
    private _currentNode!: Node;
    private _currentEdge!: number;
    private _currentOffset!: number;
    private _currentArray: ReadonlyArray<Node> | undefined;
    private _parentNode: Node | undefined;
    private _hasAnyChildren: boolean | undefined;
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
            this._nodeStack = navigator._nodeStack.slice();
            this._edgeStack = navigator._edgeStack.slice();
            this._arrayStack = navigator._arrayStack.slice();
            this._offsetStack = navigator._offsetStack.slice();
            this._currentDepth = this._nodeStack.length - 1;
        }
        else {
            this._sourceFile = <SourceFile>sourceFileOrNavigator;
            this._nodeStack = [this._sourceFile];
            this._edgeStack = [-1];
            this._arrayStack = [undefined];
            this._offsetStack = [0];
            this._currentDepth = 0;
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
     * Gets the {@link SyntaxKind} of the {@link Node} the navigator is currently focused on.
     */
    public getKind() {
        return this._currentNode.kind;
    }

    /**
     * Gets the name of the property on the parent {@link Node} the navigator is currently focused on.
     */
    public getName() {
        return this._parentNode && this._parentNode.edgeName(this._currentEdge);
    }

    /**
     * Gets the containing node array of {@link Node} the navigator is currently focused on.
     */
    public getArray() {
        return this._currentArray;
    }

    /**
     * Gets the ordinal offset within the containing node array of {@link Node} the navigator is currently focused on.
     */
    public getOffset() {
        return this._currentOffset;
    }

    /**
     * Gets the current depth within the syntax-tree of the current focus of the navigator.
     */
    public getDepth() {
        return this._currentDepth;
    }

    /**
     * Returns a value indicating whether the focus of the navigator points to a {@link Node} in an array.
     */
    public isArray(): boolean {
        return this._currentArray !== undefined;
    }

    /**
     * Determines whether the focused {@link Node} has any children that match the supplied predicate.
     * @param predicate An optional callback that can be used to filter the children of the node.
     * @returns `true` if the focused {@link Node} contains a child that matches the supplied predicate; otherwise, `false`.
     */
    public hasChildren(predicate?: (child: Node) => boolean): boolean;
    /**
     * Determines whether the focused {@link Node} has any children with the provided {@link SyntaxKind}.
     * @param kind The {@link SyntaxKind} that at least one child must match.
     * @returns `true` if the focused {@link Node} contains a matching child; otherwise, `false`.
     */
    public hasChildren(kind: SyntaxKind): boolean;
    public hasChildren(predicateOrKind?: SyntaxKind | ((child: Node) => boolean)): boolean {
        if (this._hasAnyChildren === false || this._currentNode.edgeCount === 0) {
            return false;
        }
        if (predicateOrKind === undefined && this._hasAnyChildren !== undefined) {
            return this._hasAnyChildren;
        }
        for (let nextEdge = 0; nextEdge < this._currentNode.edgeCount; nextEdge++) {
            const next = this._currentNode.edgeValue(nextEdge);
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
        for (let nextDepth = this._currentDepth - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this._nodeStack[nextDepth]!;
            if (matchPredicateOrKind(nextNode, predicateOrKind)) {
                return true;
            }
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
        return matchPredicateOrKind(this._currentNode, predicateOrKind);
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
            && this._currentNode === other._currentNode
            && this._currentDepth === other._currentDepth
            && this._currentEdge === other._currentEdge
            && this._currentOffset === other._currentOffset;
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
        const currentDepth = this._currentDepth;
        const nodeStack = this._nodeStack;
        const edgeStack = this._edgeStack;
        const arrayStack = this._arrayStack;
        const offsetStack = this._offsetStack;
        const hasChild = this._hasAnyChildren;

        this._copyOnNavigate = true;
        this.moveToRoot();
        if (this._moveToPositionWorker(pos, outermost)) {
            return true;
        }

        this._currentDepth = currentDepth;
        this._nodeStack = nodeStack;
        this._edgeStack = edgeStack;
        this._arrayStack = arrayStack;
        this._offsetStack = offsetStack;
        this._hasAnyChildren = hasChild;
        this._afterNavigate();
        return false;
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
        this._nodeStack = other._nodeStack.slice();
        this._edgeStack = other._edgeStack.slice();
        this._arrayStack = other._arrayStack.slice();
        this._offsetStack = other._offsetStack.slice();
        this._afterNavigate();
        return true;
    }

    /**
     * Moves the focus of the navigator to the root of the syntax tree.
     * @returns `true` if the navigator's focus changed; otherwise, `false`.
     */
    public moveToRoot(): boolean {
        if (this._currentDepth > 0) {
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
        if (this._currentDepth > 0) {
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
        return this.isMatch(predicateOrKind as SyntaxKind)
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
        for (let nextDepth = this._currentDepth - 1; nextDepth >= 0; nextDepth--) {
            const nextNode = this._nodeStack[nextDepth]!;
            if (matchPredicateOrKind(nextNode, predicateOrKind)) {
                this._beforeNavigate();
                while (this._currentDepth !== nextDepth) {
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
        return this._moveToChild(Navigation.first, Navigation.next, predicateOrNameOrKind);
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
        return this._moveToChild(Navigation.last, Navigation.previous, predicateOrNameOrKind);
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
        return this._moveToElement(Navigation.first, Navigation.next, this._currentArray, this._currentOffset, predicateOrKind);
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
        return this._moveToElement(Navigation.previous, Navigation.previous, this._currentArray, this._currentOffset, predicateOrKind);
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
        return this._moveToElement(Navigation.next, Navigation.next, this._currentArray, this._currentOffset, predicateOrKind);
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
        return this._moveToElement(Navigation.last, Navigation.previous, this._currentArray, this._currentOffset, predicateOrKind);
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
        return this._moveToSibling(Navigation.first, undefined, Navigation.first, Navigation.next, this._parentNode, predicateOrNameOrKind);
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
        return this._moveToSibling(Navigation.previous, Navigation.previous, Navigation.last, Navigation.previous, this._parentNode, predicateOrNameOrKind);
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
        return this._moveToSibling(Navigation.next, Navigation.next, Navigation.first, Navigation.next, this._parentNode, predicateOrNameOrKind);
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
        return this._moveToSibling(Navigation.last, undefined, Navigation.last, Navigation.previous, this._parentNode, predicateOrNameOrKind);
    }

    private _beforeNavigate() {
        if (this._copyOnNavigate) {
            this._nodeStack = this._nodeStack.slice();
            this._edgeStack = this._edgeStack.slice();
            this._arrayStack = this._arrayStack.slice();
            this._offsetStack = this._offsetStack.slice();
            this._copyOnNavigate = false;
        }
    }

    private _afterNavigate() {
        this._currentNode = this._nodeStack[this._currentDepth]!;
        this._currentEdge = this._edgeStack[this._currentDepth]!;
        this._currentArray = this._arrayStack[this._currentDepth];
        this._currentOffset = this._offsetStack[this._currentDepth]!;
        this._parentNode = this._currentDepth > 0 ? this._nodeStack[this._currentDepth - 1] : undefined;
        this._copyOnNavigate = false;
    }

    private _pushEdge() {
        this._nodeStack.push(undefined);
        this._edgeStack.push(undefined);
        this._arrayStack.push(undefined);
        this._offsetStack.push(1);
        this._hasAnyChildren = undefined;
        this._currentDepth++;
    }

    private _setEdge(node: Node, edge: number, array: ReadonlyArray<Node> | undefined, offset: number | undefined) {
        this._nodeStack[this._currentDepth] = node;
        this._edgeStack[this._currentDepth] = edge;
        this._arrayStack[this._currentDepth] = array;
        this._offsetStack[this._currentDepth] = offset;
        this._hasAnyChildren = undefined;
    }

    private _popEdge() {
        this._currentDepth--;
        this._nodeStack.pop();
        this._edgeStack.pop();
        this._arrayStack.pop();
        this._offsetStack.pop();
        this._hasAnyChildren = this._currentNode !== undefined;
    }

    private _moveToChild(initializer: SeekOperation, seekDirection: SeekOperation, predicateOrNameOrKind: string | SyntaxKind | ((node: Node) => boolean) | undefined) {
        const name = typeof predicateOrNameOrKind === "string" ? predicateOrNameOrKind : undefined;
        const predicateOrKind = typeof predicateOrNameOrKind !== "string" ? predicateOrNameOrKind : undefined;
        const offset = this._currentEdge;
        const length = this._currentNode.edgeCount;
        for (let nextEdge = initializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
            if (!name || this._currentNode.edgeName(nextEdge) === name) {
                const next = this._currentNode.edgeValue(nextEdge);
                if (isNodeArray(next)) {
                    const length = next.length;
                    for (let nextOffset = initializer(0, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
                        const nextNode = next[nextOffset];
                        if (nextNode && matchPredicateOrKind(nextNode, predicateOrKind)) {
                            this._beforeNavigate();
                            this._pushEdge();
                            this._setEdge(nextNode, nextEdge, next, nextOffset);
                            this._afterNavigate();
                            return true;
                        }
                    }
                }
                else if (next && matchPredicateOrKind(next, predicateOrKind)) {
                    this._beforeNavigate();
                    this._pushEdge();
                    this._setEdge(next, nextEdge, /*array*/ undefined, /*offset*/ undefined);
                    this._afterNavigate();
                    return true;
                }
            }
        }
        return false;
    }

    private _moveToElement(currentArrayInitializer: SeekOperation, seekDirection: SeekOperation, currentArray: ReadonlyArray<Node> | undefined, currentOffset: number, predicateOrKind: SyntaxKind | ((node: Node) => boolean) | undefined) {
        if (!currentArray) {
            return false;
        }

        const offset = currentOffset;
        const length = currentArray.length;
        for (let nextOffset = currentArrayInitializer(offset, length); bounded(nextOffset, length); nextOffset = seekDirection(nextOffset, length)) {
            const nextNode = currentArray[nextOffset];
            if (nextNode && matchPredicateOrKind(nextNode, predicateOrKind)) {
                this._beforeNavigate();
                this._setEdge(nextNode, this._currentEdge, currentArray, nextOffset);
                this._afterNavigate();
                return true;
            }
        }

        return false;
    }

    private _moveToSibling(currentEdgeInitializer: SeekOperation, currentArrayInitializer: SeekOperation | undefined, nextArrayInitializer: SeekOperation, seekDirection: SeekOperation, parentNode: Node | undefined, predicateOrNameOrKind: string | SyntaxKind | ((node: Node) => boolean) | undefined) {
        if (!parentNode) {
            return false;
        }

        const name = typeof predicateOrNameOrKind === "string" ? predicateOrNameOrKind : undefined;
        const predicateOrKind = typeof predicateOrNameOrKind !== "string" ? predicateOrNameOrKind : undefined;

        if (currentArrayInitializer && this._moveToElement(currentArrayInitializer, seekDirection, this._currentArray, this._currentOffset, predicateOrKind)) {
            return true;
        }

        const offset = this._currentEdge;
        const length = parentNode.edgeCount;
        for (let nextEdge = currentEdgeInitializer(offset, length); bounded(nextEdge, length); nextEdge = seekDirection(nextEdge, length)) {
            if (!name || parentNode.edgeName(nextEdge) === name) {
                const next = parentNode.edgeValue(nextEdge);
                if (isNodeArray(next)) {
                    if (this._moveToElement(nextArrayInitializer, seekDirection, next, 0, predicateOrKind)) {
                        return true;
                    }
                }
                else {
                    if (next && matchPredicateOrKind(next, predicateOrKind)) {
                        this._beforeNavigate();
                        this._setEdge(next, nextEdge, /*array*/ undefined, /*offset*/ undefined);
                        this._afterNavigate();
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
