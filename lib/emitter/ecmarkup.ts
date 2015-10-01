import { Emitter } from "./emitter";
import { SyntaxKind } from "../tokens";
import { DiagnosticMessages } from "../diagnostics";
import { Checker } from "../checker";
var escape = require("html-escape");

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

export class EcmarkupEmitter extends Emitter {
    protected extension = ".emu.html";

	protected emitProduction(node: Production) {
        let linkId = this.resolver.getProductionLinkId(node.name);
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
		
		if (node.body && node.body.kind === SyntaxKind.OneOfList) {
			this.writer.write(`oneof`);
		}
		
		this.writer.write(`>`);
		this.writer.indent();
		this.writer.writeln();
        this.emitNode(node.body);
		this.writer.dedent();
		this.writer.writeln();
		this.writer.write(`</emu-production>`);
        this.writer.writeln();
	}
    
    protected emitParameterList(node: ParameterList) {
        this.writer.write(` params="`);
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }
            
            this.emitNode(node.elements[i]);
        }
        
        this.writer.write(`"`);
    }
    
    protected emitParameter(node: Parameter) {
        this.emitIdentifier(node.name);
    }
    
    protected emitOneOfList(node: OneOfList) {
        this.writer.write(`<emu-rhs>`);
		for (let i = 0; i < node.terminals.length; ++i) {
			if (i > 0) {
				this.writer.write(" ");
			}
			
			this.writer.write(this.encode(node.terminals[i].text));
		}
        this.writer.write(`</emu-rhs>`);
        this.writer.writeln();
    }
    
    protected emitRightHandSideList(node: RightHandSideList) {
        for (let rhs of node.elements) {
            this.emitRightHandSide(rhs);
        }
    }
    
    protected emitRightHandSide(node: RightHandSide) {
        let linkId = this.resolver.getRightHandSideLinkId(node, /*includePrefix*/ false);
        this.emitLinkAnchor(linkId);
        
        this.writer.write(`<emu-rhs`);
		
        if (linkId) {
            this.writer.write(` a="${linkId}"`);
        }
        
        let head = node.head;
        if (head.symbol.kind === SyntaxKind.ParameterValueAssertion) {
            this.writer.write(` constraints="`);
            this.emitNode(head.symbol);
            this.writer.write(`"`);
            head = head.next;
        }
        
        this.writer.write(`>`);
        if (head.next) {
            this.writer.indent();
            this.writer.writeln();
            this.emitNode(head);
            this.writer.dedent();
            this.writer.writeln();
        }
        else {
            this.emitNode(head);
        }
        
        this.writer.write(`</emu-rhs>`);
        this.writer.writeln();
    }
    
    protected emitSymbolSpan(node: SymbolSpan) {
        this.emitNode(node.symbol);
        if (node.next) {
            this.writer.writeln();
            this.emitNode(node.next);
        }
    }

    protected emitTerminal(node: Terminal) {
        this.writer.write(`<emu-t`);
        if (node.questionToken) {
            this.writer.write(` optional`);
        }
        this.writer.write(`>`);
        this.writer.write(escape(node.text));
        this.writer.write(`</emu-t>`);
    }
    
    protected emitNonterminal(node: Nonterminal) {
        let linkId = this.resolver.getProductionLinkId(node.name);
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
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }
            
            this.emitNode(node.elements[i]);
        }
        
        this.writer.write(`"`);
    }
    
    protected emitArgument(node: Argument) {
        this.emitToken(node.questionToken);
        this.emitNode(node.name);
    }
    
    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        this.writer.write(`<emu-gprose`);
        if (node.questionToken) {
            this.writer.write(` optional`);
        }
        
        this.writer.write(`>&lt;`);
        this.writer.write(node.text);
        this.writer.write(`&gt;</emu-gprose>`);        
    }
    
    protected emitProse(node: Prose) {
        this.writer.write(`<emu-gprose>`);
        this.writer.write(this.encode(node.text));
        this.writer.write(`</emu-gprose>`);
    }
    
    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write(`<emu-gann>empty</emu-gann>`);
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
        this.writer.write(`<emu-gann>`);
        switch (node.operatorToken.kind) {
            case SyntaxKind.ExclamationEqualsToken:
                this.writer.write("lookahead ≠ ");
                break;
                
            case SyntaxKind.EqualsEqualsToken:
                this.writer.write("lookahead = ");
                break;
                
            case SyntaxKind.LessThanMinusToken:
                this.writer.write("lookahead ∈ ");
                break;
                
            case SyntaxKind.LessThanExclamationToken:
                this.writer.write("lookahead ∉ ");
                break;
        }
        
        this.emitNode(node.lookahead);
        this.writer.write(`</emu-gann>`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`<emu-gann>lexical goal `);
        let linkId = this.resolver.getProductionLinkId(node.symbol);
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write(`</emu-gann>`);
    }
    
    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`<emu-gann>no `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(" or ");
                }
                
                this.emitNode(node.symbols[i]);
            }
        }
        
        this.writer.write(` here</emu-gann>`);
    }
    
    protected emitParameterValueAssertion(node: ParameterValueAssertion): void {
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
    }
    
    protected emitBinarySymbol(node: BinarySymbol) {
        this.emitNode(node.left);
        this.writer.write(`<emu-gmod>`);
        this.emitNode(node.operatorToken);
        this.writer.write(` `);
        this.emitNode(node.right);
        this.writer.write(`</emu-gmod>`);
    }
    
    protected emitButNotOperator(node: ButNotOperator) {
        this.writer.write("but not");
    }
    
    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write("one of ");
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(" or ");
                }
                
                this.emitNode(node.symbols[i]);
            }
        }
    }
    
    protected emitTextContent(node: TextContent) {
        let text = escape(node.text);
        this.writer.write(text);
    }
    
    private emitLinkAnchor(linkId: string) {
        if (linkId && this.options.emitLinks) {
            this.writer.write(`<a name="${linkId}"></a>`);            
        }
    }

    private emitNodeWithLink(node: Node, linkId: string) {
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
