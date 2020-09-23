/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { Production, RightHandSideList, RightHandSide, Nonterminal } from "../nodes";
import { Parser } from "../parser";
import { NodeNavigator } from "../navigator";
import { SyntaxKind } from "../tokens";

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

    function getNavigator(text = es6GrammarText) {
        const parser = new Parser();
        const sourceFile = parser.parseSourceFile("file.grammar", text);
        const navigator = new NodeNavigator(sourceFile);
        return { sourceFile, navigator };
    }

    it("initial state", () => {
        const { sourceFile, navigator } = getNavigator();
        expect(navigator.getRoot()).toStrictEqual(sourceFile);
        expect(navigator.getNode()).toStrictEqual(sourceFile);
        expect(navigator.getParent()).toStrictEqual(undefined);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.SourceFile);
        expect(navigator.getDepth()).toStrictEqual(0);
        expect(navigator.getName()).toStrictEqual(undefined);
        expect(navigator.getOffset()).toStrictEqual(0);
        expect(navigator.getArray()).toStrictEqual(undefined);
        expect(navigator.isArray()).toStrictEqual(false);
        expect(navigator.hasChildren()).toStrictEqual(true);
    });

    it("moveToFirstChild", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToFirstChild();
        expect(moved).toEqual(true);
        expect(navigator.getRoot()).toStrictEqual(sourceFile);
        expect(navigator.getNode()).toStrictEqual(sourceFile.elements[0]);
        expect(navigator.getParent()).toStrictEqual(sourceFile);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Production);
        expect(navigator.getDepth()).toStrictEqual(1);
        expect(navigator.getName()).toStrictEqual("elements");
        expect(navigator.getOffset()).toStrictEqual(0);
        expect(navigator.getArray()).toBeDefined();
        expect(navigator.isArray()).toStrictEqual(true);
        expect(navigator.hasChildren()).toStrictEqual(true);
    });

    it("moveToLastChild", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToLastChild();
        expect(moved).toEqual(true);
        expect(navigator.getRoot()).toStrictEqual(sourceFile);
        expect(navigator.getNode()).toStrictEqual(sourceFile.elements[sourceFile.elements.length - 1]);
        expect(navigator.getParent()).toStrictEqual(sourceFile);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Production);
        expect(navigator.getDepth()).toStrictEqual(1);
        expect(navigator.getName()).toStrictEqual("elements");
        expect(navigator.getOffset()).toStrictEqual(sourceFile.elements.length - 1);
        expect(navigator.getArray()).toBeDefined();
        expect(navigator.isArray()).toStrictEqual(true);
        expect(navigator.hasChildren()).toStrictEqual(true);
    });

    it("moveToNextSibling (in array)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToFirstChild();
        const moved = navigator.moveToNextSibling();
        expect(moved).toEqual(true);
        expect(navigator.getRoot()).toStrictEqual(sourceFile);
        expect(navigator.getNode()).toStrictEqual(sourceFile.elements[1]);
        expect(navigator.getParent()).toStrictEqual(sourceFile);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Production);
        expect(navigator.getDepth()).toStrictEqual(1);
        expect(navigator.getName()).toStrictEqual("elements");
        expect(navigator.getOffset()).toStrictEqual(1);
        expect(navigator.getArray()).toBeDefined();
        expect(navigator.isArray()).toStrictEqual(true);
        expect(navigator.hasChildren()).toStrictEqual(true);
    });

    it("moveToNextSibling (in object)", () => {
        const { navigator } = getNavigator();
        navigator.moveToFirstChild();
        const movedToFirstChild = navigator.moveToFirstChild();
        const production = <Production>navigator.getParent();
        const firstChild = navigator.getNode();
        const firstChildName = navigator.getName();
        const movedToSibling = navigator.moveToNextSibling();
        const nextSibling = navigator.getNode();
        const nextSiblingName = navigator.getName();
        expect(movedToFirstChild).toBe(true);
        expect(movedToSibling).toBe(true);
        expect(production.kind).toBe(SyntaxKind.Production);
        expect(firstChildName).toBe("name");
        expect(firstChild).toBe(production.name);
        expect(nextSiblingName).toBe("colonToken");
        expect(nextSibling).toBe(production.colonToken);
    });

    it("moveTopPreviousSibling (in array)", () => {
        const { sourceFile, navigator } = getNavigator();
        navigator.moveToLastChild();
        const moved = navigator.moveToPreviousSibling();
        expect(moved).toEqual(true);
        expect(navigator.getRoot()).toStrictEqual(sourceFile);
        expect(navigator.getNode()).toStrictEqual(sourceFile.elements[sourceFile.elements.length - 2]);
        expect(navigator.getParent()).toStrictEqual(sourceFile);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Production);
        expect(navigator.getDepth()).toStrictEqual(1);
        expect(navigator.getName()).toStrictEqual("elements");
        expect(navigator.getOffset()).toStrictEqual(sourceFile.elements.length - 2);
        expect(navigator.getArray()).toBeDefined();
        expect(navigator.isArray()).toStrictEqual(true);
        expect(navigator.hasChildren()).toStrictEqual(true);
    });

    it("moveTopPreviousSibling (in object)", () => {
        const { navigator } = getNavigator();
        navigator.moveToFirstChild();
        const movedToLastChild = navigator.moveToLastChild();
        const production = <Production>navigator.getParent();
        const lastChild = navigator.getNode();
        const lastChildName = navigator.getName();
        const movedToSibling = navigator.moveToPreviousSibling();
        const previousSibling = navigator.getNode();
        const previousSiblingName = navigator.getName();
        expect(movedToLastChild).toBe(true);
        expect(movedToSibling).toBe(true);
        expect(production.kind).toBe(SyntaxKind.Production);
        expect(lastChildName).toBe("body");
        expect(lastChild).toBe(production.body);
        expect(previousSiblingName).toBe("colonToken");
        expect(previousSibling).toBe(production.colonToken);
    });

    it("moveToPosition", () => {
        const { sourceFile, navigator } = getNavigator();
        const moved = navigator.moveToPosition({ line: 14, character: 9 });
        expect(moved).toEqual(true);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Identifier);
        expect(navigator.getName()).toStrictEqual("name");
        const production = <Production>sourceFile.elements[2];
        const list = <RightHandSideList>production.body;
        const rhs = <RightHandSide>(list.elements && list.elements[0]);
        const symbol = <Nonterminal>rhs.head!.symbol;
        expect(navigator.getNode()).toStrictEqual(symbol.name);
    });

    it("moveToFirstToken", () => {
        const { sourceFile, navigator } = getNavigator();
        expect(navigator.moveToFirstToken()).toEqual(true);
        expect(navigator.isToken()).toStrictEqual(true);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Identifier);
        expect(navigator.getNode()).toStrictEqual((sourceFile.elements[0] as Production).name);
    });

    it("moveToLastToken", () => {
        const { sourceFile, navigator } = getNavigator();
        expect(navigator.moveToLastToken()).toEqual(true);
        expect(navigator.isToken()).toStrictEqual(true);
        expect(navigator.getKind()).toStrictEqual(SyntaxKind.Identifier);
        expect(navigator.getNode().end === sourceFile.end)
    });

    it("moveToNextToken", () => {
        const { navigator } = getNavigator();
        expect(navigator.moveToFirstToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // SourceCharacter
        expect(navigator.getTextContent()).toBe("SourceCharacter");
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.ColonColonToken);   // ::
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.GreaterThanToken);  // >
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.ProseFull);         // any Unicode code point
        expect(navigator.getTextContent()).toBe("any Unicode code point");
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // InputElementDiv
        expect(navigator.getTextContent()).toBe("InputElementDiv");
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.ColonColonToken);   // ::
        expect(navigator.moveToNextToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // WhiteSpace
        expect(navigator.getTextContent()).toBe("WhiteSpace");
    });

    it("moveToPreviousToken", () => {
        const { navigator } = getNavigator();
        expect(navigator.moveToLastToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // IdentifierName
        expect(navigator.getTextContent()).toBe("IdentifierName");
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Terminal);          // `as`
        expect(navigator.getTextContent()).toBe("as");
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // IdentifierName
        expect(navigator.getTextContent()).toBe("IdentifierName");
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // IdentifierName
        expect(navigator.getTextContent()).toBe("IdentifierName");
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.ColonToken);        // :
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // ExportSpecifier
        expect(navigator.getTextContent()).toBe("ExportSpecifier");
        expect(navigator.moveToPreviousToken()).toBe(true);
        expect(navigator.getKind()).toBe(SyntaxKind.Identifier);        // RegularExpressionLiteral
        expect(navigator.getTextContent()).toBe("RegularExpressionLiteral");
    });
});