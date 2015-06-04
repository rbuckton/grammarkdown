import { SyntaxKind } from "./core";
import { 
    Node,
    SourceFile,
    Constant,
    Literal,
    UnicodeCharacterLiteral,
    Prose,
    Identifier,
    Parameter,
    ParameterList,
    OneOfList,
    Terminal,
    TerminalList,
    TerminalSet,
    Assertion,
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
	forEachChild
} from "./nodes";

export class EmitterBase {
	public emitSourceFile(node: SourceFile): void {
        forEachChild(node, child => this.emitNode(child));
	}
    
    protected emitNode(node: Node): void {
        if (!node) {
            return;
        }
        
        switch (node.kind) {
            case SyntaxKind.Terminal: this.emitTerminal(<Terminal>node); break;
            case SyntaxKind.UnicodeCharacter: this.emitUnicodeCharacterLiteral(<UnicodeCharacterLiteral>node); break;
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
            case SyntaxKind.TerminalSet: this.emitTerminalSet(<TerminalSet>node); break;
            case SyntaxKind.LookaheadAssertion: this.emitLookaheadAssertion(<LookaheadAssertion>node); break;
            case SyntaxKind.LexicalGoalAssertion: this.emitLexicalGoalAssertion(<LexicalGoalAssertion>node); break;
            case SyntaxKind.NoSymbolHereAssertion: this.emitNoSymbolHereAssertion(<NoSymbolHereAssertion>node); break;
            case SyntaxKind.ParameterValueAssertion: this.emitParameterValueAssertion(<ParameterValueAssertion>node); break;
        }
    }
    
    protected emitTerminal(node: Terminal) {
        forEachChild(node, child => this.emitNode(child));
    }
    
    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        forEachChild(node, child => this.emitNode(child));
    }
    
    protected emitProse(node: Prose) {
        forEachChild(node, child => this.emitNode(child));
    }
    
    protected emitIdentifier(node: Identifier) {
        forEachChild(node, child => this.emitNode(child));
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
    
    protected emitTerminalSet(node: TerminalSet): void {
        forEachChild(node, child => this.emitNode(child));
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
}

export class PrettyPrinter extends EmitterBase {
    
}

export class MarkdownEmitter extends EmitterBase {
    
}

export class HtmlEmitter extends EmitterBase {
    
}