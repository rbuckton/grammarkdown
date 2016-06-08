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
import { binarySearch, compareStrings, compare, Range, Position, Dict } from "./core";
import { CharacterCodes, SyntaxKind, tokenToString } from "./tokens";
import { Node, SourceFile } from "./nodes";

export interface Diagnostic {
    code: number;
    message: string;
    warning?: boolean;
}

export const Diagnostics = {
    Constant_expected: <Diagnostic>{ code: 1000, message: "Constant expected." },
    _0_expected: <Diagnostic>{ code: 1001, message: "{0} expected." },
    _0_or_1_: <Diagnostic>{ code: 0, message: "{0} or {1}" },
    Unexpected_token_0_: <Diagnostic>{ code: 1002, message: "Unexpected token {0}." },
    Invalid_character: <Diagnostic>{ code: 1003, message: "Invalid character." },
    Unterminated_string_literal: <Diagnostic>{ code: 1004, message: "Unterminated string literal." },
    Invalid_escape_sequence: <Diagnostic>{ code: 1005, message: "Invalid escape sequence." },
    Digit_expected: <Diagnostic>{ code: 1006, message: "Digit expected." },
    Production_expected: <Diagnostic>{ code: 1007, message: "Production expected." },
    Unterminated_identifier_literal: <Diagnostic>{ code: 1008, message: "Unterminated identifier literal." },
    Obsolete_0_: <Diagnostic>{ code: 1009, message: "Obsolete: {0}", warning: true },
    Cannot_find_name_0_: <Diagnostic>{ code: 2000, message: "Cannot find name: '{0}'." },
    Duplicate_identifier_0_: <Diagnostic>{ code: 2001, message: "Duplicate identifier: '{0}'." },
    Duplicate_terminal_0_: <Diagnostic>{ code: 2002, message: "Duplicate terminal: `{0}`." },
    Argument_0_cannot_be_specified_multiple_times: <Diagnostic>{ code: 2003, message: "Argument '{0}' cannot be specified multiple times." },
    Production_0_does_not_have_a_parameter_named_1_: <Diagnostic>{ code: 2004, message: "Production '{0}' does not have a parameter named '{1}'." },
    Production_0_is_missing_parameter_1_All_definitions_of_production_0_must_specify_the_same_formal_parameters: <Diagnostic>{ code: 2006, message: "Production '{0}' is missing parameter '{1}'. All definitions of production '{0}' must specify the same formal parameters." },
    There_is_no_argument_given_for_parameter_0_: <Diagnostic>{ code: 2007, message: "There is no argument given for parameter '{0}'." },
};

export interface DiagnosticInfo {
    diagnosticIndex: number;
    code: number;
    message: string;
    messageArguments: any[];
    warning: boolean;
    range: Range;
    sourceFile: SourceFile;
    node: Node;
    pos: number;
    formattedMessage?: string;
}

export class DiagnosticMessages {
    private diagnostics: Diagnostic[];
    private diagnosticsPos: number[];
    private diagnosticsLength: number[];
    private diagnosticsNode: Node[];
    private diagnosticsArguments: any[][];
    private detailedDiagnosticMessages: Dict<string>;
    private simpleDiagnosticMessages: Dict<string>;
    private sourceFiles: SourceFile[];
    private sourceFilesDiagnosticOffset: number[];
    private nextDiagnosticIndex = 0;
    private sortedAndDeduplicatedDiagnosticIndices: number[];

    constructor() {
    }

    public setSourceFile(sourceFile: SourceFile): void {
        if (!this.sourceFiles) {
            this.sourceFiles = [];
            this.sourceFilesDiagnosticOffset = [];
        }

        const diagnosticOffset = this.count();
        const sourceFileIndex = this.sourceFiles.length;
        this.sourceFiles[sourceFileIndex] = sourceFile;
        this.sourceFilesDiagnosticOffset[sourceFileIndex] = diagnosticOffset;
    }

    public report(pos: number, message: Diagnostic, args: any[]): void;
    public report(pos: number, message: Diagnostic, ...args: any[]): void;
    public report(pos: number, message: Diagnostic): void {
        this.reportDiagnostic(message, Array.prototype.slice.call(arguments, 2), pos);
    }


