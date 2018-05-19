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

// NOTE: grammarkdown requires a minimum of ES5.
if (typeof Object.create !== "function") throw new Error("Grammarkdown requires a minimum host engine of ES5.");

const hasOwnProperty = Object.prototype.hasOwnProperty;

export interface DictionaryLike<T> {
    [key: string]: T;
    [key: number]: T;
}

export function mapFromObject<T>(object: DictionaryLike<T>) {
    const map = new Map<string, T>();
    for (const p in object) {
        if (hasOwnProperty.call(object, p)) {
            map.set(p, object[p]);
        }
    }
    return map;
}

export function binarySearch(array: number[], value: number): number {
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        const middle = low + ((high - low) >> 1);
        const midValue = array[middle];
        if (midValue === value) {
            return middle;
        }
        else if (midValue > value) {
            high = middle - 1;
        }
        else {
            low = middle + 1;
        }
    }

    return ~low;
}

export function compareStrings(x: string | undefined, y: string | undefined, ignoreCase?: boolean) {
    return ignoreCase
        ? compare(x && x.toLocaleLowerCase(), y && y.toLocaleLowerCase())
        : compare(x, y);
}

export function compare(x: any, y: any) {
    if (x === y) return 0;
    if (x === undefined || x === null) return -1;
    if (y === undefined || y === null) return +1;
    if (x < y) return -1;
    if (x > y) return +1;
    return 0;
}

export function forEach<T, U>(array: ReadonlyArray<T> | undefined, cb: (value: T) => U | undefined): U | undefined {
    if (array !== undefined) {
        for (const item of array) {
            const result = cb(item);
            if (result) return result;
        }
    }
}

export interface TextRange {
    pos: number;
    end: number;
}

export interface Position {
    line: number;
    character: number;
}

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

export interface Range {
    start: Position;
    end: Position;
}

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

export const emptyIterable: IterableIterator<never> = {
    next() { return { done: true, value: undefined as never }; },
    [Symbol.iterator]() { return this; }
};

export function first<T>(iterable: Iterable<T> | T[] | undefined) {
    if (iterable === undefined) return undefined;
    if (iterable === emptyIterable) return undefined;
    if (Array.isArray(iterable)) return iterable.length > 0 ? iterable[0] : undefined;
    for (const item of iterable) return item;
}

export function last<T>(iterable: Iterable<T> | T[] | undefined) {
    if (iterable === undefined) return undefined;
    if (iterable === emptyIterable) return undefined;
    if (Array.isArray(iterable)) return iterable.length > 0 ? iterable[iterable.length - 1] : undefined;
    let last: T | undefined;
    for (const item of iterable) last = item;
    return last;
}

export function only<T>(iterable: Iterable<T> | T[] | undefined) {
    if (iterable === undefined) return undefined;
    if (iterable === emptyIterable) return undefined;
    if (Array.isArray(iterable)) return iterable.length === 1 ? iterable[0] : undefined;
    let only: T | undefined;
    let first = true;
    for (const item of iterable) {
        if (!first) return undefined;
        only = item;
    }
    return only;
}

export function stableSort<T>(array: ReadonlyArray<T>, comparer: (a: T, b: T) => number) {
    const indices = array.map((_, i) => i);
    indices.sort((x, y) => comparer(array[x], array[y]) || x - y);
    return indices.map(i => array[i]);
}

export function concat<T>(a: T[], b: T[] | undefined): T[];
export function concat<T>(a: T[] | undefined, b: T[]): T[];
export function concat<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined;
export function concat<T>(a: T[] | undefined, b: T[] | undefined) {
    return a ? b ? a.concat(b) : a : b;
}

export function promiseFinally<T>(promise: Promise<T>, onFinally: () => void) {
    return promise.then(value => {
        onFinally();
        return value;
    }, e => {
        onFinally();
        throw e;
    });
}

export function pipe<T, U>(result: T | Promise<T>, next: (value: T) => U | Promise<U>): U | Promise<U>;
export function pipe<T, U>(result: T | Promise<T> | undefined, next: (value: T | undefined) => U | Promise<U>): U | Promise<U>;
export function pipe<T, U>(result: T | Promise<T> | undefined, next: (value: T | undefined) => U | Promise<U> | undefined): U | Promise<U> | undefined;
export function pipe<T, U>(result: T | Promise<T>, next: (value: T) => U | Promise<U>) {
    return isPromise(result) ? result.then(next) : next(result);
}

export function isPromise<T>(value: T | Promise<T> | undefined): value is Promise<T> {
    return typeof value === "object" && "then" in (value as object);
}

export function forEachPossiblyAsync<T, U>(iterable: Iterable<T>, callback: (value: T) => Promise<U> | U | undefined): void | Promise<void> {
    const iter = iterable[Symbol.iterator]();
    const next = (): void | Promise<void> => {
        while (true) {
            const { value, done } = iter.next();
            if (done) break;
            const result = callback(value);
            if (isPromise(result)) return pipe(result, next);
        }
    }
    return next();
}