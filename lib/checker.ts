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
import { Hash, createHash } from "crypto";
import { Dict } from "./core";
import { Diagnostics, DiagnosticMessages, Diagnostic, formatList } from "./diagnostics";
import { SyntaxKind, tokenToString } from "./tokens";
import { Symbol, SymbolKind, SymbolTable } from "./symbols";
import { Binder, BindingTable } from "./binder";
import { StringWriter } from "./stringwriter";
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
    OptionalSymbol,
    ButNotOperator,
    BinarySymbol,
    SymbolSpan,
    LinkReference,
    RightHandSide,
    RightHandSideList,
    Production,
    SourceElement,
    forEachChild
} from "./nodes";

export class Checker {
    private checkedFileSet = new Dict<boolean>();
    private bindings: BindingTable;
    private diagnostics: DiagnosticMessages;
    private binder: Binder;
    private innerResolver: Resolver;
    private sourceFile: SourceFile;

    constructor(bindings: BindingTable, diagnostics: DiagnosticMessages) {
        this.bindings = bindings;
        this.diagnostics = diagnostics;
    }
    
    public get resolver(): Resolver {
        if (!this.innerResolver) {
            this.innerResolver = this.createResolver(this.bindings);
        }
        
        return this.innerResolver;
    } 

    public checkSourceFile(sourceFile: SourceFile): void {
        if (!Dict.has(this.checkedFileSet, sourceFile.filename)) {
            Dict.set(this.checkedFileSet, sourceFile.filename, true);
            this.sourceFile = sourceFile;
            this.diagnostics.setSourceFile(this.sourceFile);
            for (let element of sourceFile.elements) {
                this.checkSourceElement(element);
            }
        }
    }
    
    protected createResolver(bindings: BindingTable): Resolver {
        return new Resolver(bindings);
    }

    private checkSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Production:
                this.checkProduction(<Production>node);
                break;
                
