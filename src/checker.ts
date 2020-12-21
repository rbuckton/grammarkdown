/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { createHash } from "crypto";
import { Cancelable } from "@esfx/cancelable";
import { CancelToken } from "@esfx/async-canceltoken";
import { Diagnostics, DiagnosticMessages, Diagnostic, formatList, NullDiagnosticMessages } from "./diagnostics";
import { LineOffsetMap } from "./lineOffsetMap";
import { SyntaxKind, tokenToString } from "./tokens";
import { Symbol, SymbolKind } from "./symbols";
import { BindingTable } from "./binder";
import { StringWriter } from "./stringwriter";
import { CompilerOptions } from "./options";
import {
    Node,
    SourceFile,
    UnicodeCharacterLiteral,
    UnicodeCharacterRange,
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
    Constraints,
    ProseAssertion,
    ProseFragment,
    ProseFragmentLiteral,
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    LexicalSymbol,
    OptionalSymbol,
    ButNotSymbol,
    SymbolSpan,
    LinkReference,
    RightHandSide,
    RightHandSideList,
    Production,
    SourceElement,
    Define,
    PlaceholderSymbol,
    HtmlTrivia,
    Line,
    Declaration,
    TerminalLiteral,
} from "./nodes";
import { NodeNavigator } from "./navigator";
import { toCancelToken } from "./core";
import { Position, Range } from "./types";
import { RegionMap } from "./regionMap";

class NodeLinks {
    hasResolvedSymbols?: boolean;
}

class SymbolLinks {
    isReferenced?: boolean;
}

interface Defines {
    readonly noStrictParametricProductions: boolean;
    readonly noUnusedParameters: boolean;
}

interface DefineOverrides {
    noStrictParametricProductions?: boolean | "default";
    noUnusedParameters?: boolean | "default";
}

function equateDefines(a: DefineOverrides, b: DefineOverrides) {
    return a.noStrictParametricProductions === b.noStrictParametricProductions
        && a.noUnusedParameters === b.noUnusedParameters;
}

/** {@docCategory Check} */
export class Checker {
    private _options: CompilerOptions | undefined;
    private _checkedFileSet = new Set<string>();
    private _bindings!: BindingTable;
    private _diagnostics!: DiagnosticMessages;
    private _sourceFile!: SourceFile;
    private _noChecks!: boolean;
    private _productionParametersByName!: Map<Production, Set<string>>;
    private _cancelToken?: CancelToken;
    private _nodeLinks?: Map<Node, NodeLinks>;
    private _symbolLinks?: Map<Symbol, SymbolLinks>;
    private _lineOffsetMap: LineOffsetMap;
    private _defines: Defines;
    private _defineOverrideMap?: RegionMap<DefineOverrides>;

    constructor(options?: CompilerOptions, lineOffsetMap = new LineOffsetMap()) {
        this._options = options;
        this._lineOffsetMap = lineOffsetMap;
        this._defines = {
            noStrictParametricProductions: this._options?.noStrictParametricProductions ?? false,
            noUnusedParameters: this._options?.noUnusedParameters ?? false
        };
    }

    public checkSourceFile(sourceFile: SourceFile, bindings: BindingTable, diagnostics: DiagnosticMessages, cancelable?: Cancelable): void {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        if (!this._checkedFileSet.has(sourceFile.filename)) {
            const savedNoChecks = this._noChecks;
            const savedCancellationToken = this._cancelToken;
            const savedSourceFile = this._sourceFile;
            const savedProductionParametersByName = this._productionParametersByName;
            const savedBindings = this._bindings;
            const savedDiagnostics = this._diagnostics;
            try {
                this._cancelToken = cancelToken;
                this._sourceFile = sourceFile;
                this._productionParametersByName = new Map();
                this._noChecks = this._options?.noChecks ?? false;

                this._bindings = new BindingTable();
                this._bindings._copyFrom(bindings);

                this._diagnostics = this._noChecks ? NullDiagnosticMessages.instance : new DiagnosticMessages();
                this._diagnostics.setSourceFile(this._sourceFile);

                for (const element of sourceFile.elements) {
                    this.preprocessSourceElement(element);
                }

                for (const element of sourceFile.elements) {
                    this.checkSourceElement(element);
                }

                diagnostics.copyFrom(this._diagnostics);
                bindings._copyFrom(this._bindings);
                this._checkedFileSet.add(sourceFile.filename);
            }
            finally {
                this._noChecks = savedNoChecks;
                this._cancelToken = savedCancellationToken;
                this._sourceFile = savedSourceFile;
                this._productionParametersByName = savedProductionParametersByName;
                this._bindings = savedBindings;
                this._diagnostics = savedDiagnostics;
            }
        }
    }

    private getDefine<K extends keyof DefineOverrides>(location: Node, key: K): NonNullable<Defines[K]>;
    private getDefine<K extends keyof DefineOverrides>(location: Node, key: K) {
        if (this._defineOverrideMap) {
            const position = this._sourceFile.lineMap.positionAt(location.getStart(this._sourceFile))
            for (const region of this._defineOverrideMap.regions(this._sourceFile, position.line)) {
                const value = region.value[key];
                if (value === "default") break;
                if (value === undefined) continue;
                return value;
            }
        }
        return this._defines[key];
    }

