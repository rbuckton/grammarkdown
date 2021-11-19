/*!
* Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
*
* This file is licensed to you under the terms of the MIT License, found in the LICENSE file
* in the root of this repository or package.
*/

import * as path from "path";
import * as performance from "../performance";
import { Cancelable } from "@esfx/cancelable";
import { CancelToken } from "@esfx/async-canceltoken";
import { DiagnosticMessages } from "../diagnostics";
import { CompilerOptions, NewLineKind } from "../options";
import { Resolver } from "../checker";
import { StringWriter } from "../stringwriter";
import { SyntaxKind, tokenToString, isTokenKind } from "../tokens";
import { toCancelToken } from "../core";
import { TextRange } from "../types";
import {
    Argument,
    ArgumentList,
    ButNotSymbol,
    Constraints,
    Define,
    EmptyAssertion,
    HtmlCloseTagTrivia,
    HtmlOpenTagTrivia,
    Identifier,
    Import,
    LexicalGoalAssertion,
    Line,
    LinkReference,
    LookaheadAssertion,
    MultiLineCommentTrivia,
    Node,
    Nonterminal,
    NoSymbolHereAssertion,
    NumberLiteral,
    OneOfList,
    OneOfSymbol,
    Parameter,
    ParameterList,
    PlaceholderSymbol,
    Production,
    Prose,
    ProseAssertion,
    ProseFragmentLiteral,
    RightHandSide,
    RightHandSideList,
    SingleLineCommentTrivia,
    SourceFile,
    StringLiteral,
    SymbolSet,
    SymbolSpan,
    Terminal,
    TerminalLiteral,
    TextContent,
    Trivia,
    UnicodeCharacterLiteral,
    UnicodeCharacterRange,
} from "../nodes";

/** {@docCategory Emit} */
export class Emitter {
    protected options: CompilerOptions;
    protected resolver!: Resolver;
    protected writer!: StringWriter;
    protected extension!: string;

    private _diagnostics!: DiagnosticMessages;
    private _sourceFile!: SourceFile;
    private _triviaPos!: number;
    private _cancelToken?: CancelToken;

    constructor(options: CompilerOptions) {
        this.options = options;
    }

    protected get sourceFile(): SourceFile | undefined {
        return this._sourceFile;
    }

    public emit(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelable?: Cancelable): Promise<void> {
        const cancelToken = toCancelToken(cancelable);
        const file = this.getOutputFilename(node);
        const text = this.emitString(node, resolver, diagnostics, cancelToken);
        return Promise.resolve(writeFile(file, text, cancelToken));
    }

    public emitString(sourceFile: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, cancelable?: Cancelable, node: Node = sourceFile): string {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();

        performance.mark("beforeEmit");

        const saveWriter = this.writer;
        const saveResolver = this.resolver;
        const saveDiagnostics = this._diagnostics;
        const saveSourceFile = this._sourceFile;
        const saveTriviaPos = this._triviaPos;
        const saveCancellationToken = this._cancelToken;

        let text: string;
        try {
            this._cancelToken = cancelToken;
            this.resolver = resolver;
            this._diagnostics = new DiagnosticMessages();
            this.writer = this.createWriter(this.options);
            this._sourceFile = sourceFile;
            this._triviaPos = 0;
            this.emitNode(node);
            text = this.writer.toString();
            diagnostics.copyFrom(this._diagnostics);
        }
        finally {
            this.writer = saveWriter;
            this.resolver = saveResolver;
            this._diagnostics = saveDiagnostics;
            this._sourceFile = saveSourceFile;
            this._triviaPos = saveTriviaPos;
            this._cancelToken = saveCancellationToken;
        }

        performance.mark("afterEmit");
        performance.measure("emit", "beforeEmit", "afterEmit");

        return text;
    }

    protected getOutputFilename(node: SourceFile): string {
        const extension = this.extension || ".out";
        if (this.options.out) {
            return this.options.out;
        }
        else {
            const dirname = path.dirname(node.filename);
            const basename = path.basename(node.filename, ".grammar");
            return path.join(dirname, basename + extension);
        }
    }

    protected createWriter(options: CompilerOptions): StringWriter {
        return new StringWriter(
            options.newLine === NewLineKind.LineFeed ? "\n" :
            options.newLine === NewLineKind.CarriageReturnLineFeed ? "\r\n" :
            undefined);
    }

    protected beforeEmitNode(node: Node): void {
        this.emitDetachedTriviaOfNode(node);
        this.emitLeadingTriviaOfNode(node);
    }

    protected afterEmitNode(node: Node): void {
        this.emitTrailingTriviaOfNode(node);
    }

