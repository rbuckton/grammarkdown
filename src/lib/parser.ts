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
import { Range, Position, TextRange } from "./core";
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages, LineMap, formatList } from "./diagnostics";
import { SyntaxKind, tokenToString } from "./tokens";
import { Scanner } from "./scanner";
import {
    Node,
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
    EmptyAssertion,
    LookaheadAssertion,
    NoSymbolHereAssertion,
    LexicalGoalAssertion,
    ParameterValueAssertion,
    ProseAssertion,
    ProseFragmentLiteral,
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    LexicalSymbol,
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
    SourceElement
} from "./nodes";
import { NodeNavigator } from "./navigator";

enum ParsingContext {
    SourceElements,
    Parameters,
    BracketedParameters,
    Arguments,
    BracketedArguments,
    RightHandSideListIndented,
    SymbolSet,
    OneOfList,
    OneOfListIndented,
    OneOfSymbolList,
    NoSymbolHere
}

enum SkipWhitespace {
    None = 0,
    LineTerminator = 0x1,
    Indentation = 0x2,
    All = LineTerminator | Indentation,
}

export class TextChange {
    range: Range;
    text: string;
}

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

export class Parser {
    private scanner: Scanner;
    private token: SyntaxKind;
    private sourceFile: SourceFile;
    private diagnostics: DiagnosticMessages;
    private parsingContext: ParsingContext;
    private previousSourceFile: SourceFile;

    constructor(diagnostics: DiagnosticMessages) {
        this.diagnostics = diagnostics;
    }

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

    public parseSourceFile(filename: string, text: string): SourceFile {
        return this.parse(filename, text, /*previousSourceFile*/ undefined, /*changeRange*/ undefined);
    }

    private parse(filename: string, text: string, previousSourceFile: SourceFile, changeRange: TextRange) {
        this.sourceFile = new SourceFile(filename, text);
        this.diagnostics.setSourceFile(this.sourceFile);
        this.scanner = new Scanner(filename, text, this.diagnostics);
        this.parsingContext = ParsingContext.SourceElements;

        this.nextToken();
        this.sourceFile.elements = this.parseSourceElementList() || [];

        const imports: string[] = [];
        for (const element of this.sourceFile.elements) {
            if (element.kind === SyntaxKind.Import) {
                const importNode = <Import>element;
                if (importNode.path) {
                    imports.push(importNode.path.text);
                }
            }
        }

        this.sourceFile.imports = imports;
        return this.sourceFile;
    }

    private nextToken(): SyntaxKind {
        return this.token = this.scanner.scan();
    }

    private lookahead<T>(callback: () => T): T {
        return this.speculate(callback, /*isLookahead*/ true);
    }

    private tryParse<T>(callback: () => T): T {
        return this.speculate(callback, /*isLookahead*/ false);
    }

    private speculate<T>(callback: () => T, isLookahead: boolean): T {
        const saveToken = this.token;
        const saveParsingContext = this.parsingContext;
        const saveDiagnostics = this.diagnostics;

        this.diagnostics = NullDiagnosticMessages.instance;
        const result = this.scanner.speculate(callback, isLookahead);

        this.diagnostics = saveDiagnostics;
        if (!result || isLookahead) {
            this.token = saveToken;
            this.parsingContext = saveParsingContext;
        }

        return result;
    }

    private isWhitespace(skip: SkipWhitespace = SkipWhitespace.All): boolean {
        switch (this.token) {
            case SyntaxKind.LineTerminatorToken:
                return !!(skip & SkipWhitespace.LineTerminator);

            case SyntaxKind.IndentToken:
            case SyntaxKind.DedentToken:
                return !!(skip & SkipWhitespace.Indentation);

            default:
                return false;
        }
    }

    private isEOF(): boolean {
        return this.token === SyntaxKind.EndOfFileToken;
    }

    private skipUntil(isRecoveryToken: (token: SyntaxKind) => boolean): void {
        while (!isRecoveryToken(this.token) && !this.isEOF()) {
            this.nextToken();
        }
    }

    private skipWhitespace(skip: SkipWhitespace = SkipWhitespace.All): void {
        while (this.isWhitespace(skip)) {
            this.nextToken();
        }
    }

