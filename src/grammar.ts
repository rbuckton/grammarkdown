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

import { CancellationToken } from "prex";
import { CancelToken } from "@esfx/async-canceltoken";
import { Cancelable } from "@esfx/cancelable";
import * as performance from "./performance";
import { Host, SingleFileHost, SyncHost, AsyncHost } from "./host";
import { DiagnosticMessages } from "./diagnostics";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { SourceFile } from "./nodes";
import { pipe, forEachPossiblyAsync, toCancelToken } from "./core";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter";

/** {@docCategory Compiler} */
export class Grammar {
    public readonly host: Host | SyncHost | AsyncHost;
    public options: CompilerOptions;
    public diagnostics: DiagnosticMessages = new DiagnosticMessages();

    private bindings: BindingTable | undefined;
    private rootNames: Iterable<string> | undefined;
    private parseState: ParseState | undefined;
    private parsePromise: Promise<void> | void | undefined;
    private innerBinder: Binder | undefined;
    private innerChecker: Checker | undefined;
    private innerResolver: Resolver | undefined;
    private innerEmitter: Emitter | undefined;
    private writeFileFallback = (file: string, content: string, cancelToken?: CancelToken) => this.writeFile(file, content, cancelToken);
    private writeFileSyncFallback = (file: string, content: string) => this.writeFileSync(file, content);

    constructor(rootNames: Iterable<string>, options: CompilerOptions = getDefaultOptions(), host: Host | SyncHost | AsyncHost = new Host()) {
        this.rootNames = rootNames;
        this.options = options;
        this.host = host;
    }

    public get isParsed() {
        return this.parseState !== undefined;
    }

    public get isBound() {
        return this.bindings !== undefined;
    }

    public get sourceFiles(): ReadonlyArray<SourceFile> {
        if (!this.parseState) throw new Error("Files have not yet been parsed");
        return this.parseState.sourceFiles;
    }

    public get rootFiles(): ReadonlyArray<SourceFile> {
        if (!this.parseState) throw new Error("Files have not yet been parsed");
        return this.parseState.rootFiles;
    }

    public get resolver(): Resolver {
        if (!this.bindings) throw new Error("Grammar has not yet been bound");
        return this.innerResolver
            || (this.innerResolver = this.createResolver(this.bindings));
    }

    protected get binder(): Binder {
        return this.innerBinder
            || (this.innerBinder = this.createBinder(this.options));
    }

    protected get checker(): Checker {
        if (!this.innerChecker) {
            this.innerChecker = this.createChecker(this.options);
        }

        return this.innerChecker;
    }

