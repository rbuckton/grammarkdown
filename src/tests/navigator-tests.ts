import { readFileSync } from "fs";
import { resolve } from "path";
import { Production, RightHandSideList, RightHandSide, Nonterminal } from "../nodes";
import { DiagnosticMessages } from "../diagnostics";
import { Parser } from "../parser";
import { NodeNavigator } from "../navigator";
import { SyntaxKind } from "../tokens";
import * as assert from "assert";

describe("Navigator", () => {
    const es6GrammarText: string = `
// A.1 - Lexical Grammar

SourceCharacter ::
	> any Unicode code point

InputElementDiv ::
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	DivPunctuator
	RightBracePunctuator

InputElementRegExp ::
	WhiteSpace
	LineTerminator
	Comment
	CommonToken
	RightBracePunctuator
	RegularExpressionLiteral

// ...

ExportSpecifier :
	IdentifierName
	IdentifierName \`as\` IdentifierName
`.trim();

    function getNavigator() {
        const parser = new Parser();
        const sourceFile = parser.parseSourceFile("es6.grammar", es6GrammarText);
        const navigator = new NodeNavigator(sourceFile);
        return { sourceFile, navigator };
    }

    it("initial state", () => {
        const { sourceFile, navigator } = getNavigator();
        assert.strictEqual(navigator.getRoot(), sourceFile);
        assert.strictEqual(navigator.getNode(), sourceFile);
        assert.strictEqual(navigator.getParent(), undefined);
        assert.strictEqual(navigator.getKind(), SyntaxKind.SourceFile);
        assert.strictEqual(navigator.getDepth(), 0);
        assert.strictEqual(navigator.getName(), undefined);
        assert.strictEqual(navigator.getOffset(), 0);
        assert.strictEqual(navigator.getArray(), undefined);
        assert.strictEqual(navigator.isArray(), false);
        assert.strictEqual(navigator.hasChildren(), true);
    });

    it("moveToFirstChild", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToFirstChild();
        assert.strictEqual(moved, true);
        assert.strictEqual(navigator.getRoot(), sourceFile);
        assert.strictEqual(navigator.getNode(), sourceFile.elements[0]);
        assert.strictEqual(navigator.getParent(), sourceFile);
        assert.strictEqual(navigator.getKind(), SyntaxKind.Production);
        assert.strictEqual(navigator.getDepth(), 1);
        assert.strictEqual(navigator.getName(), "elements");
        assert.strictEqual(navigator.getOffset(), 0);
        assert.notStrictEqual(navigator.getArray(), undefined);
        assert.strictEqual(navigator.isArray(), true);
        assert.strictEqual(navigator.hasChildren(), true);
    });

    it("moveToLastChild", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToLastChild();
        assert.strictEqual(moved, true);
        assert.strictEqual(navigator.getRoot(), sourceFile);
        assert.strictEqual(navigator.getNode(), sourceFile.elements[sourceFile.elements.length - 1]);
        assert.strictEqual(navigator.getParent(), sourceFile);
        assert.strictEqual(navigator.getKind(), SyntaxKind.Production);
        assert.strictEqual(navigator.getDepth(), 1);
        assert.strictEqual(navigator.getName(), "elements");
        assert.strictEqual(navigator.getOffset(), sourceFile.elements.length - 1);
        assert.notStrictEqual(navigator.getArray(), undefined);
        assert.strictEqual(navigator.isArray(), true);
        assert.strictEqual(navigator.hasChildren(), true);
    });

    it("moveToNextSibling (in array)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToFirstChild();
        const moved = navigator.moveToNextSibling();
        assert.strictEqual(moved, true);
        assert.strictEqual(navigator.getRoot(), sourceFile);
        assert.strictEqual(navigator.getNode(), sourceFile.elements[1]);
        assert.strictEqual(navigator.getParent(), sourceFile);
        assert.strictEqual(navigator.getKind(), SyntaxKind.Production);
        assert.strictEqual(navigator.getDepth(), 1);
        assert.strictEqual(navigator.getName(), "elements");
        assert.strictEqual(navigator.getOffset(), 1);
        assert.notStrictEqual(navigator.getArray(), undefined);
        assert.strictEqual(navigator.isArray(), true);
        assert.strictEqual(navigator.hasChildren(), true);
    });

    it("moveToNextSibling (in object)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToFirstChild();
        const movedToFirstChild = navigator.moveToFirstChild();
        const production = <Production>navigator.getParent();
        const firstChild = navigator.getNode();
        const firstChildName = navigator.getName();
        const movedToSibling = navigator.moveToNextSibling();
        const nextSibling = navigator.getNode();
        const nextSiblingName = navigator.getName();
        assert.strictEqual(movedToFirstChild, true);
        assert.strictEqual(movedToSibling, true);
        assert.strictEqual(production.kind, SyntaxKind.Production);
        assert.strictEqual(firstChildName, "name");
        assert.strictEqual(firstChild, production.name);
        assert.strictEqual(nextSiblingName, "colonToken");
        assert.strictEqual(nextSibling, production.colonToken);
    });

    it("moveTopPreviousSibling (in array)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToLastChild();
        const moved = navigator.moveToPreviousSibling();
        assert.strictEqual(moved, true);
        assert.strictEqual(navigator.getRoot(), sourceFile);
        assert.strictEqual(navigator.getNode(), sourceFile.elements[sourceFile.elements.length - 2]);
        assert.strictEqual(navigator.getParent(), sourceFile);
        assert.strictEqual(navigator.getKind(), SyntaxKind.Production);
        assert.strictEqual(navigator.getDepth(), 1);
        assert.strictEqual(navigator.getName(), "elements");
        assert.strictEqual(navigator.getOffset(), sourceFile.elements.length - 2);
        assert.notStrictEqual(navigator.getArray(), undefined);
        assert.strictEqual(navigator.isArray(), true);
        assert.strictEqual(navigator.hasChildren(), true);
    });

    it("moveTopPreviousSibling (in object)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToFirstChild();
        const movedToLastChild = navigator.moveToLastChild();
        const production = <Production>navigator.getParent();
        const lastChild = navigator.getNode();
        const lastChildName = navigator.getName();
        const movedToSibling = navigator.moveToPreviousSibling();
        const previousSibling = navigator.getNode();
        const previousSiblingName = navigator.getName();
        assert.strictEqual(movedToLastChild, true);
        assert.strictEqual(movedToSibling, true);
        assert.strictEqual(production.kind, SyntaxKind.Production);
        assert.strictEqual(lastChildName, "body");
        assert.strictEqual(lastChild, production.body);
        assert.strictEqual(previousSiblingName, "colonToken");
        assert.strictEqual(previousSibling, production.colonToken);
    });

    it("moveToPosition", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToPosition({ line: 14, character: 9 });
        assert.strictEqual(moved, true);
        assert.strictEqual(navigator.getKind(), SyntaxKind.Identifier);
        assert.strictEqual(navigator.getName(), "name");
        const production = <Production>sourceFile.elements[2];
        const list = <RightHandSideList>production.body;
        const rhs = <RightHandSide>(list.elements && list.elements[0]);
        const symbol = <Nonterminal>rhs.head!.symbol;
        assert.strictEqual(navigator.getNode(), symbol.name);
    });
});