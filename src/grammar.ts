/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";
import * as performance from "./performance";
import { CoreAsyncHost } from "./host";
import { DiagnosticMessages } from "./diagnostics";
import { LineOffsetMap } from "./lineOffsetMap";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { SourceFile } from "./nodes";
import { toCancelToken, SharedOperation } from "./core";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter";
import { NodeAsyncHost } from "./hosts/node";
import { getSourceFileAccessor } from "./nodeInternal";

/**
 * The primary service used to interact with one or more Grammarkdown {@link SourceFile|SourceFiles}.
 * {@docCategory Compiler}
 */
export class Grammar {
    private _bindings: BindingTable | undefined;
    private _rootNames: Iterable<string> | undefined;
    private _parseState: ParseState | undefined;
    private _parseShared: SharedOperation<void> | undefined;
    private _innerBinder: Binder | undefined;
    private _innerChecker: Checker | undefined;
    private _innerResolver: Resolver | undefined;
    private _innerEmitter: Emitter | undefined;
    private _lineOffsetMap = new LineOffsetMap();
    private _writeFileFallback = (file: string, content: string, cancelToken?: CancelToken) => this.writeFile(file, content, cancelToken);

    /**
     * The {@link CompilerOptions} used by the grammar.
     */
    public readonly options: Readonly<CompilerOptions>;
    /**
     * The {@link CoreAsyncHost} the grammar uses to interact with the file system.
     */
    public readonly host: CoreAsyncHost;
    /**
     * The diagnostic messages produced by the grammar.
     */
    public readonly diagnostics: DiagnosticMessages = new DiagnosticMessages(this._lineOffsetMap);

    /**
     * @param rootNames The names of the root files used by the grammar.
     * @param options The {@link CompilerOptions} used by the grammar.
     * @param host The [Host](xref:hosts) the grammar uses to interact with the file system.
     */
    constructor(rootNames: Iterable<string>, options: CompilerOptions = getDefaultOptions(), host: CoreAsyncHost = new NodeAsyncHost()) {
        this._rootNames = rootNames;
        this.options = options;
        this.host = host;
    }

    /**
     * Indicates whether the grammar has been parsed.
     */
    public get isParsed(): boolean {
        return this._parseState !== undefined;
    }

    /**
     * Indicates whether the grammar has been bound.
     */
    public get isBound(): boolean {
        return this._bindings !== undefined;
    }

    /**
     * Gets the source files parsed by the grammar.
     * @throws `Error` - Grammar has not yet been parsed.
     */
    public get sourceFiles(): readonly SourceFile[] {
        if (!this._parseState) throw new Error("Grammar has not yet been parsed.");
        return this._parseState.sourceFiles;
    }

    /**
     * Gets the root files parsed by the grammar.
     * @throws `Error` - Grammar has not yet been parsed.
     */
    public get rootFiles(): readonly SourceFile[] {
        if (!this._parseState) throw new Error("Grammar has not yet been parsed.");
        return this._parseState.rootFiles;
    }

    /**
     * Gets the resolver used to resolve references to bound nodes.
     * @throws `Error` - Grammar has not yet been bound.
     */
    public get resolver(): Resolver {
        if (!this._bindings) throw new Error("Grammar has not yet been bound.");
        return this._innerResolver ??= this.createResolver(this._bindings);
    }

    /**
     * Gets the {@link Binder} used to bind the grammar.
     */
    protected get binder(): Binder {
        return this._innerBinder ??= this.createBinder(this.options);
    }

    /**
     * Gets the {@link Checker} used to check the grammar.
     */
    protected get checker(): Checker {
        return this._innerChecker ??= this.createChecker(this.options);
    }

    /**
     * Gets the {@link Emitter} used to emit the grammar.
     */
    protected get emitter(): Emitter {
        return this._innerEmitter ??= this.createEmitter(this.options);
    }

