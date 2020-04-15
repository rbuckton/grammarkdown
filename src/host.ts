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

import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { Parser } from "./parser";
import { CancellationToken } from "prex";
import { toCancelToken, isUri, getLocalPath } from "./core";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";

/**
 * Synchronously read a file from the host.
 *
 * @param file The resolved path to the file.
 * @param cancelToken An optional `CancelToken` that indicates whether the operation was canceled.
 * @returns A `string` containing the contents of the file, or `undefined` if the file could not be read.
 *
 * {@docCategory Hosts}
 */
export type ReadFileSyncCallback = (this: void, file: string, cancelToken?: CancelToken) => string | undefined;

/**
 * Asynchronously read a file from the host.
 *
 * @param file The resolved path to the file.
 * @param cancelToken An optional `CancelToken` that indicates whether the operation was canceled.
 * @returns A `string` containing the contents of the file, or `undefined` if the file could not be read.
 *
 * {@docCategory Hosts}
 */
export type ReadFileCallback = (this: void, file: string, cancelToken?: CancelToken) => PromiseLike<string | undefined> | string | undefined;

/**
 * Synchronously read a file from the underlying host.
 *
 * @param file The resolved path to the file.
 * @param cancelToken An optional `prex.CancellationToken` that indicates whether the operation was canceled.
 * @returns A `string` containing the contents of the file, or `undefined` if the file could not be read.
 *
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyReadFileSyncCallback = (this: void, file: string, cancelToken?: CancellationToken) => string | undefined;

/**
 * Asynchronously read a file from the underlying host.
 *
 * @param file The resolved path to the file.
 * @param cancelToken An optional `prex.CancellationToken` that indicates whether the operation was canceled.
 * @returns A `string` containing the contents of the file, or `undefined` if the file could not be read.
 *
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyReadFileCallback = (this: void, file: string, cancelToken?: CancellationToken) => PromiseLike<string> | string;

/**
 * Synchronously write a file to the host.
 *
 * @param file The resolved path to the file.
 * @param content The contents of the file.
 * @param cancelToken An optional `CancelToken` that indicates whether the operation was canceled.
 *
 * {@docCategory Hosts}
 */
export type WriteFileSyncCallback = (this: void, file: string, content: string, cancelToken?: CancelToken) => void;

/**
 * Asynchronously write a file to the host.
 *
 * @param file The resolved path to the file.
 * @param content The contents of the file.
 * @param cancelToken An optional `CancelToken` that indicates whether the operation was canceled.
 *
 * {@docCategory Hosts}
 */
export type WriteFileCallback = (this: void, file: string, content: string, cancelToken?: CancelToken) => PromiseLike<void> | void;

/**
 * Synchronously write a file to the host.
 *
 * @param file The resolved path to the file.
 * @param content The contents of the file.
 * @param cancelToken An optional `prex.CancellationToken` that indicates whether the operation was canceled.
 *
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyWriteFileSyncCallback = (this: void, file: string, content: string, cancelToken?: CancellationToken) => void;

/**
 * Asynchronously write a file to the host.
 *
 * @param file The resolved path to the file.
 * @param content The contents of the file.
 * @param cancelToken An optional `prex.CancellationToken` that indicates whether the operation was canceled.
 *
 * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
 * {@docCategory Hosts}
 */
export type LegacyWriteFileCallback = (this: void, file: string, content: string, cancelToken?: CancellationToken) => PromiseLike<void> | void;

/** {@docCategory Hosts} */
export interface HostBaseOptions {
    ignoreCase?: boolean;
    knownGrammars?: Record<string, string>;
    useBuiltinGrammars?: boolean;
}

/** {@docCategory Hosts} */
export abstract class HostBase {
    public readonly ignoreCase: boolean;

    private _innerParser: Parser | undefined;
    private _knownGrammars: Map<string, string> | undefined;
    private _useBuiltinGrammars: boolean;

    constructor({ ignoreCase = false, knownGrammars, useBuiltinGrammars = true }: HostBaseOptions = {}) {
        this.ignoreCase = ignoreCase;
        this._useBuiltinGrammars = useBuiltinGrammars;

        if (knownGrammars) {
            for (const key in knownGrammars) if (Object.prototype.hasOwnProperty.call(knownGrammars, key)) {
                this.registerKnownGrammar(key, knownGrammars[key]);
            }
        }
    }

    protected get parser(): Parser {
        return this._innerParser
            || (this._innerParser = this.createParser());
    }

    public normalizeFile(file: string) {
        return this.normalizeFileCore(file);
    }

    public resolveKnownGrammar(name: string) {
        return this.resolveKnownGrammarCore(name)
            ?? (this._useBuiltinGrammars ? resolveBuiltInGrammar(name) : undefined);
    }

