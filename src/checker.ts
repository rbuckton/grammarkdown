/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { createHash } from "crypto";
import { CancellationToken } from "prex";
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
    Line
} from "./nodes";
import { NodeNavigator } from "./navigator";
import { toCancelToken } from "./core";
import { Position, Range } from "./types";
import { RegionMap } from "./regionMap";

// TODO: Check a Nonterminal as a call
// TODO: Check all Productions to ensure they have the same parameters.

interface NodeLinks {
    hasResolvedSymbols?: boolean;
}

interface SymbolLinks {
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
    private options: CompilerOptions | undefined;
    private checkedFileSet = new Set<string>();
    private bindings!: BindingTable;
    private diagnostics!: DiagnosticMessages;
    private sourceFile!: SourceFile;
    private noChecks!: boolean;
    private productionParametersByName!: Map<Production, Set<string>>;
    private cancelToken?: CancelToken;
    private nodeLinks?: Map<Node, NodeLinks>;
    private symbolLinks?: Map<Symbol, SymbolLinks>;
    private lineOffsetMap: LineOffsetMap;
    private defines: Defines;
    private defineOverrideMap?: RegionMap<DefineOverrides>;

    constructor(options?: CompilerOptions, lineOffsetMap = new LineOffsetMap()) {
        this.options = options;
        this.lineOffsetMap = lineOffsetMap;
        this.defines = {
            noStrictParametricProductions: this.options?.noStrictParametricProductions ?? false,
            noUnusedParameters: this.options?.noUnusedParameters ?? false
        };
    }

