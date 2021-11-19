/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { emptyIterable, first, forEach, last } from "./core";
import { DiagnosticMessages, LineMap } from "./diagnostics";
import { getNodeAccessor, setNodeAccessor, setSourceFileAccessor, setTriviaAccessor } from "./nodeInternal";
import { skipTrivia } from "./scanner";
import {
    ArgumentOperatorKind,
    AssertionKind,
    BooleanKind,
    CommentTriviaKind,
    HtmlTagTriviaKind,
    HtmlTriviaKind,
    isHtmlTriviaKind,
    LexicalSymbolKind,
    LookaheadOperatorKind,
    MetaElementKind,
    OptionalSymbolKind,
    PrimarySymbolKind,
    ProductionBodyKind,
    ProductionSeperatorKind,
    ProseFragmentLiteralKind,
    SourceElementKind,
    SyntaxKind,
    TokenKind,
    TriviaKind
} from "./tokens";
import { TextRange } from "./types";
import { NodeVisitor } from "./visitor";

/** {@docCategory Nodes} */
export interface TextContent {
    readonly text: string | undefined;
}

/** {@docCategory Nodes} */
export abstract class Node<TKind extends SyntaxKind = SyntaxKind> implements TextRange {
    static {
        setNodeAccessor({
            setTextRange(node, pos, end) {
                node._pos = pos;
                node._end = end;
                return node;
            },
            setDetachedTrivia(node, trivia) {
                node._detachedTrivia = trivia;
            },
            setLeadingTrivia(node, trivia) {
                node._leadingTrivia = trivia;
                node._leadingHtmlTrivia = undefined;
            },
            setTrailingTrivia(node, trivia) {
                node._trailingTrivia = trivia;
                node._trailingHtmlTrivia = undefined
            },
            edgeCount(node) { return node.edgeCount; },
            edgeName(node, offset) { return node.edgeName(offset); },
            edgeValue(node, offset) { return node.edgeValue(offset); },
            accept(node, visitor) { return node.accept(visitor); },
        });
    }

    public readonly kind: TKind;

    private _pos = 0;
    private _end = 0;
    private _leadingTrivia: readonly Trivia[] | undefined;
    private _trailingTrivia: readonly Trivia[] | undefined;
    private _detachedTrivia: readonly Trivia[] | undefined;
    private _leadingHtmlTrivia: readonly HtmlTrivia[] | undefined;
    private _trailingHtmlTrivia: readonly HtmlTrivia[] | undefined;

    public constructor(kind: TKind) {
        this.kind = kind;
    }

    public get pos() { return this._pos; };
    public get end() { return this._end; };

    /**
     * Leading trivia is trivia that belongs to the beginning of the node:
     * - An HTML close tag trivia, or any trivia preceding an HTML close tag trivia, is not leading trivia of the node.
     * - An HTML open tag trivia, and any trivia following an HTML open tag trivia, is leading trivia of the node.
     * - If the node has a preceding line break, then
     *   - Any other non-HTML tag trivia on the same line as the node that precedes the node is leading trivia of the node.
     *   - Any other non-HTML tag trivia on a line that precedes the node, but not preceding a blank line, is leading trivia of the node.
     * - Otherwise,
     *   - Any other non-HTML tag trivia on the same line as the node that precedes the node is leading trivia, if there is no whitespace between
     *     that trivia and the node.
     */
    public get leadingTrivia() { return this._leadingTrivia; }
    /**
     * Trailing trivia is trivia that belongs to the end of the node:
     * - An HTML open tag trivia, or any trivia following an HTML open tag trivia, is not trailing trivia of the node.
     * - An HTML close tag trivia, and any trivia preceding an HTML close tag trivia, is trailing trivia of the node.
     * - If the node has a trailing line break, then
     *   - Any other non-HTML tag trivia on the same line as the node that follows the node is trailing trivia of the node.
     *   - Any other non-HTML tag trivia on a line that follows the node, but not following a blank line, is trailing trivia of the node.
     * - Otherwise,
     *   - Any other non-HTML tag trivia on the same line as the node that follows the node is trailing trivia, if there is no whitespace between
     *     that trivia and the node.
     */
    public get trailingTrivia() { return this._trailingTrivia; }
    /**
     * Detached trivia is any trivia that occurs prior to the node that is not the leading or trailing trivia of this
     * or any other node.
     */
    public get detachedTrivia() { return this._detachedTrivia; }
    /** @deprecated Use {@link leadingTrivia} or {@link detachedTrivia} instead. */
    public get leadingHtmlTrivia(): readonly HtmlTrivia[] | undefined { return this._leadingHtmlTrivia ||= this._leadingTrivia?.filter((trivia): trivia is HtmlTrivia => isHtmlTriviaKind(trivia.kind)); }
    /** @deprecated Use {@link trailingTrivia} instead. */
    public get trailingHtmlTrivia(): readonly HtmlTrivia[] | undefined { return this._trailingHtmlTrivia ||= this._trailingTrivia?.filter((trivia): trivia is HtmlTrivia => isHtmlTriviaKind(trivia.kind)); }

    public getStart(sourceFile?: SourceFile) { return sourceFile ? skipTrivia(sourceFile.text, this.pos, this.end) : this.pos; }
    public getEnd() { return this.end; }
    public getWidth(sourceFile?: SourceFile) { return this.getEnd() - this.getStart(sourceFile); }
    public getFullStart() { return this.pos; }
    public getFullWidth() { return this.getEnd() - this.getFullStart(); }
    public getText(sourceFile: SourceFile) { return sourceFile.text.slice(this.getStart(sourceFile), this.getEnd()); }
    public getFullText(sourceFile: SourceFile) { return sourceFile.text.slice(this.getFullStart(), this.getEnd()); }

    public get firstChild(): Node | undefined { return undefined; }
    public get lastChild(): Node | undefined { return undefined; }
    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined;
    public forEachChild<T>(_cbNode: (node: Node) => T | undefined): T | undefined { return undefined; }
    public children(): IterableIterator<Node> { return emptyIterable; }

    protected get edgeCount(): number { return 0; }
    protected edgeName(offset: number): string | undefined;
    protected edgeName(_offset: number): string | undefined { return undefined; }
    protected edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined;
    protected edgeValue(_offset: number): Node | ReadonlyArray<Node> | undefined { return undefined; }

    protected accept(visitor: NodeVisitor): Node { return visitor.visitExtension(this); }
}

/** {@docCategory Nodes} */
export abstract class TriviaBase<TKind extends TriviaKind> extends Node<TKind> {
    static {
        setTriviaAccessor({
            setPrecedingFields(node, hasPrecedingLineTerminator, hasPrecedingBlankLine, hasPrecedingWhiteSpace) {
                node._hasPrecedingLineTerminator = hasPrecedingLineTerminator;
                node._hasPrecedingBlankLine = hasPrecedingBlankLine;
                node._hasPrecedingWhiteSpace = hasPrecedingWhiteSpace;
            },
            setFollowingFields(node, hasFollowingLineTerminator, hasFollowingBlankLine, hasFollowingWhiteSpace) {
                node._hasFollowingLineTerminator = hasFollowingLineTerminator;
                node._hasFollowingBlankLine = hasFollowingBlankLine;
                node._hasFollowingWhiteSpace = hasFollowingWhiteSpace;
            }
        });
    }

