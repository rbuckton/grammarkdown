import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import { DiagnosticMessages } from "../diagnostics";
import { Checker } from "../checker";
import { SymbolKind } from "../symbols";
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
    TextContent
} from "../nodes";

export class MarkdownEmitter extends Emitter {
    protected extension = ".md";

    protected emitKeyword(node: Node) {
        if (node) {
            this.writer.write("**");
            super.emitKeyword(node);
            this.writer.write("**");
        }
    }

    protected emitProduction(node: Production) {
        let linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write("&emsp;&emsp;");
        this.emitLinkAnchor(linkId);
        this.writer.write("*");
        this.emitIdentifier(node.name);
        this.writer.write("*");
        this.emitNode(node.parameterList);
        this.writer.write(" **");
        this.emitToken(node.colonToken);
        this.writer.write("**");
        if (node.body && node.body.kind !== SyntaxKind.RightHandSideList) {
            this.writer.write(" ");
        }

        this.emitNode(node.body);
        this.writer.writeln();
        this.writer.write("  ");
        this.writer.writeln();
    }

    protected emitParameterList(node: ParameterList) {
        this.writer.write("<sub>[");
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }

            this.emitNode(node.elements[i]);
        }

        this.writer.write("]</sub>");
    }

    protected emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }

    protected emitOneOfList(node: OneOfList) {
        this.writer.write("**one of**");
        let terminals = node.terminals;
        if (terminals && terminals.length > 0) {
            if (node.openIndentToken) {
                // get the maximum size for a terminal
                let width = 5;
                for (let terminal of terminals) {
                    if (terminal.text.length > width) {
                        width = terminal.text.length;
                    }
                }

                this.writer.write("  ");
                this.writer.writeln();
                this.writer.write("<pre>");
                let columns = Math.floor(50 / width);
                let pad = 0;
                for (let i = 0; i < terminals.length; ++i) {
                    let terminal = terminals[i];
                    if (i % columns === 0) {
                        if (i > 0) {
                            this.writer.write("  ");
                            this.writer.writeln();
                        }

                        this.writer.write("&emsp;&emsp;&emsp;");
                    }
                    else {
                        for (let j = 0; j <= pad; ++j) {
                            this.writer.write(" ");
                        }
                    }

                    this.writer.write("<code>");
                    this.writer.write(this.encode(terminal.text));
                    this.writer.write("</code>");
                    pad = width - terminal.text.length;
                }

                this.writer.write("</pre>");
            }
            else {
                this.writer.write(" ");
                for (let i = 0; i < node.terminals.length; ++i) {
                    if (i > 0) {
                        this.writer.write("&emsp;");
                    }

                    this.emitNode(node.terminals[i]);
                }

                this.writer.write("  ");
            }
        }
    }

    protected emitRightHandSideList(node: RightHandSideList) {
        this.writer.write("  ");
        for (let rhs of node.elements) {
            this.writer.writeln();
            this.writer.write("&emsp;&emsp;&emsp;");
            this.emitNode(rhs);
        }
    }

    protected emitRightHandSide(node: RightHandSide) {
        let linkId = this.resolver.getRightHandSideLinkId(node, /*includePrefix*/ true);
        this.emitLinkAnchor(linkId);
        super.emitRightHandSide(node);
        this.writer.write("  ");
    }

    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.write("&emsp;");
            this.emitNode(node.next);
        }
    }

    protected emitTerminal(node: Terminal) {
        this.writer.write("`` ");
        this.writer.write(node.text);
        this.writer.write(" ``");

        if (node.questionToken) {
            this.writer.write("<sub>opt</sub>");
        }
    }

    protected emitNonterminal(node: Nonterminal) {
        let linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write("*");
        this.emitNodeWithLink(node.name, linkId);
        this.writer.write("*");
        this.emitNode(node.argumentList);
        if (node.questionToken) {
            this.writer.write("<sub>opt</sub>");
        }
    }

    protected emitArgumentList(node: ArgumentList) {
        this.writer.write("<sub>[");
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }

            this.emitNode(node.elements[i]);
        }

        this.writer.write("]</sub>");
    }

    protected emitArgument(node: Argument) {
        this.emitToken(node.questionToken);
        this.emitNode(node.name);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.writer.write(this.encode(node.text));
        if (node.questionToken) {
            this.writer.write("<sub>opt</sub>");
        }
    }

    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write("[empty]");
    }

    protected emitSymbolSet(node: SymbolSet) {
        this.writer.write("{");
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(",");
            }

            this.writer.write(" ");
            this.emitNode(node.elements[i]);
        }

        this.writer.write(" }");
    }

    protected emitLookaheadAssertion(node: LookaheadAssertion) {
        switch (node.operatorToken.kind) {
            case SyntaxKind.ExclamationEqualsToken:
                this.writer.write("[lookahead ≠ ");
                break;

            case SyntaxKind.EqualsEqualsToken:
                this.writer.write("[lookahead = ");
                break;

            case SyntaxKind.LessThanMinusToken:
                this.writer.write("[lookahead ∈ ");
                break;

            case SyntaxKind.LessThanExclamationToken:
                this.writer.write("[lookahead ∉ ");
                break;
        }

        this.emitNode(node.lookahead);
        this.writer.write("]");
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        let linkId = this.resolver.getProductionLinkId(node.symbol);
        this.writer.write("[lexical goal ");
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write("]");
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write("[no ");
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(" or ");
                }

                this.emitNode(node.symbols[i]);
            }
        }

        this.writer.write(" here]");
    }

    protected emitParameterValueAssertion(node: ParameterValueAssertion): void {
        this.writer.write("[");
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
        this.writer.write("]");
    }

    protected emitBinarySymbol(node: BinarySymbol) {
        this.emitNode(node.left);
        this.writer.write(" ");
        this.emitNode(node.operatorToken);
        this.writer.write(" ");
        this.emitNode(node.right);
    }

    protected emitButNotOperator(node: ButNotOperator) {
        this.writer.write("**but not**");
    }

    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write("**one of** ");
        for (let i = 0; i < node.symbols.length; ++i) {
            if (i > 0) {
                this.writer.write(" **or** ");
            }

            this.emitNode(node.symbols[i]);
        }
    }

    protected emitTextContent(node: TextContent) {
        let text = node.text;
        this.writer.write(text);
    }

    private emitLinkAnchor(linkId: string) {
        if (linkId) {
            this.writer.write(`<a name="${linkId}"></a>`);
        }
    }

    private emitNodeWithLink(node: Node, linkId: string) {
        if (linkId) {
            this.writer.write("[");
            this.emitNode(node);
            this.writer.write(`](#${linkId})`);
        }
        else {
            this.emitNode(node);
        }
    }
}