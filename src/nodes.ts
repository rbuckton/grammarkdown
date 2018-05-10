/*!
 *  Copyright 2015 Ron Buckton (rbuckton@chronicles.org)
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
import { Range, Position, TextRange, emptyIterable, forEach, first, last } from "./core";
import { LineMap, DiagnosticMessages } from "./diagnostics";
import { SyntaxKind, ProseFragmentLiteralKind, LookaheadOperatorKind, ArgumentOperatorKind, ParameterOperatorKind, BooleanKind, ProductionSeperatorKind, TokenKind } from "./tokens";
import { SymbolTable } from "./symbols";
import { NodeVisitor } from "./visitor";
import { skipTrivia } from "./scanner";

export interface TextContent {
    text: string | undefined;
}

export abstract class Node<TKind extends SyntaxKind = SyntaxKind> implements TextRange {
    public readonly kind: TKind;
    public leadingHtmlTrivia: HtmlTrivia[] | undefined;
    public trailingHtmlTrivia: HtmlTrivia[] | undefined;
    public pos: number = 0;
    public end: number = 0;

    constructor(kind: TKind) {
        this.kind = kind;
    }

    get firstChild(): Node | undefined { return undefined; }
    get lastChild(): Node | undefined { return undefined; }

    public getStart(sourceFile?: SourceFile) { return sourceFile ? skipTrivia(sourceFile.text, this.pos, this.end) : this.pos; }
    public getEnd() { return this.end; }
    public getWidth(sourceFile?: SourceFile) { return this.getEnd() - this.getStart(sourceFile); }
    public getFullStart() { return this.pos; }
    public getFullWidth() { return this.getEnd() - this.getFullStart(); }
    public getText(sourceFile: SourceFile) { return sourceFile.text.slice(this.getStart(sourceFile), this.getEnd()); }
    public getFullText(sourceFile: SourceFile) { return sourceFile.text.slice(this.getFullStart(), this.getEnd()); }

    public forEachChild<T>(_cbNode: (node: Node) => T | undefined): T | undefined { return undefined; }
    public children(): IterableIterator<Node> { return emptyIterable; }

    /*@internal*/ get edgeCount(): number { return 0; }
    /*@internal*/ edgeName(_offset: number): string | undefined { return undefined; }
    /*@internal*/ edgeValue(_offset: number): Node | ReadonlyArray<Node> | undefined { return undefined; }
    /*@internal*/ accept(visitor: NodeVisitor): Node { return visitor.visitExtension(this); }
}

export interface TriviaTypes extends HtmlTriviaTypes, CommentTriviaTypes {}
export type TriviaKind = keyof TriviaTypes;
export type Trivia = TriviaTypes[TriviaKind];
export abstract class TriviaBase<TKind extends TriviaKind> extends Node<TKind> {
}

export interface CommentTriviaTypes {}
export type CommentTriviaKind = keyof CommentTriviaTypes;
export type CommentTrivia = CommentTriviaTypes[CommentTriviaKind];
export abstract class CommentTriviaBase<TKind extends CommentTriviaKind> extends TriviaBase<TKind> {
}

export interface CommentTriviaTypes { [SyntaxKind.SingleLineCommentTrivia]: SingleLineCommentTrivia }
export class SingleLineCommentTrivia extends CommentTriviaBase<SyntaxKind.SingleLineCommentTrivia> {
    constructor() {
        super(SyntaxKind.SingleLineCommentTrivia);
    }
}

export interface CommentTriviaTypes { [SyntaxKind.MultiLineCommentTrivia]: MultiLineCommentTrivia }
export class MultiLineCommentTrivia extends CommentTriviaBase<SyntaxKind.MultiLineCommentTrivia> {
    constructor() {
        super(SyntaxKind.MultiLineCommentTrivia);
    }
}

export interface HtmlTriviaTypes {}
export type HtmlTriviaKind = keyof HtmlTriviaTypes;
export type HtmlTrivia = HtmlTriviaTypes[HtmlTriviaKind];
export abstract class HtmlTriviaBase<TKind extends HtmlTriviaKind> extends TriviaBase<TKind> {
    public readonly tagName: string;
    constructor(kind: TKind, tagName: string) {
        super(kind);
        this.tagName = tagName;
    }
}

export interface HtmlTriviaTypes { [SyntaxKind.HtmlOpenTagTrivia]: HtmlOpenTagTrivia; }
export class HtmlOpenTagTrivia extends HtmlTriviaBase<SyntaxKind.HtmlOpenTagTrivia> {
    constructor(tagName: string) {
        super(SyntaxKind.HtmlOpenTagTrivia, tagName);
    }
}

export interface HtmlTriviaTypes { [SyntaxKind.HtmlCloseTagTrivia]: HtmlCloseTagTrivia; }
export class HtmlCloseTagTrivia extends HtmlTriviaBase<SyntaxKind.HtmlCloseTagTrivia> {
    constructor(tagName: string) {
        super(SyntaxKind.HtmlCloseTagTrivia, tagName);
    }
}

export class Token<TKind extends TokenKind = TokenKind> extends Node<TKind> {
    /*@internal*/ accept(visitor: NodeVisitor): Token<TKind> { return visitor.visitToken(this); }
}

export class StringLiteral extends Node<SyntaxKind.StringLiteral> implements TextContent {
    public readonly text: string | undefined;

    constructor(text: string | undefined) {
        super(SyntaxKind.StringLiteral);
        this.text = text;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitStringLiteral(this); }
}

export class Identifier extends Node<SyntaxKind.Identifier> implements TextContent {
    public readonly text: string | undefined;

    constructor(text: string | undefined) {
        super(SyntaxKind.Identifier);
        this.text = text;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitIdentifier(this); }
}

