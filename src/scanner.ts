/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CharacterCodes, SyntaxKind, stringToToken, isProseFragmentLiteralKind } from "./tokens";
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { HtmlTrivia, HtmlCloseTagTrivia, HtmlOpenTagTrivia, SingleLineCommentTrivia, MultiLineCommentTrivia, CommentTrivia } from './nodes';
import { CancelToken } from '@esfx/async-canceltoken';
import { Cancelable } from '@esfx/cancelable';
import { toCancelToken } from './core';

const enum TokenFlags {
    None = 0,
    Unterminated = 1 << 0,
    LineContinuation = 1 << 1,
    PrecedingLineTerminator = 1 << 2,
    PrecedingBlankLine = 1 << 3,
    PrecedingIndent = 1 << 4,
    PrecedingDedent = 1 << 5,
    PrecedingNonWhitespaceTrivia = 1 << 6,
    AnyPrecedingIndent = PrecedingIndent | PrecedingDedent,
}

/** {@docCategory Parse} */
export class Scanner {
    public readonly text: string;
    public readonly filename: string;
    private readonly cancelToken?: CancelToken;
    private readonly len: number = 0;
    private pos: number = 0;
    private startPos: number = 0;
    private tokenPos: number = 0;
    private token: SyntaxKind = SyntaxKind.Unknown;
    private tokenValue: string = "";
    private tokenFlags: TokenFlags = TokenFlags.None;
    private htmlTrivia: HtmlTrivia[] | undefined;
    private diagnostics: DiagnosticMessages;
    private insignificantIndentLength: number = 0;
    private significantIndentLength: number = 0;
    private currentIndentLength: number = 0;
    private proseStartToken: SyntaxKind | undefined;

    constructor(filename: string, text: string, diagnostics: DiagnosticMessages, cancelable?: Cancelable) {
        this.filename = filename;
        this.text = text;
        this.len = text.length;
        this.diagnostics = diagnostics;
        this.cancelToken = toCancelToken(cancelable);
    }

    public getPos(): number {
        return this.pos;
    }

    public getLen(): number {
        return this.len;
    }

    public getStartPos(): number {
        return this.startPos;
    }

    public getTokenPos(): number {
        return this.tokenPos;
    }

    public getToken(): SyntaxKind {
        return this.token;
    }

    public getTokenText(): string {
        return this.text.slice(this.tokenPos, this.pos);
    }

    public getTokenValue(): string {
        return this.tokenValue;
    }

    public getTokenIsUnterminated() {
        return (this.tokenFlags & TokenFlags.Unterminated) === TokenFlags.Unterminated;
    }

    public getDiagnostics(): DiagnosticMessages {
        return this.diagnostics;
    }

    public getHtmlTrivia() {
        return this.htmlTrivia;
    }

    public isIndented() {
        return this.significantIndentLength > 0;
    }

    public isLineContinuation() {
        return (this.tokenFlags & TokenFlags.LineContinuation) === TokenFlags.LineContinuation;
    }

    public hasPrecedingIndent() {
        return (this.tokenFlags & TokenFlags.AnyPrecedingIndent) === TokenFlags.PrecedingIndent;
    }

    public hasPrecedingDedent() {
        return (this.tokenFlags & TokenFlags.AnyPrecedingIndent) === TokenFlags.PrecedingDedent;
    }

    public hasPrecedingNewLine() {
        return this.hasPrecedingLineTerminator() && !this.isLineContinuation();
    }

    public hasPrecedingLineTerminator() {
        return (this.tokenFlags & TokenFlags.PrecedingLineTerminator) === TokenFlags.PrecedingLineTerminator;
    }

    public hasPrecedingBlankLine() {
        return (this.tokenFlags & TokenFlags.PrecedingBlankLine) === TokenFlags.PrecedingBlankLine;
    }

    private hasPrecedingNonWhitspaceTrivia() {
        return (this.tokenFlags & TokenFlags.PrecedingNonWhitespaceTrivia) === TokenFlags.PrecedingNonWhitespaceTrivia;
    }

    private isStartOfFile() {
        return this.startPos === 0;
    }

    private setTokenAsUnterminated() {
        this.tokenFlags |= TokenFlags.Unterminated;
    }

    private setHasPrecedingLineTerminator() {
        this.tokenFlags |= TokenFlags.PrecedingLineTerminator;
        this.currentIndentLength = 0;
    }

    private setHasPrecedingBlankLine() {
        this.tokenFlags |= TokenFlags.PrecedingBlankLine;
        if (this.significantIndentLength > 0) {
            this.setHasPrecedingDedent();
        }
        this.insignificantIndentLength = 0;
        this.significantIndentLength = 0;
        this.currentIndentLength = 0;
    }

    private setHasPrecedingIndent() {
        this.tokenFlags = this.tokenFlags & ~TokenFlags.PrecedingDedent | TokenFlags.PrecedingIndent;
    }

    private setHasPrecedingDedent() {
        this.tokenFlags = this.tokenFlags & ~TokenFlags.PrecedingIndent | TokenFlags.PrecedingDedent;
    }

    private setIsLineContinuation() {
        this.tokenFlags |= TokenFlags.LineContinuation;
    }

    private setHasPrecedingNonWhitspaceTrivia() {
        this.tokenFlags |= TokenFlags.PrecedingNonWhitespaceTrivia;
    }

    private resetHasPrecedingNonWhitspaceTrivia() {
        this.tokenFlags &= ~TokenFlags.PrecedingNonWhitespaceTrivia;
    }