    private _hasPrecedingLineTerminator = false;
    private _hasPrecedingBlankLine = false;
    private _hasPrecedingWhiteSpace = false;
    private _hasFollowingLineTerminator = false;
    private _hasFollowingBlankLine = false;
    private _hasFollowingWhiteSpace = false;

    public get hasPrecedingLineTerminator() { return this._hasPrecedingLineTerminator; }
    public get hasPrecedingBlankLine() { return this._hasPrecedingBlankLine; }
    public get hasPrecedingWhiteSpace() { return this._hasPrecedingWhiteSpace; }
    public get hasFollowingLineTerminator() { return this._hasFollowingLineTerminator; }
    public get hasFollowingBlankLine() { return this._hasFollowingBlankLine; }
    public get hasFollowingWhiteSpace() { return this._hasFollowingWhiteSpace; }
}

/** {@docCategory Nodes} */
export type Trivia =
    | CommentTrivia
    | HtmlTrivia
    ;

/** {@docCategory Nodes} */
export abstract class CommentTriviaBase<TKind extends CommentTriviaKind> extends TriviaBase<TKind> {
}

/** {@docCategory Nodes} */
export type CommentTrivia =
    | SingleLineCommentTrivia
    | MultiLineCommentTrivia
    ;

/**
 * Represent a single-line comment trivia token.
 * ```grammarkdown
 * // comment
 * ```
 * {@docCategory Nodes}
 */
export class SingleLineCommentTrivia extends CommentTriviaBase<SyntaxKind.SingleLineCommentTrivia> {
    public constructor() {
        super(SyntaxKind.SingleLineCommentTrivia);
    }
}

/**
 * Represents a multi-line comment trivia token.
 * {@docCategory Nodes}
 */
export class MultiLineCommentTrivia extends CommentTriviaBase<SyntaxKind.MultiLineCommentTrivia> {
    public constructor() {
        super(SyntaxKind.MultiLineCommentTrivia);
    }
}

/** {@docCategory Nodes} */
export abstract class HtmlTriviaBase<TKind extends HtmlTriviaKind> extends TriviaBase<TKind> {
}

/** {@docCategory Nodes} */
export type HtmlTrivia =
    | HtmlCommentTrivia
    | HtmlOpenTagTrivia
    | HtmlCloseTagTrivia
    ;

/**
 * Represents an HTML comment trivia token:
 * ```grammarkdown
 * Production ::
 *   <!--before-->Nonterminal
 * ```
 * {@docCategory Nodes}
 */
export class HtmlCommentTrivia extends HtmlTriviaBase<SyntaxKind.HtmlCommentTrivia> {
    public constructor() {
        super(SyntaxKind.HtmlCommentTrivia);
    }
}

/** {@docCategory Nodes} */
export abstract class HtmlTagTriviaBase<TKind extends HtmlTagTriviaKind> extends HtmlTriviaBase<TKind> {
    public readonly tagName: string;

    public constructor(kind: TKind, tagName: string) {
        super(kind);
        this.tagName = tagName;
    }
}

/**
 * Represents an HTML open-tag trivia token:
 * ```grammarkdown
 * Production ::
 *   <ins>Inserted</ins>
 *   <del>Deleted</del>
 * ```
 * {@docCategory Nodes}
 */
export class HtmlOpenTagTrivia extends HtmlTagTriviaBase<SyntaxKind.HtmlOpenTagTrivia> {
    public constructor(tagName: string) {
        super(SyntaxKind.HtmlOpenTagTrivia, tagName);
    }
}

/**
 * Represents an HTML close-tag trivia token:
 * ```grammarkdown
 * Production ::
 *   <ins>Inserted</ins>
 *   <del>Deleted</del>
 * ```
 * {@docCategory Nodes}
 */
export class HtmlCloseTagTrivia extends HtmlTagTriviaBase<SyntaxKind.HtmlCloseTagTrivia> {
    public constructor(tagName: string) {
        super(SyntaxKind.HtmlCloseTagTrivia, tagName);
    }
}

/**
 * Represents a token such as a keyword or operator.
 * {@docCategory Nodes}
 */
export class Token<TKind extends TokenKind = TokenKind> extends Node<TKind> {
    protected override accept(visitor: NodeVisitor): Token<TKind> { return visitor.visitToken(this); }
}

/**
 * Represents a single- or double-quoted string literal (used by `@import` and `@line`)
 * ```grammarkdown
 * @import "file"
 * ```
 * {@docCategory Nodes}
 */
export class StringLiteral extends Node<SyntaxKind.StringLiteral> implements TextContent {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.StringLiteral);
        this.text = text;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitStringLiteral(this); }
}

/**
 * Represents a number literal (used by `@line`)
 * ```grammarkdown
 * @line 500
 * Production :: Nonterminal
 * ```
 * {@docCategory Nodes}
 */
export class NumberLiteral extends Node<SyntaxKind.NumberLiteral> implements TextContent {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.NumberLiteral);
        this.text = text;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitNumberLiteral(this); }
}

/**
 * Represents a Unicode character literal in one of two forms:
 * ```grammarkdown
 * <TAB>
 * U+0000
 * ```
 * {@docCategory Nodes}
 */
export class UnicodeCharacterLiteral extends Node<SyntaxKind.UnicodeCharacterLiteral> implements TextContent {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.UnicodeCharacterLiteral);
        this.text = text;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitUnicodeCharacterLiteral(this); }
}

/**
 * Represents a terminal token in the grammar.
 * ```grammarkdown
 * `yield`
 * ```
 * {@docCategory Nodes}
 */
export class TerminalLiteral extends Node<SyntaxKind.TerminalLiteral> implements TextContent {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.TerminalLiteral);
        this.text = text;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitTerminalLiteral(this); }
}

/**
 * Represents an identifier such as a Production or Parameter.
 * {@docCategory Nodes}
 */
export class Identifier extends Node<SyntaxKind.Identifier> implements TextContent {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.Identifier);
        this.text = text;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitIdentifier(this); }
}

/** {@docCategory Nodes} */
export type TextContentNode =
    | StringLiteral
    | NumberLiteral
    | Identifier
    | UnicodeCharacterLiteral
    | TerminalLiteral
    | ProseFragmentLiteral<ProseFragmentLiteralKind>;

/**
 * Represents a set of symbols in a `lookahead` assertion.
 * ```grammarkdown
 * [lookahead ∈ { `a`, `b` }]
 * ```
 * {@docCategory Nodes}
 */
export class SymbolSet extends Node<SyntaxKind.SymbolSet> {
    public readonly openBraceToken: Token<SyntaxKind.OpenBraceToken>;
    public readonly elements: ReadonlyArray<SymbolSpan> | undefined;
    public readonly closeBraceToken: Token<SyntaxKind.CloseBraceToken> | undefined;

