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

import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";
import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { Parser } from "./parser";
import { CancellationToken } from "prex";
import { promiseFinally, pipe, toCancelToken, wrapCancelToken } from "./core";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";

const ignoreCaseFallback = /^(win32|win64|darwin)$/.test(os.platform());

let builtinGrammars: Map<string, string> | undefined;

/** {@docCategory Hosts} */
export interface HostBaseOptions {
    ignoreCase?: boolean;
    knownGrammars?: Record<string, string>;
    useBuiltinGrammars?: boolean;
}

/** {@docCategory Hosts} */
export abstract class HostBase {
    public readonly ignoreCase: boolean;

    private useBuiltinGrammars: boolean;
    private innerParser: Parser | undefined;
    private knownGrammars: Map<string, string> | undefined;

    constructor({ ignoreCase = ignoreCaseFallback, knownGrammars, useBuiltinGrammars = true }: HostBaseOptions = {}) {
        this.ignoreCase = ignoreCase;
        this.useBuiltinGrammars = useBuiltinGrammars;

        if (knownGrammars) {
            for (const key in knownGrammars) if (Object.prototype.hasOwnProperty.call(knownGrammars, key)) {
                this.registerKnownGrammar(key, knownGrammars[key]);
            }
        }
    }

    protected get parser(): Parser {
        return this.innerParser
            || (this.innerParser = this.createParser());
    }

    public normalizeFile(file: string) {
        return this.ignoreCase ? file.toLowerCase() : file;
    }

    public resolveKnownGrammar(name: string) {
        return this.knownGrammars
            && this.knownGrammars.get(name.toLowerCase())
            || this.resolveBuiltInGrammar(name);
    }

    public registerKnownGrammar(name: string, file: string) {
        if (!this.knownGrammars) this.knownGrammars = new Map<string, string>();
        this.knownGrammars.set(name.toLowerCase(), file);
    }

    protected resolveBuiltInGrammar(name: string) {
        if (!this.useBuiltinGrammars) return undefined;
        return resolveBuiltInGrammar(name);
    }

    public resolveFile(file: string, referer?: string): string {
        file = this.resolveKnownGrammar(file) || file;

        let result: string;
        if (isFileUri(file) || path.isAbsolute(file)) {
            result = file;
        }
        else if (referer) {
            result = isUri(referer)
                ? url.resolve(referer, file)
                : path.resolve(path.dirname(referer), file);
        }
        else {
            result = path.resolve(file);
        }

        result = result.replace(/\\/g, "/");
        return result;
    }

    public parseSourceFile(file: string, text: string, cancelable?: Cancelable): SourceFile;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public parseSourceFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): SourceFile;
    public parseSourceFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("beforeParse");
        const sourceFile = this.parser.parseSourceFile(file, text, cancelable);
        performance.mark("afterParse");
        performance.measure("parse", "beforeParse", "afterParse");
        return sourceFile;
    }

    protected createParser(): Parser {
        return new Parser();
    }
}

/** {@docCategory Hosts} */
export type ReadFileSyncCallback = (this: never, file: string, cancelToken?: CancelToken) => string;

/**
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyReadFileSyncCallback = (this: never, file: string, cancelToken?: CancellationToken) => string;

/** {@docCategory Hosts} */
export type WriteFileSyncCallback = (this: never, file: string, content: string, cancelToken?: CancelToken) => void;

/**
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyWriteFileSyncCallback = (this: never, file: string, content: string, cancelToken?: CancellationToken) => void;

/** {@docCategory Hosts} */
export interface SyncHostOptions extends HostBaseOptions {
    readFileSync?: LegacyReadFileSyncCallback | ReadFileSyncCallback | false;
    writeFileSync?: LegacyWriteFileSyncCallback | WriteFileSyncCallback | false;
}

/** {@docCategory Hosts} */
export class SyncHost extends HostBase {
    private readFileSyncCallback?: ((file: string, cancelToken?: CancelToken & CancellationToken) => string) | false;
    private writeFileSyncCallback?: ((file: string, content: string, cancelToken?: CancelToken & CancellationToken) => void) | false;

