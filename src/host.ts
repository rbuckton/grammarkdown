/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { Parser } from "./parser";
import { toCancelToken, isUri } from "./core";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";

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
 * Options used to configure a {@link CoreAsyncHost}.
 *
 * {@docCategory Hosts}
 */
export interface CoreAsyncHostOptions {
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
export class CoreAsyncHost {
    private _ignoreCase: boolean;
    private _innerParser: Parser | undefined;
    private _knownGrammars: Map<string, string> | undefined;
    private _useBuiltinGrammars: boolean;
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

    /**
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    constructor(options: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost) {
        const {
            ignoreCase = hostFallback?.ignoreCase ?? false,
            knownGrammars,
            useBuiltinGrammars = true,
            normalizeFile,
            resolveFile,
            resolveKnownGrammar,
            readFile,
            writeFile,
        } = options;
        this._ignoreCase = ignoreCase;
        this._useBuiltinGrammars = useBuiltinGrammars;
        if (knownGrammars) {
            for (const key in knownGrammars) if (Object.prototype.hasOwnProperty.call(knownGrammars, key)) {
                this.registerKnownGrammar(key, knownGrammars[key]);
            }
        }
        this._normalizeFile = normalizeFile;
        this._resolveFile = resolveFile;
        this._resolveKnownGrammar = resolveKnownGrammar;
        this._readFile = readFile;
        this._writeFile = writeFile;
        this._hostFallback = hostFallback;
    }

    /**
     * Indicates whether comparisons for this host should be case insensitive.
     */
    public get ignoreCase() {
        return this._ignoreCase;
    }

    /**
     * Gets the parser instance associated with this host.
     */
    protected get parser(): Parser {
        return this._innerParser
            || (this._innerParser = this.createParser());
    }

    /**
     * Creates a {@link StringAsyncHost} for the provided content.
     * @param content The content of the file.
     * @param file The file name for the content.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static forFile(content: PromiseLike<string> | string, file = "file.grammar", hostFallback?: CoreAsyncHost) {
        return new StringAsyncHost(file, content, hostFallback);
    }

    /**
     * Creates a `CoreAsyncHost`.
     * @param options The options used to configure the host.
     * @param hostFallback An optional host to use as a fallback for operations not supported by this host.
     */
    public static from(custom: CoreAsyncHostOptions, hostFallback?: CoreAsyncHost) {
        return new CoreAsyncHost(custom, hostFallback);
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
    public parseSourceFile(file: string, text: string, cancelable?: Cancelable): SourceFile {
        performance.mark("beforeParse");
        try {
            return this.parser.parseSourceFile(file, text, cancelable);
        }
        finally {
            performance.mark("afterParse");
            performance.measure("parse", "beforeParse", "afterParse");
        }
    }

    /**
     * Reads a file from the host.
     * @param file The path to the file.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` for either a `string` containing the content if the file could be read, or `undefined` if the file could not be read.
     */
    public async readFile(file: string, cancelable?: Cancelable): Promise<string | undefined> {
        performance.mark("ioRead");
        try {
            return await this.readFileCore(file, toCancelToken(cancelable));
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
    public async writeFile(file: string, text: string, cancelable?: Cancelable): Promise<void> {
        performance.mark("ioWrite");
        try {
            await this.writeFileCore(file, text, toCancelToken(cancelable));
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
    public async getSourceFile(file: string, cancelable?: Cancelable): Promise<SourceFile | undefined> {
        cancelable = toCancelToken(cancelable);
        const result = await this.readFile(file, cancelable);
        return result !== undefined ? this.parseSourceFile(file, result, cancelable) : undefined;
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
    protected normalizeFileCore(file: string): string {
        const normalizeFile = this._normalizeFile;
        if (normalizeFile) {
            return normalizeFile(file, this._normalizeFileCallback ??= this._normalizeFileFallback.bind(this));

        }
        return this._normalizeFileFallback(file);
    }

    private _normalizeFileFallback(file: string): string {
        return this._hostFallback?.normalizeFile(file)
            ?? (this.ignoreCase && !isUri(file) ? file.toUpperCase().toLowerCase() : file);
    }

    /**
     * When overridden in a derived class, resolves the full path of a file relative to the provided referer.
     * @param file The path to the requested file.
     * @param referrer An optional path indicating the file from which the path should be resolved.
     * @virtual
     */
    protected resolveFileCore(file: string, referrer?: string) {
        const resolveFile = this._resolveFile;
        if (resolveFile) {
            return resolveFile(file, referrer, this._resolveFileCallback ??= this._resolveFileFallback.bind(this));
        }
        return this._resolveFileFallback(file, referrer);
    }

    private _resolveFileFallback(file: string, referer?: string) {
        if (this._hostFallback) return this._hostFallback.resolveFile(file, referer);
        throw new Error("Cannot resolve a file without a fallback host.");
    }

    /**
     * When overridden in a derived class, returns the path for a known or built-in grammar based on its name (i.e., `"es2015"`, etc.)
     * @param name The name of the grammar.
     * @virtual
     */
    protected resolveKnownGrammarCore(name: string): string | undefined {
        const resolveKnownGrammar = this._resolveKnownGrammar;
        if (resolveKnownGrammar) {
            return resolveKnownGrammar(name, this._resolveKnownGrammarCallback ??= this._resolveKnownGrammarFallback.bind(this));
        }
        return this._resolveKnownGrammarFallback(name);
    }

    private _resolveKnownGrammarFallback(name: string) {
        return this._hostFallback?.resolveKnownGrammar(name);
    }

    /**
     * When overridden in a derived clas, registers a known grammar for use with `@import` directives.
     * @param name The name for the grammar.
     * @param file The file path of the grammar.
     * @virtual
     */
    protected registerKnownGrammarCore(name: string, file: string) {
        if (this._hostFallback) throw new Error("Known grammars must be registered on the fallback host.");
        (this._knownGrammars ??= new Map()).set(name.toUpperCase(), file);
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
            return readFile(file, cancelToken, this._readFileCallback ??= this._readFileFallback.bind(this));
        }
        return this._readFileFallback(file, cancelToken);
    }

    private async _readFileFallback(file: string, cancelToken?: CancelToken) {
        if (this._hostFallback) {
            return this._hostFallback.readFile(file, cancelToken);
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
            return writeFile(file, content, cancelToken, this._writeFileCallback ??= this._writeFileFallback.bind(this));
        }
        return this._writeFileFallback(file, content, cancelToken);
    }

    private async _writeFileFallback(file: string, content: string, cancelToken?: CancelToken) {
        if (this._hostFallback) {
            return this._hostFallback.writeFile(file, content, cancelToken);
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
    constructor(file: string, content: PromiseLike<string> | string, hostFallback?: CoreAsyncHost) {
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
            ["ES2020", require.resolve("../grammars/es2020.grammar")],
            ["TS", require.resolve("../grammars/typescript.grammar")],
            ["TYPESCRIPT", require.resolve("../grammars/typescript.grammar")],
        ]);
    }
    return builtinGrammars.get(name.toUpperCase());
}
