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

import { binarySearch, compareStrings, compare, Range, Position } from "./core";
import { CharacterCodes, SyntaxKind, tokenToString } from "./tokens";
import { Node, SourceFile } from "./nodes";

export interface Diagnostic {
    code: number;
    message: string;
    warning?: boolean;
}

function makeDiagnostics<T extends Record<string, Diagnostic>>(diagnostics: T) {
    return diagnostics;
}

export const Diagnostics = makeDiagnostics({
    Constant_expected: { code: 1000, message: "Constant expected." },
    _0_expected: { code: 1001, message: "{0} expected." },
    _0_or_1_: { code: 0, message: "{0} or {1}" },
    Unexpected_token_0_: { code: 1002, message: "Unexpected token {0}." },
    Invalid_character: { code: 1003, message: "Invalid character." },
    Unterminated_string_literal: { code: 1004, message: "Unterminated string literal." },
    Invalid_escape_sequence: { code: 1005, message: "Invalid escape sequence." },
    Digit_expected: { code: 1006, message: "Digit expected." },
    Production_expected: { code: 1007, message: "Production expected." },
    Unterminated_identifier_literal: { code: 1008, message: "Unterminated identifier literal." },
    Obsolete_0_: { code: 1009, message: "Obsolete: {0}", warning: true },

    Cannot_find_name_0_: { code: 2000, message: "Cannot find name: '{0}'." },
    Duplicate_identifier_0_: { code: 2001, message: "Duplicate identifier: '{0}'." },
    Duplicate_terminal_0_: { code: 2002, message: "Duplicate terminal: `{0}`." },
    Argument_0_cannot_be_specified_multiple_times: { code: 2003, message: "Argument '{0}' cannot be specified multiple times." },
    Production_0_does_not_have_a_parameter_named_1_: { code: 2004, message: "Production '{0}' does not have a parameter named '{1}'." },
    Production_0_is_missing_parameter_1_All_definitions_of_production_0_must_specify_the_same_formal_parameters: { code: 2006, message: "Production '{0}' is missing parameter '{1}'. All definitions of production '{0}' must specify the same formal parameters." },
    There_is_no_argument_given_for_parameter_0_: { code: 2007, message: "There is no argument given for parameter '{0}'." },
});

export interface DiagnosticInfo {
    diagnosticIndex: number;
    code: number;
    message: string;
    messageArguments: any[] | undefined;
    warning: boolean;
    range: Range | undefined;
    sourceFile: SourceFile | undefined;
    node: Node | undefined;
    pos: number;
    formattedMessage?: string;
}

export class DiagnosticMessages {
    private diagnostics: Diagnostic[] | undefined;
    private diagnosticsArguments: any[][] | undefined;
    private diagnosticsPos: number[] | undefined;
    private diagnosticsLength: number[] | undefined;
    private diagnosticsNode: Node[] | undefined;
    private detailedDiagnosticMessages: Map<number, string> | undefined;
    private simpleDiagnosticMessages: Map<number, string> | undefined;
    private sourceFiles: SourceFile[] | undefined;
    private sourceFilesDiagnosticOffset: number[] | undefined;
    private sortedAndDeduplicatedDiagnosticIndices: number[] | undefined;

    public get size() {
        return this.diagnostics ? this.diagnostics.length : 0;
    }

