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

const dictionaryModeKey = "__DICTIONARY_MODE__";
const supportsObjectCreate = typeof Object.create === "function";
const hasOwnProperty = Object.prototype.hasOwnProperty;
const isPrototypeOf = Object.prototype.isPrototypeOf;
const toString = Object.prototype.toString;
const isArray = Array.isArray || ((object: any): object is Array<any> => toString.call(object) === "[object Array]");

const { hasCore, getCore, guardCore, setCore, deleteCore, freezeCore } = (function () {
    function uplevel() {
        return {
            hasCore<T>(object: Dictionary<T>, key: string | number) { return key in object; },
            getCore<T>(object: Dictionary<T>, key: string | number) { return object[key]; },
            guardCore<T>(object: Dictionary<T>, key: string | number) { return true; },
            setCore<T>(object: Dictionary<T>, key: string | number, value: T) { return object[key] = value, object; },
            deleteCore<T>(object: Dictionary<T>, key: string | number) { return delete object[key] },
            freezeCore<T>(object: Dictionary<T>) { return <ReadonlyDictionary<T>>Object.freeze(object); }
        };
    }
    function downlevel() {
        return {
            hasCore<T>(object: Dictionary<T>, key: string | number) { return hasOwnProperty.call(object, key); },
            getCore<T>(object: Dictionary<T>, key: string | number) { return hasOwnProperty.call(object, key) ? object[key] : undefined; },
            guardCore<T>(object: Dictionary<T>, key: string | number) { return hasOwnProperty.call(object, key); },
            setCore<T>(object: Dictionary<T>, key: string | number, value: T) { return object[key] = value, object; },
            deleteCore<T>(object: Dictionary<T>, key: string | number) { return delete object[key] },
            freezeCore<T>(object: Dictionary<T>) { return <ReadonlyDictionary<T>>object; }
        };
    }
    return Object.create ? uplevel() : downlevel();
})();

export interface DictionaryLike<T> {
    [key: string]: T;
    [key: number]: T;
}

class ObjectModeHelper {}

export class Dictionary<T> {
    private "Dictionary<T>";

    constructor(object?: DictionaryLike<T> | [string, T][]) {
        delete (this[dictionaryModeKey] = undefined, this)[dictionaryModeKey];
        if (isArray(object)) {
            for (const [key, value] of object) {
                setCore(this, key, value);
            }
        }
        else {
            for (const key in object) if (hasOwnProperty.call(object, key)) {
                setCore(this, key, object[key]);
            }
        }
    }

    [key: string]: T;
    [key: number]: T;

    static has<T>(object: Dictionary<T>, key: string | number): boolean {
        return hasCore(object, key);
    }

    static guard<T>(object: Dictionary<T>, key: string | number): boolean {
        return guardCore(object, key);
    }

    static get<T>(object: Dictionary<T>, key: string | number): T {
        return getCore(object, key);
    }

    static getOrUpdate<T>(object: Dictionary<T>, key: string | number, value: T): T {
        return hasCore(object, key) ? object[key] : object[key] = value;
    }

    static getOrCreate<T>(object: Dictionary<T>, key: string | number, factory: (key: string | number) => T): T {
        return hasCore(object, key) ? object[key] : object[key] = factory(key);
    }

    static set<T>(object: Dictionary<T>, key: string | number, value: T): Dictionary<T> {
        return setCore(object, key, value);
    }

    static pick<T>(object: Dictionary<T>, key: string | number): T {
        if (hasCore(object, key)) {
            const value = object[key];
            deleteCore(object, key);
            return value;
        }
    }

    static pickRange<T>(object: Dictionary<T>, keys: string[]): Dictionary<T> {
        const result = new Dictionary<T>();
        for (const key of keys) {
            if (hasCore(object, key)) {
                setCore(result, key, object[key]);
                deleteCore(object, key);
            }
        }
        return result;
    }

