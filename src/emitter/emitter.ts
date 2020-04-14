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

import * as path from "path";
import * as performance from "../performance";
import { CancellationToken } from "prex";
import { Cancelable } from "@esfx/cancelable";
import { CancelToken } from "@esfx/async-canceltoken";
import { DiagnosticMessages } from "../diagnostics";
import { CompilerOptions, NewLineKind } from "../options";
import { Resolver } from "../checker";
import { StringWriter } from "../stringwriter";
import { SyntaxKind, tokenToString } from "../tokens";
import { TextRange, toCancelToken, wrapCancelToken } from "../core";
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
    EmptyAssertion,
    LookaheadAssertion,
    NoSymbolHereAssertion,
    LexicalGoalAssertion,
    Constraints,
    ProseAssertion,
    ProseFragmentLiteral,
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    ButNotSymbol,
    SymbolSpan,
    RightHandSide,
    RightHandSideList,
    Production,
    Import,
    TextContent,
    PlaceholderSymbol
} from "../nodes";

/** {@docCategory Emit} */
export class Emitter {
    protected options: CompilerOptions;
    protected resolver!: Resolver;
    protected writer!: StringWriter;
    protected extension!: string;

    private diagnostics!: DiagnosticMessages;
    private sourceFile!: SourceFile;
    private triviaPos!: number;
    private cancelToken?: CancelToken;

    constructor(options: CompilerOptions) {
        this.options = options;
    }

    public emit(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emit(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancellationToken & CancelToken) => void | PromiseLike<void>, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public emit(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancellationToken & CancelToken) => void | PromiseLike<void>, cancelable?: CancellationToken | Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        const file = this.getOutputFilename(node);
        const text = this.emitString(node, resolver, diagnostics, cancelToken);
        return Promise.resolve(writeFile(file, text, wrapCancelToken(cancelToken)));
    }