            case SyntaxKind.InvalidSourceElement:
                this.reportInvalidSourceElement(<SourceElement>node);
                break;
        }
    }

    private checkProduction(node: Production): void {
        this.checkGrammarProduction(node);
        this.checkIdentifier(node.name);

        if (node.parameterList) {
            this.checkParameterList(node.parameterList);
        }
        
        if (node.body) {
            switch (node.body.kind) {
                case SyntaxKind.OneOfList:
                    this.checkOneOfList(<OneOfList>node.body);
                    break;

                case SyntaxKind.RightHandSideList:
                    this.checkRightHandSideList(<RightHandSideList>node.body);
                    break;

                case SyntaxKind.RightHandSide:
                    this.checkRightHandSide(<RightHandSide>node.body);
                    break;
            }
        }
    }
    
    private checkGrammarProduction(node: Production): boolean {
        let pos = node.name.end;
        if (node.parameterList) {
            pos = node.parameterList.end;
        }
        
        if (!node.colonToken) {
            return this.reportGrammarError(pos, Diagnostics._0_expected, tokenToString(SyntaxKind.ColonToken));
        }
        
        pos += node.colonToken.end;
        if (!node.body) {
            return this.reportGrammarError(pos, Diagnostics._0_expected, formatList([
                SyntaxKind.OneOfList,
                SyntaxKind.RightHandSide,
            ]));
        }
        
        switch (node.body.kind) {
            case SyntaxKind.OneOfList:
            case SyntaxKind.RightHandSide:
            case SyntaxKind.RightHandSideList:
                break;
                
            default:
                return this.reportGrammarError(pos, Diagnostics._0_expected, formatList([
                    SyntaxKind.OneOfList,
                    SyntaxKind.RightHandSide,
                ]));
        }
        
        return false;
    }

    private checkParameterList(node: ParameterList): void {
        for (let element of node.elements) {
            this.checkParameter(element);
        }
    }

    private checkParameter(node: Parameter): void {
        this.checkIdentifier(node.name);
    }

    private checkOneOfList(node: OneOfList): void {
        this.checkGrammarOneOfList(node);
        
        if (node.terminals) {
            let terminalSet = new Dict<boolean>();
            for (let terminal of node.terminals) {
                let text = terminal.text;
                if (Dict.has(terminalSet, text)) {
                    this.diagnostics.reportNode(terminal, Diagnostics.Duplicate_terminal_0_, text);
                }
                else {
                    Dict.set(terminalSet, text, true);
                    this.checkTerminal(terminal);
                }
            }
        }
    }
    
    private checkGrammarOneOfList(node: OneOfList): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }

        if (!node.ofKeyword) {
            return this.reportGrammarError(node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }

        if (!node.terminals) {
            return this.reportGrammarError(node.ofKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
        }
        
        if (node.openIndentToken && !node.closeIndentToken) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.DedentToken));
        }
        
        return false;
    }
    
    private checkRightHandSideList(node: RightHandSideList): void {
        this.checkGrammarRightHandSideList(node);
        
        if (node.elements) {
            for (let element of node.elements) {
                this.checkRightHandSide(element);
            }
        }
    }
    
    private checkGrammarRightHandSideList(node: RightHandSideList): boolean {
        if (!node.openIndentToken) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.IndentToken));
        }
        
        if (!node.elements || node.elements.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                SyntaxKind.Terminal, 
                SyntaxKind.Identifier, 
                SyntaxKind.OpenBracketToken
            ]));
        }

        if (!node.closeIndentToken) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.DedentToken));
        }
        
        return false;
    }

    private checkRightHandSide(node: RightHandSide): void {
        this.checkSymbolSpan(node.head);
        if (node.reference) {
            this.checkLinkReference(node.reference);
        }
    }
    
    private checkLinkReference(node: LinkReference) {
        this.checkGrammarLinkReference(node);
    }
    
    private checkGrammarLinkReference(node: LinkReference): boolean {
        if (!node.text) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, "string");
        }
        
        return false;
    }

    private checkSymbolSpan(node: SymbolSpan): void {
        this.checkGrammarSymbolSpan(node);
        this.checkSymbolSpanOrHigher(node.symbol);
        
        if (node.next) {
            this.checkSymbolSpanRest(node.next);
        }            
    }
    
    private checkGrammarSymbolSpan(node: SymbolSpan): boolean {
        if (!node.symbol) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.Terminal,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                SyntaxKind.Prose
            ]));
        }
        
        if (node.next) {
            if (node.symbol.kind === SyntaxKind.Prose) {
                return this.reportGrammarError(node.symbol.end, Diagnostics._0_expected, tokenToString(SyntaxKind.LineTerminatorToken));
            }
        }
        
        return false;
    }

    private checkSymbolSpanOrHigher(node: LexicalSymbol): void {
        if (node.kind === SyntaxKind.Prose) {
            this.checkProse(<Prose>node);
            return;
        }
        
        this.checkSymbolOrHigher(node);
    }

    private checkProse(node: Prose): void {
        if (typeof node.text !== "string") {
            this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
    }

    private checkSymbolSpanRest(node: SymbolSpan): void {
        this.checkGrammarSymbolSpanRest(node);
        this.checkSymbolOrHigher(node.symbol);
        
        if (node.next) {
            this.checkSymbolSpanRest(node.next);
        }
    }

    private checkGrammarSymbolSpanRest(node: SymbolSpan): boolean {
        if (!node.symbol) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.Terminal,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                SyntaxKind.LineTerminatorToken
            ]));
        }

        if (node.symbol.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node.symbol.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.LineTerminatorToken));
        }
        
        if (node.next && node.next.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node.next.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.LineTerminatorToken));
        }
        
        return false;
    }
    
    private checkSymbolOrHigher(node: LexicalSymbol): void {
        if (isAssertion(node)) {
            this.checkAssertion(<Assertion>node);
            return;            
        }
        
        this.checkBinarySymbolOrHigher(node);
    }
    
    private checkAssertion(node: Assertion): void {
        switch (node.kind) {
            case SyntaxKind.EmptyAssertion:
                this.checkEmptyAssertion(<EmptyAssertion>node);
                break;
                
            case SyntaxKind.LookaheadAssertion:
                this.checkLookaheadAssertion(<LookaheadAssertion>node);
                break;
                
            case SyntaxKind.LexicalGoalAssertion:
                this.checkLexicalGoalAssertion(<LexicalGoalAssertion>node);
                break;
                
            case SyntaxKind.NoSymbolHereAssertion:
                this.checkNoSymbolHereAssertion(<NoSymbolHereAssertion>node);
                break;
                
            case SyntaxKind.ParameterValueAssertion:
                this.checkParameterValueAssertion(<ParameterValueAssertion>node);
                break;
                
            case SyntaxKind.InvalidAssertion:
                this.reportInvalidAssertion(<Assertion>node);
                break;
        }
    }
    
    private checkGrammarAssertionHead(node: Assertion): boolean {
        if (!node.openBracketToken) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }
        
        return false;
    }
    
    private checkGrammarAssertionTail(node: Assertion): boolean {
        if (!node.closeBracketToken) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
        }
        
        return false;
    }

    private checkEmptyAssertion(node: EmptyAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarEmptyAssertion(node) || this.checkGrammarAssertionTail(node);
    }
    
    private checkGrammarEmptyAssertion(node: EmptyAssertion): boolean {
        if (!node.emptyKeyword) {
            return this.reportGrammarError(node.openBracketToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.EmptyKeyword, /*quoted*/ true));
        }
    }

    private checkLookaheadAssertion(node: LookaheadAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarLookaheadAssertion(node) || this.checkGrammarAssertionTail(node);
        
        if (node.lookahead) {
            if (node.lookahead.kind === SyntaxKind.SymbolSet) {
                this.checkSymbolSet(<SymbolSet>node.lookahead);
                return;
            }
            
            this.checkSymbolSpanRest(<SymbolSpan>node.lookahead);
        }
    }
    
    private checkGrammarLookaheadAssertion(node: LookaheadAssertion): boolean {
        if (!node.lookaheadKeyword) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.LookaheadKeyword, /*quoted*/ true));
        }

        if (!node.operatorToken) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                SyntaxKind.EqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken,
                SyntaxKind.LessThanMinusToken,
                SyntaxKind.LessThanExclamationToken
            ]));
        }

        switch (node.operatorToken.kind) {
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.LessThanExclamationToken:
                break;

            default:
                return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                    SyntaxKind.EqualsEqualsToken,
                    SyntaxKind.ExclamationEqualsToken,
                    SyntaxKind.LessThanMinusToken,
                    SyntaxKind.LessThanExclamationToken
                ]));
        }

        if (!node.lookahead) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsToken:
                    return this.reportGrammarError(node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
                    
                case SyntaxKind.LessThanMinusToken:
                case SyntaxKind.LessThanExclamationToken:
                    return this.reportGrammarError(node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
            }
        }

        switch (node.operatorToken.kind) {
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
                if (node.lookahead.kind !== SyntaxKind.SymbolSpan) {
                    return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                        SyntaxKind.Terminal,
                        SyntaxKind.Identifier,
                        SyntaxKind.UnicodeCharacterLiteral
                    ]));
                }
                
                break;

            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.LessThanExclamationToken:
                if (node.lookahead.kind !== SyntaxKind.SymbolSet) {
                    return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
                }
                
                break;
        }
        
        return false;
    }

    private checkSymbolSet(node: SymbolSet): void {
        this.checkGrammarSymbolSet(node);
        
        if (node.elements) {
            for (let element of node.elements) {
                this.checkSymbolSpanRest(element);
            }
        }
    }
    
    private checkGrammarSymbolSet(node: SymbolSet): boolean {
        if (!node.openBraceToken) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
        }
        
        if (!node.elements) {
            return this.reportGrammarError(node.openBraceToken.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
                SyntaxKind.UnicodeCharacterLiteral
            ]));
        }
        
        if (!node.closeBraceToken) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBraceToken));
        }
        
        return false;
    }
    
    private checkLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarLexicalGoalAssertion(node) || this.checkGrammarAssertionTail(node);
        
        if (node.symbol) {
            this.checkIdentifier(node.symbol);
        }
    }
    
    private checkGrammarLexicalGoalAssertion(node: LexicalGoalAssertion): boolean {
        if (!node.lexicalKeyword) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.LexicalKeyword));
        }
        
        if (!node.goalKeyword) {
            return this.reportGrammarError(node.lexicalKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.GoalKeyword));
        }
        
        if (!node.symbol) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        
        return false;
    }

    private checkNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarNoSymbolHereAssertion(node) || this.checkGrammarAssertionTail(node);
        
        if (node.symbols) {
            for (let symbol of node.symbols) {
                this.checkPrimarySymbol(symbol);
            }
        }
    }
    
    private checkGrammarNoSymbolHereAssertion(node: NoSymbolHereAssertion): boolean {
        if (!node.noKeyword) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.NoKeyword));
        }
        
        if (!node.symbols || node.symbols.length <= 0) {
            return this.reportGrammarError(node.noKeyword.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
                SyntaxKind.UnicodeCharacterLiteral
            ]));
        }
        
        if (!node.hereKeyword) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.HereKeyword));
        }
        
        return false;
    }

    private checkParameterValueAssertion(node: ParameterValueAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarParameterValueAssertion(node) || this.checkGrammarAssertionTail(node);
        
        if (node.name) {
            this.checkIdentifier(node.name);
        }
    }

    private checkGrammarParameterValueAssertion(node: ParameterValueAssertion): boolean {
        if (node.operatorToken) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.TildeToken:
                case SyntaxKind.PlusToken:
                    break;
                    
                default:
                    return this.reportGrammarErrorForNode(node.operatorToken, Diagnostics.Unexpected_token_0_, tokenToString(node.operatorToken.kind));
            }
        }
        
        return false;
    }

    private reportInvalidAssertion(node: Assertion): void {
        if (this.checkGrammarAssertionHead(node)) {
            return;
        }
        
        this.reportGrammarError(node.openBracketToken.end, Diagnostics._0_expected, formatList([
            SyntaxKind.LookaheadKeyword,
            SyntaxKind.LexicalKeyword,
            SyntaxKind.NoKeyword,
            SyntaxKind.TildeToken,
            SyntaxKind.PlusToken
        ]));
    }
    
    private checkBinarySymbolOrHigher(node: LexicalSymbol) {
        if (node.kind === SyntaxKind.BinarySymbol) {
            this.checkBinarySymbol(<BinarySymbol>node);
            return;
        }
        
        this.checkUnarySymbolOrHigher(node);
    }

    private checkBinarySymbol(node: BinarySymbol): void {
        this.checkGrammarBinarySymbol(node);
        this.checkUnarySymbolOrHigher(node.left);
        this.checkUnarySymbolOrHigher(node.right);
    }

    private checkGrammarBinarySymbol(node: BinarySymbol): boolean {
        let operator = <ButNotOperator>node.operatorToken;
        if (!operator.butKeyword) {
            return this.reportGrammarError(operator.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.ButKeyword));
        }
        
        if (!operator.notKeyword) {
            return this.reportGrammarError(operator.butKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.ButKeyword));
        }
        
        if (!node.right) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.OneKeyword
            ]));
        }
        
        return false;
    }

    private checkUnarySymbolOrHigher(node: LexicalSymbol) {
        if (node.kind === SyntaxKind.OneOfSymbol) {
            this.checkOneOfSymbol(<OneOfSymbol>node);
            return;
        }
        
        this.checkOptionalSymbolOrHigher(node);
    }

    private checkOneOfSymbol(node: OneOfSymbol): void {
        this.checkGrammarOneOfSymbol(node);
        
        if (node.symbols) {
            for (let symbol of node.symbols) {
                this.checkPrimarySymbol(symbol);
            }
        }
    }
    
    private checkGrammarOneOfSymbol(node: OneOfSymbol): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }
        
        if (!node.ofKeyword) {
            return this.reportGrammarError(node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }
        
        if (!node.symbols || node.symbols.length <= 0) {
            return this.reportGrammarError(node.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
                SyntaxKind.UnicodeCharacterLiteral
            ]));
        }
        
        return false;
    }
    
    private checkOptionalSymbolOrHigher(node: LexicalSymbol): void {
        this.checkPrimarySymbol(node, true);
    }
    
    private checkPrimarySymbol(node: LexicalSymbol, allowOptional?: boolean): void {
        switch (node.kind) {
            case SyntaxKind.Terminal:
                this.checkTerminal(<Terminal>node, allowOptional);
                break;

            case SyntaxKind.UnicodeCharacterLiteral:
                this.checkUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node, allowOptional);
                break;

            case SyntaxKind.Nonterminal:
                this.checkNonterminal(<Nonterminal>node, allowOptional);
                break;
                
            default:
                this.reportInvalidSymbol(<LexicalSymbol>node);
                break;
        }
    }
    
    private checkGrammarOptionalSymbol(node: OptionalSymbol, allowOptional: boolean) {
        if (node.questionToken) {
            if (!allowOptional || node.questionToken.kind !== SyntaxKind.QuestionToken) {
                return this.reportGrammarErrorForNode(node.questionToken, Diagnostics.Unexpected_token_0_, tokenToString(node.questionToken.kind));
            }
        }
        
        return false;
    }

    private checkTerminal(node: Terminal, allowOptional?: boolean): void {
        this.checkGrammarOptionalSymbol(node, allowOptional) || this.checkGrammarTerminal(node);
    }
    
    private checkGrammarTerminal(node: Terminal): boolean {
        if (typeof node.text !== "string" || node.text.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
        }
        
        return false;
    }

    private checkUnicodeCharacterLiteral(node: UnicodeCharacterLiteral, allowOptional?: boolean): void {
        this.checkGrammarOptionalSymbol(node, allowOptional) || this.checkGrammarUnicodeCharacterLiteral(node);
    }

    private checkGrammarUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): boolean {
        if (typeof node.text !== "string" || node.text.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
        
        return false;
    }

    private checkNonterminal(node: Nonterminal, allowOptional?: boolean): void {
        this.checkGrammarOptionalSymbol(node, allowOptional);
        this.checkIdentifier(node.name);
        
        if (node.argumentList) {
            this.checkArgumentList(node.argumentList);
        }
    }

    private checkArgumentList(node: ArgumentList): void {
        this.checkGrammarArgumentList(node);
        
        if (node.elements) {
            for (let element of node.elements) {
                this.checkArgument(element);
            }
        }
    }
    
    private checkGrammarArgumentList(node: ArgumentList): boolean {
        if (!node.openParenToken) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenParenToken));
        }
        
        if (!node.elements) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        
        if (!node.closeParenToken) {
            return this.reportGrammarError(node.pos, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseParenToken));
        }
        
        return false;
    }

    private checkArgument(node: Argument): void {
        this.checkGrammarArgument(node);
        this.checkIdentifier(node.name);
    }
    
    private checkGrammarArgument(node: Argument): boolean {
        if (node.questionToken && node.questionToken.kind !== SyntaxKind.QuestionToken) {
            return this.reportGrammarErrorForNode(node.questionToken, Diagnostics.Unexpected_token_0_, tokenToString(node.questionToken.kind));
        }
        
        return false;
    }

    private reportInvalidSymbol(node: LexicalSymbol): void {
        this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.Terminal,
            SyntaxKind.Identifier,
            SyntaxKind.OpenBracketToken,
            SyntaxKind.OneKeyword
        ]));
    }

    private checkIdentifier(node: Identifier): void {
        this.checkGrammarIdentifier(node);

        if (node.text) {
            let parent = this.bindings.getParent(node);
            if (parent) {
                let symbol: Symbol;
                switch (parent.kind) {
                    case SyntaxKind.Parameter:
                        symbol = this.resolveSymbol(node, node.text, SymbolKind.Parameter);

                        let declarationSymbol = this.bindings.getSymbol(parent);
                        if (declarationSymbol !== symbol) {
                            this.diagnostics.reportNode(node, Diagnostics.Duplicate_identifier_0_, node.text);
                        }
                        
                        return;
                        
                    case SyntaxKind.Production:
                        return;
                        
                    case SyntaxKind.LookaheadAssertion:
                    case SyntaxKind.Nonterminal:
                        symbol = this.resolveSymbol(node, node.text, SymbolKind.Production, Diagnostics.Cannot_find_name_0_);
                        break;

                    case SyntaxKind.Argument:
                        let argument = <Argument>parent;
                        if (argument.questionToken) {
                            symbol = this.resolveSymbol(node, node.text, SymbolKind.Parameter, Diagnostics.Cannot_find_name_0_);
                        }
                        else {
                            // get the symbol of the parameter of the target production
                            let nonterminal = <Nonterminal>this.bindings.getAncestor(parent, SyntaxKind.Nonterminal);
                            if (nonterminal && nonterminal.name && nonterminal.name.text) {
                                let productionSymbol = this.resolveSymbol(node, nonterminal.name.text, SymbolKind.Production);
                                if (productionSymbol) {
                                    let production = <Production>this.bindings.getDeclarations(productionSymbol)[0];
                                    symbol = this.resolveSymbol(production, node.text, SymbolKind.Parameter, Diagnostics.Cannot_find_name_0_);                                    
                                }
                            }
                        }
                        
                        break;
                }
                
                this.bindings.setSymbol(node, symbol);
            }
        }
    }
    
    private checkGrammarIdentifier(node: Identifier): boolean {
        if (typeof node.text === "undefined" && node.text.length <= 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        
        return false;
    }

    private reportInvalidSourceElement(node: SourceElement): void {
        this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.Production
        ]));
    }
    
    private resolveSymbol(location: Node, name: string, meaning: SymbolKind, diagnosticMessage?: Diagnostic): Symbol {
        let result = this.bindings.resolveSymbol(location, name, meaning);
        if (!result && diagnosticMessage) {
            this.diagnostics.reportNode(location, diagnosticMessage, name);
        }
        
        return result;
    }

    private reportGrammarError(pos: number, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        this.diagnostics.report(pos, diagnosticMessage, arg0, arg1, arg2);
        return true;
    }
    
    private reportGrammarErrorForNode(location: Node, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        this.diagnostics.reportNode(location, diagnosticMessage, arg0, arg1, arg2);
        return true;
    }
}

