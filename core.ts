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
    
    let prototype: any = {};
    for (let name of ["constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable"]) {
        if (typeof prototype[name] !== "undefined") {
            prototype[name] = undefined;
        }
    }
    
    return Object.freeze ? Object.freeze(prototype) : prototype;
}

export class Dict<T> {
    constructor(object?: Dict<T>) {
        if (object) {
            for (let key in object) {
                if (Dict.has(object, key)) {
                    this[key] = object[key];
                }
            }
        }
    }

    [key: string]: T;
    
    static has<T>(object: Dict<T>, key: string): boolean {
        return Object.prototype.hasOwnProperty.call(object, key);
    }
    
    static get<T>(object: Dict<T>, key: string): T {
        return Dict.has(object, key) ? object[key] : undefined;
    }
    
    static set<T>(object: Dict<T>, key: string, value: T): Dict<T> {
        object[key] = value;
        return object;
    }
    
    static assign<T>(target: Dict<T>, ...sources: Dict<T>[]): Dict<T> {
        for (let source of sources) {
            for (let key in source) {
                if (Dict.has(source, key)) {
                    Dict.set(target, key, Dict.get(source, key));
                }
            }
        }
        
        return target;
    }

    static merge<T>(target: Dict<T>, ...sources: Dict<T>[]): Dict<T> {
        for (let source of sources) {
            for (let key in source) {
                if (Dict.has(source, key) && !Dict.has(target, key)) {
                    Dict.set(target, key, Dict.get(source, key));
                }
            }
        }
        
        return target;
    }
    
    static forEach<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => void, thisArg?: any): void {
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                callbackfn.call(thisArg, value, key, object);
            }
        }
    }
    
    static map<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => U, thisArg?: any): Dict<U> {
        let newObject = new Dict<U>();
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                let mappedValue = <U>callbackfn.call(thisArg, value, key, object);
                newObject[key] = mappedValue;
            }
        }
        
        return newObject;
    }
    
    static mapPairs<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => [string, U], thisArg?: any): Dict<U> {
        let newObject = new Dict<U>();
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                let [mappedKey, mappedValue] = <[string, U]>callbackfn.call(thisArg, value, key, object);
                newObject[mappedKey] = mappedValue;
            }
        }
        
        return newObject;
    }
    
    static filter<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): Dict<T> {
        let newObject = new Dict<T>();
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                if (callbackfn.call(thisArg, value, key, object)) {
                    newObject[key] = value;
                }
            }
        }
        
        return newObject;
    }
    
    static some<T>(object: Dict<T>, callbackfn?: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                if (!callbackfn || callbackfn.call(thisArg, value, key, object)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    static every<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        let any = false;
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                if (!callbackfn.call(thisArg, value, key, object)) {
                    return false;
                }
                
                any = true;
            }
        }
        
        return any;
    }
    
    static find<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): T {
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return value;
                }
            }
        }
        
        return undefined;
    }
    
    static findKey<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): string {
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return key;
                }
            }
        }
        
        return undefined;
    }
    
    static keyOf<T>(object: Dict<T>, value: T): string {
        for (let key in object) {
            if (Dict.has(object, key)) {
                if (object[key] === value) {
                    return key;
                }
            }
        }
        
        return undefined;
    }
    
    static includes<T>(object: Dict<T>, value: T): boolean {
        for (let key in object) {
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
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                aggregate = callbackfn(aggregate, value, key, object);
            }
        }
        
        return aggregate;
    }
    
    static turn<T>(object: Dict<T>, callbackfn: (memo: Dict<T>, value: T, key: string, dict: Dict<T>) => void, memo?: Dict<T>): Dict<T>;
    static turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<U>): Dict<U>;
    static turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<T | U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<T | U> = object): Dict<U> {        
        for (let key in object) {
            if (Dict.has(object, key)) {
                let value = object[key];
                callbackfn(memo, value, key, object);
            }
        }
        
        return <Dict<U>>memo;
    }
    
    static invert<T extends string | number>(dict: Dict<T>): Dict<string> {
        let inverted = new Dict<string>();
        for (let key in dict) {
            if (Dict.has(dict, key)) {
                Dict.set(inverted, String(Dict.get(dict, key)), key);
            }
        }
        
        return inverted;
    }
}

Dict.prototype = createEmptyPrototype();

export function binarySearch(array: number[], value: number): number {
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        let middle = low + ((high - low) >> 1);
        let midValue = array[middle];
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