    public constructor(openBraceToken: Token<SyntaxKind.OpenBraceToken>, elements: ReadonlyArray<SymbolSpan> | undefined, closeBraceToken: Token<SyntaxKind.CloseBraceToken> | undefined) {
        super(SyntaxKind.SymbolSet);
        this.openBraceToken = openBraceToken;
        this.elements = elements;
        this.closeBraceToken = closeBraceToken;
    }

    public override get firstChild(): Node | undefined { return this.openBraceToken; }
    public override get lastChild(): Node | undefined { return this.closeBraceToken || last(this.elements) || this.openBraceToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBraceToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBraceToken && cbNode(this.closeBraceToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBraceToken;
        if (this.elements) yield* this.elements;
        if (this.closeBraceToken) yield this.closeBraceToken;
    }

    public update(elements: ReadonlyArray<SymbolSpan> | undefined) {
        return elements !== this.elements
            ? setTextRange(new SymbolSet(this.openBraceToken, elements, this.closeBraceToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBraceToken";
            case 1: return "elements";
            case 2: return "closeBraceToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBraceToken;
            case 1: return this.elements;
            case 2: return this.closeBraceToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitSymbolSet(this); }
}

/**
 * Represents a set of constraints for a right-hand-side of a Production.
 * ```grammarkdown
 * Production[A] ::
 *   [+A] A
 *   [~A] B
 * ```
 * {@docCategory Nodes}
 */
export class Constraints extends Node<SyntaxKind.Constraints> {
    public readonly openBracketToken: Token<SyntaxKind.OpenBracketToken>;
    public readonly elements: ReadonlyArray<Argument> | undefined;
    public readonly closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Argument> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.Constraints);
        this.openBracketToken = openBracketToken;
        this.elements = elements;
        this.closeBracketToken = closeBracketToken;
    }

    public override get firstChild(): Node | undefined { return this.openBracketToken; }
    public override get lastChild(): Node | undefined { return this.closeBracketToken || last(this.elements); }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.elements) yield* this.elements;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(elements: ReadonlyArray<Argument> | undefined) {
        return elements !== this.elements
            ? setTextRange(new Constraints(this.openBracketToken, elements, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "elements";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.elements;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitConstraints(this); }
}

//
// Symbols
//

/** {@docCategory Nodes} */
export abstract class LexicalSymbolBase<TKind extends LexicalSymbolKind> extends Node<TKind> {
}

/**
 * Represents a placeholder symbol (`@`) used in some grammars.
 * {@docCategory Nodes}
 */
export class PlaceholderSymbol extends LexicalSymbolBase<SyntaxKind.PlaceholderSymbol> {
    public readonly placeholderToken: Token<SyntaxKind.AtToken>;

    constructor (placeholderToken: Token<SyntaxKind.AtToken>) {
        super(SyntaxKind.PlaceholderSymbol);
        this.placeholderToken = placeholderToken;
    }

    public override get firstChild(): Node | undefined { return this.placeholderToken; }
    public override get lastChild(): Node | undefined { return this.placeholderToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.placeholderToken);
    }

    public override * children(): IterableIterator<Node> {
        yield this.placeholderToken;
    }

    protected override get edgeCount() { return 1; }
    protected override edgeName(offset: number): string | undefined { return offset === 0 ? "placeholderToken" : undefined; }
    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.placeholderToken : undefined; }
    protected override accept(visitor: NodeVisitor) { return visitor.visitPlaceholderSymbol(this); }
}

/**
 * Represents a range of unicode characters.
 * ```grammarkdown
 * U+0000 through U+001F
 * ```
 * {@docCategory Nodes}
 */
export class UnicodeCharacterRange extends LexicalSymbolBase<SyntaxKind.UnicodeCharacterRange> {
    public readonly left: UnicodeCharacterLiteral;
    public readonly throughKeyword: Token<SyntaxKind.ThroughKeyword>;
    public readonly right: UnicodeCharacterLiteral;

    public constructor(left: UnicodeCharacterLiteral, throughKeyword: Token<SyntaxKind.ThroughKeyword>, right: UnicodeCharacterLiteral) {
        super(SyntaxKind.UnicodeCharacterRange);
        this.left = left;
        this.throughKeyword = throughKeyword;
        this.right = right;
    }

    public override get firstChild(): Node | undefined { return this.left; }
    public override get lastChild(): Node | undefined { return this.right; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.left)
            || cbNode(this.throughKeyword)
            || cbNode(this.right);
    }

    public override * children(): IterableIterator<Node> {
        yield this.left;
        yield this.throughKeyword;
        yield this.right;
    }

    public update(left: UnicodeCharacterLiteral, right: UnicodeCharacterLiteral) {
        return left !== this.left || right !== this.right
            ? setTextRange(new UnicodeCharacterRange(left, this.throughKeyword, right), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "left";
            case 1: return "throughKeyword";
            case 2: return "right";
        }
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.left;
            case 1: return this.throughKeyword;
            case 2: return this.right;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitUnicodeCharacterRange(this); }
}

/**
 * The \`but not\` operator allows you to reference a *Nonterminal* on the left, excluding some part of that production.
 * ```grammarkdown
 * A but not B
 * ```
 * {@docCategory Nodes}
 */
export class ButNotSymbol extends LexicalSymbolBase<SyntaxKind.ButNotSymbol> {
    public readonly left: LexicalSymbol;
    public readonly butKeyword: Token<SyntaxKind.ButKeyword> | undefined;
    public readonly notKeyword: Token<SyntaxKind.NotKeyword> | undefined;
    public readonly right: LexicalSymbol | undefined;

    public constructor(left: LexicalSymbol, butKeyword: Token<SyntaxKind.ButKeyword> | undefined, notKeyword: Token<SyntaxKind.NotKeyword> | undefined, right: LexicalSymbol | undefined) {
        super(SyntaxKind.ButNotSymbol);
        this.left = left;
        this.butKeyword = butKeyword;
        this.notKeyword = notKeyword;
        this.right = right;
    }

    public override get firstChild(): Node | undefined { return this.left; }
    public override get lastChild(): Node | undefined { return this.right || this.notKeyword || this.butKeyword || this.left; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.left)
            || (this.butKeyword && cbNode(this.butKeyword))
            || (this.notKeyword && cbNode(this.notKeyword))
            || (this.right && cbNode(this.right));
    }

    public override * children(): IterableIterator<Node> {
        yield this.left;
        if (this.butKeyword) yield this.butKeyword;
        if (this.notKeyword) yield this.notKeyword;
        if (this.right) yield this.right;
    }

    public update(left: LexicalSymbol, right: LexicalSymbol | undefined) {
        return left !== this.left || right !== this.right
            ? setTextRange(new ButNotSymbol(left, this.butKeyword, this.notKeyword, right), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 4; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "left";
            case 1: return "butKeyword";
            case 2: return "notKeyword";
            case 3: return "right";
        }
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.left;
            case 1: return this.butKeyword;
            case 2: return this.notKeyword;
            case 3: return this.right;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitButNotSymbol(this); }
}

