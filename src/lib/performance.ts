import { Dictionary, ReadonlyDictionary } from "./core";

const timestamp = Date.now ? () => Date.now() : () => +(new Date());

let counts: Dictionary<number>;
let marks: Dictionary<number>;
let measures: Dictionary<number>;
let performanceStart: number;

reset();

export function mark(markName: string) {
    Dictionary.increment(counts, markName);
    Dictionary.set(marks, markName, timestamp());
}

export function measure(measureName: string, startMark?: string, endMark?: string) {
    const end = endMark && Dictionary.get(marks, endMark) || timestamp();
    const start = startMark && Dictionary.get(marks, startMark) || performanceStart;
    Dictionary.increment(measures, measureName, end > start ? end - start : start - end);
}

export function getMark(markName: string) {
    return Dictionary.get(marks, markName) || 0;
}

export function getMarks() {
    return Dictionary.cloneReadonly(counts);
}

export function getDuration(measureName: string) {
    return Dictionary.get(measures, measureName) || 0;
}

export function getMeasures() {
    return Dictionary.cloneReadonly(measures);
}

export function reset() {
    counts = new Dictionary<number>();
    marks = new Dictionary<number>();
    measures = new Dictionary<number>();
    performanceStart = timestamp();
}