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

import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";
import * as performance from "../performance";
import { SourceFile } from "../nodes";
import { CancellationToken } from "prex";
import { promiseFinally, pipe, toCancelToken, wrapCancelToken, isUri, isFileUri, getLocalPath } from "../core";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";
import { HostBaseOptions, LegacyReadFileSyncCallback, ReadFileSyncCallback, LegacyWriteFileSyncCallback, WriteFileSyncCallback, HostBase, ReadFileCallback, LegacyReadFileCallback, WriteFileCallback, LegacyWriteFileCallback, CoreSyncHost, CoreAsyncHost } from "../host";

/** {@docCategory Hosts} */
export interface NodeSyncHostOptions extends HostBaseOptions {
    readFileSync?: LegacyReadFileSyncCallback | ReadFileSyncCallback | false;
    writeFileSync?: LegacyWriteFileSyncCallback | WriteFileSyncCallback | false;
}

/** {@docCategory Hosts} */
export class NodeSyncHost extends CoreSyncHost {
    constructor(options: NodeSyncHostOptions = {}) {
        const {
            ignoreCase = ignoreCaseFallback(),
            readFileSync = readFileSyncFallback,
            writeFileSync = writeFileSyncFallback,
            ...baseOptions
        } = options;
        super({
            ...baseOptions,
            ignoreCase,
            resolveFile: resolveFileFallback,
            readFileSync: readFileSync ? (file, cancelToken) => readFileSync(file, wrapCancelToken(cancelToken)) : cannotCompleteSynchronously,
            writeFileSync: writeFileSync ? (file, content, cancelToken) => writeFileSync(file, content, wrapCancelToken(cancelToken)) : cannotCompleteSynchronously
        });
    }
}

/** {@docCategory Hosts} */
export interface NodeAsyncHostOptions extends HostBaseOptions {
    readFile?: ReadFileCallback | LegacyReadFileCallback | false;
    writeFile?: WriteFileCallback | LegacyWriteFileCallback | false;
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
            readFile: readFile ? (file, cancelToken) => readFile(file, wrapCancelToken(cancelToken)) : cannotCompleteAsynchronously,
            writeFile: writeFile ? (file, content, cancelToken) => writeFile(file, content, wrapCancelToken(cancelToken)) : cannotCompleteAsynchronously
        });
    }
}

/** {@docCategory Hosts} */
export interface HostOptions extends HostBaseOptions {
    useBuiltinGrammars?: boolean;
    readFile?: ReadFileCallback | LegacyReadFileCallback;
    readFileSync?: ReadFileSyncCallback | LegacyReadFileSyncCallback;
    writeFile?: WriteFileCallback | LegacyWriteFileCallback;
    writeFileSync?: WriteFileSyncCallback | LegacyWriteFileSyncCallback;
}

/**
 * @deprecated Use `SyncHost` or `AsyncHost` instead
 * {@docCategory Hosts}
 */
export class Host extends HostBase {
    private _readFileCallback?: (file: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<string | undefined> | string | undefined;
    private _readFileSyncCallback?: (file: string, cancelToken?: CancelToken & CancellationToken) => string | undefined;
    private _writeFileCallback?: (file: string, content: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<void> | void;
    private _writeFileSyncCallback?: (file: string, content: string, cancelToken?: CancelToken & CancellationToken) => void;

    constructor(options: HostOptions = {}) {
        const {
            ignoreCase = ignoreCaseFallback(),
            readFile,
            readFileSync,
            writeFile,
            writeFileSync,
            ...baseOptions
        } = options;
        super({ ...baseOptions, ignoreCase });
        if (!readFileSync && !readFile) {
            this._readFileCallback = readFileFallback;
            this._readFileSyncCallback = readFileSyncFallback;
        }
        else {
            this._readFileCallback = readFile || readFileSync;
            this._readFileSyncCallback = readFileSync;
        }

        if (!writeFileSync && !writeFile) {
            this._writeFileCallback = writeFileFallback;
            this._writeFileSyncCallback = writeFileSyncFallback;
        }
        else {
            this._writeFileCallback = writeFile || writeFileSync;
            this._writeFileSyncCallback = writeFileSync;
        }
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        return await this.readFilePossiblyAsync(/*sync*/ false, file, toCancelToken(cancelable));
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        return this.readFilePossiblyAsync(/*sync*/ true, file, toCancelToken(cancelable));
    }

    private readFilePossiblyAsync(sync: true, file: string, cancelToken?: CancelToken): string | undefined;
    private readFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken): PromiseLike<string | undefined> | string | undefined;
    private readFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken): PromiseLike<string | undefined> | string | undefined {
        const readFile = sync ? this._readFileSyncCallback : this._readFileCallback;
        if (!readFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = readFile(file, wrapCancelToken(cancelToken));
        return typeof result === "object" ? promiseFinally(result, endIORead) : endIORead(result);
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        return await this.writeFilePossiblyAsync(/*sync*/ false, file, text, toCancelToken(cancelable));
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        this.writeFilePossiblyAsync(/*sync*/ true, file, text, toCancelToken(cancelable));
    }

    private writeFilePossiblyAsync(sync: true, file: string, text: string, cancelToken?: CancelToken): void;
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancelToken?: CancelToken): PromiseLike<void> | void;
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancelToken?: CancelToken) {
        const writeFile = sync ? this._writeFileSyncCallback : this._writeFileCallback;
        if (!writeFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        const result = writeFile(file, text, wrapCancelToken(cancelToken));
        return typeof result === "object" ? promiseFinally(result, endIOWrite) : endIOWrite();
    }

    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        return this.getSourceFilePossiblyAsync(/*sync*/ false, file, toCancelToken(cancelable));
    }

    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        return this.getSourceFilePossiblyAsync(/*sync*/ true, file, toCancelToken(cancelable));
    }

    private getSourceFilePossiblyAsync(sync: true, file: string, cancelToken?: CancelToken): SourceFile | undefined;
    private getSourceFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken): Promise<SourceFile | undefined> | SourceFile | undefined;
    private getSourceFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken) {
        return pipe(
            sync ? this.readFileSync(file, cancelToken) : this.readFile(file, cancelToken),
            result => typeof result === "string" ? this.parseSourceFile(file, result, cancelToken) : undefined);
    }

    protected resolveFileCore(file: string, referer?: string) {
        return resolveFileFallback(file, referer);
    }
}