    public copyFrom(other: DiagnosticMessages) {
        if (other === this || !(other.diagnostics || other.sourceFiles)) {
            return;
        }

        if (!this.diagnostics && !this.sourceFiles) {
            this.diagnostics = other.diagnostics && other.diagnostics.slice();
            this.diagnosticsArguments = other.diagnosticsArguments && other.diagnosticsArguments.slice();
            this.diagnosticsPos = other.diagnosticsPos && other.diagnosticsPos.slice();
            this.diagnosticsLength = other.diagnosticsLength && other.diagnosticsLength.slice();
            this.diagnosticsNode = other.diagnosticsNode && other.diagnosticsNode.slice();
            this.sourceFiles = other.sourceFiles && other.sourceFiles.slice();
            this.sourceFilesDiagnosticOffset = other.sourceFilesDiagnosticOffset && other.sourceFilesDiagnosticOffset.slice();
            this.sortedAndDeduplicatedDiagnosticIndices = other.sortedAndDeduplicatedDiagnosticIndices && other.sortedAndDeduplicatedDiagnosticIndices.slice();
            this.detailedDiagnosticMessages = other.detailedDiagnosticMessages && new Map(other.detailedDiagnosticMessages);
            this.simpleDiagnosticMessages = other.simpleDiagnosticMessages && new Map(other.simpleDiagnosticMessages);
            return;
        }

        // copy source files
        if (other.sourceFiles && other.sourceFilesDiagnosticOffset) {
            if (!this.sourceFiles || !this.sourceFilesDiagnosticOffset) {
                this.sourceFiles = [];
                this.sourceFilesDiagnosticOffset = [];
            }

            const diagnosticOffset = this.size;
            const sourceFileOffset = this.sourceFiles.length;
            const continueFromExistingFile = sourceFileOffset > 0
                && other.sourceFiles[0] === this.sourceFiles[sourceFileOffset - 1];

            for (let i = continueFromExistingFile ? 1 : 0; i < other.sourceFiles.length; i++) {
                this.sourceFiles[sourceFileOffset + i] = other.sourceFiles[i];
                this.sourceFilesDiagnosticOffset[sourceFileOffset + i] = other.sourceFilesDiagnosticOffset[i] + diagnosticOffset;
            }
        }

        // copy diagnostics
        if (other.diagnostics) {
            for (let i = 0; i < other.diagnostics.length; i++) {
                this.reportDiagnostic(
                    other.diagnostics[i],
                    other.diagnosticsArguments && other.diagnosticsArguments[i],
                    other.diagnosticsPos && other.diagnosticsPos[i],
                    other.diagnosticsLength && other.diagnosticsLength[i],
                    other.diagnosticsNode && other.diagnosticsNode[i]
                );
            }
        }
    }

    public setSourceFile(sourceFile: SourceFile): void {
        if (!this.sourceFiles || !this.sourceFilesDiagnosticOffset) {
            this.sourceFiles = [];
            this.sourceFilesDiagnosticOffset = [];
        }

        const sourceFileIndex = this.sourceFiles.length;
        if (sourceFileIndex > 0 && this.sourceFiles[sourceFileIndex - 1] === sourceFile) {
            return;
        }

        const diagnosticOffset = this.size;
        this.sourceFiles[sourceFileIndex] = sourceFile;
        this.sourceFilesDiagnosticOffset[sourceFileIndex] = diagnosticOffset;
    }

    public report(pos: number, message: Diagnostic, ...args: any[]): void {
        this.reportDiagnostic(message, args, pos);
    }

    public reportNode(sourceFile: SourceFile | undefined, node: Node, message: Diagnostic, ...args: any[]): void {
        let pos: number | undefined;
        let length: number | undefined;
        if (node) {
            pos = node.getStart(sourceFile);
            length = node.getWidth(sourceFile);
        }

        this.reportDiagnostic(message, args, pos, length, node);
    }

    public count(): number {
        return this.diagnostics ? this.diagnostics.length : 0;
    }

    public getMessage(diagnosticIndex: number, options: { detailed?: boolean; } = { detailed: true }): string {
        const diagnostic = this.diagnostics && this.diagnostics[diagnosticIndex];
        if (diagnostic) {
            const { detailed = true } = options;
            const diagnosticMessages = detailed
                ? this.detailedDiagnosticMessages || (this.detailedDiagnosticMessages = new Map<number, string>())
                : this.simpleDiagnosticMessages || (this.simpleDiagnosticMessages = new Map<number, string>());

            const diagnosticMessage = diagnosticMessages.get(diagnosticIndex);
            if (diagnosticMessage !== undefined) {
                return diagnosticMessage;
            }

            const diagnosticArguments = this.diagnosticsArguments && this.diagnosticsArguments[diagnosticIndex];
            const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
            let text = "";
            if (detailed) {
                text += sourceFile ? sourceFile.filename : "";
                if (this.diagnosticsPos && diagnosticIndex in this.diagnosticsPos) {
                    const diagnosticPos = this.diagnosticsPos[diagnosticIndex];
                    if (sourceFile && sourceFile.lineMap) {
                        text += `(${sourceFile.lineMap.formatPosition(diagnosticPos)})`;
                    }
                    else {
                        text += `(${diagnosticPos})`;
                    }
                }

                text += ": ";
                text += diagnostic.warning ? "warning" : "error";
                text += " GM" + String(diagnostic.code) + ": ";
            }

            let message = diagnostic.message;
            if (diagnosticArguments) {
                message = formatString(message, diagnosticArguments);
            }

            text += message;

            diagnosticMessages.set(diagnosticIndex, text);
            return text;
        }

        return "";
    }