    public emitSync(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancelToken) => void, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emitSync(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancellationToken & CancelToken) => void, cancelable?: CancellationToken | Cancelable): void;
    public emitSync(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, writeFile: (file: string, text: string, cancelToken?: CancellationToken & CancelToken) => void, cancelable?: CancellationToken | Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        const file = this.getOutputFilename(node);
        const text = this.emitString(node, resolver, diagnostics, cancelToken);
        writeFile(file, text, wrapCancelToken(cancelToken));
    }

    public emitString(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, cancelable?: Cancelable): string;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emitString(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, cancelable?: CancellationToken | Cancelable): string;
    public emitString(node: SourceFile, resolver: Resolver, diagnostics: DiagnosticMessages, cancelable?: CancellationToken | Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();

        performance.mark("beforeEmit");

        const saveWriter = this.writer;
        const saveResolver = this.resolver;
        const saveDiagnostics = this.diagnostics;
        const saveSourceFile = this.sourceFile;
        const saveTriviaPos = this.triviaPos;
        const saveCancellationToken = this.cancelToken;

        let text: string;
        try {
            this.cancelToken = cancelToken;
            this.resolver = resolver;
            this.diagnostics = new DiagnosticMessages();
            this.writer = this.createWriter(this.options);
            this.sourceFile = node;
            this.triviaPos = 0;
            this.emitNode(node);
            text = this.writer.toString();
            diagnostics.copyFrom(this.diagnostics);
        }
        finally {
            this.writer = saveWriter;
            this.resolver = saveResolver;
            this.diagnostics = saveDiagnostics;
            this.sourceFile = saveSourceFile;
            this.triviaPos = saveTriviaPos;
            this.cancelToken = saveCancellationToken;
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
        this.emitLeadingHtmlTriviaOfNode(node);
    }

    protected afterEmitNode(node: Node): void {
        this.emitTrailingHtmlTriviaOfNode(node);
    }

    protected emitNode(node: Node | undefined): void {
        if (!node) {
            return;
        }

        this.beforeEmitNode(node);

        switch (node.kind) {
            case SyntaxKind.SourceFile: this.emitSourceFile(<SourceFile>node); break;
            case SyntaxKind.Terminal: this.emitTerminal(<Terminal>node); break;
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
            case SyntaxKind.OneOfList: this.emitOneOfList(<OneOfList>node); break;
            case SyntaxKind.RightHandSideList: this.emitRightHandSideList(<RightHandSideList>node); break;
            case SyntaxKind.RightHandSide: this.emitRightHandSide(<RightHandSide>node); break;
            case SyntaxKind.Constraints: this.emitConstraints(<Constraints>node); break;
            case SyntaxKind.SymbolSpan: this.emitSymbolSpan(<SymbolSpan>node); break;
            case SyntaxKind.ThroughKeyword: this.emitKeyword(node); break;
            case SyntaxKind.ButNotSymbol: this.emitButNotSymbol(<ButNotSymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.emitOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.Nonterminal: this.emitNonterminal(<Nonterminal>node); break;
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
        }

        this.afterEmitNode(node);
    }

    protected emitSourceFile(node: SourceFile) {
        for (const element of node.elements) {
            this.emitNode(element);
        }
    }

    protected emitKeyword(node: Node) {
        this.emitToken(node);
    }

    protected emitToken(node: Node | undefined) {
        if (node) {
            this.writer.write(tokenToString(node.kind));
        }
    }

    protected emitPlaceholder(node: PlaceholderSymbol) {
        this.emitToken(node.placeholderToken);
    }

    protected emitTerminal(node: Terminal) {
        this.emitTextContent(node);
        this.emitNode(node.questionToken);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.emitTextContent(node);
        this.emitNode(node.questionToken);
    }

    protected emitTextContent(node: TextContent) {
        this.writer.write(node.text);
    }

    protected emitProse(node: Prose) {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitIdentifier(node: Identifier) {
        this.emitTextContent(node);
    }

    protected emitParameter(node: Parameter): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitParameterList(node: ParameterList): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitArgument(node: Argument): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitArgumentList(node: ArgumentList): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitProduction(node: Production): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitImport(node: Import): void {
    }

    protected emitOneOfList(node: OneOfList): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitRightHandSideList(node: RightHandSideList): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitRightHandSide(node: RightHandSide): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitSymbolSpan(node: SymbolSpan): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitButNotSymbol(node: ButNotSymbol): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitOneOfSymbol(node: OneOfSymbol): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitNonterminal(node: Nonterminal): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitSymbolSet(node: SymbolSet): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitEmptyAssertion(node: EmptyAssertion): void {
    }

    protected emitLookaheadAssertion(node: LookaheadAssertion): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitConstraints(node: Constraints): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        for (const child of node.children()) {
            this.emitNode(child);
        }
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

    protected emitLeadingHtmlTriviaOfNode(node: Node) {
        const leadingHtmlTrivia = node.leadingHtmlTrivia;
        if (leadingHtmlTrivia) {
            for (const range of leadingHtmlTrivia) {
                this.emitHtmlTrivia(range);
            }
        }
        // const parent = this.resolver.getParent(node);
        // if (parent && parent.pos === node.pos) {
        //     return;
        // }

        // if (this.triviaPos >= node.pos) {
        //     return;
        // }

        // const leadingHtmlTrivia = scanHtmlTrivia(this.sourceFile.text, this.triviaPos, node.pos);
        // if (leadingHtmlTrivia) {
        //     for (const range of leadingHtmlTrivia) {
        //         this.emitHtmlTrivia(range);
        //     }
        // }

        // this.triviaPos = node.pos;
    }

    protected emitTrailingHtmlTriviaOfNode(node: Node) {
        const trailingHtmlTrivia = node.trailingHtmlTrivia;
        if (trailingHtmlTrivia) {
            for (const range of trailingHtmlTrivia) {
                this.emitHtmlTrivia(range);
            }
        }
        // const parent = this.resolver.getParent(node);
        // if (parent && parent.end === node.end) {
        //     return;
        // }

        // if (this.triviaPos >= node.end) {
        //     return;
        // }

        // const trailingHtmlTrivia = scanHtmlTrivia(this.sourceFile.text, node.end, this.sourceFile.text.length);

        // this.triviaPos = node.end;
        // if (trailingHtmlTrivia) {
        //     for (const range of trailingHtmlTrivia) {
        //         this.emitHtmlTrivia(range);
        //         this.triviaPos = range.end;
        //     }
        // }
    }

    protected emitHtmlTrivia(range: TextRange) {
        this.writer.write(this.sourceFile.text.substring(range.pos, range.end));
    }
}