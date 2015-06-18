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
        let saveWriter = this.writer;
        try {
            this.writer = this.createWriter();
            this.emitNode(node);
            
            let file = this.getOutputFilename(node);
            let text = this.writer.toString();
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
        let parsed: path.ParsedPath;
        let extension = this.extension || ".out";
        if (this.options.out) {
            parsed = path.parse(this.options.out);
            if (!parsed.ext) {
                parsed.ext = extension;
            }
        }
        else {
            parsed = path.parse(node.filename);
            parsed.ext = extension;
        }
        
        return path.format(parsed);
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
            case SyntaxKind.Terminal: this.emitTerminal(<Terminal>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.emitUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
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
            case SyntaxKind.ButNotOperator: this.emitButNotOperator(<ButNotOperator>node); break;
            case SyntaxKind.BinarySymbol: this.emitBinarySymbol(<BinarySymbol>node); break;
            case SyntaxKind.OneOfSymbol: this.emitOneOfSymbol(<OneOfSymbol>node); break;
            case SyntaxKind.Nonterminal: this.emitNonterminal(<Nonterminal>node); break;
            case SyntaxKind.TerminalList: this.emitTerminalList(<TerminalList>node); break;
            case SyntaxKind.SymbolSet: this.emitSymbolSet(<SymbolSet>node); break;
            case SyntaxKind.EmptyAssertion: this.emitEmptyAssertion(<EmptyAssertion>node); break;
            case SyntaxKind.LookaheadAssertion: this.emitLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.emitLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.emitNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
            case SyntaxKind.ParameterValueAssertion: this.emitParameterValueAssertion(<ParameterValueAssertion>node); break;
        }
    }
    
    protected emitSourceFile(node: SourceFile) {
        for (let element of node.elements) {
            this.emitNode(element);
        }
    }
    
    protected emitToken(node: Node) {
        if (node) {
            this.writer.write(tokenToString(node.kind));
        }
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
        this.emitTextContent(node);
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
    
    protected emitButNotOperator(node: ButNotOperator): void {
        forEachChild(node, child => this.emitNode(child));
    }
    
    protected emitBinarySymbol(node: BinarySymbol): void {
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