    static pickWhere<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): Dictionary<T> {
        const result = new Dictionary<T>();
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (callbackfn.call(thisArg, value, key, object)) {
                setCore(result, key, value);
                deleteCore(object, key);
            }
        }
        return result;
    }

    static delete<T>(object: Dictionary<T>, key: string | number): boolean {
        return deleteCore(object, key);
    }

    static deleteWhere<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any) {
        for (const key in object) if (guardCore(object, key)) {
            if (callbackfn.call(thisArg, object[key], key, object)) {
                deleteCore(object, key);
            }
        }
    }

    static clear<T>(object: Dictionary<T>) {
        for (const key in object) if (guardCore(object, key)) {
            deleteCore(object, key);
        }
    }

    static assign<T>(target: Dictionary<T>, ...sources: DictionaryLike<T>[]): Dictionary<T> {
        for (const source of sources) {
            for (const key in source) if (hasOwnProperty.call(source, key)) {
                setCore(target, key, source[key]);
            }
        }
        return target;
    }

    static merge<T>(target: Dictionary<T>, ...sources: DictionaryLike<T>[]): Dictionary<T> {
        for (const source of sources) {
            for (const key in source) if (hasOwnProperty.call(source, key)) {
                if (!hasCore(target, key)) {
                    setCore(target, key, source[key]);
                }
            }
        }
        return target;
    }

    static from<T>(array: T[], keySelector: (value: T) => string | number): Dictionary<T>;
    static from<T, U>(array: T[], keySelector: (value: T) => string | number, elementSelector?: (value: T) => U): Dictionary<U>;
    static from<T, U>(array: T[], keySelector: (value: T) => string | number, elementSelector?: (value: T) => U): Dictionary<T | U> {
        const dictionary = new Dictionary<T | U>();
        for (const value of array) {
            setCore(dictionary, keySelector(value), elementSelector ? elementSelector(value) : value);
        }
        return dictionary;
    }

    static forEach<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => void, thisArg?: any): void {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            callbackfn.call(thisArg, value, key, object);
        }
    }

    static map<T, U>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => U, thisArg?: any): Dictionary<U> {
        const result = new Dictionary<U>();
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            const mappedValue = <U>callbackfn.call(thisArg, value, key, object);
            result[key] = mappedValue;
        }
        return result;
    }

    static mapPairs<T, U>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => [string, U], thisArg?: any): Dictionary<U> {
        const result = new Dictionary<U>();
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            const [mappedKey, mappedValue] = <[string, U]>callbackfn.call(thisArg, value, key, object);
            result[mappedKey] = mappedValue;
        }
        return result;
    }

    static mapWith<T, U>(object: Dictionary<T>, callbacks: DictionaryLike<(value: T, key: string, object: Dictionary<T>) => U>): Dictionary<U> {
        const result = new Dictionary<U>();
        for (const key in object) if (guardCore(object, key)) {
            if (hasOwnProperty.call(callbacks, key)) {
                result[key] = callbacks[key](object[key], key, object);
            }
        }
        return result;
    }

    static mapPairsWith<T, U>(object: Dictionary<T>, callbacks: DictionaryLike<(value: T, key: string, object: Dictionary<T>) => [string | number, U]>): Dictionary<U> {
        const result = new Dictionary<U>();
        for (const key in object) if (guardCore(object, key)) {
            if (hasOwnProperty.call(callbacks, key)) {
                const [mappedKey, mappedValue] = callbacks[key](object[key], key, object);
                result[mappedKey] = mappedValue;
            }
        }
        return result;
    }

    static filter<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): Dictionary<T> {
        const newObject = new Dictionary<T>();
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (callbackfn.call(thisArg, value, key, object)) {
                newObject[key] = value;
            }
        }
        return newObject;
    }

    static clone<T>(object: Dictionary<T>): Dictionary<T> {
        return new Dictionary<T>(object);
    }

    static cloneReadonly<T>(object: Dictionary<T>): ReadonlyDictionary<T> {
        const clone = new Dictionary<T>(object);
        const savedPrototype = ObjectModeHelper.prototype;
        ObjectModeHelper.prototype = clone;
        new ObjectModeHelper();
        ObjectModeHelper.prototype = savedPrototype;
        return freezeCore(clone);
    }

    static count<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): number {
        let count = 0;
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(thisArg, value, key, object)) {
                count++;
            }
        }
        return count;
    }

    static some<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): boolean {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(thisArg, value, key, object)) {
                return true;
            }
        }
        return false;
    }

    static every<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): boolean {
        let any = false;
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn.call(thisArg, value, key, object)) {
                return false;
            }

            any = true;
        }
        return any;
    }

    static find<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): T {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (callbackfn.call(value, key, object)) {
                return value;
            }
        }
        return undefined;
    }

    static findKey<T>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): string {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (callbackfn.call(value, key, object)) {
                return key;
            }
        }
        return undefined;
    }

    static first<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): T {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(value, key, object)) {
                return value;
            }
        }
    }

    static firstPair<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): [string, T] {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(value, key, object)) {
                return [key, value];
            }
        }
    }

    static last<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): T {
        let result: T;
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(value, key, object)) {
                result = value;
            }
        }
        return result;
    }

    static lastPair<T>(object: Dictionary<T>, callbackfn?: (value: T, key: string, object: Dictionary<T>) => boolean, thisArg?: any): [string, T] {
        let result: [string, T];
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            if (!callbackfn || callbackfn.call(value, key, object)) {
                result = [key, value];
            }
        }
        return result;
    }

    static reverse<T>(object: Dictionary<T>) {
        const result = new Dictionary<T>();
        const keys = Dictionary.keys(object);
        for (let i = keys.length - 1; i >= 0; i--) {
            result[keys[i]] = object[keys[i]];
        }
        return result;
    }

    static sort<T>(object: Dictionary<T>, callbackfn: (a: [string, T], b: [string, T]) => number = (a, b) => compare(a[0], b[0])) {
        const entries = Dictionary.entries(object);
        entries.sort(callbackfn);
        return new Dictionary<T>(entries);
    }

    static keyOf<T>(object: Dictionary<T>, value: T): string {
        for (const key in object) if (guardCore(object, key)) {
            if (object[key] === value) {
                return key;
            }
        }
        return undefined;
    }

    static includes<T>(object: Dictionary<T>, value: T): boolean {
        for (const key in object) if (guardCore(object, key)) {
            if (object[key] === value) {
                return true;
            }
        }
        return false;
    }

    static contains<T>(object: Dictionary<T>, other: DictionaryLike<T>) {
        if (object === other) return true;
        if (!object || !other) return false;
        for (const key in other) if (hasOwnProperty.call(other, key)) {
            if (!hasCore(object, key)) return false;
            if (getCore(object, key) !== other[key]) return false;
        }
        return true;
    }

    static equals<T>(object: Dictionary<T>, other: DictionaryLike<T>) {
        if (object === other) return true;
        if (!object || !other) return false;
        for (const key in object) if (guardCore(object, key)) {
            if (!hasOwnProperty.call(other, key)) return false;
            if (getCore(object, key) !== other[key]) return false;
        }
        for (const key in other) if (hasOwnProperty.call(other, key)) {
            if (!hasCore(object, key)) return false;
        }
        return true;
    }

    static reduce<T, U>(object: Dictionary<T>, callbackfn: (previousValue: U, value: T, key: string, object: Dictionary<T>) => U, initialValue: U): U {
        let aggregate = initialValue;
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            aggregate = callbackfn(aggregate, value, key, object);
        }
        return aggregate;
    }

    static turn<T>(object: Dictionary<T>, callbackfn: (memo: Dictionary<T>, value: T, key: string, object: Dictionary<T>) => void, memo?: Dictionary<T>): Dictionary<T>;
    static turn<T, U>(object: Dictionary<T>, callbackfn: (memo: Dictionary<U>, value: T, key: string, object: Dictionary<T>) => void, memo: Dictionary<U>): Dictionary<U>;
    static turn<T, U>(object: Dictionary<T>, callbackfn: (memo: Dictionary<T | U>, value: T, key: string, object: Dictionary<T>) => void, memo: Dictionary<T | U> = object): Dictionary<T | U> {
        for (const key in object) if (guardCore(object, key)) {
            const value = object[key];
            callbackfn(memo, value, key, object);
        }
        return memo;
    }

    static invert<T extends string | number>(object: Dictionary<T>): Dictionary<string> {
        const inverted = new Dictionary<string>();
        for (const key in object) if (guardCore(object, key)) {
            setCore(inverted, String(getCore(object, key)), key);
        }
        return inverted;
    }

    static keys<T>(object: Dictionary<T>): string[] {
        const result: string[] = [];
        for (const key in object) if (guardCore(object, key)) {
            result.push(key);
        }
        return result;
    }

    static values<T>(object: Dictionary<T>): T[] {
        const result: T[] = [];
        for (const key in object) if (guardCore(object, key)) {
            result.push(getCore(object, key));
        }
        return result;
    }

    static entries<T>(object: Dictionary<T>): [string, T][] {
        const result: [string, T][] = [];
        for (const key in object) if (guardCore(object, key)) {
            result.push([key, getCore(object, key)]);
        }
        return result;
    }

    static toObject<T>(object: Dictionary<T>): DictionaryLike<T> {
        const result: DictionaryLike<T> = {};
        for (const key in object) if (guardCore(object, key)) {
            result[key] = object[key];
        }
        return result;
    }

    static toArray<T, U>(object: Dictionary<T>, callbackfn: (value: T, key: string, object: Dictionary<T>) => U, thisArg?: any): U[] {
        const result: U[] = [];
        for (const key in object) if (guardCore(object, key)) {
            result.push(callbackfn.call(thisArg, object[key], key, object));
        }
        return result;
    }

    static increment(object: Dictionary<number>, key: string | number, offsetValue?: number) {
        const value = getCore(object, key) || 0;
        object[key] = value + (offsetValue || 1);
        return value;
    }
}

Dictionary.prototype = createEmptyPrototype();

export interface ReadonlyDictionary<T> extends Dictionary<T> {
    readonly [key: number]: T;
    readonly [key: string]: T;
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

function createEmptyPrototype() {
    if (Object.create) {
        return Object.freeze(Object.create(null));
    }

    const prototype: any = {};
    for (const name of ["constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"]) {
        delete prototype[name];
        if (typeof prototype[name] !== "undefined") {
            prototype[name] = undefined;
        }
    }

    return prototype;
}