    private readTokenValue(token: SyntaxKind): string {
        if (this.token === token) {
            const text = this.scanner.getTokenValue();
            this.nextToken();
            return text;
        }

        return undefined;
    }

    private readTokenText(token: SyntaxKind): string {
        if (this.token === token) {
            const text = this.scanner.getTokenText();
            this.nextToken();
            return text;
        }

        return undefined;
    }

    private finishNode<TNode extends Node>(node: TNode, fullStart: number): TNode {
        if (node) {
            node.pos = fullStart;
            node.end = this.scanner.getStartPos();
        }

        return node;
    }

    private parseToken(token: SyntaxKind): Node {
        if (this.token === token) {
            const fullStart = this.scanner.getTokenPos();
            this.nextToken();
            return this.finishNode(new Node(token), fullStart);
        }

        return undefined;
    }

    private parseAnyToken(predicate: (token: SyntaxKind) => boolean): Node {
        if (predicate(this.token)) {
            const fullStart = this.scanner.getTokenPos();
            const node = new Node(this.token);
            this.nextToken();
            return this.finishNode(node, fullStart);
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

    private parseExpected(token: SyntaxKind): boolean {
        if (this.token === token) {
            this.nextToken();
            return true;
        }
        else {
            this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, tokenToString(token));
            return false;
        }
    }

    private parseExpectedOrEndOfFile(token: SyntaxKind): boolean {
        if (this.isEOF()) {
            return true;
        }

        return this.parseExpected(token);
    }

    // list parsing
    private shouldParseElement(): boolean {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.isStartOfSourceElement();

            case ParsingContext.Parameters:
            case ParsingContext.BracketedParameters:
                return this.isStartOfParameter();

            case ParsingContext.Arguments:
            case ParsingContext.BracketedArguments:
                return this.isStartOfArgument();

            case ParsingContext.RightHandSideListIndented:
                return this.isStartOfRightHandSide();

            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.OneOfSymbolList:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            case ParsingContext.NoSymbolHere:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;

            default:
                return false;
        }
    }