    public registerKnownGrammar(name: string, file: string) {
        this.registerKnownGrammarCore(name, file);
    }

    public resolveFile(file: string, referer?: string): string {
        file = this.resolveKnownGrammar(file) || file;
        let result = this.resolveFileCore(file, referer);
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

    protected normalizeFileCore(file: string) {
        return this.ignoreCase ? file.toUpperCase() : file;
    }

    protected resolveKnownGrammarCore(name: string): string | undefined {
        return this._knownGrammars?.get(name.toUpperCase());
    }

    protected registerKnownGrammarCore(name: string, file: string) {
        if (!this._knownGrammars) this._knownGrammars = new Map<string, string>();
        this._knownGrammars.set(name.toUpperCase(), file);
    }

    protected abstract resolveFileCore(file: string, referer?: string): string;
}

/** {@docCategory Hosts} */
export interface CoreSyncHostOptions extends HostBaseOptions {
    normalizeFile?: (this: void, file: string, fallback: (file: string) => string) => string;
    resolveFile?: (this: void, file: string, referer: string | undefined, fallback: (file: string, referer?: string) => string) => string;
    resolveKnownGrammar?: (this: void, name: string, fallback: (name: string) => string | undefined) => string | undefined;
    readFileSync?: (this: void, file: string, cancelToken: CancelToken | undefined, fallback: (file: string, cancelToken?: CancelToken) => string | undefined) => string | undefined;
    writeFileSync?: (this: void, file: string, content: string, cancelToken: CancelToken | undefined, fallback: (file: string, content: string, cancelToken?: CancelToken) => void) => void;
}

/** {@docCategory Hosts} */
export class CoreSyncHost extends HostBase {
    private _normalizeFile: CoreSyncHostOptions["normalizeFile"];
    private _resolveFile: CoreSyncHostOptions["resolveFile"];
    private _resolveKnownGrammar: CoreSyncHostOptions["resolveKnownGrammar"];
    private _readFileSync: CoreSyncHostOptions["readFileSync"];
    private _writeFileSync: CoreSyncHostOptions["writeFileSync"];
    private _hostFallback?: CoreSyncHost;

    private _normalizeFileCallback?: (file: string) => string;
    private _resolveFileCallback?: (file: string, referer?: string) => string;
    private _resolveKnownGrammarCallback?: (name: string) => string | undefined;
    private _readFileSyncCallback?: (file: string, cancelToken?: CancelToken) => string | undefined;
    private _writeFileSyncCallback?: (file: string, content: string, cancelToken?: CancelToken) => void;

    constructor(options: CoreSyncHostOptions, hostFallback?: CoreSyncHost) {
        const {
            ignoreCase = hostFallback?.ignoreCase,
            normalizeFile,
            resolveFile,
            resolveKnownGrammar,
            readFileSync,
            writeFileSync,
            ...baseOptions
        } = options;
        super({ ...baseOptions, ignoreCase });
        this._normalizeFile = normalizeFile;
        this._resolveFile = resolveFile;
        this._resolveKnownGrammar = resolveKnownGrammar;
        this._readFileSync = readFileSync;
        this._writeFileSync = writeFileSync;
        this._hostFallback = hostFallback;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: CoreSyncHost) {
        return new StringSyncHost(file, content, hostFallback);
    }

    public static from(options: CoreSyncHostOptions, hostFallback?: CoreSyncHost) {
        return new CoreSyncHost(options, hostFallback);
    }

    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        performance.mark("ioRead");
        try {
            return this.readFileSyncCore(file, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioRead", "ioRead");
        }
    }

    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("ioWrite");
        try {
            this.writeFileSyncCore(file, text, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioWrite", "ioWrite");
        }
    }

    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = this.readFileSync(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }

    protected normalizeFileCore(file: string) {
        const normalizeFile = this._normalizeFile;
        if (normalizeFile) {
            if (!this._normalizeFileCallback) this._normalizeFileCallback = this._normalizeFileFallback.bind(this);
            return normalizeFile(file, this._normalizeFileCallback);
        }
        return this._normalizeFileFallback(file);
    }

    private _normalizeFileFallback(file: string) {
        if (this._hostFallback) return this._hostFallback.normalizeFile(file);
        return super.normalizeFileCore(file);
    }

    protected resolveFileCore(file: string, referer?: string) {
        const resolveFile = this._resolveFile;
        if (resolveFile) {
            if (!this._resolveFileCallback) this._resolveFileCallback = this._resolveFileFallback.bind(this);
            return resolveFile(file, referer, this._resolveFileCallback);
        }
        return this._resolveFileFallback(file, referer);
    }

    private _resolveFileFallback(file: string, referer?: string) {
        if (this._hostFallback) return this._hostFallback.resolveFile(file, referer);
        throw new Error("Cannot resolve a file without a fallback host.");
    }

