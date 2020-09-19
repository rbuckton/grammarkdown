import { compare, compareNumbers } from "./core";
import { SourceFile } from "./nodes";
import { RegionMap } from "./regionMap";
import { Position, Range } from "./types";

/* @internal */
export interface SourceLine {
    line: number;
    file?: string;
}

/* @internal */
export interface LineOffset {
    generatedLine: number;
    sourceLine: SourceLine | "default";
}

function compareSourceLines(a: SourceLine | "default", b: SourceLine | "default") {
    if (a === "default") return b === "default" ? 0 : -1;
    if (b === "default") return 1;
    return compare(a.file, b.file)
        || compareNumbers(a.line, b.line);
}

/* @internal */
export function compareLineOffsets(a: LineOffset, b: LineOffset): number {
    return compareNumbers(a.generatedLine, b.generatedLine)
        || compareSourceLines(a.sourceLine, b.sourceLine);
}

function equateSourceLines(a: SourceLine | "default", b: SourceLine | "default") {
    if (a === "default") return b === "default";
    if (b === "default") return false;
    return a.line === b.line
        && a.file === b.file;
}

/* @internal */
export function equateLineOffsets(a: LineOffset, b: LineOffset): boolean {
    return a.generatedLine === b.generatedLine
        && equateSourceLines(a.sourceLine, b.sourceLine);
}

export class LineOffsetMap {
    private sourceFilesLineOffsets: RegionMap<SourceLine | "default"> | undefined;

    /* @internal */
    public addLineOffset(sourceFile: SourceFile, line: number, sourceLine: SourceLine | "default") {
        this.sourceFilesLineOffsets ||= new RegionMap(equateSourceLines);
        this.sourceFilesLineOffsets.addRegion(sourceFile, line, sourceLine);
    }

    /* @internal */
    public findLineOffset(sourceFile: SourceFile, position: Position) {
        return this.sourceFilesLineOffsets?.findRegion(sourceFile, position.line);
    }

    /* @internal */
    public copyFrom(other: LineOffsetMap) {
        if (other.sourceFilesLineOffsets) {
            this.sourceFilesLineOffsets ||= new RegionMap(equateSourceLines);
            this.sourceFilesLineOffsets.copyFrom(other.sourceFilesLineOffsets);
        }
    }

    /**
     * Gets the effective filename of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectiveFilenameAtPosition(sourceFile: SourceFile, position: Position) {
        const lineOffset = this.findLineOffset(sourceFile, position);
        if (lineOffset && lineOffset.value !== "default" && lineOffset.value.file !== undefined) {
            return lineOffset.value.file;
        }
        return sourceFile.filename;
    }

    /**
     * Gets the effective position of a raw position within a source file, taking into account `@line` directives.
     */
    public getEffectivePosition(sourceFile: SourceFile, position: Position) {
        const lineOffset = this.findLineOffset(sourceFile, position);
        if (lineOffset && lineOffset.value !== "default") {
            const diff = position.line - lineOffset.line;
            const sourceLine = lineOffset.value.line + diff;
            return Position.create(sourceLine, position.character);
        }
        return position;
    }

    /**
     * Gets the effective range of a raw range within a source file, taking into account `@line` directives.
     */
    public getEffectiveRange(sourceFile: SourceFile, range: Range) {
        const start = this.getEffectivePosition(sourceFile, range.start);
        const end = this.getEffectivePosition(sourceFile, range.end);
        return start !== range.start || end !== range.end ? Range.create(start, end) : range;
    }
}
