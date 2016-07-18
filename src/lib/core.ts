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
function createEmptyPrototype() {
    if (Object.create) {
        return Object.freeze(Object.create(null));
    }

    const prototype: any = {};
    for (const name of ["constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"]) {
        if (typeof prototype[name] !== "undefined") {
            prototype[name] = undefined;
        }
    }

    return Object.freeze ? Object.freeze(prototype) : prototype;
}

export class Dict<T> {
    constructor(object?: Dict<T>) {
        if (object) {
            for (const key in object) {
                if (Dict.has(object, key)) {
                    this[key] = object[key];
                }
            }
        }
    }

    [key: string]: T;
    [key: number]: T;

    static has<T>(object: Dict<T>, key: string | number): boolean {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    static get<T>(object: Dict<T>, key: string | number): T {
        return Dict.has(object, key) ? object[key] : undefined;
    }

    static set<T>(object: Dict<T>, key: string | number, value: T): Dict<T> {
        object[key] = value;
        return object;
    }

    static assign<T>(target: Dict<T>, ...sources: Dict<T>[]): Dict<T> {
        for (const source of sources) {
            for (const key in source) {
                if (Dict.has(source, key)) {
                    Dict.set(target, key, Dict.get(source, key));
                }
            }
        }

        return target;
    }

    static merge<T>(target: Dict<T>, ...sources: Dict<T>[]): Dict<T> {
        for (const source of sources) {
            for (const key in source) {
                if (Dict.has(source, key) && !Dict.has(target, key)) {
                    Dict.set(target, key, Dict.get(source, key));
                }
            }
        }

        return target;
    }

    static forEach<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => void, thisArg?: any): void {
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                callbackfn.call(thisArg, value, key, object);
            }
        }
    }

    static map<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => U, thisArg?: any): Dict<U> {
        const newObject = new Dict<U>();
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                const mappedValue = <U>callbackfn.call(thisArg, value, key, object);
                newObject[key] = mappedValue;
            }
        }

        return newObject;
    }

    static mapPairs<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => [string, U], thisArg?: any): Dict<U> {
        const newObject = new Dict<U>();
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                const [mappedKey, mappedValue] = <[string, U]>callbackfn.call(thisArg, value, key, object);
                newObject[mappedKey] = mappedValue;
            }
        }

        return newObject;
    }

    static filter<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): Dict<T> {
        const newObject = new Dict<T>();
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                if (callbackfn.call(thisArg, value, key, object)) {
                    newObject[key] = value;
                }
            }
        }

        return newObject;
    }

    static some<T>(object: Dict<T>, callbackfn?: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                if (!callbackfn || callbackfn.call(thisArg, value, key, object)) {
                    return true;
                }
            }
        }

        return false;
    }

    static every<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        let any = false;
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                if (!callbackfn.call(thisArg, value, key, object)) {
                    return false;
                }

                any = true;
            }
        }

        return any;
    }

    static find<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): T {
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return value;
                }
            }
        }

        return undefined;
    }

    static findKey<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): string {
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return key;
                }
            }
        }

        return undefined;
    }

    static keyOf<T>(object: Dict<T>, value: T): string {
        for (const key in object) {
            if (Dict.has(object, key)) {
                if (object[key] === value) {
                    return key;
                }
            }
        }

        return undefined;
    }

    static includes<T>(object: Dict<T>, value: T): boolean {
        for (const key in object) {
            if (Dict.has(object, key)) {
                if (object[key] === value) {
                    return true;
                }
            }
        }

        return false;
    }

    static reduce<T>(object: Dict<T>, callbackfn: (previousValue: T, value: T, key: string, dict: Dict<T>) => T, initialValue: T): T;
    static reduce<T, U>(object: Dict<T>, callbackfn: (previousValue: U, value: T, key: string, dict: Dict<T>) => U, initialValue: U): U;
    static reduce<T, U>(object: Dict<T>, callbackfn: (previousValue: U, value: T, key: string, dict: Dict<T>) => U, initialValue: U): U {
        let aggregate = initialValue;
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                aggregate = callbackfn(aggregate, value, key, object);
            }
        }

        return aggregate;
    }

    static turn<T>(object: Dict<T>, callbackfn: (memo: Dict<T>, value: T, key: string, dict: Dict<T>) => void, memo?: Dict<T>): Dict<T>;
    static turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<U>): Dict<U>;
    static turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<T | U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<T | U> = object): Dict<U> {
        for (const key in object) {
            if (Dict.has(object, key)) {
                const value = object[key];
                callbackfn(memo, value, key, object);
            }
        }

        return <Dict<U>>memo;
    }

    static invert<T extends string | number>(dict: Dict<T>): Dict<string> {
        const inverted = new Dict<string>();
        for (const key in dict) {
            if (Dict.has(dict, key)) {
                Dict.set(inverted, String(Dict.get(dict, key)), key);
            }
        }

        return inverted;
    }

    static keys<T>(dict: Dict<T>): string[] {
        const result: string[] = [];
        for (const key in dict) {
            if (Dict.has(dict, key)) {
                result.push(key);
            }
        }

        return result;
    }

    static values<T>(dict: Dict<T>): T[] {
        const result: T[] = [];
        for (const key in dict) {
            if (Dict.has(dict, key)) {
                result.push(Dict.get(dict, key));
            }
        }
        return result;
    }

    static entries<T>(dict: Dict<T>): [string | number, T][] {
        const result: [string | number, T][] = [];
        for (const key in dict) {
            if (Dict.has(dict, key)) {
                result.push([key, Dict.get(dict, key)]);
            }
        }
        return result;
    }
}

Dict.prototype = createEmptyPrototype();

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

export function compareStrings(x: string, y: string, ignoreCase?: boolean) {
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