export class SymbolSet extends Node<SyntaxKind.SymbolSet> {
    public readonly openBraceToken: Token<SyntaxKind.OpenBraceToken>;
    public readonly elements: ReadonlyArray<SymbolSpan> | undefined;
    public readonly closeBraceToken: Token<SyntaxKind.CloseBraceToken> | undefined;

    constructor(openBraceToken: Token<SyntaxKind.OpenBraceToken>, elements: ReadonlyArray<SymbolSpan> | undefined, closeBraceToken: Token<SyntaxKind.CloseBraceToken> | undefined) {
        super(SyntaxKind.SymbolSet);
        this.openBraceToken = openBraceToken;
        this.elements = elements;
        this.closeBraceToken = closeBraceToken;
    }

    get firstChild(): Node | undefined { return this.openBraceToken; }
    get lastChild(): Node | undefined { return this.closeBraceToken || last(this.elements) || this.openBraceToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBraceToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBraceToken && cbNode(this.closeBraceToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openBraceToken;
        if (this.elements) yield* this.elements;
        if (this.closeBraceToken) yield this.closeBraceToken;
    }

    public update(elements: ReadonlyArray<SymbolSpan> | undefined) {
        return elements !== this.elements
            ? setTextRange(new SymbolSet(this.openBraceToken, elements, this.closeBraceToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 2; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBraceToken";
            case 1: return "elements";
            case 2: return "closeBraceToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBraceToken;
            case 1: return this.elements;
            case 2: return this.closeBraceToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitSymbolSet(this); }
}

//
// Symbols
//

export interface LexicalSymbolTypes extends PrimarySymbolTypes, AssertionTypes {}
export type LexicalSymbolKind = keyof LexicalSymbolTypes;
export type LexicalSymbol = LexicalSymbolTypes[LexicalSymbolKind];
export abstract class LexicalSymbolBase<TKind extends LexicalSymbolKind> extends Node<TKind> {
}

export interface LexicalSymbolTypes { [SyntaxKind.InvalidSymbol]: InvalidSymbol; }
export class InvalidSymbol extends LexicalSymbolBase<SyntaxKind.InvalidSymbol> {
    constructor() {
        super(SyntaxKind.InvalidSymbol);
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitInvalidSymbol(this); }
}

export interface LexicalSymbolTypes { [SyntaxKind.PlaceholderSymbol]: PlaceholderSymbol; }
export class PlaceholderSymbol extends LexicalSymbolBase<SyntaxKind.PlaceholderSymbol> {
    public readonly placeholderToken: Token<SyntaxKind.AtToken>;

    constructor (placeholderToken: Token<SyntaxKind.AtToken>) {
        super(SyntaxKind.PlaceholderSymbol);
        this.placeholderToken = placeholderToken;
    }

    get firstChild(): Node | undefined { return this.placeholderToken; }
    get lastChild(): Node | undefined { return this.placeholderToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.placeholderToken);
    }

    public * children(): IterableIterator<Node> {
        yield this.placeholderToken;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(_offset: number): boolean { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined { return offset === 0 ? "placeholderToken" : undefined; }
    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.placeholderToken : undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitPlaceholderSymbol(this); }
}

export interface LexicalSymbolTypes { [SyntaxKind.UnicodeCharacterRange]: UnicodeCharacterRange; }
export class UnicodeCharacterRange extends LexicalSymbolBase<SyntaxKind.UnicodeCharacterRange> {
    public readonly left: UnicodeCharacterLiteral;
    public readonly throughKeyword: Token<SyntaxKind.ThroughKeyword>;
    public readonly right: UnicodeCharacterLiteral;

    constructor(left: UnicodeCharacterLiteral, throughKeyword: Token<SyntaxKind.ThroughKeyword>, right: UnicodeCharacterLiteral) {
        super(SyntaxKind.UnicodeCharacterRange);
        this.left = left;
        this.throughKeyword = throughKeyword;
        this.right = right;
    }

    get firstChild(): Node | undefined { return this.left; }
    get lastChild(): Node | undefined { return this.right; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.left)
            || cbNode(this.throughKeyword)
            || cbNode(this.right);
    }

    public * children(): IterableIterator<Node> {
        yield this.left;
        yield this.throughKeyword;
        yield this.right;
    }

    public update(left: UnicodeCharacterLiteral, right: UnicodeCharacterLiteral) {
        return left !== this.left || right !== this.right
            ? setTextRange(new UnicodeCharacterRange(left, this.throughKeyword, right), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "left";
            case 1: return "throughKeyword";
            case 2: return "right";
        }
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.left;
            case 1: return this.throughKeyword;
            case 2: return this.right;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitUnicodeCharacterRange(this); }
}

export interface LexicalSymbolTypes { [SyntaxKind.ButNotSymbol]: ButNotSymbol; }
export class ButNotSymbol extends LexicalSymbolBase<SyntaxKind.ButNotSymbol> {
    public readonly left: LexicalSymbol;
    public readonly butKeyword: Token<SyntaxKind.ButKeyword> | undefined;
    public readonly notKeyword: Token<SyntaxKind.NotKeyword> | undefined;
    public readonly right: LexicalSymbol | undefined;

    constructor(left: LexicalSymbol, butKeyword: Token<SyntaxKind.ButKeyword> | undefined, notKeyword: Token<SyntaxKind.NotKeyword> | undefined, right: LexicalSymbol | undefined) {
        super(SyntaxKind.ButNotSymbol);
        this.left = left;
        this.butKeyword = butKeyword;
        this.notKeyword = notKeyword;
        this.right = right;
    }

    get firstChild(): Node | undefined { return this.left; }
    get lastChild(): Node | undefined { return this.right || this.notKeyword || this.butKeyword || this.left; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.left)
            || (this.butKeyword && cbNode(this.butKeyword))
            || (this.notKeyword && cbNode(this.notKeyword))
            || (this.right && cbNode(this.right));
    }

    public * children(): IterableIterator<Node> {
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

    /*@internal*/ get edgeCount() { return 4; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "left";
            case 1: return "butKeyword";
            case 2: return "notKeyword";
            case 3: return "right";
        }
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.left;
            case 1: return this.butKeyword;
            case 2: return this.notKeyword;
            case 3: return this.right;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitButNotSymbol(this); }
}

export interface LexicalSymbolTypes { [SyntaxKind.Prose]: Prose; }
export class Prose extends LexicalSymbolBase<SyntaxKind.Prose> {
    public readonly greaterThanToken: Token<SyntaxKind.GreaterThanToken>;
    public readonly fragments: ReadonlyArray<ProseFragment> | undefined;

