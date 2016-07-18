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
import { Dict, Range, Position, TextRange } from "./core";
import { LineMap } from "./diagnostics";
import { SyntaxKind } from "./tokens";
import { SymbolTable } from "./symbols";
import { metadata, getPropertyMetadata } from "./metadata";

// override TypeScript __metadata decorator.
var __metadata = metadata;

let nextNodeId = 0;

export interface TextContent {
    text: string;
}

export interface Optional {
    optionalToken: Node;
}

export interface NodeEdge {
    name: string;
    isArray: boolean;
    read?(node: Node): Node;
    readArray?(node: Node): Node[];
}

export namespace NodeEdge {
    export function create(name: string, read: (node: Node) => Node): NodeEdge {
        return { name, isArray: false, read };
    }

    export function createArray(name: string, readArray: (node: Node) => Node[]): NodeEdge {
        return { name, isArray: true, readArray };
    }
}

export class Node implements TextRange {
    public kind: SyntaxKind;
    public id: number = ++nextNodeId;
    public pos: number;
    public end: number;
    private _edges: NodeEdge[];

    constructor(kind: SyntaxKind) {
        this.kind = kind;
    }

    public getEdges() {
        return this._edges ? this._edges.slice() : [];
    }
}

export class StringLiteral extends Node implements TextContent {
    public text: string;

    constructor(text: string) {
        super(SyntaxKind.StringLiteral);

        this.text = text;
    }
}

export class Identifier extends Node implements TextContent {
    public text: string;

    constructor(text: string) {
        super(SyntaxKind.Identifier);

        this.text = text;
    }
}

export class LexicalSymbol extends Node {
}

export class PrimarySymbol extends LexicalSymbol {
}

export class OptionalSymbol extends PrimarySymbol {
    @edge questionToken: Node;

    constructor(kind: SyntaxKind, questionToken: Node) {
        super(kind);

        this.questionToken = questionToken;
    }

    public getChildrenCount() {
        return this.questionToken ? 1 : 0;
    }

    public getNthChild(offset: number) {
        return this.questionToken;
    }
}

export class UnicodeCharacterLiteral extends OptionalSymbol implements TextContent {
    public text: string;

    constructor(text: string, questionToken: Node) {
        super(SyntaxKind.UnicodeCharacterLiteral, questionToken);

        this.text = text;
    }
}

export class UnicodeCharacterRange extends LexicalSymbol {
    @edge left: UnicodeCharacterLiteral;
    @edge throughKeyword: Node;
    @edge right: UnicodeCharacterLiteral;

    constructor(left: UnicodeCharacterLiteral, throughKeyword: Node, right: UnicodeCharacterLiteral) {
        super(SyntaxKind.UnicodeCharacterRange);
        this.left = left;
        this.throughKeyword = throughKeyword;
        this.right = right;
    }
}

export class ButNotSymbol extends LexicalSymbol {
    @edge left: LexicalSymbol;
    @edge butKeyword: Node;
    @edge notKeyword: Node;
    @edge right: LexicalSymbol;

    constructor(left: LexicalSymbol, butKeyword: Node, notKeyword: Node, right: LexicalSymbol) {
        super(SyntaxKind.ButNotSymbol);
        this.left = left;
        this.butKeyword = butKeyword;
        this.notKeyword = notKeyword;
        this.right = right;
    }
}

export class Terminal extends OptionalSymbol implements TextContent {
    public text: string;

    constructor(text: string, questionToken: Node) {
        super(SyntaxKind.Terminal, questionToken);

        this.text = text;
    }
}

export class TerminalList extends Node {
    @edge terminals: Terminal[];

    constructor(terminals: Terminal[] = []) {
        super(SyntaxKind.TerminalList);

        this.terminals = terminals;
    }
}

export class SymbolSet extends Node {
    @edge openBraceToken: Node;
    @edge elements: SymbolSpan[];
    @edge closeBraceToken: Node;

    constructor(openBraceToken: Node, elements: SymbolSpan[], closeBraceToken: Node) {
        super(SyntaxKind.SymbolSet);

        this.openBraceToken = openBraceToken;
        this.elements = elements;
        this.closeBraceToken = closeBraceToken;
    }
}

