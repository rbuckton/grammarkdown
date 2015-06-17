import { EmitterBase } from "./emitter-base";
import { SyntaxKind } from "../tokens";
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

export class HtmlEmitter extends EmitterBase {
    public emitSourceFile(node: SourceFile) {
        this.writer.writeln(`<!doctype html>`);
        this.writer.writeln(`<html>`);
        this.writer.writeln(`<head>`);
        this.writer.indent();
        this.writer.writeln(`<title></title>`);
        this.writer.writeln(`<link rel="stylesheet" href="styles.css" />`);
        this.writer.dedent();
        this.writer.writeln(`</head>`);
        this.writer.writeln(`<body>`);
        this.writer.indent();
        this.writer.writeln(`<dl class="grammar">`);
		this.writer.indent();
        super.emitSourceFile(node);
		this.writer.dedent();
        this.writer.writeln(`</dl>`);
        this.writer.dedent();
        this.writer.writeln(`</body>`);
        this.writer.writeln(`</html>`);
    }
    
	protected emitProduction(node: Production) {
        let linkId = this.resolver.getProductionLinkId(node.name);
        if (linkId) {
            this.writer.write(`<dt class="production" id="${linkId}"><var class="production">`);
        }
        else {
            this.writer.write(`<dt class="production"><var class="production">`);
        }
        
        this.emitIdentifier(node.name);
        this.writer.write(`</var>`);
        this.emitNode(node.parameterList);
        this.writer.write(` `);
		if (node.colonToken) {
            this.writer.write(`<span class="separator">`);
            this.emitToken(node.colonToken);
            this.writer.write(`</span>`);
		}
		
		if (node.body && node.body.kind === SyntaxKind.OneOfList) {
			this.writer.write(` <span class="keyword">one of</span>`);
		}
		
		this.writer.writeln(`</dt>`);
        this.emitNode(node.body);
		this.writer.writeln();
	}
    
    protected emitParameterList(node: ParameterList) {
        this.writer.write(` <sub class="parameters">[`);
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }
            
