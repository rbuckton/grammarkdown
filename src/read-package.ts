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

import { readFile, readFileSync } from "fs";

export interface Person {
    name?: string;
    email?: string;
}

export interface Package {
    name?: string;
    author?: string | Person;
    homepage?: string;
    version?: string;
    license?: string;
    description?: string;
    keywords?: string[];
    main?: string;
    typings?: string;
    dependencies?: { [name: string]: string; };
    devDependencies?: { [name: string]: string; };
}

export function readPackage(packagePath: string, done: (err: any, pkg: Package | undefined) => void): void {
    readFile(packagePath, "utf8", (err, data) => {
        try {
            if (err) throw err;
            done(undefined, JSON.parse(data));
        }
        catch (e) {
            done(err, undefined);
        }
    });
}

export function readPackageSync(packagePath: string): Package {
    let data = readFileSync(packagePath, "utf8");
    return JSON.parse(data);
}