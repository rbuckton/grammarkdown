/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";
import { concat, toCancelToken } from "./core";
import { Range, TextRange } from "./types";
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages, LineMap, formatList } from "./diagnostics";
import { SyntaxKind, tokenToString, ProductionSeperatorKind, ArgumentOperatorKind, LookaheadOperatorKind, ParameterOperatorKind, TokenKind } from "./tokens";
import { Scanner, decodeHtmlEntities } from "./scanner";
import {
    Node,
    Token,
    StringLiteral,
    SourceFile,
    UnicodeCharacterLiteral,
    Prose,
    Identifier,
    Parameter,
    ParameterList,
    OneOfList,
    Terminal,
    SymbolSet,
    Assertion,
    InvalidAssertion,
    EmptyAssertion,
    LookaheadAssertion,
    NoSymbolHereAssertion,
    LexicalGoalAssertion,
    Constraints,
    ProseAssertion,
    ProseFragmentLiteral,
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    LexicalSymbol,
    PlaceholderSymbol,
    InvalidSymbol,
    ButNotSymbol,
    UnicodeCharacterRange,
    SymbolSpan,
    LinkReference,
    RightHandSide,
    RightHandSideList,
    Production,
    Import,
    Define,
    MetaElement,
    SourceElement,
    PrimarySymbol,
    Trivia,
    Line,
    NumberLiteral,
    TerminalLiteral,
} from "./nodes";
import { getNodeAccessor, getSourceFileAccessor } from "./nodeInternal";

enum ParsingContext {
    SourceElements,
    Parameters,
    Arguments,
    RightHandSideListIndented,
    SymbolSet,
    OneOfList,
    OneOfListIndented,
    OneOfSymbolList,
    NoSymbolHere
}

interface ListTypes {
    [ParsingContext.SourceElements]: SourceElement;
    [ParsingContext.Parameters]: Parameter;
    [ParsingContext.Arguments]: Argument;
    [ParsingContext.RightHandSideListIndented]: RightHandSide;
    [ParsingContext.SymbolSet]: SymbolSpan;
    [ParsingContext.OneOfList]: TerminalLiteral;
    [ParsingContext.OneOfListIndented]: TerminalLiteral;
    [ParsingContext.OneOfSymbolList]: LexicalSymbol;
    [ParsingContext.NoSymbolHere]: PrimarySymbol;
}

/** {@docCategory Other} */
export interface TextChange {
    range: Range;
    text: string;
}

/** {@docCategory Other} */
export namespace TextChange {
    export function create(text: string, range: Range) {
        return { text, range };
    }

    export function clone(change: TextChange) {
        return create(change.text, Range.clone(change.range));
    }

    export function isUnchanged(change: TextChange) {
        return change.text.length === 0
            && Range.isCollapsed(change.range);
    }

    export function applyChange(originalText: string, change: TextChange) {
        if (isUnchanged(change)) {
            return originalText;
        }

        const lineMap = new LineMap(originalText);
        const pos = lineMap.offsetAt(change.range.start);
        const end = lineMap.offsetAt(change.range.end);
        return originalText.substr(0, pos) + change.text + originalText.substr(end);
    }
}

/** {@docCategory Parse} */
export class Parser {
    private scanner!: Scanner;
    /* @internal */ token!: SyntaxKind;
    private imports!: string[];
    private diagnostics!: DiagnosticMessages;
    private parsingContext!: ParsingContext;
    private cancelToken?: CancelToken;
    private trivia: Map<number, Trivia[]> | undefined;

    // TODO(rbuckton): Incremental parser
    // public updateSourceFile(sourceFile: SourceFile, change: TextChange) {
    //     if (TextChange.isUnchanged(change)) {
    //         return sourceFile;
    //     }

    //     if (sourceFile.elements.length === 0) {
    //         return this.parseSourceFile(sourceFile.filename, change.text);
    //     }

    //     const navigator = new NodeNavigator(sourceFile);
    //     navigator.moveToPosition(change.range.start);
    //     navigator.moveToSourceElement();
    //     const startPos = navigator.getNode().pos;
    //     const startOffset = navigator.getOffset();
    //     navigator.moveToPosition(change.range.end);
    //     navigator.moveToSourceElement();
    //     const endPos = navigator.getNode().end;
    //     const endOffset = navigator.getOffset();

    //     // 1) replace the text from sourceFile.text with the specified changes
    //     // 2) create a new SourceFile, copying nodes from the original source file
    //     // up to startOffset
    //     // 3) parse the new text fragment, adding nodes to the new SourceFile
    //     // 4) clone nodes from the old source file to the new source file
    //     // with new positions
    // }

    public parseSourceFile(filename: string, text: string, cancelable?: Cancelable): SourceFile {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        const savedImports = this.imports;
        const savedDiagnostics = this.diagnostics;
        const savedCancellationToken = this.cancelToken;
        const savedScanner = this.scanner;
        const savedParsingContext = this.parsingContext;
        const savedTrivia = this.trivia;
        try {
            return this.parse(filename, text, /*previousSourceFile*/ undefined, /*changeRange*/ undefined, cancelToken);
        }
        finally {
            this.imports = savedImports;
            this.diagnostics = savedDiagnostics;
            this.cancelToken = savedCancellationToken;
            this.scanner = savedScanner;
            this.parsingContext = savedParsingContext;
            this.trivia = savedTrivia;
        }
    }

    private parse(filename: string, text: string, previousSourceFile: SourceFile | undefined, changeRange: TextRange | undefined, cancelToken?: CancelToken) {
        const elements: SourceElement[] = [];
        const sourceFile = new SourceFile(filename, text, elements);
        this.imports = [];
        this.diagnostics = new DiagnosticMessages();
        this.diagnostics.setSourceFile(sourceFile);
        this.cancelToken = cancelToken;
        this.parsingContext = ParsingContext.SourceElements;
        this.trivia = undefined;
        this.scanner = new Scanner(filename, text, this.diagnostics, this.cancelToken);

        this.nextToken();
        this.parseSourceElementList(elements);

        getSourceFileAccessor().setImports(sourceFile, this.imports);
        getSourceFileAccessor().setParseDiagnostics(sourceFile, this.diagnostics);

        return sourceFile;
    }

    private nextToken(): SyntaxKind {
        this.token = this.scanner.scan();
        const trivia = trimTrivia(this.scanner.getTrivia());
        if (trivia) {
            this.trivia ||= new Map<number, Trivia[]>();
            this.trivia.set(this.scanner.getStartPos(), trivia);
        }
        return this.token;
    }

    private lookahead<T>(callback: () => T): T {
        return this.speculate(callback, /*isLookahead*/ true);
    }