    public resetIndent() {
        this.insignificantIndentLength = this.currentIndentLength;
        this.significantIndentLength = 0;
        this.tokenFlags &= ~(TokenFlags.PrecedingIndent | TokenFlags.PrecedingDedent | TokenFlags.LineContinuation);
    }

    public speculate<T>(callback: () => T, isLookahead: boolean): T {
        const savePos = this.pos;
        const saveStartPos = this.startPos;
        const saveTokenPos = this.tokenPos;
        const saveToken = this.token;
        const saveTokenValue = this.tokenValue;
        const saveTokenFlags = this.tokenFlags;
        const saveHtmlTrivia = this.htmlTrivia;
        const saveDiagnostics = this.diagnostics;
        const saveInitialIndentLength = this.insignificantIndentLength;
        const saveSignificantIndentLength = this.significantIndentLength;
        const saveCurrentIndentLength = this.currentIndentLength;

        this.diagnostics = NullDiagnosticMessages.instance;
        const result = callback();
        this.diagnostics = saveDiagnostics;
        if (!result || isLookahead) {
            this.pos = savePos;
            this.startPos = saveStartPos;
            this.tokenPos = saveTokenPos;
            this.token = saveToken;
            this.tokenValue = saveTokenValue;
            this.tokenFlags = saveTokenFlags;
            this.htmlTrivia = saveHtmlTrivia;
            this.insignificantIndentLength = saveInitialIndentLength;
            this.significantIndentLength = saveSignificantIndentLength;
            this.currentIndentLength = saveCurrentIndentLength;
        }
        return result;
    }

