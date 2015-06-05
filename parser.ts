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
import { SyntaxKind } from "./core";
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages, formatList } from "./diagnostics";
import { tokenToString } from "./tokens";
import { Scanner } from "./scanner";
import { 
    Node, 
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
    ButNotOperator,
    BinarySymbol,
    SymbolSpan,
    RightHandSide,
    RightHandSideList,
    Production,
    SourceElement
} from "./nodes";

enum ParsingContext {
    SourceElements,
    Parameters,
    Arguments,
    RightHandSideListIndented,
    SymbolSet,
    OneOfList,
    OneOfListIndented,
    OneOfSymbolList
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
        this.sourceFile.elements = this.parseSourceElementList();
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
        var saveToken = this.token;
        var saveParsingContext = this.parsingContext;
        var saveDiagnostics = this.diagnostics;
        this.diagnostics = NullDiagnosticMessages.instance;
        var result = this.scanner.speculate(callback, isLookahead);
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
            var text = this.scanner.getTokenValue();
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
            var fullStart = this.scanner.getStartPos();
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
                return this.isStartOfParameter();
            case ParsingContext.Arguments:
                return this.isStartOfArgument();
            case ParsingContext.RightHandSideListIndented:
                return this.isStartOfRightHandSide();
            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.Identifier || this.token === SyntaxKind.UnicodeCharacterLiteral;
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.token === SyntaxKind.Terminal;
            case ParsingContext.OneOfSymbolList:
                return this.token === SyntaxKind.Terminal || this.token === SyntaxKind.Identifier;
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
            case ParsingContext.Arguments:
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