export class Assertion extends LexicalSymbol {
    @edge openBracketToken: Node;
    @edge closeBracketToken: Node;

    constructor(kind: SyntaxKind, openBracketToken: Node, closeBracketToken: Node) {
        super(kind);

        this.openBracketToken = openBracketToken;
        this.closeBracketToken = closeBracketToken;
    }
}

export class EmptyAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge emptyKeyword: Node;
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, emptyKeyword: Node, closeBracketToken: Node) {
        super(SyntaxKind.EmptyAssertion, openBracketToken, closeBracketToken);

        this.emptyKeyword = emptyKeyword;
    }
}

export class LookaheadAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge lookaheadKeyword: Node;
    @edge operatorToken: Node;
    @edge lookahead: SymbolSpan | SymbolSet;
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, lookaheadKeyword: Node, operatorToken: Node, lookahead: SymbolSpan | SymbolSet, closeBracketToken: Node) {
        super(SyntaxKind.LookaheadAssertion, openBracketToken, closeBracketToken);

        this.lookaheadKeyword = lookaheadKeyword;
        this.operatorToken = operatorToken;
        this.lookahead = lookahead;
    }
}

export class LexicalGoalAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge lexicalKeyword: Node;
    @edge goalKeyword: Node;
    @edge symbol: Identifier;
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, lexicalKeyword: Node, goalKeyword: Node, symbol: Identifier, closeBracketToken: Node) {
        super(SyntaxKind.LexicalGoalAssertion, openBracketToken, closeBracketToken);

        this.lexicalKeyword = lexicalKeyword;
        this.goalKeyword = goalKeyword;
        this.symbol = symbol;
    }
}

export class NoSymbolHereAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge noKeyword: Node;
    @edge symbols: PrimarySymbol[];
    @edge hereKeyword: Node;
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, noKeyword: Node, symbols: PrimarySymbol[], hereKeyword: Node, closeBracketToken: Node) {
        super(SyntaxKind.NoSymbolHereAssertion, openBracketToken, closeBracketToken);

        this.noKeyword = noKeyword;
        this.symbols = symbols;
        this.hereKeyword = hereKeyword;
    }
}

export class ParameterValueAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge operatorToken: Node;
    @edge name: Identifier;
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, operatorToken: Node, name: Identifier, closeBracketToken: Node) {
        super(SyntaxKind.ParameterValueAssertion, openBracketToken, closeBracketToken);

        this.operatorToken = operatorToken;
        this.name = name;
    }
}

export class ProseAssertion extends Assertion {
    @edge openBracketToken: Node;
    @edge fragments: ProseFragment[];
    @edge closeBracketToken: Node;

    constructor(openBracketToken: Node, fragments: ProseFragment[], closeBracketToken: Node) {
        super(SyntaxKind.ProseAssertion, openBracketToken, closeBracketToken);
        this.fragments = fragments;
    }
}

export class ProseFragmentLiteral extends Node implements TextContent {
    text: string;

    constructor(kind: SyntaxKind, text: string) {
        super(kind);
        this.text = text;
    }
}

export type ProseFragment = ProseFragmentLiteral | Terminal | Nonterminal;

export class Argument extends Node {
    @edge operatorToken: Node;
    @edge name: Identifier;

    constructor(operatorToken: Node, name: Identifier) {
        super(SyntaxKind.Argument);

        this.operatorToken = operatorToken;
        this.name = name;
    }
}

export class ArgumentList extends Node {
    @edge openParenToken: Node;
    @edge elements: Argument[];
    @edge closeParenToken: Node;

    constructor(openParenToken: Node, elements: Argument[], closeParenToken: Node) {
        super(SyntaxKind.ArgumentList);

        this.openParenToken = openParenToken;
        this.elements = elements;
        this.closeParenToken = closeParenToken;
    }
}

export class Nonterminal extends OptionalSymbol {
    @edge name: Identifier;
    @edge argumentList: ArgumentList;

    constructor(name: Identifier, argumentList: ArgumentList, questionToken: Node) {
        super(SyntaxKind.Nonterminal, questionToken);

        this.name = name;
        this.argumentList = argumentList;
    }
}

export class Prose extends LexicalSymbol {
    @edge greaterThanToken: Node;
    @edge fragments: ProseFragment[];

