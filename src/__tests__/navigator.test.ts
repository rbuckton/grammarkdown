/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import "./matchers";
import { Production, RightHandSideList, RightHandSide, Nonterminal } from "../nodes";
import { Parser } from "../parser";
import { NodeNavigator } from "../navigator";
import { SyntaxKind } from "../tokens";
import { makeExpectToken } from "./navigatorUtils";

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

    describe("moveToTouchingToken", () => {
        it("at start", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 6, character: 1 })).toBe(true);
            expect(navigator.getKind()).toBeSyntaxKind(SyntaxKind.Identifier);
            expect(navigator.getTextContent()).toBe("WhiteSpace");
        });
        it("in leading trivia", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 6, character: 0 })).toBe(true);
            expect(navigator.getKind()).toBeSyntaxKind(SyntaxKind.ColonColonToken);
        });
        it("in middle", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 6, character: 5 })).toBe(true);
            expect(navigator.getKind()).toBeSyntaxKind(SyntaxKind.Identifier);
            expect(navigator.getTextContent()).toBe("WhiteSpace");
        });
        it("at end", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 6, character: 11 })).toBe(true);
            expect(navigator.getKind()).toBeSyntaxKind(SyntaxKind.Identifier);
            expect(navigator.getTextContent()).toBe("WhiteSpace");
        });
        it("at bof", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 0, character: 0 })).toBe(false);
        });
        it("at eof", () => {
            const { navigator } = getNavigator();
            expect(navigator.moveToTouchingToken({ line: 25, character: 36 })).toBe(true);
            expect(navigator.getKind()).toBeSyntaxKind(SyntaxKind.Identifier);
            expect(navigator.getTextContent()).toBe("IdentifierName");
        });
    });

    describe("moveToFirstToken", () => {
        it("when token in AST", () => {
            const { sourceFile, navigator, firstToken } = getNavigator();
            firstToken();
            expect(navigator.getNode()).toStrictEqual((sourceFile.elements[0] as Production).name);
        });
        it("when token not in AST", () => {
            const { navigator, firstToken } = getNavigator(",");
            firstToken();
            expect(navigator.getParent()).toBe(navigator.getRoot());
        });
        it("moves to first token in node", () => {
            const { navigator, firstToken } = getNavigator("A : B? C?");
            expect(navigator.moveToFirstChild(SyntaxKind.Production)).toBe(true);
            expect(navigator.moveToLastChild(SyntaxKind.RightHandSide)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.SymbolSpan)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.Nonterminal)).toBe(true);
            firstToken(SyntaxKind.Identifier, "B");
        });
    });

    describe("moveToLastToken", () => {
        it("when in ast", () => {
            const { sourceFile, navigator, lastToken } = getNavigator();
            lastToken(SyntaxKind.Identifier);
            expect(navigator.getNode().end === sourceFile.end)
        });
        it("when not in ast", () => {
            const { navigator, lastToken, bof } = getNavigator(",");
            lastToken(SyntaxKind.CommaToken);
            expect(navigator.getParent()).toBe(navigator.getRoot());
            bof();
        });
        it("moves to last token in node", () => {
            const { navigator, lastToken, prevToken } = getNavigator("A : B? C?");
            expect(navigator.moveToFirstChild(SyntaxKind.Production)).toBe(true);
            expect(navigator.moveToLastChild(SyntaxKind.RightHandSide)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.SymbolSpan)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.Nonterminal)).toBe(true);
            lastToken(SyntaxKind.QuestionToken);
            prevToken(SyntaxKind.Identifier, "B");
        });
    });

    describe("moveToNextToken", () => {
        it("when in ast", () => {
            const { firstToken, nextToken, eof } = getNavigator();
            firstToken(SyntaxKind.Identifier, "SourceCharacter");            // SourceCharacter
            nextToken(SyntaxKind.ColonColonToken);                           // ::
            nextToken(SyntaxKind.GreaterThanToken);                          // >
            nextToken(SyntaxKind.ProseFull, "any Unicode code point");       // any Unicode code point
            nextToken(SyntaxKind.Identifier, "InputElementDiv");             // InputElementDiv
            nextToken(SyntaxKind.ColonColonToken);                           // ::
            nextToken(SyntaxKind.Identifier, "WhiteSpace");                  // WhiteSpace
            nextToken(SyntaxKind.Identifier, "LineTerminator");              // LineTerminator
            nextToken(SyntaxKind.Identifier, "Comment");                     // Comment
            nextToken(SyntaxKind.Identifier, "CommonToken");                 // CommonToken
            nextToken(SyntaxKind.Identifier, "DivPunctuator");               // DivPunctuator
            nextToken(SyntaxKind.Identifier, "RightBracePunctuator");        // RightBracePunctuator
            nextToken(SyntaxKind.Identifier, "InputElementRegExp");          // InputElementRegExp
            nextToken(SyntaxKind.ColonColonToken);                           // ::
            nextToken(SyntaxKind.Identifier, "WhiteSpace");                  // WhiteSpace
            nextToken(SyntaxKind.Identifier, "LineTerminator");              // LineTerminator
            nextToken(SyntaxKind.Identifier, "Comment");                     // Comment
            nextToken(SyntaxKind.Identifier, "CommonToken");                 // CommonToken
            nextToken(SyntaxKind.Identifier, "RightBracePunctuator");        // RightBracePunctuator
            nextToken(SyntaxKind.Identifier, "RegularExpressionLiteral");    // RegularExpressionLiteral
            nextToken(SyntaxKind.Identifier, "ExportSpecifier");             // ExportSpecifier
            nextToken(SyntaxKind.ColonToken);                                // :
            nextToken(SyntaxKind.Identifier, "IdentifierName");              // IdentifierName
            nextToken(SyntaxKind.Identifier, "IdentifierName");              // IdentifierName
            nextToken(SyntaxKind.TerminalLiteral, "as");                     // `as`
            nextToken(SyntaxKind.Identifier, "IdentifierName");              // IdentifierName
            eof();
        });
        it("when not in ast", () => {
            const { navigator, firstToken, nextToken, eof } = getNavigator("A[B, C] : `a`");
            firstToken(SyntaxKind.Identifier, "A");
            nextToken(SyntaxKind.OpenBracketToken);                              // [
            nextToken(SyntaxKind.Identifier, "B");                               // B
            nextToken(SyntaxKind.CommaToken);                                    // ,
            expect(navigator.getParent()?.kind).toBe(SyntaxKind.Parameter);
            nextToken(SyntaxKind.Identifier, "C");                               // C
            nextToken(SyntaxKind.CloseBracketToken);                             // ]
            nextToken(SyntaxKind.ColonToken);                                    // :
            nextToken(SyntaxKind.TerminalLiteral);                               // `a`
            eof();
        });
        it("in one of symbol", () => {
            const { firstToken, nextToken, eof } = getNavigator("A :: B but not one of C or D");
            firstToken(SyntaxKind.Identifier, "A");
            nextToken(SyntaxKind.ColonColonToken);
            nextToken(SyntaxKind.Identifier);
            nextToken(SyntaxKind.ButKeyword);
            nextToken(SyntaxKind.NotKeyword);
            nextToken(SyntaxKind.OneKeyword);
            nextToken(SyntaxKind.OfKeyword);
            nextToken(SyntaxKind.Identifier, "C");
            nextToken(SyntaxKind.OrKeyword);
            nextToken(SyntaxKind.Identifier, "D");
            eof();
        });
        it("in InvalidAssertion", () => {
            const { firstToken, nextToken, eof } = getNavigator("A :: B [,@]");
            firstToken(SyntaxKind.Identifier, "A");
            nextToken(SyntaxKind.ColonColonToken);
            nextToken(SyntaxKind.Identifier, "B");
            nextToken(SyntaxKind.OpenBracketToken);
            nextToken(SyntaxKind.CommaToken);
            nextToken(SyntaxKind.AtToken);
            nextToken(SyntaxKind.CloseBracketToken);
            eof();
        });
        it("moves to next token following current node", () => {
            const { navigator, nextToken, eof } = getNavigator("A :: B? `c`");
            expect(navigator.moveToFirstChild(SyntaxKind.Production)).toBe(true);
            expect(navigator.moveToLastChild(SyntaxKind.RightHandSide)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.SymbolSpan)).toBe(true);
            expect(navigator.moveToFirstChild(SyntaxKind.Nonterminal)).toBe(true);
            nextToken(SyntaxKind.TerminalLiteral, "c");
            eof();
        });
    });

    describe("moveToPreviousToken", () => {
        it("when in ast", () => {
            const { lastToken, prevToken } = getNavigator();
            lastToken(SyntaxKind.Identifier, "IdentifierName");             // IdentifierName
            prevToken(SyntaxKind.TerminalLiteral, "as");                    // `as`
            prevToken(SyntaxKind.Identifier, "IdentifierName");             // IdentifierName
            prevToken(SyntaxKind.Identifier, "IdentifierName");             // IdentifierName
            prevToken(SyntaxKind.ColonToken);                               // :
            prevToken(SyntaxKind.Identifier, "ExportSpecifier");            // ExportSpecifier
            prevToken(SyntaxKind.Identifier, "RegularExpressionLiteral");   // RegularExpressionLiteral
        });
        it("when not in ast", () => {
            const { lastToken, prevToken, bof } = getNavigator("A[B, C] : `a`");
            lastToken(SyntaxKind.TerminalLiteral);
            prevToken(SyntaxKind.ColonToken);
            prevToken(SyntaxKind.CloseBracketToken);
            prevToken(SyntaxKind.Identifier);
            prevToken(SyntaxKind.CommaToken);
            prevToken(SyntaxKind.Identifier);
            prevToken(SyntaxKind.OpenBracketToken);
            prevToken(SyntaxKind.Identifier);
            bof();
        });
        it("moves to previous token preceding current node", () => {
            const { navigator, lastToken, prevToken } = getNavigator("A :: B? `c`");
            lastToken();
            expect(navigator.moveToAncestor(SyntaxKind.SymbolSpan)).toBe(true);
            prevToken(SyntaxKind.QuestionToken);
        });
    });

    function getNavigator(text = es6GrammarText) {
        const parser = new Parser();
        const sourceFile = parser.parseSourceFile("file.grammar", text);
        const navigator = new NodeNavigator(sourceFile);
        return { sourceFile, navigator, ...makeExpectToken(navigator) };
    }
});