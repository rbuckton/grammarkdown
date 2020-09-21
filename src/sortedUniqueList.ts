import { stableSort, deduplicateSorted } from "./core";

/* @internal */
export class SortedUniqueList<T> {
    private relationalComparer: (a: T, b: T) => number;
    private equalityComparer: (a: T, b: T) => boolean;
    private sortedAndUnique = true;
    private copyOnWrite = false;
    private unsafeArray: T[] = [];
    private unsafeLast: T | undefined = undefined;

    constructor(relationalComparer: (a: T, b: T) => number, equalityComparer: (a: T, b: T) => boolean) {
        this.relationalComparer = relationalComparer;
        this.equalityComparer = equalityComparer;
    }

    get size() {
        return this.unsafeArray.length;
    }

    get last() {
        this.ensureSortedAndUnique();
        return this.unsafeLast === undefined
            ? this.unsafeLast = (this.unsafeArray?.length ? this.unsafeArray[this.unsafeArray.length - 1] : undefined)
            : this.unsafeLast;
    }

    clone() {
        const copy = new SortedUniqueList(this.relationalComparer, this.equalityComparer);
        copy.sortedAndUnique = this.sortedAndUnique;
        copy.copyOnWrite = false;
        copy.unsafeArray = this.unsafeArray.slice();
        copy.unsafeLast = this.unsafeLast;
        return copy;
    }

    valueAt(index: number) {
        this.ensureSortedAndUnique();
        return this.unsafeArray[index];
    }

    push(...values: T[]) {
        for (const value of values) {
            if (this.sortedAndUnique) {
                const last = this.last;
                if (last === undefined || this.relationalComparer(value, last) > 0) {
                    this.unsafeAdd(value, /*sortedAndUnique*/ true);
                    continue;
                }
                if (this.equalityComparer(value, last)) {
                    continue;
                }
            }
            this.unsafeAdd(value, /*sortedAndUnique*/ false);
        }
    }

    mutate(cb: (array: T[]) => void) {
        if (this.copyOnWrite) {
            this.unsafeArray = this.unsafeArray.slice();
        }
        this.copyOnWrite = true;
        cb(this.unsafeArray);
        this.sortedAndUnique = false;
        this.unsafeLast = undefined;
    }

    toArray(): readonly T[] {
        this.ensureSortedAndUnique();
        this.copyOnWrite = true;
        return this.unsafeArray;
    }

    private unsafeAdd(value: T, sortedAndUnique: boolean) {
        if (this.copyOnWrite) {
            this.unsafeArray = this.unsafeArray.slice();
            this.copyOnWrite = false;
        }

        this.unsafeArray.push(value);
        this.unsafeLast = sortedAndUnique ? value : undefined;
        this.sortedAndUnique = sortedAndUnique;
    }

    private ensureSortedAndUnique() {
        if (!this.sortedAndUnique) {
            this.unsafeArray = deduplicateSorted(stableSort(this.unsafeArray, this.relationalComparer), this.equalityComparer);
            this.unsafeLast = undefined;
            this.sortedAndUnique = true;
        }
    }
}