    constructor(greaterThanToken: Node, fragments: ProseFragment[]) {
        super(SyntaxKind.Prose);

        this.greaterThanToken = greaterThanToken;
        this.fragments = fragments;
    }
}

export class OneOfSymbol extends LexicalSymbol {
    @edge oneKeyword: Node;
    @edge ofKeyword: Node;
    @edge symbols: LexicalSymbol[];

    constructor(oneKeyword: Node, ofKeyword: Node, symbols: LexicalSymbol[]) {
        super(SyntaxKind.OneOfSymbol);

        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.symbols = symbols;
    }
}

export class SymbolSpan extends Node {
    @edge symbol: LexicalSymbol;
    @edge next: SymbolSpan;

    constructor(symbol: LexicalSymbol, next: SymbolSpan) {
        super(SyntaxKind.SymbolSpan);

        this.symbol = symbol;
        this.next = next;
    }
}

export class LinkReference extends Node {
    public text: string;

    constructor(text: string) {
        super(SyntaxKind.LinkReference);

        this.text = text;
    }
}

export class RightHandSide extends Node {
    @edge head: SymbolSpan;
    @edge reference: LinkReference;

    constructor(head: SymbolSpan, reference: LinkReference) {
        super(SyntaxKind.RightHandSide);

        this.head = head;
        this.reference = reference;
    }
}

export class RightHandSideList extends Node {
    @edge openIndentToken: Node;
    @edge elements: RightHandSide[];
    @edge closeIndentToken: Node;

    constructor(openIndentToken: Node, elements: RightHandSide[], closeIndentToken: Node) {
        super(SyntaxKind.RightHandSideList);

        this.openIndentToken = openIndentToken;
        this.elements = elements;
        this.closeIndentToken = closeIndentToken;
    }
}

export class OneOfList extends Node {
    @edge openIndentToken: Node;
    @edge oneKeyword: Node;
    @edge ofKeyword: Node;
    @edge terminals: Terminal[];
    @edge closeIndentToken: Node;

    constructor(oneKeyword: Node, ofKeyword: Node, openIndentToken: Node, terminals: Terminal[], closeIndentToken: Node) {
        super(SyntaxKind.OneOfList);

        this.oneKeyword = oneKeyword;
        this.ofKeyword = ofKeyword;
        this.openIndentToken = openIndentToken;
        this.terminals = terminals;
        this.closeIndentToken = closeIndentToken;
    }
}

export class Parameter extends Node {
    @edge name: Identifier;

    constructor(name: Identifier) {
        super(SyntaxKind.Parameter);

        this.name = name;
    }
}

export class ParameterList extends Node {
    @edge openParenToken: Node;
    @edge elements: Parameter[];
    @edge closeParenToken: Node;

    constructor(openParenToken: Node, elements: Parameter[], closeParenToken: Node) {
        super(SyntaxKind.ParameterList);

        this.openParenToken = openParenToken;
        this.elements = elements;
        this.closeParenToken = closeParenToken;
    }
}

export class SourceElement extends Node {
}

export class Production extends SourceElement {
    @edge name: Identifier;
    @edge colonToken: Node;
    @edge parameterList: ParameterList;
    @edge body: OneOfList | RightHandSide | RightHandSideList;

    constructor(name: Identifier, parameters: ParameterList, colonToken: Node, body: OneOfList | RightHandSide | RightHandSideList) {
        super(SyntaxKind.Production);

        this.name = name;
        this.parameterList = parameters;
        this.colonToken = colonToken;
        this.body = body;
    }
}

export abstract class MetaElement extends SourceElement {
    @edge atToken: Node;

    constructor(kind: SyntaxKind, atToken: Node) {
        super(kind);
        this.atToken = atToken;
    }
}

export class Import extends MetaElement {
    @edge importKeyword: Node;
    @edge path: StringLiteral;

    constructor(atToken: Node, importKeyword: Node, path: StringLiteral) {
        super(SyntaxKind.Import, atToken);
        this.importKeyword = importKeyword;
        this.path = path;
    }
}

export class Define extends MetaElement {
    @edge defineKeyword: Node;
    @edge key: Identifier;
    @edge valueToken: Node;