    private shouldSkipWhitespace(): SkipWhitespace {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                // whitespace in the SourceElements context has no meaning
                return SkipWhitespace.LineTerminator
                    | SkipWhitespace.Indentation;

            case ParsingContext.Parameters:
            case ParsingContext.BracketedParameters:
            case ParsingContext.Arguments:
            case ParsingContext.BracketedArguments:
            case ParsingContext.SymbolSet:
                // These elements are enclosed in parenthesis or braces, so whitespace has no meaning
                return SkipWhitespace.LineTerminator
                    | SkipWhitespace.Indentation;

            case ParsingContext.RightHandSideListIndented:
                // All whitespace is significant in a RHS list
                return SkipWhitespace.LineTerminator;

            case ParsingContext.OneOfList:
                // All whitespace is significant in a one-of list (non-indented)
                return SkipWhitespace.None;

            case ParsingContext.OneOfListIndented:
                // Only indentation is significatn in a one-of list (indented)
                return SkipWhitespace.LineTerminator;

            case ParsingContext.OneOfSymbolList:
                return SkipWhitespace.None;

            case ParsingContext.NoSymbolHere:
                return SkipWhitespace.None;

            default:
                // assume significant whitespace for new parsing contexts
                return SkipWhitespace.None;
        }
    }

    private shouldConsumeCloseToken(): boolean {
        switch (this.parsingContext) {
            case ParsingContext.Parameters:
            case ParsingContext.BracketedParameters:
            case ParsingContext.Arguments:
            case ParsingContext.BracketedArguments:
            case ParsingContext.SymbolSet:
            case ParsingContext.OneOfListIndented:
            case ParsingContext.RightHandSideListIndented:
            case ParsingContext.NoSymbolHere:
                return false;

            default:
                return true;
        }
    }

    private parseElement(): Node {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.parseSourceElement();

            case ParsingContext.Parameters:
            case ParsingContext.BracketedParameters:
                return this.parseParameter();

            case ParsingContext.Arguments:
            case ParsingContext.BracketedArguments:
                return this.parseArgument();

            case ParsingContext.RightHandSideListIndented:
                return this.parseRightHandSide();

            case ParsingContext.SymbolSet:
                return this.parseSymbolSpan();

            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.parseTerminal(/*allowOptional*/ false);

            case ParsingContext.OneOfSymbolList:
            case ParsingContext.NoSymbolHere:
                return this.parsePrimarySymbol(/*allowOptional*/ false);

            default:
                console.error(`Unexpected parsing context: ${ParsingContext[<any>this.parsingContext]}`);
                return undefined;
        }
    }

    private recover(): void {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                this.skipUntil(isSourceElementsRecoveryToken);
                break;

            case ParsingContext.Parameters:
                this.skipUntil(isParametersRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

                break;

            case ParsingContext.BracketedParameters:
                this.skipUntil(isBracketedParametersRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

                break;

            case ParsingContext.Arguments:
                this.skipUntil(isArgumentsRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

                break;

            case ParsingContext.BracketedArguments:
                this.skipUntil(isBracketedArgumentsRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

                break;

            case ParsingContext.RightHandSideListIndented:
                this.skipUntil(isRightHandSideListIndentedRecoveryToken);
                break;

            case ParsingContext.SymbolSet:
                this.skipUntil(isSymbolSetRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

                break;

            case ParsingContext.OneOfList:
                this.skipUntil(isOneOfListRecoveryToken);
                break;

            case ParsingContext.OneOfListIndented:
                this.skipUntil(isOneOfListIndentedRecoveryToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }

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
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseParenToken]));
                break;

            case ParsingContext.BracketedParameters:
            case ParsingContext.BracketedArguments:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBracketToken]));
                break;

            case ParsingContext.SymbolSet:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBraceToken]));
                break;

            case ParsingContext.OneOfList:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.LineTerminatorToken]));
                break;

            case ParsingContext.OneOfListIndented:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.DedentToken]));
                break;

            case ParsingContext.RightHandSideListIndented:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics.Production_expected);
                break;
        }
    }

    private hasCloseToken() {
        switch (this.parsingContext) {
            case ParsingContext.OneOfSymbolList:
            case ParsingContext.NoSymbolHere:
                return false;
        }

        return true;
    }

    private isOnCloseToken() {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.token === SyntaxKind.EndOfFileToken;

            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                return this.token === SyntaxKind.CloseParenToken;

            case ParsingContext.BracketedParameters:
            case ParsingContext.BracketedArguments:
                return this.token === SyntaxKind.CloseBracketToken;

            case ParsingContext.RightHandSideListIndented:
                return this.token === SyntaxKind.DedentToken || this.token === SyntaxKind.EndOfFileToken;

            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.CloseBraceToken;

            case ParsingContext.OneOfList:
                return this.token === SyntaxKind.DedentToken || this.token === SyntaxKind.LineTerminatorToken || this.token === SyntaxKind.EndOfFileToken;

            case ParsingContext.OneOfListIndented:
                return this.token === SyntaxKind.DedentToken || this.token === SyntaxKind.EndOfFileToken;

            case ParsingContext.OneOfSymbolList:
                return false;

            case ParsingContext.NoSymbolHere:
                return this.token === SyntaxKind.HereKeyword;
        }
    }

    private parseCloseToken() {
        if (this.isOnCloseToken()) {
            this.parseToken(this.token);
            return true;
        }

        return false;
    }

    private hasSeparator() {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return false;

            default:
                return true;
        }
    }

    private isOnSeparator() {
        switch (this.parsingContext) {
            case ParsingContext.Parameters:
            case ParsingContext.BracketedParameters:
            case ParsingContext.Arguments:
            case ParsingContext.BracketedArguments:
            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.CommaToken;

            case ParsingContext.RightHandSideListIndented:
                return this.token === SyntaxKind.LineTerminatorToken;

            case ParsingContext.OneOfSymbolList:
            case ParsingContext.NoSymbolHere:
                return this.token === SyntaxKind.OrKeyword;

            case ParsingContext.SourceElements:
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return false;
        }
    }

    private parseSeparator() {
        if (this.isOnSeparator()) {
            this.parseToken(this.token);
            return true;
        }

        return false;
    }

    private parseList<TNode extends Node>(listContext: ParsingContext): TNode[] {
        const saveContext = this.parsingContext;
        this.parsingContext = listContext;
        const hasCloseToken = this.hasCloseToken();
        const hasSeparator = this.hasSeparator();
        const shouldConsumeCloseToken = this.shouldConsumeCloseToken();
        const whitespaceToSkip = this.shouldSkipWhitespace();
        let result: TNode[];
        while (!this.isEOF()) {
            this.skipWhitespace(whitespaceToSkip);

            let parsed = false;
            if (this.shouldParseElement()) {
                parsed = true;
                if (!result) {
                    result = [];
                }

                const element = <TNode>this.parseElement();
                if (element) {
                    result.push(element);
                }
            }

            if (hasCloseToken && (shouldConsumeCloseToken ? this.parseCloseToken() : this.isOnCloseToken())) {
                break;
            }

            if (!(hasSeparator ? this.parseSeparator() : parsed)) {
                if (!hasCloseToken) {
                    break;
                }
                else {
                    this.reportDiagnostics();
                    this.recover();
                }
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
        const fullStart = this.scanner.getTokenPos();
        const text = this.canBeIdentifier(this.token) && this.readTokenValue(this.token);
        const node = new Identifier(text);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterLiteral(allowOptional: boolean): UnicodeCharacterLiteral {
        const fullStart = this.scanner.getTokenPos();
        const text = this.readTokenText(SyntaxKind.UnicodeCharacterLiteral);
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        const node = new UnicodeCharacterLiteral(text, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseProse(): Prose {
        const fullStart = this.scanner.getTokenPos();
        const greaterThanToken = this.parseToken(SyntaxKind.GreaterThanToken);
        const fragments = this.parseProseFragments();
        const node = new Prose(greaterThanToken, fragments);
        return this.finishNode(node, fullStart);
    }

    private isStartOfParameter(): boolean {
        return this.canBeIdentifier(this.token);
    }

    private parseParameter(): Parameter {
        const fullStart = this.scanner.getTokenPos();
        const name = this.parseIdentifier();
        const node = new Parameter(name);
        return this.finishNode(node, fullStart);
    }

    private parseParameterListTail(openToken: Node, parsingContext: ParsingContext, closeTokenKind: SyntaxKind): ParameterList {
        const elements = this.parseList<Parameter>(parsingContext);
        const closeToken = this.parseToken(closeTokenKind);
        const node = new ParameterList(openToken, elements, closeToken);
        return this.finishNode(node, openToken.pos);
    }

    private tryParseParameterList(): ParameterList {
        let openToken = this.parseToken(SyntaxKind.OpenParenToken);
        if (openToken) {
            return this.parseParameterListTail(openToken, ParsingContext.Parameters, SyntaxKind.CloseParenToken);
        }
        else {
            openToken = this.parseToken(SyntaxKind.OpenBracketToken);
            if (openToken) {
                return this.parseParameterListTail(openToken, ParsingContext.BracketedParameters, SyntaxKind.CloseBracketToken);
            }
        }

        return undefined;
    }

    private parseOneOfList(): OneOfList {
        const oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        const ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        this.parseOptional(SyntaxKind.LineTerminatorToken);

        const openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        const terminals = this.parseList<Terminal>(openIndentToken ? ParsingContext.OneOfListIndented : ParsingContext.OneOfList);
        const closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        const node = new OneOfList(oneKeyword, ofKeyword, openIndentToken, terminals, closeIndentToken);
        return this.finishNode(node, oneKeyword.pos);
    }

    private parseSymbolSetTail(openBraceToken: Node): SymbolSet {
        const terminals = this.parseList<SymbolSpan>(ParsingContext.SymbolSet);
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

    private parseEmptyAssertionTail(openBracketToken: Node): EmptyAssertion {
        const emptyKeyword = this.parseToken(SyntaxKind.EmptyKeyword);
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new EmptyAssertion(openBracketToken, emptyKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseAnyLookaheadOperator(): Node {
        switch (this.token) {
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.LessThanExclamationToken:
                return this.parseToken(this.token);

            default:
                return undefined;
        }
    }

    private parseLookaheadAssertionTail(openBracketToken: Node): LookaheadAssertion {
        const lookaheadKeyword = this.parseToken(SyntaxKind.LookaheadKeyword);
        const operatorToken = this.parseAnyLookaheadOperator();
        const lookahead = this.parseSymbolSpanRestOrSymbolSet();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new LookaheadAssertion(openBracketToken, lookaheadKeyword, operatorToken, lookahead, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseNoSymbolHereAssertionTail(openBracketToken: Node): NoSymbolHereAssertion {
        const noKeyword = this.parseToken(SyntaxKind.NoKeyword);
        const symbols = this.parseList<LexicalSymbol>(ParsingContext.NoSymbolHere);
        const hereKeyword = this.parseToken(SyntaxKind.HereKeyword);
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new NoSymbolHereAssertion(openBracketToken, noKeyword, symbols, hereKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLexicalGoalAssertionTail(openBracketToken: Node): LexicalGoalAssertion {
        const lexicalKeyword = this.parseToken(SyntaxKind.LexicalKeyword);
        const goalKeyword = this.parseToken(SyntaxKind.GoalKeyword);
        const symbol = this.parseIdentifier();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new LexicalGoalAssertion(openBracketToken, lexicalKeyword, goalKeyword, symbol, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseAnyParameterValueOperator(): Node {
        switch (this.token) {
            case SyntaxKind.PlusToken:
            case SyntaxKind.TildeToken:
                return this.parseToken(this.token);

            default:
                return undefined;
        }
    }

    private parseParameterValueAssertionTail(openBracketToken: Node): ParameterValueAssertion {
        const operatorToken = this.parseAnyParameterValueOperator();
        const name = this.parseIdentifier();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new ParameterValueAssertion(openBracketToken, operatorToken, name, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseInvalidAssertionTail(openBracketToken: Node): Assertion {
        const fullStart = this.scanner.getTokenPos();
        this.skipUntil(isInvalidConstraintTailRecoveryToken);
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new Assertion(SyntaxKind.InvalidAssertion, openBracketToken, closeBracketToken);
        this.finishNode(node, fullStart);
        return node;
    }

    private parseAssertion(): Assertion {
        const openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
        switch (this.token) {
            case SyntaxKind.EmptyKeyword:
                return this.parseEmptyAssertionTail(openBracketToken);

            case SyntaxKind.LookaheadKeyword:
                return this.parseLookaheadAssertionTail(openBracketToken);

            case SyntaxKind.NoKeyword:
                return this.parseNoSymbolHereAssertionTail(openBracketToken);

            case SyntaxKind.LexicalKeyword:
                return this.parseLexicalGoalAssertionTail(openBracketToken);

            case SyntaxKind.TildeToken:
            case SyntaxKind.PlusToken:
                return this.parseParameterValueAssertionTail(openBracketToken);

            default:
                return this.parseInvalidAssertionTail(openBracketToken);
        }
    }

    private parseProseAssertion(): ProseAssertion {
        const openBracketToken = this.parseToken(SyntaxKind.OpenBracketGreaterThanToken);
        const fragments = this.parseProseFragments();
        const closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        const node = new ProseAssertion(openBracketToken, fragments, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseProseFragments() {
        const fragments: (ProseFragmentLiteral | Terminal | Nonterminal)[] = [];
        while (true) {
            if (this.token === SyntaxKind.ProseFull) {
                fragments.push(this.parseProseFragmentLiteral(this.token));
                break;
            }
            else if (this.token >= SyntaxKind.FirstProseFragment && this.token <= SyntaxKind.LastProseFragment) {
                fragments.push(this.parseProseFragmentLiteral(this.token));
            }
            else if (this.token === SyntaxKind.Terminal) {
                fragments.push(this.parseTerminal(/*allowOptional*/ false));
            }
            else if (this.token === SyntaxKind.Identifier) {
                fragments.push(this.parseNonterminal(/*allowArgumentList*/ false, /*allowOptional*/ false));
            }
            else {
                break;
            }
        }

        return fragments;
    }

    private parseProseFragmentLiteral(token: SyntaxKind) {
        const fullStart = this.scanner.getTokenPos();
        const text = this.readTokenValue(token);
        const node = new ProseFragmentLiteral(token, text);
        return this.finishNode(node, fullStart);
    }

    private parseTerminal(allowOptional: boolean): Terminal {
        const fullStart = this.scanner.getTokenPos();
        const text = this.readTokenValue(SyntaxKind.Terminal);
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        const node = new Terminal(text, questionToken);
        return this.finishNode(node, fullStart);
    }

    private isStartOfArgument(): boolean {
        return isLeadingArgumentToken(this.token)
            || this.canBeIdentifier(this.token);
    }

    private parseArgument(): Argument {
        const fullStart = this.scanner.getTokenPos();
        const operatorToken = this.parseAnyToken(isLeadingArgumentToken);
        const name = this.parseIdentifier();
        const node = new Argument(operatorToken, name);
        return this.finishNode(node, fullStart);
    }

    private parseArgumentListTail(openToken: Node, parsingContext: ParsingContext, closeTokenKind: SyntaxKind): ArgumentList {
        const elements = this.parseList<Argument>(parsingContext);
        const closeToken = this.parseToken(closeTokenKind);
        const node = new ArgumentList(openToken, elements, closeToken);
        return this.finishNode(node, openToken.pos);
    }

    private tryParseArgumentList(): ArgumentList {
        let openToken = this.parseToken(SyntaxKind.OpenParenToken);
        if (openToken) {
            return this.parseArgumentListTail(openToken, ParsingContext.Arguments, SyntaxKind.CloseParenToken);
        }
        else if (this.isStartOfArgumentList()) {
            openToken = this.parseToken(SyntaxKind.OpenBracketToken);
            return this.parseArgumentListTail(openToken, ParsingContext.BracketedArguments, SyntaxKind.CloseBracketToken);
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
        const fullStart = this.scanner.getTokenPos();
        const name = this.parseIdentifier();
        const argumentList = allowArgumentList ? this.tryParseArgumentList() : undefined;
        const questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        const node = new Nonterminal(name, argumentList, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseOneOfSymbol(): OneOfSymbol {
        const fullStart = this.scanner.getTokenPos();
        const oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        const ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        const symbols = this.parseList<LexicalSymbol>(ParsingContext.OneOfSymbolList);
        const node = new OneOfSymbol(oneKeyword, ofKeyword, symbols);
        return this.finishNode(node, fullStart);
    }

    private parsePlaceholderSymbol(): LexicalSymbol {
        const fullStart = this.scanner.getTokenPos();
        const node = new LexicalSymbol(this.token);
        this.nextToken();
        return this.finishNode(node, fullStart);
    }

    private parseInvalidSymbol(): LexicalSymbol {
        const fullStart = this.scanner.getTokenPos();
        const node = new LexicalSymbol(SyntaxKind.InvalidSymbol);
        this.skipUntil(isInvalidSymbolRecoveryToken);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterRangeOrHigher(allowOptional: boolean): UnicodeCharacterLiteral | UnicodeCharacterRange {
        const symbol = this.parseUnicodeCharacterLiteral(allowOptional);
        if (!allowOptional) {
            const throughKeyword = this.parseToken(SyntaxKind.ThroughKeyword);
            if (throughKeyword) {
                return this.parseUnicodeCharacterRangeTail(symbol, throughKeyword);
            }
        }
        return symbol;
    }

    private parseUnicodeCharacterRangeTail(left: UnicodeCharacterLiteral, throughKeyword: Node): UnicodeCharacterRange {
        const right = this.parseUnicodeCharacterLiteral(/*allowOptional*/ false);
        const node = new UnicodeCharacterRange(left, throughKeyword, right);
        return this.finishNode(node, left.pos);
    }

    private parsePrimarySymbol(allowOptional: boolean): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
                return this.parseUnicodeCharacterRangeOrHigher(allowOptional);

            case SyntaxKind.Terminal:
                return this.parseTerminal(allowOptional);

            case SyntaxKind.Identifier:
                return this.parseNonterminal(/*allowArgumentList*/ true, allowOptional);

            case SyntaxKind.AtToken:
                return this.parsePlaceholderSymbol();

            default:
                return this.parseInvalidSymbol();
        }
    }

    private parseUnarySymbol(): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.OneKeyword:
                return this.parseOneOfSymbol();

            default:
                return this.parsePrimarySymbol(/*allowOptional*/ true);
        }
    }

    private tryParseThroughOperator(): Node {
        if (this.token === SyntaxKind.ThroughKeyword) {
            return this.parseToken(SyntaxKind.ThroughKeyword);
        }

        return undefined;
    }

    private parseButNotSymbolTail(left: LexicalSymbol, butKeyword: Node, notKeyword: Node): ButNotSymbol {
        const right = this.parseSymbol();
        const node = new ButNotSymbol(left, butKeyword, notKeyword, right);
        return this.finishNode(node, left.pos);
    }

    private parseSymbol(): LexicalSymbol {
        if (this.token === SyntaxKind.OpenBracketToken) {
            return this.parseAssertion();
        }
        else if (this.token === SyntaxKind.OpenBracketGreaterThanToken) {
            return this.parseProseAssertion();
        }

        const symbol = this.parseUnarySymbol();
        const butKeyword = this.parseToken(SyntaxKind.ButKeyword);
        const notKeyword = this.parseToken(SyntaxKind.NotKeyword);
        if (butKeyword || notKeyword) {
            return this.parseButNotSymbolTail(symbol, butKeyword, notKeyword);
        }

        return symbol;
    }

    private tryParseSymbolSpan(): SymbolSpan {
        if (this.isStartOfSymbolSpan()) {
            return this.parseSymbolSpanRest();
        }

        return undefined;
    }

    private parseSymbolSpanRest(): SymbolSpan {
        const fullStart = this.scanner.getTokenPos();
        const symbol = this.parseSymbol();
        const next = this.tryParseSymbolSpan();
        const node = new SymbolSpan(symbol, next);
        return this.finishNode(node, fullStart);
    }

    private parseSymbolSpan(): SymbolSpan {
        const fullStart = this.scanner.getTokenPos();
        if (this.token === SyntaxKind.GreaterThanToken) {
            const symbol = this.parseProse();
            const node = new SymbolSpan(symbol, /*next*/ undefined);
            return this.finishNode(node, fullStart);
        }
        else {
            return this.parseSymbolSpanRest();
        }
    }

    private isStartOfSymbolSpan(): boolean {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
            case SyntaxKind.Terminal:
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

    private parseLinkReference(): LinkReference {
        if (this.token === SyntaxKind.LinkReference) {
            const fullStart = this.scanner.getTokenPos();
            const text = this.readTokenValue(SyntaxKind.LinkReference);
            const node = new LinkReference(text);
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseRightHandSide(): RightHandSide {
        const fullStart = this.scanner.getTokenPos();
        const head = this.parseSymbolSpan();
        const reference = this.parseLinkReference();
        const node = new RightHandSide(head, reference);
        if (this.parsingContext !== ParsingContext.RightHandSideListIndented) {
            this.parseOptional(SyntaxKind.LineTerminatorToken);
        }

        return this.finishNode(node, fullStart);
    }

    private parseRightHandSideList(): RightHandSideList {
        const fullStart = this.scanner.getTokenPos();
        const openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        const elements = openIndentToken && this.parseList<RightHandSide>(ParsingContext.RightHandSideListIndented) || [];
        const closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        const node = new RightHandSideList(openIndentToken, elements, closeIndentToken);
        return this.finishNode(node, fullStart);
    }

    private parseBody(): OneOfList | RightHandSide | RightHandSideList {
        if (this.token === SyntaxKind.OneKeyword) {
            return this.parseOneOfList();
        }
        else if (this.token === SyntaxKind.LineTerminatorToken) {
            this.nextToken();
            return this.parseRightHandSideList();
        }
        else {
            return this.parseRightHandSide();
        }
    }

    private parseProduction(): Production {
        const fullStart = this.scanner.getTokenPos();
        const name = this.parseIdentifier();
        const parameters = this.tryParseParameterList();
        const colonToken = this.parseAnyToken(isProductionSeparatorToken);
        const body = this.parseBody();
        const node = new Production(name, parameters, colonToken, body);
        return this.finishNode(node, fullStart);
    }

    private parseStringLiteral(): StringLiteral {
        if (this.token === SyntaxKind.StringLiteral) {
            const fullStart = this.scanner.getTokenPos();
            const text = this.scanner.getTokenValue();
            const node = new StringLiteral(text);
            this.nextToken();
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseMetaElement(): MetaElement {
        const fullStart = this.scanner.getTokenPos();
        const atToken = this.parseToken(SyntaxKind.AtToken);
        switch (this.token) {
            case SyntaxKind.ImportKeyword:
                return this.parseImport(fullStart, atToken);
            case SyntaxKind.DefineKeyword:
                return this.parseDefine(fullStart, atToken);
            default:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics._0_expected, formatList([SyntaxKind.ImportKeyword, SyntaxKind.DefineKeyword]));
                return;
        }
    }

    private parseImport(fullStart: number, atToken: Node): Import {
        const importKeyword = this.parseToken(SyntaxKind.ImportKeyword);
        const path = this.parseStringLiteral();
        const node = new Import(atToken, importKeyword, path);
        return this.finishNode(node, fullStart);
    }

    private parseDefine(fullStart: number, atToken: Node): Define {
        const defineKeyword = this.parseToken(SyntaxKind.DefineKeyword);
        const key = this.parseIdentifier();
        const valueToken = this.parseAnyToken(isBooleanLiteralToken);
        const node = new Define(atToken, defineKeyword, key, valueToken);
        return this.finishNode(node, fullStart);
    }

    private isStartOfSourceElement(): boolean {
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

    private parseSourceElement(): SourceElement {
        switch (this.token) {
            case SyntaxKind.Identifier:
                return this.parseProduction();

            case SyntaxKind.AtToken:
                return this.parseMetaElement();

            default:
                this.diagnostics.report(this.scanner.getTokenPos(), Diagnostics.Unexpected_token_0_, tokenToString(this.token));
                return;
        }
    }

    private parseSourceElementList(): SourceElement[] {
        return this.parseList<SourceElement>(ParsingContext.SourceElements);
    }
}

function isSourceElementsRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.LineTerminatorToken;
}

function isParametersRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseParenToken
        || token === SyntaxKind.ColonToken
        || token === SyntaxKind.ColonColonToken
        || token === SyntaxKind.ColonColonColonToken
        || token === SyntaxKind.LineTerminatorToken;
}

function isBracketedParametersRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.ColonToken
        || token === SyntaxKind.ColonColonToken
        || token === SyntaxKind.ColonColonColonToken
        || token === SyntaxKind.LineTerminatorToken;
}

function isArgumentsRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseParenToken
        || token === SyntaxKind.LineTerminatorToken;
}

function isBracketedArgumentsRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.LineTerminatorToken;
}

function isRightHandSideListIndentedRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.DedentToken
        || token === SyntaxKind.LineTerminatorToken
}

function isSymbolSetRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.Terminal
        || token === SyntaxKind.CloseBraceToken
        || token === SyntaxKind.LineTerminatorToken
}

function isOneOfListRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.Terminal
        || token === SyntaxKind.LineTerminatorToken
}

function isOneOfListIndentedRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.Terminal
        || token === SyntaxKind.LineTerminatorToken
}

function isOneOfSymbolListRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.OrKeyword
        || token === SyntaxKind.Terminal
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.OpenBracketToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.LineTerminatorToken
}

function isNoSymbolHereRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.OrKeyword
        || token === SyntaxKind.HereKeyword
        || token === SyntaxKind.Terminal
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.LineTerminatorToken
}

function isInvalidSymbolRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.OpenBracketToken
        || token === SyntaxKind.Terminal
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.LineTerminatorToken;
}

function isInvalidConstraintTailRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CloseBracketToken
        || token === SyntaxKind.LineTerminatorToken
        || token === SyntaxKind.Terminal
        || token === SyntaxKind.Identifier;
}

function isProductionSeparatorToken(token: SyntaxKind) {
    return token === SyntaxKind.ColonToken
        || token === SyntaxKind.ColonColonToken
        || token === SyntaxKind.ColonColonColonToken;
}

function isLeadingArgumentToken(token: SyntaxKind) {
    return token === SyntaxKind.QuestionToken
        || token === SyntaxKind.PlusToken
        || token === SyntaxKind.TildeToken;
}

function isBooleanLiteralToken(token: SyntaxKind) {
    return token === SyntaxKind.TrueKeyword
        || token === SyntaxKind.FalseKeyword;
}