    private preprocessSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Define:
                this.preprocessDefine(<Define>node);
                break;
            case SyntaxKind.Line:
                this.preprocessLine(<Line>node);
                break;
        }
    }

    private preprocessDefine(node: Define) {
        if (!this.checkGrammarDefine(node)) {
            const position = this._sourceFile.lineMap.positionAt(node.getStart(this._sourceFile));
            const nodeKey = node.key;
            const nodeKeyText = nodeKey.text;
            this._defineOverrideMap ??= new RegionMap(equateDefines);
            switch (nodeKeyText) {
                case "noStrictParametricProductions":
                    this._defineOverrideMap.addRegion(this._sourceFile, position.line, {
                        noStrictParametricProductions:
                            node.valueToken!.kind === SyntaxKind.DefaultKeyword ? "default" :
                            node.valueToken!.kind === SyntaxKind.TrueKeyword
                    });
                    break;

                case "noUnusedParameters":
                    this._defineOverrideMap.addRegion(this._sourceFile, position.line, {
                        noUnusedParameters:
                            node.valueToken!.kind === SyntaxKind.DefaultKeyword ? "default" :
                            node.valueToken!.kind === SyntaxKind.TrueKeyword
                    });
                    break;

                default:
                    this.reportError(nodeKey, Diagnostics.Cannot_find_name_0_, nodeKeyText);
                    break;
            }
        }
    }

    private checkGrammarDefine(node: Define) {
        if (node.key?.text === undefined) {
            return this.reportGrammarError(node, node.defineKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        if (!node.valueToken) {
            return this.reportGrammarError(node, node.key.end, Diagnostics._0_expected, formatList([SyntaxKind.TrueKeyword, SyntaxKind.FalseKeyword, SyntaxKind.DefaultKeyword]));
        }
        return false;
    }

    private preprocessLine(node: Line) {
        if (!this.checkGrammarLine(node)) {
            // @line re-numbering starts with the next line
            const generatedLine = this._sourceFile.lineMap.positionAt(node.end).line + 1;
            if (node.number?.kind === SyntaxKind.DefaultKeyword) {
                this._lineOffsetMap.addLineOffset(this._sourceFile, generatedLine, "default");
            }
            else if (node.number?.kind === SyntaxKind.NumberLiteral) {
                this._lineOffsetMap.addLineOffset(this._sourceFile, generatedLine, { line: +node.number.text! - 1, file: node.path?.text });
            }
        }
    }

    private checkGrammarLine(node: Line) {
        if (!node.number || node.number.kind === SyntaxKind.NumberLiteral && node.number.text === undefined) {
            return this.reportGrammarError(node, node.lineKeyword.end, Diagnostics._0_expected, formatList([SyntaxKind.NumberLiteral, SyntaxKind.DefaultKeyword]));
        }
        if (node.path && node.path.text === undefined) {
            return this.reportGrammarError(node, node.number.end, Diagnostics._0_expected, formatList([SyntaxKind.StringLiteral]));
        }
        return false;
    }

    private checkSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Production:
                this.checkProduction(<Production>node);
                break;
        }
    }

    private checkProduction(node: Production): void {
        this.checkGrammarProduction(node);

        if (this.getDefine(node, "noStrictParametricProductions")) {
            this.checkProductionNonStrict(node);
        }
        else {
            this.checkProductionStrict(node);
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

        this.getNodeLinks(node, /*create*/ true).hasResolvedSymbols = true;

        if (this.getDefine(node, "noUnusedParameters")) {
            const symbol = this._bindings.getSymbol(node);
            if (symbol) {
                for (const decl of this._bindings.getDeclarations(symbol)) {
                    if (decl.kind === SyntaxKind.Production) {
                        this.resolveProduction(decl);
                    }
                }
            }
            if (node.parameterList?.elements) {
                for (const param of node.parameterList.elements) {
                    const symbol = this._bindings.getSymbol(param);
                    if (symbol && !this.getSymbolLinks(symbol)?.isReferenced) {
                        this.reportError(param, Diagnostics.Parameter_0_is_unused, param.name.text);
                    }
                }
            }
        }
    }

    private resolveProduction(node: Production) {
        if (!this.getNodeLinks(node)?.hasResolvedSymbols) {
            this.getNodeLinks(node, /*create*/ true).hasResolvedSymbols = true;
        }
        const visitNode = (node: Node) => {
            if (node.kind === SyntaxKind.Identifier) {
                this.resolveIdentifier(node as Identifier);
            }
            node.forEachChild(visitNode);
        };
        node.forEachChild(visitNode);
    }

    private checkProductionNonStrict(node: Production) {
        this.checkIdentifier(node.name);

        if (node.parameterList) {
            this.checkParameterList(node.parameterList);
        }
    }

    private getProductionParametersByName(node: Production) {
        let parametersByName = this._productionParametersByName.get(node);
        if (parametersByName) return parametersByName;
        this._productionParametersByName.set(node, parametersByName = new Set());
        const parameterList = node.parameterList;
        const parameters = parameterList?.elements;
        if (parameters) {
            for (let i = 0; i < parameters.length; i++) {
                const parameterNameText = parameters[i]?.name?.text;
                if (parameterNameText) {
                    parametersByName.add(parameterNameText);
                }
            }
        }
        return parametersByName;
    }

    private checkProductionStrict(thisProduction: Production) {
        const thisProductionName = thisProduction.name;
        const thisProductionNameText = thisProductionName.text;
        const thisProductionSymbol = this.checkIdentifier(thisProductionName);
        const thisProductionParameterList = thisProduction.parameterList;
        const thisProductionParameters = thisProductionParameterList?.elements;
        const thisProductionParameterCount = thisProductionParameters?.length ?? 0;
        const firstProduction = <Production>this._bindings.getDeclarations(thisProductionSymbol)[0];
        if (thisProductionParameterList && thisProductionParameters) {
            this.checkParameterList(thisProductionParameterList);
        }

        if (firstProduction === thisProduction) {
            return;
        }

        const thisProductionParameterNames = this.getProductionParametersByName(thisProduction);
        const firstProductionParameterList = firstProduction.parameterList;
        const firstProductionParameters = firstProductionParameterList?.elements;
        const firstProductionParameterCount = firstProductionParameters?.length ?? 0;
        const firstProductionParameterNames = this.getProductionParametersByName(firstProduction);
        if (firstProductionParameters) {
            for (let i = 0; i < firstProductionParameterCount; i++) {
                const firstProductionParameter = firstProductionParameters[i];
                const firstProductionParameterName = firstProductionParameter.name;
                const firstProductionParameterNameText = firstProductionParameterName.text;
                if (firstProductionParameterNameText && !thisProductionParameterNames.has(firstProductionParameterNameText)) {
                    this.reportError(thisProductionName, Diagnostics.Production_0_is_missing_parameter_1_All_definitions_of_production_0_must_specify_the_same_formal_parameters, thisProductionNameText, firstProductionParameterNameText);
                }
            }
        }

        if (thisProductionParameters) {
            for (let i = 0; i < thisProductionParameterCount; i++) {
                const thisProductionParameter = thisProductionParameters[i];
                const thisProductionParameterName = thisProductionParameter.name;
                const thisProductionParameterNameText = thisProductionParameterName.text;
                if (thisProductionParameterNameText && !firstProductionParameterNames.has(thisProductionParameterNameText)) {
                    this.reportError(firstProduction, Diagnostics.Production_0_is_missing_parameter_1_All_definitions_of_production_0_must_specify_the_same_formal_parameters, thisProductionNameText, thisProductionParameterNameText);
                }
            }
        }
    }

    private checkGrammarProduction(node: Production): boolean {
        if (!node.colonToken) {
            return this.reportGrammarError(node, node.parameterList?.end ?? node.name.end, Diagnostics._0_expected, tokenToString(SyntaxKind.ColonToken));
        }

        if (!node.body) {
            return this.reportGrammarError(node, node.colonToken.end, Diagnostics._0_expected, formatList([
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
                return this.reportGrammarError(node, node.colonToken.end, Diagnostics._0_expected, formatList([
                    SyntaxKind.OneOfList,
                    SyntaxKind.RightHandSide,
                ]));
        }

        return this.reportInvalidHtmlTrivia(node.name.trailingHtmlTrivia)
            || this.reportInvalidHtmlTrivia(node.colonToken.leadingHtmlTrivia)
            || this.reportInvalidHtmlTrivia(node.colonToken.trailingHtmlTrivia);
    }

    private checkParameterList(node: ParameterList): void {
        this.checkGrammarParameterList(node);

        if (node.elements) {
            for (const element of node.elements) {
                this.checkParameter(element);
            }
        }
    }

    private checkGrammarParameterList(node: ParameterList) {
        if (!node.openBracketToken) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }

        if ((node.elements?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.openBracketToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        if (!node.closeBracketToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
        }

        return this.reportInvalidHtmlTrivia(node.leadingHtmlTrivia)
            || this.reportInvalidHtmlTrivia(node.trailingHtmlTrivia);
    }

    private checkParameter(node: Parameter): void {
        this.reportInvalidHtmlTrivia(node.leadingHtmlTrivia) || this.reportInvalidHtmlTrivia(node.trailingHtmlTrivia);
        this.checkIdentifier(node.name);
    }

    private checkOneOfList(node: OneOfList): void {
        this.checkGrammarOneOfList(node);

        if (node.terminals) {
            const terminalSet = new Set<string>();
            for (const terminal of node.terminals) {
                const text = terminal.text;
                if (text) {
                    if (terminalSet.has(text)) {
                        this.reportError(terminal, Diagnostics.Duplicate_terminal_0_, text);
                    }
                    else {
                        terminalSet.add(text);
                        this.checkTerminalLiteral(terminal);
                    }
                }
            }
        }
    }

    private checkGrammarOneOfList(node: OneOfList): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }

        if (!node.ofKeyword) {
            return this.reportGrammarError(node, node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }

        if ((node.terminals?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.ofKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.TerminalLiteral));
        }

        return false;
    }

    private checkRightHandSideList(node: RightHandSideList): void {
        this.checkGrammarRightHandSideList(node);

        if (node.elements) {
            for (const element of node.elements) {
                this.checkRightHandSide(element);
            }
        }
    }

    private checkGrammarRightHandSideList(node: RightHandSideList): boolean {
        if (!node.elements || node.elements.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                SyntaxKind.TerminalLiteral,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken
            ]));
        }

        // if (!node.closeIndentToken) {
        //     return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.DedentToken));
        // }

        return false;
    }

    private checkRightHandSide(node: RightHandSide): void {
        this.checkGrammarRightHandSide(node);
        if (node.constraints) {
            this.checkConstraints(node.constraints);
        }
        if (node.head) {
            this.checkSymbolSpan(node.head);
        }
        if (node.reference) {
            this.checkLinkReference(node.reference);
        }
    }

    private checkGrammarRightHandSide(node: RightHandSide): boolean {
        if (!node.head) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([SyntaxKind.GreaterThanToken, SyntaxKind.OpenBracketToken, SyntaxKind.Identifier, SyntaxKind.TerminalLiteral, SyntaxKind.UnicodeCharacterLiteral]));
        }
        return false;
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

    private checkConstraints(node: Constraints): void {
        this.checkGrammarConstraints(node);
        if (node.elements) {
            for (const element of node.elements) {
                this.checkArgument(element);
            }
        }
    }

    private checkGrammarConstraints(node: Constraints): boolean {
        if ((node.elements?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.openBracketToken.end, Diagnostics._0_expected, formatList([SyntaxKind.TildeToken, SyntaxKind.PlusToken]));
        }

        if (!node.closeBracketToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
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
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.TerminalLiteral,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                SyntaxKind.Prose
            ]));
        }

        if (node.next && node.symbol.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node, node.symbol.end, Diagnostics._0_expected, "«line terminator»");
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
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.checkProseFragment(fragment);
            }
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
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.TerminalLiteral,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                "«line terminator»"
            ]));
        }

        if (node.symbol.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node, node.symbol.getStart(this._sourceFile), Diagnostics._0_expected, "«line terminator»");
        }

        if (node.next?.symbol.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node, node.symbol.end, Diagnostics._0_expected, "«line terminator»");
        }

        return false;
    }

    private checkSymbolOrHigher(node: LexicalSymbol): void {
        if (isAssertion(node)) {
            this.checkAssertion(<Assertion>node);
            return;
        }

        this.checkButNotSymbolOrHigher(node);
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

            case SyntaxKind.ProseAssertion:
                this.checkProseAssertion(<ProseAssertion>node);
                break;

            case SyntaxKind.InvalidAssertion:
                this.reportInvalidAssertion(<Assertion>node);
                break;
        }
    }

    private checkGrammarAssertionHead(node: Assertion): boolean {
        if (!node.openBracketToken) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }

        return false;
    }

    private checkGrammarAssertionTail(node: Assertion): boolean {
        if (!node.closeBracketToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
        }

        return false;
    }

    private checkEmptyAssertion(node: EmptyAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarEmptyAssertion(node) || this.checkGrammarAssertionTail(node);
    }

    private checkGrammarEmptyAssertion(node: EmptyAssertion) {
        if (!node.emptyKeyword) {
            return this.reportGrammarError(node, node.openBracketToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.EmptyKeyword, /*quoted*/ true));
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
                SyntaxKind.EqualsToken,
                SyntaxKind.EqualsEqualsToken,
                SyntaxKind.ExclamationEqualsToken,
                SyntaxKind.LessThanMinusToken,
                SyntaxKind.LessThanExclamationToken
            ]));
        }

        switch (node.operatorToken.kind) {
            case SyntaxKind.EqualsToken:
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
            case SyntaxKind.NotEqualToToken:
            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.ElementOfToken:
            case SyntaxKind.LessThanExclamationToken:
            case SyntaxKind.NotAnElementOfToken:
                break;

            default:
                return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                    SyntaxKind.EqualsToken,
                    SyntaxKind.EqualsEqualsToken,
                    SyntaxKind.ExclamationEqualsToken,
                    SyntaxKind.LessThanMinusToken,
                    SyntaxKind.LessThanExclamationToken
                ]));
        }

        if (!node.lookahead) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.EqualsToken:
                case SyntaxKind.EqualsEqualsToken:
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.NotEqualToToken:
                    return this.reportGrammarError(node, node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.TerminalLiteral));

                case SyntaxKind.LessThanMinusToken:
                case SyntaxKind.ElementOfToken:
                case SyntaxKind.LessThanExclamationToken:
                case SyntaxKind.NotAnElementOfToken:
                    return this.reportGrammarError(node, node.operatorToken.end, Diagnostics._0_expected, formatList([SyntaxKind.OpenBraceToken, SyntaxKind.Nonterminal]));
            }
        }

        switch (node.operatorToken.kind) {
            case SyntaxKind.EqualsToken:
            case SyntaxKind.EqualsEqualsToken:
            case SyntaxKind.ExclamationEqualsToken:
            case SyntaxKind.NotEqualToToken:
                if (!node.lookahead || !isTerminalSpan(node.lookahead)) {
                    return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                        SyntaxKind.TerminalLiteral,
                        SyntaxKind.UnicodeCharacterLiteral
                    ]));
                }

                break;

            case SyntaxKind.LessThanMinusToken:
            case SyntaxKind.ElementOfToken:
            case SyntaxKind.LessThanExclamationToken:
            case SyntaxKind.NotAnElementOfToken:
                if (!node.lookahead || !isNonterminalOrSymbolSet(node.lookahead)) {
                    return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                        SyntaxKind.OpenBraceToken,
                        SyntaxKind.Nonterminal
                    ]));
                }

                break;
        }

        return false;

        function isTerminalSpan(node: SymbolSpan | SymbolSet) {
            while (node.kind === SyntaxKind.SymbolSpan) {
                switch (node.symbol.kind) {
                    case SyntaxKind.Terminal:
                        if (!node.next) return true;
                        node = node.next;
                        break;
                    default:
                        return false;
                }
            }
            return false;
        }

        function isNonterminalOrSymbolSet(node: SymbolSpan | SymbolSet) {
            return node.kind === SyntaxKind.SymbolSpan
                ? node.symbol.kind === SyntaxKind.Nonterminal
                : node.kind === SyntaxKind.SymbolSet;
        }
    }

    private checkSymbolSet(node: SymbolSet): void {
        this.checkGrammarSymbolSet(node);

        if (node.elements) {
            for (const element of node.elements) {
                this.checkSymbolSpanRest(element);
            }
        }
    }

    private checkGrammarSymbolSet(node: SymbolSet): boolean {
        if (!node.openBraceToken) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
        }

        if ((node.elements?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.openBraceToken.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.TerminalLiteral,
                SyntaxKind.UnicodeCharacterLiteral
            ]));
        }

        if (!node.closeBraceToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBraceToken));
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
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.LexicalKeyword));
        }

        if (!node.goalKeyword) {
            return this.reportGrammarError(node, node.lexicalKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.GoalKeyword));
        }

        if (!node.symbol) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        return false;
    }

    private checkNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.checkGrammarAssertionHead(node) || this.checkGrammarNoSymbolHereAssertion(node) || this.checkGrammarAssertionTail(node);

        if (node.symbols) {
            for (const symbol of node.symbols) {
                this.checkPrimarySymbol(symbol);
            }
        }
    }

    private checkGrammarNoSymbolHereAssertion(node: NoSymbolHereAssertion): boolean {
        if (!node.noKeyword) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.NoKeyword));
        }

        if ((node.symbols?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.noKeyword.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.TerminalLiteral,
                SyntaxKind.UnicodeCharacterLiteral
            ]));
        }

        if (!node.hereKeyword) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.HereKeyword));
        }

        return false;
    }

    private checkProseAssertion(node: ProseAssertion): void {
        this.checkGrammarProseAssertionHead(node) || this.checkGrammarAssertionTail(node);

        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.checkProseFragment(fragment);
            }
        }
    }

    private checkGrammarProseAssertionHead(node: Assertion): boolean {
        if (!node.openBracketToken) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketGreaterThanToken));
        }

        return false;
    }

    private checkProseFragment(fragment: ProseFragment): void {
        switch (fragment.kind) {
            case SyntaxKind.Nonterminal:
                this.checkNonterminal(<Nonterminal>fragment, /*allowOptional*/ false, /*allowArguments*/ false);
                break;

            case SyntaxKind.Terminal:
                this.checkTerminal(<Terminal>fragment, /*allowOptional*/ false);
                break;

            case SyntaxKind.ProseFull:
            case SyntaxKind.ProseHead:
            case SyntaxKind.ProseMiddle:
            case SyntaxKind.ProseTail:
                this.checkProseFragmentLiteral(<ProseFragmentLiteral>fragment);
                break;
        }
    }

    private checkProseFragmentLiteral(node: ProseFragmentLiteral): void {
        if (!node.text) {
            this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
    }

    private reportInvalidAssertion(node: Assertion): void {
        if (this.checkGrammarAssertionHead(node)) {
            return;
        }

        this.reportGrammarError(node, node.openBracketToken.end, Diagnostics._0_expected, formatList([
            SyntaxKind.LookaheadKeyword,
            SyntaxKind.LexicalKeyword,
            SyntaxKind.NoKeyword,
            SyntaxKind.TildeToken,
            SyntaxKind.PlusToken
        ]));
    }

    private checkButNotSymbolOrHigher(node: LexicalSymbol) {
        if (node.kind === SyntaxKind.ButNotSymbol) {
            this.checkButNotSymbol(<ButNotSymbol>node);
            return;
        }

        this.checkUnarySymbolOrHigher(node);
    }

    private checkButNotSymbol(node: ButNotSymbol): void {
        this.checkGrammarButNotSymbol(node);
        if (node.left) this.checkUnarySymbolOrHigher(node.left);
        if (node.right) this.checkUnarySymbolOrHigher(node.right);
    }

    private checkGrammarButNotSymbol(node: ButNotSymbol): boolean {
        if (!node.butKeyword) {
            return this.reportGrammarErrorForNodeOrPos(node, node.notKeyword || node.right, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.ButKeyword));
        }

        if (!node.notKeyword) {
            return this.reportGrammarErrorForNodeOrPos(node, node.right, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.NotKeyword));
        }

        if (!node.right) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.TerminalLiteral,
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
            for (const symbol of node.symbols) {
                this.checkPrimarySymbol(symbol);
            }
        }
    }

    private checkGrammarOneOfSymbol(node: OneOfSymbol): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }

        if (!node.ofKeyword) {
            return this.reportGrammarError(node, node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }

        if ((node.symbols?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.TerminalLiteral,
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

            case SyntaxKind.UnicodeCharacterRange:
                this.checkUnicodeCharacterRange(<UnicodeCharacterRange>node);
                break;

            case SyntaxKind.Nonterminal:
                this.checkNonterminal(<Nonterminal>node, allowOptional, /*allowArguments*/ true);
                break;

            case SyntaxKind.PlaceholderSymbol:
                this.checkPlaceholder(<PlaceholderSymbol>node);
                break;

            default:
                this.reportInvalidSymbol(<LexicalSymbol>node);
                break;
        }
    }

    private checkGrammarNonTerminal(node: Nonterminal, allowOptional: boolean, allowArguments: boolean) {
        if (this.checkGrammarOptionalSymbol(node, allowOptional)) {
            return true;
        }
        if (!allowArguments && node.argumentList) {
            return this.reportGrammarErrorForNode(node.argumentList, Diagnostics.Unexpected_token_0_, tokenToString(node.argumentList.openBracketToken.kind));
        }
        return false;
    }

    private checkGrammarOptionalSymbol(node: OptionalSymbol, allowOptional: boolean) {
        if (node.questionToken) {
            if (!allowOptional || node.questionToken.kind !== SyntaxKind.QuestionToken) {
                return this.reportGrammarErrorForNode(node.questionToken, Diagnostics.Unexpected_token_0_, tokenToString(node.questionToken.kind));
            }
        }

        return false;
    }

    private checkTerminal(node: Terminal, allowOptional: boolean = false): void {
        this.checkGrammarOptionalSymbol(node, allowOptional);
        switch (node.literal.kind) {
            case SyntaxKind.TerminalLiteral:
                this.checkTerminalLiteral(node.literal);
                break;
            case SyntaxKind.UnicodeCharacterLiteral:
                this.checkUnicodeCharacterLiteral(node.literal);
                break;
        }
    }

    private checkTerminalLiteral(node: TerminalLiteral) {
        this.checkGrammarTerminalLiteral(node);
    }

    private checkGrammarTerminalLiteral(node: TerminalLiteral): boolean {
        if (!node.text) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.TerminalLiteral));
        }

        return false;
    }

    private checkGrammarUnicodeCharacterRange(node: UnicodeCharacterRange): boolean {
        if (!node.left) {
            return this.reportGrammarErrorForNode(node.throughKeyword || node.right || node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
        if (!node.throughKeyword) {
            return this.reportGrammarErrorForNode(node.right || node, Diagnostics._0_expected, tokenToString(SyntaxKind.ThroughKeyword));
        }
        if (!node.right) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }
        return false;
    }

    private checkUnicodeCharacterRange(node: UnicodeCharacterRange): void {
        this.checkGrammarUnicodeCharacterRange(node);
        this.checkUnicodeCharacterLiteral(node.left);
        this.checkUnicodeCharacterLiteral(node.right);
    }

    private checkUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): void {
        this.checkGrammarUnicodeCharacterLiteral(node);
    }

    private checkGrammarUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): boolean {
        if (!node.text) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.UnicodeCharacterLiteral));
        }

        return false;
    }

    private checkPlaceholder(node: PlaceholderSymbol): void {
    }

    private checkNonterminal(node: Nonterminal, allowOptional: boolean = false, allowArguments: boolean = true): void {
        this.checkGrammarNonTerminal(node, allowOptional, allowArguments);

        if (this.getDefine(node, "noStrictParametricProductions") || !allowArguments) {
            this.checkNonterminalNonStrict(node);
        }
        else {
            this.checkNonterminalStrict(node);
        }
    }

    private checkNonterminalNonStrict(node: Nonterminal): void {
        this.checkIdentifier(node.name);

        if (node.argumentList) {
            this.checkArgumentList(node.argumentList);
        }
    }

    private checkNonterminalStrict(node: Nonterminal): void {
        const nonterminalName = node.name;
        const productionSymbol = this.checkIdentifier(nonterminalName);
        if (productionSymbol) {
            const production = <Production>this._bindings.getDeclarations(productionSymbol)[0];
            const parameterListElements = production.parameterList?.elements;
            const argumentListElements = node.argumentList?.elements;
            const nameSet = new Set<string>();

            // Check each argument has a matching parameter.
            if (argumentListElements) {
                for (let i = 0; i < argumentListElements.length; i++) {
                    const argumentName = argumentListElements[i].name;
                    if (argumentName) {
                        const argumentNameText = argumentName.text;
                        if (argumentNameText) {
                            if (nameSet.has(argumentNameText)) {
                                this.reportError(argumentName, Diagnostics.Argument_0_cannot_be_specified_multiple_times, argumentNameText);
                            }
                            else {
                                nameSet.add(argumentNameText);
                                const parameterSymbol = this.resolveSymbol(production, argumentNameText, SymbolKind.Parameter);
                                if (!parameterSymbol) {
                                    this.reportError(argumentName, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, productionSymbol.name, argumentNameText);
                                }
                            }
                        }
                    }
                }
            }

            // Check each parameter has a matching argument.
            if (parameterListElements) {
                for (let i = 0; i < parameterListElements.length; i++) {
                    const parameterNameText = parameterListElements[i].name?.text;
                    if (parameterNameText && !nameSet.has(parameterNameText)) {
                        this.reportError(nonterminalName, Diagnostics.There_is_no_argument_given_for_parameter_0_, parameterNameText);
                    }
                }
            }
        }

        if (node.argumentList) {
            this.checkArgumentList(node.argumentList);
        }
    }

    private checkArgumentList(node: ArgumentList): void {
        this.checkGrammarArgumentList(node);

        if (node.elements) {
            for (const element of node.elements) {
                this.checkArgument(element);
            }
        }
    }

    private checkGrammarArgumentList(node: ArgumentList): boolean {
        if (!node.openBracketToken) {
            return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }

        if ((node.elements?.length ?? 0) <= 0) {
            return this.reportGrammarError(node, node.openBracketToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        if (!node.closeBracketToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
        }

        return false;
    }

    private checkArgument(node: Argument): void {
        this.checkGrammarArgument(node);
        if (node.name) this.checkIdentifier(node.name);
    }

    private checkGrammarArgument(node: Argument): boolean {
        const parent = this._bindings.getParent(node);
        if (parent?.kind === SyntaxKind.Constraints) {
            if (!node.operatorToken) {
                return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, formatList([SyntaxKind.PlusToken, SyntaxKind.TildeToken]));
            }
            if (node.operatorToken.kind !== SyntaxKind.PlusToken
                && node.operatorToken.kind !== SyntaxKind.TildeToken) {
                return this.reportGrammarErrorForNode(node.operatorToken, Diagnostics.Unexpected_token_0_, tokenToString(node.operatorToken.kind));
            }
        }
        else {
            if (node.operatorToken
                && node.operatorToken.kind !== SyntaxKind.QuestionToken
                && node.operatorToken.kind !== SyntaxKind.PlusToken
                && node.operatorToken.kind !== SyntaxKind.TildeToken) {
                return this.reportGrammarErrorForNode(node.operatorToken, Diagnostics.Unexpected_token_0_, tokenToString(node.operatorToken.kind));
            }

            if (!node.operatorToken) {
                return this.reportGrammarError(node, node.getStart(this._sourceFile), Diagnostics._0_expected, formatList([SyntaxKind.QuestionToken, SyntaxKind.PlusToken, SyntaxKind.TildeToken]));
            }
        }
        if (!node.name) {
            return this.reportGrammarError(node, node.operatorToken ? node.operatorToken.end : node.getStart(this._sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        return false;
    }

    private reportInvalidSymbol(node: LexicalSymbol): void {
        this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
            SyntaxKind.TerminalLiteral,
            SyntaxKind.Identifier,
            SyntaxKind.OpenBracketToken,
            SyntaxKind.OneKeyword
        ]));
    }

    private markSymbolAsReferenced(symbol: Symbol | undefined) {
        if (symbol) {
            this.getSymbolLinks(symbol, /*create*/ true).isReferenced = true;
        }
    }

    private resolveIdentifier(node: Identifier, reportErrors?: boolean): Symbol | undefined {
        let symbol = reportErrors ? undefined : this._bindings.getSymbol(node);
        if (!symbol && node.text) {
            const parent = this._bindings.getParent(node);
            if (parent) {
                switch (parent.kind) {
                    case SyntaxKind.Parameter:
                        symbol ??= this.resolveSymbol(node, node.text, SymbolKind.Parameter);
                        if (reportErrors) {
                            let declarationSymbol = this._bindings.getSymbol(parent);
                            if (declarationSymbol !== symbol) {
                                this.reportError(node, Diagnostics.Duplicate_identifier_0_, node.text);
                            }
                        }
                        this._bindings._setSymbol(node, symbol);
                        return symbol;

                    case SyntaxKind.Production:
                        symbol = this._bindings.getSymbol(parent);
                        this._bindings._setSymbol(node, symbol);
                        return symbol;

                    case SyntaxKind.LookaheadAssertion:
                    case SyntaxKind.Nonterminal:
                        if (!symbol) {
                            symbol = this.resolveSymbol(node, node.text, SymbolKind.Production, reportErrors ? Diagnostics.Cannot_find_name_0_ : undefined);
                            this.markSymbolAsReferenced(symbol);
                        }
                        break;

                    case SyntaxKind.Argument:
                        const argument = <Argument>parent;
                        if (argument.operatorToken?.kind === SyntaxKind.QuestionToken) {
                            symbol ??= this.resolveSymbol(node, node.text, SymbolKind.Parameter);
                            if (!symbol && reportErrors) {
                                const production = <Production>this._bindings.getAncestor(argument, SyntaxKind.Production);
                                this.reportError(node, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, production.name.text, node.text);
                            }
                            this.markSymbolAsReferenced(symbol);
                        }
                        else {
                            // get the symbol of the parameter of the target production
                            const nonterminal = <Nonterminal | undefined>this._bindings.getAncestor(parent, SyntaxKind.Nonterminal);
                            if (nonterminal?.name?.text) {
                                const productionSymbol = this.resolveSymbol(node, nonterminal.name.text, SymbolKind.Production);
                                if (productionSymbol) {
                                    const production = <Production>this._bindings.getDeclarations(productionSymbol)[0];
                                    symbol ??= this.resolveSymbol(production, node.text, SymbolKind.Parameter);
                                    if (!symbol && reportErrors) {
                                        this.reportError(node, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, production.name.text, node.text);
                                    }
                                }
                            }
                            else {
                                const constraints = <Constraints | undefined>this._bindings.getAncestor(parent, SyntaxKind.Constraints);
                                if (constraints) {
                                    const production = <Production>this._bindings.getAncestor(constraints, SyntaxKind.Production);
                                    if (!symbol) {
                                        symbol = this.resolveSymbol(production, node.text, SymbolKind.Parameter);
                                        this.markSymbolAsReferenced(symbol);
                                    }
                                    if (!symbol && reportErrors) {
                                        this.reportError(node, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, production.name.text, node.text);
                                    }
                                }
                            }
                        }
                        break;
                }

                this._bindings._setSymbol(node, symbol);
            }
        }

        return symbol;
    }

    private checkIdentifier(node: Identifier): Symbol | undefined {
        this.checkGrammarIdentifier(node);
        return this.resolveIdentifier(node, /*reportErrors*/ true);
    }

    private checkGrammarIdentifier(node: Identifier) {
        if (!node.text) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }
        return false;
    }

    private getNodeLinks(node: Node, create: true): NodeLinks;
    private getNodeLinks(node: Node, create?: boolean): NodeLinks | undefined;
    private getNodeLinks(node: Node, create?: boolean) {
        let links = this._nodeLinks?.get(node);
        if (!links && create) (this._nodeLinks ??= new Map()).set(node, links = new NodeLinks());
        return links;
    }

    private getSymbolLinks(symbol: Symbol, create: true): SymbolLinks;
    private getSymbolLinks(symbol: Symbol, create?: boolean): SymbolLinks | undefined;
    private getSymbolLinks(symbol: Symbol, create?: boolean) {
        let links = this._symbolLinks?.get(symbol);
        if (!links && create) (this._symbolLinks ??= new Map()).set(symbol, links = new SymbolLinks());
        return links;
    }

    private resolveSymbol(location: Node, name: string, meaning: SymbolKind, diagnosticMessage?: Diagnostic): Symbol | undefined {
        const result = this._bindings.resolveSymbol(location, name, meaning);
        if (!result && diagnosticMessage) {
            this.reportError(location, diagnosticMessage, name);
        }

        return result;
    }

    private reportError(location: Node, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        const sourceFile = this._bindings.getSourceFile(location) ?? this._sourceFile;
        if (sourceFile !== this._sourceFile) {
            this._diagnostics.setSourceFile(sourceFile);
            this._diagnostics.reportNode(sourceFile, location, diagnosticMessage, arg0, arg1, arg2);
            this._diagnostics.setSourceFile(this._sourceFile);
        }
        else {
            this._diagnostics.reportNode(sourceFile, location, diagnosticMessage, arg0, arg1, arg2);
        }
    }

    private reportGrammarError(context: Node, pos: number, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        const sourceFile = this._bindings.getSourceFile(context) ?? this._sourceFile;
        if (sourceFile !== this._sourceFile) {
            this._diagnostics.setSourceFile(sourceFile);
            this._diagnostics.report(pos, diagnosticMessage, arg0, arg1, arg2);
            this._diagnostics.setSourceFile(this._sourceFile);
        }
        else {
            this._diagnostics.report(pos, diagnosticMessage, arg0, arg1, arg2);
        }
        return true;
    }

    private reportGrammarErrorForNode(location: Node, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        this.reportError(location, diagnosticMessage, arg0, arg1, arg2);
        return true;
    }

    private reportGrammarErrorForNodeOrPos(context: Node, location: Node | undefined, pos: number, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        return location
            ? this.reportGrammarErrorForNode(location, diagnosticMessage, arg0, arg1, arg2)
            : this.reportGrammarError(context, pos, diagnosticMessage, arg0, arg1, arg2);
    }

    private reportInvalidHtmlTrivia(nodes: HtmlTrivia[] | undefined) {
        if (nodes?.length) {
            return this.reportGrammarErrorForNode(nodes[0], Diagnostics.HTML_trivia_not_allowed_here);
        }
        return false;
    }
}