    public getDiagnostic(diagnosticIndex: number): Diagnostic | undefined {
        return this.diagnostics && this.diagnostics[diagnosticIndex];
    }

    public getDiagnosticInfos(options?: { formatMessage?: boolean; detailedMessage?: boolean; }): DiagnosticInfo[] {
        const result: DiagnosticInfo[] = [];
        if (this.diagnostics) {
            for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
                const diagnosticInfo = this.getDiagnosticInfo(diagnosticIndex, options);
                if (diagnosticInfo) {
                    result.push(diagnosticInfo);
                }
            }
        }
        return result;
    }

    public getDiagnosticInfosForSourceFile(sourceFile: SourceFile, options?: { formatMessage?: boolean; detailedMessage?: boolean; }): DiagnosticInfo[] {
        const result: DiagnosticInfo[] = [];
        if (this.diagnostics) {
            for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
                if (this.getDiagnosticSourceFile(diagnosticIndex) === sourceFile) {
                    const diagnosticInfo = this.getDiagnosticInfo(diagnosticIndex, options);
                    if (diagnosticInfo) {
                        result.push(diagnosticInfo);
                    }
                }
            }
        }
        return result;
    }

    public getDiagnosticInfo(diagnosticIndex: number, options: { formatMessage?: boolean; detailedMessage?: boolean; } = {}): DiagnosticInfo | undefined {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        if (diagnostic) {
            const info: DiagnosticInfo = {
                diagnosticIndex,
                code: diagnostic.code,
                warning: diagnostic.warning || false,
                message: diagnostic.message,
                messageArguments: this.getDiagnosticArguments(diagnosticIndex),
                range: this.getDiagnosticRange(diagnosticIndex),
                sourceFile: this.getDiagnosticSourceFile(diagnosticIndex),
                node: this.getDiagnosticNode(diagnosticIndex),
                pos: this.getDiagnosticPos(diagnosticIndex)
            };

            if (options.formatMessage) {
                info.formattedMessage = this.getMessage(diagnosticIndex, { detailed: options.detailedMessage });
            }

            return info;
        }

        return undefined;
    }

    public getDiagnosticArguments(diagnosticIndex: number): any[] | undefined {
        return this.diagnosticsArguments && this.diagnosticsArguments[diagnosticIndex];
    }

    public getDiagnosticRange(diagnosticIndex: number) {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
        const node = this.getDiagnosticNode(diagnosticIndex);
        const pos = this.getDiagnosticPos(diagnosticIndex);
        if (diagnostic && node || pos > -1) {
            return getDiagnosticRange(node, pos, sourceFile);
        }

        return undefined;
    }

    public getDiagnosticNode(diagnosticIndex: number): Node | undefined {
        return this.diagnosticsNode && this.diagnosticsNode[diagnosticIndex];
    }

    public getDiagnosticSourceFile(diagnosticIndex: number): SourceFile | undefined {
        if (this.sourceFiles && this.sourceFilesDiagnosticOffset) {
            let offset = binarySearch(this.sourceFilesDiagnosticOffset, diagnosticIndex);
            if (offset < 0) {
                offset = (~offset) - 1;
            }

            while (offset + 1 < this.sourceFiles.length && this.sourceFilesDiagnosticOffset[offset + 1] === diagnosticIndex) {
                offset++;
            }

            return this.sourceFiles[offset];
        }

        return undefined;
    }

    public forEach(callback: (message: string, diagnosticIndex: number) => void): void {
        if (this.diagnostics) {
            for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
                callback(this.getMessage(diagnosticIndex, { detailed: true }), diagnosticIndex);
            }
        }
    }

    public * values() {
        for (let i = 0; i < this.size; i++) {
            yield this.getDiagnosticInfo(i);
        }
    }

    public [Symbol.iterator]() {
        return this.values();
    }

    private getSortedAndDeduplicatedDiagnosticIndices() {
        if (!this.sortedAndDeduplicatedDiagnosticIndices) {
            let indices: number[] = [];
            if (this.diagnostics) {
                for (let diagnosticIndex = 0, l = this.diagnostics.length; diagnosticIndex < l; diagnosticIndex++) {
                    indices[diagnosticIndex] = diagnosticIndex;
                }
            }

            indices = this.sortDiagnostics(indices);
            indices = this.deduplicateDiagnostics(indices);
            this.sortedAndDeduplicatedDiagnosticIndices = indices;
        }

        return this.sortedAndDeduplicatedDiagnosticIndices;
    }

    private sortDiagnostics(indices: number[]) {
        return indices.sort((left, right) => this.compareDiagnostics(left, right));
    }

    private compareDiagnostics(diagnosticIndex1: number, diagnosticIndex2: number) {
        const file1 = this.getDiagnosticSourceFile(diagnosticIndex1);
        const file2 = this.getDiagnosticSourceFile(diagnosticIndex2);
        return compareStrings(file1 && file1.filename, file2 && file2.filename)
            || compare(this.getDiagnosticPos(diagnosticIndex1), this.getDiagnosticPos(diagnosticIndex2))
            || compare(this.getDiagnosticLength(diagnosticIndex1), this.getDiagnosticLength(diagnosticIndex2))
            || compare(this.getDiagnosticErrorLevel(diagnosticIndex1), this.getDiagnosticErrorLevel(diagnosticIndex2))
            || compare(this.getDiagnosticCode(diagnosticIndex1), this.getDiagnosticCode(diagnosticIndex2))
            || compareStrings(this.getMessage(diagnosticIndex1), this.getMessage(diagnosticIndex2), /*ignoreCase*/ true);
    }

    private deduplicateDiagnostics(indices: number[]) {
        if (indices.length <= 1) {
            return indices;
        }
        const firstDiagnosticIndex = indices[0];
        const newIndices: number[] = [firstDiagnosticIndex];
        let previousDiagnosticIndex = firstDiagnosticIndex;
        for (let i = 1; i < indices.length; i++) {
            const diagnosticIndex = indices[i];
            if (this.compareDiagnostics(previousDiagnosticIndex, diagnosticIndex)) {
                newIndices.push(diagnosticIndex);
                previousDiagnosticIndex = diagnosticIndex;
            }
        }
        return newIndices;
    }

    private getDiagnosticPos(diagnosticIndex: number): number {
        return this.diagnosticsPos && this.diagnosticsPos[diagnosticIndex] || -1;
    }

    private getDiagnosticLength(diagnosticIndex: number): number {
        return this.diagnosticsLength && this.diagnosticsLength[diagnosticIndex] || 0;
    }

    private getDiagnosticCode(diagnosticIndex: number): number {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        return diagnostic && diagnostic.code || 0;
    }

    private getDiagnosticErrorLevel(diagnosticIndex: number): number {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        return diagnostic && diagnostic.warning ? 0 : 1;
    }

    private reportDiagnostic(message: Diagnostic, args: any[] | undefined, pos?: number, length?: number, node?: Node): void {
        this.sortedAndDeduplicatedDiagnosticIndices = undefined;

        if (!this.diagnostics) {
            this.diagnostics = [];
        }

        const diagnosticIndex = this.diagnostics.length;
        this.diagnostics[diagnosticIndex] = message;

        if (args && args.length > 0) {
            if (!this.diagnosticsArguments) {
                this.diagnosticsArguments = [];
            }

            this.diagnosticsArguments[diagnosticIndex] = args;
        }

        if (pos !== undefined) {
            if (!this.diagnosticsPos) {
                this.diagnosticsPos = [];
            }

            this.diagnosticsPos[diagnosticIndex] = pos;
        }

        if (length !== undefined) {
            if (!this.diagnosticsLength) {
                this.diagnosticsLength = [];
            }

            this.diagnosticsLength[diagnosticIndex] = length;
        }

        if (node !== undefined) {
            if (!this.diagnosticsNode) {
                this.diagnosticsNode = [];
            }

            this.diagnosticsNode[diagnosticIndex] = node;
        }
    }
}

