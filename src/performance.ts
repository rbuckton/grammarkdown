/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 *
 * THIRD PARTY LICENSE NOTICE:
 *
 * The following is derived from the implementation of `ts.performance` in TypeScript.
 *
 * TypeScript is licensed under the Apache 2.0 License, a copy of which can be found here:
 *
 *   https://github.com/microsoft/TypeScript/blob/b1323feb7b69acde6916889ade5415865abe9bd2/LICENSE.txt
 *
 */

interface PerformanceHooks {
    performance: Performance;
    PerformanceObserver: PerformanceObserverConstructor;
}

interface Performance {
    readonly timeOrigin: number;
    clearMarks(name?: string): void;
    clearMeasures?(name?: string): void;
    mark(name: string): void;
    measure(name: string, startMark?: string, endMark?: string): void;
    now(): number;
}

interface PerformanceEntry {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
}

interface PerformanceObserverEntryList {
    getEntries(): PerformanceEntryList;
    getEntriesByName(name: string, type?: string): PerformanceEntryList;
    getEntriesByType(type: string): PerformanceEntryList;
}

interface PerformanceObserver {
    disconnect(): void;
    observe(options: { entryTypes: readonly string[] }): void;
}

type PerformanceObserverConstructor = new (callback: (list: PerformanceObserverEntryList, observer: PerformanceObserver) => void) => PerformanceObserver;
type PerformanceEntryList = PerformanceEntry[];

declare const performance: Performance | undefined;
declare const PerformanceObserver: PerformanceObserverConstructor | undefined;

function hasRequiredAPI(performance: Performance | undefined, PerformanceObserver: PerformanceObserverConstructor | undefined) {
    return typeof performance === "object" &&
        typeof performance.timeOrigin === "number" &&
        typeof performance.clearMarks === "function" &&
        (typeof performance.clearMeasures === "function" || performance.clearMeasures === undefined) &&
        typeof performance.mark === "function" &&
        typeof performance.measure === "function" &&
        typeof performance.now === "function" &&
        typeof PerformanceObserver === "function";
}

function tryGetWebPerformanceHooks(): PerformanceHooks | undefined {
    if (typeof performance === "object" &&
        typeof PerformanceObserver === "function" &&
        hasRequiredAPI(performance, PerformanceObserver)) {
        return {
            performance,
            PerformanceObserver
        };
    }
}

function tryGetNodePerformanceHooks(): PerformanceHooks | undefined {
    if (typeof module === "object" && typeof require === "function" && typeof process === "object") {
        try {
            const { performance, PerformanceObserver } = require("perf_hooks") as typeof import("perf_hooks");
            if (hasRequiredAPI(performance, PerformanceObserver)) {
                // there is a bug in Node's performance.measure prior to 12.16.3/13.13.0
                const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(process.versions.node);
                const major = match ? parseInt(match[1], 10) : 0;
                const minor = match ? parseInt(match[2], 10) : 0;
                const patch = match ? parseInt(match[3], 10) : 0;
                if (major < 12 ||
                    major === 12 && (minor < 16 || minor === 16 && patch < 3) ||
                    major === 13 && (minor < 13)) {
                    return {
                        performance: {
                            get timeOrigin() { return performance.timeOrigin; },
                            now() { return performance.now(); },
                            clearMarks(name?) { return performance.clearMarks(name); },
                            mark(name) { return performance.mark(name); },
                            measure(name, start = "nodeStart", end?) {
                                if (end === undefined) {
                                    end = "__performance.measure-fix__";
                                    performance.mark(end);
                                }
                                performance.measure(name, start, end);
                                if (end = "__performance.measure-fix__") {
                                    performance.clearMarks("__performance.measure-fix__");
                                }
                            }
                        },
                        PerformanceObserver
                    };
                }
                return {
                    performance,
                    PerformanceObserver
                }
            }
        }
        catch {
            // ignore errors
        }
    }
}

const nativePerformanceHooks = tryGetWebPerformanceHooks() || tryGetNodePerformanceHooks();
const nativePerformance = nativePerformanceHooks?.performance;
const marks = new Map<string, number>();
const measures = new Map<string, number>();
let observer: PerformanceObserver | undefined;

reset();

export function mark(markName: string) {
    nativePerformance?.mark(markName);
}

export function measure(measureName: string, startMark?: string, endMark?: string) {
    if (startMark !== undefined && endMark !== undefined) {
        nativePerformance?.measure(measureName, startMark, endMark);
    }
    else if (startMark !== undefined) {
        nativePerformance?.measure(measureName, startMark);
    }
    else {
        nativePerformance?.measure(measureName);
    }
}

export function getMark(markName: string) {
    return marks.get(markName) ?? 0;
}

export function getDuration(measureName: string) {
    return measures.get(measureName) ?? 0;
}

export function getMeasures() {
    return measures as ReadonlyMap<string, number>;
}

export function reset() {
    nativePerformance?.clearMarks();
    nativePerformance?.clearMeasures?.();
    observer?.disconnect();
    marks.clear();
    measures.clear();
    if (nativePerformanceHooks) {
        observer ??= new nativePerformanceHooks.PerformanceObserver(observePerformance);
        observer.observe({ entryTypes: ["mark", "measure"] });
    }
}

function observePerformance(list: PerformanceObserverEntryList) {
    for (const mark of list.getEntriesByType("mark")) {
        marks.set(mark.name, mark.startTime);
    }
    for (const measure of list.getEntriesByType("measure")) {
        measures.set(measure.name, (measures.get(measure.name) || 0) + measure.duration);
    }
}