export class Resolver {
    private bindings: BindingTable;
    
    constructor(bindings: BindingTable) {
        this.bindings = bindings;
    }
    
    public getProductionLinkId(node: Identifier): string {
        let symbol = this.bindings.resolveSymbol(node, node.text, SymbolKind.Production);
        if (symbol) {
            return symbol.name;
        }
        
        return undefined;
    }
    
    public getRightHandSideLinkId(node: RightHandSide, includePrefix: boolean): string {
        let linkId: string;
        if (node.reference && node.reference.text) {
            linkId = node.reference.text.replace(/[^a-z0-9]+/g, '-');
        }
        else {
            let digest = new RightHandSideDigest();
            linkId = digest.computeHash(node).toLowerCase();
        }

        if (includePrefix) {
            let production = <Production>this.bindings.getAncestor(node, SyntaxKind.Production);
            let productionId = this.getProductionLinkId(production.name);
            return productionId + "-" + linkId;
        }
        
        return linkId;
    }
}

class RightHandSideDigest {
    private spaceRequested: boolean;
    private writer: StringWriter;
    
    public computeHash(node: RightHandSide): string {
        this.writer = new StringWriter();
        this.writeNode(node.head);

        let hash = createHash("sha1");
        hash.update(this.writer.toString(), "utf8");
        let digest = hash.digest("hex");
        return digest.substr(0, 8);
    }
    