/**
 * @deprecated Use `CoreSyncHost.forFile` or `CoreAsyncHost.forFile` instead.
 * {@docCategory Hosts}
 */
export class SingleFileHost extends Host {
    public readonly file: string;
    public readonly content: string;
    private _hostFallback: Host | undefined;

    constructor(content: string, file: string = "file.grammar", hostFallback?: Host) {
        super({ useBuiltinGrammars: false });
        this.file = file;
        this.content = content;
        this._hostFallback = hostFallback;
    }

    protected get parser() {
        return this._hostFallback ? this._hostFallback["parser"] : super.parser;
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        if (file === this.file) return this.content;
        if (this._hostFallback) return this._hostFallback.readFile(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        if (file === this.file) return this.content;
        if (this._hostFallback) return this._hostFallback.readFileSync(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this._hostFallback) return this._hostFallback.writeFile(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this._hostFallback) return this._hostFallback.writeFileSync(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        return file !== this.file && this._hostFallback ? this._hostFallback.getSourceFile(file, cancelable) :
            super.getSourceFile(file, cancelable);
    }

    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        return file !== this.file && this._hostFallback ? this._hostFallback.getSourceFileSync(file, cancelable) :
            super.getSourceFileSync(file, cancelable);
    }

    protected normalizeFileCore(file: string) {
        return file === this.file ? file : this._hostFallback?.normalizeFile(file) ?? super.normalizeFileCore(file);
    }

    protected registerKnownGrammarCore(_name: string, _file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    protected resolveKnownGrammarCore(name: string) {
        return this._hostFallback?.resolveKnownGrammar(name);
    }

    protected resolveFileCore(file: string, referer?: string) {
        const result = file === this.file ? file : this._hostFallback?.resolveFile(file, referer);
        if (result === undefined) throw new Error("Cannot resolve file without a fallback host.");
        return result;
    }

    protected createParser() {
        return this._hostFallback ? this._hostFallback["createParser"]() : super.createParser();
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
    return new Promise<string>((resolve, reject) => {
        file = getLocalPath(file);
        if (isUri(file)) return undefined;
        fs.readFile(file, "utf8", (error, data) => error ? reject(error) : resolve(data));
    });
}

function readFileSyncFallback(file: string) {
    file = getLocalPath(file);
    if (isUri(file)) return undefined;
    return fs.readFileSync(file, "utf8");
}

function writeFileFallback(file: string, content: string) {
    return new Promise<void>((resolve, reject) => {
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        fs.writeFile(file, content, "utf8", (error) => error ? reject(error) : resolve());
    });
}

function writeFileSyncFallback(file: string, content: string) {
    file = getLocalPath(file);
    if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
    return fs.writeFileSync(file, content, "utf8");
}

function cannotCompleteSynchronously(): never {
    throw new Error("Operation cannot be completed synchronously");
}

function cannotCompleteAsynchronously(): never {
    throw new Error("Operation cannot be completed asynchronously");
}

function endIORead<T>(value?: T) {
    performance.measure("ioRead", "ioRead");
    return value;
}

function endIOWrite() {
    performance.measure("ioWrite", "ioWrite");
}

function ignoreCaseFallback() {
    return /^(win32|win64|darwin)$/.test(os.platform());
}
