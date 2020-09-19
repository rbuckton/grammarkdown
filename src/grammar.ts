/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancellationToken } from "prex";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";
import * as performance from "./performance";
import { CoreSyncHost, CoreAsyncHost } from "./host";
import { Host, SingleFileHost } from "./hosts/node";
import { DiagnosticMessages, LineOffsetMap } from "./diagnostics";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { SourceFile } from "./nodes";
import { pipe, forEachPossiblyAsync, toCancelToken } from "./core";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter";

/**
 * The primary service used to interact with one or more Grammarkdown {@link SourceFile|SourceFiles}.
 * {@docCategory Compiler}
 */
export class Grammar {
    private _bindings: BindingTable | undefined;
    private _rootNames: Iterable<string> | undefined;
    private _parseState: ParseState | undefined;
    private _parsePromise: Promise<void> | void | undefined;
    private _innerBinder: Binder | undefined;
    private _innerChecker: Checker | undefined;
    private _innerResolver: Resolver | undefined;
    private _innerEmitter: Emitter | undefined;
    private _lineOffsetMap = new LineOffsetMap();
    private _writeFileFallback = (file: string, content: string, cancelToken?: CancelToken) => this.writeFile(file, content, cancelToken);
    private _writeFileSyncFallback = (file: string, content: string) => this.writeFileSync(file, content);

    /**
     * The {@link CompilerOptions} used by the grammar.
     */
    public readonly options: Readonly<CompilerOptions>;
    /**
     * The [Host](xref:hosts) the grammar uses to interact with the file system.
     */
    public readonly host: Host | CoreSyncHost | CoreAsyncHost;
    /**
     * The diagnostic messages produced by the grammar.
     */
    public readonly diagnostics: DiagnosticMessages = new DiagnosticMessages(this._lineOffsetMap);

    /**
     * @param rootNames The names of the root files used by the grammar.
     * @param options The {@link CompilerOptions} used by the grammar.
     * @param host The [Host](xref:hosts) the grammar uses to interact with the file system.
     */
    constructor(rootNames: Iterable<string>, options: CompilerOptions = getDefaultOptions(), host: Host | CoreSyncHost | CoreAsyncHost = new Host()) {
        this._rootNames = rootNames;
        this.options = options;
        this.host = host;
    }

    /**
     * Indicates whether the grammar has been parsed.
     */
    public get isParsed() {
        return this._parseState !== undefined;
    }

    /**
     * Indicates whether the grammar has been bound.
     */
    public get isBound() {
        return this._bindings !== undefined;
    }

    /**
     * Gets the source files parsed by the grammar.
     * @throws `Error` - Grammar has not yet been parsed.
     */
    public get sourceFiles(): ReadonlyArray<SourceFile> {
        if (!this._parseState) throw new Error("Grammar has not yet been parsed.");
        return this._parseState.sourceFiles;
    }

    /**
     * Gets the root files parsed by the grammar.
     * @throws `Error` - Grammar has not yet been parsed.
     */
    public get rootFiles(): ReadonlyArray<SourceFile> {
        if (!this._parseState) throw new Error("Grammar has not yet been parsed.");
        return this._parseState.rootFiles;
    }

    /**
     * Gets the resolver used to resolve references to bound nodes.
     * @throws `Error` - Grammar has not yet been bound.
     */
    public get resolver(): Resolver {
        if (!this._bindings) throw new Error("Grammar has not yet been bound.");
        return this._innerResolver
            || (this._innerResolver = this.createResolver(this._bindings));
    }

    /**
     * Gets the {@link Binder} used to bind the grammar.
     */
    protected get binder(): Binder {
        return this._innerBinder || (this._innerBinder = this.createBinder(this.options));
    }

    /**
     * Gets the {@link Checker} used to check the grammar.
     */
    protected get checker(): Checker {
        return this._innerChecker || (this._innerChecker = this.createChecker(this.options));
    }

    /**
     * Gets the {@link Emitter} used to emit the grammar.
     */
    protected get emitter(): Emitter {
        return this._innerEmitter || (this._innerEmitter = this.createEmitter(this.options));
    }