    public scan(): SyntaxKind {
        this.cancelToken?.throwIfSignaled();
        this.startPos = this.pos;
        this.tokenValue = "";
        this.tokenFlags = 0;
        this.htmlTrivia = undefined;
        while (true) {
            this.tokenPos = this.pos;
            if (this.pos >= this.len) {
                if (this.significantIndentLength > 0) {
                    this.setHasPrecedingDedent();
                }

                this.insignificantIndentLength = 0;
                this.significantIndentLength = 0;
                this.currentIndentLength = 0;
                return this.token = SyntaxKind.EndOfFileToken;
            }

            if (this.proseStartToken) {
                return this.token = this.scanProse();
            }

            let ch = this.text.charCodeAt(this.pos++);

            // scan trivia
            switch (ch) {
                case CharacterCodes.LineFeed:
                case CharacterCodes.CarriageReturn:
                    // newline trivia
                    if (ch === CharacterCodes.CarriageReturn && this.text.charCodeAt(this.pos) === CharacterCodes.LineFeed) {
                        this.pos++;
                    }

                    if (this.hasPrecedingLineTerminator() && !this.hasPrecedingNonWhitspaceTrivia() && !this.hasPrecedingBlankLine()) {
                        this.setHasPrecedingBlankLine();
                    }

                    this.resetHasPrecedingNonWhitspaceTrivia();
                    this.setHasPrecedingLineTerminator();
                    continue;

                case CharacterCodes.Space:
                case CharacterCodes.Tab:
                    // significant whitespace trivia
                    if (this.hasPrecedingLineTerminator()) this.currentIndentLength++;
                    continue;

                case CharacterCodes.VerticalTab:
                case CharacterCodes.FormFeed:
                    // whitspace trivia
                    continue;

                case CharacterCodes.LessThan: {
                    // html trivia
                    const ch = this.text.charCodeAt(this.pos);
                    if (isHtmlTagNameStart(ch) || ch === CharacterCodes.Slash || ch === CharacterCodes.GreaterThan) {
                        this.setHasPrecedingNonWhitspaceTrivia();
                        this.scanHtmlTrivia();
                        continue;
                    }
                    break;
                }

                case CharacterCodes.Slash:
                    // comment trivia
                    switch (this.text.charCodeAt(this.pos)) {
                        case CharacterCodes.Slash:
                            // single-line comment
                            this.pos++;
                            while (this.pos < this.len) {
                                if (isLineTerminator(this.text.charCodeAt(this.pos))) {
                                    break;
                                }
                                this.pos++;
                            }
                            this.setHasPrecedingNonWhitspaceTrivia();
                            continue;

                        case CharacterCodes.Asterisk:
                            // multi-line comment
                            this.pos++;
                            let commentClosed = false;
                            while (this.pos < this.len) {
                                if (this.text.charCodeAt(this.pos) === CharacterCodes.Asterisk &&
                                    this.text.charCodeAt(this.pos + 1) === CharacterCodes.Slash) {
                                    this.pos += 2;
                                    commentClosed = true;
                                    break;
                                }
                                this.pos++;
                            }
                            if (!commentClosed) {
                                this.getDiagnostics().report(this.pos, Diagnostics._0_expected, "*/");
                            }
                            this.setHasPrecedingNonWhitspaceTrivia();
                            continue;
                    }
                    break;
            }

            // check for changes in indentation
            if (this.isStartOfFile() || this.hasPrecedingLineTerminator()) {
                if (this.isStartOfFile() || this.hasPrecedingBlankLine()) {
                    this.insignificantIndentLength = this.currentIndentLength;
                    this.significantIndentLength = 0;
                }
                else if (this.currentIndentLength <= this.insignificantIndentLength) {
                    if (this.significantIndentLength > 0) {
                        this.significantIndentLength = 0;
                        this.setHasPrecedingDedent();
                    }
                }
                else if (this.significantIndentLength === 0) {
                    this.significantIndentLength = this.currentIndentLength;
                    this.setHasPrecedingIndent();
                }
                else if (this.currentIndentLength > this.significantIndentLength) {
                    this.setIsLineContinuation();
                }
            }

            if (ch === CharacterCodes.Ampersand) {
                ch = this.scanCharacterEntity();
            }

            // scan token
            switch (ch) {
                case CharacterCodes.At:
                    return this.token = SyntaxKind.AtToken;

                case CharacterCodes.NumberSign:
                    return this.tokenValue = this.scanLine(), this.token = SyntaxKind.LinkReference;

                case CharacterCodes.DoubleQuote:
                case CharacterCodes.SingleQuote:
                    return this.tokenValue = this.scanString(ch, this.token = SyntaxKind.StringLiteral), this.token;

                case CharacterCodes.Backtick:
                    return this.tokenValue = this.scanString(ch, this.token = SyntaxKind.TerminalLiteral), this.token;

                case CharacterCodes.Bar:
                    return this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Identifier), this.token;

                case CharacterCodes.LessThan: {
                    const ch = this.text.charCodeAt(this.pos);
                    if (ch === CharacterCodes.Exclamation) {
                        return this.pos++, this.token = SyntaxKind.LessThanExclamationToken;
                    }
                    else if (ch === CharacterCodes.Minus) {
                        return this.pos++, this.token = SyntaxKind.LessThanMinusToken;
                    }
                    else {
                        return this.tokenValue = this.scanString(CharacterCodes.GreaterThan, this.token = SyntaxKind.UnicodeCharacterLiteral), this.token;
                    }
                }
                case CharacterCodes.NotEqualTo:
                    return this.token = SyntaxKind.NotEqualToToken;

                case CharacterCodes.ElementOf:
                    return this.token = SyntaxKind.ElementOfToken;

                case CharacterCodes.NotAnElementOf:
                    return this.token = SyntaxKind.NotAnElementOfToken;

                case CharacterCodes.GreaterThan:
                    return this.skipWhiteSpace(), this.proseStartToken = this.token = SyntaxKind.GreaterThanToken;

                case CharacterCodes.OpenParen:
                    return this.token = SyntaxKind.OpenParenToken;

                case CharacterCodes.CloseParen:
                    return this.token = SyntaxKind.CloseParenToken;

                case CharacterCodes.OpenBracket:
                    if (this.text.charCodeAt(this.pos) === CharacterCodes.GreaterThan) {
                        return this.pos++, this.skipWhiteSpace(), this.proseStartToken = this.token = SyntaxKind.OpenBracketGreaterThanToken;
                    }
                    else if (this.text.charCodeAt(this.pos) === CharacterCodes.Ampersand) {
                        const pos = this.pos++;
                        if (this.scanCharacterEntity() === CharacterCodes.GreaterThan) {
                            return this.skipWhiteSpace(), this.proseStartToken = this.token = SyntaxKind.OpenBracketGreaterThanToken;
                        }
                        this.pos = pos;
                    }
                    return this.token = SyntaxKind.OpenBracketToken;

                case CharacterCodes.CloseBracket:
                    return this.token = SyntaxKind.CloseBracketToken;

                case CharacterCodes.OpenBrace:
                    return this.token = SyntaxKind.OpenBraceToken;

                case CharacterCodes.CloseBrace:
                    return this.token = SyntaxKind.CloseBraceToken;

                case CharacterCodes.Plus:
                    return this.token = SyntaxKind.PlusToken;

                case CharacterCodes.Tilde:
                    return this.token = SyntaxKind.TildeToken;

                case CharacterCodes.Comma:
                    return this.token = SyntaxKind.CommaToken;

                case CharacterCodes.Colon:
                    if (this.text.charCodeAt(this.pos) === CharacterCodes.Colon) {
                        this.pos++;
                        if (this.text.charCodeAt(this.pos) === CharacterCodes.Colon) {
                            return this.pos++, this.token = SyntaxKind.ColonColonColonToken;
                        }

                        return this.token = SyntaxKind.ColonColonToken;
                    }

                    return this.token = SyntaxKind.ColonToken;

                case CharacterCodes.Question:
                    return this.token = SyntaxKind.QuestionToken;

                case CharacterCodes.Equals:
                    if (this.text.charCodeAt(this.pos) === CharacterCodes.Equals) {
                        return this.pos++, this.token = SyntaxKind.EqualsEqualsToken;
                    }

                    return this.token = SyntaxKind.EqualsToken;

                case CharacterCodes.Exclamation:
                    if (this.text.charCodeAt(this.pos) === CharacterCodes.Equals) {
                        return this.pos++, this.token = SyntaxKind.ExclamationEqualsToken;
                    }

                    return this.token = SyntaxKind.Unknown;

                case CharacterCodes.Number0:
                case CharacterCodes.Number1:
                case CharacterCodes.Number2:
                case CharacterCodes.Number3:
                case CharacterCodes.Number4:
                case CharacterCodes.Number5:
                case CharacterCodes.Number6:
                case CharacterCodes.Number7:
                case CharacterCodes.Number8:
                case CharacterCodes.Number9:
                    return this.tokenValue = this.scanNumber(), this.token = SyntaxKind.NumberLiteral;

                case CharacterCodes.UpperU:
                case CharacterCodes.LowerU:
                    if (this.pos + 4 < this.len
                        && this.text.charCodeAt(this.pos) === CharacterCodes.Plus
                        && isHexDigit(this.text.charCodeAt(this.pos + 1))
                        && isHexDigit(this.text.charCodeAt(this.pos + 2))
                        && isHexDigit(this.text.charCodeAt(this.pos + 3))
                        && isHexDigit(this.text.charCodeAt(this.pos + 4))) {
                        return this.tokenValue = this.text.substr(this.tokenPos, 6), this.pos += 5, this.token = SyntaxKind.UnicodeCharacterLiteral;
                    }

                // fall-through

                default:
                    if (isIdentifierStart(ch)) {
                        while (isIdentifierPart(this.text.charCodeAt(this.pos))) {
                            this.pos++;
                        }

                        this.tokenValue = this.text.substring(this.tokenPos, this.pos);
                        return this.token = this.getIdentifierToken();
                    }

                    this.getDiagnostics().report(this.pos, Diagnostics.Invalid_character);
                    return this.token = SyntaxKind.Unknown;
            }
        }
    }

    public scanRange<T>(pos: number, cb: () => T) {
        if (pos < 0) throw new RangeError();
        pos = Math.min(pos, this.len);
        return this.speculate(() => {
            // if pos - 1 is whitespace, walk back the whitespace to rescan indentation
            if (pos > 0 && pos < this.len) {
                let start = pos - 1;
                while (isWhiteSpace(this.text.charCodeAt(start))) {
                    start--;
                }
                if (isLineTerminator(this.text.charCodeAt(start))) {
                    pos = start + 1;
                }
            }
            this.pos = pos;
            this.startPos = pos;
            this.tokenPos = pos;
            this.tokenValue = "";
            this.tokenFlags = 0;
            this.htmlTrivia = undefined;
            this.insignificantIndentLength = 0;
            this.significantIndentLength = 0;
            this.currentIndentLength = 0;
            return cb();
        }, /*isLookahead*/ true);
    }

    private scanLine(): string {
        const start = this.pos;
        while (this.pos < this.len) {
            const ch = this.text.charCodeAt(this.pos);
            if (isLineTerminator(ch)) {
                break;
            }

            this.pos++;
        }

        return this.text.substring(start, this.pos);
    }

    private skipLineTerminator() {
        const ch = this.text.charCodeAt(this.pos);
        if (ch === CharacterCodes.CarriageReturn || ch === CharacterCodes.LineFeed) {
            if (ch === CharacterCodes.CarriageReturn && this.text.charCodeAt(this.pos + 1) === CharacterCodes.LineFeed) {
                this.pos += 2;
            }
            else {
                this.pos++;
            }
        }
    }

    private skipWhiteSpace(): void {
        while (true) {
            const ch = this.text.charCodeAt(this.pos);
            switch (ch) {
                case CharacterCodes.Space:
                case CharacterCodes.Tab:
                case CharacterCodes.VerticalTab:
                case CharacterCodes.FormFeed:
                    this.pos++;
                    continue;

                default:
                    return;
            }
        }
    }

    private scanProse() {
        const previousToken = this.token;
        const isMultiLine = this.proseStartToken === SyntaxKind.GreaterThanToken;
        const atStartOfProse = previousToken === this.proseStartToken;
        const previousTokenWasFragment = isProseFragmentLiteralKind(previousToken);

        let start = this.pos;
        let tokenValue: string = "";
        while (true) {
            if (this.pos >= this.len) {
                tokenValue += this.text.substring(start, this.pos);
                this.tokenValue = tokenValue;
                this.proseStartToken = undefined;
                if (!isMultiLine) {
                    this.setTokenAsUnterminated();
                    this.getDiagnostics().report(this.pos, Diagnostics._0_expected, "]");
                }
                return atStartOfProse ? SyntaxKind.ProseFull : SyntaxKind.ProseTail;
            }

            const ch = this.text.charCodeAt(this.pos);
            if (previousTokenWasFragment) {
                if (ch === CharacterCodes.Backtick) {
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.TerminalLiteral), this.token;
                }
                else if (ch === CharacterCodes.Bar) {
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Identifier), this.token;
                }
            }

            if (isMultiLine) {
                if (isLineTerminator(ch)) {
                    tokenValue += this.text.substring(start, this.pos);
                    if (this.nextLineIsProse()) {
                        tokenValue += "\n";
                        continue;
                    }

                    this.tokenValue = tokenValue;
                    this.proseStartToken = undefined;
                    return atStartOfProse ? SyntaxKind.ProseFull : SyntaxKind.ProseTail;
                }
            }
            else {
                if (ch === CharacterCodes.CloseBracket) {
                    tokenValue += this.text.substring(start, this.pos);
                    this.tokenValue = tokenValue;
                    this.proseStartToken = undefined;
                    return atStartOfProse ? SyntaxKind.ProseFull : SyntaxKind.ProseTail;
                }
            }

            if (ch === CharacterCodes.Backtick || ch === CharacterCodes.Bar) {
                tokenValue += this.text.substring(start, this.pos);
                this.tokenValue = tokenValue;
                return atStartOfProse ? SyntaxKind.ProseHead : SyntaxKind.ProseMiddle;
            }

            if (ch === CharacterCodes.Ampersand) {
                tokenValue += this.text.substring(start, this.pos);
                this.pos++;
                tokenValue += String.fromCharCode(this.scanCharacterEntity());
                start = this.pos;
                continue;
            }

            this.pos++;
        }
    }

    private nextLineIsProse() {
        return this.speculate(() => {
            this.skipLineTerminator();
            this.skipWhiteSpace();
            if (this.pos < this.len) {
                if (this.text.charCodeAt(this.pos) === CharacterCodes.GreaterThan) {
                    this.pos++;
                    this.skipWhiteSpace();
                    return true;
                }
            }
            return false;
        }, /*isLookahead*/ false);
    }

    private scanHtmlTrivia() {
        const closingTag = this.text.charCodeAt(this.pos) === CharacterCodes.Slash;
        const triviaEnd = findHtmlTriviaEnd(this.text, this.pos, this.text.length);
        const tagNamePos = closingTag ? this.pos + 1 : this.pos;
        const tagNameEnd = findHtmlTriviaEnd(this.text, tagNamePos, triviaEnd);
        if (tagNameEnd !== -1) {
            const tagName = this.text.slice(tagNamePos, tagNameEnd);
            const tag = closingTag ? new HtmlCloseTagTrivia(tagName) : new HtmlOpenTagTrivia(tagName);
            tag.pos = this.tokenPos;
            tag.end = triviaEnd;
            if (!this.htmlTrivia) this.htmlTrivia = [];
            this.htmlTrivia.push(tag);
        }
        this.pos = triviaEnd;
    }

    private scanCharacter(decodeEntity: boolean) {
        let ch = this.text.charCodeAt(this.pos);
        this.pos++;
        if (decodeEntity && ch === CharacterCodes.Ampersand) {
            ch = this.scanCharacterEntity();
        }
        return ch;
    }

    private scanCharacterEntity() {
        let value = 0;
        let start: number;
        let pos: number;
        if (this.text.charCodeAt(this.pos) === CharacterCodes.Hash) {
            const hex = this.text.charCodeAt(this.pos + 1) === CharacterCodes.LowerX ||
                this.text.charCodeAt(this.pos + 1) === CharacterCodes.UpperX;
            start = this.pos + (hex ? 2 : 1);
            pos = start;
            while (pos < this.len) {
                const digit = hex ? this.hexDigitAt(pos) : this.decimalDigitAt(pos);
                if (digit === -1) break;
                value = value * (hex ? 16 : 10) + digit;
                pos++;
            }
        }
        else {
            start = pos = this.pos;
            while (pos < this.len) {
                if (!isAlphaNum(this.text.charCodeAt(pos))) break;
                pos++;
            }
            const entity = this.text.slice(start, pos);
            if (htmlCharacterEntities.hasOwnProperty(entity)) {
                value = htmlCharacterEntities[entity];
            }
        }
        if (pos > start && this.text.charCodeAt(pos) === CharacterCodes.Semicolon) {
            this.pos = pos + 1;
            return value;
        }
        return CharacterCodes.Ampersand;
    }

    private scanString(quote: number, kind: SyntaxKind.StringLiteral | SyntaxKind.TerminalLiteral | SyntaxKind.Identifier | SyntaxKind.UnicodeCharacterLiteral): string {
        const diagnostic = kind === SyntaxKind.Identifier ? Diagnostics.Unterminated_identifier_literal : Diagnostics.Unterminated_string_literal;
        const decodeEscapeSequences = kind !== SyntaxKind.TerminalLiteral;

        let result = "";
        let start = this.pos;
        while (true) {
            if (this.pos >= this.len) {
                result += this.text.slice(start, this.pos);
                this.setTokenAsUnterminated();
                this.getDiagnostics().report(this.pos, diagnostic || Diagnostics.Unterminated_string_literal);
                break;
            }

            const lastPos = this.pos;
            let ch = this.scanCharacter(decodeEscapeSequences);
            if (this.pos > lastPos + 1) {
                // Reference-decoded characters span multiple indexes, breaking naive assumptions.
                // Read in everything preceding the reference, and set the new position to the
                // index following it.
                result += this.text.slice(start, lastPos);
                start = this.pos;
            }

            if (ch === quote) {
                // If this is a terminal consisting solely of one backtick character (e.g. ```),
                // we capture the backtick.
                if (quote === CharacterCodes.Backtick && result === "" && this.pos < this.len) {
                    const peekPos = this.pos;

                    ch = this.scanCharacter(decodeEscapeSequences);
                    if (ch === CharacterCodes.Backtick) {
                        result = "`";
                        break;
                    }

                    this.pos = peekPos;
                }

                result += this.text.slice(start, this.pos - 1);
                break;
            }
            else if (decodeEscapeSequences && ch === CharacterCodes.Backslash) {
                // terminals cannot have escape sequences
                result += this.text.slice(start, this.pos - 1);
                result += this.scanEscapeSequence();
                start = this.pos;
                continue;
            }
            else if (isLineTerminator(ch)) {
                this.pos--;
                result += this.text.slice(start, this.pos);
                this.setTokenAsUnterminated();
                this.getDiagnostics().report(this.pos, diagnostic || Diagnostics.Unterminated_string_literal);
                break;
            }
        }

        return result;
    }

    private scanEscapeSequence(): string {
        const start = this.pos;
        if (this.pos >= this.len) {
            this.getDiagnostics().report(start, Diagnostics.Invalid_escape_sequence);
            return "";
        }

        let ch = this.text.charCodeAt(this.pos++);
        switch (ch) {
            case CharacterCodes.Number0:
                return "\0";

            case CharacterCodes.LowerB:
                return "\b";

            case CharacterCodes.LowerT:
                return "\t";

            case CharacterCodes.LowerN:
                return "\n";

            case CharacterCodes.LowerV:
                return "\v";

            case CharacterCodes.LowerF:
                return "\f";

            case CharacterCodes.LowerR:
                return "\r";

            case CharacterCodes.SingleQuote:
                return "\'";

            case CharacterCodes.DoubleQuote:
                return "\"";

            case CharacterCodes.LowerX:
            case CharacterCodes.LowerU:
                ch = this.scanHexDigits(ch === CharacterCodes.LowerX ? 2 : 4, /*mustMatchCount*/ true);
                if (ch >= 0) {
                    return String.fromCharCode(ch);
                }
                else {
                    this.getDiagnostics().report(start, Diagnostics.Invalid_escape_sequence);
                    return "";
                }

            // when encountering a LineContinuation (i.e. a backslash and a line terminator sequence),
            // the line terminator is interpreted to be "the empty code unit sequence".
            case CharacterCodes.CarriageReturn:
                if (this.pos < this.len && this.text.charCodeAt(this.pos) === CharacterCodes.LineFeed) {
                    this.pos++;
                }

            // fall through

            case CharacterCodes.LineFeed:
            case CharacterCodes.LineSeparator:
            case CharacterCodes.ParagraphSeparator:
                return ""

            default:
                return String.fromCharCode(ch);
        }
    }

    private decimalDigitAt(pos: number) {
        const ch = this.text.charCodeAt(pos);
        if (ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9) {
            return ch - CharacterCodes.Number0;
        }
        return -1;
    }

    private hexDigitAt(pos: number) {
        const ch = this.text.charCodeAt(pos);
        if (ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9) {
            return ch - CharacterCodes.Number0;
        }
        else if (ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperF) {
            return ch - CharacterCodes.UpperA + 10;
        }
        else if (ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerF) {
            return ch - CharacterCodes.LowerA + 10;
        }
        return -1;
    }

    private scanHexDigits(count: number, mustMatchCount?: boolean): number {
        let digits = 0;
        let value = 0;
        while (digits < count || !mustMatchCount) {
            const digit = this.hexDigitAt(this.pos);
            if (digit === -1) break;
            value = value * 16 + digit;
            this.pos++;
            digits++;
        }
        if (digits < count) {
            value = -1;
        }
        return value;
    }

    private scanNumber(): string {
        while (isDecimalDigit(this.text.charCodeAt(this.pos))) {
            this.pos++;
        }

        if (this.text.charCodeAt(this.pos) === CharacterCodes.Dot) {
            this.pos++;
            while (isDecimalDigit(this.text.charCodeAt(this.pos))) {
                this.pos++;
            }
        }

        let end = this.pos;
        if (this.text.charCodeAt(this.pos) === CharacterCodes.UpperE || this.text.charCodeAt(this.pos) === CharacterCodes.LowerE) {
            this.pos++;
            if (this.text.charCodeAt(this.pos) === CharacterCodes.Plus || this.text.charCodeAt(this.pos) === CharacterCodes.Minus) {
                this.pos++;
            }

            if (isDecimalDigit(this.text.charCodeAt(this.pos))) {
                this.pos++;
                while (isDecimalDigit(this.text.charCodeAt(this.pos))) {
                    this.pos++;
                }

                end = this.pos;
            }
            else {
                this.getDiagnostics().report(this.pos, Diagnostics.Digit_expected);
            }
        }

        return +(this.text.substring(this.tokenPos, end)) + "";
    }

    private getIdentifierToken(): SyntaxKind {
        const len = this.tokenValue.length;
        if (len >= 2 && len <= 9) {
            const ch = this.tokenValue.charCodeAt(0);
            if (ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerT) {
                const token = stringToToken(this.tokenValue);
                if (token !== undefined) {
                    return this.token = token;
                }
            }
        }

        return this.token = SyntaxKind.Identifier;
    }
}