    // private tryParse<T>(callback: () => T): T {
    //     return this.speculate(callback, /*isLookahead*/ false);
    // }

    private speculate<T>(callback: () => T, isLookahead: boolean): T {
        const savedToken = this.token;
        const savedParsingContext = this.parsingContext;
        const savedDiagnostics = this.diagnostics;
        const savedTrivia = this.trivia;
        if (this.trivia) this.trivia = new Map(this.trivia);
        this.diagnostics = NullDiagnosticMessages.instance;
        try {
            const result = this.scanner.speculate(callback, isLookahead);
            if (!result || isLookahead) {
                this.token = savedToken;
                this.parsingContext = savedParsingContext;
                this.trivia = savedTrivia;
            }
            return result;
        }
        finally {
            this.diagnostics = savedDiagnostics;
        }
    }

    private isEOF(): boolean {
        return this.token === SyntaxKind.EndOfFileToken;
    }

    private skipUntil(isRecoveryToken: (scanner: Scanner) => boolean): void {
        while (!isRecoveryToken(this.scanner) && !this.isEOF()) {
            this.nextToken();
        }
    }

    private readTokenValue(token: SyntaxKind): string | undefined {
        if (this.token === token) {
            const text = this.scanner.getTokenValue();
            this.nextToken();
            return text;
        }

        return undefined;
    }

    private readTokenText(token: SyntaxKind): string | undefined {
        if (this.token === token) {
            const text = this.scanner.getTokenText();
            this.nextToken();
            return decodeHtmlEntities(text);
        }

        return undefined;
    }

    private finishNode<TNode extends Node>(node: TNode, fullStart: number): TNode {
        if (node) {
            getNodeAccessor().setTextRange(node, fullStart, this.scanner.getStartPos());
            if (this.trivia) {
                attachTrivia(node, this.trivia.get(node.pos), this.trivia.get(node.end), this.scanner.hasPrecedingLineTerminator());
            }
            promoteTrivia(node, node.firstChild, node.lastChild);
        }
        return node;
    }

    private parseToken<TKind extends TokenKind>(token: TKind): Token<TKind> | undefined {
        if (this.token === token) {
            const fullStart = this.scanner.getStartPos();
            this.nextToken();
            return this.finishNode(new Token(token), fullStart);
        }

        return undefined;
    }

    private parseAnyToken<TKind extends TokenKind>(predicate: (token: SyntaxKind) => token is TKind): Token<TKind> | undefined {
        const token = this.token;
        if (predicate(token)) {
            const fullStart = this.scanner.getStartPos();
            this.nextToken();
            return this.finishNode(new Token(token), fullStart);
        }

        return undefined;
    }

    private parseOptional(token: SyntaxKind): boolean {
        if (this.token === token) {
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    // list parsing
    private isStartOfListElement(): boolean {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.isStartOfSourceElement();

            case ParsingContext.Parameters:
                return this.isStartOfParameter();

            case ParsingContext.Arguments:
                return this.isStartOfArgument();

            case ParsingContext.RightHandSideListIndented:
                return this.isStartOfRightHandSide();

            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.TerminalLiteral || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.token === SyntaxKind.TerminalLiteral || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.OneOfSymbolList:
                return this.token === SyntaxKind.TerminalLiteral || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.NoSymbolHere:
                return this.token === SyntaxKind.TerminalLiteral || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            default:
                return false;
        }
    }

    private parseElement<TParsingContext extends ParsingContext>(listContext: TParsingContext): ListTypes[TParsingContext] | undefined;
    private parseElement(listContext: ParsingContext): ListTypes[ParsingContext] | undefined {
        switch (listContext) {
            case ParsingContext.SourceElements:
                return this.parseSourceElement();

            case ParsingContext.Parameters:
                return this.parseParameter();

            case ParsingContext.Arguments:
                return this.parseArgument();

            case ParsingContext.RightHandSideListIndented:
                return this.parseRightHandSide();

            case ParsingContext.SymbolSet:
                return this.parseSymbolSpan();

            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.parseTerminalLiteral();

            case ParsingContext.OneOfSymbolList:
            case ParsingContext.NoSymbolHere:
                return this.parsePrimarySymbol(/*allowOptional*/ false);

            default:
                console.error(`Unexpected parsing context: ${this.parsingContext}`);
                return undefined;
        }
    }

    private recover(): void {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                this.skipUntil(isSourceElementsRecoveryToken);
                break;

            case ParsingContext.Parameters:
                this.skipUntil(isAnyParametersRecoveryToken);
                break;

            case ParsingContext.Arguments:
                this.skipUntil(isAnyArgumentsRecoveryToken);
                break;

            case ParsingContext.RightHandSideListIndented:
                this.skipUntil(isRightHandSideListIndentedRecoveryToken);
                break;

            case ParsingContext.SymbolSet:
                this.skipUntil(isSymbolSetRecoveryToken);
                break;

            case ParsingContext.OneOfList:
                this.skipUntil(isOneOfListRecoveryToken);
                break;

            case ParsingContext.OneOfListIndented:
                this.skipUntil(isOneOfListIndentedRecoveryToken);
                break;

            case ParsingContext.OneOfSymbolList:
                this.skipUntil(isOneOfSymbolListRecoveryToken);
                break;

            case ParsingContext.NoSymbolHere:
                this.skipUntil(isNoSymbolHereRecoveryToken);
                break;
        }
    }