    protected resolveKnownGrammarCore(name: string) {
        const resolveKnownGrammar = this._resolveKnownGrammar;
        if (resolveKnownGrammar) {
            if (!this._resolveKnownGrammarCallback) this._resolveKnownGrammarCallback = this._resolveKnownGrammarFallback.bind(this);
            return resolveKnownGrammar(name, this._resolveKnownGrammarCallback);
        }
        return this._resolveKnownGrammarFallback(name);
    }

    private _resolveKnownGrammarFallback(name: string) {
        return this._hostFallback?.resolveKnownGrammar(name);
    }

    protected registerKnownGrammarCore(_name: string, _file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    protected readFileSyncCore(file: string, cancelToken?: CancelToken): string | undefined {
        const readFileSync = this._readFileSync;
        if (readFileSync) {
            if (!this._readFileSyncCallback) this._readFileSyncCallback = this._readFileSyncFallback.bind(this);
            return readFileSync(file, cancelToken, this._readFileSyncCallback);
        }
        return this._readFileSyncFallback(file, cancelToken);
    }

    private _readFileSyncFallback(file: string, cancelToken?: CancelToken) {
        if (this._hostFallback) return this._hostFallback.readFileSync(file, cancelToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    protected writeFileSyncCore(file: string, content: string, cancelToken?: CancelToken) {
        const writeFileSync = this._writeFileSync;
        if (writeFileSync) {
            if (!this._writeFileSyncCallback) this._writeFileSyncCallback = this._writeFileSyncFallback.bind(this);
            return writeFileSync(file, content, cancelToken, this._writeFileSyncCallback);
        }
        return this._writeFileSyncFallback(file, content, cancelToken);
    }

    private _writeFileSyncFallback(file: string, content: string, cancelToken?: CancelToken) {
        if (this._hostFallback) return this._hostFallback.writeFileSync(file, content, cancelToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

/** {@docCategory Hosts} */
export class StringSyncHost extends CoreSyncHost {
    public readonly file: string;
    public readonly content: string;

    constructor(file: string, content: string, hostFallback?: CoreSyncHost) {
        super({
            normalizeFile: (file, fallback) => file === this.file ? file : fallback(file),
            resolveFile: (file, referer, fallback) => file === this.file ? file : fallback(file, referer),
            readFileSync: (file, cancelToken, fallback) => file === this.file ? this.content : fallback(file, cancelToken)
        }, hostFallback);
        this.file = file;
        this.content = content;
    }
}

/** {@docCategory Hosts} */
export interface CoreAsyncHostOptions extends HostBaseOptions {
    normalizeFile?: (this: void, file: string, fallback: (file: string) => string) => string;
    resolveFile?: (this: void, file: string, referer: string | undefined, fallback: (file: string, referer?: string) => string) => string;
    resolveKnownGrammar?: (this: void, name: string, fallback: (name: string) => string | undefined) => string | undefined;
    readFile?: (this: void, file: string, cancelToken: CancelToken | undefined, fallback: (file: string, cancelToken?: CancelToken) => Promise<string | undefined>) => PromiseLike<string | undefined> | string | undefined;
    writeFile?: (this: void, file: string, content: string, cancelToken: CancelToken | undefined, fallback: (file: string, content: string, cancelToken?: CancelToken) => Promise<void>) => PromiseLike<void> | void;
}

/** {@docCategory Hosts} */
export class CoreAsyncHost extends HostBase {
    private _normalizeFile: CoreAsyncHostOptions["normalizeFile"];
    private _resolveFile: CoreAsyncHostOptions["resolveFile"];
    private _resolveKnownGrammar: CoreAsyncHostOptions["resolveKnownGrammar"];
    private _readFile: CoreAsyncHostOptions["readFile"];
    private _writeFile: CoreAsyncHostOptions["writeFile"];
    private _hostFallback?: CoreAsyncHost;

    private _normalizeFileCallback?: (file: string) => string;
    private _resolveFileCallback?: (file: string, referer?: string) => string;
    private _resolveKnownGrammarCallback?: (name: string) => string | undefined;
    private _readFileCallback?: (file: string, cancelToken?: CancelToken) => Promise<string | undefined>;
    private _writeFileCallback?: (file: string, content: string, cancelToken?: CancelToken) => Promise<void>;

    constructor(options: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost) {
        const {
            ignoreCase = hostFallback?.ignoreCase,
            normalizeFile,
            resolveFile,
            resolveKnownGrammar,
            readFile,
            writeFile,
            ...baseOptions
        } = options;
        super({ ...baseOptions, ignoreCase });
        this._normalizeFile = normalizeFile;
        this._resolveFile = resolveFile;
        this._resolveKnownGrammar = resolveKnownGrammar;
        this._readFile = readFile;
        this._writeFile = writeFile;
        this._hostFallback = hostFallback;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: CoreAsyncHost) {
        return new StringAsyncHost(file, content, hostFallback);
    }

    public static from(custom: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost) {
        return new CoreAsyncHost(custom, hostFallback);
    }

    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        performance.mark("ioRead");
        try {
            file = getLocalPath(file);
            if (isUri(file)) return undefined; // TODO: support uris?
            return await this.readFileCore(file, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioRead", "ioRead");
        }
    }

    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("ioWrite");
        try {
            file = getLocalPath(file);
            if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
            await this.writeFileCore(file, text, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioWrite", "ioWrite");
        }
    }

    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = await this.readFile(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }

    protected normalizeFileCore(file: string) {
        const normalizeFile = this._normalizeFile;
        if (normalizeFile) {
            if (!this._normalizeFileCallback) this._normalizeFileCallback = this._normalizeFileFallback.bind(this);
            return normalizeFile(file, this._normalizeFileCallback);
        }
        return this._normalizeFileFallback(file);
    }

    private _normalizeFileFallback(file: string) {
        if (this._hostFallback) return this._hostFallback.normalizeFile(file);
        return super.normalizeFileCore(file);
    }

    protected resolveFileCore(file: string, referer?: string) {
        const resolveFile = this._resolveFile;
        if (resolveFile) {
            if (!this._resolveFileCallback) this._resolveFileCallback = this._resolveFileFallback.bind(this);
            return resolveFile(file, referer, this._resolveFileCallback);
        }
        return this._resolveFileFallback(file, referer);
    }

    private _resolveFileFallback(file: string, referer?: string) {
        if (this._hostFallback) return this._hostFallback.resolveFile(file, referer);
        throw new Error("Cannot resolve a file without a fallback host.");
    }

    protected resolveKnownGrammarCore(name: string) {
        const resolveKnownGrammar = this._resolveKnownGrammar;
        if (resolveKnownGrammar) {
            if (!this._resolveKnownGrammarCallback) this._resolveKnownGrammarCallback = this._resolveKnownGrammarFallback.bind(this);
            return resolveKnownGrammar(name, this._resolveKnownGrammarCallback);
        }
        return this._resolveKnownGrammarFallback(name);
    }

    private _resolveKnownGrammarFallback(name: string) {
        return this._hostFallback?.resolveKnownGrammar(name);
    }

    protected registerKnownGrammarCore(_name: string, _file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    protected async readFileCore(file: string, cancelToken?: CancelToken): Promise<string | undefined> {
        const readFile = this._readFile;
        if (readFile) {
            if (!this._readFileCallback) this._readFileCallback = this._readFileFallback.bind(this);
            return readFile(file, cancelToken, this._readFileCallback);
        }
        return this._readFileFallback(file, cancelToken);
    }

    private async _readFileFallback(file: string, cancelToken?: CancelToken) {
        if (this._hostFallback) return this._hostFallback.readFile(file, cancelToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    protected async writeFileCore(file: string, content: string, cancelToken?: CancelToken) {
        const writeFile = this._writeFile;
        if (writeFile) {
            if (!this._writeFileCallback) this._writeFileCallback = this._writeFileFallback.bind(this);
            return writeFile(file, content, cancelToken, this._writeFileCallback);
        }
        return this._writeFileFallback(file, content, cancelToken);
    }

    private async _writeFileFallback(file: string, content: string, cancelToken?: CancelToken) {
        if (this._hostFallback) return this._hostFallback.writeFile(file, content, cancelToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

/** {@docCategory Hosts} */
export class StringAsyncHost extends CoreAsyncHost {
    public readonly file: string;
    public readonly content: string;

    constructor(file: string, content: string, hostFallback?: CoreAsyncHost) {
        super({
            normalizeFile: (file, fallback) => file === this.file ? file : fallback(file),
            resolveFile: (file, referer, fallback) => file === this.file ? file : fallback(file, referer),
            readFile: (file, cancelToken, fallback) => file === this.file ? this.content : fallback(file, cancelToken)
        }, hostFallback);
        this.file = file;
        this.content = content;
    }
}

let builtinGrammars: Map<string, string> | undefined;

function resolveBuiltInGrammar(name: string) {
    if (!builtinGrammars) {
        builtinGrammars = new Map<string, string>([
            ["ES6", require.resolve("../grammars/es2015.grammar")],
            ["ES2015", require.resolve("../grammars/es2015.grammar")],
            ["TS", require.resolve("../grammars/typescript.grammar")],
            ["TYPESCRIPT", require.resolve("../grammars/typescript.grammar")],
        ]);
    }
    return builtinGrammars.get(name.toUpperCase());
}
