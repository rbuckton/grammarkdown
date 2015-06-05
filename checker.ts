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
 */import { Diagnostics, DiagnosticMessages, Diagnostic, formatList } from "./diagnostics";
import { SyntaxKind, forEach } from "./core";
import { tokenToString } from "./tokens";
import {
    BindingTable,
    SymbolKind,
    SymbolTable,
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
    Symbol,
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

export class Checker {
    private bindings: BindingTable;
    private diagnostics: DiagnosticMessages;

    constructor(bindings: BindingTable, diagnostics: DiagnosticMessages) {
        this.bindings = bindings;
        this.diagnostics = diagnostics;
    }

    public checkSourceFile(sourceFile: SourceFile): void {
        this.diagnostics.setSourceFile(sourceFile);
        forEach(sourceFile.elements, element => this.checkSourceElement(element));
    }

    private resolveSymbol(location: Node, name: string, meaning: SymbolKind, diagnosticMessage?: Diagnostic): Symbol {
        var scope: SymbolTable;
        while (location) {
            if (location.locals) {
                var result = location.locals.resolveSymbol(name, meaning);
                if (result) {
                    return result;
                }
            }
            location = this.bindings.getParent(location);
        }

        if (diagnosticMessage) {
            this.diagnostics.reportNode(location, diagnosticMessage, name);
        }
    }

    private checkParameter(node: Parameter): void {
    }

    private checkParameterList(node: ParameterList): void {
    }

    private checkTerminalSet(node: SymbolSet): void {
    }
    
    private checkEmptyAssertion(node: EmptyAssertion): void {
        if (!node.emptyKeyword) {
            return this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.EmptyKeyword, /*quoted*/ true));
        }
    }

    private checkLookaheadAssertion(node: LookaheadAssertion): void {
        if (!node.lookaheadKeyword) {
            return this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.LookaheadKeyword, /*quoted*/ true));
        }

        if (!node.operatorToken) {
            return this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
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
                return this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
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
                    return this.diagnostics.report(node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));

                case SyntaxKind.LessThanMinusToken:
                case SyntaxKind.LessThanExclamationToken:
                    return this.diagnostics.report(node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
            }
        }

        switch (node.operatorToken.kind) {
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
                if (node.lookahead.kind !== SyntaxKind.Terminal) {
                    return this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
                }
                break;

            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.LessThanExclamationToken:
                if (node.lookahead.kind !== SyntaxKind.SymbolSet) {
                    return this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
                }
                break;
        }

        switch (node.lookahead.kind) {
            case SyntaxKind.Terminal:
                return this.checkTerminal(<Terminal>node.lookahead);
            case SyntaxKind.SymbolSet:
                return this.checkTerminalSet(<SymbolSet>node.lookahead);
        }
    }

    private checkLexicalGoalAssertion(node: LexicalGoalAssertion): void {
    }

    private checkNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
    }

    private checkParameterValueAssertion(node: ParameterValueAssertion): void {
    }

    private checkInvalidAssertion(node: Assertion): void {
        this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.LookaheadKeyword,
            SyntaxKind.LexicalKeyword,
            SyntaxKind.NoKeyword,
            SyntaxKind.TildeToken,
            SyntaxKind.PlusToken
        ]));
    }

    private checkAssertion(node: Assertion): void {
        if (!node.openBracketToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.OpenBracketToken]));
        }
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
                this.checkInvalidAssertion(<Assertion>node);
                break;
        }
        if (!node.closeBracketToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.CloseBracketToken]));
        }
    }

    private checkProse(node: Prose): void {
        if (typeof node.text !== "string") {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
    }

    private checkTerminal(node: Terminal): void {
        if (typeof node.text !== "string") {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
        }
    }

    private checkArgument(node: Argument): void {
        this.checkIdentifier(node.name);
    }

    private checkArgumentList(node: ArgumentList): void {
        if (!node.openParenToken) {
        }
        forEach(node.elements, element => this.checkArgument(element));
        if (!node.closeParenToken) {
        }
    }

    private checkNonterminal(node: Nonterminal): void {
        this.checkIdentifier(node.name);
        if (node.argumentList) {
            this.checkArgumentList(node.argumentList);
        }
    }

    private checkButNotOperator(node: ButNotOperator): void {
    }

    private checkBinarySymbol(node: BinarySymbol): void {
    }

    private checkOneOfSymbol(node: OneOfSymbol): void {
    }

    private checkInvalidSymbol(node: LexicalSymbol): void {
        this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.Terminal,
            SyntaxKind.Identifier,
            SyntaxKind.OpenBracketToken
        ]));
    }

    private checkPrimarySymbol(node: LexicalSymbol): void {
        switch (node.kind) {
            case SyntaxKind.Terminal:
                return this.checkTerminal(<Terminal>node);

            case SyntaxKind.Nonterminal:
                return this.checkNonterminal(<Nonterminal>node);
                
            case SyntaxKind.UnicodeCharacterLiteral:
                return this.checkUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node);

            case SyntaxKind.Prose:
                return this.checkProse(<Prose>node);

            case SyntaxKind.InvalidSymbol:
                return this.checkInvalidSymbol(<LexicalSymbol>node);
                
            default:
                return this.checkAssertion(<Assertion>node);
        }
    }

    private checkLexicalSymbol(node: LexicalSymbol): void {
        switch (node.kind) {
            case SyntaxKind.BinarySymbol:
                return this.checkBinarySymbol(<BinarySymbol>node);

            case SyntaxKind.OneOfSymbol:
                return this.checkOneOfSymbol(<OneOfSymbol>node);

            default:
                return this.checkPrimarySymbol(node);
        }
    }

    private checkSymbolSpan(node: SymbolSpan): void {
        this.checkLexicalSymbol(node.symbol);            
    }

    private checkRightHandSide(node: RightHandSide): void {
        this.checkSymbolSpan(node.head);
    }

    private checkRightHandSideList(node: RightHandSideList): void {
        if (!node.openIndentToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.IndentToken]));
        }
        if (!node.elements || node.elements.length === 0) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.Identifier, SyntaxKind.OpenBracketToken]));
        }
        else {
            forEach(node.elements, element => this.checkRightHandSide(element));
        }
        if (!node.closeIndentToken) {
            this.diagnostics.report(node.end, Diagnostics._0_expected, formatList([SyntaxKind.DedentToken]));
        }
    }

    private checkOneOfList(node: OneOfList): void {
    }
    
    private checkUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): void {
    }

    private checkIdentifier(node: Identifier): void {
        if (!node.text) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        else {
            var parent = this.bindings.getParent(node);
            if (parent) {
                var symbol: Symbol;
                switch (parent.kind) {
                    case SyntaxKind.Production:
                    case SyntaxKind.Nonterminal:
                    case SyntaxKind.LexicalGoalAssertion:
                    case SyntaxKind.NoSymbolHereAssertion:
                        symbol = this.resolveSymbol(node, node.text, SymbolKind.Production, Diagnostics.Cannot_find_name_0_);
                        break;

                    case SyntaxKind.Parameter:
                    case SyntaxKind.Argument:
                        symbol = this.resolveSymbol(node, node.text, SymbolKind.Parameter, Diagnostics.Cannot_find_name_0_);
                        break;
                }
            }

            this.bindings.setSymbol(node, symbol);
        }
    }

    private checkProduction(node: Production): void {
        this.checkIdentifier(node.name);

        var pos = node.name.end;
        if (node.parameterList) {
            pos = node.parameterList.end;
            this.checkParameterList(node.parameterList);
        }

        if (!node.colonToken) {
            this.diagnostics.report(pos, Diagnostics._0_expected, tokenToString(SyntaxKind.ColonToken));
        }
        else {
            pos += node.colonToken.end;
        }

        if (!node.body) {
            this.diagnostics.report(pos, Diagnostics._0_expected, formatList([
                SyntaxKind.OneOfList,
                SyntaxKind.RightHandSide,
            ]));
        }
        else {
            switch (node.body.kind) {
                case SyntaxKind.OneOfList:
                    this.checkOneOfList(<OneOfList>node.body);
                    break;

                case SyntaxKind.RightHandSide:
                    this.checkRightHandSide(<RightHandSide>node.body);
                    break;

                case SyntaxKind.RightHandSideList:
                    this.checkRightHandSideList(<RightHandSideList>node.body);
                    break;

                default:
                    this.diagnostics.report(pos, Diagnostics._0_expected, formatList([
                        SyntaxKind.OneOfList,
                        SyntaxKind.RightHandSide,
                    ]));
                    break;
            }
        }
    }

    private checkInvalidSourceElement(node: SourceElement): void {
        this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.Production
        ]));
    }

    private checkSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Production:
                return this.checkProduction(<Production>node);
            case SyntaxKind.InvalidSourceElement:
                return this.checkInvalidSourceElement(<SourceElement>node);
        }
    }
}