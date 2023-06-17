/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as url from "url";
import { Cancelable, CancelSubscription } from "@esfx/cancelable";
import { CancelToken } from "@esfx/async-canceltoken";
import { Disposable } from "@esfx/disposable";


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
    return binarySearchBy(array, value, identity, compareNumbers);
}

export function binarySearchBy<T, K>(array: readonly T[], key: K, selector: (value: T) => K, comparison: (x: K, y: K) => number = compare): number {
    if (array.length === 0 || comparison(key, selector(array[0])) < 0) {
        return -1;
    }
    if (comparison(key, selector(array[array.length - 1])) > 0) {
        return ~array.length;
    }
    let low: number = 0;
    let high: number = array.length - 1;
    while (low <= high) {
        const middle: number = low + ((high - low) >> 1);
        const mid: K = selector(array[middle]);
        const cmp: number = comparison(mid, key);
        if (cmp > 0) {
            high = middle - 1;
        } else if (cmp < 0) {
            low = middle + 1;
        } else {
            return middle;
        }
    }
    return ~low;
}

export function compareNumbers(a: number, b: number) {
    return a - b;
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

export const emptyIterable: IterableIterator<never> = {
    next() { return { done: true, value: undefined as never }; },
    [Symbol.iterator]() { return this; }
};

export function identity<T>(value: T) {
    return value;
}

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

export function deduplicateSorted<T>(array: readonly T[], comparer: (a: T, b: T) => number | boolean): T[] {
    if (array.length === 0) return [];
    let last = array[0];
    const deduplicated: T[] = [last];
    for (let i = 1; i < array.length; i++) {
        const next = array[i];
        const result = comparer(next, last);
        if (result === true || result === 0) {
            continue;
        }
        else if (result !== false && result < 0) {
            throw new Error("Array is unsorted");
        }
        deduplicated.push(last = next);
    }
    return deduplicated;
}

export function promiseFinally<T>(promise: PromiseLike<T>, onFinally: () => void) {
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

export function mapSet<K extends object, V>(map: WeakMap<K, V>, key: K, value: V): V;
export function mapSet<K, V>(map: Map<K, V>, key: K, value: V): V;
export function mapSet<K, V>(map: { set(key: K, value: V): any; }, key: K, value: V) {
    map.set(key, value);
    return value;
}

const enumMembers = Symbol();

/**
 * Formats an enum value as a string for debugging and debug assertions.
 */
/*@internal*/
export function formatEnum(value = 0, enumObject: any, isFlags?: boolean) {
    const members = getEnumMembers(enumObject);
    if (value === 0) {
        return members.length > 0 && members[0][0] === 0 ? members[0][1] : "0";
    }
    if (isFlags) {
        let result = "";
        let remainingFlags = value;
        for (let i = members.length - 1; i >= 0 && remainingFlags !== 0; i--) {
            const [enumValue, enumName] = members[i];
            if (enumValue !== 0 && (remainingFlags & enumValue) === enumValue) {
                remainingFlags &= ~enumValue;
                result = `${enumName}${result ? ", " : ""}${result}`;
            }
        }
        if (remainingFlags === 0) {
            return result;
        }
    }
    else {
        for (const [enumValue, enumName] of members) {
            if (enumValue === value) {
                return enumName;
            }
        }
    }
    return value.toString();
}

function getEnumMembers(enumObject: any): [number, string][] {
    if (enumObject[enumMembers]) return enumObject[enumMembers];
    const result: [number, string][] = [];
    for (const name in enumObject) if (Object.prototype.hasOwnProperty.call(enumObject, name)) {
        const value = enumObject[name];
        if (typeof value === "number") {
            result.push([value, name]);
        }
    }
    return enumObject[enumMembers] = stableSort<[number, string]>(result, (x, y) => compare(x[0], y[0]));
}

export function toCancelToken(cancelable: Cancelable): CancelToken;
export function toCancelToken(cancelable: Cancelable | null | undefined): CancelToken | undefined;
export function toCancelToken(cancelable: Cancelable | null | undefined) {
    if (Cancelable.hasInstance(cancelable)) {
        return CancelToken.from(cancelable);
    }
}

export class AggregateCancelable {
    private _cancelSource = CancelToken.source();
    private _subscriptions = new Set<CancelSubscription>();
    private _cancelCount = 0;

    get canBeCanceled() {
        return this._cancelCount >= 0;
    }

    get cancelable() {
        return this._cancelSource.token;
    }

    addCancelable(cancelable: Cancelable | undefined) {
        if (this._cancelSource.token.signaled) return;
        if (cancelable === undefined || cancelable instanceof CancelToken && !cancelable.canBeSignaled) {
            // We have an observer that cannot be canceled
            if (this._cancelCount >= 0) {
                this._cancelCount = -1; // -1 indicates we cannot be canceled
                // Remove all subscriptions
                const subscriptions = [...this._subscriptions];
                this._subscriptions.clear();
                for (const subscription of subscriptions) {
                    subscription.unsubscribe();
                }
            }
            return;
        }

        // Track that we can be canceled
        this._cancelCount++;

        // Create a subscription that can only be invoked once
        let invoked = false;
        const subscription = Cancelable.subscribe(cancelable, () => {
            if (!invoked) {
                invoked = true;
                if (this._cancelCount > 0) {
                    this._cancelCount--;
                    if (this._cancelCount === 0) {
                        this._cancelCount = -2; // indicate we are now canceled.
                        this._cancelSource.cancel();
                    }
                }
            }
        });

        // Return a subscription that can remove this token.
        const unsubscribe = () => {
            if (this._subscriptions.delete(subscription)) {
                subscription.unsubscribe();
            }
        };
        return {
            unsubscribe,
            [Disposable.dispose]: unsubscribe
        };
    }
}

/**
 * Synchronizes multiple asynchronous cancelable calls for the same resource,
 * such that the operation is only canceled when all callers have canceled.
 */
export class SharedOperation<T> {
    private _callback: (cancelToken?: CancelToken) => PromiseLike<T> | T;
    private _sharedOperation: [AggregateCancelable, Promise<T>] | undefined;

    constructor(callback: (cancelToken?: CancelToken) => PromiseLike<T> | T) {
        this._callback = callback;
    }

    async invoke(cancelable?: Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();

        if (!this._sharedOperation) {
            const operation = new AggregateCancelable();
            const operationSubscription = operation.cancelable.subscribe(() => {
                if (this._sharedOperation === sharedOperation) {
                    this._sharedOperation = undefined;
                }
            });
            const promise = Promise.resolve((void 0, this._callback)(operation.cancelable));
            const sharedOperation = this._sharedOperation = [operation, promise];
            try {
                return await this._invokeWorker(sharedOperation, cancelToken);
            }
            finally {
                this._sharedOperation = undefined;
                operationSubscription.unsubscribe();
            }
        }
        else {
            return await this._invokeWorker(this._sharedOperation, cancelToken);
        }
    }

    private async _invokeWorker(sharedOperation: [AggregateCancelable, Promise<T>], cancelToken: CancelToken | undefined) {
        const [operation, promise] = sharedOperation;
        const subscription = operation.addCancelable(cancelToken);
        try {
            return await promise;
        }
        finally {
            subscription?.unsubscribe();
        }
    }
}

export function isUri(file: string) {
    return !/^([\\/]|[a-z]:($|[\\/]))/i.test(file)
        && !!url.parse(file).protocol;
}

export function isFileUri(file: string) {
    return /^file:\/\//.test(file);
}

export function getLocalPath(file: string): string {
    if (/^file:\/\//.test(file)) {
        const parsed = url.parse(file);
        if (parsed.path) {
            if (parsed.hostname) {
                file = `//${parsed.hostname}${decodeURIComponent(parsed.path)}`;
            }
            else {
                file = decodeURIComponent(parsed.path).substr(1);
            }
        }
    }

    return file;
}