    private reportDiagnostics(): void {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics.Production_expected);
                break;

            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBracketToken]));
                break;

            case ParsingContext.SymbolSet:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBraceToken]));
                break;

            case ParsingContext.OneOfList:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.TerminalLiteral, "«line terminator»"]));
                break;

            case ParsingContext.OneOfListIndented:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.TerminalLiteral, "«dedent»"]));
                break;

            case ParsingContext.RightHandSideListIndented:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics.Production_expected);
                break;
        }
    }

    private tryStopParsingList() {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.token === SyntaxKind.EndOfFileToken;

            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                return this.token === SyntaxKind.CloseBracketToken;

            case ParsingContext.RightHandSideListIndented:
                return this.token === SyntaxKind.EndOfFileToken
                    || this.scanner.hasPrecedingDedent()
                    || this.scanner.hasPrecedingBlankLine();

            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.CloseBraceToken;

            case ParsingContext.OneOfList:
                return this.token === SyntaxKind.EndOfFileToken
                    || this.scanner.hasPrecedingLineTerminator();

            case ParsingContext.OneOfListIndented:
                // OneOfListIndented does not consume the closing token
                return this.token === SyntaxKind.EndOfFileToken
                    || this.scanner.hasPrecedingDedent()
                    || this.scanner.hasPrecedingBlankLine();

            case ParsingContext.OneOfSymbolList:
                return this.token !== SyntaxKind.OrKeyword;

            case ParsingContext.NoSymbolHere:
                // NoSymbolHere does not consume the closing token
                return this.token === SyntaxKind.HereKeyword;

            default:
                return failUnhandled(this.parsingContext);
        }
    }

    private tryMoveToNextElement(parsedPreviousElement: boolean) {
        switch (this.parsingContext) {
            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
            case ParsingContext.SymbolSet:
                return this.parseOptional(SyntaxKind.CommaToken);

            case ParsingContext.OneOfSymbolList:
            case ParsingContext.NoSymbolHere:
                return this.parseOptional(SyntaxKind.OrKeyword);

            case ParsingContext.SourceElements:
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
            case ParsingContext.RightHandSideListIndented:
                return parsedPreviousElement;

            default:
                return failUnhandled(this.parsingContext);
        }
    }

    private parseList<TParsingContext extends ParsingContext>(listContext: TParsingContext, result?: ListTypes[TParsingContext][]): ListTypes[TParsingContext][] | undefined {
        const saveContext = this.parsingContext;
        this.parsingContext = listContext;
        while (!this.isEOF()) {
            this.cancelToken?.throwIfSignaled();

            let parsed = false;
            if (this.isStartOfListElement()) {
                parsed = true;
                if (!result) {
                    result = [];
                }

                const element = this.parseElement(listContext);
                if (element) {
                    result.push(element);
                }
                else {
                    this.recover();
                }
            }

            if (this.tryStopParsingList()) break;
            if (!this.tryMoveToNextElement(parsed)) {
                const startPos = this.scanner.getStartPos();
                this.reportDiagnostics();
                this.recover();
                if (this.scanner.getStartPos() === startPos) throw new Error("Recovery failed to advance.");
            }
        }

        this.parsingContext = saveContext;
        return result;
    }

    private canBeIdentifier(kind: SyntaxKind): boolean {
        if (kind === SyntaxKind.Identifier) {
            return true;
        }

        return kind >= SyntaxKind.FirstKeyword && kind <= SyntaxKind.LastKeyword;
    }

    private parseIdentifier(): Identifier {
        const fullStart = this.scanner.getStartPos();
        const text = this.canBeIdentifier(this.token) ? this.readTokenValue(this.token) : undefined;
        const node = new Identifier(text);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterLiteral(): UnicodeCharacterLiteral {
        const fullStart = this.scanner.getStartPos();
        const text = this.readTokenText(SyntaxKind.UnicodeCharacterLiteral);
        const node = new UnicodeCharacterLiteral(text);
        return this.finishNode(node, fullStart);
    }

    private parseProse(greaterThanToken: Token<SyntaxKind.GreaterThanToken>): Prose {
        const fragments = this.parseProseFragments();
        const node = new Prose(greaterThanToken, fragments);
        this.finishNode(node, greaterThanToken.pos);
        return node;
    }

    private isStartOfParameter(): boolean {
        return this.canBeIdentifier(this.token);
    }

    private parseParameter(): Parameter {
        const fullStart = this.scanner.getStartPos();
        const name = this.parseIdentifier();
        const node = new Parameter(name);
        return this.finishNode(node, fullStart);
    }

    private parseParameterListTail(openToken: Token<SyntaxKind.OpenBracketToken>, parsingContext: ParsingContext.Parameters, closeTokenKind: SyntaxKind.CloseBracketToken): ParameterList {
        const elements = this.parseList(parsingContext);
        const closeToken = this.parseToken(closeTokenKind);
        const node = new ParameterList(openToken, elements, closeToken);
        return this.finishNode(node, openToken.pos);
    }

    private tryParseParameterList(): ParameterList | undefined {
        const openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
        if (openBracketToken) {
            return this.parseParameterListTail(openBracketToken, ParsingContext.Parameters, SyntaxKind.CloseBracketToken);
        }

        return undefined;
    }

    private parseOneOfList(oneKeyword: Token<SyntaxKind.OneKeyword>): OneOfList {
        const ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        const indented = this.scanner.hasPrecedingIndent();
        const terminals = this.parseList(indented ? ParsingContext.OneOfListIndented : ParsingContext.OneOfList);
        if (indented && !this.scanner.hasPrecedingDedent()) {
            this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, "«dedent»");
        }
        const node = new OneOfList(oneKeyword, ofKeyword, indented, terminals);
        return this.finishNode(node, oneKeyword.pos);
    }

    private parseSymbolSetTail(openBraceToken: Token<SyntaxKind.OpenBraceToken>): SymbolSet {
        const terminals = this.parseList(ParsingContext.SymbolSet);
        const closeBraceToken = this.parseToken(SyntaxKind.CloseBraceToken);
        const node = new SymbolSet(openBraceToken, terminals, closeBraceToken);
        return this.finishNode(node, openBraceToken.pos);
    }

    private parseSymbolSpanRestOrSymbolSet(): SymbolSpan | SymbolSet {
        const openBraceToken = this.parseToken(SyntaxKind.OpenBraceToken);
        if (openBraceToken) {
            return this.parseSymbolSetTail(openBraceToken);
        }
        else {
            return this.parseSymbolSpanRest();
        }
    }

    private parseEmptyAssertionTail(openBracketToken: Token<SyntaxKind.OpenBracketToken>, emptyKeyword: Token<SyntaxKind.EmptyKeyword>): EmptyAssertion {
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new EmptyAssertion(openBracketToken, emptyKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLookaheadAssertionTail(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lookaheadKeyword: Token<SyntaxKind.LookaheadKeyword>): LookaheadAssertion {
        const operatorToken = this.parseAnyToken(isLookaheadOperatorToken);
        const lookahead = this.parseSymbolSpanRestOrSymbolSet();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new LookaheadAssertion(openBracketToken, lookaheadKeyword, operatorToken, lookahead, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseNoSymbolHereAssertionTail(openBracketToken: Token<SyntaxKind.OpenBracketToken>, noKeyword: Token<SyntaxKind.NoKeyword>): NoSymbolHereAssertion {
        const symbols = this.parseList(ParsingContext.NoSymbolHere);
        const hereKeyword = this.parseToken(SyntaxKind.HereKeyword);
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new NoSymbolHereAssertion(openBracketToken, noKeyword, symbols, hereKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLexicalGoalAssertionTail(openBracketToken: Token<SyntaxKind.OpenBracketToken>, lexicalKeyword: Token<SyntaxKind.LexicalKeyword>): LexicalGoalAssertion {
        const goalKeyword = this.parseToken(SyntaxKind.GoalKeyword);
        const symbol = this.parseIdentifier();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new LexicalGoalAssertion(openBracketToken, lexicalKeyword, goalKeyword, symbol, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseInvalidAssertionTail(openBracketToken: Token<SyntaxKind.OpenBracketToken>): Assertion {
        this.skipUntil(isInvalidConstraintTailRecoveryToken);
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new InvalidAssertion(openBracketToken, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseAssertion(openBracketToken: Token<SyntaxKind.OpenBracketToken>): Assertion {
        const emptyKeyword = this.parseToken(SyntaxKind.EmptyKeyword);
        if (emptyKeyword) {
            return this.parseEmptyAssertionTail(openBracketToken, emptyKeyword);
        }

        const lookaheadKeyword = this.parseToken(SyntaxKind.LookaheadKeyword);
        if (lookaheadKeyword) {
            return this.parseLookaheadAssertionTail(openBracketToken, lookaheadKeyword);
        }

        const noKeyword = this.parseToken(SyntaxKind.NoKeyword);
        if (noKeyword) {
            return this.parseNoSymbolHereAssertionTail(openBracketToken, noKeyword);
        }

        const lexicalKeyword = this.parseToken(SyntaxKind.LexicalKeyword);
        if (lexicalKeyword) {
            return this.parseLexicalGoalAssertionTail(openBracketToken, lexicalKeyword);
        }

        return this.parseInvalidAssertionTail(openBracketToken);
    }

    private parseProseAssertion(openBracketToken: Token<SyntaxKind.OpenBracketGreaterThanToken>): ProseAssertion {
        const fragments = this.parseProseFragments();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new ProseAssertion(openBracketToken, fragments, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseProseFragments() {
        let fragments: (ProseFragmentLiteral | Terminal | Nonterminal)[] | undefined;
        while (this.token) {
            if (this.token === SyntaxKind.ProseFull) {
                if (!fragments) fragments = [];
                fragments.push(this.parseProseFragmentLiteral(this.token));
                break;
            }
            else if (this.token >= SyntaxKind.FirstProseFragmentLiteral && this.token <= SyntaxKind.LastProseFragmentLiteral) {
                if (!fragments) fragments = [];
                fragments.push(this.parseProseFragmentLiteral(this.token));
            }
            else if (this.token === SyntaxKind.TerminalLiteral) {
                if (!fragments) fragments = [];
                fragments.push(this.parseTerminal(/*allowOptional*/ false));
            }
            else if (this.token === SyntaxKind.Identifier) {
                if (!fragments) fragments = [];
                fragments.push(this.parseNonterminal(/*allowArgumentList*/ false, /*allowOptional*/ false));
            }
            else {
                break;
            }
        }

        return fragments;
    }

    private parseProseFragmentLiteral(token: SyntaxKind) {
        const fullStart = this.scanner.getStartPos();
        const text = this.readTokenValue(token);
        const node = new ProseFragmentLiteral(token, text);
        return this.finishNode(node, fullStart);
    }

    private parseTerminalLiteral(): TerminalLiteral {
        const fullStart = this.scanner.getStartPos();
        const text = this.readTokenValue(SyntaxKind.TerminalLiteral);
        const node = new TerminalLiteral(text);
        return this.finishNode(node, fullStart);
    }

    private parseTerminal(allowOptional: boolean): Terminal {
        const fullStart = this.scanner.getStartPos();
        const literal = this.parseTerminalLiteral();
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        const node = new Terminal(literal, questionToken);
        return this.finishNode(node, fullStart);
    }

    private isStartOfArgument(): boolean {
        return isLeadingArgumentToken(this.token)
            || this.canBeIdentifier(this.token);
    }

    private parseArgument(): Argument {
        const fullStart = this.scanner.getStartPos();
        const operatorToken = this.parseAnyToken(isLeadingArgumentToken);
        const name = this.parseIdentifier();
        const node = new Argument(operatorToken, name);
        return this.finishNode(node, fullStart);
    }

    private parseArgumentListTail(openToken: Token<SyntaxKind.OpenBracketToken>, parsingContext: ParsingContext.Arguments, closeTokenKind: SyntaxKind.CloseBracketToken): ArgumentList {
        const elements = this.parseList(parsingContext);
        const closeToken = this.parseToken(closeTokenKind);
        const node = new ArgumentList(openToken, elements, closeToken);
        this.finishNode(node, openToken.pos);
        return node;
    }

    private tryParseArgumentList(): ArgumentList | undefined {
        if (this.scanner.hasPrecedingLineTerminator() && !this.scanner.isLineContinuation()) return undefined;
        if (this.isStartOfArgumentList()) {
            const openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
            if (openBracketToken) {
                return this.parseArgumentListTail(openBracketToken, ParsingContext.Arguments, SyntaxKind.CloseBracketToken);
            }
        }

        return undefined;
    }

    private isStartOfArgumentList(): boolean {
        if (this.token === SyntaxKind.OpenBracketToken) {
            return this.lookahead(() => this.nextTokenIsArgument());
        }

        return false;
    }

    private nextTokenIsArgument(): boolean {
        this.nextToken();
        return isLeadingArgumentToken(this.token)
            || this.token === SyntaxKind.Identifier;
    }

    private parseNonterminal(allowArgumentList: boolean, allowOptional: boolean): Nonterminal {
        const fullStart = this.scanner.getStartPos();
        const name = this.parseIdentifier();
        const argumentList = allowArgumentList ? this.tryParseArgumentList() : undefined;
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        const node = new Nonterminal(name, argumentList, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseOneOfSymbol(oneKeyword: Token<SyntaxKind.OneKeyword>): OneOfSymbol {
        const ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        const symbols = this.parseList(ParsingContext.OneOfSymbolList);
        const node = new OneOfSymbol(oneKeyword, ofKeyword, symbols);
        this.finishNode(node, oneKeyword.pos);
        return node;
    }

    private parsePlaceholderSymbol(placeholderToken: Token<SyntaxKind.AtToken>): LexicalSymbol {
        const node = new PlaceholderSymbol(placeholderToken);
        this.finishNode(node, placeholderToken.pos);
        return node;
    }

    private parseInvalidSymbol(): LexicalSymbol {
        const fullStart = this.scanner.getStartPos();
        const node = new InvalidSymbol();
        this.skipUntil(isInvalidSymbolRecoveryToken);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterRangeOrHigher(allowOptional: boolean): Terminal | UnicodeCharacterRange {
        const fullStart = this.scanner.getStartPos();
        const literal = this.parseUnicodeCharacterLiteral();
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        if (!allowOptional) {
            const throughKeyword = this.parseToken(SyntaxKind.ThroughKeyword);
            if (throughKeyword) {
                return this.parseUnicodeCharacterRangeTail(literal, throughKeyword);
            }
        }
        const node = new Terminal(literal, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterRangeTail(left: UnicodeCharacterLiteral, throughKeyword: Token<SyntaxKind.ThroughKeyword>): UnicodeCharacterRange {
        const right = this.parseUnicodeCharacterLiteral();
        const node = new UnicodeCharacterRange(left, throughKeyword, right);
        this.finishNode(node, left.pos);
        return node;
    }

    private parsePrimarySymbol(allowOptional: boolean): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
                return this.parseUnicodeCharacterRangeOrHigher(allowOptional);

            case SyntaxKind.TerminalLiteral:
                return this.parseTerminal(allowOptional);

            case SyntaxKind.Identifier:
                return this.parseNonterminal(/*allowArgumentList*/ true, allowOptional);
        }

        const placeholderToken = this.parseToken(SyntaxKind.AtToken);
        if (placeholderToken) {
            return this.parsePlaceholderSymbol(placeholderToken);
        }

        return this.parseInvalidSymbol();
    }

    private parseUnarySymbol(): LexicalSymbol {
        const oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        if (oneKeyword) {
            return this.parseOneOfSymbol(oneKeyword);
        }

        return this.parsePrimarySymbol(/*allowOptional*/ true);
    }

    private parseButNotSymbolTail(left: LexicalSymbol, butKeyword: Token<SyntaxKind.ButKeyword> | undefined, notKeyword: Token<SyntaxKind.NotKeyword> | undefined): ButNotSymbol {
        const right = this.parseSymbol();
        const node = new ButNotSymbol(left, butKeyword, notKeyword, right);
        this.finishNode(node, left.pos);
        return node;
    }

    private parseSymbol(): LexicalSymbol {
        const openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
        if (openBracketToken) {
            return this.parseAssertion(openBracketToken);
        }

        const openBracketGreaterThanToken = this.parseToken(SyntaxKind.OpenBracketGreaterThanToken);
        if (openBracketGreaterThanToken) {
            return this.parseProseAssertion(openBracketGreaterThanToken);
        }

        const symbol = this.parseUnarySymbol();
        const butKeyword = this.parseToken(SyntaxKind.ButKeyword);
        const notKeyword = this.parseToken(SyntaxKind.NotKeyword);
        if (butKeyword || notKeyword) {
            return this.parseButNotSymbolTail(symbol, butKeyword, notKeyword);
        }

        return symbol;
    }

    private tryParseSymbolSpan(): SymbolSpan | undefined {
        if (this.isStartOfSymbolSpanOnSameLine()) {
            return this.parseSymbolSpanRest();
        }

        return undefined;
    }

    private parseSymbolSpanRest(): SymbolSpan {
        const fullStart = this.scanner.getStartPos();
        const symbol = this.parseSymbol();
        const next = this.tryParseSymbolSpan();
        const node = new SymbolSpan(symbol, next);
        return this.finishNode(node, fullStart);
    }

    private parseSymbolSpan(): SymbolSpan {
        const greaterThanToken = this.parseToken(SyntaxKind.GreaterThanToken);
        if (greaterThanToken) {
            const symbol = this.parseProse(greaterThanToken);
            const node = new SymbolSpan(symbol, /*next*/ undefined);
            this.finishNode(node, greaterThanToken.pos);
            return node;
        }
        else {
            return this.parseSymbolSpanRest();
        }
    }

    private isStartOfSymbolSpanOnSameLine(): boolean {
        return (!this.scanner.hasPrecedingLineTerminator() || this.scanner.isLineContinuation())
            && this.isStartOfSymbolSpan();
    }

    private isStartOfSymbolSpan(): boolean {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
            case SyntaxKind.TerminalLiteral:
            case SyntaxKind.Identifier:
            case SyntaxKind.OpenBracketToken:
            case SyntaxKind.OpenBracketGreaterThanToken:
            case SyntaxKind.GreaterThanToken:
            case SyntaxKind.AtToken:
                return true;

            default:
                return false;
        }
    }

    private isStartOfRightHandSide(): boolean {
        return this.isStartOfSymbolSpan();
    }

    private parseLinkReference(): LinkReference | undefined {
        if (this.token === SyntaxKind.LinkReference) {
            const fullStart = this.scanner.getStartPos();
            const text = this.readTokenValue(SyntaxKind.LinkReference);
            const node = new LinkReference(text);
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private nextTokenIsParameterOperatorToken() {
        this.nextToken();
        return isParameterOperatorToken(this.token);
    }

    private tryParseConstraints(): Constraints | undefined {
        if (this.token === SyntaxKind.OpenBracketToken &&
            this.lookahead(() => this.nextTokenIsParameterOperatorToken())) {
            const openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken)!;
            const elements = this.parseList(ParsingContext.Arguments);
            const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
            const node = new Constraints(openBracketToken, elements, closeBracketToken);
            return this.finishNode(node, openBracketToken.pos);
        }
    }

    private parseRightHandSide(): RightHandSide {
        const fullStart = this.scanner.getStartPos();
        const constraints = this.tryParseConstraints();
        const head = constraints ? this.tryParseSymbolSpan() : this.parseSymbolSpan();
        const reference = this.parseLinkReference();
        const node = new RightHandSide(constraints, head, reference);
        return this.finishNode(node, fullStart);
    }

    private parseRightHandSideList(): RightHandSideList {
        const fullStart = this.scanner.getStartPos();
        const elements = this.scanner.hasPrecedingIndent() && this.parseList(ParsingContext.RightHandSideListIndented) || [];
        const node = new RightHandSideList(elements);
        return this.finishNode(node, fullStart);
    }

    private parseBody(): OneOfList | RightHandSide | RightHandSideList {
        const oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        if (oneKeyword) {
            return this.parseOneOfList(oneKeyword);
        }
        if (this.scanner.hasPrecedingLineTerminator()) {
            return this.parseRightHandSideList();
        }
        else {
            return this.parseRightHandSide();
        }
    }

    private parseProduction(): Production {
        const fullStart = this.scanner.getStartPos();
        const name = this.parseIdentifier();
        const parameters = this.tryParseParameterList();
        const colonToken = this.parseAnyToken(isProductionSeparatorToken);
        const body = this.parseBody();
        const node = new Production(name, parameters, colonToken, body);
        return this.finishNode(node, fullStart);
    }

    private parseStringLiteral(): StringLiteral | undefined {
        if (this.token === SyntaxKind.StringLiteral) {
            const fullStart = this.scanner.getStartPos();
            const text = this.scanner.getTokenValue();
            const node = new StringLiteral(text);
            this.nextToken();
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseNumberLiteral(): NumberLiteral | undefined {
        if (this.token === SyntaxKind.NumberLiteral) {
            const fullStart = this.scanner.getStartPos();
            const text = this.scanner.getTokenValue();
            const node = new NumberLiteral(text);
            this.nextToken();
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseMetaElement(atToken: Token<SyntaxKind.AtToken>): MetaElement | undefined {
        const importKeyword = this.parseToken(SyntaxKind.ImportKeyword);
        if (importKeyword) {
            return this.parseImport(atToken, importKeyword);
        }

        const defineKeyword = this.parseToken(SyntaxKind.DefineKeyword);
        if (defineKeyword) {
            return this.parseDefine(atToken, defineKeyword);
        }

        const lineKeyword = this.parseToken(SyntaxKind.LineKeyword);
        if (lineKeyword) {
            return this.parseLine(atToken, lineKeyword);
        }

        this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.ImportKeyword, SyntaxKind.DefineKeyword, SyntaxKind.LineKeyword]));
        return undefined;
    }

    private parseImport(atToken: Token<SyntaxKind.AtToken>, importKeyword: Token<SyntaxKind.ImportKeyword>): Import {
        const path = this.parseStringLiteral();
        const node = new Import(atToken, importKeyword, path);
        this.finishNode(node, atToken.pos);
        if (node.path && node.path.text) this.imports.push(node.path.text);
        return node;
    }

    private parseDefine(atToken: Token<SyntaxKind.AtToken>, defineKeyword: Token<SyntaxKind.DefineKeyword>): Define {
        const key = this.parseIdentifier();
        const valueToken = this.parseAnyToken(isBooleanLiteralToken) || this.parseToken(SyntaxKind.DefaultKeyword);
        const node = new Define(atToken, defineKeyword, key, valueToken);
        this.finishNode(node, atToken.pos);
        return node;
    }

    private parseLine(atToken: Token<SyntaxKind.AtToken>, lineKeyword: Token<SyntaxKind.LineKeyword>): Line {
        const defaultKeyword = this.parseToken(SyntaxKind.DefaultKeyword);
        const number = !defaultKeyword ? this.parseNumberLiteral() : undefined;
        const path = !defaultKeyword ? this.parseStringLiteral() : undefined;
        const node = new Line(atToken, lineKeyword, defaultKeyword || number, path);
        this.finishNode(node, atToken.pos);
        return node;
    }

    private isStartOfSourceElement(): boolean {
        if (this.scanner.isIndented()) return false;
        switch (this.token) {
            case SyntaxKind.AtToken: // Import
            case SyntaxKind.Identifier: // Production
                return true;

            case SyntaxKind.ColonToken:
            case SyntaxKind.ColonColonToken:
            case SyntaxKind.ColonColonColonToken:
            case SyntaxKind.OpenParenToken:
                // Assume we're parsing a production for error recovery purposes
                return true;

            default:
                return false;
        }
    }

    private parseSourceElement(): SourceElement | undefined {
        let node: SourceElement | undefined;
        if (this.token === SyntaxKind.Identifier) {
            node = this.parseProduction();
        }
        else {
            const atToken = this.parseToken(SyntaxKind.AtToken);
            if (atToken) {
                node = this.parseMetaElement(atToken);
            }
        }
        if (node) {
            this.scanner.resetIndent();
            return node;
        }
        this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics.Unexpected_token_0_, tokenToString(this.token));
        return undefined;
    }

    private parseSourceElementList(elements?: SourceElement[]): SourceElement[] | undefined {
        return this.parseList(ParsingContext.SourceElements, elements);
    }
}

function isSourceElementsRecoveryToken(scanner: Scanner) {
    return scanner.hasPrecedingDedent()
        || scanner.hasPrecedingBlankLine();
}

function isAnyParametersRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseParenToken
        || token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.ColonToken
        || token === SyntaxKind.ColonColonToken
        || token === SyntaxKind.ColonColonColonToken
        || scanner.hasPrecedingDedent()
        || scanner.hasPrecedingBlankLine()
        || scanner.hasPrecedingLineTerminator() && !scanner.isLineContinuation();
}

function isAnyArgumentsRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseParenToken
        || token === SyntaxKind.CloseBracketToken
        || scanner.hasPrecedingDedent()
        || scanner.hasPrecedingBlankLine()
        || (scanner.hasPrecedingLineTerminator() && !scanner.isLineContinuation());
}

function isRightHandSideListIndentedRecoveryToken(scanner: Scanner) {
    return scanner.hasPrecedingDedent()
        || scanner.hasPrecedingBlankLine()
        || scanner.hasPrecedingLineTerminator() && !scanner.isLineContinuation();
}

function isSymbolSetRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.TerminalLiteral
        || token === SyntaxKind.CloseBraceToken
        || scanner.hasPrecedingLineTerminator() && !scanner.isLineContinuation();
}

function isOneOfListRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.TerminalLiteral
        || scanner.hasPrecedingLineTerminator();
}

function isOneOfListIndentedRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.TerminalLiteral
        || scanner.hasPrecedingLineTerminator();
}

function isOneOfSymbolListRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.OrKeyword
        || token === SyntaxKind.TerminalLiteral
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.OpenBracketToken
        || token === SyntaxKind.QuestionToken
        || scanner.hasPrecedingLineTerminator();
}

function isNoSymbolHereRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.OrKeyword
        || token === SyntaxKind.HereKeyword
        || token === SyntaxKind.TerminalLiteral
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.QuestionToken
        || scanner.hasPrecedingLineTerminator();
}

function isInvalidSymbolRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.OpenBracketToken
        || token === SyntaxKind.TerminalLiteral
        || token === SyntaxKind.Identifier
        || scanner.hasPrecedingLineTerminator();
}

function isInvalidConstraintTailRecoveryToken(scanner: Scanner) {
    const token = scanner.getToken();
    return token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.TerminalLiteral
        || scanner.hasPrecedingLineTerminator();
}

function isProductionSeparatorToken(token: SyntaxKind): token is ProductionSeperatorKind {
    return token === SyntaxKind.ColonToken
        || token === SyntaxKind.ColonColonToken
        || token === SyntaxKind.ColonColonColonToken;
}

function isLeadingArgumentToken(token: SyntaxKind): token is ArgumentOperatorKind {
    return token === SyntaxKind.QuestionToken
        || token === SyntaxKind.PlusToken
        || token === SyntaxKind.TildeToken;
}

function isParameterOperatorToken(token: SyntaxKind): token is ParameterOperatorKind {
    return token === SyntaxKind.PlusToken
        || token === SyntaxKind.TildeToken;
}

function isBooleanLiteralToken(token: SyntaxKind): token is SyntaxKind.TrueKeyword | SyntaxKind.FalseKeyword {
    return token === SyntaxKind.TrueKeyword
        || token === SyntaxKind.FalseKeyword;
}

function isLookaheadOperatorToken(token: SyntaxKind): token is LookaheadOperatorKind {
    return token === SyntaxKind.EqualsToken
        || token === SyntaxKind.EqualsEqualsToken
        || token === SyntaxKind.ExclamationEqualsToken
        || token === SyntaxKind.NotEqualToToken
        || token === SyntaxKind.LessThanMinusToken
        || token === SyntaxKind.ElementOfToken
        || token === SyntaxKind.LessThanExclamationToken
        || token === SyntaxKind.NotAnElementOfToken;
}

function matched(possibleOpenTag: Trivia, possibleCloseTag: Trivia) {
    return possibleOpenTag.kind === SyntaxKind.HtmlOpenTagTrivia
        && possibleCloseTag.kind === SyntaxKind.HtmlCloseTagTrivia
        && possibleOpenTag.tagName === possibleCloseTag.tagName;
}

// remove empty html trivia
function trimTrivia(trivia: Trivia[] | undefined) {
    let result: Trivia[] | undefined;
    if (trivia) {
        let right: Trivia | undefined;
        for (let i = 0; i < trivia.length - 1; i++) {
            const left = trivia[i];
            right = trivia[i + 1];
            if (matched(left, right)) {
                result ||= trivia.slice(0, i);
                right = undefined;
            }
            else {
                result?.push(left);
            }
        }
        if (right) result?.push(right);
    }
    return result || trivia;
}

function splitTrivia(triviaArray: readonly Trivia[], hasFollowingLineTerminator: boolean): { trailingEnd: number, leadingStart: number } {
    // Leading trivia is trivia that belongs to the beginning of the node:
    //
    // - An HTML close tag trivia, or any trivia preceding an HTML close tag trivia, is not leading trivia of the node.
    // - An HTML open tag trivia, and any trivia following an HTML open tag trivia, is leading trivia of the node.
    // - If the node has a preceding line break, then
    //   - Any other non-HTML tag trivia on the same line as the node that precedes the node is leading trivia of the node.
    //   - Any other non-HTML tag trivia on a line that precedes the node, but not preceding a blank line, is leading trivia of the node.
    // - Otherwise,
    //   - Any other non-HTML tag trivia on the same line as the node that precedes the node is leading trivia, if there is no whitespace between
    //     that trivia and the node.

    // Trailing trivia is trivia that belongs to the end of the node:
    //
    // - An HTML open tag trivia, or any trivia following an HTML open tag trivia, is not trailing trivia of the node.
    // - An HTML close tag trivia, and any trivia preceding an HTML close tag trivia, is trailing trivia of the node.
    // - If the node has a trailing line break, then
    //   - Any other non-HTML tag trivia on the same line as the node that follows the node is trailing trivia of the node.
    //   - Any other non-HTML tag trivia on a line that follows the node, but not following a blank line, is trailing trivia of the node.
    // - Otherwise,
    //   - Any other non-HTML tag trivia on the same line as the node that follows the node is trailing trivia, if there is no whitespace between
    //     that trivia and the node.

    // Detached trivia is any trivia that occurs prior to the node that is not the leading or trailing trivia of this
    // or any other node.

    if (!triviaArray.length) return { trailingEnd: 0, leadingStart: 0 };

    let hasLineTerminator = hasFollowingLineTerminator; // Used by all trivia to determine whether to break on blank lines or whitespace.

    let lastHtmlCloseTagIndex = -1; // Used by leading/detached trivia to exclude trivia at or before this index.
                                    // Used by trailing trivia to include trivia at or before this index.
    let lastFollowingBlankLineIndex = -1; // Used by leading/detached trivia to exclude trivia at or before this index.
    let lastFollowingWhiteSpaceIndex = -1; // Used by leading/detached trivia to exclude trivia at or before this index.
    let firstHtmlOpenTagIndex = -1; // Used by trailing trivia to exclude trivia at or after this index.
                                    // Used by leading/detached trivia to include trivia at or after this index.
    let firstPrecedingBlankLineIndex = -1; // Used by trailing trivia to exclude trivia at or after this index.
    let firstPrecedingWhiteSpaceIndex = -1; // Used by trailing trivia to exclude trivia at or after this index.

    for (let i = 0; i < triviaArray.length; i++) {
        const trivia = triviaArray[i];
        if (trivia.hasPrecedingLineTerminator || trivia.hasFollowingLineTerminator) {
            hasLineTerminator = true;
        }

        if (trivia.hasPrecedingBlankLine) {
            // trailing trivia will stop before this trivia, unless
            // it is followed by an HTML close tag trivia.
            if (firstPrecedingBlankLineIndex === -1) firstPrecedingBlankLineIndex = i;
        }
        else if (trivia.hasPrecedingWhiteSpace) {
            // trailing trivia will stop before this trivia, unless
            // it is followed by an HTML close tag trivia.
            if (firstPrecedingWhiteSpaceIndex === -1) firstPrecedingWhiteSpaceIndex = i;
        }

        if (trivia.kind === SyntaxKind.HtmlCloseTagTrivia) {
            // leading/detached trivia will start after this trivia
            lastHtmlCloseTagIndex = i;

            // trailing trivia will include this trivia and all trivia that
            // precedes it
            firstPrecedingBlankLineIndex = -1;
            firstPrecedingWhiteSpaceIndex = -1;
        }
        else if (trivia.kind === SyntaxKind.HtmlOpenTagTrivia) {
            // trailing trivia will stop before this trivia
            if (firstHtmlOpenTagIndex === -1) firstHtmlOpenTagIndex = i;
        }

        if (trivia.hasFollowingBlankLine) {
            // leading trivia will start after this trivia, unless
            // it is preceded by an HTML open tag trivia
            if (firstHtmlOpenTagIndex === -1) {
                lastFollowingBlankLineIndex = i;
            }
        }
        else if (trivia.hasFollowingWhiteSpace) {
            // leading trivia will start after this trivia, unless
            // it is preceded by an HTML open tag trivia
            if (firstHtmlOpenTagIndex === -1) {
                lastFollowingWhiteSpaceIndex = i;
            }
        }
    }

    // Used by leading/detached trivia to exclude trivia at or before this index.
    const lastFollowingBreakIndex = hasLineTerminator ? lastFollowingBlankLineIndex : lastFollowingWhiteSpaceIndex;

    // Used by trailing trivia to exclude trivia at or after this index.
    const firstPrecedingBreakIndex = hasLineTerminator ? firstPrecedingBlankLineIndex : firstPrecedingWhiteSpaceIndex;

    let trailingEnd = 0; // exclusive
    if (lastHtmlCloseTagIndex !== -1) trailingEnd = lastHtmlCloseTagIndex + 1;
    if (firstPrecedingBreakIndex !== -1) trailingEnd = firstPrecedingBreakIndex;

    let leadingStart = triviaArray.length; // inclusive
    if (firstHtmlOpenTagIndex !== -1) leadingStart = firstHtmlOpenTagIndex;
    if (lastFollowingBreakIndex > 1) leadingStart = lastFollowingBreakIndex - 1;

    return { trailingEnd, leadingStart };
}

function attachTrivia(node: Node, leadingTrivia: Trivia[] | undefined, trailingTrivia: Trivia[] | undefined, hasFollowingLineTerminator: boolean) {
    if (leadingTrivia?.length) {
        const { trailingEnd, leadingStart } = splitTrivia(leadingTrivia, /*hasFollowingLineTerminator*/ false);

        let nodeLeadingTrivia: Trivia[] | undefined;
        let nodeDetachedTrivia: Trivia[] | undefined;
        for (let i = leadingTrivia.length - 1; i >= trailingEnd; i--) {
            const trivia = leadingTrivia.pop();
            if (!trivia) break;

            if (i >= leadingStart) {
                (nodeLeadingTrivia ||= []).unshift(trivia);
            }
            else if (i >= trailingEnd) {
                (nodeDetachedTrivia ||= []).unshift(trivia);
            }
        }

        if (nodeDetachedTrivia) getNodeAccessor().setDetachedTrivia(node, nodeDetachedTrivia);
        if (nodeLeadingTrivia) getNodeAccessor().setLeadingTrivia(node, nodeLeadingTrivia);
    }

    if (trailingTrivia?.length) {
        const { trailingEnd } = splitTrivia(trailingTrivia, hasFollowingLineTerminator);

        let nodeTrailingTrivia: Trivia[] | undefined;
        for (let i = 0; i < trailingEnd; i++) {
            const trivia = trailingTrivia.shift();
            if (!trivia) break;

            (nodeTrailingTrivia ||= node.trailingTrivia?.slice() || []).push(trivia);
        }

        if (nodeTrailingTrivia) getNodeAccessor().setTrailingTrivia(node, nodeTrailingTrivia);
    }
}

function promoteTrivia(parent: Node, firstChild: Node | undefined, lastChild: Node | undefined) {
    if (firstChild && firstChild === lastChild && parent.pos === firstChild.pos && parent.end === firstChild.end && parent.kind !== SyntaxKind.RightHandSideList) {
        promoteAllTrivia(parent, firstChild);
    }
    else {
        if (firstChild && parent.pos === firstChild.pos) promoteLeadingTrivia(parent, firstChild);
        if (lastChild && parent.end === lastChild.end) promoteTrailingTrivia(parent, lastChild);
    }
}

function promoteLeadingTrivia(parent: Node, firstChild: Node) {
    if (firstChild.detachedTrivia) {
        getNodeAccessor().setDetachedTrivia(parent, concat(parent.detachedTrivia?.slice(), firstChild.detachedTrivia.slice()));
        getNodeAccessor().setDetachedTrivia(firstChild, undefined);
    }

    let firstChildLeadingTrivia = firstChild.leadingTrivia?.slice();
    let firstChildTrailingTrivia = firstChild.trailingTrivia?.slice();
    let parentLeadingTrivia: Trivia[] | undefined;
    if (firstChildLeadingTrivia) {
        if (firstChildTrailingTrivia) {
            let leadingTag = firstChildLeadingTrivia.shift();
            let trailingTag = firstChildTrailingTrivia.pop();
            while (leadingTag && (!trailingTag || !matched(leadingTag, trailingTag))) {
                (parentLeadingTrivia ||= parent.leadingTrivia?.slice() || []).push(leadingTag);
                leadingTag = firstChildLeadingTrivia.shift();
            }
            if (leadingTag) firstChildLeadingTrivia.unshift(leadingTag);
            if (trailingTag) firstChildTrailingTrivia.unshift(trailingTag);
        }
        else {
            parentLeadingTrivia = concat(parent.leadingTrivia?.slice(), firstChildLeadingTrivia);
            firstChildLeadingTrivia = undefined;
        }
    }

    getNodeAccessor().setLeadingTrivia(firstChild, firstChildLeadingTrivia);
    getNodeAccessor().setTrailingTrivia(firstChild, firstChildTrailingTrivia);
    if (parentLeadingTrivia) getNodeAccessor().setLeadingTrivia(parent, parentLeadingTrivia);
}

function promoteTrailingTrivia(parent: Node, lastChild: Node) {
    let lastChildTrailingTrivia = lastChild.trailingTrivia?.slice();
    let lastChildLeadingTrivia = lastChild.leadingTrivia?.slice();
    let parentTrailingTrivia: Trivia[] | undefined;
    if (lastChildTrailingTrivia) {
        if (lastChildLeadingTrivia) {
            let leadingTag = lastChildLeadingTrivia.shift();
            let trailingTag = lastChildTrailingTrivia.pop();
            while (trailingTag && (!leadingTag || !matched(leadingTag, trailingTag))) {
                (parentTrailingTrivia ||= parent.trailingTrivia?.slice() || []).unshift(trailingTag);
                trailingTag = lastChildTrailingTrivia.pop();
            }
            if (leadingTag) lastChildLeadingTrivia.unshift(leadingTag);
            if (trailingTag) lastChildTrailingTrivia.unshift(trailingTag);
        }
        else {
            parentTrailingTrivia = concat(lastChildTrailingTrivia, parent.trailingTrivia?.slice());
            lastChildTrailingTrivia = undefined;
        }
    }

    getNodeAccessor().setTrailingTrivia(lastChild, lastChildTrailingTrivia);
    getNodeAccessor().setLeadingTrivia(lastChild, lastChildLeadingTrivia);
    if (parentTrailingTrivia) getNodeAccessor().setTrailingTrivia(parent, parentTrailingTrivia);
}

function promoteAllTrivia(parent: Node, onlyChild: Node) {
    if (onlyChild.detachedTrivia) {
        getNodeAccessor().setDetachedTrivia(parent, concat(parent.detachedTrivia?.slice(), onlyChild.detachedTrivia.slice()));
        getNodeAccessor().setDetachedTrivia(onlyChild, undefined);
    }

    if (onlyChild.leadingTrivia) {
        getNodeAccessor().setLeadingTrivia(parent, concat(parent.leadingTrivia?.slice(), onlyChild.leadingTrivia.slice()));
        getNodeAccessor().setLeadingTrivia(onlyChild, undefined);
    }

    if (onlyChild.trailingTrivia) {
        getNodeAccessor().setTrailingTrivia(parent, concat(onlyChild.trailingTrivia.slice(), parent.trailingTrivia?.slice()));
        getNodeAccessor().setTrailingTrivia(onlyChild, undefined);
    }
}

function failUnhandled(value: never): never {
    throw new Error("Unhandled case: " + value);
}