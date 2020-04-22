/*!
 *  Copyright 2020 Ron Buckton (rbuckton@chronicles.org)
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

const timestamp = Date.now ? () => Date.now() : () => +(new Date());
const counts = new Map<string, number>();
const marks = new Map<string, number>();
const measures = new Map<string, number>();

let performanceStart: number;

reset();

export function mark(markName: string) {
    const value = counts.get(markName) || 0;
    counts.set(markName, value + 1);
    marks.set(markName, timestamp());
}

export function measure(measureName: string, startMark?: string, endMark?: string) {
    const end = endMark && marks.get(endMark) || timestamp();
    const start = startMark && marks.get(startMark) || performanceStart;
    const value = measures.get(measureName) || 0;
    measures.set(measureName, value + (end > start ? end - start : start - end));
}

export function getMark(markName: string) {
    return marks.get(markName) || 0;
}

export function getMarks() {
    return new Map<string, number>(counts) as ReadonlyMap<string, number>;
}

export function getDuration(measureName: string) {
    return measures.get(measureName) || 0;
}

export function getMeasures() {
    return new Map<string, number>(measures) as ReadonlyMap<string, number>;
}

export function reset() {
    counts.clear();
    marks.clear();
    measures.clear();
    performanceStart = timestamp();
}