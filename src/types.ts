/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

/** {@docCategory Other} */
export interface TextRange {
    pos: number;
    end: number;
}

/** {@docCategory Other} */
export interface Position {
    line: number;
    character: number;
}

/** {@docCategory Other} */
export namespace Position {
    export function create(line: number, character: number): Position {
        return { line, character };
    }

    export function clone(position: Position): Position {
        return create(position.line, position.character);
    }

    export function compare(left: Position, right: Position) {
        if (left.line < right.line) return -1;
        if (left.line > right.line) return +1;
        if (left.character < right.character) return -1;
        if (left.character > right.character) return +1;
        return 0;
    }

    export function equals(left: Position, right: Position) {
        return left.line === right.line
            && left.character === right.character;
    }
}

/** {@docCategory Other} */
export interface Range {
    start: Position;
    end: Position;
}

/** {@docCategory Other} */
export namespace Range {
    export function create(start: Position, end: Position): Range {
        return { start, end };
    }

    export function clone(range: Range): Range {
        return create(Position.clone(range.start), Position.clone(range.end));
    }

    export function collapseToStart(range: Range): Range {
        return create(range.start, range.start);
    }

    export function collapseToEnd(range: Range): Range {
        return create(range.end, range.end);
    }

    export function isCollapsed(range: Range): boolean {
        return Position.compare(range.start, range.end) >= 0;
    }

    export function contains(left: Range, right: Range): boolean {
        return Position.compare(left.start, right.start) <= 0
            && Position.compare(left.end, right.end) >= 0;
    }

    export function containsPosition(range: Range, position: Position): boolean {
        return Position.compare(range.start, position) <= 0
            && Position.compare(range.end, position) >= 0;
    }

    export function intersects(left: Range, right: Range): boolean {
        return containsPosition(left, right.start)
            || containsPosition(left, right.end);
    }

    export function equals(left: Range, right: Range): boolean {
        return Position.equals(left.start, right.start)
            && Position.equals(left.end, right.end)
    }
}