function isLineTerminator(ch: number): boolean {
    return ch === CharacterCodes.CarriageReturn || ch === CharacterCodes.LineFeed;
}

function isWhiteSpace(ch: number) {
    switch (ch) {
        case CharacterCodes.Space:
        case CharacterCodes.Tab:
        case CharacterCodes.VerticalTab:
        case CharacterCodes.FormFeed:
            return true;
    }
    return false;
}

function isUpperAlpha(ch: number): boolean {
    return ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperZ;
}

function isLowerAlpha(ch: number): boolean {
    return ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerZ;
}

function isAlpha(ch: number): boolean {
    return isUpperAlpha(ch) || isLowerAlpha(ch);
}

function isDecimalDigit(ch: number): boolean {
    return ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9;
}

function isAlphaNum(ch: number): boolean {
    return isAlpha(ch) || isDecimalDigit(ch);
}

function isHexDigit(ch: number): boolean {
    return ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperF
        || ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerF
        || ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9;
}

function isIdentifierStart(ch: number): boolean {
    return isAlpha(ch)
        || ch === CharacterCodes.Underscore;
}

function isIdentifierPart(ch: number): boolean {
    return isAlphaNum(ch)
        || ch === CharacterCodes.Underscore;
}

function isHtmlTagNameStart(ch: number): boolean {
    return isLowerAlpha(ch);
}

