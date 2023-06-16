/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { binarySearch, compareStrings, compare } from "./core";
import { Range, Position } from "./types";
import { CharacterCodes, SyntaxKind, isHtmlTriviaKind, isTriviaKind, tokenToString } from "./tokens";
import { Node, SourceFile } from "./nodes";
import { LineOffsetMap } from "./lineOffsetMap";

/** {@docCategory Check} */
export interface Diagnostic {
    code: number;
    message: string;
    warning?: boolean;
}

import { Diagnostics } from "./diagnostics.generated";
export { Diagnostics } from "./diagnostics.generated";

/** {@docCategory Check} */
export interface DiagnosticInfo {
    diagnosticIndex: number;
    code: number;
    message: string;
    messageArguments: any[] | undefined;
    warning: boolean;
    range: Range | undefined;
    sourceFile: SourceFile | undefined;
    filename: string | undefined;
    node: Node | undefined;
    pos: number;
    formattedMessage?: string;
}

/** {@docCategory Check} */
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
    private lineOffsetMap: LineOffsetMap | undefined;

    constructor(lineOffsetMap?: LineOffsetMap) {
        this.lineOffsetMap = lineOffsetMap;
    }

    public get size() {
        return this.diagnostics?.length ?? 0;
    }

    public copyFrom(other: DiagnosticMessages) {
        if (other === this || !(other.diagnostics || other.sourceFiles)) {
            return;
        }

        if (!this.diagnostics && !this.sourceFiles && !this.lineOffsetMap) {
            this.diagnostics = other.diagnostics?.slice();
            this.diagnosticsArguments = other.diagnosticsArguments?.slice();
            this.diagnosticsPos = other.diagnosticsPos?.slice();
            this.diagnosticsLength = other.diagnosticsLength?.slice();
            this.diagnosticsNode = other.diagnosticsNode?.slice();
            this.sourceFiles = other.sourceFiles?.slice();
            this.sourceFilesDiagnosticOffset = other.sourceFilesDiagnosticOffset?.slice();
            if (other.lineOffsetMap) {
                this.lineOffsetMap = new LineOffsetMap();
                this.lineOffsetMap.copyFrom(other.lineOffsetMap);
            }
            this.sortedAndDeduplicatedDiagnosticIndices = other.sortedAndDeduplicatedDiagnosticIndices?.slice();
            this.detailedDiagnosticMessages = other.detailedDiagnosticMessages && new Map(other.detailedDiagnosticMessages);
            this.simpleDiagnosticMessages = other.simpleDiagnosticMessages && new Map(other.simpleDiagnosticMessages);
            return;
        }

        // copy source files
        if (other.sourceFiles && other.sourceFilesDiagnosticOffset) {
            this.sourceFiles ??= [];
            this.sourceFilesDiagnosticOffset ??= [];

            const diagnosticOffset = this.size;
            const sourceFileOffset = this.sourceFiles.length;
            const continueFromExistingFile = sourceFileOffset > 0
                && other.sourceFiles[0] === this.sourceFiles[sourceFileOffset - 1];

            for (let i = continueFromExistingFile ? 1 : 0; i < other.sourceFiles.length; i++) {
                this.sourceFiles[sourceFileOffset + i] = other.sourceFiles[i];
                this.sourceFilesDiagnosticOffset[sourceFileOffset + i] = other.sourceFilesDiagnosticOffset[i] + diagnosticOffset;
            }
        }

        // copy line offsets
        if (other.lineOffsetMap) {
            this.lineOffsetMap ??= new LineOffsetMap();
            this.lineOffsetMap.copyFrom(other.lineOffsetMap);
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
        this.sourceFiles ??= [];
        this.sourceFilesDiagnosticOffset ??= [];

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

    public reportRange(pos: number, end: number, message: Diagnostic, ...args: any[]): void {
        this.reportDiagnostic(message, args, pos, Math.max(0, end - pos));
    }

    public reportNode(sourceFile: SourceFile | undefined, node: Node, message: Diagnostic, ...args: any[]): void {
        let pos: number | undefined;
        let length: number | undefined;
        if (node) {
            pos = isTriviaKind(node.kind) ? node.getFullStart() : node.getStart(sourceFile);
            length = isTriviaKind(node.kind) ? node.getFullWidth() : node.getWidth(sourceFile);
        }

        this.reportDiagnostic(message, args, pos, length, node);
    }

    public count(): number {
        return this.diagnostics?.length ?? 0;
    }

    public getMessage(diagnosticIndex: number, options: { detailed?: boolean; raw?: boolean; } = { detailed: true }): string {
        const diagnostic = this.diagnostics?.[diagnosticIndex];
        if (diagnostic) {
            const { detailed = true } = options;
            const diagnosticMessages = detailed
                ? this.detailedDiagnosticMessages ??= new Map()
                : this.simpleDiagnosticMessages ??= new Map();

            const diagnosticMessage = diagnosticMessages.get(diagnosticIndex);
            if (diagnosticMessage !== undefined) {
                return diagnosticMessage;
            }

            const diagnosticArguments = this.diagnosticsArguments?.[diagnosticIndex];
            let text = "";
            if (detailed) {
                const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
                const filename = this.getDiagnosticFilename(diagnosticIndex, options.raw);
                const position = this.getDiagnosticPosition(diagnosticIndex, options.raw)
                text += filename ?? (sourceFile ? sourceFile.filename : "");
                if (position) {
                    text += `(${position.line + 1},${position.character + 1})`;
                }
                else if (this.diagnosticsPos && diagnosticIndex in this.diagnosticsPos) {
                    const diagnosticPos = this.diagnosticsPos[diagnosticIndex];
                    if (sourceFile && sourceFile.lineMap) {
                        text += `(${sourceFile.lineMap.formatOffset(diagnosticPos)})`;
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
        return this.diagnostics?.[diagnosticIndex];
    }

    public getDiagnosticInfos(options?: { formatMessage?: boolean; detailedMessage?: boolean; raw?: boolean; }): DiagnosticInfo[] {
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

    public getDiagnosticInfosForSourceFile(sourceFile: SourceFile, options?: { formatMessage?: boolean; detailedMessage?: boolean; raw?: boolean; }): DiagnosticInfo[] {
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

    public getDiagnosticInfo(diagnosticIndex: number, options: { formatMessage?: boolean; detailedMessage?: boolean; raw?: boolean; } = {}): DiagnosticInfo | undefined {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        if (diagnostic) {
            const info: DiagnosticInfo = {
                diagnosticIndex,
                code: diagnostic.code,
                warning: diagnostic.warning || false,
                message: diagnostic.message,
                messageArguments: this.getDiagnosticArguments(diagnosticIndex),
                range: this.getDiagnosticRange(diagnosticIndex, options.raw),
                sourceFile: this.getDiagnosticSourceFile(diagnosticIndex),
                filename: this.getDiagnosticFilename(diagnosticIndex, options.raw),
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
        return this.diagnosticsArguments?.[diagnosticIndex];
    }

    public getDiagnosticRange(diagnosticIndex: number, raw?: boolean) {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        if (diagnostic) {
            const node = this.getDiagnosticNode(diagnosticIndex);
            const pos = this.getDiagnosticPos(diagnosticIndex);
            if (node || pos > -1) {
                const length = this.getDiagnosticLength(diagnosticIndex);
                const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
                const range = getDiagnosticRange(node, pos, length, sourceFile);
                if (!raw && sourceFile && this.lineOffsetMap) {
                    return this.lineOffsetMap.getEffectiveRange(sourceFile, range);
                }
                return range;
            }
        }
        return undefined;
    }

    public getDiagnosticPosition(diagnosticIndex: number, raw?: boolean) {
        const diagnostic = this.getDiagnostic(diagnosticIndex);
        const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
        const node = this.getDiagnosticNode(diagnosticIndex);
        const pos = this.getDiagnosticPos(diagnosticIndex);
        if (diagnostic && node || pos > -1) {
            const position = positionOfStart(node, pos, sourceFile);
            if (!raw && sourceFile && this.lineOffsetMap) {
                return this.lineOffsetMap.getEffectivePosition(sourceFile, position);
            }
            return position;
        }
        return undefined;
    }

    public getDiagnosticNode(diagnosticIndex: number): Node | undefined {
        return this.diagnosticsNode?.[diagnosticIndex];
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

    public getDiagnosticFilename(diagnosticIndex: number, raw?: boolean): string | undefined {
        const sourceFile = this.getDiagnosticSourceFile(diagnosticIndex);
        if (sourceFile) {
            if (!raw && this.lineOffsetMap) {
                const pos = this.getDiagnosticPos(diagnosticIndex);
                if (pos > -1) {
                    return this.lineOffsetMap.getEffectiveFilenameAtPosition(sourceFile, sourceFile.lineMap.positionAt(pos));
                }
            }
            return sourceFile.filename;
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
        return this.diagnosticsPos?.[diagnosticIndex] ?? -1;
    }

    private getDiagnosticLength(diagnosticIndex: number): number {
        return this.diagnosticsLength?.[diagnosticIndex] ?? 0;
    }

    private getDiagnosticCode(diagnosticIndex: number): number {
        return this.getDiagnostic(diagnosticIndex)?.code ?? 0;
    }

    private getDiagnosticErrorLevel(diagnosticIndex: number): number {
        return this.getDiagnostic(diagnosticIndex)?.warning ? 0 : 1;
    }

    private reportDiagnostic(message: Diagnostic, args: any[] | undefined, pos?: number, length?: number, node?: Node): void {
        this.sortedAndDeduplicatedDiagnosticIndices = undefined;
        this.diagnostics ??= [];

        const diagnosticIndex = this.diagnostics.length;
        this.diagnostics[diagnosticIndex] = message;

        if (args && args.length > 0) {
            this.diagnosticsArguments ??= [];
            this.diagnosticsArguments[diagnosticIndex] = args;
        }

        if (pos !== undefined) {
            this.diagnosticsPos ??= [];
            this.diagnosticsPos[diagnosticIndex] = pos;
        }

        if (length !== undefined) {
            this.diagnosticsLength ??= [];
            this.diagnosticsLength[diagnosticIndex] = length;
        }

        if (node !== undefined) {
            this.diagnosticsNode ??= [];
            this.diagnosticsNode[diagnosticIndex] = node;
        }
    }
}

/** {@docCategory Check} */
export class NullDiagnosticMessages extends DiagnosticMessages {
    private static _instance: NullDiagnosticMessages;

    public static get instance() {
        return this._instance ??= new NullDiagnosticMessages();
    }

    get size() { return 0; }

    public copyFrom(other: DiagnosticMessages): void { }
    public setSourceFile(sourceFile: SourceFile): void { }
    public report(pos: number, message: Diagnostic, ...args: any[]): void { }
    public reportNode(sourceFile: SourceFile | undefined, node: Node, message: Diagnostic, ...args: any[]): void { }
}

/** {@docCategory Check} */
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
        if (position.line < 0) return 0;
        if (position.line >= this.lineStarts.length) return this.text.length;
        const linePos = this.lineStarts[position.line];
        const pos = linePos + position.character;
        const lineEnd = position.line + 1 < this.lineStarts.length
            ? this.lineStarts[position.line + 1]
            : this.text.length;
        return pos < linePos ? linePos : pos > lineEnd ? lineEnd : pos;
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

    public getLine(line: number): LineInfo {
        this.computeLineStarts();
        if (line < 0 || line >= this.lineStarts.length) {
            throw new RangeError("Argument out of range: line");
        }

        const pos = this.lineStarts[line];
        let end: number;
        let lineTerminatorLength = 0;
        if (line + 1 < this.lineStarts.length) {
            end = this.lineStarts[line + 1];
            if (end - 1 >= pos) {
                let ch = this.text.charCodeAt(end - 1);
                switch (ch) {
                    case CharacterCodes.LineFeed:
                        if (end - 2 >= pos && this.text.charCodeAt(end - 2) === CharacterCodes.CarriageReturn) {
                            lineTerminatorLength = 2;
                            break;
                        }
                        // fall through
                    case CharacterCodes.CarriageReturn:
                    case CharacterCodes.LineSeparator:
                    case CharacterCodes.ParagraphSeparator:
                    case CharacterCodes.NextLine:
                        lineTerminatorLength = 1;
                        break;
                }
            }
        }
        else {
            end = this.text.length;
        }

        const text = this.text.slice(pos, end - lineTerminatorLength);
        const range = Range.create(Position.create(line, 0), Position.create(line, end - pos - lineTerminatorLength));
        const rangeIncludingLineTerminator = Range.create(Position.create(line, 0), Position.create(line, end - pos));
        return { line, text, range, rangeIncludingLineTerminator };
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
                    // fall through
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

export interface LineInfo {
    readonly line: number;
    readonly text: string;
    readonly range: Range;
    readonly rangeIncludingLineTerminator: Range;
}

function getDiagnosticRange(diagnosticNode: Node | undefined, diagnosticPos: number, diagnosticLength: number, sourceFile: SourceFile | undefined): Range {
    return {
        start: positionOfStart(diagnosticNode, diagnosticPos, sourceFile),
        end: positionOfEnd(diagnosticNode, diagnosticPos, diagnosticLength, sourceFile)
    };
}

function positionOfStart(diagnosticNode: Node | undefined, diagnosticPos: number, sourceFile: SourceFile | undefined) {
    return positionAt(diagnosticNode ? isHtmlTriviaKind(diagnosticNode.kind) ? diagnosticNode.getFullStart() : diagnosticNode.getStart(sourceFile) : diagnosticPos, sourceFile);
}

function positionOfEnd(diagnosticNode: Node | undefined, diagnosticPos: number, diagnosticLength: number, sourceFile: SourceFile | undefined) {
    return positionAt(diagnosticNode ? diagnosticNode.getEnd() : diagnosticPos + diagnosticLength, sourceFile);
}

function positionAt(diagnosticPos: number, sourceFile: SourceFile | undefined) {
    return sourceFile?.lineMap
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
