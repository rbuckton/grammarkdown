/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import {
    UnicodeCharacterLiteral,
    UnicodeCharacterRange,
    Prose,
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
    LexicalSymbol,
    ButNotSymbol,
    SymbolSpan,
    RightHandSide,
    RightHandSideList,
    Production,
    TextContent
} from "../nodes";

/** {@docCategory Emit} */
export class GrammarkdownEmitter extends Emitter {
    protected extension = ".grammar";

    protected emitProduction(node: Production) {
        this.emitIdentifier(node.name);
        this.emitNode(node.parameterList);
        this.writer.write(" ");
        this.emitTokenKind(node.colonToken?.kind ?? SyntaxKind.ColonToken);
        this.emitNode(node.body);
    }

    protected emitParameterList(node: ParameterList) {
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }
                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write(`]`);
    }

    protected emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }

    protected emitOneOfList(node: OneOfList) {
        this.writer.write(" ");
        this.emitTokenKind(SyntaxKind.OneKeyword);
        this.writer.write(" ");
        this.emitTokenKind(SyntaxKind.OfKeyword);
        this.writer.writeln();
        this.writer.indent();
        if (node.terminals?.length) {
            for (const child of node.terminals) {
                this.emitNode(child);
            }
        }
        this.writer.dedent();
    }

    protected emitRightHandSideList(node: RightHandSideList) {
        this.writer.indent();
        if (node.elements) {
            for (const rhs of node.elements) {
                this.writer.writeln();
                this.emitNode(rhs);
            }
        }
        this.writer.dedent();
    }

    protected emitRightHandSide(node: RightHandSide) {
        this.emitChildren(node);
    }

    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.write(" ");
            this.emitNode(node.next);
        }
    }

    protected emitPlaceholder(node: LexicalSymbol) {
        this.emitTokenKind(SyntaxKind.AtToken);
    }

    protected emitTerminal(node: Terminal) {
        if (node.text === "`") {
            this.writer.write("```");
        }
        else {
            this.writer.write("`");
            this.writer.write(node.text ?? "");
            this.writer.write("`");
        }
        this.emitNode(node.questionToken);
    }

    protected emitNonterminal(node: Nonterminal) {
        this.emitChildren(node);
    }

    protected emitArgumentList(node: ArgumentList) {
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }
                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write(`]`);
    }

    protected emitArgument(node: Argument) {
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.emitTextContent(node.left);
        this.writer.write(` through `);
        this.emitTextContent(node.right);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.emitTextContent(node);
        this.emitNode(node.questionToken);
    }

    protected emitProse(node: Prose) {
        this.writer.write("> ");
        node.fragments && this.emitNodes(node.fragments);
    }

    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write("[empty]");
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
        this.writer.write(`[`);
        if (node.operatorToken) {
            switch (node.operatorToken.kind) {
                case SyntaxKind.ExclamationEqualsToken:
                case SyntaxKind.NotEqualToToken:
                    this.writer.write(`lookahead ≠ `);
                    break;

                case SyntaxKind.EqualsToken:
                case SyntaxKind.EqualsEqualsToken:
                    this.writer.write(`lookahead = `);
                    break;

                case SyntaxKind.ElementOfToken:
                case SyntaxKind.LessThanMinusToken:
                    this.writer.write(`lookahead ∈ `);
                    break;

                case SyntaxKind.NotAnElementOfToken:
                case SyntaxKind.LessThanExclamationToken:
                    this.writer.write(`lookahead ∉ `);
                    break;
            }
        }

        this.emitNode(node.lookahead);
        this.writer.write(`]`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`[lexical goal `);
        this.emitNode(node.symbol);
        this.writer.write(`]`);
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`[no `);
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
        this.writer.write("[");
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }
        this.writer.write("]");
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        this.writer.write(`[>`);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }

        this.writer.write(`]`);
    }

    protected emitButNotSymbol(node: ButNotSymbol) {
        this.emitNode(node.left);
        this.writer.write(` but not `);
        this.emitNode(node.right);
    }

    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write(`one of `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` or `);
                }

                this.emitNode(node.symbols[i]);
            }
        }
    }

    protected emitTextContent(node: TextContent) {
        if (node?.text) {
            this.writer.write(node.text);
        }
    }
}