/**
 * Represents a section of Prose, which indicates handling of syntax outside the scope of the Grammarkdown parser.
 * ```grammarkdown
 * > This is a section of Prose with |Nonterminals| and `terminals`
 * ```
 * {@docCategory Nodes}
 */
export class Prose extends LexicalSymbolBase<SyntaxKind.Prose> {
    public readonly greaterThanToken: Token<SyntaxKind.GreaterThanToken>;
    public readonly fragments: ReadonlyArray<ProseFragment> | undefined;

    public constructor(greaterThanToken: Token<SyntaxKind.GreaterThanToken>, fragments: ReadonlyArray<ProseFragment> | undefined) {
        super(SyntaxKind.Prose);
        this.greaterThanToken = greaterThanToken;
        this.fragments = fragments;
    }

    public override get firstChild(): Node | undefined { return this.greaterThanToken; }
    public override get lastChild(): Node | undefined { return last(this.fragments) || this.greaterThanToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.greaterThanToken)
            || (this.fragments && forEach(this.fragments, cbNode));
    }

    public override * children(): IterableIterator<Node> {
        yield this.greaterThanToken;
        if (this.fragments) yield* this.fragments;
    }

    public update(fragments: ReadonlyArray<ProseFragment> | undefined) {
        return fragments !== this.fragments
            ? setTextRange(new Prose(this.greaterThanToken, fragments), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 2; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "greaterThanToken";
            case 1: return "fragments";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.greaterThanToken;
            case 1: return this.fragments;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitProse(this); }
}

/**
 * Represents a set of symbols used to restrict a `but not` operator.
 * ```grammarkdown
 * A but not one of `a` or `b`
 * ```
 * {@docCategory Nodes}
 */
export class OneOfSymbol extends LexicalSymbolBase<SyntaxKind.OneOfSymbol> {
    public readonly oneKeyword: Token<SyntaxKind.OneKeyword>;
    public readonly ofKeyword: Token<SyntaxKind.OfKeyword> | undefined;
    public readonly symbols: ReadonlyArray<LexicalSymbol> | undefined;

    public constructor(oneKeyword: Token<SyntaxKind.OneKeyword>, ofKeyword: Token<SyntaxKind.OfKeyword> | undefined, symbols: ReadonlyArray<LexicalSymbol> | undefined) {
        super(SyntaxKind.OneOfSymbol);
        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.symbols = symbols;
    }

    public override get firstChild(): Node | undefined { return this.oneKeyword; }
    public override get lastChild(): Node | undefined { return last(this.symbols) || this.ofKeyword || this.oneKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.oneKeyword)
            || (this.ofKeyword && cbNode(this.ofKeyword))
            || (this.symbols && forEach(this.symbols, cbNode));
    }

    public override * children(): IterableIterator<Node> {
        yield this.oneKeyword;
        if (this.ofKeyword) yield this.ofKeyword;
        if (this.symbols) yield* this.symbols;
    }

    public update(symbols: ReadonlyArray<LexicalSymbol> | undefined) {
        return symbols !== this.symbols
            ? setTextRange(new OneOfSymbol(this.oneKeyword, this.ofKeyword, symbols), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "oneKeyword";
            case 1: return "ofKeyword";
            case 2: return "symbols";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.oneKeyword;
            case 1: return this.ofKeyword;
            case 2: return this.symbols;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitOneOfSymbol(this); }
}

/** {@docCategory Nodes} */
export class InvalidSymbol extends LexicalSymbolBase<SyntaxKind.InvalidSymbol> {
    public constructor() {
        super(SyntaxKind.InvalidSymbol);
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitInvalidSymbol(this); }
}

/** {@docCategory Nodes} */
export type LexicalSymbol =
    | PrimarySymbol
    | Assertion
    | PlaceholderSymbol
    | UnicodeCharacterRange
    | ButNotSymbol
    | Prose
    | OneOfSymbol
    | InvalidSymbol
    ;

//
// Primary Symbols
//

/** {@docCategory Nodes} */
export abstract class PrimarySymbolBase<TKind extends PrimarySymbolKind> extends LexicalSymbolBase<TKind> {
}

//
// Optional Symbols
//

/** {@docCategory Nodes} */
export abstract class OptionalSymbolBase<TKind extends OptionalSymbolKind> extends PrimarySymbolBase<TKind> {
    public readonly questionToken: Token<SyntaxKind.QuestionToken> | undefined;

    public constructor(kind: TKind, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(kind);
        this.questionToken = questionToken;
    }
}

/**
 * Represents a terminal token in the grammar.
 * ```grammarkdown
 * `yield` `*`?
 * ```
 * {@docCategory Nodes}
 */
export class Terminal extends OptionalSymbolBase<SyntaxKind.Terminal> {
    public readonly literal: UnicodeCharacterLiteral | TerminalLiteral;

    public constructor(literal: UnicodeCharacterLiteral | TerminalLiteral, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(SyntaxKind.Terminal, questionToken);
        this.literal = literal;
    }

    public override get firstChild(): Node | undefined { return this.literal; }
    public override get lastChild(): Node | undefined { return this.questionToken ?? this.literal; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.literal)
            || (this.questionToken && cbNode(this.questionToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.literal;
        if (this.questionToken) yield this.questionToken;
    }

    public update(literal: UnicodeCharacterLiteral | TerminalLiteral, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        return literal !== this.literal || questionToken !== this.questionToken
            ? setTextRange(new Terminal(literal, questionToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 2; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "literal";
            case 1: return "questionToken";
        }
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.literal;
            case 1: return this.questionToken;
        }
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitTerminal(this); }
}

/**
 * Represents a non-terminal reference to another Production.
 * ```grammarkdown
 * IdentifierReference[~Yield, ~Await]
 * ```
 * {@docCategory Nodes}
 */
export class Nonterminal extends OptionalSymbolBase<SyntaxKind.Nonterminal> {
    public readonly name: Identifier;
    public readonly argumentList: ArgumentList | undefined;

    public constructor(name: Identifier, argumentList: ArgumentList | undefined, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(SyntaxKind.Nonterminal, questionToken);
        this.name = name;
        this.argumentList = argumentList;
    }

