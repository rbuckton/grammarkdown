/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import {
    Node,
    UnicodeCharacterLiteral,
    UnicodeCharacterRange,
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
    Argument,
    ArgumentList,
    Nonterminal,
    OneOfSymbol,
    ButNotSymbol,
    SymbolSpan,
    RightHandSide,
    RightHandSideList,
    Production,
    TextContent,
    TerminalLiteral
} from "../nodes";

/** {@docCategory Emit} */
export class MarkdownEmitter extends Emitter {
    protected extension = ".md";

    protected emitKeyword(node: Node) {
        if (node) {
            this.writer.write(`**`);
            super.emitKeyword(node);
            this.writer.write(`**`);
        }
    }

    protected emitProduction(node: Production) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write(`&emsp;&emsp;`);
        this.emitLinkAnchor(linkId);
        this.writer.write(`*`);
        this.emitIdentifier(node.name);
        this.writer.write(`*`);
        this.emitNode(node.parameterList);
        this.writer.write(` **`);
        this.emitToken(node.colonToken);
        this.writer.write(`**`);
        if (node.body && node.body.kind !== SyntaxKind.RightHandSideList) {
            this.writer.write(` `);
        }

        this.emitNode(node.body);
        this.writer.writeln();
        this.writer.write(`  `);
        this.writer.writeln();
    }

    protected emitParameterList(node: ParameterList) {
        this.writer.write(`<sub>\[`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`]</sub>`);
    }

    protected emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }

    protected emitOneOfList(node: OneOfList) {
        this.writer.write(`**one of**`);
        const terminals = node.terminals;
        if (terminals && terminals.length > 0) {
            if (node.indented) {
                // get the maximum size for a terminal
                let width = 5;
                for (const terminal of terminals) {
                    if (terminal.text && terminal.text.length > width) {
                        width = terminal.text.length;
                    }
                }

                this.writer.write(`  `);
                this.writer.writeln();
                this.writer.write(`<pre>`);
                const columns = Math.floor(50 / width);
                let pad = 0;
                for (let i = 0; i < terminals.length; ++i) {
                    const terminal = terminals[i];
                    if (i % columns === 0) {
                        if (i > 0) {
                            this.writer.write(`  `);
                            this.writer.writeln();
                        }

                        this.writer.write(`&emsp;&emsp;&emsp;`);
                    }
                    else {
                        for (let j = 0; j <= pad; ++j) {
                            this.writer.write(` `);
                        }
                    }

                    if (terminal.text) {
                        this.writer.write(`<code>`);
                        this.writer.write(this.encode(terminal.text));
                        this.writer.write(`</code>`);
                        pad = width - terminal.text.length;
                    }
                }

                this.writer.write(`</pre>`);
            }
            else {
                this.writer.write(` `);
                if (node.terminals) {
                    for (let i = 0; i < node.terminals.length; ++i) {
                        if (i > 0) {
                            this.writer.write(`&emsp;`);
                        }

                        this.emitNode(node.terminals[i]);
                    }
                }

                this.writer.write(`  `);
            }
        }
    }

    protected emitRightHandSideList(node: RightHandSideList) {
        this.writer.write(`  `);
        if (node.elements) {
            for (const rhs of node.elements) {
                this.writer.writeln();
                this.writer.write(`&emsp;&emsp;&emsp;`);
                this.emitNode(rhs);
            }
        }
    }

    protected emitRightHandSide(node: RightHandSide) {
        const linkId = this.resolver.getRightHandSideLinkId(node, /*includePrefix*/ true);
        this.emitLinkAnchor(linkId);
        super.emitRightHandSide(node);
    }

    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.write(`&emsp;`);
            this.emitNode(node.next);
        }
    }

    protected emitTerminal(node: Terminal) {
        this.emitNode(node.literal);
        if (node.questionToken) {
            this.writer.write(`<sub>opt</sub>`);
        }
    }

    protected emitNonterminal(node: Nonterminal) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write(`*`);
        this.emitNodeWithLink(node.name, linkId);
        this.writer.write(`*`);
        this.emitNode(node.argumentList);
        if (node.questionToken) {
            this.writer.write(`<sub>opt</sub>`);
        }
    }

    protected emitArgumentList(node: ArgumentList) {
        this.writer.write(`<sub>\[`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`]</sub>`);
    }

    protected emitArgument(node: Argument) {
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        if (node.text) {
            this.writer.write(this.encode(node.text));
        }
    }

    protected emitTerminalLiteral(node: TerminalLiteral) {
        this.writer.write("`` ");
        this.writer.write(node.text);
        this.writer.write(" ``");
    }

    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write(`\[empty]`);
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
        if (node.operatorToken) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.NotEqualToToken:
                    this.writer.write(`\[lookahead ≠ `);
                    break;

                case SyntaxKind.EqualsToken:
                case SyntaxKind.EqualsEqualsToken:
                    this.writer.write(`\[lookahead = `);
                    break;

                case SyntaxKind.LessThanMinusToken:
                case SyntaxKind.ElementOfToken:
                    this.writer.write(`\[lookahead ∈ `);
                    break;

                case SyntaxKind.LessThanExclamationToken:
                case SyntaxKind.NotAnElementOfToken:
                    this.writer.write(`\[lookahead ∉ `);
                    break;
            }
        }

        this.emitNode(node.lookahead);
        this.writer.write(`]`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        const linkId = node.symbol && this.resolver.getProductionLinkId(node.symbol);
        this.writer.write(`\[lexical goal `);
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write(`]`);
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`\[no `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` or `);
                }

                this.emitNode(node.symbols[i]);
            }
        }

        this.writer.write(` here]`);
    }

    protected emitConstraints(node: Constraints): void {
        this.writer.write(`\[`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`]`);
        this.writer.write(`&emsp;`);
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.emitNode(node.left);
        this.writer.write(` **through** `);
        this.emitNode(node.right);
    }

    protected emitButNotSymbol(node: ButNotSymbol) {
        this.emitNode(node.left);
        this.writer.write(` **but not** `);
        this.emitNode(node.right);
    }

    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write(`**one of** `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` **or** `);
                }

                this.emitNode(node.symbols[i]);
            }
        }
    }

    protected emitTextContent(node: TextContent) {
        this.writer.write(node.text);
    }

    protected afterEmitNode(node: Node) {
        super.afterEmitNode(node);
        switch (node.kind) {
            case SyntaxKind.RightHandSide:
                this.writer.writeln(`  `);
                break;
            case SyntaxKind.RightHandSideList:
            case SyntaxKind.OneOfList:
            case SyntaxKind.Production:
                this.writer.writeln();
                break;
        }
    }

    private emitLinkAnchor(linkId: string | undefined) {
        if (linkId) {
            this.writer.write(`<a name="${linkId}"></a>`);
        }
    }

    private emitNodeWithLink(node: Node | undefined, linkId: string | undefined) {
        if (linkId) {
            this.writer.write(`[`);
            this.emitNode(node);
            this.writer.write(`](#${linkId})`);
        }
        else {
            this.emitNode(node);
        }
    }
}