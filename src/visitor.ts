import { SyntaxKind, TokenKind } from "./tokens";
import {
    Node,
    Token,
    StringLiteral,
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
    InvalidAssertion,
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
    PlaceholderSymbol,
    InvalidSymbol,
    ButNotSymbol,
    UnicodeCharacterRange,
    SymbolSpan,
    LinkReference,
    RightHandSide,
    RightHandSideList,
    Production,
    Import,
    Define,
    MetaElement,
    SourceElement
} from "./nodes";

export abstract class NodeVisitor {
    public visit<T extends Node>(node: T): T;
    public visit<T extends Node>(node: T | undefined): T | undefined;
    public visit<T extends Node>(node: T | undefined): T | undefined {
        return node && node.accept(this) as T | undefined;
    }

    public visitEach<T extends Node>(nodes: ReadonlyArray<T>): ReadonlyArray<T>;
    public visitEach<T extends Node>(nodes: ReadonlyArray<T> | undefined): ReadonlyArray<T> | undefined;
    public visitEach<T extends Node>(nodes: ReadonlyArray<T> | undefined): ReadonlyArray<T> | undefined {
        let result: T[] | undefined;
        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                if (result) {
                    result.push(this.visit(nodes[i]));
                }
                else {
                    const node = nodes[i];
                    const visited = this.visit(node);
                    if (visited !== node) {
                        result = nodes.slice(0, i);
                        result[i] = visited;
                    }
                }
            }
        }

        return result || nodes;
    }

    public visitExtension<T extends Node>(node: T): T {
        return node;
    }

    public visitToken<TKind extends TokenKind>(node: Token<TKind>): Token<TKind> {
        return node;
    }

    public visitStringLiteral(node: StringLiteral): StringLiteral {
        return node;
    }

    public visitIdentifier(node: Identifier): Identifier {
        return node;
    }

    public visitInvalidSymbol(node: InvalidSymbol): InvalidSymbol {
        return node;
    }

    public visitPlaceholderSymbol(node: PlaceholderSymbol): PlaceholderSymbol {
        return node;
    }

    public visitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral): UnicodeCharacterLiteral {
        return node;
    }

    public visitUnicodeCharacterRange(node: UnicodeCharacterRange): UnicodeCharacterRange {
        return node.update(this.visit(node.left), this.visit(node.right));
    }

    public visitButNotSymbol(node: ButNotSymbol): ButNotSymbol {
        return node.update(this.visit(node.left), this.visit(node.right));
    }

    public visitTerminal(node: Terminal): Terminal {
        return node;
    }

    public visitSymbolSet(node: SymbolSet): SymbolSet {
        return node.update(this.visitEach(node.elements));
    }

    public visitInvalidAssertion(node: InvalidAssertion): InvalidAssertion {
        return node;
    }

    public visitEmptyAssertion(node: EmptyAssertion): EmptyAssertion {
        return node;
    }

    public visitLookaheadAssertion(node: LookaheadAssertion): LookaheadAssertion {
        return node.update(this.visit(node.lookahead));
    }

    public visitLexicalGoalAssertion(node: LexicalGoalAssertion): LexicalGoalAssertion {
        return node.update(this.visit(node.symbol));
    }

    public visitNoSymbolHereAssertion(node: NoSymbolHereAssertion): NoSymbolHereAssertion {
        return node.update(this.visitEach(node.symbols));
    }

    public visitParameterValueAssertion(node: ParameterValueAssertion): ParameterValueAssertion {
        return node.update(this.visitEach(node.elements));
    }

    public visitProseAssertion(node: ProseAssertion): ProseAssertion {
        return node.update(this.visitEach(node.fragments));
    }

    public visitProseFragmentLiteral(node: ProseFragmentLiteral): ProseFragmentLiteral {
        return node;
    }

    public visitArgument(node: Argument): Argument {
        return node.update(this.visit(node.name));
    }

    public visitArgumentList(node: ArgumentList): ArgumentList {
        return node.update(this.visitEach(node.elements));
    }

    public visitNonterminal(node: Nonterminal): Nonterminal {
        return node.update(this.visit(node.name), this.visit(node.argumentList));
    }

    public visitProse(node: Prose): Prose {
        return node.update(this.visitEach(node.fragments));
    }

    public visitOneOfSymbol(node: OneOfSymbol): OneOfSymbol {
        return node.update(this.visitEach(node.symbols));
    }

    public visitSymbolSpan(node: SymbolSpan): SymbolSpan {
        return node.update(this.visit(node.symbol), this.visit(node.next));
    }

    public visitLinkReference(node: LinkReference): LinkReference {
        return node;
    }

    public visitRightHandSide(node: RightHandSide): RightHandSide {
        return node.update(this.visit(node.head), this.visit(node.reference));
    }

    public visitRightHandSideList(node: RightHandSideList): RightHandSideList {
        return node.update(this.visitEach(node.elements));
    }

    public visitOneOfList(node: OneOfList): OneOfList {
        return node.update(this.visitEach(node.terminals));
    }

    public visitParameter(node: Parameter): Parameter {
        return node.update(this.visit(node.name));
    }

    public visitParameterList(node: ParameterList): ParameterList {
        return node.update(this.visitEach(node.elements));
    }

    public visitProduction(node: Production): Production {
        return node.update(this.visit(node.name), this.visit(node.parameterList), this.visit(node.body));
    }

    public visitImport(node: Import): Import {
        return node;
    }

    public visitDefine(node: Define): Define {
        return node;
    }

    public visitSourceFile(node: SourceFile): SourceFile {
        return node.update(this.visitEach(node.elements));
    }
}