            default:
                // assume significant whitespace for new parsing contexts
                return SkipWhitespace.None;
        }
    }

    private shouldConsumeCloseToken(): boolean {
        switch (this.parsingContext) {
            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
            case ParsingContext.SymbolSet:
            case ParsingContext.OneOfListIndented:
            case ParsingContext.RightHandSideListIndented:
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
                return this.parseParameter();
            case ParsingContext.Arguments:
                return this.parseArgument();
            case ParsingContext.RightHandSideListIndented:
                return this.parseRightHandSide();
            case ParsingContext.SymbolSet:
                return this.parsePrimarySymbol(/*allowOptional*/ false);
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.parseTerminal(/*allowOptional*/ false);
            case ParsingContext.OneOfSymbolList:
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

            case ParsingContext.Arguments:
                this.skipUntil(isArgumentsRecoveryToken);
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
        return this.parsingContext !== ParsingContext.OneOfSymbolList;
    }
    
    private isOnCloseToken() {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                return this.token === SyntaxKind.EndOfFileToken;
            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                return this.token === SyntaxKind.CloseParenToken;
            case ParsingContext.RightHandSideListIndented:
                return this.token === SyntaxKind.DedentToken || this.token === SyntaxKind.EndOfFileToken;
            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.CloseBraceToken;
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.token === SyntaxKind.DedentToken || this.token === SyntaxKind.EndOfFileToken;
            case ParsingContext.OneOfSymbolList:
                return false;
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
            case ParsingContext.Arguments:
            case ParsingContext.SymbolSet:
                return this.token === SyntaxKind.CommaToken;
            case ParsingContext.RightHandSideListIndented:
                return this.token === SyntaxKind.LineTerminatorToken;
            case ParsingContext.OneOfSymbolList:
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

            var parsed = false;
            if (this.shouldParseElement()) {
                parsed = true;
                if (!result) {
                    result = [];
                }

                var element = <TNode>this.parseElement();
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
        var fullStart = this.scanner.getStartPos();
        var text = this.canBeIdentifier(this.token) && this.readTokenValue(this.token);
        var node = new Identifier(text);
        return this.finishNode(node, fullStart);
    }

    private parseUnicodeCharacterLiteral(allowOptional: boolean): UnicodeCharacterLiteral {
        let fullStart = this.scanner.getStartPos();
        let text = this.readTokenValue(SyntaxKind.UnicodeCharacterLiteral);
        let questionToken = allowOptional ? this.parseToken(SyntaxKind.QuestionToken) : undefined;
        let node = new UnicodeCharacterLiteral(text, questionToken);        
        return this.finishNode(node, fullStart);
    }

    private parseProse(): Prose {
        var fullStart = this.scanner.getStartPos();
        var text = this.readTokenValue(SyntaxKind.Prose);
        var node = new Prose(text);
        return this.finishNode(node, fullStart);
    }

    private isStartOfParameter(): boolean {
        return this.canBeIdentifier(this.token);
    }

    private parseParameter(): Parameter {
        var fullStart = this.scanner.getStartPos();
        var name = this.parseIdentifier();
        var node = new Parameter(name);
        return this.finishNode(node, fullStart);
    }

    private parseParameterListTail(openParenToken: Node): ParameterList {
        var elements = this.parseList<Parameter>(ParsingContext.Parameters);
        var closeParenToken = this.parseToken(SyntaxKind.CloseParenToken);
        var node = new ParameterList(openParenToken, elements, closeParenToken);
        return this.finishNode(node, openParenToken.pos);
    }

    private tryParseParameterList(): ParameterList {
        var openParenToken = this.parseToken(SyntaxKind.OpenParenToken);
        if (openParenToken) {
            return this.parseParameterListTail(openParenToken);
        }
        return undefined;
    }

    private parseOneOfList(): OneOfList {
        var oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        var ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        this.parseOptional(SyntaxKind.LineTerminatorToken);
        var openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        var terminals = this.parseList<Terminal>(openIndentToken ? ParsingContext.OneOfListIndented : ParsingContext.OneOfList);
        var closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        var node = new OneOfList(oneKeyword, ofKeyword, openIndentToken, terminals, closeIndentToken);
        return this.finishNode(node, oneKeyword.pos);
    }

    private parseSymbolSetTail(openBraceToken: Node): SymbolSet {
        var terminals = this.parseList<Terminal>(ParsingContext.SymbolSet);
        var closeBraceToken = this.parseToken(SyntaxKind.CloseBraceToken);
        var node = new SymbolSet(openBraceToken, terminals, closeBraceToken);
        return this.finishNode(node, openBraceToken.pos);
    }

    private parseSymbolOrSymbolSet(): LexicalSymbol | SymbolSet {
        var openBraceToken = this.parseToken(SyntaxKind.OpenBraceToken);
        if (openBraceToken) {
            return this.parseSymbolSetTail(openBraceToken);
        }
        else {
            return this.parsePrimarySymbol(/*allowOptional*/ false);
        }
    }
    
    private parseEmptyAssertionTail(openBracketToken: Node): EmptyAssertion {
        var emptyKeyword = this.parseToken(SyntaxKind.EmptyKeyword);
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new EmptyAssertion(openBracketToken, emptyKeyword, closeBracketToken);
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
        var lookaheadKeyword = this.parseToken(SyntaxKind.LookaheadKeyword);
        var operatorToken = this.parseAnyLookaheadOperator();
        var lookahead = this.parseSymbolOrSymbolSet();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new LookaheadAssertion(openBracketToken, lookaheadKeyword, operatorToken, lookahead, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseNoSymbolHereAssertionTail(openBracketToken: Node): NoSymbolHereAssertion {
        var noKeyword = this.parseToken(SyntaxKind.NoKeyword);
        var symbol = this.parseIdentifier();
        var hereKeyword = this.parseToken(SyntaxKind.HereKeyword);
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new NoSymbolHereAssertion(openBracketToken, noKeyword, symbol, hereKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLexicalGoalAssertionTail(openBracketToken: Node): LexicalGoalAssertion {
        var fullStart = this.scanner.getStartPos();
        var lexicalKeyword = this.parseToken(SyntaxKind.LexicalKeyword);
        var goalKeyword = this.parseToken(SyntaxKind.GoalKeyword);
        var symbol = this.parseIdentifier();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new LexicalGoalAssertion(openBracketToken, lexicalKeyword, goalKeyword, symbol, closeBracketToken);
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
        var operatorToken = this.parseAnyParameterValueOperator();
        var name = this.parseIdentifier();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new ParameterValueAssertion(openBracketToken, operatorToken, name, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }
    
    private parseInvalidAssertionTail(openBracketToken: Node): Assertion {
        var fullStart = this.scanner.getStartPos();
        this.skipUntil(isInvalidConstraintTailRecoveryToken);
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new Assertion(SyntaxKind.InvalidAssertion, openBracketToken, closeBracketToken);
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
        var fullStart = this.scanner.getStartPos();
        var questionToken = this.parseToken(SyntaxKind.QuestionToken);
        var name = this.parseIdentifier();
        var node = new Argument(questionToken, name);
        return this.finishNode(node, fullStart);
    }

    private parseArgumentListTail(openParenToken: Node): ArgumentList {
        var elements = this.parseList<Argument>(ParsingContext.Arguments);
        var closeParenToken = this.parseToken(SyntaxKind.CloseParenToken);
        var node = new ArgumentList(openParenToken, elements, closeParenToken);
        return this.finishNode(node, openParenToken.pos);
    }

    private tryParseArgumentList(): ArgumentList {
        var openParenToken = this.parseToken(SyntaxKind.OpenParenToken);
        if (openParenToken) {
            return this.parseArgumentListTail(openParenToken);
        }
        return undefined;
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
        var fullStart = this.scanner.getStartPos();
        var oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        var ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        var symbols = this.parseList<LexicalSymbol>(ParsingContext.OneOfSymbolList);
        var node = new OneOfSymbol(oneKeyword, ofKeyword, symbols);
        return this.finishNode(node, fullStart);
    }
    
    private parseInvalidSymbol(): LexicalSymbol {
        var fullStart = this.scanner.getStartPos();
        var node = new LexicalSymbol(SyntaxKind.InvalidSymbol);
        this.skipUntil(isInvalidSymbolRecoveryToken);
        return this.finishNode(node, fullStart);
    }

    private parsePrimarySymbol(allowOptional: boolean): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.UnicodeCharacterLiteral:
                return this.parseUnicodeCharacterLiteral(allowOptional);
                
            case SyntaxKind.Terminal:
                return this.parseTerminal(allowOptional);

            case SyntaxKind.Identifier:
                return this.parseNonterminal(allowOptional);
                
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

    private tryParseButNotOperator(): ButNotOperator {
        var fullStart = this.scanner.getStartPos();
        var butKeyword = this.parseToken(SyntaxKind.ButKeyword);
        var notKeyword = this.parseToken(SyntaxKind.NotKeyword);
        if (butKeyword || notKeyword) {
            var node = new ButNotOperator(butKeyword, notKeyword);
            return this.finishNode(node, fullStart);
        }
        return undefined;
    }

    private parseBinarySymbolTail(left: LexicalSymbol, operator: ButNotOperator): BinarySymbol {
        var right = this.parseSymbol();
        var node = new BinarySymbol(left, operator, right);
        return this.finishNode(node, left.pos);
    }

    private parseSymbol(): LexicalSymbol {
        if (this.token === SyntaxKind.OpenBracketToken) {
            return this.parseAssertion();
        }
        
        let symbol = this.parseUnarySymbol();
        let operator = this.tryParseButNotOperator();
        if (operator) {
            return this.parseBinarySymbolTail(symbol, operator);
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
                return true;

            default:
                return false;
        }
    }

    private isStartOfRightHandSide(): boolean {
        return this.isStartOfSymbolSpan();
    }

    private parseRightHandSide(): RightHandSide {
        var fullStart = this.scanner.getStartPos();
        var head = this.parseSymbolSpan();
        var node = new RightHandSide(head);
        if (this.parsingContext !== ParsingContext.RightHandSideListIndented) {
            this.parseOptional(SyntaxKind.LineTerminatorToken);
        }
        return this.finishNode(node, fullStart);
    }

    private parseRightHandSideList(): RightHandSideList {
        var fullStart = this.scanner.getStartPos();
        var openIndentToken = this.parseToken(SyntaxKind.IndentToken);
        var elements = openIndentToken && this.parseList<RightHandSide>(ParsingContext.RightHandSideListIndented);
        var closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        var node = new RightHandSideList(openIndentToken, elements, closeIndentToken);
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
        var fullStart = this.scanner.getStartPos();
        var name = this.parseIdentifier();
        var parameters = this.tryParseParameterList();
        var colonToken = this.parseAnyToken(isProductionSeparatorToken);
        var body = this.parseBody();
        var node = new Production(name, parameters, colonToken, body);
        return this.finishNode(node, fullStart);
    }

    private isStartOfSourceElement(): boolean {
        switch (this.token) {
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

function isArgumentsRecoveryToken(token: SyntaxKind) {
    return token === SyntaxKind.CommaToken
        || token === SyntaxKind.QuestionToken
        || token === SyntaxKind.Identifier
        || token === SyntaxKind.CloseParenToken
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