    public checkSourceFile(sourceFile: SourceFile, bindings: BindingTable, diagnostics: DiagnosticMessages, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public checkSourceFile(sourceFile: SourceFile, bindings: BindingTable, diagnostics: DiagnosticMessages, cancelable?: CancellationToken | Cancelable): void;
    public checkSourceFile(sourceFile: SourceFile, bindings: BindingTable, diagnostics: DiagnosticMessages, cancelable?: CancellationToken | CancelToken | Cancelable): void {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        if (!this.checkedFileSet.has(sourceFile.filename)) {
            const savedNoChecks = this.noChecks;
            const savedCancellationToken = this.cancelToken;
            const savedSourceFile = this.sourceFile;
            const savedProductionParametersByName = this.productionParametersByName;
            const savedBindings = this.bindings;
            const savedDiagnostics = this.diagnostics;
            try {
                this.cancelToken = cancelToken;
                this.sourceFile = sourceFile;
                this.productionParametersByName = new Map<Production, Set<string>>();
                this.noChecks = this.options?.noChecks ?? false;

                this.bindings = new BindingTable();
                this.bindings.copyFrom(bindings);

                this.diagnostics = this.noChecks ? NullDiagnosticMessages.instance : new DiagnosticMessages();
                this.diagnostics.setSourceFile(this.sourceFile);

                for (const element of sourceFile.elements) {
                    this.preprocessSourceElement(element);
                }

                for (const element of sourceFile.elements) {
                    this.checkSourceElement(element);
                }

                diagnostics.copyFrom(this.diagnostics);
                bindings.copyFrom(this.bindings);
                this.checkedFileSet.add(sourceFile.filename);
            }
            finally {
                this.noChecks = savedNoChecks;
                this.cancelToken = savedCancellationToken;
                this.sourceFile = savedSourceFile;
                this.productionParametersByName = savedProductionParametersByName;
                this.bindings = savedBindings;
                this.diagnostics = savedDiagnostics;
            }
        }
    }

    private getDefine<K extends keyof DefineOverrides>(location: Node, key: K): NonNullable<Defines[K]>;
    private getDefine<K extends keyof DefineOverrides>(location: Node, key: K) {
        if (this.defineOverrideMap) {
            const position = this.sourceFile.lineMap.positionAt(location.getStart(this.sourceFile))
            for (const region of this.defineOverrideMap.regions(this.sourceFile, position.line)) {
                const value = region.value[key];
                if (value === "default") break;
                if (value === undefined) continue;
                return value;
            }
        }
        return this.defines[key];
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
            const position = this.sourceFile.lineMap.positionAt(node.getStart(this.sourceFile));
            const nodeKey = node.key;
            const nodeKeyText = nodeKey.text;
            this.defineOverrideMap ??= new RegionMap(equateDefines);
            switch (nodeKeyText) {
                case "noStrictParametricProductions":
                    this.defineOverrideMap.addRegion(this.sourceFile, position.line, {
                        noStrictParametricProductions: node.valueToken!.kind === SyntaxKind.DefaultKeyword ? "default" :
                            node.valueToken!.kind === SyntaxKind.TrueKeyword
                    });
                    break;

                case "noUnusedParameters":
                    this.defineOverrideMap.addRegion(this.sourceFile, position.line, {
                        noUnusedParameters: node.valueToken!.kind === SyntaxKind.DefaultKeyword ? "default" :
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
        if (!node.key || !node.key.text) {
            return this.reportGrammarError(node, node.defineKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        if (!node.valueToken) {
            return this.reportGrammarError(node, node.key.end, Diagnostics._0_expected, formatList([SyntaxKind.TrueKeyword, SyntaxKind.FalseKeyword, SyntaxKind.DefaultKeyword]));
        }
    }

    private preprocessLine(node: Line) {
        if (!this.checkGrammarLine(node)) {
            const generatedLine = this.sourceFile.lineMap.positionAt(node.end).line + 1;
            if (node.number?.kind === SyntaxKind.DefaultKeyword) {
                this.lineOffsetMap.addLineOffset(this.sourceFile, generatedLine, "default");
            }
            else if (node.number?.kind === SyntaxKind.NumberLiteral) {
                this.lineOffsetMap.addLineOffset(this.sourceFile, generatedLine, { line: +node.number.text! - 1, file: node.path?.text });
            }
        }
    }

    private checkGrammarLine(node: Line) {
        if (!node.number) {
            return this.reportGrammarError(node, node.lineKeyword.end, Diagnostics._0_expected, formatList([SyntaxKind.NumberLiteral, SyntaxKind.DefaultKeyword]));
        }
    }

    private checkSourceElement(node: SourceElement): void {
        switch (node.kind) {
            case SyntaxKind.Production:
                this.checkProduction(<Production>node);
                break;

            // case SyntaxKind.InvalidSourceElement:
            //     this.reportInvalidSourceElement(<SourceElement>node);
            //     break;
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
            const symbol = this.bindings.getSymbol(node);
            if (symbol) {
                for (const decl of this.bindings.getDeclarations(symbol)) {
                    if (decl.kind === SyntaxKind.Production) {
                        this.resolveProduction(decl);
                    }
                }
            }
            if (node.parameterList?.elements) {
                for (const param of node.parameterList.elements) {
                    const symbol = this.bindings.getSymbol(param);
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
        let parametersByName = this.productionParametersByName.get(node);
        if (parametersByName) return parametersByName;
        this.productionParametersByName.set(node, parametersByName = new Set<string>());
        const parameterList = node.parameterList;
        const parameters = parameterList ? parameterList.elements : undefined;
        if (parameters) {
            for (let i = 0; i < parameters.length; i++) {
                const parameter = parameters[i];
                const parameterName = parameter ? parameter.name : undefined;
                const parameterNameText = parameterName ? parameterName.text : undefined;
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
        const thisProductionParameters = thisProductionParameterList ? thisProductionParameterList.elements : undefined;
        const thisProductionParameterCount = thisProductionParameters ? thisProductionParameters.length : 0;
        const firstProduction = <Production>this.bindings.getDeclarations(thisProductionSymbol)[0];
        if (thisProductionParameterList && thisProductionParameters) {
            this.checkParameterList(thisProductionParameterList);
        }

        if (firstProduction === thisProduction) {
            return;
        }

        const thisProductionParameterNames = this.getProductionParametersByName(thisProduction);
        const firstProductionParameterList = firstProduction.parameterList;
        const firstProductionParameters = firstProductionParameterList ? firstProductionParameterList.elements : undefined;
        const firstProductionParameterCount = firstProductionParameters ? firstProductionParameters.length : 0;
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
            return this.reportGrammarError(node, node.parameterList ? node.parameterList.end : node.name.end, Diagnostics._0_expected, tokenToString(SyntaxKind.ColonToken));
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
        if (!node.openParenToken) {
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }

        if (node.openParenToken.kind === SyntaxKind.OpenParenToken) {
            return this.reportGrammarErrorForNode(node.openParenToken, Diagnostics.Obsolete_0_, `Support for using parenthesis to enclose production parameter lists is deprecated and may be removed in a future update. Please switch to bracket's ('[', ']') when enclosing production parameter lists.`)
        }

        if (!node.elements) {
            return this.reportGrammarError(node, node.openParenToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        if (!node.closeParenToken) {
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
                        this.checkTerminal(terminal);
                    }
                }
            }
        }
    }

    private checkGrammarOneOfList(node: OneOfList): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }

        if (!node.ofKeyword) {
            return this.reportGrammarError(node, node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }

        if (!node.terminals) {
            return this.reportGrammarError(node, node.ofKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
        }

        // if (node.openIndentToken && !node.closeIndentToken) {
        //     return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.DedentToken));
        // }

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
        // if (!node.openIndentToken) {
        //     return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.IndentToken));
        // }

        if (!node.elements || node.elements.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                SyntaxKind.Terminal,
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
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([SyntaxKind.GreaterThanToken, SyntaxKind.OpenBracketToken, SyntaxKind.Identifier, SyntaxKind.Terminal, SyntaxKind.UnicodeCharacterLiteral]));
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
        if (!node.elements) {
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.Terminal,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                SyntaxKind.Prose
            ]));
        }

        if (node.next) {
            if (node.symbol.kind === SyntaxKind.Prose) {
                return this.reportGrammarError(node, node.symbol.end, Diagnostics._0_expected, "«line terminator»");
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, formatList([
                SyntaxKind.UnicodeCharacterLiteral,
                SyntaxKind.Terminal,
                SyntaxKind.Identifier,
                SyntaxKind.OpenBracketToken,
                "«line terminator»"
            ]));
        }

        if (node.symbol.kind === SyntaxKind.Prose) {
            return this.reportGrammarError(node, node.symbol.getStart(this.sourceFile), Diagnostics._0_expected, "«line terminator»");
        }

        if (node.next && node.next.symbol.kind === SyntaxKind.Prose) {
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
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
                    return this.reportGrammarError(node, node.operatorToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));

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
                if (!node.lookahead || !isTerminal(node.lookahead)) {
                    return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
                        SyntaxKind.Terminal,
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

        function isTerminal(node: SymbolSpan | SymbolSet) {
            if (node.kind !== SyntaxKind.SymbolSpan) return false;
            switch (node.symbol.kind) {
                case SyntaxKind.Terminal:
                case SyntaxKind.UnicodeCharacterLiteral:
                    return true;
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBraceToken));
        }

        if (!node.elements) {
            return this.reportGrammarError(node, node.openBraceToken.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.LexicalKeyword));
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.NoKeyword));
        }

        if (!node.symbols || node.symbols.length <= 0) {
            return this.reportGrammarError(node, node.noKeyword.end, Diagnostics._0_expected, formatList([
                SyntaxKind.Identifier,
                SyntaxKind.Terminal,
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
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketGreaterThanToken));
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
        if (typeof node.text !== "string") {
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
            for (const symbol of node.symbols) {
                this.checkPrimarySymbol(symbol);
            }
        }
    }

    private checkGrammarOneOfSymbol(node: OneOfSymbol): boolean {
        if (!node.oneKeyword) {
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OneKeyword));
        }

        if (!node.ofKeyword) {
            return this.reportGrammarError(node, node.oneKeyword.end, Diagnostics._0_expected, tokenToString(SyntaxKind.OfKeyword));
        }

        if (!node.symbols || node.symbols.length <= 0) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, formatList([
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
            return this.reportGrammarErrorForNode(node.argumentList, Diagnostics.Unexpected_token_0_, tokenToString(node.argumentList.openParenToken.kind));
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
        this.checkGrammarOptionalSymbol(node, allowOptional) || this.checkGrammarTerminal(node);
    }

    private checkGrammarTerminal(node: Terminal): boolean {
        if (typeof node.text !== "string" || node.text.length === 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Terminal));
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

    private checkUnicodeCharacterLiteral(node: UnicodeCharacterLiteral, allowOptional: boolean = false): void {
        this.checkGrammarOptionalSymbol(node, allowOptional) || this.checkGrammarUnicodeCharacterLiteral(node);
    }

    private checkGrammarUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): boolean {
        if (typeof node.text !== "string" || node.text.length === 0) {
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
            const production = <Production>this.bindings.getDeclarations(productionSymbol)[0];
            const parameterList = production.parameterList;
            const parameterListElements = parameterList && parameterList.elements;
            const argumentList = node.argumentList;
            const argumentListElements = argumentList && argumentList.elements;
            const nameSet = new Set<string>();

            // Check each argument has a matching parameter.
            if (argumentListElements) {
                for (let i = 0; i < argumentListElements.length; i++) {
                    const argument = argumentListElements[i];
                    const argumentName = argument.name;
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
                    const parameter = parameterListElements[i];
                    const parameterName = parameter.name;
                    if (parameterName) {
                        const parameterNameText = parameterName.text;
                        if (parameterNameText && !nameSet.has(parameterNameText)) {
                            this.reportError(nonterminalName, Diagnostics.There_is_no_argument_given_for_parameter_0_, parameterNameText);
                        }
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
        if (!node.openParenToken) {
            return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.OpenBracketToken));
        }

        if (node.openParenToken.kind === SyntaxKind.OpenParenToken) {
            return this.reportGrammarErrorForNode(node.openParenToken, Diagnostics.Obsolete_0_, `Support for using parenthesis to enclose an argument list is deprecated and may be removed in a future update. Please switch to bracket's ('[', ']') when enclosing argument lists.`)
        }

        if (!node.elements) {
            return this.reportGrammarError(node, node.openParenToken.end, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        if (!node.closeParenToken) {
            return this.reportGrammarError(node, node.end, Diagnostics._0_expected, tokenToString(SyntaxKind.CloseBracketToken));
        }

        return false;
    }

    private checkArgument(node: Argument): void {
        this.checkGrammarArgument(node);
        if (node.name) this.checkIdentifier(node.name);
    }

    private checkGrammarArgument(node: Argument): boolean {
        const parent = this.bindings.getParent(node);
        if (parent && parent.kind === SyntaxKind.Constraints) {
            if (!node.operatorToken) {
                return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, formatList([SyntaxKind.PlusToken, SyntaxKind.TildeToken]));
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

            if (!node.operatorToken && !this.getDefine(node, "noStrictParametricProductions")) {
                return this.reportGrammarError(node, node.getStart(this.sourceFile), Diagnostics._0_expected, formatList([SyntaxKind.QuestionToken, SyntaxKind.PlusToken, SyntaxKind.TildeToken]));
            }
        }
        if (!node.name) {
            return this.reportGrammarError(node, node.operatorToken ? node.operatorToken.end : node.getStart(this.sourceFile), Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
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

    private markSymbolAsReferenced(symbol: Symbol | undefined) {
        if (symbol) {
            this.getSymbolLinks(symbol, /*create*/ true).isReferenced = true;
        }
    }

    private resolveIdentifier(node: Identifier, reportErrors?: boolean): Symbol | undefined {
        let symbol = reportErrors ? undefined : this.bindings.getSymbol(node);
        if (!symbol && node.text) {
            const parent = this.bindings.getParent(node);
            if (parent) {
                switch (parent.kind) {
                    case SyntaxKind.Parameter:
                        if (!symbol) {
                            symbol = this.resolveSymbol(node, node.text, SymbolKind.Parameter);
                        }
                        if (reportErrors) {
                            let declarationSymbol = this.bindings.getSymbol(parent);
                            if (declarationSymbol !== symbol) {
                                this.reportError(node, Diagnostics.Duplicate_identifier_0_, node.text);
                            }
                        }
                        this.bindings.setSymbol(node, symbol);
                        return symbol;

                    case SyntaxKind.Production:
                        symbol = this.bindings.getSymbol(parent);
                        this.bindings.setSymbol(node, symbol);
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
                        if (argument.operatorToken && argument.operatorToken.kind === SyntaxKind.QuestionToken) {
                            if (!symbol) {
                                symbol = this.resolveSymbol(node, node.text, SymbolKind.Parameter);
                            }
                            if (!symbol && reportErrors) {
                                const production = <Production>this.bindings.getAncestor(argument, SyntaxKind.Production);
                                this.reportError(node, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, production.name.text, node.text);
                            }
                            this.markSymbolAsReferenced(symbol);
                        }
                        else {
                            // get the symbol of the parameter of the target production
                            const nonterminal = <Nonterminal | undefined>this.bindings.getAncestor(parent, SyntaxKind.Nonterminal);
                            if (nonterminal && nonterminal.name && nonterminal.name.text) {
                                const productionSymbol = this.resolveSymbol(node, nonterminal.name.text, SymbolKind.Production);
                                if (productionSymbol) {
                                    const production = <Production>this.bindings.getDeclarations(productionSymbol)[0];
                                    if (!symbol) {
                                        symbol = this.resolveSymbol(production, node.text, SymbolKind.Parameter);
                                    }
                                    if (!symbol && reportErrors) {
                                        this.reportError(node, Diagnostics.Production_0_does_not_have_a_parameter_named_1_, production.name.text, node.text);
                                    }
                                }
                            }
                            else {
                                const constraints = <Constraints | undefined>this.bindings.getAncestor(parent, SyntaxKind.Constraints);
                                if (constraints) {
                                    const production = <Production>this.bindings.getAncestor(constraints, SyntaxKind.Production);
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

                this.bindings.setSymbol(node, symbol);
            }
        }

        return symbol;
    }

    private checkIdentifier(node: Identifier): Symbol | undefined {
        this.checkGrammarIdentifier(node);
        return this.resolveIdentifier(node, /*reportErrors*/ true);
    }

    private checkGrammarIdentifier(node: Identifier): boolean {
        if (typeof node.text === "undefined" || node.text.length <= 0) {
            return this.reportGrammarErrorForNode(node, Diagnostics._0_expected, tokenToString(SyntaxKind.Identifier));
        }

        return false;
    }

    // private reportInvalidSourceElement(node: SourceElement): void {
    //     this.reportGrammarErrorForNode(node, Diagnostics._0_expected, formatList([
    //         SyntaxKind.Production
    //     ]));
    // }

    private getNodeLinks(node: Node, create: true): NodeLinks;
    private getNodeLinks(node: Node, create?: boolean): NodeLinks | undefined;
    private getNodeLinks(node: Node, create?: boolean) {
        if (!this.nodeLinks) this.nodeLinks = new Map();
        let links = this.nodeLinks.get(node);
        if (!links) this.nodeLinks.set(node, links = {});
        return links;
    }

    private getSymbolLinks(symbol: Symbol, create: true): SymbolLinks;
    private getSymbolLinks(symbol: Symbol, create?: boolean): SymbolLinks | undefined;
    private getSymbolLinks(symbol: Symbol, create?: boolean) {
        if (!this.symbolLinks) this.symbolLinks = new Map();
        let links = this.symbolLinks.get(symbol);
        if (!links) this.symbolLinks.set(symbol, links = {});
        return links;
    }

    private resolveSymbol(location: Node, name: string, meaning: SymbolKind, diagnosticMessage?: Diagnostic): Symbol | undefined {
        const result = this.bindings.resolveSymbol(location, name, meaning);
        if (!result && diagnosticMessage) {
            this.reportError(location, diagnosticMessage, name);
        }

        return result;
    }

    private reportError(location: Node, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        const sourceFile = this.bindings.getSourceFile(location) ?? this.sourceFile;
        if (sourceFile !== this.sourceFile) {
            this.diagnostics.setSourceFile(sourceFile);
            this.diagnostics.reportNode(sourceFile, location, diagnosticMessage, arg0, arg1, arg2);
            this.diagnostics.setSourceFile(this.sourceFile);
        }
        else {
            this.diagnostics.reportNode(sourceFile, location, diagnosticMessage, arg0, arg1, arg2);
        }
    }

    private reportGrammarError(context: Node, pos: number, diagnosticMessage: Diagnostic, arg0?: any, arg1?: any, arg2?: any) {
        const sourceFile = this.bindings.getSourceFile(context) ?? this.sourceFile;
        if (sourceFile !== this.sourceFile) {
            this.diagnostics.setSourceFile(sourceFile);
            this.diagnostics.report(pos, diagnosticMessage, arg0, arg1, arg2);
            this.diagnostics.setSourceFile(this.sourceFile);
        }
        else {
            this.diagnostics.report(pos, diagnosticMessage, arg0, arg1, arg2);
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
        if (nodes && nodes.length) {
            return this.reportGrammarErrorForNode(nodes[0], Diagnostics.Html_trivia_not_allowed_here);
        }
        return false;
    }
}

/** {@docCategory Check} */
export class Resolver {
    private bindings: BindingTable;
    private lineOffsetMap: LineOffsetMap | undefined;

    constructor(bindings: BindingTable, lineOffsetMap?: LineOffsetMap) {
        this.bindings = bindings;
        this.lineOffsetMap = lineOffsetMap;
    }

    /**
     * Gets the effective filename of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectiveFilenameAtPosition(sourceFile: SourceFile, position: Position) {
        return this.lineOffsetMap?.getEffectiveFilenameAtPosition(sourceFile, position) ?? sourceFile.filename;
    }

    /**
     * Gets the effective position of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectivePosition(sourceFile: SourceFile, position: Position) {
        return this.lineOffsetMap?.getEffectivePosition(sourceFile, position) ?? position;
    }

    /**
     * Gets the effective range of a raw range within a source file, taking into account `@line` directives.
     */
    public getEffectiveRange(sourceFile: SourceFile, range: Range) {
        return this.lineOffsetMap?.getEffectiveRange(sourceFile, range) ?? range;
    }

    public getParent(node: Node): Node | undefined {
        return this.bindings.getParent(node);
    }

    public createNavigator(node: Node): NodeNavigator | undefined {
        if (node.kind === SyntaxKind.SourceFile) {
            return new NodeNavigator(<SourceFile>node);
        }
        else {
            const parent = this.bindings.getParent(node);
            if (parent) {
                const navigator = this.createNavigator(parent);
                if (navigator && navigator.moveToFirstChild(child => child === node)) {
                    return navigator;
                }
            }
        }

        return undefined;
    }

    public getSourceFileOfNode(node: Node) {
        return <SourceFile>this.bindings.getAncestor(node, SyntaxKind.SourceFile);
    }

    public getDeclarations(node: Identifier) {
        const parent = this.bindings.getParent(node);

        let symbol = this.bindings.getSymbol(node);
        if (!symbol && node.text) {
            symbol = this.bindings.resolveSymbol(node, node.text, getSymbolMeaning(parent));
        }

        if (symbol) {
            return this.bindings.getDeclarations(symbol);
        }

        return [];
    }

    public getReferences(node: Identifier) {
        const parent = this.bindings.getParent(node);
        if (parent) {
            const symbol = parent.kind === SyntaxKind.Parameter
                ? this.bindings.resolveSymbol(node, node.text, SymbolKind.Parameter)
                : this.bindings.resolveSymbol(node, node.text, SymbolKind.Production);

            if (symbol) {
                return this.bindings.getReferences(symbol);
            }
        }

        return [];
    }

    public getProductionLinkId(node: Identifier): string | undefined {
        const symbol = this.bindings.resolveSymbol(node, node.text, SymbolKind.Production);
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
        this.writeNode(node.constraints);
        this.writeNode(node.head);

        const hash = createHash("sha1");
        hash.update(this.writer.toString(), "utf8");

        const digest = hash.digest("hex");
        return digest.substr(0, 8);
    }

    private writeNode(node: Node | undefined) {
        if (!node) {
            return;
        }

        switch (node.kind) {
            case SyntaxKind.Constraints: this.writeConstraints(<Constraints>node); break;
            case SyntaxKind.Terminal: this.writeTerminal(<Terminal>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.writeUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
            case SyntaxKind.Prose: this.writeProse(<Prose>node); break;
            case SyntaxKind.Nonterminal: this.writeNonterminal(<Nonterminal>node); break;
            case SyntaxKind.EmptyAssertion: this.writeEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.writeLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: this.writeLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.writeNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
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
            case SyntaxKind.ArgumentList: this.writeArgumentList(<ArgumentList>node); break;
            case SyntaxKind.Argument: this.writeArgument(<Argument>node); break;
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

    private writeConstraints(node: Constraints) {
        this.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.write(", ");
                }

                this.writeNode(node.elements[i]);
            }
        }

        this.write("]");
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

    private writeArgumentList(node: ArgumentList) {
        this.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.write(", ");
                }

                this.writeNode(node.elements[i]);
            }
        }

        this.write("]");
    }

    private writeArgument(node: Argument) {
        this.writeNode(node.operatorToken);
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
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.write(" or ");
                }

                this.writeNode(node.symbols[i]);
                this.spaceRequested = false;
            }
        }

        this.write(" here]");
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