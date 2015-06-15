import { DiagnosticMessages } from "../diagnostics";
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
    SourceElement,
    TextContent,
	forEachChild
} from "../nodes";

export class EmitterBase {
    private innerResolver: Resolver;
    private diagnostics: DiagnosticMessages;
    private innerWriter: StringWriter;
    
    constructor(checker: Checker, diagnostics: DiagnosticMessages, writer: StringWriter) {
        this.innerResolver = checker.getResolver();
        this.diagnostics = diagnostics;
        this.innerWriter = writer;
    }
    
    protected get resolver(): Resolver {
        return this.innerResolver;
    }
    
    protected get writer(): StringWriter {
        return this.innerWriter;
    }
    
	public emitSourceFile(node: SourceFile): void {
        forEachChild(node, child => this.emitNode(child));
	}

    protected emitNode(node: Node): void {
        if (!node) {
            return;
        }
        
        switch (node.kind) {
            case SyntaxKind.Terminal: this.emitTerminal(<Terminal>node); break;
            case SyntaxKind.UnicodeCharacterLiteral: this.emitUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
            case SyntaxKind.Prose: this.emitProse(<Prose>node); break;
            case SyntaxKind.Identifier: this.emitIdentifier(<Identifier>node); break;
            case SyntaxKind.Parameter: this.emitParameter(<Parameter>node); break;
            case SyntaxKind.ParameterList: this.emitParameterList(<ParameterList>node); break;
            case SyntaxKind.Argument: this.emitArgument(<Argument>node); break;
            case SyntaxKind.ArgumentList: this.emitArgumentList(<ArgumentList>node); break;
            case SyntaxKind.Production: this.emitProduction(<Production>node); break;
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