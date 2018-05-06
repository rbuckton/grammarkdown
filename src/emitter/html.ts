import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import { DiagnosticMessages } from "../diagnostics";
import { Checker } from "../checker";
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
    ParameterValueAssertion,
    ProseAssertion,
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
    SourceElement,
    TextContent
} from "../nodes";

export class HtmlEmitter extends Emitter {
    protected extension = ".html";

    protected emitSourceFile(node: SourceFile) {
        this.writer.write(`<div class="grammar">`);
        this.writer.indent();
        this.writer.writeln();
        super.emitSourceFile(node);
        this.writer.dedent();
        this.writer.writeln();
        this.writer.write(`</div>`);
    }

    protected emitProduction(node: Production) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.emitLinkAnchor(linkId);
        this.writer.write(`<div class="production">`);
        this.writer.indent();
        this.writer.writeln();

        this.writer.write(`<span class="nonterminal">`)
        this.emitIdentifier(node.name);
        this.writer.write(`</span>`);

        this.emitNode(node.parameterList);

        if (node.colonToken) {
            this.writer.write(`<span class="punctuation">`);
            switch (node.colonToken.kind) {
                case SyntaxKind.ColonToken:
                    this.writer.write(` :`);
                    break;

                case SyntaxKind.ColonColonToken:
                    this.writer.write(` ::`);
                    break;

                case SyntaxKind.ColonColonColonToken:
                    this.writer.write(` :::`);
                    break;
            }
            this.writer.write(`</span>`);
        }

