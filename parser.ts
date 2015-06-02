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
    Grammar, 
    SourceFile,
    Constant,
    Literal,
    StringLiteral,
    NumericLiteral,
    Prose,
    Identifier,
    Type,
    DefinitionOption,
    Definition,
    Import,
    Parameter,
    ParameterList,
    OneOfList,
    Terminal,
    TerminalSet,
    Constraint,
    LookaheadConstraint,
    NoSymbolHereConstraint,
    LexicalGoalConstraint,
    ParameterValueConstraint,
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
    DefinitionOptions,
    Parameters,
    Arguments,
    RightHandSideListIndented,
    TerminalSet,
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

    public parseGrammar(files: string[], ioHost: Host): Grammar {
        var sources: SourceFile[] = [];
        for (var i = 0; i < files.length; i++) {
            var filename = files[i];
            var text = ioHost.readFile(filename);
            var sourceFile = this.parseSourceFile(filename, text);
            if (sourceFile) {
                sources.push(sourceFile);
            }
        }
        return new Grammar(sources);
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

    private skipUntil(token: SyntaxKind, token2?: SyntaxKind, token3?: SyntaxKind, token4?: SyntaxKind, token5?: SyntaxKind, token6?: SyntaxKind): void {
        while (this.token !== token
            && (!token2 || this.token !== token2)
            && (!token3 || this.token !== token3)
            && (!token4 || this.token !== token4)
            && (!token5 || this.token !== token5)
            && (!token6 || this.token !== token6)
            && !this.isEOF()) {
            this.nextToken();
        }
    }

    private skipPast(token: SyntaxKind): void {
        this.skipUntil(token);
        if (this.token === token) {
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
            case ParsingContext.DefinitionOptions:
                return this.isStartOfDefinitionOption();
            case ParsingContext.Parameters:
                return this.isStartOfParameter();
            case ParsingContext.Arguments:
                return this.isStartOfArgument();
            case ParsingContext.RightHandSideListIndented:
                return this.isStartOfRightHandSide();
            case ParsingContext.TerminalSet:
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

            case ParsingContext.DefinitionOptions:
            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
            case ParsingContext.TerminalSet:
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
            case ParsingContext.TerminalSet:
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
            case ParsingContext.DefinitionOptions:
                return this.parseDefinitionOption();
            case ParsingContext.Parameters:
                return this.parseParameter();
            case ParsingContext.Arguments:
                return this.parseArgument();
            case ParsingContext.RightHandSideListIndented:
                return this.parseRightHandSide();
            case ParsingContext.TerminalSet:
            case ParsingContext.OneOfList:
            case ParsingContext.OneOfListIndented:
                return this.parseTerminal();
            case ParsingContext.OneOfSymbolList:
                return this.parsePrimarySymbol();
            default:
                console.error(`Unexpected parsing context: ${ParsingContext[this.parsingContext]}`);
                return undefined;
        }
    }

    private recover(): void {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                this.skipUntil(SyntaxKind.LineTerminatorToken);
                break;

            case ParsingContext.DefinitionOptions:
                this.skipUntil(SyntaxKind.CommaToken, SyntaxKind.Identifier, SyntaxKind.CloseParenToken, SyntaxKind.LineTerminatorToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }
                break;

            case ParsingContext.Parameters:
                this.skipUntil(SyntaxKind.CommaToken, SyntaxKind.Identifier, SyntaxKind.CloseParenToken, SyntaxKind.ColonToken, SyntaxKind.LineTerminatorToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }
                break;

            case ParsingContext.Arguments:
                this.skipUntil(SyntaxKind.CommaToken, SyntaxKind.QuestionToken, SyntaxKind.Identifier, SyntaxKind.CloseParenToken, SyntaxKind.ColonToken, SyntaxKind.LineTerminatorToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }
                break;

            case ParsingContext.RightHandSideListIndented:
                this.skipUntil(SyntaxKind.DedentToken, SyntaxKind.LineTerminatorToken);
                break;

            case ParsingContext.TerminalSet:
                this.skipUntil(SyntaxKind.CommaToken, SyntaxKind.Terminal, SyntaxKind.CloseBraceToken, SyntaxKind.LineTerminatorToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }
                break;

            case ParsingContext.OneOfList:
                this.skipUntil(SyntaxKind.Terminal, SyntaxKind.LineTerminatorToken);
                break;

            case ParsingContext.OneOfListIndented:
                this.skipUntil(SyntaxKind.Terminal, SyntaxKind.LineTerminatorToken);
                if (this.token === SyntaxKind.LineTerminatorToken) {
                    this.nextToken();
                }
                break;

            case ParsingContext.OneOfSymbolList:
                this.skipUntil(SyntaxKind.OrKeyword, SyntaxKind.Terminal, SyntaxKind.Identifier, SyntaxKind.OpenBracketToken, SyntaxKind.QuestionToken, SyntaxKind.LineTerminatorToken);
                break;
        }
    }

    private reportDiagnostics(): void {
        switch (this.parsingContext) {
            case ParsingContext.SourceElements:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics.Production_expected);
                break;

            case ParsingContext.DefinitionOptions:
            case ParsingContext.Parameters:
            case ParsingContext.Arguments:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics._0_expected, formatList([SyntaxKind.CommaToken, SyntaxKind.CloseParenToken]));
                break;

            case ParsingContext.TerminalSet:
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

    private tryParseList<TNode extends Node>(openToken: SyntaxKind, separator: SyntaxKind, closeToken: SyntaxKind, listContext: ParsingContext): TNode[] {
        if (this.parseOptional(openToken)) {
            return this.parseList<TNode>(separator, closeToken, listContext);
        }
        return undefined;
    }

    private parseList<TNode extends Node>(separator: SyntaxKind, closeToken: SyntaxKind, listContext: ParsingContext): TNode[] {
        var result: TNode[];
        var saveContext = this.parsingContext;
        this.parsingContext = listContext;
        var whitespacetoSkip = this.shouldSkipWhitespace();
        while (!this.isEOF()) {
            this.skipWhitespace(whitespacetoSkip);

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

            if (closeToken && (this.shouldConsumeCloseToken() ? this.parseOptional(closeToken) : this.token === closeToken)) {
                break;
            }

            var hasSeparator = separator ? this.parseOptional(separator) : parsed;
            if (!hasSeparator) {
                if (!closeToken) {
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

    private parseStringLiteral(): StringLiteral {
        var fullStart = this.scanner.getStartPos();
        var text = this.readTokenValue(SyntaxKind.StringLiteral);
        var node = new StringLiteral(text);
        return this.finishNode(node, fullStart);
    }

    private parseNumericLiteral(): NumericLiteral {
        var fullStart = this.scanner.getStartPos();
        var text = this.readTokenValue(SyntaxKind.NumericLiteral);
        var node = new NumericLiteral(text);
        return this.finishNode(node, fullStart);
    }

    private parseConstant(): Constant {
        switch (this.token) {
            case SyntaxKind.StringLiteral:
                return this.parseStringLiteral();
            case SyntaxKind.NumericLiteral:
                return this.parseNumericLiteral();
            case SyntaxKind.TrueKeyword:
            case SyntaxKind.FalseKeyword:
                return this.finishNode(new Constant(this.token), this.scanner.getStartPos());
            default:
                return undefined;
        }
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

    private parseProse(): Prose {
        var fullStart = this.scanner.getStartPos();
        var text = this.readTokenValue(SyntaxKind.Prose);
        var node = new Prose(text);
        return this.finishNode(node, fullStart);
    }

    private parseType(): Type {
        var fullStart = this.scanner.getStartPos();
        var atToken = this.parseToken(SyntaxKind.AtToken);
        var name = this.parseIdentifier();
        var node = new Type(atToken, name);
        return this.finishNode(node, fullStart);
    }

    private tryParseType(): Type {
        if (this.token === SyntaxKind.AtToken) {
            return this.parseType();
        }
        return undefined;
    }

    private isStartOfDefinitionOption(): boolean {
        return this.canBeIdentifier(this.token);
    }

    private parseDefinitionOption(): DefinitionOption {
        var fullStart = this.scanner.getStartPos();
        var name = this.parseIdentifier();
        var equalsToken = this.parseToken(SyntaxKind.EqualsToken);
        var value = this.parseConstant();
        var node = new DefinitionOption(name, equalsToken, value);
        return this.finishNode(node, fullStart);
    }

    private tryParseDefinitionOptionList(): DefinitionOption[] {
        return this.tryParseList<DefinitionOption>(
            SyntaxKind.OpenParenToken,
            SyntaxKind.CommaToken,
            SyntaxKind.CloseParenToken,
            ParsingContext.DefinitionOptions);
    }

    private parseDefinition(): Definition {
        var fullStart = this.scanner.getStartPos();
        var defineKeyword = this.parseToken(SyntaxKind.DefineKeyword);
        var type = this.parseType();
        var options = this.tryParseDefinitionOptionList();
        this.parseOptional(SyntaxKind.LineTerminatorToken);
        var node = new Definition(defineKeyword, type, options);
        return this.finishNode(node, fullStart);
    }

    private parseImport(): Import {
        var fullStart = this.scanner.getStartPos();
        var importKeyword = this.parseToken(SyntaxKind.ImportKeyword);
        var file = this.parseStringLiteral();
        var asKeyword = this.parseToken(SyntaxKind.AsKeyword);
        var type = this.parseType();
        this.parseOptional(SyntaxKind.LineTerminatorToken);
        var node = new Import(importKeyword, file, asKeyword, type);
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
        var elements = this.parseList<Parameter>(SyntaxKind.CommaToken, SyntaxKind.CloseParenToken, ParsingContext.Parameters);
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
        var terminals = this.parseList<Terminal>(
            SyntaxKind.Unknown,
            openIndentToken ? SyntaxKind.DedentToken : SyntaxKind.LineTerminatorToken,
            openIndentToken ? ParsingContext.OneOfListIndented : ParsingContext.OneOfList);
        var closeIndentToken = this.parseToken(SyntaxKind.DedentToken);
        var node = new OneOfList(oneKeyword, ofKeyword, openIndentToken, terminals, closeIndentToken);
        return this.finishNode(node, oneKeyword.pos);
    }

    private parseTerminalSetTail(openBraceToken: Node): TerminalSet {
        var terminals = this.parseList<Terminal>(SyntaxKind.CommaToken, SyntaxKind.CloseBraceToken, ParsingContext.TerminalSet);
        var closeBraceToken = this.parseToken(SyntaxKind.CloseBraceToken);
        var node = new TerminalSet(openBraceToken, terminals, closeBraceToken);
        return this.finishNode(node, openBraceToken.pos);
    }

    private parseTerminalOrTerminalSet(): Terminal | TerminalSet {
        var openBraceToken = this.parseToken(SyntaxKind.OpenBraceToken);
        if (openBraceToken) {
            return this.parseTerminalSetTail(openBraceToken);
        }
        else {
            return this.parseTerminal();
        }
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

    private parseLookaheadConstraintTail(openBracketToken: Node): LookaheadConstraint {
        var lookaheadKeyword = this.parseToken(SyntaxKind.LookaheadKeyword);
        var operatorToken = this.parseAnyLookaheadOperator();
        var lookahead = this.parseTerminalOrTerminalSet();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new LookaheadConstraint(openBracketToken, lookaheadKeyword, operatorToken, lookahead, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseNoSymbolHereConstraintTail(openBracketToken: Node): NoSymbolHereConstraint {
        var noKeyword = this.parseToken(SyntaxKind.NoKeyword);
        var symbol = this.parseIdentifier();
        var hereKeyword = this.parseToken(SyntaxKind.HereKeyword);
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new NoSymbolHereConstraint(openBracketToken, noKeyword, symbol, hereKeyword, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseLexicalGoalConstraintTail(openBracketToken: Node): LexicalGoalConstraint {
        var fullStart = this.scanner.getStartPos();
        var lexicalKeyword = this.parseToken(SyntaxKind.LexicalKeyword);
        var goalKeyword = this.parseToken(SyntaxKind.GoalKeyword);
        var symbol = this.parseIdentifier();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new LexicalGoalConstraint(openBracketToken, lexicalKeyword, goalKeyword, symbol, closeBracketToken);
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

    private parseParameterValueConstraintTail(openBracketToken: Node): ParameterValueConstraint {
        var operatorToken = this.parseAnyParameterValueOperator();
        var name = this.parseIdentifier();
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new ParameterValueConstraint(openBracketToken, operatorToken, name, closeBracketToken);
        return this.finishNode(node, openBracketToken.pos);
    }

    private parseInvalidConstraintTail(openBracketToken: Node): Constraint {
        var fullStart = this.scanner.getStartPos();
        this.skipUntil(SyntaxKind.CloseBracketToken, SyntaxKind.LineTerminatorToken, SyntaxKind.Terminal, SyntaxKind.Identifier);
        var closeBracketToken = this.parseToken(SyntaxKind.CloseBracketToken);
        var node = new Constraint(SyntaxKind.InvalidConstraint, openBracketToken, closeBracketToken);
        this.finishNode(node, fullStart);
        return node;
    }

    private tryParseConstraint(): Constraint {
        var openBracketToken = this.parseToken(SyntaxKind.OpenBracketToken);
        if (openBracketToken) {
            switch (this.token) {
                case SyntaxKind.LookaheadKeyword:
                    return this.parseLookaheadConstraintTail(openBracketToken);
                case SyntaxKind.NoKeyword:
                    return this.parseNoSymbolHereConstraintTail(openBracketToken);
                case SyntaxKind.LexicalKeyword:
                    return this.parseLexicalGoalConstraintTail(openBracketToken);
                case SyntaxKind.TildeToken:
                case SyntaxKind.PlusToken:
                    return this.parseParameterValueConstraintTail(openBracketToken);
                default:
                    return this.parseInvalidConstraintTail(openBracketToken);
            }
        }
        return undefined;
    }

    private parseTerminal(): Terminal {
        var fullStart = this.scanner.getStartPos();
        var text = this.readTokenValue(SyntaxKind.Terminal);
        var node = new Terminal(text);
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
        var elements = this.parseList<Argument>(SyntaxKind.CommaToken, SyntaxKind.CloseParenToken, ParsingContext.Arguments);
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

    private parseNonterminal(): Nonterminal {
        var fullStart = this.scanner.getStartPos();
        var name = this.parseIdentifier();
        var argumentList = this.tryParseArgumentList();
        var node = new Nonterminal(name, argumentList);
        return this.finishNode(node, fullStart);
    }

    private parseOneOfSymbol(): OneOfSymbol {
        var fullStart = this.scanner.getStartPos();
        var oneKeyword = this.parseToken(SyntaxKind.OneKeyword);
        var ofKeyword = this.parseToken(SyntaxKind.OfKeyword);
        var symbols = this.parseList<LexicalSymbol>(SyntaxKind.OrKeyword, SyntaxKind.Unknown, ParsingContext.OneOfSymbolList);
        var node = new OneOfSymbol(oneKeyword, ofKeyword, symbols);
        return this.finishNode(node, fullStart);
    }

    private parseInvalidSymbol(): LexicalSymbol {
        var fullStart = this.scanner.getStartPos();
        var node = new LexicalSymbol(SyntaxKind.InvalidSymbol);
        this.skipUntil(SyntaxKind.OpenBracketToken, SyntaxKind.Terminal, SyntaxKind.Identifier, SyntaxKind.LineTerminatorToken);
        return this.finishNode(node, fullStart);
    }

    private parsePrimarySymbol(): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.Prose:
                return this.parseProse();

            case SyntaxKind.Terminal:
                return this.parseTerminal();

            case SyntaxKind.Identifier:
                return this.parseNonterminal();

            default:
                return this.parseInvalidSymbol();
        }
    }

    private parseUnarySymbol(): LexicalSymbol {
        switch (this.token) {
            case SyntaxKind.OneKeyword:
                return this.parseOneOfSymbol();

            default:
                return this.parsePrimarySymbol();
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
        var symbol = this.parseUnarySymbol();
        var operator = this.tryParseButNotOperator();
        if (operator) {
            return this.parseBinarySymbolTail(symbol, operator);
        }
        return symbol;
    }

    private tryParseSymbolSpan(): SymbolSpan {
        if (this.isStartOfSymbolSpan()) {
            return this.parseSymbolSpan();
        }
        return undefined;
    }

    private parseSymbolSpan(): SymbolSpan {
        var fullStart = this.scanner.getStartPos();
        var constraint = this.tryParseConstraint();
        var symbol = this.parseSymbol();
        var questionToken = this.parseToken(SyntaxKind.QuestionToken);
        var next = this.tryParseSymbolSpan();
        var node = new SymbolSpan(constraint, symbol, questionToken, next);
        return this.finishNode(node, fullStart);
    }

    private isStartOfSymbolSpan(): boolean {
        switch (this.token) {
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
        var elements = openIndentToken && this.parseList<RightHandSide>(SyntaxKind.LineTerminatorToken, SyntaxKind.DedentToken, ParsingContext.RightHandSideListIndented);
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
        var type = this.tryParseType();
        var name = this.parseIdentifier();
        var parameters = this.tryParseParameterList();
        var colonToken = this.parseToken(SyntaxKind.ColonToken);
        var body = this.parseBody();
        var node = new Production(type, name, parameters, colonToken, body);
        return this.finishNode(node, fullStart);
    }

    private isStartOfSourceElement(): boolean {
        switch (this.token) {
            case SyntaxKind.DefineKeyword:
            case SyntaxKind.ImportKeyword:
            case SyntaxKind.Identifier: // Production
            case SyntaxKind.AtToken: // Typeopt
                return true;

            case SyntaxKind.ColonToken:
            case SyntaxKind.OpenParenToken:                    
                // Assume we're parsing a production for error recovery purposes
                return true;

            default:
                return false;
        }
    }

    private parseSourceElement(): SourceElement {
        switch (this.token) {
            case SyntaxKind.DefineKeyword:
                return this.parseDefinition();
            case SyntaxKind.ImportKeyword:
                return this.parseImport();
            case SyntaxKind.AtToken:
            case SyntaxKind.Identifier:
                return this.parseProduction();
            default:
                this.diagnostics.report(this.scanner.getStartPos(), Diagnostics.Unexpected_token_0_, tokenToString(this.token));
                return;
        }
    }

    private parseSourceElementList(): SourceElement[] {
        return this.parseList<SourceElement>(
            SyntaxKind.Unknown,
            SyntaxKind.EndOfFileToken,
            ParsingContext.SourceElements);
    }
}