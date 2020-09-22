/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";
import { isUri, isFileUri, getLocalPath } from "../core";
import { ReadFileCallback, WriteFileCallback, CoreAsyncHost } from "../host";

/** {@docCategory Hosts} */
export interface NodeAsyncHostOptions {
    /**
     * Indicates whether the host is case-insensitive (`true`) or case-sensitive (`false`).
     */
    ignoreCase?: boolean;
    /**
     * A set of known grammars in the form `{ "name": "path" }`
     */
    knownGrammars?: Record<string, string>;
    /**
     * Indicates whether to include builtin grammars in the set of known grammars.
     */
    useBuiltinGrammars?: boolean;
    readFile?: ReadFileCallback | false;
    writeFile?: WriteFileCallback | false;
    allowUris?: false;
}

/** {@docCategory Hosts} */
export class NodeAsyncHost extends CoreAsyncHost {
    constructor(options: NodeAsyncHostOptions = {}) {
        const {
            ignoreCase = ignoreCaseFallback(),
            readFile = readFileFallback,
            writeFile = writeFileFallback,
            ...baseOptions
        } = options;
        super({
            ...baseOptions,
            ignoreCase,
            resolveFile: resolveFileFallback,
            readFile: readFile ? (file, cancelToken) => readFile(file, cancelToken) : cannotComplete,
            writeFile: writeFile ? (file, content, cancelToken) => writeFile(file, content, cancelToken) : cannotComplete
        });
    }
}

function resolveFileFallback(file: string, referer?: string) {
    if (isFileUri(file) || path.isAbsolute(file)) {
        return file;
    }
    else if (referer) {
        return isUri(referer)
            ? url.resolve(referer, file)
            : path.resolve(path.dirname(referer), file);
    }
    else {
        return path.resolve(file);
    }
}

function readFileFallback(file: string) {
    return new Promise<string | undefined>((resolve, reject) => {
        file = getLocalPath(file);
        if (isUri(file)) return undefined;
        fs.readFile(file, null, (error, buffer) => resolve(error ? undefined : decodeBuffer(buffer)));
    });
}

function decodeBuffer(buffer: Buffer) {
    if (buffer[0] === 0xff && buffer[1] === 0xfe) {
        // UTF-16 LE BOM
        return buffer.slice(2).toString("utf16le");
    }
    else if (buffer[0] === 0xfe && buffer[1] === 0xff) {
        // UTF-16 BE BOM
        return buffer.slice(2).swap16().toString("utf16le");
    }
    else if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        // UTF-8 with BOM
        return buffer.slice(3).toString("utf8");
    }
    else {
        // plain UTF8
        return buffer.toString("utf8");
    }
}

function writeFileFallback(file: string, content: string) {
    return new Promise<void>((resolve, reject) => {
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        fs.writeFile(file, content, "utf8", (error) => error ? reject(error) : resolve());
    });
}

function cannotComplete(): never {
    throw new Error("Operation cannot be completed");
}

function ignoreCaseFallback() {
    return /^(win32|win64|darwin)$/.test(os.platform());
}
