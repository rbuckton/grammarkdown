/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { EOL } from 'os';

/** {@docCategory Emit} */
export class StringWriter {
    private _text = "";
    private _depth = 0;
    private _indents = ["", "    "];
    private _newLine = false;
    private _eol: string;

    constructor(eol = EOL) {
        this._eol = eol;
    }

    public get size(): number {
        return this._text.length;
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
            this._text += text;
        }
    }

    public writeln(text?: string) {
        this.write(text);
        this._newLine = true;
    }

    public toString(): string {
        return this._text;
    }

    private flushNewLine(): void {
        if (this._newLine) {
            let indent = this._indents[this._depth];
            if (!indent && this._depth > 0) {
                indent = this._indents[this._depth] = this._indents[this._depth - 1] + this._indents[1];
            }

            this._newLine = false;
            this._text += this._eol + indent;
        }
    }
}