    public reportNode(node: Node, message: Diagnostic, args: any[]): void;
    public reportNode(node: Node, message: Diagnostic, ...args: any[]): void;
    public reportNode(node: Node, message: Diagnostic): void {
        let pos: number;
        let length: number;
        if (node) {
            pos = node.pos;
            length = node.end - node.pos;
        }

        this.reportDiagnostic(message, Array.prototype.slice.call(arguments, 2), pos, length, node);
    }

    public count(): number {
        return this.diagnostics ? this.diagnostics.length : 0;
    }

    public getMessage(diagnosticIndex: number, options: { detailed?: boolean; } = { detailed: true }): string {
        const diagnostic = this.diagnostics && this.diagnostics[diagnosticIndex];
        if (diagnostic) {
            const { detailed = true } = options;
            const diagnosticMessages = detailed
                ? this.detailedDiagnosticMessages || (this.detailedDiagnosticMessages = new Dict<string>())
                : this.simpleDiagnosticMessages || (this.simpleDiagnosticMessages = new Dict<string>());

            if (Dict.has(diagnosticMessages, diagnosticIndex)) {
                return Dict.get(diagnosticMessages, diagnosticIndex);
            }

            const diagnosticArguments = this.diagnosticsArguments && this.diagnosticsArguments[diagnosticIndex];
            const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
            let text = "";
            if (detailed) {
                text += sourceFile ? sourceFile.filename : "";
                if (this.diagnosticsPos && diagnosticIndex in this.diagnosticsPos) {
                    const diagnosticPos = this.diagnosticsPos[diagnosticIndex];
                    if (sourceFile && sourceFile.lineMap) {
                        text += `(${sourceFile.lineMap.formatPosition(diagnosticPos) })`;
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

            Dict.set(diagnosticMessages, diagnosticIndex, text);
            return text;
        }

        return "";
    }

    public getDiagnostic(diagnosticIndex: number): Diagnostic {
        return this.diagnostics && this.diagnostics[diagnosticIndex];
    }

    public getDiagnosticInfos(options?: { formatMessage?: boolean; detailedMessage?: boolean; }): DiagnosticInfo[] {
        const result: DiagnosticInfo[] = [];
        for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
            result.push(this.getDiagnosticInfo(diagnosticIndex, options));
        }

        return result;
    }

    public getDiagnosticInfosForSourceFile(sourceFile: SourceFile, options?: { formatMessage?: boolean; detailedMessage?: boolean; }): DiagnosticInfo[] {
        const result: DiagnosticInfo[] = [];
        for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
            if (this.getDiagnosticSourceFile(diagnosticIndex) === sourceFile) {
                result.push(this.getDiagnosticInfo(diagnosticIndex, options));
            }
        }

        return result;
    }

    public getDiagnosticInfo(diagnosticIndex: number, options: { formatMessage?: boolean; detailedMessage?: boolean; } = {}): DiagnosticInfo {
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

    public getDiagnosticArguments(diagnosticIndex: number): any[] {
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

    public getDiagnosticNode(diagnosticIndex: number): Node {
        return this.diagnosticsNode && this.diagnosticsNode[diagnosticIndex];
    }

    public forEach(callback: (message: string, diagnosticIndex: number) => void): void {
        if (!this.diagnostics) return;
        for (const diagnosticIndex of this.getSortedAndDeduplicatedDiagnosticIndices()) {
            callback(this.getMessage(diagnosticIndex, { detailed: true }), diagnosticIndex);
        }
    }

    private getSortedAndDeduplicatedDiagnosticIndices() {
        if (!this.sortedAndDeduplicatedDiagnosticIndices) {
            let indices: number[] = [];
            for (let diagnosticIndex = 0, l = this.diagnostics.length; diagnosticIndex < l; diagnosticIndex++) {
                indices[diagnosticIndex] = diagnosticIndex;
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
        return compareStrings(this.getDiagnosticSourceFile(diagnosticIndex1).filename, this.getDiagnosticSourceFile(diagnosticIndex2).filename)
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

        const numIndices = indices.length;
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

    private reportDiagnostic(message: Diagnostic, args: any[], pos?: number, length?: number, node?: Node): void {
        this.sortedAndDeduplicatedDiagnosticIndices = undefined;

        if (!this.diagnostics) {
            this.diagnostics = [];
        }

        const diagnosticIndex = this.diagnostics.length;
        this.diagnostics[diagnosticIndex] = message;

        if (args.length === 1 && args[0] instanceof Array) {
            args = args[0];
        }

        if (args.length > 0) {
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

    public getDiagnosticSourceFile(diagnosticIndex: number): SourceFile {
        if (this.sourceFiles) {
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
}

export class NullDiagnosticMessages extends DiagnosticMessages {
    private static _instance: NullDiagnosticMessages;

    public static get instance() {
        return this._instance || (this._instance = new NullDiagnosticMessages());
    }

    public reportCore(message: Diagnostic, arg0?: any, arg1?: any): number { return 0; }
    public report(pos: number, message: Diagnostic, arg0?: any, arg1?: any): number { return 0; }
    public reportNode(node: Node, message: Diagnostic, arg0?: any, arg1?: any): number { return 0; }
    public count(): number { return 0; }
    public getMessage(diagnosticIndex: number): string { return ""; }
    public getDiagnostic(diagnosticIndex: number): Diagnostic { return undefined; }
    public getDiagnosticNode(diagnosticIndex: number): Node { return undefined; }
    public forEach(callback: (message: string, diagnosticIndex: number) => void): void { }
}

export class LineMap {
    private text: string;
    private lineStarts: number[];

    constructor(text: string) {
        this.text = text;
    }

    public formatPosition(pos: number): string {
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

    public getPositionOfLineAndCharacter(lineAndCharacter: Position) {
        this.computeLineStarts();
        if (lineAndCharacter.line < 0 ||
            lineAndCharacter.character < 0 ||
            lineAndCharacter.line >= this.lineStarts.length) {
            return -1;
        }

        const pos = this.lineStarts[lineAndCharacter.line] + lineAndCharacter.character;
        const lineEnd = lineAndCharacter.line + 1 < this.lineStarts.length
            ? this.lineStarts[lineAndCharacter.line + 1]
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

    public getLineAndCharacterOfPosition(pos: number): Position {
        this.computeLineStarts();
        let lineNumber = binarySearch(this.lineStarts, pos);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the negative value of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2
            lineNumber = (~lineNumber) - 1;
        }

        return { line: lineNumber, character: pos - this.lineStarts[lineNumber] };
    }

    private computeLineStarts() {
        if (this.lineStarts) {
            return;
        }
        var lineStarts: number[] = [];
        var lineStart = 0;
        for (var pos = 0; pos < this.text.length; ) {
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

    private isLineBreak(ch: number): boolean {
        return ch === CharacterCodes.CarriageReturn
            || ch === CharacterCodes.LineFeed
            || ch === CharacterCodes.LineSeparator
            || ch === CharacterCodes.ParagraphSeparator
            || ch === CharacterCodes.NextLine;
    }
}

function getDiagnosticRange(diagnosticNode: Node, diagnosticPos: number, sourceFile: SourceFile): Range {
    return {
        start: getLineAndCharacterOfStart(diagnosticNode, diagnosticPos, sourceFile),
        end: getLineAndCharacterOfEnd(diagnosticNode, diagnosticPos, sourceFile)
    }
}

function getLineAndCharacterOfStart(diagnosticNode: Node, diagnosticPos: number, sourceFile: SourceFile) {
    return getLineAndCharacterOfPosition(diagnosticNode ? diagnosticNode.pos : diagnosticPos, sourceFile);
}

function getLineAndCharacterOfEnd(diagnosticNode: Node, diagnosticPos: number, sourceFile: SourceFile) {
    return getLineAndCharacterOfPosition(diagnosticNode ? diagnosticNode.end : diagnosticPos, sourceFile);
}

function getLineAndCharacterOfPosition(diagnosticPos: number, sourceFile: SourceFile) {
    return sourceFile && sourceFile.lineMap
        ? sourceFile.lineMap.getLineAndCharacterOfPosition(diagnosticPos)
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

export function formatList(tokens: SyntaxKind[]): string {
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