/** {@docCategory Check} */
export class Resolver {
    public readonly bindings: BindingTable;

    private _lineOffsetMap: LineOffsetMap | undefined;

    constructor(bindings: BindingTable, lineOffsetMap?: LineOffsetMap) {
        this.bindings = bindings;
        this._lineOffsetMap = lineOffsetMap;
    }

    /**
     * Gets the effective filename of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectiveFilenameAtPosition(sourceFile: SourceFile, position: Position) {
        return this._lineOffsetMap?.getEffectiveFilenameAtPosition(sourceFile, position) ?? sourceFile.filename;
    }

    /**
     * Gets the effective position of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectivePosition(sourceFile: SourceFile, position: Position) {
        return this._lineOffsetMap?.getEffectivePosition(sourceFile, position) ?? position;
    }

    /**
     * Gets the effective range of a raw range within a source file, taking into account `@line` directives.
     */
    public getEffectiveRange(sourceFile: SourceFile, range: Range) {
        return this._lineOffsetMap?.getEffectiveRange(sourceFile, range) ?? range;
    }

    /**
     * Gets the filename of a parsed grammarkdown file for the provided effective filename and position, taking into account `@line` directives.
     */
    public getRawFilenameAtEffectivePosition(filename: string, position: Position) {
        return this._lineOffsetMap?.getRawFilenameAtEffectivePosition(filename, position);
    }