function isHtmlTagNamePart(ch: number): boolean {
    return isIdentifierPart(ch)
        || ch === CharacterCodes.Minus;
}

function findHtmlTriviaEnd(text: string, pos: number, end: number) {
    while (pos < end) {
        const ch = text.charCodeAt(pos++);
        if (ch === CharacterCodes.GreaterThan) {
            return pos;
        }
    }
    return end;
}

function findHtmlTagNameEnd(text: string, pos: number, end: number) {
    if (pos < end && isHtmlTagNameStart(text.charCodeAt(pos))) {
        pos++;
        while (pos < end && isHtmlTagNamePart(text.charCodeAt(pos))) {
            pos++;
        }
        return pos;
    }
    return -1;
}

export function skipTrivia(text: string, pos: number, end: number, htmlTrivia?: HtmlTrivia[], commentTrivia?: CommentTrivia[]) {
    scan: while (pos < end) {
        const ch = text.charCodeAt(pos);
        switch (ch) {
            case CharacterCodes.CarriageReturn:
            case CharacterCodes.LineFeed:
            case CharacterCodes.Space:
            case CharacterCodes.Tab:
            case CharacterCodes.VerticalTab:
            case CharacterCodes.FormFeed:
                pos++;
                continue;
            case CharacterCodes.Slash:
                if (pos + 1 < end) {
                    switch (text.charCodeAt(pos + 1)) {
                        case CharacterCodes.Slash: {
                            const commentEnd = findSingleLineCommentTriviaEnd(text, pos + 2, end);
                            if (commentTrivia) {
                                const comment = new SingleLineCommentTrivia();
                                comment.pos = pos;
                                comment.end = commentEnd;
                                commentTrivia.push(comment);
                            }
                            pos = commentEnd;
                            continue;
                        }
                        case CharacterCodes.Asterisk: {
                            const commentEnd = findMultiLineCommentTriviaEnd(text, pos + 2, end);
                            if (commentTrivia) {
                                const comment = new MultiLineCommentTrivia();
                                comment.pos = pos;
                                comment.end = commentEnd;
                                commentTrivia.push(comment);
                            }
                            pos = commentEnd;
                            continue;
                        }
                    }
                }
                break scan;
            case CharacterCodes.LessThan:
                if (pos + 1 < end) {
                    const ch = text.charCodeAt(pos + 1);
                    if (ch === CharacterCodes.Slash || (ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerZ)) {
                        const triviaEnd = findHtmlTriviaEnd(text, pos + 1, end);
                        if (htmlTrivia) {
                            const tagNamePos = ch === CharacterCodes.Slash ? pos + 2 : pos + 1;
                            const tagNameEnd = findHtmlTagNameEnd(text, tagNamePos, triviaEnd);
                            if (tagNameEnd !== -1) {
                                const tagName = text.slice(tagNamePos, tagNameEnd);
                                const tag = ch === CharacterCodes.Slash ? new HtmlCloseTagTrivia(tagName) : new HtmlOpenTagTrivia(tagName);
                                tag.pos = pos;
                                tag.end = triviaEnd;
                                htmlTrivia.push(tag);
                            }
                        }
                        pos = triviaEnd;
                        continue;
                    }
                }
                break scan;
            default:
                break scan;
        }
    }
    return pos;
}