    private writeNode(node: Node) {
        if (!node) {
            return;
        }
        
        switch (node.kind) {
            case SyntaxKind.Terminal: this.writeTerminal(<Terminal>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.writeUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
            case SyntaxKind.Prose: this.writeProse(<Prose>node); break;
            case SyntaxKind.Nonterminal: this.writeNonterminal(<Nonterminal>node); break;
            case SyntaxKind.EmptyAssertion: this.writeEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.writeLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: this.writeLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.writeNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
            case SyntaxKind.ParameterValueAssertion: this.writeParameterValueAssertion(<ParameterValueAssertion>node); break;
            case SyntaxKind.BinarySymbol: this.writeBinarySymbol(<BinarySymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.writeOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.SymbolSpan: this.writeSymbolSpan(<SymbolSpan>node); break;
            case SyntaxKind.SymbolSet: this.writeSymbolSet(<SymbolSet>node); break;
            case SyntaxKind.ArgumentList: this.writeArgumentList(<ArgumentList>node); break;
            case SyntaxKind.Argument: this.writeArgument(<Argument>node); break;
            case SyntaxKind.Identifier: this.writeIdentifier(<Identifier>node); break;
            default: 
                if ((node.kind >= SyntaxKind.FirstKeyword && node.kind <= SyntaxKind.LastKeyword) ||
                    (node.kind >= SyntaxKind.FirstPunctuation && node.kind <= SyntaxKind.LastKeyword)) {
                    this.writeToken(node);
                    break;
                }
                else {
                    forEachChild(node, child => this.writeNode(child));
                    break;
                }
        }
    }
    
    private write(text: string) {
        if (text) {
            if (this.spaceRequested && this.writer.size > 0) {
                this.spaceRequested = false;
                this.writer.write(" ");
            }
            
            this.writer.write(text);
        }
    }
    
    private writeToken(node: Node) {
        this.write(tokenToString(node.kind));
        this.spaceRequested = true;
    }
    
    private writeTerminal(node: Terminal) {
        this.write("`");
        this.write(node.text);
        this.write("`");
        this.writeNode(node.questionToken);
        this.spaceRequested = true;
    }
    
    private writeUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.write("<");
        this.write(node.text);
        this.write(">");
        this.writeNode(node.questionToken);
        this.spaceRequested = true;
    }
    
    private writeProse(node: Prose) {
        this.write("> ");
        this.write(node.text);        
    }
    
    private writeNonterminal(node: Nonterminal) {
        this.writeNode(node.name);
        this.writeNode(node.argumentList);
        this.writeNode(node.questionToken);
        this.spaceRequested = true;
    }
    
    private writeArgumentList(node: ArgumentList) {
        this.write("[");
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.write(", ");
            }
            
            this.writeNode(node.elements[i]);
        }
        