    /**
     * Gets the position in a parsed grammarkdown file for the provided effective filename and position, taking into account `@line` directives.
     */
    public getRawPositionFromEffectivePosition(filename: string, position: Position) {
        return this._lineOffsetMap?.getRawPositionFromEffectivePosition(filename, position);
    }

    /**
     * Gets the range in a parsed grammarkdown file for the provided effective filename and position, taking into account `@line` directives.
     */
    public getRawRangeFromEffectiveRange(filename: string, range: Range) {
        return this._lineOffsetMap?.getRawRangeFromEffectiveRange(filename, range);
    }

    /**
     * Gets the parent `Node` for `node`.
     */
    public getParent(node: Node): Node | undefined {
        return this.bindings.getParent(node);
    }

    /**
     * Creates a `NodeNavigator` pointing at `node`. Returns `undefined` if `node` does not have a `SourceFile` as an ancestor.
     */
    public createNavigator(node: Node): NodeNavigator | undefined {
        if (node.kind === SyntaxKind.SourceFile) {
            return new NodeNavigator(<SourceFile>node);
        }
        else {
            const parent = this.bindings.getParent(node);
            if (parent) {
                const navigator = this.createNavigator(parent);
                if (navigator?.moveToFirstChild(child => child === node)) {
                    return navigator;
                }
            }
        }

        return undefined;
    }

