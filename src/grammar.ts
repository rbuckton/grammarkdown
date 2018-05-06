import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as performance from "./performance";
import { Host } from "./host";
import { DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Parser } from "./parser";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter/index";
import { SourceFile, Import } from "./nodes";
import { CancellationToken } from "prex";

export class Grammar {
    public readonly host: Host;
    public rootFiles: SourceFile[] = [];
    public sourceFiles: SourceFile[] = [];
    public options: CompilerOptions;
    public diagnostics: DiagnosticMessages = new DiagnosticMessages();

    private bindings = new BindingTable();
    private rootNames: Iterable<string> | undefined;
    private sourceFilesMap: Map<string, SourceFile> | undefined;
    private parsePromise: Promise<void> | undefined;
    private bindPromise: Promise<void> | undefined;
    private innerBinder: Binder | undefined;
    private innerChecker: Checker | undefined;
    private innerResolver: Resolver | undefined;
    private innerEmitter: Emitter | undefined;

    constructor(rootNames: Iterable<string>, options: CompilerOptions = getDefaultOptions(), host = new Host()) {
        this.rootNames = rootNames;
        this.options = options;
        this.host = host;
    }

    public get resolver(): Resolver {
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

    public getSourceFile(file: string) {
        file = this.resolveFile(file);
        return this.getSourceFileNoResolve(file);
    }

    public async parse(cancellationToken = CancellationToken.none) {
        cancellationToken.throwIfCancellationRequested();

        if (this.parsePromise) {
            await new Promise<void>(async (resolve, reject) => {
                const registration = cancellationToken.register(() => {
                    try {
                        cancellationToken.throwIfCancellationRequested();
                    }
                    catch (e) {
                        reject(e);
                    }
                });

                try {
                    await this.parsePromise;
                    resolve();
                }
                catch (e) {
                    reject(e);
                }

                registration.unregister();
            });
        }
        else {
            const registration = cancellationToken.register(() => {
                this.parsePromise = undefined;
            });

            this.parsePromise = this.parseWorker(cancellationToken);
            await this.parsePromise;
            registration.unregister();
        }
    }

    public async bind(cancellationToken = CancellationToken.none) {
        cancellationToken.throwIfCancellationRequested();

        if (this.bindPromise) {
            await new Promise<void>(async (resolve, reject) => {
                const registration = cancellationToken.register(() => {
                    try {
                        cancellationToken.throwIfCancellationRequested();
                    }
                    catch (e) {
                        reject(e);
                    }
                });

                try {
                    await this.bindPromise;
                    resolve();
                }
                catch (e) {
                    reject(e);
                }

                registration.unregister();
            });
        }
        else {
            const registration = cancellationToken.register(() => {
                this.bindPromise = undefined;
            });

            this.bindPromise = this.bindWorker(cancellationToken);
            await this.bindPromise;
            registration.unregister();
        }
    }

    public async check(sourceFile?: SourceFile, cancellationToken = CancellationToken.none) {
        await this.bind(cancellationToken);

        cancellationToken.throwIfCancellationRequested();
        const registration = cancellationToken.register(() => {
            this.innerChecker = undefined;
            this.innerEmitter = undefined;
        });

        const checker = this.checker;

        performance.mark("beforeCheck");

        if (sourceFile) {
            checker.checkSourceFile(sourceFile, this.bindings, this.diagnostics, cancellationToken);
        }
        else {
            for (const sourceFile of this.sourceFiles) {
                checker.checkSourceFile(sourceFile, this.bindings, this.diagnostics, cancellationToken);
            }
        }

        performance.mark("afterCheck");
        performance.measure("check", "beforeCheck", "afterCheck");
        registration.unregister();
    }

    public async emit(sourceFile?: SourceFile, writeFile: (file: string, output: string) => Promise<void> = (file, content) => this.writeFile(file, content), cancellationToken = CancellationToken.none) {
        await this.check(sourceFile);

        const resolver = this.resolver;
        const emitter = this.emitter;

        if (sourceFile) {
            await emitter.emit(sourceFile, resolver, this.diagnostics, writeFile, cancellationToken);
        }
        else {
            for (const sourceFile of this.rootFiles) {
                await emitter.emit(sourceFile, resolver, this.diagnostics, writeFile, cancellationToken);
            }
        }
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

    protected readFile(file: string): Promise<string | undefined> {
        return this.host.readFile(file);
    }

    protected writeFile(file: string, content: string) {
        return this.host.writeFile(file, content);
    }

    private async parseWorker(cancellationToken: CancellationToken) {
        if (this.rootNames) {
            for (const rootName of this.rootNames) {
                await this.processRootFile(this.resolveFile(rootName), cancellationToken);
            }

            this.rootNames = undefined;
        }
    }

    private async bindWorker(cancellationToken: CancellationToken) {
        await this.parse(cancellationToken);

        const binder = this.binder;

        performance.mark("beforeBind");

        for (const sourceFile of this.sourceFiles) {
            binder.bindSourceFile(sourceFile, this.bindings, cancellationToken);
        }

        performance.mark("afterBind");
        performance.measure("bind", "beforeBind", "afterBind");
    }

    private resolveFile(file: string, referer?: string) {
        return this.host.resolveFile(file, referer);
    }

    private normalizeFile(file: string) {
        return this.host.normalizeFile(file);
    }

    private async processRootFile(file: string, cancellationToken: CancellationToken) {
        const sourceFile = await this.processFile(file, cancellationToken);
        if (sourceFile === undefined) {
            throw new Error("Invalid source file");
        }
        if (this.rootFiles.indexOf(sourceFile) === -1) {
            this.rootFiles.push(sourceFile);
        }
    }

    private async processFile(file: string, cancellationToken: CancellationToken, referer?: SourceFile, refererPos?: number, refererEnd?: number): Promise<SourceFile | undefined> {
        let sourceFile = this.getSourceFileNoResolve(file);
        if (sourceFile) return sourceFile;

        sourceFile = await this.host.getSourceFile(file, cancellationToken);
        if (!sourceFile) return undefined;

        this.sourceFiles.push(sourceFile);
        this.setSourceFileNoResolve(file, sourceFile);
        if (sourceFile.parseDiagnostics) {
            this.diagnostics.copyFrom(sourceFile.parseDiagnostics);
        }

        await this.processImports(sourceFile, file, cancellationToken);
        return sourceFile;
    }

    private async processImports(sourceFile: SourceFile, refererName: string, cancellationToken: CancellationToken) {
        for (const element of sourceFile.elements) {
            if (element.kind === SyntaxKind.Import) {
                const importNode = <Import>element;
                if (importNode.path && importNode.path.text) {
                    const importPath = this.resolveFile(importNode.path.text, refererName);
                    await this.processFile(importPath, cancellationToken, sourceFile, importNode.getStart(sourceFile), importNode.end);
                }
            }
        }
    }

    private getSourceFileNoResolve(file: string) {
        file = this.normalizeFile(file);
        return this.sourceFilesMap && this.sourceFilesMap.get(file);
    }

    private setSourceFileNoResolve(file: string, sourceFile: SourceFile) {
        if (!this.sourceFilesMap) this.sourceFilesMap = new Map<string, SourceFile>();
        file = this.normalizeFile(file);
        this.sourceFilesMap.set(file, sourceFile);
    }
}