        this.writer.writeln();
        this.emitNode(node.body);
        this.writer.dedent();
        this.writer.writeln();
        this.writer.write(`</div>`);
    }

    protected emitParameterList(node: ParameterList) {
        this.writer.write(`<span class="parameter-list">`);
        this.writer.write(`[`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`]`);
        this.writer.write(`</span>`);
    }

    protected emitParameter(node: Parameter) {
        this.writer.write(`<span class="parameter">`);
        this.emitIdentifier(node.name);
        this.writer.write(`</span>`);
    }

    protected emitOneOfList(node: OneOfList) {
        this.writer.write(`<span class="keyword">one</span> <span class="keyword">of</span>`);
        this.writer.writeln();
        this.writer.write(`<div class="one-of-list">`)
        if (node.terminals) {
            for (let i = 0; i < node.terminals.length; ++i) {
                if (i > 0) {
                    this.writer.write(` `);
                }

                this.writer.write(`<span class="terminal">`);
                this.emitTextContent(node.terminals[i]);
                this.writer.write(`</span>`);
            }
        }

        this.writer.write(`</div>`);
    }

    protected emitRightHandSideList(node: RightHandSideList) {
        this.writer.write(`<div class="rhs-list">`);
        this.writer.indent();
        if (node.elements) {
            for (const rhs of node.elements) {
                this.writer.writeln();
                this.writer.write(`<div class="rhs-list-item">`);
                this.writer.indent();
                this.writer.writeln();
                this.emitNode(rhs);
                this.writer.dedent();
                this.writer.writeln();
                this.writer.write(`</div>`);
            }
        }

        this.writer.dedent();
        this.writer.writeln();
        this.writer.write(`</div>`);
    }

    protected emitRightHandSide(node: RightHandSide) {
        const linkId = this.resolver.getRightHandSideLinkId(node, /*includePrefix*/ false);
        this.emitLinkAnchor(linkId);

        this.writer.write(`<span class="rhs">`);
        this.emitNode(node.head);
        this.writer.write(`</span>`);
    }

    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.write(` `);
            this.emitNode(node.next);
        }
    }

    protected emitPlaceholder(node: LexicalSymbol) {
        this.writer.write(`<span class="placeholder">@</span>`);
    }

    protected emitTerminal(node: Terminal) {
        this.writer.write(`<span class="terminal">`);
        this.emitTextContent(node);
        this.writer.write(`</span>`);
        if (node.questionToken) {
            this.writer.write(`<span class="opt">opt</span>`);
        }
    }

    protected emitNonterminal(node: Nonterminal) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write(`<span class="nonterminal">`);
        this.emitNodeWithLink(node.name, linkId);
        this.writer.write(`</span>`);
        this.emitNode(node.argumentList);
        if (node.questionToken) {
            this.writer.write(`<span class="opt">opt</span>`);
        }
    }

    protected emitArgumentList(node: ArgumentList) {
        this.writer.write(`<span class="argument-list">`);
        this.writer.write(`[`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`]`);
        this.writer.write(`</span>`);
    }

    protected emitArgument(node: Argument) {
        this.writer.write(`<span class="argument">`);
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
        this.writer.write(`</span>`);
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.writer.write(`<span class="unicode-character-range">`);
        this.emitUnicodeCharacterLiteral(node.left);
        this.writer.write(` <span class="keyword">through</span> `);
        this.emitUnicodeCharacterLiteral(node.right);
        this.writer.write(`</span>`);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.writer.write(`<span class="unicode-character-literal">`);
        this.emitTextContent(node);
        this.writer.write(`</span>`);
        if (node.questionToken) {
            this.writer.write(`<span class="opt">opt</span>`);
        }
    }

    protected emitProse(node: Prose) {
        this.writer.write(`<span class="prose">`);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }
        this.writer.write(`</span>`);
    }

    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write(`<span class="assertion">[empty]</span>`);
    }

    protected emitSymbolSet(node: SymbolSet) {
        this.writer.write(`{`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`,`);
                }

                this.writer.write(` `);
                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(` }`);
    }

    protected emitLookaheadAssertion(node: LookaheadAssertion) {
        this.writer.write(`<span class="assertion">[`);
        if (node.operatorToken) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.NotEqualToToken:
                    this.writer.write(`<span class="keyword">lookahead</span> ≠ `);
                    break;

                case SyntaxKind.EqualsToken:
                case SyntaxKind.EqualsEqualsToken:
                    this.writer.write(`<span class="keyword">lookahead</span> = `);
                    break;

                case SyntaxKind.LessThanMinusToken:
                case SyntaxKind.ElementOfToken:
                    this.writer.write(`<span class="keyword">lookahead</span> ∈ `);
                    break;

                case SyntaxKind.LessThanExclamationToken:
                case SyntaxKind.NotAnElementOfToken:
                    this.writer.write(`<span class="keyword">lookahead</span> ∉ `);
                    break;
            }
        }

        this.emitNode(node.lookahead);
        this.writer.write(`]</span>`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`<span class="assertion">[<span class="keyword">lexical</span> </span>goal</span>`);
        const linkId = node.symbol && this.resolver.getProductionLinkId(node.symbol);
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write(`</span>`);
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`<span class="assertion">[<span class="keyword">no</span> `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` <span class="keyword">or</span> `);
                }

                this.emitNode(node.symbols[i]);
            }
        }

        this.writer.write(` <span class="keyword">here</span>]</assertion>`);
    }

    protected emitParameterValueAssertion(node: ParameterValueAssertion): void {
        this.writer.write(`<span class="assertion">[`)
        this.emitToken(node.operatorToken);
        this.writer.write(`<span class="parameter">`);
        this.emitNode(node.name);
        this.writer.write(`</span>`);
        this.writer.write(`]</span>`);
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        this.writer.write(`<span class="assertion">[`);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }

        this.writer.write(`]</span>`);
    }

    protected emitButNotSymbol(node: ButNotSymbol) {
        this.emitNode(node.left);
        this.writer.write(` <span class="keyword">but</span> <span class="keyword">not</span> `);
        this.emitNode(node.right);
    }

    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write(`<span class="keyword">one</span> <span class="keyword">of</span> `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` <span class="keyword">or</span> `);
                }

                this.emitNode(node.symbols[i]);
            }
        }
    }

    protected emitTextContent(node: TextContent) {
        if (node && node.text) {
            this.writer.write(this.encode(node.text));
        }
    }

    protected afterEmitNode(node: Node) {
        super.afterEmitNode(node);
        switch (node.kind) {
            case SyntaxKind.RightHandSideList:
            case SyntaxKind.RightHandSide:
            case SyntaxKind.OneOfList:
            case SyntaxKind.Production:
                this.writer.writeln();
                break;
        }
    }

    private emitLinkAnchor(linkId: string | undefined) {
        if (linkId && this.options.emitLinks) {
            this.writer.write(`<a name="${linkId}"></a>`);
        }
    }

    private emitNodeWithLink(node: Node | undefined, linkId: string | undefined) {
        if (linkId && this.options.emitLinks) {
            this.writer.write(`<a href="#${linkId}">`);
            this.emitNode(node);
            this.writer.write(`</a>`);
        }
        else {
            this.emitNode(node);
        }
    }
}