    constructor({ readFileSync = readFileSyncFallback, writeFileSync = writeFileSyncFallback, ...baseOptions }: SyncHostOptions = {}) {
        super(baseOptions);
        this.readFileSyncCallback = readFileSync;
        this.writeFileSyncCallback = writeFileSync;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: SyncHost) {
        return new SyncSingleFileHost(file, content, hostFallback);
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        const readFile = this.readFileSyncCallback;
        if (!readFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = readFile(file, wrapCancelToken(toCancelToken(cancelable)));
        performance.measure("ioRead", "ioRead");
        return result;
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        const writeFile = this.writeFileSyncCallback;
        if (!writeFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        writeFile(file, text, wrapCancelToken(toCancelToken(cancelable)));
        performance.measure("ioWrite", "ioWrite");
    }

    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = this.readFileSync(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }
}

/** {@docCategory Hosts} */
export class SyncSingleFileHost extends SyncHost {
    public readonly file: string;
    public readonly content: string;
    private hostFallback?: SyncHost;

    constructor(file: string, content: string, hostFallback?: SyncHost) {
        super({ ignoreCase: hostFallback ? hostFallback.ignoreCase : undefined });
        this.file = file;
        this.content = content;
        this.hostFallback = hostFallback;
    }

    public normalizeFile(file: string) {
        return file === this.file ? file :
            this.hostFallback ? this.hostFallback.normalizeFile(file) :
            super.normalizeFile(file);
    }

    public resolveFile(file: string, referer?: string): string {
        return file === this.file ? file :
            this.hostFallback ? this.hostFallback.resolveFile(file, referer) :
            super.resolveFile(file);
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFileSync(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this.hostFallback) return this.hostFallback.writeFileSync(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

/** {@docCategory Hosts} */
export type ReadFileCallback = (this: never, file: string, cancelToken?: CancelToken) => PromiseLike<string> | string;

/**
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyReadFileCallback = (this: never, file: string, cancelToken?: CancellationToken) => PromiseLike<string> | string;

/** {@docCategory Hosts} */
export type WriteFileCallback = (this: never, file: string, content: string, cancelToken?: CancelToken) => PromiseLike<void> | void;

/**
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyWriteFileCallback = (this: never, file: string, content: string, cancelToken?: CancellationToken) => PromiseLike<void> | void;

/** {@docCategory Hosts} */
export interface AsyncHostOptions extends HostBaseOptions {
    readFile?: ReadFileCallback | LegacyReadFileCallback | false;
    writeFile?: WriteFileCallback | LegacyWriteFileCallback | false;
}

/** {@docCategory Hosts} */
export class AsyncHost extends HostBase {
    private readFileCallback?: ((file: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<string> | string) | false;
    private writeFileCallback?: ((file: string, content: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<void> | void) | false;

    constructor({ readFile = readFileFallback, writeFile = writeFileFallback, ...baseOptions }: AsyncHostOptions = {}) {
        super(baseOptions);
        this.readFileCallback = readFile;
        this.writeFileCallback = writeFile;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: AsyncHost) {
        return new AsyncSingleFileHost(file, content, hostFallback);
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        const readFile = this.readFileCallback;
        if (!readFile) throw new Error("Operation cannot be completed asynchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = await readFile(file, wrapCancelToken(toCancelToken(cancelable)));
        performance.measure("ioRead", "ioRead");
        return result;
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        const writeFile = this.writeFileCallback;
        if (!writeFile) throw new Error("Operation cannot be completed asynchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        await writeFile(file, text, wrapCancelToken(toCancelToken(cancelable)));
        performance.measure("ioWrite", "ioWrite");
    }

    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = await this.readFile(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }
}

/** {@docCategory Hosts} */
export class AsyncSingleFileHost extends AsyncHost {
    public readonly file: string;
    public readonly content: string;
    private hostFallback?: AsyncHost;

    constructor(file: string, content: string, hostFallback?: AsyncHost) {
        super({ ignoreCase: hostFallback ? hostFallback.ignoreCase : undefined });
        this.file = file;
        this.content = content;
        this.hostFallback = hostFallback;
    }

    public normalizeFile(file: string) {
        return file === this.file ? file :
            this.hostFallback ? this.hostFallback.normalizeFile(file) :
            super.normalizeFile(file);
    }

    public resolveFile(file: string, referer?: string): string {
        return file === this.file ? file :
            this.hostFallback ? this.hostFallback.resolveFile(file, referer) :
            super.resolveFile(file);
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        if (file === this.file) return this.content;
        if (this.hostFallback) return await this.hostFallback.readFile(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this.hostFallback) return this.hostFallback.writeFile(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

/** {@docCategory Hosts} */
export interface HostOptions extends HostBaseOptions {
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
    private readFileCallback?: (file: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<string> | string | undefined;
    private readFileSyncCallback?: (file: string, cancelToken?: CancelToken & CancellationToken) => string;
    private writeFileCallback?: (file: string, content: string, cancelToken?: CancelToken & CancellationToken) => PromiseLike<void> | void;
    private writeFileSyncCallback?: (file: string, content: string, cancelToken?: CancelToken & CancellationToken) => void;

    constructor({ readFile, readFileSync, writeFile, writeFileSync, ...baseOptions }: HostOptions = {}) {
        super(baseOptions);

        if (!readFileSync && !readFile) {
            this.readFileCallback = readFileFallback;
            this.readFileSyncCallback = readFileSyncFallback;
        }
        else {
            this.readFileCallback = readFile || readFileSync;
            this.readFileSyncCallback = readFileSync;
        }

        if (!writeFileSync && !writeFile) {
            this.writeFileCallback = writeFileFallback;
            this.writeFileSyncCallback = writeFileSyncFallback;
        }
        else {
            this.writeFileCallback = writeFile || writeFileSync;
            this.writeFileSyncCallback = writeFileSync;
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
    private readFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken): Promise<string | undefined> | string | undefined;
    private readFilePossiblyAsync(sync: boolean, file: string, cancelToken?: CancelToken): Promise<string | undefined> | string | undefined {
        const readFile = sync ? this.readFileSyncCallback : this.readFileCallback;
        if (!readFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = Promise.resolve(readFile(file, wrapCancelToken(cancelToken)));
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
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancelToken?: CancelToken): Promise<void> | void;
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancelToken?: CancelToken) {
        const writeFile = sync ? this.writeFileSyncCallback : this.writeFileCallback;
        if (!writeFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        const result = Promise.resolve(writeFile(file, text, wrapCancelToken(cancelToken)));
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
}

/**
 * @deprecated Use `SyncHost.forFile` or `AsyncHost.forFile` instead
 * {@docCategory Hosts}
 */
export class SingleFileHost extends Host {
    public readonly file: string;
    public readonly content: string;
    private hostFallback: Host | undefined;

    constructor(content: string, file: string = "file.grammar", hostFallback?: Host) {
        super({ useBuiltinGrammars: false });
        this.file = file;
        this.content = content;
        this.hostFallback = hostFallback;
    }

    protected get parser() {
        return this.hostFallback ? this.hostFallback["parser"] : super.parser;
    }

    public normalizeFile(file: string) {
        return this.hostFallback ? this.hostFallback.normalizeFile(file) : super.normalizeFile(file);
    }

    public resolveKnownGrammar(name: string) {
        return this.hostFallback ? this.hostFallback.resolveKnownGrammar(name) : super.resolveKnownGrammar(name);
    }

    public registerKnownGrammar(_name: string, _file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    protected resolveBuiltInGrammar(name: string) {
        return this.hostFallback ? this.hostFallback["resolveBuiltInGrammar"](name) : super.resolveBuiltInGrammar(name);
    }

    public resolveFile(file: string, referer?: string) {
        return file === this.file ? file :
            this.hostFallback ? this.hostFallback.resolveFile(file, referer) :
            super.resolveFile(file, referer);
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFile(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFileSync(file, cancelable);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this.hostFallback) return this.hostFallback.writeFile(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        if (this.hostFallback) return this.hostFallback.writeFileSync(file, text, cancelable);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        return file !== this.file && this.hostFallback ? this.hostFallback.getSourceFile(file, cancelable) :
            super.getSourceFile(file, cancelable);
    }

    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        return file !== this.file && this.hostFallback ? this.hostFallback.getSourceFileSync(file, cancelable) :
            super.getSourceFileSync(file, cancelable);
    }

    protected createParser() {
        return this.hostFallback ? this.hostFallback["createParser"]() : super.createParser();
    }
}

function isUri(file: string) {
    return !path.isAbsolute(file) && !!url.parse(file).protocol;
}

function isFileUri(file: string) {
    return /^file:\/\//.test(file);
}

function getLocalPath(file: string): string {
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

function readFileFallback(file: string) {
    return new Promise<string>((resolve, reject) => fs.readFile(file, "utf8", (error, data) => error ? reject(error) : resolve(data)));
}

function readFileSyncFallback(file: string) {
    return fs.readFileSync(file, "utf8");
}

function writeFileFallback(file: string, content: string) {
    return new Promise<void>((resolve, reject) => fs.writeFile(file, content, "utf8", (error) => error ? reject(error) : resolve()));
}

function writeFileSyncFallback(file: string, content: string) {
    return fs.writeFileSync(file, content, "utf8");
}

function endIORead<T>(value?: T) {
    performance.measure("ioRead", "ioRead");
    return value;
}

function endIOWrite() {
    performance.measure("ioWrite", "ioWrite");
}

function resolveBuiltInGrammar(name: string) {
    if (!builtinGrammars) {
        builtinGrammars = new Map<string, string>([
            ["es6", path.resolve(__dirname, "../grammars/es2015.grammar")],
            ["es2015", path.resolve(__dirname, "../grammars/es2015.grammar")],
            ["ts", path.resolve(__dirname, "../grammars/typescript.grammar")],
            ["typescript", path.resolve(__dirname, "../grammars/typescript.grammar")],
        ]);
    }
    return builtinGrammars.get(name.toLowerCase());
}