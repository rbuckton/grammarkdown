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