export class NullDiagnosticMessages extends DiagnosticMessages {
    private static _instance: NullDiagnosticMessages;

    public static get instance() {
        return this._instance || (this._instance = new NullDiagnosticMessages());
    }

    get size() { return 0; }

    public copyFrom(other: DiagnosticMessages): void { }
    public setSourceFile(sourceFile: SourceFile): void { }
    public report(pos: number, message: Diagnostic, ...args: any[]): void { }
    public reportNode(sourceFile: SourceFile | undefined, node: Node, message: Diagnostic, ...args: any[]): void { }
}

export class LineMap {
    private text: string;
    private lineStarts!: number[];

    constructor(text: string) {
        this.text = text;
    }

    public get lineCount() {
        this.computeLineStarts();
        return this.lineStarts.length;
    }

    /* @obsolete */ /* @internal */ formatPosition(pos: number): string { return this.formatOffset(pos); }
    /* @obsolete */ /* @internal */ getPositionOfLineAndCharacter(lineAndCharacter: Position) { return this.offsetAt(lineAndCharacter); }
    /* @obsolete */ /* @internal */ getLineAndCharacterOfPosition(pos: number): Position { return this.positionAt(pos); }

    public formatOffset(pos: number): string {
        this.computeLineStarts();
        var lineNumber = binarySearch(this.lineStarts, pos);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the negative value of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2
            lineNumber = (~lineNumber) - 1;
        }
        return `${lineNumber + 1},${pos - this.lineStarts[lineNumber] + 1}`;
    }

    public offsetAt(position: Position) {
        this.computeLineStarts();
        if (position.line < 0 ||
            position.character < 0 ||
            position.line >= this.lineStarts.length) {
            return -1;
        }

        const pos = this.lineStarts[position.line] + position.character;
        const lineEnd = position.line + 1 < this.lineStarts.length
            ? this.lineStarts[position.line + 1]
            : this.text.length;

        if (pos >= lineEnd) {
            return -1;
        }

        if (this.text.charCodeAt(pos) === CharacterCodes.LineFeed ||
            this.text.charCodeAt(pos) === CharacterCodes.CarriageReturn) {
            return -1;
        }

        return pos;
    }

    public positionAt(offset: number): Position {
        this.computeLineStarts();
        let lineNumber = binarySearch(this.lineStarts, offset);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the negative value of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2
            lineNumber = (~lineNumber) - 1;
        }

        return { line: lineNumber, character: offset - this.lineStarts[lineNumber] };
    }

    private computeLineStarts() {
        if (this.lineStarts) {
            return;
        }

        const lineStarts: number[] = [];
        let lineStart = 0;
        for (var pos = 0; pos < this.text.length;) {
            var ch = this.text.charCodeAt(pos++);
            switch (ch) {
                case CharacterCodes.CarriageReturn:
                    if (this.text.charCodeAt(pos) === CharacterCodes.LineFeed) {
                        pos++;
                    }
                case CharacterCodes.LineFeed:
                case CharacterCodes.LineSeparator:
                case CharacterCodes.ParagraphSeparator:
                case CharacterCodes.NextLine:
                    lineStarts.push(lineStart);
                    lineStart = pos;
                    break;

            }
        }
        lineStarts.push(lineStart);
        this.lineStarts = lineStarts;
    }
}