    constructor(greaterThanToken: Token<SyntaxKind.GreaterThanToken>, fragments: ReadonlyArray<ProseFragment> | undefined) {
        super(SyntaxKind.Prose);
        this.greaterThanToken = greaterThanToken;
        this.fragments = fragments;
    }

    get firstChild(): Node | undefined { return this.greaterThanToken; }
    get lastChild(): Node | undefined { return last(this.fragments) || this.greaterThanToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.greaterThanToken)
            || (this.fragments && forEach(this.fragments, cbNode));
    }

    public * children(): IterableIterator<Node> {
        yield this.greaterThanToken;
        if (this.fragments) yield* this.fragments;
    }

    public update(fragments: ReadonlyArray<ProseFragment> | undefined) {
        return fragments !== this.fragments
            ? setTextRange(new Prose(this.greaterThanToken, fragments), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 2; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 1; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "greaterThanToken";
            case 1: return "fragments";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.greaterThanToken;
            case 1: return this.fragments;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitProse(this); }
}

export interface LexicalSymbolTypes { [SyntaxKind.OneOfSymbol]: OneOfSymbol; }
export class OneOfSymbol extends LexicalSymbolBase<SyntaxKind.OneOfSymbol> {
    public readonly oneKeyword: Token<SyntaxKind.OneKeyword>;
    public readonly ofKeyword: Token<SyntaxKind.OfKeyword> | undefined;
    public readonly symbols: ReadonlyArray<LexicalSymbol> | undefined;

    constructor(oneKeyword: Token<SyntaxKind.OneKeyword>, ofKeyword: Token<SyntaxKind.OfKeyword> | undefined, symbols: ReadonlyArray<LexicalSymbol> | undefined) {
        super(SyntaxKind.OneOfSymbol);
        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.symbols = symbols;
    }

    get firstChild(): Node | undefined { return this.oneKeyword; }
    get lastChild(): Node | undefined { return last(this.symbols) || this.ofKeyword || this.oneKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.oneKeyword)
            || (this.ofKeyword && cbNode(this.ofKeyword))
            || (this.symbols && forEach(this.symbols, cbNode));
    }

    public * children(): IterableIterator<Node> {
        yield this.oneKeyword;
        if (this.ofKeyword) yield this.ofKeyword;
        if (this.symbols) yield* this.symbols;
    }

    public update(symbols: ReadonlyArray<LexicalSymbol> | undefined) {
        return symbols !== this.symbols
            ? setTextRange(new OneOfSymbol(this.oneKeyword, this.ofKeyword, symbols), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 2; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "oneKeyword";
            case 1: return "ofKeyword";
            case 2: return "symbols";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.oneKeyword;
            case 1: return this.ofKeyword;
            case 2: return this.symbols;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitOneOfSymbol(this); }
}

//
// Primary Symbols
//

export type PrimarySymbolKind = keyof PrimarySymbolTypes;
export type PrimarySymbol = PrimarySymbolTypes[PrimarySymbolKind];
export interface PrimarySymbolTypes extends OptionalSymbolTypes {}
export abstract class PrimarySymbolBase<TKind extends PrimarySymbolKind> extends LexicalSymbolBase<TKind> {
}

//
// Optional Symbols
//

export interface OptionalSymbolTypes {}
export type OptionalSymbolKind = keyof OptionalSymbolTypes;
export type OptionalSymbol = OptionalSymbolTypes[OptionalSymbolKind];
export abstract class OptionalSymbolBase<TKind extends OptionalSymbolKind> extends PrimarySymbolBase<TKind> {
    public readonly questionToken: Token<SyntaxKind.QuestionToken> | undefined;

    constructor(kind: TKind, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(kind);
        this.questionToken = questionToken;
    }
}

export interface OptionalSymbolTypes { [SyntaxKind.UnicodeCharacterLiteral]: UnicodeCharacterLiteral; }
export class UnicodeCharacterLiteral extends OptionalSymbolBase<SyntaxKind.UnicodeCharacterLiteral> implements TextContent {
    public readonly text: string | undefined;

    constructor(text: string | undefined, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(SyntaxKind.UnicodeCharacterLiteral, questionToken);
        this.text = text;
    }

    get firstChild(): Node | undefined { return undefined; }
    get lastChild(): Node | undefined { return this.questionToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return this.questionToken && cbNode(this.questionToken);
    }

    public * children(): IterableIterator<Node> {
        if (this.questionToken) yield this.questionToken;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(_offset: number): boolean { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined { return offset === 0 ? "questionToken" : undefined; }
    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.questionToken : undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitUnicodeCharacterLiteral(this); }
}

export interface OptionalSymbolTypes { [SyntaxKind.Terminal]: Terminal; }
export interface ProseFragmentTypes { [SyntaxKind.Terminal]: Terminal; }
export class Terminal extends OptionalSymbolBase<SyntaxKind.Terminal> implements TextContent {
    public readonly text: string | undefined;

    constructor(text: string | undefined, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(SyntaxKind.Terminal, questionToken);
        this.text = text;
    }

