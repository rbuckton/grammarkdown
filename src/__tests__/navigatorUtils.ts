import "./matchers";
import { NodeNavigator } from "../navigator";
import { SyntaxKind } from "../tokens";

export function makeExpectToken(navigator: NodeNavigator) {
    return { firstToken, lastToken, nextToken, prevToken, bof, eof };

    function firstToken(kind?: SyntaxKind, text?: string) {
        try {
            expect(navigator.moveToFirstToken()).toBe(true);
            expectTokenRest(kind, text);
        }
        catch (e: any) {
            Error.captureStackTrace(e, firstToken);
            throw e;
        }
    }

    function lastToken(kind?: SyntaxKind, text?: string) {
        try {
            expect(navigator.moveToLastToken()).toBe(true);
            expectTokenRest(kind, text);
        }
        catch (e: any) {
            Error.captureStackTrace(e, lastToken);
            throw e;
        }
    }

    function nextToken(kind?: SyntaxKind, text?: string) {
        try {
            expect(navigator.moveToNextToken()).toBe(true);
            expectTokenRest(kind, text);
        }
        catch (e: any) {
            Error.captureStackTrace(e, nextToken);
            throw e;
        }
    }

    function prevToken(kind?: SyntaxKind, text?: string) {
        try {
            expect(navigator.moveToPreviousToken()).toBe(true);
            expectTokenRest(kind, text);
        }
        catch (e: any) {
            Error.captureStackTrace(e, prevToken);
            throw e;
        }
    }

    function bof() {
        try {
            expect(navigator.moveToPreviousToken()).toBe(false);
        }
        catch (e: any) {
            Error.captureStackTrace(e, bof);
            throw e;
        }
    }

    function eof() {
        try {
            expect(navigator.moveToNextToken()).toBe(false);
        }
        catch (e: any) {
            Error.captureStackTrace(e, eof);
            throw e;
        }
    }

    function expectTokenRest(kind?: SyntaxKind, text?: string) {
        if (kind !== undefined) expect(navigator.getKind()).toBeSyntaxKind(kind);
        if (text !== undefined) expect(navigator.getTextContent()).toBe(text);
    }
}