/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { Parser } from "./parser";
import { CancellationToken } from "prex";
import { toCancelToken, getLocalPath } from "./core";
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

/**
 * Options used to configure a {@link HostBase}.
 *
 * {@docCategory Hosts}
 */
export interface HostBaseOptions {
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
}

/**
 * A Host is a user-provided service that indicates how various Grammarkdown services
 * can interact with a file system. The `HostBase` class provides a set of common functionality
 * shared between synchronous and asynchronous hosts (i.e., `SyncHost` and `AsyncHost` respectively).
 *
 * {@docCategory Hosts}
 */
export abstract class HostBase {
    /**
     * Indicates whether comparisons for this host should be case insensitive.
     */
    public readonly ignoreCase: boolean;

    private _innerParser: Parser | undefined;
    private _knownGrammars: Map<string, string> | undefined;
    private _useBuiltinGrammars: boolean;

    /**
     * @param options The options used to configure the host.
     */
    constructor(options: HostBaseOptions = {}) {
        const { ignoreCase = false, knownGrammars, useBuiltinGrammars = true } = options;

        this.ignoreCase = ignoreCase;
        this._useBuiltinGrammars = useBuiltinGrammars;

        if (knownGrammars) {
            for (const key in knownGrammars) if (Object.prototype.hasOwnProperty.call(knownGrammars, key)) {
                this.registerKnownGrammar(key, knownGrammars[key]);
            }
        }
    }

    /**
     * Gets the parser instance associated with this host.
     */
    protected get parser(): Parser {
        return this._innerParser
            || (this._innerParser = this.createParser());
    }

    /**
     * Normalize a file path's string representation for use as a key based on the case sensitivity of the host.
     * @param file The file path.
     */
    public normalizeFile(file: string) {
        return this.normalizeFileCore(file);
    }

    /**
     * Returns the path for a known or built-in grammar based on its name (i.e., `"es2015"`, etc.)
     * @param name The name of the grammar.
     */
    public resolveKnownGrammar(name: string) {
        return this.resolveKnownGrammarCore(name)
            ?? (this._useBuiltinGrammars ? resolveBuiltInGrammar(name) : undefined);
    }

    /**
     * Registers a known grammar for use with `@import` directives.
     * @param name The name for the grammar.
     * @param file The file path of the grammar.
     */
    public registerKnownGrammar(name: string, file: string) {
        this.registerKnownGrammarCore(name, file);
    }

    /**
     * Resolve the full path of a file relative to the provided referer.
     * @param file The path to the requested file.
     * @param referer An optional path indicating the file from which the path should be resolved.
     */
    public resolveFile(file: string, referer?: string): string {
        file = this.resolveKnownGrammar(file) || file;
        let result = this.resolveFileCore(file, referer);
        result = result.replace(/\\/g, "/");
        return result;
    }

    /**
     * Parse a source file.
     * @param file The path to the source file.
     * @param text The text of the source file.
     * @param cancelable An optional cancelable object that can be used to abort a long-running parse.
     */
    public parseSourceFile(file: string, text: string, cancelable?: Cancelable): SourceFile;
    /**
     * {@inheritDoc HostBase.(parseSourceFile:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public parseSourceFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): SourceFile;
    public parseSourceFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("beforeParse");
        const sourceFile = this.parser.parseSourceFile(file, text, cancelable);
        performance.mark("afterParse");
        performance.measure("parse", "beforeParse", "afterParse");
        return sourceFile;
    }

    /**
     * Creates a {@link Parser} for this host.
     * @virtual
     */
    protected createParser(): Parser {
        return new Parser();
    }

    /**
     * When overridden in a derived class, normalizes a file path's string representation for use as a key based on the case sensitivity of the host.
     * @param file The file path.
     * @virtual
     */
    protected normalizeFileCore(file: string) {
        return this.ignoreCase ? file.toUpperCase() : file;
    }

    /**
     * When overridden in a derived class, returns the path for a known or built-in grammar based on its name (i.e., `"es2015"`, etc.)
     * @param name The name of the grammar.
     * @virtual
     */
    protected resolveKnownGrammarCore(name: string): string | undefined {
        return this._knownGrammars?.get(name.toUpperCase());
    }