    get firstChild(): Node | undefined { return undefined; }
    get lastChild(): Node | undefined { return this.questionToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.questionToken && cbNode(this.questionToken));
    }

    public * children(): IterableIterator<Node> {
        if (this.questionToken) yield this.questionToken;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(_offset: number): boolean { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined { return offset === 0 ? "questionToken" : undefined; }
    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.questionToken : undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitTerminal(this); }
}

export interface OptionalSymbolTypes { [SyntaxKind.Nonterminal]: Nonterminal; }
export interface ProseFragmentTypes { [SyntaxKind.Nonterminal]: Nonterminal; }
export class Nonterminal extends OptionalSymbolBase<SyntaxKind.Nonterminal> {
    public readonly name: Identifier;
    public readonly argumentList: ArgumentList | undefined;

    constructor(name: Identifier, argumentList: ArgumentList | undefined, questionToken: Token<SyntaxKind.QuestionToken> | undefined) {
        super(SyntaxKind.Nonterminal, questionToken);
        this.name = name;
        this.argumentList = argumentList;
    }

    get firstChild(): Node | undefined { return this.name; }
    get lastChild(): Node | undefined { return this.questionToken || this.argumentList || this.name; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.name)
            || (this.argumentList && cbNode(this.argumentList))
            || (this.questionToken && cbNode(this.questionToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.name;
        if (this.argumentList) yield this.argumentList;
        if (this.questionToken) yield this.questionToken;
    }

    public update(name: Identifier, argumentList: ArgumentList | undefined) {
        return name !== this.name || argumentList !== this.argumentList
            ? setTextRange(new Nonterminal(name, argumentList, this.questionToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(_offset: number): boolean { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "name";
            case 1: return "argumentList";
            case 2: return "questionToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.name;
            case 1: return this.argumentList;
            case 2: return this.questionToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitNonterminal(this); }
}

//
// Assertions
//

export interface AssertionTypes {}
export type AssertionKind = keyof AssertionTypes;
export type Assertion = AssertionTypes[AssertionKind];
export abstract class AssertionBase<TKind extends AssertionKind, TBracket extends SyntaxKind.OpenBracketToken | SyntaxKind.OpenBracketGreaterThanToken> extends LexicalSymbolBase<TKind> {
    public readonly openBracketToken: Token<TBracket>;
    public readonly closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined;

    constructor(kind: TKind, openBracketToken: Token<TBracket>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(kind);
        this.openBracketToken = openBracketToken;
        this.closeBracketToken = closeBracketToken;
    }

    get firstChild(): Node | undefined { return this.openBracketToken; }
    abstract get lastChild(): Node | undefined;
}

export interface AssertionTypes { [SyntaxKind.InvalidAssertion]: InvalidAssertion; }
export class InvalidAssertion extends AssertionBase<SyntaxKind.InvalidAssertion, SyntaxKind.OpenBracketToken> {
    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.InvalidAssertion, openBracketToken, closeBracketToken);
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || this.openBracketToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    /*@internal*/ get edgeCount() { return 2; }
    /*@internal*/ edgeIsArray(_offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitInvalidAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.EmptyAssertion]: EmptyAssertion; }
export class EmptyAssertion extends AssertionBase<SyntaxKind.EmptyAssertion, SyntaxKind.OpenBracketToken> {
    public readonly emptyKeyword: Token<SyntaxKind.EmptyKeyword>;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, emptyKeyword: Token<SyntaxKind.EmptyKeyword>, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.EmptyAssertion, openBracketToken, closeBracketToken);
        this.emptyKeyword = emptyKeyword;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || this.emptyKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.emptyKeyword)
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        yield this.emptyKeyword;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "emptyKeyword";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.emptyKeyword;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitEmptyAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.LookaheadAssertion]: LookaheadAssertion; }
export class LookaheadAssertion extends AssertionBase<SyntaxKind.LookaheadAssertion, SyntaxKind.OpenBracketToken> {
    public readonly lookaheadKeyword: Token<SyntaxKind.LookaheadKeyword>;
    public readonly operatorToken: Token<LookaheadOperatorKind> | undefined;
    public readonly lookahead: SymbolSpan | SymbolSet | undefined;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lookaheadKeyword: Token<SyntaxKind.LookaheadKeyword>, operatorToken: Token<LookaheadOperatorKind> | undefined, lookahead: SymbolSpan | SymbolSet | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.LookaheadAssertion, openBracketToken, closeBracketToken);
        this.lookaheadKeyword = lookaheadKeyword;
        this.operatorToken = operatorToken;
        this.lookahead = lookahead;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || this.lookahead || this.operatorToken || this.lookaheadKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.lookaheadKeyword)
            || (this.operatorToken && cbNode(this.operatorToken))
            || (this.lookahead && cbNode(this.lookahead))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
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

    /*@internal*/ get edgeCount() { return 5; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "lookaheadKeyword";
            case 2: return "operatorToken";
            case 3: return "lookahead";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.lookaheadKeyword;
            case 2: return this.operatorToken;
            case 3: return this.lookahead;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitLookaheadAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.LexicalGoalAssertion]: LexicalGoalAssertion; }
export class LexicalGoalAssertion extends AssertionBase<SyntaxKind.LexicalGoalAssertion, SyntaxKind.OpenBracketToken> {
    public readonly lexicalKeyword: Token<SyntaxKind.LexicalKeyword>;
    public readonly goalKeyword: Token<SyntaxKind.GoalKeyword> | undefined;
    public readonly symbol: Identifier | undefined;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lexicalKeyword: Token<SyntaxKind.LexicalKeyword>, goalKeyword: Token<SyntaxKind.GoalKeyword> | undefined, symbol: Identifier | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.LexicalGoalAssertion, openBracketToken, closeBracketToken);
        this.lexicalKeyword = lexicalKeyword;
        this.goalKeyword = goalKeyword;
        this.symbol = symbol;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || this.symbol || this.goalKeyword || this.lexicalKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.lexicalKeyword)
            || (this.goalKeyword && cbNode(this.goalKeyword))
            || (this.symbol && cbNode(this.symbol))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
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

    /*@internal*/ get edgeCount() { return 5; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "lexicalKeyword";
            case 2: return "goalKeyword";
            case 3: return "symbol";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.lexicalKeyword;
            case 2: return this.goalKeyword;
            case 3: return this.symbol;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitLexicalGoalAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.NoSymbolHereAssertion]: NoSymbolHereAssertion; }