    /**
     * Converts a string containing Grammarkdown syntax into output based on the provided options.
     * @param content The Grammarkdown source text to convert.
     * @param options The {@link CompilerOptions} used by the grammar.
     * @param hostFallback An optional host to use as a fallback for file system operations.
     * @param cancelable A cancelable object that can be used to abort the operation.
     */
    public static async convert(content: string, options: CompilerOptions & { file?: string } = {}, hostFallback?: CoreAsyncHost, cancelable?: Cancelable): Promise<string> {
        const cancelToken = toCancelToken(cancelable);
        const { file, ...restOptions } = options;
        const host = CoreAsyncHost.forFile(content, file, hostFallback);

        const grammar = new Grammar([host.file], restOptions, host);
        await grammar.parse(cancelToken);

        const sourceFile = grammar.getSourceFile(host.file);
        if (!sourceFile) throw new Error(`Unable to resolve single file.`);

        return await grammar.emitString(sourceFile, cancelToken);
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
    public async parse(cancelable?: Cancelable): Promise<void> {
        this._parseShared ??= new SharedOperation(cancelToken => this._parseWorker(cancelToken));
        await this._parseShared.invoke(cancelable);
    }

    private async _parseWorker(cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        const state: ParseState = { rootFiles: [], sourceFiles: [], sourceFilesMap: undefined };
        if (this._rootNames) {
            for (const rootName of this._rootNames) {
                await this._processRootFile(state, this._resolveFile(rootName), cancelToken);
            }
        }
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
    public async bind(cancelable?: Cancelable): Promise<void> {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        await this.parse(cancelToken);
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
    public async check(sourceFile?: SourceFile, cancelable?: Cancelable): Promise<void> {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        await this.bind(cancelToken);
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
    public async emit(sourceFile?: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void> = this._writeFileFallback, cancelable?: Cancelable): Promise<void> {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        await this.check(sourceFile, cancelToken);
        cancelToken?.throwIfSignaled();
        if (sourceFile) {
            await this._emitOne(sourceFile, writeFile, cancelToken);
        }
        else {
            await Promise.all(this.rootFiles.map(file => this._emitOne(file, writeFile, cancelToken)));
        }
    }

    private async _emitOne(sourceFile: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        return this.emitter.emit(sourceFile, this.resolver, this.diagnostics, writeFile, cancelToken);
    }

    /**
     * Asynchronously emits the provided file in the grammar as a string. Will also parse, bind, and check the grammar if it has not yet been parsed, bound, or checked.
     * @param sourceFile The {@link SourceFile} to emit.
     * @param cancelable A cancelable object that can be used to abort the operation.
     * @returns A `Promise` for the emit output that is settled when the operation has completed.
     */
    public async emitString(sourceFile: SourceFile, cancelable?: Cancelable): Promise<string> {
        const cancelToken = toCancelToken(cancelable);
        cancelToken?.throwIfSignaled();
        await this.check(sourceFile, cancelToken);
        cancelToken?.throwIfSignaled();
        return this.emitter.emitString(sourceFile, this.resolver, this.diagnostics, cancelToken);
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
        return this.host.readFile(file, cancelToken);
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
        return this.host.writeFile(file, content, cancelToken);
    }

    private _resolveFile(file: string, referer?: string) {
        return this.host.resolveFile(file, referer);
    }

    private _normalizeFile(file: string) {
        return this.host.normalizeFile(file);
    }

    private async _processRootFile(state: ParseState, file: string, cancelToken?: CancelToken) {
        const sourceFile = await this._processFile(state, file, cancelToken);
        if (sourceFile === undefined) {
            throw new Error("Invalid source file");
        }
        if (state.rootFiles.indexOf(sourceFile) === -1) {
            state.rootFiles.push(sourceFile);
        }
    }

    private async _processFile(state: ParseState, file: string, cancelToken?: CancelToken, referrer?: SourceFile, referrerPos?: number, referrerEnd?: number) {
        let sourceFile = this._getSourceFileNoResolve(state, file);
        if (sourceFile) return sourceFile;

        sourceFile = await this.host.getSourceFile(file, cancelToken);
        if (!sourceFile) return undefined;

        state.sourceFiles.push(sourceFile);
        this._setSourceFileNoResolve(state, file, sourceFile);

        const parseDiagnostics = getSourceFileAccessor().getParseDiagnostics(sourceFile);
        if (parseDiagnostics) {
            this.diagnostics.copyFrom(parseDiagnostics);
        }

        await this._processImports(state, sourceFile, file, cancelToken);
        return sourceFile;
    }

    private async _processImports(state: ParseState, sourceFile: SourceFile, referrerName: string, cancelToken?: CancelToken): Promise<void> {
        for (const element of sourceFile.elements) {
            if (element.kind === SyntaxKind.Import && typeof element.path?.text === "string") {
                const importPath = this._resolveFile(element.path.text, referrerName);
                await this._processFile(state, importPath, cancelToken, sourceFile, element.getStart(sourceFile), element.end);
            }
        }
    }

    private _getSourceFileNoResolve(state: ParseState, file: string) {
        file = this._normalizeFile(file);
        return state.sourceFilesMap?.get(file);
    }

    private _setSourceFileNoResolve(state: ParseState, file: string, sourceFile: SourceFile) {
        file = this._normalizeFile(file);
        (state.sourceFilesMap ??= new Map()).set(file, sourceFile);
    }
}

interface ParseState {
    rootFiles: SourceFile[];
    sourceFiles: SourceFile[];
    sourceFilesMap: Map<string, SourceFile> | undefined;
}