export function scanHtmlTrivia(text: string, pos: number, end: number): HtmlTrivia[] | undefined {
    const trivia: HtmlTrivia[] = [];
    skipTrivia(text, pos, end, trivia);
    return trivia.length > 0 ? trivia : undefined;
}

function findMultiLineCommentTriviaEnd(text: string, pos: number, end: number) {
    while (pos < end) {
        const ch = text.charCodeAt(pos);
        if (ch === CharacterCodes.Asterisk && pos + 1 < end && text.charCodeAt(pos + 1) === CharacterCodes.Slash) {
            return pos + 2;
        }
        pos++;
    }
    return end;
}

function findSingleLineCommentTriviaEnd(text: string, pos: number, end: number) {
    while (pos < end) {
        const ch = text.charCodeAt(pos);
        if (ch === CharacterCodes.CarriageReturn || ch === CharacterCodes.LineFeed) {
            return pos;
        }
        pos++;
    }
    return end;
}

const htmlCharacterEntities: Record<string, number> = {
    quot: 0x0022,
    amp: 0x0026,
    apos: 0x0027,
    lt: 0x003C,
    gt: 0x003E,
    nbsp: 0x00A0,
    iexcl: 0x00A1,
    cent: 0x00A2,
    pound: 0x00A3,
    curren: 0x00A4,
    yen: 0x00A5,
    brvbar: 0x00A6,
    sect: 0x00A7,
    uml: 0x00A8,
    copy: 0x00A9,
    ordf: 0x00AA,
    laquo: 0x00AB,
    not: 0x00AC,
    shy: 0x00AD,
    reg: 0x00AE,
    macr: 0x00AF,
    deg: 0x00B0,
    plusmn: 0x00B1,
    sup2: 0x00B2,
    sup3: 0x00B3,
    acute: 0x00B4,
    micro: 0x00B5,
    para: 0x00B6,
    middot: 0x00B7,
    cedil: 0x00B8,
    sup1: 0x00B9,
    ordm: 0x00BA,
    raquo: 0x00BB,
    frac14: 0x00BC,
    frac12: 0x00BD,
    frac34: 0x00BE,
    iquest: 0x00BF,
    Agrave: 0x00C0,
    Aacute: 0x00C1,
    Acirc: 0x00C2,
    Atilde: 0x00C3,
    Auml: 0x00C4,
    Aring: 0x00C5,
    AElig: 0x00C6,
    Ccedil: 0x00C7,
    Egrave: 0x00C8,
    Eacute: 0x00C9,
    Ecirc: 0x00CA,
    Euml: 0x00CB,
    Igrave: 0x00CC,
    Iacute: 0x00CD,
    Icirc: 0x00CE,
    Iuml: 0x00CF,
    ETH: 0x00D0,
    Ntilde: 0x00D1,
    Ograve: 0x00D2,
    Oacute: 0x00D3,
    Ocirc: 0x00D4,
    Otilde: 0x00D5,
    Ouml: 0x00D6,
    times: 0x00D7,
    Oslash: 0x00D8,
    Ugrave: 0x00D9,
    Uacute: 0x00DA,
    Ucirc: 0x00DB,
    Uuml: 0x00DC,
    Yacute: 0x00DD,
    THORN: 0x00DE,
    szlig: 0x00DF,
    agrave: 0x00E0,
    aacute: 0x00E1,
    acirc: 0x00E2,
    atilde: 0x00E3,
    auml: 0x00E4,
    aring: 0x00E5,
    aelig: 0x00E6,
    ccedil: 0x00E7,
    egrave: 0x00E8,
    eacute: 0x00E9,
    ecirc: 0x00EA,
    euml: 0x00EB,
    igrave: 0x00EC,
    iacute: 0x00ED,
    icirc: 0x00EE,
    iuml: 0x00EF,
    eth: 0x00F0,
    ntilde: 0x00F1,
    ograve: 0x00F2,
    oacute: 0x00F3,
    ocirc: 0x00F4,
    otilde: 0x00F5,
    ouml: 0x00F6,
    divide: 0x00F7,
    oslash: 0x00F8,
    ugrave: 0x00F9,
    uacute: 0x00FA,
    ucirc: 0x00FB,
    uuml: 0x00FC,
    yacute: 0x00FD,
    thorn: 0x00FE,
    yuml: 0x00FF,
    OElig: 0x0152,
    oelig: 0x0153,
    Scaron: 0x0160,
    scaron: 0x0161,
    Yuml: 0x0178,
    fnof: 0x0192,
    circ: 0x02C6,
    tilde: 0x02DC,
    Alpha: 0x0391,
    Beta: 0x0392,
    Gamma: 0x0393,
    Delta: 0x0394,
    Epsilon: 0x0395,
    Zeta: 0x0396,
    Eta: 0x0397,
    Theta: 0x0398,
    Iota: 0x0399,
    Kappa: 0x039A,
    Lambda: 0x039B,
    Mu: 0x039C,
    Nu: 0x039D,
    Xi: 0x039E,
    Omicron: 0x039F,
    Pi: 0x03A0,
    Rho: 0x03A1,
    Sigma: 0x03A3,
    Tau: 0x03A4,
    Upsilon: 0x03A5,
    Phi: 0x03A6,
    Chi: 0x03A7,
    Psi: 0x03A8,
    Omega: 0x03A9,
    alpha: 0x03B1,
    beta: 0x03B2,
    gamma: 0x03B3,
    delta: 0x03B4,
    epsilon: 0x03B5,
    zeta: 0x03B6,
    eta: 0x03B7,
    theta: 0x03B8,
    iota: 0x03B9,
    kappa: 0x03BA,
    lambda: 0x03BB,
    mu: 0x03BC,
    nu: 0x03BD,
    xi: 0x03BE,
    omicron: 0x03BF,
    pi: 0x03C0,
    rho: 0x03C1,
    sigmaf: 0x03C2,
    sigma: 0x03C3,
    tau: 0x03C4,
    upsilon: 0x03C5,
    phi: 0x03C6,
    chi: 0x03C7,
    psi: 0x03C8,
    omega: 0x03C9,
    thetasym: 0x03D1,
    upsih: 0x03D2,
    piv: 0x03D6,
    ensp: 0x2002,
    emsp: 0x2003,
    thinsp: 0x2009,
    zwnj: 0x200C,
    zwj: 0x200D,
    lrm: 0x200E,
    rlm: 0x200F,
    ndash: 0x2013,
    mdash: 0x2014,
    lsquo: 0x2018,
    rsquo: 0x2019,
    sbquo: 0x201A,
    ldquo: 0x201C,
    rdquo: 0x201D,
    bdquo: 0x201E,
    dagger: 0x2020,
    Dagger: 0x2021,
    bull: 0x2022,
    hellip: 0x2026,
    permil: 0x2030,
    prime: 0x2032,
    Prime: 0x2033,
    lsaquo: 0x2039,
    rsaquo: 0x203A,
    oline: 0x203E,
    frasl: 0x2044,
    euro: 0x20AC,
    image: 0x2111,
    weierp: 0x2118,
    real: 0x211C,
    trade: 0x2122,
    alefsym: 0x2135,
    larr: 0x2190,
    uarr: 0x2191,
    rarr: 0x2192,
    darr: 0x2193,
    harr: 0x2194,
    crarr: 0x21B5,
    lArr: 0x21D0,
    uArr: 0x21D1,
    rArr: 0x21D2,
    dArr: 0x21D3,
    hArr: 0x21D4,
    forall: 0x2200,
    part: 0x2202,
    exist: 0x2203,
    empty: 0x2205,
    nabla: 0x2207,
    isin: 0x2208,
    notin: 0x2209,
    ni: 0x220B,
    prod: 0x220F,
    sum: 0x2211,
    minus: 0x2212,
    lowast: 0x2217,
    radic: 0x221A,
    prop: 0x221D,
    infin: 0x221E,
    ang: 0x2220,
    and: 0x2227,
    or: 0x2228,
    cap: 0x2229,
    cup: 0x222A,
    int: 0x222B,
    there4: 0x2234,
    sim: 0x223C,
    cong: 0x2245,
    asymp: 0x2248,
    ne: 0x2260,
    equiv: 0x2261,
    le: 0x2264,
    ge: 0x2265,
    sub: 0x2282,
    sup: 0x2283,
    nsub: 0x2284,
    sube: 0x2286,
    supe: 0x2287,
    oplus: 0x2295,
    otimes: 0x2297,
    perp: 0x22A5,
    sdot: 0x22C5,
    lceil: 0x2308,
    rceil: 0x2309,
    lfloor: 0x230A,
    rfloor: 0x230B,
    lang: 0x2329,
    rang: 0x232A,
    loz: 0x25CA,
    spades: 0x2660,
    clubs: 0x2663,
    hearts: 0x2665,
    diams: 0x2666
};
