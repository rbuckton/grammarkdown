import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as performance from "./performance";
import { Host, SingleFileHost, SyncHost, AsyncHost } from "./host";
import { DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Parser } from "./parser";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter/index";
import { SourceFile, Import } from "./nodes";
import { CancellationToken, CancellationTokenCountdown } from "prex";
import { pipe, isPromise, forEachPossiblyAsync } from "./core";

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
    private writeFileFallback = (file: string, content: string, cancellationToken?: CancellationToken) => this.writeFile(file, content, cancellationToken);
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

    public static convert(content: string, options?: CompilerOptions, hostFallback?: Host | SyncHost | AsyncHost, cancellationToken?: CancellationToken) {
        const host = hostFallback === undefined || !("readFile" in hostFallback) ? SyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            !("readFileSync" in hostFallback) ? AsyncHost.forFile(content, /*file*/ undefined, hostFallback) :
            new SingleFileHost(content, /*file*/ undefined, hostFallback);

        const grammar = new Grammar([host.file], options, host);
        grammar.parseSync(cancellationToken);

        const sourceFile = grammar.getSourceFile(host.file);
        if (!sourceFile) throw new Error(`Unable to resolve single file.`);

        return grammar.emitStringSync(sourceFile, cancellationToken);
    }

    public getSourceFile(file: string) {
        file = this.resolveFile(file);
        return this.parseState && this.getSourceFileNoResolve(this.parseState, file);
    }

    public async parse(cancellationToken = CancellationToken.none) {
        await this.parsePossiblyAsync(/*sync*/ false, cancellationToken);
    }

    public parseSync(cancellationToken = CancellationToken.none) {
        this.parsePossiblyAsync(/*sync*/ true, cancellationToken);
    }

    private parsePossiblyAsync(sync: boolean, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        if (this.parseState) return;
        if (this.parsePromise) return this.parsePromise;
        const state: ParseState = { rootFiles: [], sourceFiles: [], sourceFilesMap: undefined };
        return this.parsePromise = pipe(
            this.beginParsePossiblyAsync(sync, state, cancellationToken),
            () => this.endParse(state));
    }

    private beginParsePossiblyAsync(sync: boolean, state: ParseState, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        if (this.rootNames) {
            return forEachPossiblyAsync(this.rootNames, rootName => {
                return this.processRootFilePossiblyAsync(sync, state, this.resolveFile(rootName), cancellationToken);
            });
        }
    }

    private endParse(state: ParseState) {
        if (!this.parseState) {
            this.parseState = state;
            this.rootNames = undefined;
        }
    }

    public async bind(cancellationToken = CancellationToken.none) {
        await this.bindPossiblyAsync(/*sync*/ false, cancellationToken);
    }

    public bindSync(cancellationToken = CancellationToken.none) {
        this.bindPossiblyAsync(/*sync*/ true, cancellationToken);
    }

    private bindPossiblyAsync(sync: boolean, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        return pipe(
            this.parsePossiblyAsync(sync, cancellationToken),
            () => this.endBind(cancellationToken));
    }

    private endBind(cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();

        const binder = this.binder;
        performance.mark("beforeBind");

        const bindings = new BindingTable();
        for (const sourceFile of this.sourceFiles) {
            binder.bindSourceFile(sourceFile, bindings, cancellationToken);
        }

        this.bindings = bindings;

        performance.mark("afterBind");
        performance.measure("bind", "beforeBind", "afterBind");
    }

    public async check(sourceFile?: SourceFile, cancellationToken = CancellationToken.none) {
        await this.checkPossiblyAsync(/*sync*/ false, sourceFile, cancellationToken);
    }

    public checkSync(sourceFile?: SourceFile, cancellationToken = CancellationToken.none) {
        this.checkPossiblyAsync(/*sync*/ true, sourceFile, cancellationToken);
    }

    private checkPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        return pipe(
            this.bindPossiblyAsync(sync, cancellationToken),
            () => this.endCheck(sourceFile, cancellationToken));
    }

    private endCheck(sourceFile: SourceFile | undefined, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();

        const registration = cancellationToken.register(() => {
            this.innerChecker = undefined;
            this.innerEmitter = undefined;
        });

        const checker = this.checker;

        performance.mark("beforeCheck");

        if (sourceFile) {
            checker.checkSourceFile(sourceFile, this.bindings!, this.diagnostics, cancellationToken);
        }
        else {
            for (const sourceFile of this.sourceFiles) {
                checker.checkSourceFile(sourceFile, this.bindings!, this.diagnostics, cancellationToken);
            }
        }

        performance.mark("afterCheck");
        performance.measure("check", "beforeCheck", "afterCheck");
        registration.unregister();
    }

    public async emit(sourceFile?: SourceFile, writeFile: (file: string, output: string) => void | Promise<void> = this.writeFileFallback, cancellationToken = CancellationToken.none) {
        await this.emitPossiblyAsync(/*sync*/ false, sourceFile, writeFile, cancellationToken);
    }

    public emitSync(sourceFile?: SourceFile, writeFile: (file: string, output: string) => void = this.writeFileSyncFallback, cancellationToken = CancellationToken.none) {
        this.emitPossiblyAsync(/*sync*/ true, sourceFile, writeFile, cancellationToken);
    }

    private emitPossiblyAsync(sync: true, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string) => void, cancellationToken: CancellationToken): void;
    private emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string) => void | Promise<void>, cancellationToken: CancellationToken): Promise<void> | void;
    private emitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string) => void | Promise<void>, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        return pipe(
            this.checkPossiblyAsync(sync, sourceFile, cancellationToken),
            () => this.endEmitPossiblyAsync(sync, sourceFile, writeFile, cancellationToken));
    }

    private endEmitPossiblyAsync(sync: boolean, sourceFile: SourceFile | undefined, writeFile: (file: string, output: string) => void | Promise<void>, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        if (sourceFile) {
            return this.emitOnePossiblyAsync(sync, sourceFile, writeFile, cancellationToken);
        }
        else {
            return forEachPossiblyAsync(this.rootFiles, sourceFile => this.emitOnePossiblyAsync(sync, sourceFile, writeFile, cancellationToken));
        }
    }

    private emitOnePossiblyAsync(sync: boolean, sourceFile: SourceFile, writeFile: (file: string, output: string) => void | Promise<void>, cancellationToken: CancellationToken) {
        return sync ? this.emitter.emitSync(sourceFile, this.resolver, this.diagnostics, writeFile, cancellationToken) :
            this.emitter.emit(sourceFile, this.resolver, this.diagnostics, writeFile, cancellationToken);
    }

    public async emitString(sourceFile: SourceFile, cancellationToken = CancellationToken.none) {
        return await this.emitStringPossiblyAsync(/*sync*/ false, sourceFile, cancellationToken);
    }

    public emitStringSync(sourceFile: SourceFile, cancellationToken = CancellationToken.none) {
        return this.emitStringPossiblyAsync(/*sync*/ true, sourceFile, cancellationToken);
    }

    private emitStringPossiblyAsync(sync: true, sourceFile: SourceFile, cancellationToken: CancellationToken): string;
    private emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancellationToken: CancellationToken): Promise<string> | string;
    private emitStringPossiblyAsync(sync: boolean, sourceFile: SourceFile, cancellationToken: CancellationToken) {
        cancellationToken.throwIfCancellationRequested();
        return pipe(
            this.checkPossiblyAsync(sync, sourceFile, cancellationToken),
            () => this.emitter.emitString(sourceFile, this.resolver, this.diagnostics, cancellationToken));
    }

    protected createBinder(options: CompilerOptions): Binder;
    protected createBinder(_options: CompilerOptions): Binder {
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

    protected readFile(file: string, cancellationToken?: CancellationToken): Promise<string | undefined> | string | undefined {
        return "readFile" in this.host ? this.host.readFile(file, cancellationToken) :
            this.host.readFileSync(file, cancellationToken);
    }

    protected readFileSync(file: string): Promise<string | undefined> | string | undefined {
        if (!("readFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
        return this.host.readFileSync(file);
    }

    protected writeFile(file: string, content: string, cancellationToken?: CancellationToken) {
        return "writeFile" in this.host ? this.host.writeFile(file, content, cancellationToken) :
            this.host.writeFileSync(file, content, cancellationToken);
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

    private processRootFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancellationToken: CancellationToken) {
        return pipe(
            this.processFilePossiblyAsync(sync, state, file, cancellationToken),
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

    private processFilePossiblyAsync(sync: boolean, state: ParseState, file: string, cancellationToken: CancellationToken, referer?: SourceFile, refererPos?: number, refererEnd?: number) {
        let sourceFile = this.getSourceFileNoResolve(state, file);
        if (sourceFile) return sourceFile;

        let result: Promise<SourceFile | undefined> | SourceFile | undefined;
        if (sync) {
            if (!("getSourceFileSync" in this.host)) throw new Error("Operation cannot be completed synchronously.");
            result = this.host.getSourceFileSync(file, cancellationToken);
        }
        else {
            result = "getSourceFile" in this.host ? this.host.getSourceFile(file, cancellationToken) :
                this.host.getSourceFileSync(file, cancellationToken);
        }

        return pipe(
            result,
            sourceFile => this.endProcessFilePossiblyAsync(sync, state, file, sourceFile, cancellationToken)
        );
    }

    private endProcessFilePossiblyAsync(sync: boolean, state: ParseState, file: string, sourceFile: SourceFile | undefined, cancellationToken: CancellationToken) {
        if (!sourceFile) return undefined;

        state.sourceFiles.push(sourceFile);
        this.setSourceFileNoResolve(state, file, sourceFile);
        if (sourceFile.parseDiagnostics) {
            this.diagnostics.copyFrom(sourceFile.parseDiagnostics);
        }

        return pipe(
            this.processImportsPossiblyAsync(sync, state, sourceFile, file, cancellationToken),
            () => sourceFile);
    }

    private processImportsPossiblyAsync(sync: boolean, state: ParseState, sourceFile: SourceFile, refererName: string, cancellationToken: CancellationToken): Promise<void> | void {
        return forEachPossiblyAsync(sourceFile.elements, element => {
            if (element.kind === SyntaxKind.Import) {
                if (element.path && element.path.text) {
                    const importPath = this.resolveFile(element.path.text, refererName);
                    return this.processFilePossiblyAsync(sync, state, importPath, cancellationToken, sourceFile, element.getStart(sourceFile), element.end);
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