export class NoSymbolHereAssertion extends AssertionBase<SyntaxKind.NoSymbolHereAssertion, SyntaxKind.OpenBracketToken> {
    public readonly noKeyword: Token<SyntaxKind.NoKeyword>;
    public readonly symbols: ReadonlyArray<PrimarySymbol> | undefined;
    public readonly hereKeyword: Token<SyntaxKind.HereKeyword> | undefined;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, noKeyword: Token<SyntaxKind.NoKeyword>, symbols: ReadonlyArray<PrimarySymbol> | undefined, hereKeyword: Token<SyntaxKind.HereKeyword> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.NoSymbolHereAssertion, openBracketToken, closeBracketToken);
        this.noKeyword = noKeyword;
        this.symbols = symbols;
        this.hereKeyword = hereKeyword;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || this.hereKeyword || last(this.symbols) || this.noKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || cbNode(this.noKeyword)
            || (this.symbols && forEach(this.symbols, cbNode))
            || (this.hereKeyword && cbNode(this.hereKeyword))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
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

    /*@internal*/ get edgeCount() { return 5; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 2; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "noKeyword";
            case 2: return "symbols";
            case 3: return "hereKeyword";
            case 4: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.noKeyword;
            case 2: return this.symbols;
            case 3: return this.hereKeyword;
            case 4: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitNoSymbolHereAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.ParameterValueAssertion]: ParameterValueAssertion; }