        this.write("]");
    }
    
    private writeArgument(node: Argument) {
        this.writeNode(node.questionToken);
        this.writeNode(node.name);
    }
    
    private writeEmptyAssertion(node: EmptyAssertion) {
        this.write("[empty]");
        this.spaceRequested = true;
    }
    
    private writeLexicalGoalAssertion(node: LexicalGoalAssertion) {
        this.write("[lexical goal ");
        this.writeNode(node.symbol);
        this.spaceRequested = false;
        this.write("]");
        this.spaceRequested = true;
    }
    
    private writeLookaheadAssertion(node: LookaheadAssertion) {
        this.write("[lookahead ");
        this.writeNode(node.operatorToken);
        this.writeNode(node.lookahead);
        this.spaceRequested = false;
        this.write("]");
        this.spaceRequested = true;
    }
    
    private writeNoSymbolHereAssertion(node: NoSymbolHereAssertion) {
        this.write("[no ");
        for (let i = 0; i < node.symbols.length; ++i) {
            if (i > 0) {
                this.write(" or ");
            }
            
            this.writeNode(node.symbols[i]);
            this.spaceRequested = false;
        }
        
        this.write(" here]");
    }
    
    private writeParameterValueAssertion(node: ParameterValueAssertion) {
        this.write("[");
        this.writeToken(node.operatorToken);
        this.spaceRequested = false;
        this.writeNode(node.name);
        this.write("]");
        this.spaceRequested = true;
    }
    
    private writeBinarySymbol(node: BinarySymbol) {
        this.writeNode(node.left);
        this.writeNode(node.operatorToken);
        this.writeNode(node.right);
        this.spaceRequested = true;
    }
    
    private writeOneOfSymbol(node: OneOfSymbol) {
        this.write("one of ");
        for (let i = 0; i < node.symbols.length; ++i) {
            if (i > 0) {
                this.write(" or ");
            }
            
            this.writeNode(node.symbols[i]);
            this.spaceRequested = false;
        }

        this.spaceRequested = true;
    }
    
    private writeSymbolSpan(node: SymbolSpan) {
        this.writeNode(node.symbol);
        this.writeNode(node.next);
    }
    
    private writeSymbolSet(node: SymbolSet) {
        this.write("{ ");
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.write(", ");
            }
            
            this.writeNode(node.elements[i]);
            this.spaceRequested = false;
        }

        this.write(" }");
        this.spaceRequested = true;
    }
    
    private writeIdentifier(node: Identifier) {
        this.write(node.text);
    }
}

function isAssertion(node: LexicalSymbol) {
    if (node) {
        switch (node.kind) {
            case SyntaxKind.EmptyAssertion:
            case SyntaxKind.LookaheadAssertion:
            case SyntaxKind.LexicalGoalAssertion:
            case SyntaxKind.NoSymbolHereAssertion:
            case SyntaxKind.ParameterValueAssertion:
            case SyntaxKind.InvalidAssertion:
                return true;
        }
    }
    
    return false;
}