    /**
     * Gets the `SourceFile` of `node`, if it belongs to one.
     */
    public getSourceFileOfNode(node: Node) {
        return this.bindings.getAncestor(node, SyntaxKind.SourceFile) as SourceFile | undefined;
    }

    /**
     * Gets the `Symbol` for `node`, if it has one.
     */
    public getSymbolOfNode(node: Node | undefined) {
        return this.bindings.getSymbol(node);
    }

    /**
     * Resolves a `Symbol` for the provided `name` at the given `location` that has the provided `meaning`.
     */
    public resolveSymbol(location: Node, name: string, meaning: SymbolKind): Symbol | undefined {
        return this.bindings.resolveSymbol(location, name, meaning);
    }

    /**
     * Gets the declarations for the provided identifier.
     */
    public getDeclarations(node: Identifier): Declaration[];
    /**
     * Gets the declarations for `name` at the provided `location` that have the given `meaning`.
     */
    public getDeclarations(name: string, meaning: SymbolKind.SourceFile, location: Node): SourceFile[];
    /**
     * Gets the declarations for `name` at the provided `location` that have the given `meaning`.
     */
    public getDeclarations(name: string, meaning: SymbolKind.Production, location: Node): Production[];
    /**
     * Gets the declarations for `name` at the provided `location` that have the given `meaning`.
     */
    public getDeclarations(name: string, meaning: SymbolKind.Parameter, location: Node): Parameter[];
    /**
     * Gets the declarations for `name` at the provided `location` that have the given `meaning`.
     */
    public getDeclarations(name: string, meaning: SymbolKind, location: Node): Declaration[];
    public getDeclarations(node: string | Identifier, meaning?: SymbolKind, location?: Node) {
        let symbol: Symbol | undefined;
        if (typeof node === "string") {
            if (meaning === undefined) throw new TypeError("SymbolKind expected: meaning");
            if (location === undefined) throw new TypeError("Node expected: location");
            symbol = this.bindings.resolveSymbol(location, node, meaning);
        }
        else {
            const parent = this.bindings.getParent(node);
            symbol = this.bindings.getSymbol(node);
            if (!symbol && node.text) {
                symbol = this.bindings.resolveSymbol(node, node.text, getSymbolMeaning(parent));
            }
        }

        if (symbol) {
            return this.bindings.getDeclarations(symbol);
        }

        return [];
    }

