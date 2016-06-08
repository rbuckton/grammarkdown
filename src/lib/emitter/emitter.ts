import * as fs from "fs";
import * as path from "path";
import { DiagnosticMessages } from "../diagnostics";
import { CompilerOptions } from "../options";
import { Checker, Resolver } from "../checker";
import { StringWriter } from "../stringwriter";
import { SyntaxKind, tokenToString } from "../tokens";
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
    TerminalList,
    SymbolSet,
    Assertion,
    EmptyAssertion,
    LookaheadAssertion,
    NoSymbolHereAssertion,
    LexicalGoalAssertion,
    ParameterValueAssertion,
    ProseAssertion,
    ProseFragmentLiteral,
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    LexicalSymbol,
    ButNotSymbol,
    SymbolSpan,
    RightHandSide,
    RightHandSideList,
    Production,
    Import,
    SourceElement,
    TextContent,
    forEachChild
} from "../nodes";

export class Emitter {
    protected options: CompilerOptions;
    protected resolver: Resolver;
    protected writer: StringWriter;
    protected extension: string;

    private diagnostics: DiagnosticMessages;

    constructor(options: CompilerOptions, resolver: Resolver, diagnostics: DiagnosticMessages) {
        this.options = options;
        this.resolver = resolver;
        this.diagnostics = diagnostics;
    }

    public emit(node: SourceFile, writeFile?: (file: string, text: string) => void): void {
        const saveWriter = this.writer;
        try {
            this.writer = this.createWriter();
            this.emitNode(node);

            const file = this.getOutputFilename(node);
            const text = this.writer.toString();
            this.writeFile(file, text, writeFile);
        }
        finally {
            this.writer = saveWriter;
        }
    }

    protected writeFile(file: string, text: string, callback?: (file: string, text: string) => void): void {
        if (callback) {
            callback(file, text);
        }
        else {
            writeOutputFile(file, text);
        }
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

    protected createWriter(): StringWriter {
        return new StringWriter();
    }

    protected emitNode(node: Node): void {
        if (!node) {
            return;
        }

        switch (node.kind) {
            case SyntaxKind.SourceFile: this.emitSourceFile(<SourceFile>node); break;
            case SyntaxKind.AtToken: this.emitPlaceholder(<LexicalSymbol>node); break;
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
            case SyntaxKind.SymbolSpan: this.emitSymbolSpan(<SymbolSpan>node); break;
            case SyntaxKind.ThroughKeyword: this.emitKeyword(node); break;
            case SyntaxKind.ButNotSymbol: this.emitButNotSymbol(<ButNotSymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.emitOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.Nonterminal: this.emitNonterminal(<Nonterminal>node); break;
            case SyntaxKind.TerminalList: this.emitTerminalList(<TerminalList>node); break;
            case SyntaxKind.SymbolSet: this.emitSymbolSet(<SymbolSet>node); break;
            case SyntaxKind.EmptyAssertion: this.emitEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: this.emitLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.emitLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.emitNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
            case SyntaxKind.ParameterValueAssertion: this.emitParameterValueAssertion(<ParameterValueAssertion>node); break;
            case SyntaxKind.ProseAssertion: this.emitProseAssertion(<ProseAssertion>node); break;
            case SyntaxKind.ProseFull: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseHead: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseMiddle: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
            case SyntaxKind.ProseTail: this.emitProseFragmentLiteral(<ProseFragmentLiteral>node); break;
        }
    }

    protected emitSourceFile(node: SourceFile) {
        for (const element of node.elements) {
            this.emitNode(element);
        }
    }

    protected emitKeyword(node: Node) {
        this.emitToken(node);
    }

    protected emitToken(node: Node) {
        if (node) {
            this.writer.write(tokenToString(node.kind));
        }
    }

    protected emitPlaceholder(node: LexicalSymbol) {
        this.emitToken(node);
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
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitIdentifier(node: Identifier) {
        this.emitTextContent(node);
    }

    protected emitParameter(node: Parameter): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitParameterList(node: ParameterList): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitArgument(node: Argument): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitArgumentList(node: ArgumentList): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitProduction(node: Production): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitImport(node: Import): void {
    }

    protected emitOneOfList(node: OneOfList): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitRightHandSideList(node: RightHandSideList): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitRightHandSide(node: RightHandSide): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitSymbolSpan(node: SymbolSpan): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitButNotSymbol(node: ButNotSymbol): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitOneOfSymbol(node: OneOfSymbol): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitNonterminal(node: Nonterminal): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitTerminalList(node: TerminalList): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitSymbolSet(node: SymbolSet): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitEmptyAssertion(node: EmptyAssertion): void {
    }

    protected emitLookaheadAssertion(node: LookaheadAssertion): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitParameterValueAssertion(node: ParameterValueAssertion): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        forEachChild(node, child => this.emitNode(child));
    }

    protected emitProseFragmentLiteral(node: ProseFragmentLiteral): void {
        this.emitTextContent(node);
    }

    protected encode(text: string) {
        return text.replace(/[&<>'"]/g, ch => {
            switch (ch) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case "'": return "&apos;";
                case '"': return "&quot;";
            }
        });
    }
}

function writeOutputFile(file: string, text: string): void {
    fs.writeFileSync(file, text, "utf8");
}