    public override get firstChild(): Node | undefined { return this.name; }
    public override get lastChild(): Node | undefined { return this.questionToken || this.argumentList || this.name; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.name)
            || (this.argumentList && cbNode(this.argumentList))
            || (this.questionToken && cbNode(this.questionToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.name;
        if (this.argumentList) yield this.argumentList;
        if (this.questionToken) yield this.questionToken;
    }

    public update(name: Identifier, argumentList: ArgumentList | undefined) {
        return name !== this.name || argumentList !== this.argumentList
            ? setTextRange(new Nonterminal(name, argumentList, this.questionToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "name";
            case 1: return "argumentList";
            case 2: return "questionToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.name;
            case 1: return this.argumentList;
            case 2: return this.questionToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitNonterminal(this); }
}

/** {@docCategory Nodes} */
export type OptionalSymbol =
    | Terminal
    | Nonterminal
    ;

/** {@docCategory Nodes} */
export type PrimarySymbol =
    | OptionalSymbol;

//
// Assertions
//

/** {@docCategory Nodes} */
export abstract class AssertionBase<TKind extends AssertionKind, TBracket extends SyntaxKind.OpenBracketToken | SyntaxKind.OpenBracketGreaterThanToken> extends LexicalSymbolBase<TKind> {
    public readonly openBracketToken: Token<TBracket>;
    public readonly closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined;

    public constructor(kind: TKind, openBracketToken: Token<TBracket>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(kind);
        this.openBracketToken = openBracketToken;
        this.closeBracketToken = closeBracketToken;
    }

    public override get firstChild(): Node | undefined { return this.openBracketToken; }
    public abstract override get lastChild(): Node | undefined;
}

/**
 * Represents the `empty` assertion, which matches exactly zero tokens.
 * ```grammarkdown
 * [empty]
 * ```
 * {@docCategory Nodes}
 */
export class EmptyAssertion extends AssertionBase<SyntaxKind.EmptyAssertion, SyntaxKind.OpenBracketToken> {
    public readonly emptyKeyword: Token<SyntaxKind.EmptyKeyword>;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, emptyKeyword: Token<SyntaxKind.EmptyKeyword>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.EmptyAssertion, openBracketToken, closeBracketToken);
        this.emptyKeyword = emptyKeyword;
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || this.emptyKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.emptyKeyword)
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        yield this.emptyKeyword;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "emptyKeyword";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.emptyKeyword;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitEmptyAssertion(this); }
}

/**
 * Represents a `lookahead` assertion, which is a zero-width assertion that only matches if the next token is in the requested set.
 * ```grammarkdown
 * [lookahead ∉ { `class`, `let` }]
 * ```
 * {@docCategory Nodes}
 */
export class LookaheadAssertion extends AssertionBase<SyntaxKind.LookaheadAssertion, SyntaxKind.OpenBracketToken> {
    public readonly lookaheadKeyword: Token<SyntaxKind.LookaheadKeyword>;
    public readonly operatorToken: Token<LookaheadOperatorKind> | undefined;
    public readonly lookahead: SymbolSpan | SymbolSet | undefined;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lookaheadKeyword: Token<SyntaxKind.LookaheadKeyword>, operatorToken: Token<LookaheadOperatorKind> | undefined, lookahead: SymbolSpan | SymbolSet | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.LookaheadAssertion, openBracketToken, closeBracketToken);
        this.lookaheadKeyword = lookaheadKeyword;
        this.operatorToken = operatorToken;
        this.lookahead = lookahead;
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || this.lookahead || this.operatorToken || this.lookaheadKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.lookaheadKeyword)
            || (this.operatorToken && cbNode(this.operatorToken))
            || (this.lookahead && cbNode(this.lookahead))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        yield this.lookaheadKeyword;
        if (this.operatorToken) yield this.operatorToken;
        if (this.lookahead) yield this.lookahead;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(lookahead: SymbolSpan | SymbolSet | undefined) {
        return lookahead !== this.lookahead
            ? setTextRange(new LookaheadAssertion(this.openBracketToken, this.lookaheadKeyword, this.operatorToken, lookahead, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 5; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "lookaheadKeyword";
            case 2: return "operatorToken";
            case 3: return "lookahead";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.lookaheadKeyword;
            case 2: return this.operatorToken;
            case 3: return this.lookahead;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitLookaheadAssertion(this); }
}

/**
 * Represens a `lexical-goal` assertion which verifies that current lexical goal is the supplied *Nonterminal*.
 * ```grammarkdown
 * [lexical goal Module]
 * ```
 * {@docCategory Nodes}
 */
export class LexicalGoalAssertion extends AssertionBase<SyntaxKind.LexicalGoalAssertion, SyntaxKind.OpenBracketToken> {
    public readonly lexicalKeyword: Token<SyntaxKind.LexicalKeyword>;
    public readonly goalKeyword: Token<SyntaxKind.GoalKeyword> | undefined;
    public readonly symbol: Identifier | undefined;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lexicalKeyword: Token<SyntaxKind.LexicalKeyword>, goalKeyword: Token<SyntaxKind.GoalKeyword> | undefined, symbol: Identifier | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.LexicalGoalAssertion, openBracketToken, closeBracketToken);
        this.lexicalKeyword = lexicalKeyword;
        this.goalKeyword = goalKeyword;
        this.symbol = symbol;
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || this.symbol || this.goalKeyword || this.lexicalKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.lexicalKeyword)
            || (this.goalKeyword && cbNode(this.goalKeyword))
            || (this.symbol && cbNode(this.symbol))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        yield this.lexicalKeyword;
        if (this.goalKeyword) yield this.goalKeyword;
        if (this.symbol) yield this.symbol;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(symbol: Identifier | undefined) {
        return symbol !== this.symbol
            ? setTextRange(new LexicalGoalAssertion(this.openBracketToken, this.lexicalKeyword, this.goalKeyword, symbol, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 5; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "lexicalKeyword";
            case 2: return "goalKeyword";
            case 3: return "symbol";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.lexicalKeyword;
            case 2: return this.goalKeyword;
            case 3: return this.symbol;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitLexicalGoalAssertion(this); }
}

/**
 * Represents a `no Symbol here` assertion, which disallows the provided symbol.
 * ```grammarkdown
 * [no LineTerminator here]
 * ```
 * {@docCategory Nodes}
 */
export class NoSymbolHereAssertion extends AssertionBase<SyntaxKind.NoSymbolHereAssertion, SyntaxKind.OpenBracketToken> {
    public readonly noKeyword: Token<SyntaxKind.NoKeyword>;
    public readonly symbols: ReadonlyArray<PrimarySymbol> | undefined;
    public readonly hereKeyword: Token<SyntaxKind.HereKeyword> | undefined;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, noKeyword: Token<SyntaxKind.NoKeyword>, symbols: ReadonlyArray<PrimarySymbol> | undefined, hereKeyword: Token<SyntaxKind.HereKeyword> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.NoSymbolHereAssertion, openBracketToken, closeBracketToken);
        this.noKeyword = noKeyword;
        this.symbols = symbols;
        this.hereKeyword = hereKeyword;
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || this.hereKeyword || last(this.symbols) || this.noKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.noKeyword)
            || (this.symbols && forEach(this.symbols, cbNode))
            || (this.hereKeyword && cbNode(this.hereKeyword))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        yield this.noKeyword;
        if (this.symbols) yield* this.symbols;
        if (this.hereKeyword) yield this.hereKeyword;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(symbols: ReadonlyArray<PrimarySymbol> | undefined) {
        return symbols !== this.symbols
            ? setTextRange(new NoSymbolHereAssertion(this.openBracketToken, this.noKeyword, symbols, this.hereKeyword, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 5; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "noKeyword";
            case 2: return "symbols";
            case 3: return "hereKeyword";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.noKeyword;
            case 2: return this.symbols;
            case 3: return this.hereKeyword;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitNoSymbolHereAssertion(this); }
}

/**
 * Represents an assertion containing Prose, which indicates handling of syntax outside the scope of the Grammarkdown parser.
 * ```grammarkdown
 * HexDigits [> but only if MV of |HexDigits| > 0x10FFFF]
 * ```
 * {@docCategory Nodes}
 */
export class ProseAssertion extends AssertionBase<SyntaxKind.ProseAssertion, SyntaxKind.OpenBracketGreaterThanToken> {
    public readonly fragments: ReadonlyArray<ProseFragment> | undefined;

    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketGreaterThanToken>, fragments: ReadonlyArray<ProseFragment> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ProseAssertion, openBracketToken, closeBracketToken);
        this.fragments = fragments;
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || last(this.fragments) || this.openBracketToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.fragments && forEach(this.fragments, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.fragments) yield* this.fragments;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(fragments: ReadonlyArray<ProseFragment> | undefined) {
        return fragments !== this.fragments
            ? setTextRange(new ProseAssertion(this.openBracketToken, fragments, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "fragments";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.fragments;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitProseAssertion(this); }
}

/** {@docCategory Nodes} */
export class InvalidAssertion extends AssertionBase<SyntaxKind.InvalidAssertion, SyntaxKind.OpenBracketToken> {
    public constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.InvalidAssertion, openBracketToken, closeBracketToken);
    }

    public override get lastChild(): Node | undefined { return this.closeBracketToken || this.openBracketToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    protected override get edgeCount() { return 2; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "closeBracketToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitInvalidAssertion(this); }
}

/** {@docCategory Nodes} */
export type Assertion =
    | EmptyAssertion
    | LookaheadAssertion
    | LexicalGoalAssertion
    | NoSymbolHereAssertion
    | ProseAssertion
    | InvalidAssertion
    ;

/** {@docCategory Nodes} */
export class ProseFragmentLiteral<TKind extends ProseFragmentLiteralKind = ProseFragmentLiteralKind> extends Node<SyntaxKind> implements TextContent {
    public readonly text: string | undefined;

    public constructor(kind: SyntaxKind, text: string | undefined) {
        super(kind);
        this.text = text;
    }

    protected override get edgeCount() { return 0; }
    protected override edgeName(_offset: number): string | undefined { return undefined; }
    protected override edgeValue(_offset: number): Node | ReadonlyArray<Node> | undefined { return undefined; }
    protected override accept(visitor: NodeVisitor): ProseFragmentLiteral<TKind> { return visitor.visitProseFragmentLiteral(this); }
}

/** {@docCategory Nodes} */
export type ProseFragment =
    | ProseFragmentLiteral<ProseFragmentLiteralKind>
    | Terminal
    | Nonterminal;

/** {@docCategory Nodes} */
export class Argument extends Node<SyntaxKind.Argument> {
    public readonly operatorToken: Token<ArgumentOperatorKind> | undefined;
    public readonly name: Identifier | undefined;

    public constructor(operatorToken: Token<ArgumentOperatorKind> | undefined, name: Identifier | undefined) {
        super(SyntaxKind.Argument);
        this.operatorToken = operatorToken;
        this.name = name;
    }

    public override get firstChild(): Node | undefined { return this.operatorToken || this.name; }
    public override get lastChild(): Node | undefined { return this.name || this.operatorToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.operatorToken && cbNode(this.operatorToken))
            || (this.name && cbNode(this.name));
    }

    public override * children(): IterableIterator<Node> {
        if (this.operatorToken) yield this.operatorToken;
        if (this.name) yield this.name;
    }

    public update(name: Identifier | undefined) {
        return name !== name
            ? setTextRange(new Argument(this.operatorToken, name), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 2; }
    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "operatorToken";
            case 1: return "name";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.operatorToken;
            case 1: return this.name;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitArgument(this); }
}

/** {@docCategory Nodes} */
export class ArgumentList extends Node<SyntaxKind.ArgumentList> {
    public readonly openBracketToken: Token<SyntaxKind.OpenBracketToken>;
    public readonly elements: ReadonlyArray<Argument> | undefined;
    public readonly closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined;

    public constructor(openParenToken: Token<SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Argument> | undefined, closeParenToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ArgumentList);
        this.openBracketToken = openParenToken;
        this.elements = elements;
        this.closeBracketToken = closeParenToken;
    }

    public override get firstChild(): Node | undefined { return this.openBracketToken; }
    public override get lastChild(): Node | undefined { return this.closeBracketToken || last(this.elements) || this.openBracketToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.elements) yield* this.elements;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(elements: ReadonlyArray<Argument> | undefined) {
        return elements !== this.elements
            ? setTextRange(new ArgumentList(this.openBracketToken, elements, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openParenToken";
            case 1: return "elements";
            case 2: return "closeParenToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.elements;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitArgumentList(this); }
}

/** {@docCategory Nodes} */
export class SymbolSpan extends Node<SyntaxKind.SymbolSpan> {
    public readonly symbol: LexicalSymbol;
    public readonly next: SymbolSpan | undefined;

    public constructor(symbol: LexicalSymbol, next: SymbolSpan | undefined) {
        super(SyntaxKind.SymbolSpan);
        this.symbol = symbol;
        this.next = next;
    }

    public override get firstChild(): Node | undefined { return this.symbol; }
    public override get lastChild(): Node | undefined { return this.next || this.symbol; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.symbol)
            || (this.next && cbNode(this.next));
    }

    public override * children(): IterableIterator<Node> {
        yield this.symbol;
        if (this.next) yield this.next;
    }

    public update(symbol: LexicalSymbol, next: SymbolSpan | undefined) {
        return symbol !== this.symbol || next !== this.next
            ? setTextRange(new SymbolSpan(symbol, next), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 2; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "symbol";
            case 1: return "next";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.symbol;
            case 1: return this.next;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitSymbolSpan(this); }
}

/** {@docCategory Nodes} */
export class LinkReference extends Node<SyntaxKind.LinkReference> {
    public readonly text: string | undefined;

    public constructor(text: string | undefined) {
        super(SyntaxKind.LinkReference);
        this.text = text;
    }

    public override forEachChild<T>(_cbNode: (node: Node) => T | undefined): T | undefined { return undefined; }
    public override children(): IterableIterator<Node> { return emptyIterable; }

    protected override get edgeCount() { return 3; }
    protected override edgeName(_offset: number) { return undefined; }
    protected override edgeValue(_offset: number) { return undefined; }
    protected override accept(visitor: NodeVisitor) { return visitor.visitLinkReference(this); }
}

/** {@docCategory Nodes} */
export abstract class ProductionBodyBase<TKind extends ProductionBodyKind> extends Node<TKind> {
}

/** {@docCategory Nodes} */
export class RightHandSide extends ProductionBodyBase<SyntaxKind.RightHandSide> {
    public readonly constraints: Constraints | undefined;
    public readonly head: SymbolSpan | undefined;
    public readonly reference: LinkReference | undefined;

    public constructor(constraints: Constraints | undefined, head: SymbolSpan | undefined, reference: LinkReference | undefined) {
        super(SyntaxKind.RightHandSide);
        this.constraints = constraints;
        this.head = head;
        this.reference = reference;
    }

    public override get firstChild(): Node | undefined { return this.constraints || this.head; }
    public override get lastChild(): Node | undefined { return this.reference || this.head; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.constraints && cbNode(this.constraints))
            || (this.head && cbNode(this.head))
            || (this.reference && cbNode(this.reference));
    }

    public override * children(): IterableIterator<Node> {
        if (this.constraints) yield this.constraints;
        if (this.head) yield this.head;
        if (this.reference) yield this.reference;
    }

    public update(constraints: Constraints | undefined, head: SymbolSpan | undefined, reference: LinkReference | undefined) {
        return constraints !== this.constraints, head !== this.head || reference !== this.reference
            ? setTextRange(new RightHandSide(constraints, head, reference), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "constraints";
            case 1: return "head";
            case 2: return "reference";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.constraints;
            case 1: return this.head;
            case 2: return this.reference;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitRightHandSide(this); }
}

/** {@docCategory Nodes} */
export class RightHandSideList extends ProductionBodyBase<SyntaxKind.RightHandSideList> {
    public readonly elements: ReadonlyArray<RightHandSide> | undefined;

    public constructor(elements: ReadonlyArray<RightHandSide> | undefined) {
        super(SyntaxKind.RightHandSideList);
        this.elements = elements;
    }

    public override get firstChild(): Node | undefined { return first(this.elements); }
    public override get lastChild(): Node | undefined { return last(this.elements); }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return forEach(this.elements, cbNode);
    }

    public override * children(): IterableIterator<Node> {
        if (this.elements) yield* this.elements;
    }

    public update(elements: ReadonlyArray<RightHandSide> | undefined) {
        return elements !== this.elements
            ? setTextRange(new RightHandSideList(elements), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 1; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "elements";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.elements;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitRightHandSideList(this); }
}

/** {@docCategory Nodes} */
export class OneOfList extends ProductionBodyBase<SyntaxKind.OneOfList> {
    public readonly oneKeyword: Token<SyntaxKind.OneKeyword>;
    public readonly ofKeyword: Token<SyntaxKind.OfKeyword> | undefined;
    public readonly indented: boolean;
    public readonly terminals: ReadonlyArray<TerminalLiteral> | undefined;

    public constructor(oneKeyword: Token<SyntaxKind.OneKeyword>, ofKeyword: Token<SyntaxKind.OfKeyword> | undefined, indented: boolean, terminals: ReadonlyArray<TerminalLiteral> | undefined) {
        super(SyntaxKind.OneOfList);
        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.indented = indented;
        this.terminals = terminals;
    }

    public override get firstChild(): Node | undefined { return this.oneKeyword; }
    public override get lastChild(): Node | undefined { return last(this.terminals) || this.ofKeyword || this.oneKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.oneKeyword)
            || (this.ofKeyword && cbNode(this.ofKeyword))
            || (this.terminals && forEach(this.terminals, cbNode));
    }

    public override * children(): IterableIterator<Node> {
        yield this.oneKeyword;
        if (this.ofKeyword) yield this.ofKeyword;
        if (this.terminals) yield* this.terminals;
    }

    public update(terminals: ReadonlyArray<TerminalLiteral> | undefined) {
        return terminals !== this.terminals
            ? setTextRange(new OneOfList(this.oneKeyword, this.ofKeyword, this.indented, terminals), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "oneKeyword";
            case 1: return "ofKeyword";
            case 2: return "terminals";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.oneKeyword;
            case 1: return this.ofKeyword;
            case 2: return this.terminals;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitOneOfList(this); }
}

/** {@docCategory Nodes} */
export type ProductionBody =
    | OneOfList
    | RightHandSide
    | RightHandSideList
    ;

/** {@docCategory Nodes} */
export class Parameter extends Node<SyntaxKind.Parameter> {
    public readonly name: Identifier;

    public constructor(name: Identifier) {
        super(SyntaxKind.Parameter);
        this.name = name;
    }

    public override get firstChild(): Node | undefined { return this.name; }
    public override get lastChild(): Node | undefined { return this.name; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.name && cbNode(this.name));
    }

    public override * children(): IterableIterator<Node> {
        if (this.name) yield this.name;
    }

    public update(name: Identifier) {
        return name !== this.name
            ? setTextRange(new Parameter(name), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 1; }
    protected override edgeName(offset: number): string | undefined { return offset === 0 ? "name" : undefined; }
    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.name : undefined; }
    protected override accept(visitor: NodeVisitor) { return visitor.visitParameter(this); }
}

/** {@docCategory Nodes} */
export class ParameterList extends Node<SyntaxKind.ParameterList> {
    public readonly openBracketToken: Token<SyntaxKind.OpenBracketToken>;
    public readonly elements: ReadonlyArray<Parameter> | undefined;
    public readonly closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined;

    public constructor(openParenToken: Token<SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Parameter> | undefined, closeParenToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ParameterList);
        this.openBracketToken = openParenToken;
        this.elements = elements;
        this.closeBracketToken = closeParenToken;
    }

    public override get firstChild(): Node | undefined { return this.openBracketToken; }
    public override get lastChild(): Node | undefined { return this.closeBracketToken || last(this.elements) || this.openBracketToken; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.elements) yield* this.elements;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(elements: ReadonlyArray<Parameter> | undefined) {
        return elements !== this.elements
            ? setTextRange(new ParameterList(this.openBracketToken, elements, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openParenToken";
            case 1: return "elements";
            case 2: return "closeParenToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.elements;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitParameterList(this); }
}

/** {@docCategory Nodes} */
export abstract class SourceElementBase<TKind extends SourceElementKind> extends Node<TKind> {
}

/** {@docCategory Nodes} */
export class Production extends SourceElementBase<SyntaxKind.Production> {
    public readonly name: Identifier;
    public readonly parameterList: ParameterList | undefined;
    public readonly colonToken: Token<ProductionSeperatorKind> | undefined;
    public readonly body: ProductionBody | undefined;

    public constructor(name: Identifier, parameterList: ParameterList | undefined, colonToken: Token<ProductionSeperatorKind> | undefined, body: ProductionBody | undefined) {
        super(SyntaxKind.Production);
        this.name = name;
        this.parameterList = parameterList;
        this.colonToken = colonToken;
        this.body = body;
    }

    public override get firstChild(): Node | undefined { return this.name; }
    public override get lastChild(): Node | undefined { return this.body || this.colonToken || this.parameterList || this.name; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.name)
            || (this.parameterList && cbNode(this.parameterList))
            || (this.colonToken && cbNode(this.colonToken))
            || (this.body && cbNode(this.body));
    }

    public override * children(): IterableIterator<Node> {
        yield this.name;
        if (this.colonToken) yield this.colonToken;
        if (this.parameterList) yield this.parameterList;
        if (this.body) yield this.body;
    }

    public update(name: Identifier, parameterList: ParameterList | undefined, body: ProductionBody | undefined) {
        return name !== this.name || parameterList !== this.parameterList || body !== this.body
            ? setTextRange(new Production(name, parameterList, this.colonToken, body), this.pos, this.end)
            : this;
    }

    protected override get edgeCount() { return 4; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "name";
            case 1: return "parameterList";
            case 2: return "colonToken";
            case 3: return "body";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.name;
            case 1: return this.parameterList;
            case 2: return this.colonToken;
            case 3: return this.body;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitProduction(this); }
}

/** {@docCategory Nodes} */
export abstract class MetaElementBase<TKind extends MetaElementKind> extends SourceElementBase<TKind> {
    public readonly atToken: Token<SyntaxKind.AtToken>;

    public constructor(kind: TKind, atToken: Token<SyntaxKind.AtToken>) {
        super(kind);
        this.atToken = atToken;
    }

    public override get firstChild(): Node | undefined { return this.atToken; }
}

/** {@docCategory Nodes} */
export class Import extends MetaElementBase<SyntaxKind.Import> {
    public readonly importKeyword: Token<SyntaxKind.ImportKeyword>;
    public readonly path: StringLiteral | undefined;

    public constructor(atToken: Token<SyntaxKind.AtToken>, importKeyword: Token<SyntaxKind.ImportKeyword>, path: StringLiteral | undefined) {
        super(SyntaxKind.Import, atToken);
        this.importKeyword = importKeyword;
        this.path = path;
    }

    public override get lastChild(): Node | undefined { return this.path || this.importKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.atToken)
            || cbNode(this.importKeyword)
            || (this.path && cbNode(this.path));
    }

    public override * children(): IterableIterator<Node> {
        yield this.atToken;
        yield this.importKeyword;
        if (this.path) yield this.path;
    }

    protected override get edgeCount() { return 3; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "atToken";
            case 1: return "importKeyword";
            case 2: return "path";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.atToken;
            case 1: return this.importKeyword;
            case 2: return this.path;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitImport(this); }
}

/** {@docCategory Nodes} */
export class Define extends MetaElementBase<SyntaxKind.Define> {
    public readonly defineKeyword: Token<SyntaxKind.DefineKeyword>;
    public readonly key: Identifier;
    public readonly valueToken: Token<BooleanKind> | Token<SyntaxKind.DefaultKeyword> | undefined;

    public constructor(atToken: Token<SyntaxKind.AtToken>, defineKeyword: Token<SyntaxKind.DefineKeyword>, key: Identifier, valueToken: Token<BooleanKind> | Token<SyntaxKind.DefaultKeyword> | undefined) {
        super(SyntaxKind.Define, atToken);
        this.defineKeyword = defineKeyword;
        this.key = key;
        this.valueToken = valueToken;
    }

    public override get lastChild(): Node | undefined { return this.valueToken || this.key || this.defineKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.atToken)
            || cbNode(this.defineKeyword)
            || (this.key && cbNode(this.key))
            || (this.valueToken && cbNode(this.valueToken));
    }

    public override * children(): IterableIterator<Node> {
        yield this.atToken;
        yield this.defineKeyword;
        if (this.key) yield this.key;
        if (this.valueToken) yield this.valueToken;
    }

    protected override get edgeCount() { return 4; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "atToken";
            case 1: return "defineKeyword";
            case 2: return "key";
            case 3: return "valueToken";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.atToken;
            case 1: return this.defineKeyword;
            case 2: return this.key;
            case 3: return this.valueToken;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitDefine(this); }
}

/** {@docCategory Nodes} */
export class Line extends MetaElementBase<SyntaxKind.Line> {
    public readonly lineKeyword: Token<SyntaxKind.LineKeyword>;
    public readonly number: NumberLiteral | Token<SyntaxKind.DefaultKeyword> | undefined;
    public readonly path: StringLiteral | undefined;

    public constructor(atToken: Token<SyntaxKind.AtToken>, lineKeyword: Token<SyntaxKind.LineKeyword>, number: NumberLiteral | Token<SyntaxKind.DefaultKeyword> | undefined, path: StringLiteral | undefined) {
        super(SyntaxKind.Line, atToken);
        this.lineKeyword = lineKeyword;
        this.number = number;
        this.path = path;
    }

    public override get lastChild(): Node | undefined { return this.path || this.number || this.lineKeyword; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.atToken)
            || cbNode(this.lineKeyword)
            || (this.number && cbNode(this.number))
            || (this.path && cbNode(this.path));
    }

    public override * children(): IterableIterator<Node> {
        yield this.atToken;
        yield this.lineKeyword;
        if (this.number) yield this.number;
        if (this.path) yield this.path;
    }

    protected override get edgeCount() { return 4; }

    protected override edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "atToken";
            case 1: return "lineKeyword";
            case 2: return "number";
            case 3: return "path";
        }
        return undefined;
    }

    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.atToken;
            case 1: return this.lineKeyword;
            case 2: return this.number;
            case 3: return this.path;
        }
        return undefined;
    }

    protected override accept(visitor: NodeVisitor) { return visitor.visitLine(this); }
}