    /**
     * Gets the references to the provided identifier.
     */
    public getReferences(node: Identifier): Node[];
    /**
     * Gets the references to `name` at the provided `location` that have the given `meaning`.
     */
    public getReferences(name: string, meaning: SymbolKind, location: Node): Node[];
    public getReferences(node: string | Identifier, meaning?: SymbolKind, location?: Node) {
        let symbol: Symbol | undefined;
        if (typeof node === "string") {
            if (meaning === undefined) throw new TypeError("SymbolKind expected: meaning");
            if (location === undefined) throw new TypeError("Node expected: location");
            symbol = this.bindings.resolveSymbol(location, node, meaning);
        }
        else {
            const parent = this.bindings.getParent(node);
            if (parent) {
                symbol = parent.kind === SyntaxKind.Parameter
                    ? this.bindings.resolveSymbol(node, node.text, SymbolKind.Parameter)
                    : this.bindings.resolveSymbol(node, node.text, SymbolKind.Production);
            }
        }
        if (symbol) {
            return this.bindings.getReferences(symbol);
        }

        return [];
    }

    /**
     * Get the link id for the `Production` to which the provided `node` resolves.
     */
    public getProductionLinkId(node: Identifier): string | undefined {
        const symbol = this.bindings.resolveSymbol(node, node.text, SymbolKind.Production);
        return symbol?.name;
    }