export class ParameterValueAssertion extends AssertionBase<SyntaxKind.ParameterValueAssertion, SyntaxKind.OpenBracketToken> {
    public readonly elements: ReadonlyArray<Argument> | undefined;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Argument> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ParameterValueAssertion, openBracketToken, closeBracketToken);
        this.elements = elements;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || last(this.elements); }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.elements) yield* this.elements;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(elements: ReadonlyArray<Argument> | undefined) {
        return elements !== this.elements
            ? setTextRange(new ParameterValueAssertion(this.openBracketToken, elements, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 1; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "elements";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.elements;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitParameterValueAssertion(this); }
}

export interface AssertionTypes { [SyntaxKind.ProseAssertion]: ProseAssertion; }
export class ProseAssertion extends AssertionBase<SyntaxKind.ProseAssertion, SyntaxKind.OpenBracketGreaterThanToken> {
    public readonly fragments: ReadonlyArray<ProseFragment> | undefined;

    constructor(openBracketToken: Token<SyntaxKind.OpenBracketGreaterThanToken>, fragments: ReadonlyArray<ProseFragment> | undefined, closeBracketToken: Token<SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ProseAssertion, openBracketToken, closeBracketToken);
        this.fragments = fragments;
    }

    get lastChild(): Node | undefined { return this.closeBracketToken || last(this.fragments) || this.openBracketToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openBracketToken)
            || (this.fragments && forEach(this.fragments, cbNode))
            || (this.closeBracketToken && cbNode(this.closeBracketToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openBracketToken;
        if (this.fragments) yield* this.fragments;
        if (this.closeBracketToken) yield this.closeBracketToken;
    }

    public update(fragments: ReadonlyArray<ProseFragment> | undefined) {
        return fragments !== this.fragments
            ? setTextRange(new ProseAssertion(this.openBracketToken, fragments, this.closeBracketToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 1; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openBracketToken";
            case 1: return "fragments";
            case 2: return "closeBracketToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openBracketToken;
            case 1: return this.fragments;
            case 2: return this.closeBracketToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitProseAssertion(this); }
}

export interface ProseFragmentTypes extends ProseFragmentLiteralTypes {}
export type ProseFragmentLiteralTypes = { [P in ProseFragmentLiteralKind]: ProseFragmentLiteral<P>; }
export class ProseFragmentLiteral<TKind extends ProseFragmentLiteralKind = ProseFragmentLiteralKind> extends Node<SyntaxKind> implements TextContent {
    public readonly text: string | undefined;

    constructor(kind: SyntaxKind, text: string | undefined) {
        super(kind);
        this.text = text;
    }

    /*@internal*/ get edgeCount() { return 0; }
    /*@internal*/ edgeIsArray(_offset: number): boolean { return false; }
    /*@internal*/ edgeName(_offset: number): string | undefined { return undefined; }
    /*@internal*/ edgeValue(_offset: number): Node | ReadonlyArray<Node> | undefined { return undefined; }
    /*@internal*/ accept(visitor: NodeVisitor): ProseFragmentLiteral<TKind> { return visitor.visitProseFragmentLiteral(this); }
}

export interface ProseFragmentTypes {}
export type ProseFragmentKind = keyof ProseFragmentTypes;
export type ProseFragment = ProseFragmentTypes[ProseFragmentKind];

export class Argument extends Node<SyntaxKind.Argument> {
    public readonly operatorToken: Token<ArgumentOperatorKind> | undefined;
    public readonly name: Identifier | undefined;

    constructor(operatorToken: Token<ArgumentOperatorKind> | undefined, name: Identifier | undefined) {
        super(SyntaxKind.Argument);
        this.operatorToken = operatorToken;
        this.name = name;
    }

    get firstChild(): Node | undefined { return this.operatorToken || this.name; }
    get lastChild(): Node | undefined { return this.name || this.operatorToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.operatorToken && cbNode(this.operatorToken))
            || (this.name && cbNode(this.name));
    }

    public * children(): IterableIterator<Node> {
        if (this.operatorToken) yield this.operatorToken;
        if (this.name) yield this.name;
    }

    public update(name: Identifier | undefined) {
        return name !== name
            ? setTextRange(new Argument(this.operatorToken, name), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 2; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "operatorToken";
            case 1: return "name";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.operatorToken;
            case 1: return this.name;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitArgument(this); }
}

export class ArgumentList extends Node<SyntaxKind.ArgumentList> {
    public readonly openParenToken: Token<SyntaxKind.OpenParenToken | SyntaxKind.OpenBracketToken>;
    public readonly elements: ReadonlyArray<Argument> | undefined;
    public readonly closeParenToken: Token<SyntaxKind.CloseParenToken | SyntaxKind.CloseBracketToken> | undefined;

    constructor(openParenToken: Token<SyntaxKind.OpenParenToken | SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Argument> | undefined, closeParenToken: Token<SyntaxKind.CloseParenToken | SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ArgumentList);
        this.openParenToken = openParenToken;
        this.elements = elements;
        this.closeParenToken = closeParenToken;
    }

    get firstChild(): Node | undefined { return this.openParenToken; }
    get lastChild(): Node | undefined { return this.closeParenToken || last(this.elements) || this.openParenToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openParenToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeParenToken && cbNode(this.closeParenToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openParenToken;
        if (this.elements) yield* this.elements;
        if (this.closeParenToken) yield this.closeParenToken;
    }

    public update(elements: ReadonlyArray<Argument> | undefined) {
        return elements !== this.elements
            ? setTextRange(new ArgumentList(this.openParenToken, elements, this.closeParenToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 2; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openParenToken";
            case 1: return "elements";
            case 2: return "closeParenToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openParenToken;
            case 1: return this.elements;
            case 2: return this.closeParenToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitArgumentList(this); }
}

export class SymbolSpan extends Node<SyntaxKind.SymbolSpan> {
    public readonly symbol: LexicalSymbol;
    public readonly next: SymbolSpan | undefined;

    constructor(symbol: LexicalSymbol, next: SymbolSpan | undefined) {
        super(SyntaxKind.SymbolSpan);
        this.symbol = symbol;
        this.next = next;
    }

    get firstChild(): Node | undefined { return this.symbol; }
    get lastChild(): Node | undefined { return this.next || this.symbol; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.symbol)
            || (this.next && cbNode(this.next));
    }

    public * children(): IterableIterator<Node> {
        yield this.symbol;
        if (this.next) yield this.next;
    }

    public update(symbol: LexicalSymbol, next: SymbolSpan | undefined) {
        return symbol !== this.symbol || next !== this.next
            ? setTextRange(new SymbolSpan(symbol, next), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 2; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "symbol";
            case 1: return "next";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.symbol;
            case 1: return this.next;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitSymbolSpan(this); }
}

export class LinkReference extends Node<SyntaxKind.LinkReference> {
    public readonly text: string | undefined;

    constructor(text: string | undefined) {
        super(SyntaxKind.LinkReference);
        this.text = text;
    }

    public forEachChild<T>(_cbNode: (node: Node) => T | undefined): T | undefined { return undefined; }
    public children(): IterableIterator<Node> { return emptyIterable; }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(_offset: number) { return false; }
    /*@internal*/ edgeName(_offset: number) { return undefined; }
    /*@internal*/ edgeValue(_offset: number) { return undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitLinkReference(this); }
}

export interface ProductionBodyTypes { [SyntaxKind.RightHandSide]: RightHandSide }
export class RightHandSide extends Node<SyntaxKind.RightHandSide> {
    public readonly head: SymbolSpan;
    public readonly reference: LinkReference | undefined;

    constructor(head: SymbolSpan, reference: LinkReference | undefined) {
        super(SyntaxKind.RightHandSide);
        this.head = head;
        this.reference = reference;
    }

    get firstChild(): Node | undefined { return this.head; }
    get lastChild(): Node | undefined { return this.reference || this.head; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.head)
            || (this.reference && cbNode(this.reference));
    }

    public * children(): IterableIterator<Node> {
        yield this.head;
        if (this.reference) yield this.reference;
    }

    public update(head: SymbolSpan, reference: LinkReference | undefined) {
        return head !== this.head || reference !== this.reference
            ? setTextRange(new RightHandSide(head, reference), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 2; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "head";
            case 1: return "reference";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.head;
            case 1: return this.reference;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitRightHandSide(this); }
}

export interface ProductionBodyTypes { [SyntaxKind.RightHandSideList]: RightHandSideList }
export class RightHandSideList extends Node<SyntaxKind.RightHandSideList> {
    public readonly elements: ReadonlyArray<RightHandSide> | undefined;

    constructor(elements: ReadonlyArray<RightHandSide> | undefined) {
        super(SyntaxKind.RightHandSideList);
        this.elements = elements;
    }

    get firstChild(): Node | undefined { return first(this.elements); }
    get lastChild(): Node | undefined { return last(this.elements); }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return forEach(this.elements, cbNode);
    }

    public * children(): IterableIterator<Node> {
        if (this.elements) yield* this.elements;
    }

    public update(elements: ReadonlyArray<RightHandSide> | undefined) {
        return elements !== this.elements
            ? setTextRange(new RightHandSideList(elements), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 0; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "elements";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.elements;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitRightHandSideList(this); }
}

export interface ProductionBodyTypes { [SyntaxKind.OneOfList]: OneOfList }
export class OneOfList extends Node<SyntaxKind.OneOfList> {
    public readonly oneKeyword: Token<SyntaxKind.OneKeyword>;
    public readonly ofKeyword: Token<SyntaxKind.OfKeyword> | undefined;
    public readonly indented: boolean;
    public readonly terminals: ReadonlyArray<Terminal> | undefined;

    constructor(oneKeyword: Token<SyntaxKind.OneKeyword>, ofKeyword: Token<SyntaxKind.OfKeyword> | undefined, indented: boolean, terminals: ReadonlyArray<Terminal> | undefined) {
        super(SyntaxKind.OneOfList);
        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.indented = indented;
        this.terminals = terminals;
    }

    get firstChild(): Node | undefined { return this.oneKeyword; }
    get lastChild(): Node | undefined { return last(this.terminals) || this.ofKeyword || this.oneKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.oneKeyword)
            || (this.ofKeyword && cbNode(this.ofKeyword))
            || (this.terminals && forEach(this.terminals, cbNode));
    }

    public * children(): IterableIterator<Node> {
        yield this.oneKeyword;
        if (this.ofKeyword) yield this.ofKeyword;
        if (this.terminals) yield* this.terminals;
    }

    public update(terminals: ReadonlyArray<Terminal> | undefined) {
        return terminals !== this.terminals
            ? setTextRange(new OneOfList(this.oneKeyword, this.ofKeyword, this.indented, terminals), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 3; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "oneKeyword";
            case 1: return "ofKeyword";
            case 2: return "terminals";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.oneKeyword;
            case 1: return this.ofKeyword;
            case 2: return this.terminals;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitOneOfList(this); }
}

export interface DeclarationTypes { [SyntaxKind.Parameter]: Parameter; }
export class Parameter extends Node<SyntaxKind.Parameter> {
    public readonly name: Identifier;

    constructor(name: Identifier) {
        super(SyntaxKind.Parameter);
        this.name = name;
    }

    get firstChild(): Node | undefined { return this.name; }
    get lastChild(): Node | undefined { return this.name; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.name && cbNode(this.name));
    }

    public * children(): IterableIterator<Node> {
        if (this.name) yield this.name;
    }

    public update(name: Identifier) {
        return name !== this.name
            ? setTextRange(new Parameter(name), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined { return offset === 0 ? "name" : undefined; }
    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.name : undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitParameter(this); }
}

export class ParameterList extends Node<SyntaxKind.ParameterList> {
    public readonly openParenToken: Token<SyntaxKind.OpenParenToken | SyntaxKind.OpenBracketToken>;
    public readonly elements: ReadonlyArray<Parameter> | undefined;
    public readonly closeParenToken: Token<SyntaxKind.CloseParenToken | SyntaxKind.CloseBracketToken> | undefined;

    constructor(openParenToken: Token<SyntaxKind.OpenParenToken | SyntaxKind.OpenBracketToken>, elements: ReadonlyArray<Parameter> | undefined, closeParenToken: Token<SyntaxKind.CloseParenToken | SyntaxKind.CloseBracketToken> | undefined) {
        super(SyntaxKind.ParameterList);
        this.openParenToken = openParenToken;
        this.elements = elements;
        this.closeParenToken = closeParenToken;
    }

    get firstChild(): Node | undefined { return this.openParenToken; }
    get lastChild(): Node | undefined { return this.closeParenToken || last(this.elements) || this.openParenToken; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.openParenToken)
            || (this.elements && forEach(this.elements, cbNode))
            || (this.closeParenToken && cbNode(this.closeParenToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.openParenToken;
        if (this.elements) yield* this.elements;
        if (this.closeParenToken) yield this.closeParenToken;
    }

    public update(elements: ReadonlyArray<Parameter> | undefined) {
        return elements !== this.elements
            ? setTextRange(new ParameterList(this.openParenToken, elements, this.closeParenToken), this.pos, this.end)
            : this;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 1; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "openParenToken";
            case 1: return "elements";
            case 2: return "closeParenToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.openParenToken;
            case 1: return this.elements;
            case 2: return this.closeParenToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitParameterList(this); }
}

export interface SourceElementTypes {}
export type SourceElementKind = keyof SourceElementTypes;
export type SourceElement = SourceElementTypes[SourceElementKind];
export abstract class SourceElementBase<TKind extends SyntaxKind = SyntaxKind> extends Node<TKind> {
}

export interface ProductionBodyTypes {}
export type ProductionBodyKind = keyof ProductionBodyTypes;
export type ProductionBody = ProductionBodyTypes[ProductionBodyKind];

export interface SourceElementTypes { [SyntaxKind.Production]: Production; }
export interface DeclarationTypes { [SyntaxKind.Production]: Production; }
export class Production extends SourceElementBase<SyntaxKind.Production> {
    public readonly name: Identifier;
    public readonly parameterList: ParameterList | undefined;
    public readonly colonToken: Token<ProductionSeperatorKind> | undefined;
    public readonly body: ProductionBody | undefined;

    constructor(name: Identifier, parameterList: ParameterList | undefined, colonToken: Token<ProductionSeperatorKind> | undefined, body: ProductionBody | undefined) {
        super(SyntaxKind.Production);
        this.name = name;
        this.parameterList = parameterList;
        this.colonToken = colonToken;
        this.body = body;
    }

    get firstChild(): Node | undefined { return this.name; }
    get lastChild(): Node | undefined { return this.body || this.colonToken || this.parameterList || this.name; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.name)
            || (this.parameterList && cbNode(this.parameterList))
            || (this.colonToken && cbNode(this.colonToken))
            || (this.body && cbNode(this.body));
    }

    public * children(): IterableIterator<Node> {
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

    /*@internal*/ get edgeCount() { return 4; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "name";
            case 1: return "colonToken";
            case 2: return "parameterList";
            case 3: return "body";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.name;
            case 1: return this.colonToken;
            case 2: return this.parameterList;
            case 3: return this.body;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitProduction(this); }
}

export interface SourceElementTypes extends MetaElementTypes { }
export interface MetaElementTypes {}
export type MetaElementKind = keyof MetaElementTypes;
export type MetaElement = MetaElementTypes[MetaElementKind];
export abstract class MetaElementBase<TKind extends MetaElementKind> extends SourceElementBase<TKind> {
    public readonly atToken: Token<SyntaxKind.AtToken>;

    constructor(kind: TKind, atToken: Token<SyntaxKind.AtToken>) {
        super(kind);
        this.atToken = atToken;
    }

    get firstChild(): Node | undefined { return this.atToken; }
}

export interface MetaElementTypes { [SyntaxKind.Import]: Import; }
export class Import extends MetaElementBase<SyntaxKind.Import> {
    public readonly importKeyword: Token<SyntaxKind.ImportKeyword>;
    public readonly path: StringLiteral | undefined;

    constructor(atToken: Token<SyntaxKind.AtToken>, importKeyword: Token<SyntaxKind.ImportKeyword>, path: StringLiteral | undefined) {
        super(SyntaxKind.Import, atToken);
        this.importKeyword = importKeyword;
        this.path = path;
    }

    get lastChild(): Node | undefined { return this.path || this.importKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.atToken)
            || cbNode(this.importKeyword)
            || (this.path && cbNode(this.path));
    }

    public * children(): IterableIterator<Node> {
        yield this.atToken;
        yield this.importKeyword;
        if (this.path) yield this.path;
    }

    /*@internal*/ get edgeCount() { return 3; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "atToken";
            case 1: return "importKeyword";
            case 2: return "path";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.atToken;
            case 1: return this.importKeyword;
            case 2: return this.path;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitImport(this); }
}

export interface MetaElementTypes { [SyntaxKind.Define]: Define; }
export class Define extends MetaElementBase<SyntaxKind.Define> {
    public readonly defineKeyword: Token<SyntaxKind.DefineKeyword>;
    public readonly key: Identifier;
    public readonly valueToken: Token<BooleanKind> | undefined;

    constructor(atToken: Token<SyntaxKind.AtToken>, defineKeyword: Token<SyntaxKind.DefineKeyword>, key: Identifier, valueToken: Token<BooleanKind> | undefined) {
        super(SyntaxKind.Define, atToken);
        this.defineKeyword = defineKeyword;
        this.key = key;
        this.valueToken = valueToken;
    }

    get lastChild(): Node | undefined { return this.valueToken || this.key || this.defineKeyword; }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return cbNode(this.atToken)
            || cbNode(this.defineKeyword)
            || (this.key && cbNode(this.key))
            || (this.valueToken && cbNode(this.valueToken));
    }

    public * children(): IterableIterator<Node> {
        yield this.atToken;
        yield this.defineKeyword;
        if (this.key) yield this.key;
        if (this.valueToken) yield this.valueToken;
    }

    /*@internal*/ get edgeCount() { return 4; }
    /*@internal*/ edgeIsArray(offset: number) { return false; }
    /*@internal*/ edgeName(offset: number): string | undefined {
        switch (offset) {
            case 0: return "atToken";
            case 1: return "defineKeyword";
            case 2: return "key";
            case 3: return "valueToken";
        }
        return undefined;
    }

    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined {
        switch (offset) {
            case 0: return this.atToken;
            case 1: return this.defineKeyword;
            case 2: return this.key;
            case 3: return this.valueToken;
        }
        return undefined;
    }

    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitDefine(this); }
}

export interface DeclarationTypes {}
export type DeclarationKind = keyof DeclarationTypes;
export type Declaration = DeclarationTypes[DeclarationKind];

export interface DeclarationTypes { [SyntaxKind.SourceFile]: SourceFile; }
export class SourceFile extends Node<SyntaxKind.SourceFile> {
    public readonly elements: ReadonlyArray<SourceElement>;
    public readonly filename: string;
    public readonly text: string;
    public readonly lineMap: LineMap;
    public imports: ReadonlyArray<string> | undefined;
    /*@internal*/
    public parseDiagnostics: DiagnosticMessages | undefined;

    constructor(filename: string, text: string, elements: ReadonlyArray<SourceElement>) {
        super(SyntaxKind.SourceFile);
        this.elements = elements;
        this.filename = filename;
        this.text = text;
        this.lineMap = new LineMap(text);
        this.pos = 0;
        this.end = this.text.length;
    }

    get firstChild(): Node | undefined { return first(this.elements); }
    get lastChild(): Node | undefined { return last(this.elements); }

    public forEachChild<T>(cbNode: (node: Node) => T | undefined): T | undefined {
        return (this.elements && forEach(this.elements, cbNode));
    }

    public * children(): IterableIterator<Node> {
        if (this.elements) yield* this.elements;
    }

    public update(elements: ReadonlyArray<SourceElement>) {
        return elements !== this.elements
            ? new SourceFile(this.filename, this.text, elements)
            : this;
    }

    /*@internal*/ get edgeCount() { return 1; }
    /*@internal*/ edgeIsArray(offset: number) { return offset === 0; }
    /*@internal*/ edgeName(offset: number): string | undefined { return offset === 0 ? "elements" : undefined; }
    /*@internal*/ edgeValue(offset: number): Node | ReadonlyArray<Node> | undefined { return offset === 0 ? this.elements : undefined; }
    /*@internal*/ accept(visitor: NodeVisitor) { return visitor.visitSourceFile(this); }
}

function setTextRange<T extends Node>(node: T, pos: number, end: number) {
    node.pos = pos;
    node.end = end;
    return node;
}

export function forEachChild<T>(node: Node | undefined, cbNode: (node: Node) => T | undefined): T | undefined {
    return node && node.forEachChild(cbNode);
}