            this.emitNode(node.elements[i]);
        }
        
        this.writer.write(`]</sub>`);
    }
    
    protected emitParameter(node: Parameter) {
        this.writer.write(`<span class="parameter">`);
        this.emitIdentifier(node.name);
        this.writer.write(`</span>`);
    }
    
    protected emitOneOfList(node: OneOfList) {
		for (let i = 0; i < node.terminals.length; ++i) {
			if (i > 0) {
				this.writer.write(" ");
			}
			
            this.writer.write(`<dd class="one-of-list">`);
			this.emitNode(node.terminals[i]);
            this.writer.writeln(`</dd>`);
		}
    }
    
    protected emitRightHandSideList(node: RightHandSideList) {
        for (let rhs of node.elements) {
            this.emitRightHandSide(rhs);
        }
    }
    
    protected emitRightHandSide(node: RightHandSide) {
        let linkId = this.resolver.getAlternativeLinkId(node, /*includePrefix*/ true);
        
        if (linkId) {
            this.writer.write(`<dd class="right-hand-side" id="${linkId}">`);
        }
        else {
            this.writer.write(`<dd class="right-hand-side">`);
        }
        
        this.emitNode(node.head);        
        this.writer.writeln(`</dd>`);
    }
    
    protected emitSymbolSpan(node: SymbolSpan) {
        this.writer.write(`<span class="symbol">`);
        this.emitNode(node.symbol);
        this.writer.write(`</span>`);
        if (node.next) {
            this.writer.writeln();
            this.emitNode(node.next);
        }
    }

    protected emitTerminal(node: Terminal) {
        if (node.questionToken) {
            this.writer.write(`<kbd class="terminal optional">`);
        }
        else {
            this.writer.write(`<kbd class="terminal">`);
        }
        
        this.writer.write(node.text);
        this.writer.write(`</kbd>`);
    }
    
    protected emitNonterminal(node: Nonterminal) {
        let linkId = this.resolver.getProductionLinkId(node.name);
        if (node.questionToken) {
            this.writer.write(`<var class="nonterminal optional">`);
        }
        else {
            this.writer.write(`<var class="nonterminal">`);
        }
        this.emitNodeWithLink(node.name, linkId);
        this.emitNode(node.argumentList);
        this.writer.write(`</var>`);
    }
    
    protected emitArgumentList(node: ArgumentList) {
        this.writer.write(` <sub class="arguments">[`);
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(", ");
            }
            
            this.emitNode(node.elements[i]);
        }
        
        this.writer.write(`]</sub>`);
    }
    
    protected emitArgument(node: Argument) {
        this.writer.write(`<span class="argument">`);
        this.emitToken(node.questionToken);
        this.emitNode(node.name);
        this.writer.write(`</span>`);
    }
    
    protected emitUnicodeCharacterLiteral(node: UnicodeCharacterLiteral) {
        if (node.questionToken) {
            this.writer.write(`<span class="unicode-character-literal optional">&lt;`);
        }
        else {
            this.writer.write(`<span class="unicode-character-literal">&lt;`);
        }
        
        this.writer.write(node.text);
        this.writer.write(`&gt;</span>`);        
    }
    
    protected emitProse(node: Prose) {
        this.writer.write(`<span class="prose">`);
        this.writer.write(this.encode(node.text));
        this.writer.write(`</span>`);
    }
    
    protected emitEmptyAssertion(node: EmptyAssertion) {
        this.writer.write(`<span class="assertion">[<span class="keyword">empty</span>]</span>`);
    }
    
    protected emitSymbolSet(node: SymbolSet) {
        this.writer.write(`<span class="symbol-set">`);
        this.writer.write(`{`);
        for (let i = 0; i < node.elements.length; ++i) {
            if (i > 0) {
                this.writer.write(`,`);
            }
            
            this.writer.write(` `);
            this.emitNode(node.elements[i]);
        }
        
        this.writer.write(` }`);
        this.writer.write(`</span>`);
    }
    
    protected emitLookaheadAssertion(node: LookaheadAssertion) {
        this.writer.write(`<span class="assertion">[`);
        switch (node.operatorToken.kind) {
            case SyntaxKind.ExclamationEqualsToken:
                this.writer.write(`<span class="keyword">lookahead</span> ≠ `);
                break;
                
            case SyntaxKind.EqualsEqualsToken:
                this.writer.write(`<span class="keyword">lookahead</span> = `);
                break;
                
            case SyntaxKind.LessThanMinusToken:
                this.writer.write(`<span class="keyword">lookahead</span> ∈ `);
                break;
                
            case SyntaxKind.LessThanExclamationToken:
                this.writer.write(`<span class="keyword">lookahead</span> ∉ `);
                break;
        }
        
        this.emitNode(node.lookahead);
        this.writer.write(`]</span>`);
    }

    protected emitLexicalGoalAssertion(node: LexicalGoalAssertion): void {
        this.writer.write(`<span class="assertion">[<span class="keyword">lexical goal</span> `);
        let linkId = this.resolver.getProductionLinkId(node.symbol);
        this.emitNodeWithLink(node.symbol, linkId);
        this.writer.write(`]</span>`);
    }
    
    protected emitNoSymbolHereAssertion(node: NoSymbolHereAssertion): void {
        this.writer.write(`<span class="assertion">[<span class="keyword">no</span> `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(" or ");
                }
                
                this.emitNode(node.symbols[i]);
            }
        }
        this.writer.write(` <span class="keyword">here</span>]</span>`);
    }
    
    protected emitParameterValueAssertion(node: ParameterValueAssertion): void {
        this.writer.write(`<span class="assertion">[`);
        this.emitToken(node.operatorToken);
        this.emitNode(node.name);
        this.writer.write(`]</span>`);
    }
    
    protected emitBinarySymbol(node: BinarySymbol) {
        this.writer.write(`<span class="binary-symbol">`);
        this.emitNode(node.left);
        this.emitNode(node.operatorToken);
        this.emitNode(node.right);
        this.writer.write(`</span>`);
    }
    
    protected emitButNotOperator(node: ButNotOperator) {
        this.writer.write(` <span class="keyword">but not</span> `);
    }
    
    protected emitOneOfSymbol(node: OneOfSymbol) {
        this.writer.write(`<span class="one-of-symbol"><span class="keyword">one of</span> `);
        if (node.symbols) {
            for (let i = 0; i < node.symbols.length; ++i) {
                if (i > 0) {
                    this.writer.write(` <span class="keyword">or</span> `);
                }
                
                this.emitNode(node.symbols[i]);
            }
        }
        this.writer.write(`</span>`);
    }
    
    protected emitTextContent(node: TextContent) {
        let text = node.text;
        this.writer.write(text);
    }

    private emitNodeWithLink(node: Node, linkId: string) {
        if (linkId) {
            this.writer.write(`<a href="#${linkId}">`);
            this.emitNode(node);
            this.writer.write(`</a>`);
        }
        else {
            this.emitNode(node);
        }
    }
}