    /**
     * Gets the right-hand-side link id for the provided `RightHandSide`.
     * @param includePrefix When `true`, prepends the production link id.
     */
    public getRightHandSideLinkId(node: RightHandSide, includePrefix: boolean): string {
        let linkId: string;
        if (node.reference?.text) {
            linkId = node.reference.text.replace(/[^a-z0-9]+/g, '-');
        }
        else {
            const digest = new RightHandSideDigest();
            linkId = digest.computeHash(node).toLowerCase();
        }

        if (includePrefix) {
            const production = <Production>this.bindings.getAncestor(node, SyntaxKind.Production);
            const productionId = this.getProductionLinkId(production.name);
            return productionId + "-" + linkId;
        }

        return linkId;
    }
}

class RightHandSideDigest {
    private spaceRequested: boolean = false;
    private writer!: StringWriter;

    public computeHash(node: RightHandSide): string {
        this.writer = new StringWriter("\n");
        this.writeNode(node.head);

        const hash = createHash("sha1");
        hash.update(this.writer.toString(), "utf8");

        const digest = hash.digest().toString("base64");
        const digestUrlSafe = digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        return digestUrlSafe.slice(0, 8);
    }

    private writeNode(node: Node | undefined) {
        if (!node) {
            return;
        }

        switch (node.kind) {
            case SyntaxKind.Constraints: break;
            case SyntaxKind.TerminalLiteral: this.writeTerminalLiteral(<TerminalLiteral>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.writeUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
            case SyntaxKind.Prose: this.writeProse(<Prose>node); break;
            case SyntaxKind.Nonterminal: this.writeNonterminal(<Nonterminal>node); break;
            case SyntaxKind.Terminal: this.writeTerminal(<Terminal>node); break;
            case SyntaxKind.EmptyAssertion: this.writeEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.writeLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: break;
            case SyntaxKind.NoSymbolHereAssertion: break;
            case SyntaxKind.ProseAssertion: this.writeProseAssertion(<ProseAssertion>node); break;
            case SyntaxKind.ProseFull: this.writeProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseHead: this.writeProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseMiddle: this.writeProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseTail: this.writeProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.UnicodeCharacterRange: this.writeUnicodeCharacterRange(<UnicodeCharacterRange>node); break;
            case SyntaxKind.ButNotSymbol: this.writeButNotSymbol(<ButNotSymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.writeOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.SymbolSpan: this.writeSymbolSpan(<SymbolSpan>node); break;
            case SyntaxKind.SymbolSet: this.writeSymbolSet(<SymbolSet>node); break;
            case SyntaxKind.ArgumentList: break;
            case SyntaxKind.Argument: break;
            case SyntaxKind.Identifier: this.writeIdentifier(<Identifier>node); break;
            default:
                if ((node.kind >= SyntaxKind.FirstKeyword && node.kind <= SyntaxKind.LastKeyword) ||
                    (node.kind >= SyntaxKind.FirstPunctuation && node.kind <= SyntaxKind.LastPunctuation)) {
                    this.writeToken(node);
                    break;
                }
                else {
                    for (const child of node.children()) {
                        this.writeNode(child);
                    }
                    break;
                }
        }
    }

    private write(text: string | undefined) {
        if (text) {
            if (this.spaceRequested && this.writer.size > 0) {
                this.spaceRequested = false;
                this.writer.write(" ");
            }

            this.writer.write(text);
        }
    }

    private writeToken(node: Node | undefined) {
        if (node) {
            this.write(tokenToString(node.kind));
            this.spaceRequested = true;
        }
    }

    private writeTerminal(node: Terminal) {
        this.writeNode(node.literal);
        this.spaceRequested = false;
        this.writeNode(node.questionToken);
        this.spaceRequested = true;
    }

    private writeTerminalLiteral(node: TerminalLiteral) {
        this.write("`");
        this.write(node.text);
        this.write("`");
        this.spaceRequested = true;
    }

    private writeUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.write("<");
        this.write(node.text);
        this.write(">");
        this.spaceRequested = true;
    }

    private writeProse(node: Prose) {
        this.write("> ");
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.writeNode(fragment);
            }
        }
    }

    private writeNonterminal(node: Nonterminal) {
        this.writeNode(node.name);
        this.writeNode(node.argumentList);
        this.writeNode(node.questionToken);
        this.spaceRequested = true;
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

    private writeProseAssertion(node: ProseAssertion) {
        this.write("[>");
        this.spaceRequested = false;
        if (node.fragments) {
            for (const fragment of node.fragments) {
                if (fragment.kind === SyntaxKind.Identifier) {
                    this.write("|");
                    this.writeNode(fragment);
                    this.spaceRequested = false;
                    this.write("|");
                }
                else {
                    this.writeNode(fragment);
                }
            }
        }
        this.write("]");
        this.spaceRequested = true;
    }

    private writeProseFragmentLiteral(node: ProseFragmentLiteral) {
        this.write(node.text);
    }

    private writeUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.writeNode(node.left);
        this.writeNode(node.throughKeyword);
        this.writeNode(node.right);
        this.spaceRequested = true;
    }

    private writeButNotSymbol(node: ButNotSymbol) {
        this.writeNode(node.left);
        this.writeNode(node.butKeyword);
        this.writeNode(node.notKeyword);
        this.writeNode(node.right);
        this.spaceRequested = true;
    }

    private writeOneOfSymbol(node: OneOfSymbol) {
        this.write("one of ");
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.write(" or ");
                }

                this.writeNode(node.symbols[i]);
                this.spaceRequested = false;
            }

            this.spaceRequested = true;
        }
    }

    private writeSymbolSpan(node: SymbolSpan) {
        this.writeNode(node.symbol);
        this.writeNode(node.next);
    }

    private writeSymbolSet(node: SymbolSet) {
        this.write("{ ");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.write(", ");
                }

                this.writeNode(node.elements[i]);
                this.spaceRequested = false;
            }
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
            case SyntaxKind.ProseAssertion:
            case SyntaxKind.InvalidAssertion:
                return true;
        }
    }

    return false;
}

function getSymbolMeaning(node: Node | undefined) {
    if (node) {
        switch (node.kind) {
            case SyntaxKind.Parameter:
            case SyntaxKind.Argument:
            case SyntaxKind.Constraints:
                return SymbolKind.Parameter;
        }
    }

    return SymbolKind.Production;
}
