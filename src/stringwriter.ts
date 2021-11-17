/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { EOL } from 'os';
import { CharacterCodes } from './tokens';

/** {@docCategory Emit} */
export class StringWriter {
    private _text = "";
    private _depth = 0;
    private _indents = ["", "    "];
    private _newLineRequested = false;
    private _indentRequested = false;
    private _character = 0;
    private _line = 0;
    private _eol: string;

    constructor(eol = EOL) {
        this._eol = eol;
    }

    public get size(): number {
        return this._text.length + (this._newLineRequested ? this._eol.length : 0);
    }

    public get line() {
        return this._newLineRequested ? this._line + 1 : this._line;
    }

    public get character() {
        let character = this._character;
        if (this._newLineRequested) character = 0;
        if (this._indentRequested) character += this._depth * this._indents[1].length;
        return character;
    }

    public indent(): void {
        this._depth++;
    }

    public dedent(): void {
        this._depth--;
    }

    public write(text?: string): void {
        if (text) {
            this.flushNewLine();
            this.flushIndent();

            let lineStart = 0;
            for (let i = 0; i < text.length; i++) {
                const ch = text.charCodeAt(i);
                if (ch === CharacterCodes.CarriageReturn) {
                    this._line++;
                    this._character = 0;
                    if (i + 1 < text.length && text.charCodeAt(i + 1) === CharacterCodes.LineFeed) {
                        i++;
                    }
                    lineStart = i;
                }
                else if (ch === CharacterCodes.LineFeed) {
                    this._line++;
                    this._character = 0;
                    lineStart = i;
                }
            }

            this._text += text;
            this._character += text.length - lineStart;
        }
    }

    public commitLine() {
        this.flushNewLine();
    }

    public writeln(text?: string) {
        this.write(text);
        this._newLineRequested = true;
    }

    public toString(): string {
        return this._text + (this._newLineRequested ? this._eol : "");
    }

    public clone() {
        const writer = new StringWriter(this._eol);
        writer._text = this._text;
        writer._depth = this._depth;
        writer._indents = this._indents.slice();
        writer._newLineRequested = this._newLineRequested;
        writer._indentRequested = this._indentRequested;
        writer._character = this._character;
        writer._line = this._line;
        return writer;
    }

    private flushNewLine(): void {
        if (this._newLineRequested) {
            this._text += this._eol;
            this._line++;
            this._character = 0;
            this._newLineRequested = false;
            this._indentRequested = true;
        }
    }

    private flushIndent(): void {
        if (this._indentRequested) {
            let indent = this._indents[this._depth];
            if (!indent && this._depth > 0) {
                indent = this._indents[this._depth] = this._indents[this._depth - 1] + this._indents[1];
            }

            this._text += indent;
            this._character += indent.length;
            this._indentRequested = false;
        }
    }
}