function getDiagnosticRange(diagnosticNode: Node | undefined, diagnosticPos: number, sourceFile: SourceFile | undefined): Range {
    return {
        start: positionOfStart(diagnosticNode, diagnosticPos, sourceFile),
        end: positionOfEnd(diagnosticNode, diagnosticPos, sourceFile)
    }
}

function positionOfStart(diagnosticNode: Node | undefined, diagnosticPos: number, sourceFile: SourceFile | undefined) {
    return positionAt(diagnosticNode ? diagnosticNode.getStart(sourceFile) : diagnosticPos, sourceFile);
}

function positionOfEnd(diagnosticNode: Node | undefined, diagnosticPos: number, sourceFile: SourceFile | undefined) {
    return positionAt(diagnosticNode ? diagnosticNode.getEnd() : diagnosticPos, sourceFile);
}

function positionAt(diagnosticPos: number, sourceFile: SourceFile | undefined) {
    return sourceFile && sourceFile.lineMap
        ? sourceFile.lineMap.positionAt(diagnosticPos)
        : { line: 0, character: diagnosticPos };
}

export function formatString(format: string, args?: any[]): string;
export function formatString(format: string, ...args: any[]): string;
export function formatString(format: string): string {
    let args = <any[]>Array.prototype.slice.call(arguments, 1);
    if (args.length === 1 && args[0] instanceof Array) {
        args = args[0];
    }

    return format.replace(/{(\d+)}/g, (_, index) => args[index]);
}

export function formatList(tokens: (SyntaxKind | string)[]): string {
    if (tokens.length <= 0) {
        return "";
    }
    else if (tokens.length === 1) {
        return tokenToString(tokens[0], /*quoted*/ true);
    }
    else if (tokens.length === 2) {
        return formatString(
            Diagnostics._0_or_1_.message,
            tokenToString(tokens[0], /*quoted*/ true),
            tokenToString(tokens[1], /*quoted*/ true));
    }
    else {
        let text = "";
        for (var i = 0; i < tokens.length - 1; i++) {
            if (i > 0) {
                text += " ";
            }

            text += tokenToString(tokens[i], /*quoted*/ true);
            text += ",";
        }

        return formatString(Diagnostics._0_or_1_.message, text, tokenToString(tokens[tokens.length - 1], /*quoted*/ true));
    }
}
