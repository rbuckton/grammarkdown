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

import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import {
    Node,
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
export class EcmarkupEmitter extends Emitter {
    protected extension = ".emu.html";

    protected emitProduction(node: Production) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.emitLinkAnchor(linkId);
        this.writer.write(`<emu-production name="`);
        this.emitIdentifier(node.name);
        this.writer.write(`"`);
        this.emitNode(node.parameterList);
        if (node.colonToken) {
            switch (node.colonToken.kind) {
                case SyntaxKind.ColonColonToken:
                    this.writer.write(` type="lexical"`);
                    break;

                case SyntaxKind.ColonColonColonToken:
                    this.writer.write(` type="regexp"`);
                    break;
            }
        }

        if (node.body) {
            if (node.body.kind === SyntaxKind.OneOfList) {
                this.writer.write(` oneof`);
            }
            else if (node.body.kind === SyntaxKind.RightHandSide) {
                this.writer.write(` collapsed`);
            }
        }

        this.writer.write(`>`);
        this.writer.indent();
        this.writer.writeln();
        this.emitNode(node.body);
        this.writer.dedent();
        this.writer.writeln();
        this.writer.write(`</emu-production>`);
    }

    protected emitParameterList(node: ParameterList) {
        this.writer.write(` params="`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`"`);
    }

    protected emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }

    protected emitOneOfList(node: OneOfList) {
        this.writer.write(`<emu-rhs>`);
        if (node.terminals) {
            for (let i = 0; i < node.terminals.length; ++i) {
                if (i > 0) {
                    this.writer.write(` `);
                }

                this.emitTextContent(node.terminals[i]);
            }
        }

        this.writer.write(`</emu-rhs>`);
    }

    protected emitRightHandSideList(node: RightHandSideList) {
        if (node.elements) {
            for (const rhs of node.elements) {
                this.emitNode(rhs);
            }
        }
    }

    protected emitRightHandSide(node: RightHandSide) {
        const linkId = this.resolver.getRightHandSideLinkId(node, /*includePrefix*/ false);
        this.emitLinkAnchor(linkId);

        this.writer.write(`<emu-rhs`);

        if (linkId) {
            this.writer.write(` a="${linkId}"`);
        }

        if (node.constraints) {
            this.writer.write(` constraints="`);
            this.emitNode(node.constraints);
            this.writer.write(`"`);
        }

        this.writer.write(`>`);
        if (node.head && node.head.next) {
            this.writer.indent();
            this.writer.writeln();
            this.emitNode(node.head);
            this.writer.dedent();
            this.writer.writeln();
        }
        else {
            this.emitNode(node.head);
        }

        this.writer.write(`</emu-rhs>`);
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

    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.writeln();
            this.emitNode(node.next);
        }
    }

    protected emitPlaceholder(node: LexicalSymbol) {
        this.writer.write(`<emu-t placeholder>@</emu-t>`);
    }

    protected emitTerminal(node: Terminal) {
        this.writer.write(`<emu-t`);
        if (node.questionToken) {
            this.writer.write(` optional`);
        }
        this.writer.write(`>`);
        this.emitTextContent(node);
        this.writer.write(`</emu-t>`);
    }

    protected emitNonterminal(node: Nonterminal) {
        const linkId = this.resolver.getProductionLinkId(node.name);
        this.writer.write(`<emu-nt`);
        this.emitNode(node.argumentList);
        if (node.questionToken) {
            this.writer.write(` optional`);
        }

        this.writer.write(`>`);
        this.emitNodeWithLink(node.name, linkId);
        this.writer.write(`</emu-nt>`);
    }

    protected emitArgumentList(node: ArgumentList) {
        this.writer.write(` params="`);
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }

        this.writer.write(`"`);
    }

    protected emitArgument(node: Argument) {
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
    }

    protected emitUnicodeCharacterRange(node: UnicodeCharacterRange) {
        this.writer.write(`<emu-gprose>`);
        this.emitTextContent(node.left);
        this.writer.write(` through `);
        this.emitTextContent(node.right);
        this.writer.write(`</emu-gprose>`);
    }

    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.writer.write(`<emu-gprose`);
        if (node.questionToken) {
            this.writer.write(` optional`);
        }

        this.writer.write(`>`);
        this.emitTextContent(node);
        this.writer.write(`</emu-gprose>`);
    }

    protected emitProse(node: Prose) {
        this.writer.write(`<emu-gprose>`);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }

        this.writer.write(`</emu-gprose>`);
    }

    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write(`<emu-gann>empty</emu-gann>`);
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
        this.writer.write(`<emu-gann>`);
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
        this.writer.write(`</emu-gann>`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`<emu-gann>lexical goal `);
        const linkId = node.symbol && this.resolver.getProductionLinkId(node.symbol);
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write(`</emu-gann>`);
    }

    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`<emu-gann>no `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` or `);
                }

                this.emitNode(node.symbols[i]);
            }
        }

        this.writer.write(` here</emu-gann>`);
    }

    protected emitConstraints(node: Constraints): void {
        if (node.elements) {
            for (let i = 0; i < node.elements.length; ++i) {
                if (i > 0) {
                    this.writer.write(`, `);
                }

                this.emitNode(node.elements[i]);
            }
        }
    }

    protected emitProseAssertion(node: ProseAssertion): void {
        this.writer.write(`<emu-gmod>`);
        if (node.fragments) {
            for (const fragment of node.fragments) {
                this.emitNode(fragment);
            }
        }

        this.writer.write(`</emu-gmod>`);
    }

    protected emitButNotSymbol(node: ButNotSymbol) {
        this.emitNode(node.left);
        this.writer.write(` <emu-gmod>but not `);
        this.emitNode(node.right);
        this.writer.write(`</emu-gmod>`);
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
        if (node && node.text) {
            this.writer.write(this.encode(node.text));
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