/** {@docCategory Nodes} */
export type MetaElement =
    | Import
    | Define
    | Line
    ;

/** {@docCategory Nodes} */
export type SourceElement =
    | Production
    | MetaElement
    ;

/** {@docCategory Nodes} */
export class SourceFile extends Node<SyntaxKind.SourceFile> {
    static {
        setSourceFileAccessor({
            setImports(node, imports) { node._imports = imports; },
            setParseDiagnostics(node, parseDiagnostics) { node._parseDiagnostics = parseDiagnostics; },
            getParseDiagnostics(node) { return node._parseDiagnostics; },
        });
    }

    public readonly elements: ReadonlyArray<SourceElement>;
    public readonly filename: string;
    public readonly text: string;
    public readonly lineMap: LineMap;

    private _imports: ReadonlyArray<string> | undefined;
    private _parseDiagnostics: DiagnosticMessages | undefined;

    public constructor(filename: string, text: string, elements: ReadonlyArray<SourceElement>) {
        super(SyntaxKind.SourceFile);
        this.elements = elements;
        this.filename = filename;
        this.text = text;
        this.lineMap = new LineMap(text);
        setTextRange(this, 0, this.text.length);
    }

    public override get firstChild(): Node | undefined { return first(this.elements); }
    public override get lastChild(): Node | undefined { return last(this.elements); }
    public get imports() { return this._imports; }

    public override forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.elements && forEach(this.elements, cbNode));
    }

    public override * children(): IterableIterator<Node> {
        if (this.elements) yield* this.elements;
    }

    public update(elements: ReadonlyArray<SourceElement>) {
        return elements !== this.elements
            ? new SourceFile(this.filename, this.text, elements)
            : this;
    }

    protected override get edgeCount() { return 1; }
    protected override edgeName(offset: number): string | undefined { return offset === 0 ? "elements" : undefined; }
    protected override edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.elements : undefined; }
    protected override accept(visitor: NodeVisitor) { return visitor.visitSourceFile(this); }
}

/** {@docCategory Nodes} */
export type Declaration =
    | SourceFile
    | Production
    | Parameter
    ;

export function forEachChild<T>(node: Node | undefined, cbNode: (node: Node) => T | undefined): T | undefined {
    return node && node.forEachChild(cbNode);
}

function setTextRange<T extends Node>(node: T, pos: number, end: number) {
    getNodeAccessor().setTextRange(node, pos, end);
    return node;
}