    /**
     * Converts a string containing Grammarkdown syntax into output based on the provided options.
     * @param content The Grammarkdown source text to convert.
     * @param options The {@link CompilerOptions} used by the grammar.
     * @param hostFallback An optional host to use as a fallback for file system operations.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | CoreSyncHost | CoreAsyncHost, cancelable?: Cancelable): string;
    /**
     * {@inheritDoc Grammar.(convert:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | CoreSyncHost | CoreAsyncHost, cancelable?: CancellationToken | Cancelable): string;
    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | CoreSyncHost | CoreAsyncHost, cancelable?: CancellationToken | Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        const host = hostFallback === undefined || !("readFile" in hostFallback) ? CoreSyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            !("readFileSync" in hostFallback) ? CoreAsyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            new SingleFileHost(content, /*file*/ undefined, hostFallback);

        const grammar = new Grammar([host.file], options, host);
        grammar.parseSync(cancelToken);

        const sourceFile = grammar.getSourceFile(host.file);
        if (!sourceFile) throw new Error(`Unable to resolve single file.`);

        return grammar.emitStringSync(sourceFile, cancelToken);
    }

    /**
     * Gets the {@link SourceFile} parsed for the provided file path.
     * @param file The path to the source file.
     * @returns The {@link SourceFile} for the provided path, if one was parsed; otherwise, `undefined`.
     */
    public getSourceFile(file: string) {
        file = this._resolveFile(file);
        return this._parseState && this._getSourceFileNoResolve(this._parseState, file);
    }

    /**
     * Asynchronously parses the root files provided to the grammar.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` that is settled when the operation has completed.
     */
    public parse(cancelable?: Cancelable): Promise<void>;
    /**
     * {@inheritdoc Grammar.(parse:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public parse(cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async parse(cancelable?: CancellationToken | Cancelable) {
        await this._parsePossiblyAsync(/*sync*/ false, toCancelToken(cancelable));
    }

    /**
     * Synchronously parses the root files provided to the grammar.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public parseSync(cancelable?: Cancelable): void;
    /**
     * {@inheritdoc Grammar.(parseSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public parseSync(cancelable?: CancellationToken | Cancelable): void;
    public parseSync(cancelable?: CancellationToken | Cancelable) {
        this._parsePossiblyAsync(/*sync*/ true, toCancelToken(cancelable));
    }

    private _parsePossiblyAsync(sync: boolean, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (this._parseState) return;
        if (this._parsePromise) return this._parsePromise;
        const state: ParseState = { rootFiles: [], sourceFiles: [], sourceFilesMap: undefined };
        return this._parsePromise = pipe(
            this._beginParsePossiblyAsync(sync, state, cancelToken),
            () => this._endParse(state));
    }

    private _beginParsePossiblyAsync(sync: boolean, state: ParseState, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (this._rootNames) {
            return forEachPossiblyAsync(this._rootNames, rootName => {
                return this._processRootFilePossiblyAsync(sync, state, this._resolveFile(rootName), cancelToken);
            });
        }
    }

    private _endParse(state: ParseState) {
        if (!this._parseState) {
            this._parseState = state;
            this._rootNames = undefined;
        }
    }

    /**
     * Asynchronously binds each file in the grammar. Will also parse the grammar if it has not yet been parsed.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` that is settled when the operation has completed.
     */
    public async bind(cancelable?: Cancelable): Promise<void>;
    /**
     * {@inheritDoc Grammar.(bind:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public async bind(cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async bind(cancelable?: CancellationToken | Cancelable) {
        await this._bindPossiblyAsync(/*sync*/ false, toCancelToken(cancelable));
    }

    /**
     * Synchronously binds each file in the grammar. Will also parse the grammar if it has not yet been parsed.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public bindSync(cancelable?: Cancelable): void;
    /**
     * {@inheritDoc Grammar.(bindSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public bindSync(cancelable?: CancellationToken | Cancelable): void;
    public bindSync(cancelable?: CancellationToken | Cancelable) {
        this._bindPossiblyAsync(/*sync*/ true, toCancelToken(cancelable));
    }

    private _bindPossiblyAsync(sync: boolean, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this._parsePossiblyAsync(sync, cancelToken),
            () => this._endBind(cancelToken));
    }

    private _endBind(cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();

        const binder = this.binder;
        performance.mark("beforeBind");

        const bindings = new BindingTable();
        for (const sourceFile of this.sourceFiles) {
            binder.bindSourceFile(sourceFile, bindings, cancelToken);
        }

        this._bindings = bindings;

        performance.mark("afterBind");
        performance.measure("bind", "beforeBind", "afterBind");
    }

    /**
     * Asynchronously checks each file in the grammar. Will also parse and bind the grammar if it has not yet been parsed or bound.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` that is settled when the operation has completed.
     */
    public check(sourceFile?: SourceFile, cancelable?: Cancelable): Promise<void>;
    /**
     * {@inheritDoc Grammar.(check:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public check(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async check(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable) {
        await this._checkPossiblyAsync(/*sync*/ false, sourceFile, toCancelToken(cancelable));
    }

    /**
     * Synchronously checks each file in the grammar. Will also parse and bind the grammar if it has not yet been parsed or bound.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public checkSync(sourceFile?: SourceFile, cancelable?: Cancelable): void;
    /**
     * {@inheritDoc Grammar.(checkSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public checkSync(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable): void;
    public checkSync(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable) {
        this._checkPossiblyAsync(/*sync*/ true, sourceFile, toCancelToken(cancelable));
    }

    private _checkPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this._bindPossiblyAsync(sync, cancelToken),
            () => this._endCheck(sourceFile, cancelToken));
    }

    private _endCheck(sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();

        const subscription = cancelToken?.subscribe(() => {
            this._innerChecker = undefined;
            this._innerEmitter = undefined;
        });

        const checker = this.checker;

        performance.mark("beforeCheck");

        if (sourceFile) {
            checker.checkSourceFile(sourceFile, this._bindings!, this.diagnostics, cancelToken);
        }
        else {
            for (const sourceFile of this.sourceFiles) {
                checker.checkSourceFile(sourceFile, this._bindings!, this.diagnostics, cancelToken);
            }
        }

        performance.mark("afterCheck");
        performance.measure("check", "beforeCheck", "afterCheck");

        subscription?.unsubscribe();
    }

    /**
     * Asynchronously emits each file in the grammar. Will also parse, bind, and check the grammar if it has not yet been parsed, bound, or checked.
     * @param sourceFile The {@link SourceFile} to emit. If not provided, this method will generate output for all root files.
     * @param writeFile An optional callback used to write the output. If not provided, this method will emit output via this grammar's {@link Grammar.host|host}.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` that is settled when the operation has completed.
     */
    public emit(sourceFile?: SourceFile, writeFile?: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelable?: Cancelable): Promise<void>;
    /**
     * {@inheritDoc Grammar.(emit:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public emit(sourceFile?: SourceFile, writeFile?: (file: string, output: string) => void | PromiseLike<void>, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async emit(sourceFile?: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void> = this._writeFileFallback, cancelable?: CancellationToken | Cancelable) {
        await this._emitPossiblyAsync(/*sync*/ false, sourceFile, writeFile, toCancelToken(cancelable));
    }

    /**
     * Synchronously emits each file in the grammar. Will also parse, bind, and check the grammar if it has not yet been parsed, bound, or checked.
     * @param sourceFile The {@link SourceFile} to emit. If not provided, this method will generate output for all root files.
     * @param writeFile An optional callback used to write the output. If not provided, this method will emit output via this grammar's {@link Grammar.host|host}.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public emitSync(sourceFile?: SourceFile, writeFile?: (file: string, output: string, cancelToken?: CancelToken) => void, cancelable?: Cancelable): void;
    /**
     * {@inheritDoc Grammar.(emitSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public emitSync(sourceFile?: SourceFile, writeFile?: (file: string, output: string) => void, cancelable?: CancellationToken | Cancelable): void;
    public emitSync(sourceFile?: SourceFile, writeFile: (file: string, output: string) => void = this._writeFileSyncFallback, cancelable?: CancellationToken | Cancelable) {
        this._emitPossiblyAsync(/*sync*/ true, sourceFile, writeFile, toCancelToken(cancelable));
    }

    private _emitPossiblyAsync(sync: true, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void, cancelToken?: CancelToken): void;
    private _emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken): Promise<void> | void;
    private _emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this._checkPossiblyAsync(sync, sourceFile, cancelToken),
            () => this._endEmitPossiblyAsync(sync, sourceFile, writeFile, cancelToken));
    }

    private _endEmitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (sourceFile) {
            return this._emitOnePossiblyAsync(sync, sourceFile, writeFile, cancelToken);
        }
        else {
            return forEachPossiblyAsync(this.rootFiles, sourceFile => this._emitOnePossiblyAsync(sync, sourceFile, writeFile, cancelToken));
        }
    }

    private _emitOnePossiblyAsync(sync: boolean, sourceFile: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        return sync ?
            this.emitter.emitSync(sourceFile, this.resolver, this.diagnostics, writeFile, cancelToken) :
            this.emitter.emit(sourceFile, this.resolver, this.diagnostics, writeFile, cancelToken);
    }

    /**
     * Asynchronously emits the provided file in the grammar as a string. Will also parse, bind, and check the grammar if it has not yet been parsed, bound, or checked.
     * @param sourceFile The {@link SourceFile} to emit.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` for the emit output that is settled when the operation has completed.
     */
    public emitString(sourceFile: SourceFile, cancelable?: Cancelable): Promise<string>;
    /**
     * {@inheritDoc Grammar.(emitString:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public emitString(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable): Promise<string>;
    public async emitString(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable) {
        return await this._emitStringPossiblyAsync(/*sync*/ false, sourceFile, toCancelToken(cancelable));
    }

    /**
     * Synchronously emits the provided file in the grammar as a string. Will also parse, bind, and check the grammar if it has not yet been parsed, bound, or checked.
     * @param sourceFile The {@link SourceFile} to emit.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns The emit output.
     */
    public emitStringSync(sourceFile: SourceFile, cancelable?: Cancelable): string;
    /**
     * {@inheritDoc Grammar.(emitStringSync:1)}
     * @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable`
     */
    public emitStringSync(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable): string;
    public emitStringSync(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable) {
        return this._emitStringPossiblyAsync(/*sync*/ true, sourceFile, toCancelToken(cancelable));
    }

    private _emitStringPossiblyAsync(sync: true, sourceFile: SourceFile, cancelToken?: CancelToken): string;
    private _emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancelToken?: CancelToken): Promise<string> | string;
    private _emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this._checkPossiblyAsync(sync, sourceFile, cancelToken),
            () => this.emitter.emitString(sourceFile, this.resolver, this.diagnostics, cancelToken));
    }

    /**
     * When overridden in a derived class, creates a {@link Binder} to be used by this grammar.
     * @param options The options to pass on to the {@link Binder}.
     * @virtual
     */
    protected createBinder(options: Readonly<CompilerOptions>): Binder {
        return new Binder();
    }

    /**
     * When overridden in a derived class, creates a {@link Checker} to be used by this grammar.
     * @param options The options to pass on to the {@link Checker}.
     * @virtual
     */
    protected createChecker(options: Readonly<CompilerOptions>): Checker {
        return new Checker(options, this._lineOffsetMap);
    }

    /**
     * When overridden in a derived class, creates a {@link Resolver} to be used by this grammar.
     * @param bindings A {@link BindingTable} used by the resolver to resolve references to nodes.
     * @virtual
     */
    protected createResolver(bindings: BindingTable) {
        return new Resolver(bindings, this._lineOffsetMap);
    }

    /**
     * When overridden in a derived class, creates an {@link Emitter} to be used by this grammar.
     * @param options The options to pass on to the {@link Emitter}.
     * @virtual
     */
    protected createEmitter(options: CompilerOptions): Emitter {
        switch (options.format) {
            case EmitFormat.ecmarkup:
                return new EcmarkupEmitter(options)

            case EmitFormat.html:
                return new HtmlEmitter(options);

            case EmitFormat.markdown:
            default:
                return new MarkdownEmitter(options);
        }
    }

    /**
     * When overridden in a derived class, asynchronously reads the contents of the provided file.
     * @param file The file to read.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `Promise` for either a `string` containing the content if the file could be read, or `undefined` if the file could not be read.
     * @virtual
     */
    protected readFile(file: string, cancelToken?: CancelToken): Promise<string | undefined> | string | undefined {
        return "readFile" in this.host ? this.host.readFile(file, cancelToken) :
            this.host.readFileSync(file, cancelToken);
    }

    /**
     * When overridden in a derived class, synchronously reads the contents of the provided file.
     * @param file The file to read.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `string` containing the content if the file could be read; otherwise, `undefined`.
     * @virtual
     */
    protected readFileSync(file: string): Promise<string | undefined> | string | undefined {
        if (!("readFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
        return this.host.readFileSync(file);
    }

    /**
     * When overridden in a derived class, asynchronously writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @returns A `Promise` that is settled when the operation completes.
     * @virtual
     */
    protected writeFile(file: string, content: string, cancelToken?: CancelToken) {
        return "writeFile" in this.host ? this.host.writeFile(file, content, cancelToken) :
            this.host.writeFileSync(file, content, cancelToken);
    }

    /**
     * When overridden in a derived class, synchronosly writes a file to the host.
     * @param file The path to the file.
     * @param text The contents of the file.
     * @param cancelToken A cancellation token that can be used by the caller to abort the operation.
     * @virtual
     */
    protected writeFileSync(file: string, content: string) {
        if (!("writeFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
        return this.host.writeFileSync(file, content);
    }

    private _resolveFile(file: string, referer?: string) {
        return this.host.resolveFile(file, referer);
    }

    private _normalizeFile(file: string) {
        return this.host.normalizeFile(file);
    }

    private _processRootFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancelToken?: CancelToken) {
        return pipe(
            this._processFilePossiblyAsync(sync, state, file, cancelToken),
            sourceFile => this._endProcessRootFile(state, sourceFile));
    }

    private _endProcessRootFile(state: ParseState, sourceFile: SourceFile | undefined) {
        if (sourceFile === undefined) {
            throw new Error("Invalid source file");
        }
        if (state.rootFiles.indexOf(sourceFile) === -1) {
            state.rootFiles.push(sourceFile);
        }
    }

    private _processFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancelToken?: CancelToken, referer?: SourceFile, refererPos?: number, refererEnd?: number) {
        let sourceFile = this._getSourceFileNoResolve(state, file);
        if (sourceFile) return sourceFile;

        let result: Promise<SourceFile | undefined> | SourceFile | undefined;
        if (sync) {
            if (!("getSourceFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
            result = this.host.getSourceFileSync(file, cancelToken);
        }
        else {
            result = "getSourceFile" in this.host ? this.host.getSourceFile(file, cancelToken) :
                this.host.getSourceFileSync(file, cancelToken);
        }

        return pipe(
            result,
            sourceFile => this._endProcessFilePossiblyAsync(sync, state, file, sourceFile, cancelToken)
        );
    }

    private _endProcessFilePossiblyAsync(sync: boolean, state: ParseState, file: string, sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        if (!sourceFile) return undefined;

        state.sourceFiles.push(sourceFile);
        this._setSourceFileNoResolve(state, file, sourceFile);
        if (sourceFile.parseDiagnostics) {
            this.diagnostics.copyFrom(sourceFile.parseDiagnostics);
        }

        return pipe(
            this._processImportsPossiblyAsync(sync, state, sourceFile, file, cancelToken),
            () => sourceFile);
    }

    private _processImportsPossiblyAsync(sync: boolean, state: ParseState, sourceFile: SourceFile, refererName: string, cancelToken?: CancelToken): Promise<void> | void {
        return forEachPossiblyAsync(sourceFile.elements, element => {
            if (element.kind === SyntaxKind.Import) {
                if (element.path && element.path.text) {
                    const importPath = this._resolveFile(element.path.text, refererName);
                    return this._processFilePossiblyAsync(sync, state, importPath, cancelToken, sourceFile, element.getStart(sourceFile), element.end);
                }
            }
        });
    }

    private _getSourceFileNoResolve(state: ParseState, file: string) {
        file = this._normalizeFile(file);
        return state.sourceFilesMap && state.sourceFilesMap.get(file);
    }

    private _setSourceFileNoResolve(state: ParseState, file: string, sourceFile: SourceFile) {
        if (!state.sourceFilesMap) state.sourceFilesMap = new Map<string, SourceFile>();
        file = this._normalizeFile(file);
        state.sourceFilesMap.set(file, sourceFile);
    }
}

interface ParseState {
    rootFiles: SourceFile[];
    sourceFiles: SourceFile[];
    sourceFilesMap: Map<string, SourceFile> | undefined;
}