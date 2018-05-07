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

import { EOL } from 'os';
import { CancellationToken } from "prex";
import { CharacterCodes, SyntaxKind, stringToToken } from "./tokens";
import { Diagnostics, DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { HtmlTrivia, HtmlCloseTagTrivia, HtmlOpenTagTrivia, SingleLineCommentTrivia, MultiLineCommentTrivia, HtmlTriviaBase, CommentTrivia } from './nodes';

const enum TokenFlags {
    None = 0,
    Unterminated = 1 << 0,
    PrecedingLineTerminator = 1 << 1,
    PrecedingIndent = 1 << 2,
    PrecedingDedent = 1 << 3,
    AnyPrecedingIndent = PrecedingIndent | PrecedingDedent,
}

export class Scanner {
    public readonly text: string;
    public readonly filename: string;
    private readonly cancellationToken: CancellationToken;
    private readonly len: number = 0;
    private pos: number = 0;
    private startPos: number = 0;
    private tokenPos: number = 0;
    private token: SyntaxKind = SyntaxKind.Unknown;
    private tokenValue: string = "";
    private tokenFlags: TokenFlags = TokenFlags.None;
    private htmlTrivia: HtmlTrivia[] | undefined;
    private diagnostics: DiagnosticMessages;
    private initialIndentLength: number = 0;
    private significantIndentLength: number = 0;
    private currentIndentLength: number = 0;
    private proseStartToken: SyntaxKind | undefined;

    constructor(filename: string, text: string, diagnostics: DiagnosticMessages, cancellationToken = CancellationToken.none) {
        this.filename = filename;
        this.text = text;
        this.len = text.length;
        this.diagnostics = diagnostics;
        this.cancellationToken = cancellationToken;
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
        return this.hasPrecedingLineTerminator()
            && this.isIndented()
            && this.currentIndentLength > this.significantIndentLength;
    }

    public hasPrecedingIndent() {
        return (this.tokenFlags & TokenFlags.AnyPrecedingIndent) === TokenFlags.PrecedingIndent;
    }

    public hasPrecedingDedent() {
        return (this.tokenFlags & TokenFlags.AnyPrecedingIndent) === TokenFlags.PrecedingDedent;
    }

    public hasPrecedingLineTerminator() {
        return (this.tokenFlags & TokenFlags.PrecedingLineTerminator) === TokenFlags.PrecedingLineTerminator;
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
        const saveInitialIndentLength = this.initialIndentLength;
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
            this.initialIndentLength = saveInitialIndentLength;
            this.significantIndentLength = saveSignificantIndentLength;
            this.currentIndentLength = saveCurrentIndentLength;
        }
        return result;
    }

    public scan(): SyntaxKind {
        this.cancellationToken.throwIfCancellationRequested();
        this.startPos = this.pos;
        this.tokenValue = "";
        this.tokenFlags = 0;
        this.htmlTrivia = undefined;
        while (true) {
            this.tokenPos = this.pos;
            if (this.pos >= this.len) {
                this.scanIndent();
                return this.token = SyntaxKind.EndOfFileToken;
            }

            if (this.proseStartToken) {
                return this.token = this.scanProse();
            }

            let ch = this.text.charCodeAt(this.pos);
            switch (ch) {
                case CharacterCodes.LineFeed:
                case CharacterCodes.CarriageReturn:
                    if (ch === CharacterCodes.CarriageReturn && this.text.charCodeAt(this.pos + 1) === CharacterCodes.LineFeed) {
                        this.pos += 2;
                    }
                    else {
                        this.pos++;
                    }

                    this.tokenFlags |= TokenFlags.PrecedingLineTerminator;
                    this.scanIndent();
                    continue;

                case CharacterCodes.Space:
                    if (this.pos === 0) {
                        this.scanIndent();
                        continue;
                    }

                case CharacterCodes.Tab:
                case CharacterCodes.VerticalTab:
                case CharacterCodes.FormFeed:
                    this.pos++;
                    continue;

                case CharacterCodes.At:
                    return this.pos++ , this.token = SyntaxKind.AtToken;

                case CharacterCodes.NumberSign:
                    return this.pos++ , this.tokenValue = this.scanLine(), this.token = SyntaxKind.LinkReference;

                case CharacterCodes.DoubleQuote:
                case CharacterCodes.SingleQuote:
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.StringLiteral), this.token;

                case CharacterCodes.Backtick:
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Terminal), this.token;

                case CharacterCodes.Bar:
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Identifier), this.token;

                case CharacterCodes.LessThan:
                    ch = this.text.charCodeAt(this.pos + 1);
                    if (ch === CharacterCodes.Exclamation) {
                        return this.pos += 2, this.token = SyntaxKind.LessThanExclamationToken;
                    }
                    else if (ch === CharacterCodes.Minus) {
                        return this.pos += 2, this.token = SyntaxKind.LessThanMinusToken;
                    }
                    else if ((ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerZ) || ch === CharacterCodes.Slash || ch === CharacterCodes.GreaterThan) {
                        this.scanHtmlTrivia();
                        break;
                    }
                    else {
                        return this.pos++ , this.tokenValue = this.scanString(CharacterCodes.GreaterThan, this.token = SyntaxKind.UnicodeCharacterLiteral), this.token;
                    }

                case CharacterCodes.NotEqualTo:
                    return this.pos++ , this.token = SyntaxKind.NotEqualToToken;

                case CharacterCodes.ElementOf:
                    return this.pos++ , this.token = SyntaxKind.ElementOfToken;

                case CharacterCodes.NotAnElementOf:
                    return this.pos++ , this.token = SyntaxKind.NotAnElementOfToken;

                case CharacterCodes.GreaterThan:
                    return this.pos++ , this.skipWhiteSpace(), this.proseStartToken = this.token = SyntaxKind.GreaterThanToken;

                case CharacterCodes.Slash:
                    if (this.pos + 1 < this.len) {
                        switch (this.text.charCodeAt(this.pos + 1)) {
                            case CharacterCodes.Slash:
                                this.pos += 2;
                                while (this.pos < this.len) {
                                    if (isLineTerminator(this.text.charCodeAt(this.pos))) {
                                        break;
                                    }

                                    this.pos++;
                                }

                                continue;

                            case CharacterCodes.Asterisk:
                                this.pos += 2;
                                let commentClosed = false;
                                while (this.pos < this.len) {
                                    ch = this.text.charCodeAt(this.pos);
                                    if (ch === CharacterCodes.Asterisk && this.text.charCodeAt(this.pos + 1) === CharacterCodes.Slash) {
                                        this.pos += 2;
                                        commentClosed = true;
                                        break;
                                    }

                                    this.pos++;
                                }

                                if (!commentClosed) {
                                    this.getDiagnostics().report(this.pos, Diagnostics._0_expected, "*/");
                                }

                                continue;

                            case CharacterCodes.CarriageReturn:
                                if (this.pos + 2 < this.len && this.text.charCodeAt(this.pos + 2) === CharacterCodes.LineFeed) {
                                    this.pos++;
                                }

                            // fall through

                            case CharacterCodes.LineFeed:
                            case CharacterCodes.LineSeparator:
                            case CharacterCodes.ParagraphSeparator:
                                this.pos += 2;
                                continue;
                        }
                    }

                    return this.pos++ , this.token = SyntaxKind.Unknown;

                case CharacterCodes.OpenParen:
                    return this.pos++ , this.token = SyntaxKind.OpenParenToken;

                case CharacterCodes.CloseParen:
                    return this.pos++ , this.token = SyntaxKind.CloseParenToken;

                case CharacterCodes.OpenBracket:
                    if (this.pos + 1 < this.len) {
                        ch = this.text.charCodeAt(this.pos + 1);
                        if (ch === CharacterCodes.GreaterThan) {
                            return this.pos += 2, this.skipWhiteSpace(), this.proseStartToken = this.token = SyntaxKind.OpenBracketGreaterThanToken;
                        }
                    }

                    return this.pos++ , this.token = SyntaxKind.OpenBracketToken;

                case CharacterCodes.CloseBracket:
                    return this.pos++ , this.token = SyntaxKind.CloseBracketToken;

                case CharacterCodes.OpenBrace:
                    return this.pos++ , this.token = SyntaxKind.OpenBraceToken;

                case CharacterCodes.CloseBrace:
                    return this.pos++ , this.token = SyntaxKind.CloseBraceToken;

                case CharacterCodes.Plus:
                    return this.pos++ , this.token = SyntaxKind.PlusToken;

                case CharacterCodes.Tilde:
                    return this.pos++ , this.token = SyntaxKind.TildeToken;

                case CharacterCodes.Comma:
                    return this.pos++ , this.token = SyntaxKind.CommaToken;

                case CharacterCodes.Colon:
                    if (this.pos + 1 < this.len) {
                        ch = this.text.charCodeAt(this.pos + 1);
                        if (ch === CharacterCodes.Colon) {
                            if (this.pos + 2 < this.len) {
                                ch = this.text.charCodeAt(this.pos + 2);
                                if (ch === CharacterCodes.Colon) {
                                    return this.pos += 3, this.token = SyntaxKind.ColonColonColonToken;
                                }
                            }

                            return this.pos += 2, this.token = SyntaxKind.ColonColonToken;
                        }
                    }

                    return this.pos++ , this.token = SyntaxKind.ColonToken;

                case CharacterCodes.Question:
                    return this.pos++ , this.token = SyntaxKind.QuestionToken;

                case CharacterCodes.Equals:
                    if (this.text.charCodeAt(this.pos + 1) === CharacterCodes.Equals) {
                        return this.pos += 2, this.token = SyntaxKind.EqualsEqualsToken;
                    }

                    return this.pos++ , this.token = SyntaxKind.EqualsToken;

                case CharacterCodes.Exclamation:
                    if (this.text.charCodeAt(this.pos + 1) === CharacterCodes.Equals) {
                        return this.pos += 2, this.token = SyntaxKind.ExclamationEqualsToken;
                    }

                    return this.pos++ , this.token = SyntaxKind.Unknown;

                case CharacterCodes.UpperU:
                case CharacterCodes.LowerU:
                    if (this.pos + 5 < this.len
                        && this.text.charCodeAt(this.pos + 1) === CharacterCodes.Plus
                        && isHexDigit(this.text.charCodeAt(this.pos + 2))
                        && isHexDigit(this.text.charCodeAt(this.pos + 3))
                        && isHexDigit(this.text.charCodeAt(this.pos + 4))
                        && isHexDigit(this.text.charCodeAt(this.pos + 5))) {
                        return this.tokenValue = this.text.substr(this.pos, 6), this.pos += 6, this.token = SyntaxKind.UnicodeCharacterLiteral;
                    }

                // fall-through

                default:
                    if (isIdentifierStart(ch)) {
                        this.pos++;
                        while (this.pos < this.len && isIdentifierPart(ch = this.text.charCodeAt(this.pos))) {
                            this.pos++;
                        }

                        this.tokenValue = this.text.substring(this.tokenPos, this.pos);
                        return this.token = this.getIdentifierToken();
                    }

                    this.getDiagnostics().report(this.pos, Diagnostics.Invalid_character);
                    return this.pos++ , this.token = SyntaxKind.Unknown;
            }
        }
    }

    private scanIndent(): void {
        if (this.pos >= this.len) {
            if (this.significantIndentLength > 0) {
                this.tokenFlags = this.tokenFlags & ~TokenFlags.AnyPrecedingIndent | TokenFlags.PrecedingDedent;
            }
            this.initialIndentLength = 0;
            this.significantIndentLength = 0;
            this.currentIndentLength = 0;
            return;
        }

        const indentPos = this.pos;
        let ch = this.text.charCodeAt(this.pos);
        while (ch === CharacterCodes.Space || ch === CharacterCodes.Tab) {
            this.pos++;
            ch = this.text.charCodeAt(this.pos);
        }

        if (isLineTerminator(ch)) return;

        this.currentIndentLength = this.pos - indentPos;
        if (this.startPos === 0) {
            this.initialIndentLength = this.currentIndentLength;
        }
        else if (this.currentIndentLength <= this.initialIndentLength) {
            if (this.significantIndentLength > 0) {
                this.significantIndentLength = 0;
                this.tokenFlags = this.tokenFlags & ~TokenFlags.PrecedingIndent | TokenFlags.PrecedingDedent;
            }
        }
        else if (this.significantIndentLength === 0) {
            this.significantIndentLength = this.currentIndentLength;
            this.tokenFlags = this.tokenFlags & ~TokenFlags.PrecedingDedent | TokenFlags.PrecedingIndent;
        }
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
        const previousTokenWasFragment = isProseFragment(previousToken);

        const start = this.pos;
        let tokenValue: string = "";
        while (true) {
            if (this.pos >= this.len) {
                tokenValue += this.text.substring(start, this.pos);
                this.tokenValue = tokenValue;
                this.proseStartToken = undefined;
                if (!isMultiLine) {
                    this.tokenFlags |= TokenFlags.Unterminated;
                    this.getDiagnostics().report(this.pos, Diagnostics._0_expected, "]");
                }
                return atStartOfProse ? SyntaxKind.ProseFull : SyntaxKind.ProseTail;
            }

            const ch = this.text.charCodeAt(this.pos);
            if (previousTokenWasFragment) {
                if (ch === CharacterCodes.Backtick) {
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Terminal), this.token;
                }
                else if (ch === CharacterCodes.Bar) {
                    return this.pos++ , this.tokenValue = this.scanString(ch, this.token = SyntaxKind.Identifier), this.token;
                }
            }

            if (isMultiLine) {
                if (isLineTerminator(ch)) {
                    tokenValue += this.text.substring(start, this.pos);
                    if (this.nextLineIsProse()) {
                        tokenValue += EOL;
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
        const closingTag = this.text.charCodeAt(this.pos + 1) === CharacterCodes.Slash;
        const triviaEnd = findHtmlTriviaEnd(this.text, this.pos + 1, this.text.length);
        const tagNamePos = closingTag ? this.pos + 2 : this.pos + 1;
        const tagNameEnd = findHtmlTriviaEnd(this.text, tagNamePos, triviaEnd);
        if (tagNameEnd !== -1) {
            const tagName = this.text.slice(tagNamePos, tagNameEnd);
            const tag = closingTag ? new HtmlCloseTagTrivia(tagName) : new HtmlOpenTagTrivia(tagName);
            tag.pos = this.pos;
            tag.end = triviaEnd;
            if (!this.htmlTrivia) this.htmlTrivia = [];
            this.htmlTrivia.push(tag);
        }
        this.pos = triviaEnd;
    }

    private scanString(quote: number, kind: SyntaxKind): string {
        let multiLine = false;
        let consumeQuote = true;
        let diagnostic = Diagnostics.Unterminated_string_literal;
        let decodeEscapeSequences = true;
        if (kind === SyntaxKind.Identifier) {
            diagnostic = Diagnostics.Unterminated_identifier_literal;
        }
        else if (kind === SyntaxKind.Prose) {
            multiLine = true;
            consumeQuote = false;
        }
        else if (kind === SyntaxKind.Terminal) {
            decodeEscapeSequences = false;
        }

        let result = "";
        let start = this.pos;
        while (true) {
            if (this.pos >= this.len) {
                result += this.text.substring(start, this.pos);
                this.tokenFlags |= TokenFlags.Unterminated;
                this.getDiagnostics().report(this.pos, diagnostic || Diagnostics.Unterminated_string_literal);
                break;
            }

            let ch = this.text.charCodeAt(this.pos);
            if (ch === quote) {
                // If this is a terminal that consists solely of a single backtick character (e.g. ```),
                // we capture the backtick.
                if (quote === CharacterCodes.Backtick && this.pos === start && this.pos + 1 < this.len) {
                    ch = this.text.charCodeAt(this.pos + 1);
                    if (ch === CharacterCodes.Backtick) {
                        result = "`";
                        this.pos += 2;
                        break;
                    }
                }

                result += this.text.substring(start, this.pos);
                if (consumeQuote) {
                    this.pos++;
                }

                break;
            }
            else if (decodeEscapeSequences && ch === CharacterCodes.Backslash) {
                // terminals cannot have escape sequences
                result += this.text.substring(start, this.pos);
                result += this.scanEscapeSequence();
                start = this.pos;
                continue;
            }
            else if (!multiLine && isLineTerminator(ch)) {
                result += this.text.substring(start, this.pos);
                this.tokenFlags |= TokenFlags.Unterminated;
                this.getDiagnostics().report(this.pos, diagnostic || Diagnostics.Unterminated_string_literal);
                break;
            }

            this.pos++;
        }

        return result;
    }

    private scanEscapeSequence(): string {
        const start = this.pos;
        this.pos++;
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

    private scanHexDigits(count: number, mustMatchCount?: boolean): number {
        let digits = 0;
        let value = 0;
        while (digits < count || !mustMatchCount) {
            const ch = this.text.charCodeAt(this.pos);
            if (ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9) {
                value = value * 16 + ch - CharacterCodes.Number0;
            }
            else if (ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperF) {
                value = value * 16 + ch - CharacterCodes.UpperA + 10;
            }
            else if (ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerF) {
                value = value * 16 + ch - CharacterCodes.LowerA + 10;
            }
            else {
                break;
            }

            this.pos++;
            digits++;
        }

        if (digits < count) {
            value = -1;
        }

        return value;
    }

    private scanNumber(): number {
        const start = this.pos;
        while (isDigit(this.text.charCodeAt(this.pos))) {
            this.pos++;
        }

        if (this.text.charCodeAt(this.pos) === CharacterCodes.Dot) {
            this.pos++;
            while (isDigit(this.text.charCodeAt(this.pos))) {
                this.pos++;
            }
        }

        let end = this.pos;
        if (this.text.charCodeAt(this.pos) === CharacterCodes.UpperE || this.text.charCodeAt(this.pos) === CharacterCodes.LowerE) {
            this.pos++;
            if (this.text.charCodeAt(this.pos) === CharacterCodes.Plus || this.text.charCodeAt(this.pos) === CharacterCodes.Minus) {
                this.pos++;
            }

            if (isDigit(this.text.charCodeAt(this.pos))) {
                this.pos++;
                while (isDigit(this.text.charCodeAt(this.pos))) {
                    this.pos++;
                }

                end = this.pos;
            }
            else {
                this.getDiagnostics().report(start, Diagnostics.Digit_expected);
            }
        }

        return +(this.text.substring(start, end));
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

function isIdentifierStart(ch: number): boolean {
    return ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperZ
        || ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerZ
        || ch === CharacterCodes.Underscore;
}

function isIdentifierPart(ch: number): boolean {
    return ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperZ
        || ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerZ
        || ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9
        || ch === CharacterCodes.Underscore;
}

function isLineTerminator(ch: number): boolean {
    return ch === CharacterCodes.CarriageReturn || ch === CharacterCodes.LineFeed;
}

function isDigit(ch: number): boolean {
    return ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9;
}

function isHexDigit(ch: number): boolean {
    return ch >= CharacterCodes.UpperA && ch <= CharacterCodes.UpperF
        || ch >= CharacterCodes.LowerA && ch <= CharacterCodes.LowerF
        || ch >= CharacterCodes.Number0 && ch <= CharacterCodes.Number9;
}

function isProseFragment(token: SyntaxKind): boolean {
    return token >= SyntaxKind.FirstProseFragment
        && token <= SyntaxKind.LastProseFragment;
}

function isHtmlTagNameStart(ch: number): boolean {
    return isIdentifierStart(ch);
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