    protected emitNode(node: Node | undefined): void {
        if (!node) {
            return;
        }

        this.beforeEmitNode(node);
        this.emitNodeCore(node);
        this.afterEmitNode(node);
    }

    protected emitNodeCore(node: Node): void {
        switch (node.kind) {
            case SyntaxKind.SourceFile: this.emitSourceFile(<SourceFile>node); break;
            case SyntaxKind.TerminalLiteral: this.emitTerminalLiteral(<TerminalLiteral>node); break;
            case SyntaxKind.StringLiteral: this.emitStringLiteral(<StringLiteral>node); break;
            case SyntaxKind.NumberLiteral: this.emitNumberLiteral(<NumberLiteral>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.emitUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
            case SyntaxKind.UnicodeCharacterRange: this.emitUnicodeCharacterRange(<UnicodeCharacterRange>node); break;
            case SyntaxKind.Prose: this.emitProse(<Prose>node); break;
            case SyntaxKind.Identifier: this.emitIdentifier(<Identifier>node); break;
            case SyntaxKind.Parameter: this.emitParameter(<Parameter>node); break;
            case SyntaxKind.ParameterList: this.emitParameterList(<ParameterList>node); break;
            case SyntaxKind.Argument: this.emitArgument(<Argument>node); break;
            case SyntaxKind.ArgumentList: this.emitArgumentList(<ArgumentList>node); break;
            case SyntaxKind.Production: this.emitProduction(<Production>node); break;
            case SyntaxKind.Import: this.emitImport(<Import>node); break;
            case SyntaxKind.Define: this.emitDefine(<Define>node); break;
            case SyntaxKind.Line: this.emitLine(<Line>node); break;
            case SyntaxKind.OneOfList: this.emitOneOfList(<OneOfList>node); break;
            case SyntaxKind.RightHandSideList: this.emitRightHandSideList(<RightHandSideList>node); break;
            case SyntaxKind.RightHandSide: this.emitRightHandSide(<RightHandSide>node); break;
            case SyntaxKind.LinkReference: this.emitLinkReference(<LinkReference>node); break;
            case SyntaxKind.Constraints: this.emitConstraints(<Constraints>node); break;
            case SyntaxKind.SymbolSpan: this.emitSymbolSpan(<SymbolSpan>node); break;
            case SyntaxKind.ThroughKeyword: this.emitKeyword(node); break;
            case SyntaxKind.ButNotSymbol: this.emitButNotSymbol(<ButNotSymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.emitOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.Nonterminal: this.emitNonterminal(<Nonterminal>node); break;
            case SyntaxKind.Terminal: this.emitTerminal(<Terminal>node); break;
            case SyntaxKind.SymbolSet: this.emitSymbolSet(<SymbolSet>node); break;
            case SyntaxKind.PlaceholderSymbol: this.emitPlaceholder(<PlaceholderSymbol>node); break;
            case SyntaxKind.EmptyAssertion: this.emitEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: this.emitLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.emitLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.emitNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
            case SyntaxKind.ProseAssertion: this.emitProseAssertion(<ProseAssertion>node); break;
            case SyntaxKind.ProseFull: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseHead: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseMiddle: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseTail: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.HtmlOpenTagTrivia:
            case SyntaxKind.HtmlCloseTagTrivia:
            case SyntaxKind.SingleLineCommentTrivia:
            case SyntaxKind.MultiLineCommentTrivia:
                return this.emitTrivia(<Trivia>node);
            default:
                if (isTokenKind(node.kind)) {
                    this.emitToken(node);
                }
                break;
        }
    }

    protected emitChildren(node: Node) {
        this.emitNodes(node.children());
    }

    protected emitNodes(nodes: Iterable<Node>) {
        for (const node of nodes) {
            this.emitNode(node);
        }
    }

    protected emitSourceFile(node: SourceFile) {
        this.emitChildren(node);
    }

    protected emitKeyword(node: Node) {
        this.emitToken(node);
    }

    protected emitToken(node: Node | undefined) {
        if (node) {
            this.emitTokenKind(node.kind);
        }
    }

    protected emitTokenKind(kind: SyntaxKind) {
        this.writer.write(tokenToString(kind));
    }

    protected emitStringLiteral(node: StringLiteral) {
    }

    protected emitNumberLiteral(node: NumberLiteral) {
    }

    protected emitPlaceholder(node: PlaceholderSymbol) {
        this.emitToken(node.placeholderToken);
    }

    protected emitTerminalLiteral(node: TerminalLiteral) {
        this.emitTextContent(node);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.emitTextContent(node);
    }

    protected emitTextContent(node: TextContent) {
        this.writer.write(node.text);
    }

    protected emitProse(node: Prose) {
        this.emitChildren(node);
    }

    protected emitIdentifier(node: Identifier) {
        this.emitTextContent(node);
    }

    protected emitParameter(node: Parameter): void {
        this.emitChildren(node);
    }

    protected emitParameterList(node: ParameterList): void {
        this.emitChildren(node);
    }

    protected emitArgument(node: Argument): void {
        this.emitChildren(node);
    }

    protected emitArgumentList(node: ArgumentList): void {
        this.emitChildren(node);
    }

    protected emitProduction(node: Production): void {
        this.emitChildren(node);
    }

    protected emitImport(node: Import): void {
    }

    protected emitDefine(node: Define): void {
    }

    protected emitLine(node: Line): void {
    }

    protected emitOneOfList(node: OneOfList): void {
        this.emitChildren(node);
    }

    protected emitRightHandSideList(node: RightHandSideList): void {
        this.emitChildren(node);
    }

    protected emitRightHandSide(node: RightHandSide): void {
        this.emitChildren(node);
    }

    protected emitLinkReference(node: LinkReference): void {
    }

    protected emitSymbolSpan(node: SymbolSpan): void {
        this.emitChildren(node);
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange): void {
        this.emitChildren(node);
    }

    protected emitButNotSymbol(node: ButNotSymbol): void {
        this.emitChildren(node);
    }

    protected emitOneOfSymbol(node: OneOfSymbol): void {
        this.emitChildren(node);
    }

    protected emitNonterminal(node: Nonterminal): void {
        this.emitChildren(node);
    }

    protected emitTerminal(node: Terminal) {
        this.emitNode(node.literal);
        this.emitNode(node.questionToken);
    }

    protected emitSymbolSet(node: SymbolSet): void {
        this.emitChildren(node);
    }

    protected emitEmptyAssertion(node: EmptyAssertion): void {
    }

    protected emitLookaheadAssertion(node: LookaheadAssertion): void {
        this.emitChildren(node);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.emitChildren(node);
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.emitChildren(node);
    }

    protected emitConstraints(node: Constraints): void {
        this.emitChildren(node);
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        this.emitChildren(node);
    }

    protected emitProseFragmentLiteral(node: ProseFragmentLiteral): void {
        this.emitTextContent(node);
    }

    protected encode(text: string) {
        return text.replace(/&(?!(?:#(?:[xX][a-fA-F\d]+|\d+)|[a-zA-Z\d]+);)|[<>'"]/g, ch => {
            switch (ch) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case "'": return "&apos;";
                case '"': return "&quot;";
                default: return ch;
            }
        });
    }

    protected emitDetachedTriviaOfNode(node: Node) {
        this.emitTriviaNodes(node.detachedTrivia);
    }

    protected emitLeadingTriviaOfNode(node: Node) {
        this.emitTriviaNodes(node.leadingTrivia);
    }

    protected emitTrailingTriviaOfNode(node: Node) {
        this.emitTriviaNodes(node.trailingTrivia);
    }

    protected emitTriviaNodes(nodes: readonly Trivia[] | undefined) {
        if (nodes) {
            for (const node of nodes) {
                this.emitTrivia(node);
            }
        }
    }

    protected emitTrivia(node: Trivia) {
        this.beforeEmitTrivia(node);
        this.emitTriviaCore(node);
        this.afterEmitTrivia(node);
    }

    protected beforeEmitTrivia(node: Trivia) { }

    protected afterEmitTrivia(node: Trivia) { }

    protected emitTriviaCore(node: Trivia) {
        switch (node.kind) {
            case SyntaxKind.HtmlOpenTagTrivia: this.emitHtmlOpenTagTrivia(<HtmlOpenTagTrivia>node); break;
            case SyntaxKind.HtmlCloseTagTrivia: this.emitHtmlCloseTagTrivia(<HtmlCloseTagTrivia>node); break;
            case SyntaxKind.SingleLineCommentTrivia: this.emitSingleLineCommentTrivia(<SingleLineCommentTrivia>node); break;
            case SyntaxKind.MultiLineCommentTrivia: this.emitMultiLineCommentTrivia(<MultiLineCommentTrivia>node); break;
        }
    }

    protected emitHtmlOpenTagTrivia(node: HtmlOpenTagTrivia) {
        this.emitTextRange(node);
    }

    protected emitHtmlCloseTagTrivia(node: HtmlCloseTagTrivia) {
        this.emitTextRange(node);
    }

    protected emitSingleLineCommentTrivia(node: SingleLineCommentTrivia) {
    }

    protected emitMultiLineCommentTrivia(node: MultiLineCommentTrivia) {
    }

    protected emitTextRange(range: TextRange) {
        this.writer.write(this._sourceFile.text.substring(range.pos, range.end));
    }
}