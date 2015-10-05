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
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages, formatList } from "./diagnostics";
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
    SourceElement
} from "./nodes";

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

export interface Host {
    readFile(filename: string): string;
}

export class Parser {
    private scanner: Scanner;
    private token: SyntaxKind;
    private sourceFile: SourceFile;
    private diagnostics: DiagnosticMessages;
    private parsingContext: ParsingContext;

    constructor(diagnostics: DiagnosticMessages) {
        this.diagnostics = diagnostics;
    }

    public parseSourceFile(filename: string, text: string): SourceFile {
        this.sourceFile = new SourceFile(filename, text);
        this.diagnostics.setSourceFile(this.sourceFile);
        this.scanner = new Scanner(filename, text, this.diagnostics);
        this.parsingContext = ParsingContext.SourceElements;

        this.nextToken();
        this.sourceFile.elements = this.parseSourceElementList() || [];

        let imports: string[] = [];
        for (let element of this.sourceFile.elements) {
            if (element.kind === SyntaxKind.Import) {
                let importNode = <Import>element;
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
        let saveToken = this.token;
        let saveParsingContext = this.parsingContext;
        let saveDiagnostics = this.diagnostics;

        this.diagnostics = NullDiagnosticMessages.instance;
        let result = this.scanner.speculate(callback, isLookahead);

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
            let text = this.scanner.getTokenValue();
            this.nextToken();
            return text;
        }

        return undefined;
    }

    private readTokenText(token: SyntaxKind): string {
        if (this.token === token) {
            let text = this.scanner.getTokenText();
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
            let fullStart = this.scanner.getStartPos();
            this.nextToken();
            return this.finishNode(new Node(token), fullStart);
        }

        return undefined;
    }

    private parseAnyToken(predicate: (token: SyntaxKind) => boolean): Node {
        if (predicate(this.token)) {
            let fullStart = this.scanner.getStartPos();
            let node = new Node(this.token);
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
            this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, tokenToString(token));
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
                console.error(`Unexpected parsing context: ${ParsingContext[this.parsingContext]}`);
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
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics.Production_expected);
                break;

            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseParenToken]));
                break;

            case ParsingContext.BracketedParameters:
            case ParsingContext.BracketedArguments:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBracketToken]));
                break;

            case ParsingContext.SymbolSet:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseBraceToken]));
                break;

            case ParsingContext.OneOfList:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.LineTerminatorToken]));
                break;

            case ParsingContext.OneOfListIndented:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.DedentToken]));
                break;

            case ParsingContext.RightHandSideListIndented:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics.Production_expected);
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
        let saveContext = this.parsingContext;
        this.parsingContext = listContext;

        let hasCloseToken = this.hasCloseToken();
        let hasSeparator = this.hasSeparator();
        let shouldConsumeCloseToken = this.shouldConsumeCloseToken();
        let whitespaceToSkip = this.shouldSkipWhitespace();
        let result: TNode[];
        while (!this.isEOF()) {
            this.skipWhitespace(whitespaceToSkip);

            let parsed = false;
            if (this.shouldParseElement()) {
                parsed = true;
                if (!result) {
                    result = [];
                }

                let element = <TNode>this.parseElement();
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
        let fullStart = this.scanner.getStartPos();
        let text = this.canBeIdentifier(this.token) && this.readTokenValue(this.token);
        let node = new Identifier(text);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterLiteral(allowOptional: boolean): UnicodeCharacterLiteral {
        let fullStart = this.scanner.getTokenPos();
        let text = this.readTokenText(SyntaxKind.UnicodeCharacterLiteral);
        let questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        let node = new UnicodeCharacterLiteral(text, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseProse(): Prose {
        let fullStart = this.scanner.getStartPos();
        let text = this.readTokenValue(SyntaxKind.Prose);
        let node = new Prose(text);
        return this.finishNode(node, fullStart);
    }

    private isStartOfParameter(): boolean {
        return this.canBeIdentifier(this.token);
    }

    private parseParameter(): Parameter {
        let fullStart = this.scanner.getStartPos();
        let name = this.parseIdentifier();
        let node = new Parameter(name);
        return this.finishNode(node, fullStart);
    }

    private parseParameterListTail(openToken: Node, parsingContext: ParsingContext, closeTokenKind: SyntaxKind): ParameterList {
        let elements = this.parseList<Parameter>(parsingContext);
        let closeToken = this.parseToken(closeTokenKind);
        let node = new ParameterList(openToken, elements, closeToken);
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
        let oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        let ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        this.parseOptional(SyntaxKind.LineTerminatorToken);

        let openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        let terminals = this.parseList<Terminal>(openIndentToken ? ParsingContext.OneOfListIndented : ParsingContext.OneOfList);
        let closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        let node = new OneOfList(oneKeyword, ofKeyword, openIndentToken, terminals, closeIndentToken);
        return this.finishNode(node, oneKeyword.pos);
    }

    private parseSymbolSetTail(openBraceToken: Node): SymbolSet {
        let terminals = this.parseList<SymbolSpan>(ParsingContext.SymbolSet);
        let closeBraceToken = this.parseToken(SyntaxKind.CloseBraceToken);
        let node = new SymbolSet(openBraceToken, terminals, closeBraceToken);
        return this.finishNode(node, openBraceToken.pos);
    }

    private parseSymbolSpanRestOrSymbolSet(): SymbolSpan | SymbolSet {
        let openBraceToken = this.parseToken(SyntaxKind.OpenBraceToken);
        if (openBraceToken) {
            return this.parseSymbolSetTail(openBraceToken);
        }
        else {
            return this.parseSymbolSpanRest();
        }
    }

    private parseEmptyAssertionTail(openBracketToken: Node): EmptyAssertion {
        let emptyKeyword = this.parseToken(SyntaxKind.EmptyKeyword);
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new EmptyAssertion(openBracketToken, emptyKeyword, closeBracketToken);
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
        let lookaheadKeyword = this.parseToken(SyntaxKind.LookaheadKeyword);
        let operatorToken = this.parseAnyLookaheadOperator();
        let lookahead = this.parseSymbolSpanRestOrSymbolSet();
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new LookaheadAssertion(openBracketToken, lookaheadKeyword, operatorToken, lookahead, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseNoSymbolHereAssertionTail(openBracketToken: Node): NoSymbolHereAssertion {
        let noKeyword = this.parseToken(SyntaxKind.NoKeyword);
        let symbols = this.parseList<LexicalSymbol>(ParsingContext.NoSymbolHere);
        let hereKeyword = this.parseToken(SyntaxKind.HereKeyword);
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new NoSymbolHereAssertion(openBracketToken, noKeyword, symbols, hereKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLexicalGoalAssertionTail(openBracketToken: Node): LexicalGoalAssertion {
        let lexicalKeyword = this.parseToken(SyntaxKind.LexicalKeyword);
        let goalKeyword = this.parseToken(SyntaxKind.GoalKeyword);
        let symbol = this.parseIdentifier();
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new LexicalGoalAssertion(openBracketToken, lexicalKeyword, goalKeyword, symbol, closeBracketToken);
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
        let operatorToken = this.parseAnyParameterValueOperator();
        let name = this.parseIdentifier();
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new ParameterValueAssertion(openBracketToken, operatorToken, name, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseInvalidAssertionTail(openBracketToken: Node): Assertion {
        let fullStart = this.scanner.getStartPos();
        this.skipUntil(isInvalidConstraintTailRecoveryToken);
        let closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        let node = new Assertion(SyntaxKind.InvalidAssertion, openBracketToken, closeBracketToken);
        this.finishNode(node, fullStart);
        return node;
    }

    private parseAssertion(): Assertion {
        let openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
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

    private parseTerminal(allowOptional: boolean): Terminal {
        let fullStart = this.scanner.getStartPos();
        let text = this.readTokenValue(SyntaxKind.Terminal);
        let questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        let node = new Terminal(text, questionToken);
        return this.finishNode(node, fullStart);
    }

    private isStartOfArgument(): boolean {
        return this.token === SyntaxKind.QuestionToken
            || this.canBeIdentifier(this.token);
    }

    private parseArgument(): Argument {
        let fullStart = this.scanner.getStartPos();
        let questionToken = this.parseToken(SyntaxKind.QuestionToken);
        let name = this.parseIdentifier();
        let node = new Argument(questionToken, name);
        return this.finishNode(node, fullStart);
    }

    private parseArgumentListTail(openToken: Node, parsingContext: ParsingContext, closeTokenKind: SyntaxKind): ArgumentList {
        let elements = this.parseList<Argument>(parsingContext);
        let closeToken = this.parseToken(closeTokenKind);
        let node = new ArgumentList(openToken, elements, closeToken);
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
        return this.token === SyntaxKind.QuestionToken
            || this.token === SyntaxKind.Identifier;
    }

    private parseNonterminal(allowOptional: boolean): Nonterminal {
        let fullStart = this.scanner.getStartPos();
        let name = this.parseIdentifier();
        let argumentList = this.tryParseArgumentList();
        let questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        let node = new Nonterminal(name, argumentList, questionToken);
        return this.finishNode(node, fullStart);
    }

    private parseOneOfSymbol(): OneOfSymbol {
        let fullStart = this.scanner.getStartPos();
        let oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        let ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        let symbols = this.parseList<LexicalSymbol>(ParsingContext.OneOfSymbolList);
        let node = new OneOfSymbol(oneKeyword, ofKeyword, symbols);
        return this.finishNode(node, fullStart);
    }

    private parsePlaceholderSymbol(): LexicalSymbol {
        let fullStart = this.scanner.getStartPos();
        let node = new LexicalSymbol(this.token);
        this.nextToken();
        return this.finishNode(node, fullStart);
    }

    private parseInvalidSymbol(): LexicalSymbol {
        let fullStart = this.scanner.getStartPos();
        let node = new LexicalSymbol(SyntaxKind.InvalidSymbol);
        this.skipUntil(isInvalidSymbolRecoveryToken);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterRangeOrHigher(allowOptional: boolean): UnicodeCharacterLiteral | UnicodeCharacterRange {
        let symbol = this.parseUnicodeCharacterLiteral(allowOptional);
        if (!allowOptional) {
            let throughKeyword = this.parseToken(SyntaxKind.ThroughKeyword);
            if (throughKeyword) {
                return this.parseUnicodeCharacterRangeTail(symbol, throughKeyword);
            }
        }
        return symbol;
    }

    private parseUnicodeCharacterRangeTail(left: UnicodeCharacterLiteral, throughKeyword: Node): UnicodeCharacterRange {
        let right = this.parseUnicodeCharacterLiteral(/*allowOptional*/ false);
        let node = new UnicodeCharacterRange(left, throughKeyword, right);
        return this.finishNode(node, left.pos);
    }

    private parsePrimarySymbol(allowOptional: boolean): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
                return this.parseUnicodeCharacterRangeOrHigher(allowOptional);

            case SyntaxKind.Terminal:
                return this.parseTerminal(allowOptional);

            case SyntaxKind.Identifier:
                return this.parseNonterminal(allowOptional);

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
        let right = this.parseSymbol();
        let node = new ButNotSymbol(left, butKeyword, notKeyword, right);
        return this.finishNode(node, left.pos);
    }

    private parseSymbol(): LexicalSymbol {
        if (this.token === SyntaxKind.OpenBracketToken) {
            return this.parseAssertion();
        }

        let symbol = this.parseUnarySymbol();
        let butKeyword = this.parseToken(SyntaxKind.ButKeyword);
        let notKeyword = this.parseToken(SyntaxKind.NotKeyword);
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
        let fullStart = this.scanner.getStartPos();
        let symbol = this.parseSymbol();
        let next = this.tryParseSymbolSpan();
        let node = new SymbolSpan(symbol, next);
        return this.finishNode(node, fullStart);
    }

    private parseSymbolSpan(): SymbolSpan {
        let fullStart = this.scanner.getStartPos();
        if (this.token === SyntaxKind.Prose) {
            let symbol = this.parseProse();
            let node = new SymbolSpan(symbol, /*next*/ undefined);
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
            case SyntaxKind.Prose:
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
            let fullStart = this.scanner.getStartPos();
            let text = this.readTokenValue(SyntaxKind.LinkReference);
            let node = new LinkReference(text);
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseRightHandSide(): RightHandSide {
        let fullStart = this.scanner.getStartPos();
        let head = this.parseSymbolSpan();
        let reference = this.parseLinkReference();
        let node = new RightHandSide(head, reference);
        if (this.parsingContext !== ParsingContext.RightHandSideListIndented) {
            this.parseOptional(SyntaxKind.LineTerminatorToken);
        }

        return this.finishNode(node, fullStart);
    }

    private parseRightHandSideList(): RightHandSideList {
        let fullStart = this.scanner.getStartPos();
        let openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        let elements = openIndentToken && this.parseList<RightHandSide>(ParsingContext.RightHandSideListIndented) || [];
        let closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        let node = new RightHandSideList(openIndentToken, elements, closeIndentToken);
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
        let fullStart = this.scanner.getStartPos();
        let name = this.parseIdentifier();
        let parameters = this.tryParseParameterList();
        let colonToken = this.parseAnyToken(isProductionSeparatorToken);
        let body = this.parseBody();
        let node = new Production(name, parameters, colonToken, body);
        return this.finishNode(node, fullStart);
    }

    private parseStringLiteral(): StringLiteral {
        if (this.token === SyntaxKind.StringLiteral) {
            let fullStart = this.scanner.getStartPos();
            let text = this.scanner.getTokenValue();
            let node = new StringLiteral(text);
            this.nextToken();
            return this.finishNode(node, fullStart);
        }

        return undefined;
    }

    private parseImport(): Import {
        let fullStart = this.scanner.getStartPos();
        let atToken = this.parseToken(SyntaxKind.AtToken);
        let importKeyword = this.parseToken(SyntaxKind.ImportKeyword);
        let path = this.parseStringLiteral();
        let node = new Import(atToken, importKeyword, path);
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
                return this.parseImport();

            default:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics.Unexpected_token_0_, tokenToString(this.token));
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