    /**
     * When overridden in a derived clas, registers a known grammar for use with `@import` directives.
     * @param name The name for the grammar.
     * @param file The file path of the grammar.
     * @virtual
     */
    protected registerKnownGrammarCore(name: string, file: string) {
        if (!this._knownGrammars) this._knownGrammars = new Map<string, string>();
        this._knownGrammars.set(name.toUpperCase(), file);
    }

    /**
     * When overridden in a derived class, resolves the full path of a file relative to the provided referer.
     * @param file The path to the requested file.
     * @param referer An optional path indicating the file from which the path should be resolved.
     * @virtual
     */
    protected abstract resolveFileCore(file: string, referer?: string): string;
}

/**
 * Options used to configure a {@link CoreSyncHost}.
 *
 * {@docCategory Hosts}
 */
export interface CoreSyncHostOptions extends HostBaseOptions {
    /**
     * A callback used to control file normalization when generating keys for maps based on the case sensitivity of the host.
     */
    normalizeFile?: (this: void, file: string, fallback: (file: string) => string) => string;
    /**
     * A callback used to control file resolution.
     */
    resolveFile?: (this: void, file: string, referer: string | undefined, fallback: (file: string, referer?: string) => string) => string;
    /**
     * A callback used to control known grammar resolution.
     */
    resolveKnownGrammar?: (this: void, name: string, fallback: (name: string) => string | undefined) => string | undefined;
    /**
     * A callback used to control synchronous file reads.
     */
    readFileSync?: (this: void, file: string, cancelToken: CancelToken | undefined, fallback: (file: string, cancelToken?: CancelToken) => string | undefined) => string | undefined;
    /**
     * A callback used to control synchronous file writes.
     */
    writeFileSync?: (this: void, file: string, content: string, cancelToken: CancelToken | undefined, fallback: (file: string, content: string, cancelToken?: CancelToken) => void) => void;
}