    constructor(atToken: Node, defineKeyword: Node, key: Identifier, valueToken: Node) {
        super(SyntaxKind.Define, atToken);
        this.defineKeyword = defineKeyword;
        this.key = key;
        this.valueToken = valueToken;
    }
}

export class SourceFile extends Node {
    public filename: string;
    public text: string;
    @edge elements: SourceElement[];
    public lineMap: LineMap;
    public imports: string[];

    constructor(filename: string, text: string) {
        super(SyntaxKind.SourceFile);

        this.filename = filename;
        this.text = text;
        this.lineMap = new LineMap(text);
        this.pos = 0;
        this.end = this.text.length;
    }
}

function visitNode<T>(node: Node, cbNode: (node: Node) => T): T {
    if (node) {
        return cbNode(node);
    }

    return undefined;
}

function visitNodes<T>(nodes: Node[], cbNode: (Node: Node) => T): T {
    if (nodes) {
        let result: T;
        for (let i = 0; i < nodes.length; i++) {
            result = visitNode(nodes[i], cbNode);
            if (result) {
                return result;
            }
        }
    }

    return undefined;
}

export function forEachChild<T>(node: Node, cbNode: (node: Node) => T): T {
    if (node) {
        switch (node.kind) {
            case SyntaxKind.TerminalList:
                return visitNodes((<TerminalList>node).terminals, cbNode);

            case SyntaxKind.SymbolSet:
                return visitNode((<SymbolSet>node).openBraceToken, cbNode)
                    || visitNodes((<SymbolSet>node).elements, cbNode)
                    || visitNode((<SymbolSet>node).closeBraceToken, cbNode);

            case SyntaxKind.EmptyAssertion:
                return visitNode((<EmptyAssertion>node).openBracketToken, cbNode)
                    || visitNode((<EmptyAssertion>node).emptyKeyword, cbNode)
                    || visitNode((<EmptyAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.LookaheadAssertion:
                return visitNode((<LookaheadAssertion>node).openBracketToken, cbNode)
                    || visitNode((<LookaheadAssertion>node).lookaheadKeyword, cbNode)
                    || visitNode((<LookaheadAssertion>node).operatorToken, cbNode)
                    || visitNode((<LookaheadAssertion>node).lookahead, cbNode)
                    || visitNode((<LookaheadAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.LexicalGoalAssertion:
                return visitNode((<LexicalGoalAssertion>node).openBracketToken, cbNode)
                    || visitNode((<LexicalGoalAssertion>node).lexicalKeyword, cbNode)
                    || visitNode((<LexicalGoalAssertion>node).goalKeyword, cbNode)
                    || visitNode((<LexicalGoalAssertion>node).symbol, cbNode)
                    || visitNode((<LexicalGoalAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.NoSymbolHereAssertion:
                return visitNode((<NoSymbolHereAssertion>node).openBracketToken, cbNode)
                    || visitNode((<NoSymbolHereAssertion>node).noKeyword, cbNode)
                    || visitNodes((<NoSymbolHereAssertion>node).symbols, cbNode)
                    || visitNode((<NoSymbolHereAssertion>node).hereKeyword, cbNode)
                    || visitNode((<NoSymbolHereAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.ParameterValueAssertion:
                return visitNode((<ParameterValueAssertion>node).openBracketToken, cbNode)
                    || visitNode((<ParameterValueAssertion>node).operatorToken, cbNode)
                    || visitNode((<ParameterValueAssertion>node).name, cbNode)
                    || visitNode((<ParameterValueAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.ProseAssertion:
                return visitNode((<ProseAssertion>node).openBracketToken, cbNode)
                    || visitNodes((<ProseAssertion>node).fragments, cbNode)
                    || visitNode((<ProseAssertion>node).closeBracketToken, cbNode);

            case SyntaxKind.InvalidAssertion:
                return visitNode((<Assertion>node).openBracketToken, cbNode)
                    || visitNode((<Assertion>node).closeBracketToken, cbNode);

            case SyntaxKind.Prose:
                return visitNode((<Prose>node).greaterThanToken, cbNode)
                    || visitNodes((<Prose>node).fragments, cbNode);

            case SyntaxKind.Terminal:
            case SyntaxKind.UnicodeCharacterLiteral:
                return visitNode((<OptionalSymbol>node).questionToken, cbNode);

            case SyntaxKind.Nonterminal:
                return visitNode((<Nonterminal>node).name, cbNode)
                    || visitNode((<Nonterminal>node).argumentList, cbNode)
                    || visitNode((<Nonterminal>node).questionToken, cbNode);

            case SyntaxKind.OneOfSymbol:
                return visitNodes((<OneOfSymbol>node).symbols, cbNode);

            case SyntaxKind.ButNotSymbol:
                return visitNode((<ButNotSymbol>node).left, cbNode)
                    || visitNode((<ButNotSymbol>node).butKeyword, cbNode)
                    || visitNode((<ButNotSymbol>node).notKeyword, cbNode)
                    || visitNode((<ButNotSymbol>node).right, cbNode);

            case SyntaxKind.UnicodeCharacterRange:
                return visitNode((<UnicodeCharacterRange>node).left, cbNode)
                    || visitNode((<UnicodeCharacterRange>node).throughKeyword, cbNode)
                    || visitNode((<UnicodeCharacterRange>node).right, cbNode);

            case SyntaxKind.SymbolSpan:
                return visitNode((<SymbolSpan>node).symbol, cbNode)
                    || visitNode((<SymbolSpan>node).next, cbNode);

            case SyntaxKind.RightHandSide:
                return visitNode((<RightHandSide>node).head, cbNode)
                    || visitNode((<RightHandSide>node).reference, cbNode);

            case SyntaxKind.RightHandSideList:
                return visitNode((<RightHandSideList>node).openIndentToken, cbNode)
                    || visitNodes((<RightHandSideList>node).elements, cbNode)
                    || visitNode((<RightHandSideList>node).closeIndentToken, cbNode);

            case SyntaxKind.OneOfList:
                return visitNode((<OneOfList>node).oneKeyword, cbNode)
                    || visitNode((<OneOfList>node).ofKeyword, cbNode)
                    || visitNode((<OneOfList>node).openIndentToken, cbNode)
                    || visitNodes((<OneOfList>node).terminals, cbNode)
                    || visitNode((<OneOfList>node).closeIndentToken, cbNode);

            case SyntaxKind.Parameter:
                return visitNode((<Parameter>node).name, cbNode);

            case SyntaxKind.ParameterList:
                return visitNode((<ParameterList>node).openParenToken, cbNode)
                    || visitNodes((<ParameterList>node).elements, cbNode)
                    || visitNode((<ParameterList>node).closeParenToken, cbNode);

            case SyntaxKind.Argument:
                return visitNode((<Argument>node).operatorToken, cbNode)
                    || visitNode((<Argument>node).name, cbNode);

            case SyntaxKind.ArgumentList:
                return visitNode((<ArgumentList>node).openParenToken, cbNode)
                    || visitNodes((<ArgumentList>node).elements, cbNode)
                    || visitNode((<ArgumentList>node).closeParenToken, cbNode)

            case SyntaxKind.Production:
                return visitNode((<Production>node).name, cbNode)
                    || visitNode((<Production>node).parameterList, cbNode)
                    || visitNode((<Production>node).body, cbNode);

            case SyntaxKind.Import:
                return visitNode((<Import>node).atToken, cbNode)
                    || visitNode((<Import>node).importKeyword, cbNode)
                    || visitNode((<Import>node).path, cbNode);

            case SyntaxKind.SourceFile:
                return visitNodes((<SourceFile>node).elements, cbNode);
        }
    }

    return undefined;
}

function ensureEdges(target: Node): NodeEdge[] {
    if (!Object.prototype.hasOwnProperty.call(target, "_edges")) {
        Object.defineProperty(target, "_edges", { value: [] });
    }
    return (<any>target)._edges;
}

function addEdge(target: Node, edge: NodeEdge) {
    ensureEdges(target).push(edge);
}

export function edge(target: Node, name: string) {
    const designType = getPropertyMetadata(target, name, "design:type");
    const read = node => Dict.get<any>(node, name);
    const edge = designType === Array
        ? NodeEdge.createArray(name, read)
        : NodeEdge.create(name, read);
    addEdge(target, edge);
}