    protected get emitter(): Emitter {
        return this.innerEmitter || (this.innerEmitter = this.createEmitter(this.options));
    }

    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | SyncHost | AsyncHost, cancelable?: Cancelable): string;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | SyncHost | AsyncHost, cancelable?: CancellationToken | Cancelable): string;
    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | SyncHost | AsyncHost, cancelable?: CancellationToken | Cancelable) {
        const cancelToken = toCancelToken(cancelable);
        const host = hostFallback === undefined || !("readFile" in hostFallback) ? SyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            !("readFileSync" in hostFallback) ? AsyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            new SingleFileHost(content, /*file*/ undefined, hostFallback);

        const grammar = new Grammar([host.file], options, host);
        grammar.parseSync(cancelToken);

        const sourceFile = grammar.getSourceFile(host.file);
        if (!sourceFile) throw new Error(`Unable to resolve single file.`);

        return grammar.emitStringSync(sourceFile, cancelToken);
    }

    public getSourceFile(file: string) {
        file = this.resolveFile(file);
        return this.parseState && this.getSourceFileNoResolve(this.parseState, file);
    }

    public parse(cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public parse(cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async parse(cancelable?: CancellationToken | Cancelable) {
        await this.parsePossiblyAsync(/*sync*/ false, toCancelToken(cancelable));
    }

    public parseSync(cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public parseSync(cancelable?: CancellationToken | Cancelable): void;
    public parseSync(cancelable?: CancellationToken | Cancelable) {
        this.parsePossiblyAsync(/*sync*/ true, toCancelToken(cancelable));
    }

    private parsePossiblyAsync(sync: boolean, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (this.parseState) return;
        if (this.parsePromise) return this.parsePromise;
        const state: ParseState = { rootFiles: [], sourceFiles: [], sourceFilesMap: undefined };
        return this.parsePromise = pipe(
            this.beginParsePossiblyAsync(sync, state, cancelToken),
            () => this.endParse(state));
    }

    private beginParsePossiblyAsync(sync: boolean, state: ParseState, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (this.rootNames) {
            return forEachPossiblyAsync(this.rootNames, rootName => {
                return this.processRootFilePossiblyAsync(sync, state, this.resolveFile(rootName), cancelToken);
            });
        }
    }

    private endParse(state: ParseState) {
        if (!this.parseState) {
            this.parseState = state;
            this.rootNames = undefined;
        }
    }

    public async bind(cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public async bind(cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async bind(cancelable?: CancellationToken | Cancelable) {
        await this.bindPossiblyAsync(/*sync*/ false, toCancelToken(cancelable));
    }

    public bindSync(cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public bindSync(cancelable?: CancellationToken | Cancelable): void;
    public bindSync(cancelable?: CancellationToken | Cancelable) {
        this.bindPossiblyAsync(/*sync*/ true, toCancelToken(cancelable));
    }

    private bindPossiblyAsync(sync: boolean, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this.parsePossiblyAsync(sync, cancelToken),
            () => this.endBind(cancelToken));
    }

    private endBind(cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();

        const binder = this.binder;
        performance.mark("beforeBind");

        const bindings = new BindingTable();
        for (const sourceFile of this.sourceFiles) {
            binder.bindSourceFile(sourceFile, bindings, cancelToken);
        }

        this.bindings = bindings;

        performance.mark("afterBind");
        performance.measure("bind", "beforeBind", "afterBind");
    }

    public check(sourceFile?: SourceFile, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public check(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async check(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable) {
        await this.checkPossiblyAsync(/*sync*/ false, sourceFile, toCancelToken(cancelable));
    }

    public checkSync(sourceFile?: SourceFile, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public checkSync(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable): void;
    public checkSync(sourceFile?: SourceFile, cancelable?: CancellationToken | Cancelable) {
        this.checkPossiblyAsync(/*sync*/ true, sourceFile, toCancelToken(cancelable));
    }

    private checkPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this.bindPossiblyAsync(sync, cancelToken),
            () => this.endCheck(sourceFile, cancelToken));
    }

    private endCheck(sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();

        const subscription = cancelToken?.subscribe(() => {
            this.innerChecker = undefined;
            this.innerEmitter = undefined;
        });

        const checker = this.checker;

        performance.mark("beforeCheck");

        if (sourceFile) {
            checker.checkSourceFile(sourceFile, this.bindings!, this.diagnostics, cancelToken);
        }
        else {
            for (const sourceFile of this.sourceFiles) {
                checker.checkSourceFile(sourceFile, this.bindings!, this.diagnostics, cancelToken);
            }
        }

        performance.mark("afterCheck");
        performance.measure("check", "beforeCheck", "afterCheck");

        subscription?.unsubscribe();
    }

    public emit(sourceFile?: SourceFile, writeFile?: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelable?: Cancelable): Promise<void>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emit(sourceFile?: SourceFile, writeFile?: (file: string, output: string) => void | PromiseLike<void>, cancelable?: CancellationToken | Cancelable): Promise<void>;
    public async emit(sourceFile?: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void> = this.writeFileFallback, cancelable?: CancellationToken | Cancelable) {
        await this.emitPossiblyAsync(/*sync*/ false, sourceFile, writeFile, toCancelToken(cancelable));
    }

    public emitSync(sourceFile?: SourceFile, writeFile?: (file: string, output: string, cancelToken?: CancelToken) => void, cancelable?: Cancelable): void;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emitSync(sourceFile?: SourceFile, writeFile?: (file: string, output: string) => void, cancelable?: CancellationToken | Cancelable): void;
    public emitSync(sourceFile?: SourceFile, writeFile: (file: string, output: string) => void = this.writeFileSyncFallback, cancelable?: CancellationToken | Cancelable) {
        this.emitPossiblyAsync(/*sync*/ true, sourceFile, writeFile, toCancelToken(cancelable));
    }

    private emitPossiblyAsync(sync: true, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void, cancelToken?: CancelToken): void;
    private emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken): Promise<void> | void;
    private emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this.checkPossiblyAsync(sync, sourceFile, cancelToken),
            () => this.endEmitPossiblyAsync(sync, sourceFile, writeFile, cancelToken));
    }

    private endEmitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        if (sourceFile) {
            return this.emitOnePossiblyAsync(sync, sourceFile, writeFile, cancelToken);
        }
        else {
            return forEachPossiblyAsync(this.rootFiles, sourceFile => this.emitOnePossiblyAsync(sync, sourceFile, writeFile, cancelToken));
        }
    }

    private emitOnePossiblyAsync(sync: boolean, sourceFile: SourceFile, writeFile: (file: string, output: string, cancelToken?: CancelToken) => void | PromiseLike<void>, cancelToken?: CancelToken) {
        return sync ?
            this.emitter.emitSync(sourceFile, this.resolver, this.diagnostics, writeFile, cancelToken) :
            this.emitter.emit(sourceFile, this.resolver, this.diagnostics, writeFile, cancelToken);
    }

    public emitString(sourceFile: SourceFile, cancelable?: Cancelable): Promise<string>;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emitString(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable): Promise<string>;
    public async emitString(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable) {
        return await this.emitStringPossiblyAsync(/*sync*/ false, sourceFile, toCancelToken(cancelable));
    }

    public emitStringSync(sourceFile: SourceFile, cancelable?: Cancelable): string;
    /** @deprecated since 2.1.0 - `prex.CancellationToken` may no longer be accepted in future releases. Please use a token that implements `@esfx/cancelable.Cancelable` */
    public emitStringSync(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable): string;
    public emitStringSync(sourceFile: SourceFile, cancelable?: CancellationToken | Cancelable) {
        return this.emitStringPossiblyAsync(/*sync*/ true, sourceFile, toCancelToken(cancelable));
    }

    private emitStringPossiblyAsync(sync: true, sourceFile: SourceFile, cancelToken?: CancelToken): string;
    private emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancelToken?: CancelToken): Promise<string> | string;
    private emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancelToken?: CancelToken) {
        cancelToken?.throwIfSignaled();
        return pipe(
            this.checkPossiblyAsync(sync, sourceFile, cancelToken),
            () => this.emitter.emitString(sourceFile, this.resolver, this.diagnostics, cancelToken));
    }

    protected createBinder(options: CompilerOptions): Binder {
        return new Binder();
    }

    protected createChecker(options: CompilerOptions): Checker {
        return new Checker(options);
    }

    protected createResolver(bindings: BindingTable) {
        return new Resolver(bindings);
    }

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

    protected readFile(file: string, cancelToken?: CancelToken): Promise<string | undefined> | string | undefined {
        return "readFile" in this.host ? this.host.readFile(file, cancelToken) :
            this.host.readFileSync(file, cancelToken);
    }

    protected readFileSync(file: string): Promise<string | undefined> | string | undefined {
        if (!("readFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
        return this.host.readFileSync(file);
    }

    protected writeFile(file: string, content: string, cancelToken?: CancelToken) {
        return "writeFile" in this.host ? this.host.writeFile(file, content, cancelToken) :
            this.host.writeFileSync(file, content, cancelToken);
    }

    protected writeFileSync(file: string, content: string) {
        if (!("writeFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
        return this.host.writeFileSync(file, content);
    }

    private resolveFile(file: string, referer?: string) {
        return this.host.resolveFile(file, referer);
    }

    private normalizeFile(file: string) {
        return this.host.normalizeFile(file);
    }

    private processRootFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancelToken?: CancelToken) {
        return pipe(
            this.processFilePossiblyAsync(sync, state, file, cancelToken),
            sourceFile => this.endProcessRootFile(state, sourceFile));
    }

    private endProcessRootFile(state: ParseState, sourceFile: SourceFile | undefined) {
        if (sourceFile === undefined) {
            throw new Error("Invalid source file");
        }
        if (state.rootFiles.indexOf(sourceFile) === -1) {
            state.rootFiles.push(sourceFile);
        }
    }

    private processFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancelToken?: CancelToken, referer?: SourceFile, refererPos?: number, refererEnd?: number) {
        let sourceFile = this.getSourceFileNoResolve(state, file);
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
            sourceFile => this.endProcessFilePossiblyAsync(sync, state, file, sourceFile, cancelToken)
        );
    }

    private endProcessFilePossiblyAsync(sync: boolean, state: ParseState, file: string, sourceFile: SourceFile | undefined, cancelToken?: CancelToken) {
        if (!sourceFile) return undefined;

        state.sourceFiles.push(sourceFile);
        this.setSourceFileNoResolve(state, file, sourceFile);
        if (sourceFile.parseDiagnostics) {
            this.diagnostics.copyFrom(sourceFile.parseDiagnostics);
        }

        return pipe(
            this.processImportsPossiblyAsync(sync, state, sourceFile, file, cancelToken),
            () => sourceFile);
    }

    private processImportsPossiblyAsync(sync: boolean, state: ParseState, sourceFile: SourceFile, refererName: string, cancelToken?: CancelToken): Promise<void> | void {
        return forEachPossiblyAsync(sourceFile.elements, element => {
            if (element.kind === SyntaxKind.Import) {
                if (element.path && element.path.text) {
                    const importPath = this.resolveFile(element.path.text, refererName);
                    return this.processFilePossiblyAsync(sync, state, importPath, cancelToken, sourceFile, element.getStart(sourceFile), element.end);
                }
            }
        });
    }

    private getSourceFileNoResolve(state: ParseState, file: string) {
        file = this.normalizeFile(file);
        return state.sourceFilesMap && state.sourceFilesMap.get(file);
    }

    private setSourceFileNoResolve(state: ParseState, file: string, sourceFile: SourceFile) {
        if (!state.sourceFilesMap) state.sourceFilesMap = new Map<string, SourceFile>();
        file = this.normalizeFile(file);
        state.sourceFilesMap.set(file, sourceFile);
    }
}

interface ParseState {
    rootFiles: SourceFile[];
    sourceFiles: SourceFile[];
    sourceFilesMap: Map<string, SourceFile> | undefined;
}