/**
 * A Host is a user-provided service that indicates how various Grammarkdown services
 * can interact with a file system. The `CoreSyncHost` class provides the API surface that Grammarkdown
 * uses to interact with a host that is able to access the file system synchronously.
 *
 * {@docCategory Hosts}
 */
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

    /**
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
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

    /**
     * Creates a {@link StringSyncHost} for the provided content.
     * @param content The content of the file.
     * @param file The file name for the content.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static forFile(content: string, file = "file.grammar", hostFallback?: CoreSyncHost) {
        return new StringSyncHost(file, content, hostFallback);
    }

    /**
     * Creates a `CoreSyncHost`.
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static from(options: CoreSyncHostOptions, hostFallback?: CoreSyncHost) {
        return new CoreSyncHost(options, hostFallback);
    }

    /**
     * Reads a file from the host.
     * @param file The path to the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `string` containing the content if the file could be read; otherwise, `undefined`.
     */
    public readFileSync(file: string, cancelable?: Cancelable): string | undefined;
    /**
     * {@inheritDoc CoreSyncHost.(readFileSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined;
    public readFileSync(file: string, cancelable?: CancellationToken | Cancelable): string | undefined {
        performance.mark("ioRead");
        try {
            return this.readFileSyncCore(getLocalPath(file), toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioRead", "ioRead");
        }
    }

    /**
     * Writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public writeFileSync(file: string, text: string, cancelable?: Cancelable): void;
    /**
     * {@inheritDoc CoreSyncHost.(writeFileSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable): void;
    public writeFileSync(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("ioWrite");
        try {
            this.writeFileSyncCore(getLocalPath(file), text, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioWrite", "ioWrite");
        }
    }

    /**
     * Reads and parses a source file from the host.
     * @param file The path to the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns The parsed {@link SourceFile} of the file if the file could be read; otherwise, `undefined`.
     */
    public getSourceFileSync(file: string, cancelable?: Cancelable): SourceFile | undefined;
    /**
     * {@inheritDoc CoreSyncHost.(getSourceFileSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable): SourceFile | undefined;
    public getSourceFileSync(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = this.readFileSync(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }

    /**
     * {@inheritDoc HostBase.normalizeFileCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.resolveFileCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.resolveKnownGrammarCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.registerKnownGrammarCore}
     * @override
     */
    protected registerKnownGrammarCore(name: string, file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    /**
     * When overridden in a derived class, reads a file from the host.
     * @param file The path to the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `string` containing the content if the file could be read; otherwise, `undefined`.
     * @virtual
     */
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

    /**
     * When overridden in a derived class, writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @virtual
     */
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

/**
 * An implementation of a {@link CoreSyncHost} to simplify creating a host for a single file.
 *
 * {@docCategory Hosts}
 */
export class StringSyncHost extends CoreSyncHost {
    /**
     * The file name for the content.
     */
    public readonly file: string;
    /**
     * The content of the file.
     */
    public readonly content: string;

    /**
     * @param file The file name for the content.
     * @param content The content of the file.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
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

/**
 * Options used to configure a {@link CoreAsyncHost}.
 * {@docCategory Hosts}
 */
export interface CoreAsyncHostOptions extends HostBaseOptions {
    /**
     * A callback used to control file normalization when generating keys for maps based on the case sensitivity of the host.
     */
    normalizeFile?: (this: void, file: string, fallback: (file: string) => string) => string;
    /**
     * A callback used to control file resolution.
     */
    resolveFile?: (this: void, file: string, referer: string | undefined, fallback: (file: string, referer?: string) => string) => string;
    /**
     * A callback used to control known grammar resolution.
     */
    resolveKnownGrammar?: (this: void, name: string, fallback: (name: string) => string | undefined) => string | undefined;
    /**
     * A callback used to control asynchronous file reads.
     */
    readFile?: (this: void, file: string, cancelToken: CancelToken | undefined, fallback: (file: string, cancelToken?: CancelToken) => Promise<string | undefined>) => PromiseLike<string | undefined> | string | undefined;
    /**
     * A callback used to control asynchronous file writes.
     */
    writeFile?: (this: void, file: string, content: string, cancelToken: CancelToken | undefined, fallback: (file: string, content: string, cancelToken?: CancelToken) => Promise<void>) => PromiseLike<void> | void;
}

/**
 * A Host is a user-provided service that indicates how various Grammarkdown services
 * can interact with a file system. The `CoreAsyncHost` class provides the API surface that Grammarkdown
 * uses to interact with a host that is able to access the file system asynchronously.
 *
 * {@docCategory Hosts}
 */
export class CoreAsyncHost extends HostBase {
    private _normalizeFile: CoreAsyncHostOptions["normalizeFile"];
    private _resolveFile: CoreAsyncHostOptions["resolveFile"];
    private _resolveKnownGrammar: CoreAsyncHostOptions["resolveKnownGrammar"];
    private _readFile: CoreAsyncHostOptions["readFile"];
    private _writeFile: CoreAsyncHostOptions["writeFile"];
    private _hostFallback?: CoreAsyncHost | CoreSyncHost;

    private _normalizeFileCallback?: (file: string) => string;
    private _resolveFileCallback?: (file: string, referer?: string) => string;
    private _resolveKnownGrammarCallback?: (name: string) => string | undefined;
    private _readFileCallback?: (file: string, cancelToken?: CancelToken) => Promise<string | undefined>;
    private _writeFileCallback?: (file: string, content: string, cancelToken?: CancelToken) => Promise<void>;

    /**
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    constructor(options: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost | CoreSyncHost) {
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

    /**
     * Creates a {@link StringAsyncHost} for the provided content.
     * @param content The content of the file.
     * @param file The file name for the content.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static forFile(content: PromiseLike<string> | string, file = "file.grammar", hostFallback?: CoreAsyncHost | CoreSyncHost) {
        return new StringAsyncHost(file, content, hostFallback);
    }

    /**
     * Creates a `CoreAsyncHost`.
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static from(custom: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost | CoreSyncHost) {
        return new CoreAsyncHost(custom, hostFallback);
    }

    /**
     * Reads a file from the host.
     * @param file The path to the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` for either a `string` containing the content if the file could be read, or `undefined` if the file could not be read.
     */
    public readFile(file: string, cancelable?: Cancelable): Promise<string | undefined>;
    /**
     * {@inheritDoc CoreAsyncHost.(readFile:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined>;
    public async readFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<string | undefined> {
        performance.mark("ioRead");
        try {
            return await this.readFileCore(getLocalPath(file), toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioRead", "ioRead");
        }
    }

    /**
     * Writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` that is settled when the operation completes.
     */
    public writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void>;
    /**
     * {@inheritDoc CoreAsyncHost.(writeFile:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async writeFile(file: string, text: string, cancelable?: CancellationToken | Cancelable) {
        performance.mark("ioWrite");
        try {
            await this.writeFileCore(getLocalPath(file), text, toCancelToken(cancelable));
        }
        finally {
            performance.measure("ioWrite", "ioWrite");
        }
    }

    /**
     * Reads and parses a source file from the host.
     * @param file The path to the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` for either the parsed {@link SourceFile} of the file if the file could be read, or `undefined` if it could not be read.
     */
    public getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined>;
    /**
     * {@inheritDoc CoreAsyncHost.(getSourceFile:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public getSourceFile(file: string, cancelable?: CancellationToken | Cancelable): Promise<SourceFile | undefined>;
    public async getSourceFile(file: string, cancelable?: CancellationToken | Cancelable) {
        cancelable = toCancelToken(cancelable);
        const result = await this.readFile(file, cancelable);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancelable) : undefined;
    }

    /**
     * {@inheritDoc HostBase.normalizeFileCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.resolveFileCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.resolveKnownGrammarCore}
     * @override
     */
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

    /**
     * {@inheritDoc HostBase.registerKnownGrammarCore}
     * @override
     */
    protected registerKnownGrammarCore(name: string, file: string) {
        throw new Error("Known grammars must be registered on the fallback host.")
    }

    /**
     * When overridden in a derived class, reads a file from the host.
     * @param file The path to the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `Promise` for either a `string` containing the content if the file could be read, or `undefined` if the file could not be read.
     * @virtual
     */
    protected async readFileCore(file: string, cancelToken?: CancelToken): Promise<string | undefined> {
        const readFile = this._readFile;
        if (readFile) {
            if (!this._readFileCallback) this._readFileCallback = this._readFileFallback.bind(this);
            return readFile(file, cancelToken, this._readFileCallback);
        }
        return this._readFileFallback(file, cancelToken);
    }

    private async _readFileFallback(file: string, cancelToken?: CancelToken) {
        if (this._hostFallback) {
            if ("readFile" in this._hostFallback) return this._hostFallback.readFile(file, cancelToken);
            if ("readFileSync" in this._hostFallback) return this._hostFallback.readFileSync(file, cancelToken);
        }
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    /**
     * When overridden in a derived class, writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `Promise` that is settled when the operation completes.
     * @virtual
     */
    protected async writeFileCore(file: string, content: string, cancelToken?: CancelToken) {
        const writeFile = this._writeFile;
        if (writeFile) {
            if (!this._writeFileCallback) this._writeFileCallback = this._writeFileFallback.bind(this);
            return writeFile(file, content, cancelToken, this._writeFileCallback);
        }
        return this._writeFileFallback(file, content, cancelToken);
    }

    private async _writeFileFallback(file: string, content: string, cancelToken?: CancelToken) {
        if (this._hostFallback) {
            if ("writeFile" in this._hostFallback) return this._hostFallback.writeFile(file, content, cancelToken);
            if ("writeFileSync" in this._hostFallback) return this._hostFallback.writeFileSync(file, content, cancelToken);
        }
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

/**
 * An implementation of a {@link CoreAsyncHost} to simplify creating a host for a single file.
 *
 * {@docCategory Hosts}
 */
export class StringAsyncHost extends CoreAsyncHost {
    /**
     * The file name for the content.
     */
    public readonly file: string;
    /**
     * The content of the file.
     */
    public readonly content: PromiseLike<string> | string;

    /**
     * @param file The file name for the content.
     * @param content The content of the file.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    constructor(file: string, content:  PromiseLike<string> | string, hostFallback?: CoreAsyncHost | CoreSyncHost) {
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
