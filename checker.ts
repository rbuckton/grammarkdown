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

    public checkGrammar(grammar: Grammar): void {
        forEach(grammar.sources, sourceFile => this.checkSourceFile(sourceFile));
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

    private checkType(node: Type): void {
        if (!node.atToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.AtToken]));
        }
        else {
            this.checkIdentifier(node.name);
        }
    }

    private checkDefinitionOption(node: DefinitionOption): void {
        // TODO
    }

    private checkDefinition(node: Definition): void {
        if (!node.defineKeyword) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.DefineKeyword]));
        }
        this.checkType(node.type);
        forEach(node.options, option => this.checkDefinitionOption(option));
    }

    private checkImport(node: Import): void {
        if (!node.importKeyword) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.ImportKeyword]));
        }
        this.checkStringLiteral(node.file);
        if (node.asKeyword || node.type) {
            if (!node.asKeyword) {
                this.diagnostics.reportNode(node.type, Diagnostics._0_expected, "as");
            }
            this.checkType(node.type);
        }
    }

    private checkParameter(node: Parameter): void {
    }

    private checkParameterList(node: ParameterList): void {
    }

    private checkTerminalSet(node: TerminalSet): void {
    }

    private checkLookaheadConstraint(node: LookaheadConstraint): void {
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
                if (node.lookahead.kind !== SyntaxKind.TerminalSet) {
                    return this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
                }
                break;
        }

        switch (node.lookahead.kind) {
            case SyntaxKind.Terminal:
                return this.checkTerminal(<Terminal>node.lookahead);
            case SyntaxKind.TerminalSet:
                return this.checkTerminalSet(<TerminalSet>node.lookahead);
        }
    }

    private checkLexicalGoalConstraint(node: LexicalGoalConstraint): void {
    }

    private checkNoSymbolHereConstraint(node: NoSymbolHereConstraint): void {
    }

    private checkParameterValueConstraint(node: ParameterValueConstraint): void {
    }

    private checkInvalidConstraint(node: Constraint): void {
        this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.LookaheadKeyword,
            SyntaxKind.LexicalKeyword,
            SyntaxKind.NoKeyword,
            SyntaxKind.TildeToken,
            SyntaxKind.PlusToken
        ]));
    }

    private checkConstraint(node: Constraint): void {
        if (!node.openBracketToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.OpenBracketToken]));
        }
        switch (node.kind) {
            case SyntaxKind.LookaheadConstraint:
                this.checkLookaheadConstraint(<LookaheadConstraint>node);
                break;

            case SyntaxKind.LexicalGoalConstraint:
                this.checkLexicalGoalConstraint(<LexicalGoalConstraint>node);
                break;

            case SyntaxKind.NoSymbolHereConstraint:
                this.checkNoSymbolHereConstraint(<NoSymbolHereConstraint>node);
                break;

            case SyntaxKind.ParameterValueConstraint:
                this.checkParameterValueConstraint(<ParameterValueConstraint>node);
                break;

            case SyntaxKind.InvalidConstraint:
                this.checkInvalidConstraint(<Constraint>node);
                break;
        }
        if (!node.closeBracketToken) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.CloseBracketToken]));
        }
    }

    private checkStringLiteral(node: StringLiteral): void {
        if (typeof node.text !== "string") {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, "string");
        }
    }

    private checkNumericLiteral(node: NumericLiteral): void {
        if (typeof node.text !== "string") {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, "number");
        }
    }

    private checkProse(node: Prose): void {
        if (typeof node.text !== "string") {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Prose));
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

            case SyntaxKind.Prose:
                return this.checkProse(<Prose>node);

            case SyntaxKind.InvalidSymbol:
                return this.checkInvalidSymbol(<LexicalSymbol>node);
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
        if (node.constraint) {
            this.checkConstraint(node.constraint);
        }
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
            this.diagnostics.reportNode(node, Diagnostics._0_expected, formatList([SyntaxKind.Terminal, SyntaxKind.Identifier, SyntaxKind.OpenBracketToken, SyntaxKind.AtToken]));
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

    private checkIdentifier(node: Identifier): void {
        if (!node.text) {
            this.diagnostics.reportNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        else {
            var parent = this.bindings.getParent(node);
            if (parent) {
                var symbol: Symbol;
                switch (parent.kind) {
                    case SyntaxKind.Type:
                        symbol = this.resolveSymbol(node, node.text, SymbolKind.Type, Diagnostics.Cannot_find_name_0_);
                        break;

                    case SyntaxKind.Production:
                    case SyntaxKind.Nonterminal:
                    case SyntaxKind.LexicalGoalConstraint:
                    case SyntaxKind.NoSymbolHereConstraint:
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
        if (node.type) {
            this.checkType(node.type);
        }

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
            SyntaxKind.DefineKeyword,
            SyntaxKind.Import,
            SyntaxKind.Production
        ]));
    }

    private checkSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Definition:
                return this.checkDefinition(<Definition>node);
            case SyntaxKind.Import:
                return this.checkImport(<Import>node);
            case SyntaxKind.Production:
                return this.checkProduction(<Production>node);
            case SyntaxKind.InvalidSourceElement:
                return this.checkInvalidSourceElement(<SourceElement>node);
        }
    }
}