import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as performance from "./performance";
import { Dictionary } from "./core";
import { Host, HostLike } from "./host";
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
    public rootFiles: SourceFile[] = [];
    public sourceFiles: SourceFile[] = [];
    public options: CompilerOptions;
    public diagnostics: DiagnosticMessages = new DiagnosticMessages();
    public readonly cancellationToken: CancellationToken;

    private static knownGrammars = new Dictionary<string>({
        "es6": require.resolve("../../grammars/es2015.grammar"),
        "es2015": require.resolve("../../grammars/es2015.grammar"),
        // "es2016": require.resolve("../../grammars/es2016.grammar"),
        "ts": require.resolve("../../grammars/typescript.grammar"),
        "typescript": require.resolve("../../grammars/typescript.grammar"),
    });

    private bindings: BindingTable = new BindingTable();
    private fileMap: Dictionary<SourceFile> = new Dictionary<SourceFile>();
    private ignoreCase: boolean;
    private innerParser: Parser;
    private innerBinder: Binder;
    private innerChecker: Checker;
    private innerEmitter: Emitter;
    private host: Host;
    private oldGrammar: Grammar;

    constructor(rootNames: string[]);
    constructor(rootNames: string[], options: CompilerOptions);
    constructor(rootNames: string[], options: CompilerOptions, host: Host, oldGrammar?: Grammar, token?: CancellationToken);
    /*@obsolete*/
    /*@internal*/
    constructor(rootNames: string[], options: CompilerOptions, readFile: (file: string) => string, oldGrammar?: Grammar);
    constructor(rootNames: string[], options: CompilerOptions = getDefaultOptions(), readFileOrHostLike?: ((file: string) => string) | HostLike, oldGrammar?: Grammar, token = CancellationToken.none) {
        this.host = Host.getHost(readFileOrHostLike);
        this.options = options;
        this.oldGrammar = oldGrammar;
        this.cancellationToken = token;
        this.parse(rootNames);
        this.oldGrammar = undefined;
        Object.freeze(this.sourceFiles);
    }

    public get resolver(): Resolver {
        return this.checker.resolver;
    }

    protected get parser(): Parser {
        if (!this.innerParser) {
            this.innerParser = this.createParser(this.options);
        }

        return this.innerParser;
    }

    protected get binder(): Binder {
        if (!this.innerBinder) {
            this.innerBinder = this.createBinder(this.options, this.bindings);
        }

        return this.innerBinder;
    }

    protected get checker(): Checker {
        if (!this.innerChecker) {
            this.innerChecker = this.createChecker(this.options, this.bindings);
        }

        return this.innerChecker;
    }

    protected get emitter(): Emitter {
        if (!this.innerEmitter) {
            this.innerEmitter = this.createEmitter(this.options, this.checker.resolver);
        }

        return this.innerEmitter;
    }

    public static registerKnownGrammar(name: string, file: string) {
        Dictionary.set(Grammar.knownGrammars, name, file);
    }

    public getSourceFile(file: string) {
        file = this.resolveFile(file);
        return Dictionary.get(this.fileMap, this.normalizeFile(file));
    }

    private parse(rootNames: string[]) {
        performance.mark("beforeParse");

        for (const rootName of rootNames) {
            this.processRootFile(this.resolveFile(rootName));
        }

        performance.mark("afterParse");
        performance.measure("parse", "beforeParse", "afterParse");
    }

    /*@obsolete*/
    /*@internal*/
    bind(sourceFile: SourceFile): void;

    public bind(): void;
    public bind(sourceFile?: SourceFile) {
        if (sourceFile) {
            console.warn(`Calling 'Grammar#bind' with a SourceFile is an obsolete overload and will be removed in a future version.`);
        }

        const binder = this.binder;

        performance.mark("beforeBind");

        for (const sourceFile of this.sourceFiles) {
            binder.bindSourceFile(sourceFile);
        }

        performance.mark("afterBind");
        performance.measure("bind", "beforeBind", "afterBind");
    }

    public check(sourceFile?: SourceFile): void {
        this.bind();

        const checker = this.checker;

        performance.mark("beforeCheck");

        if (sourceFile) {
            checker.checkSourceFile(sourceFile);
        }
        else {
            for (const sourceFile of this.sourceFiles) {
                checker.checkSourceFile(sourceFile);
            }
        }

        performance.mark("afterCheck");
        performance.measure("check", "beforeCheck", "afterCheck");
    }

    public resetEmitter(): void {
        this.innerEmitter = undefined;
    }

    public emit(sourceFile?: SourceFile, writeFile: (file: string, output: string) => void = (file, content) => this.writeFile(file, content)): void {
        this.bind(sourceFile);
        this.check(sourceFile);

        const emitter = this.emitter;

        performance.mark("beforeEmit");

        if (sourceFile) {
            emitter.emit(sourceFile, writeFile);
        }
        else {
            for (const sourceFile of this.rootFiles) {
                emitter.emit(sourceFile, writeFile);
            }
        }

        performance.mark("afterEmit");
        performance.measure("emit", "beforeEmit", "afterEmit");
    }

    protected createParser(options: CompilerOptions): Parser {
        return new Parser(this.diagnostics, this.cancellationToken);
    }

    protected createBinder(options: CompilerOptions, bindings: BindingTable): Binder {
        return new Binder(bindings, this.cancellationToken);
    }

    protected createChecker(options: CompilerOptions, bindings: BindingTable): Checker {
        return new Checker(bindings, options.noChecks ? NullDiagnosticMessages.instance : this.diagnostics, options, this.cancellationToken);
    }

    protected createEmitter(options: CompilerOptions, resolver: Resolver): Emitter {
        switch (options.format) {
            case EmitFormat.ecmarkup:
                return new EcmarkupEmitter(options, resolver, this.diagnostics, this.cancellationToken)

            case EmitFormat.html:
                return new HtmlEmitter(options, resolver, this.diagnostics, this.cancellationToken);

            case EmitFormat.markdown:
            default:
                return new MarkdownEmitter(options, resolver, this.diagnostics, this.cancellationToken);
        }
    }

    protected readFile(file: string): string {
        performance.mark("ioRead");
        const content = this.host.readFile(file);
        performance.measure("ioRead", "ioRead");
        return content;
    }

    protected writeFile(file: string, content: string) {
        performance.mark("ioWrite");
        this.host.writeFile(file, content);
        performance.measure("ioWrite", "ioWrite");
    }

    private resolveFile(file: string, referer?: string) {
        file = Dictionary.get(Grammar.knownGrammars, file) || file;
        return this.host.resolveFile(file, referer);
    }

    private normalizeFile(file: string) {
        return this.host.normalizeFile(file);
    }

    private processRootFile(file: string) {
        const sourceFile = this.processFile(file);
        if (sourceFile === undefined) {
            throw new Error("Invalid source file");
        }
        if (this.rootFiles.indexOf(sourceFile) === -1) {
            this.rootFiles.push(sourceFile);
        }
    }

    private processFile(file: string, referer?: SourceFile, refererPos?: number, refererEnd?: number): SourceFile {
        let sourceFile = this.getSourceFile(file);
        if (sourceFile) {
            return sourceFile;
        }
        else {
            sourceFile = this.parseSourceFile(file);
            if (sourceFile) {
                Dictionary.set(this.fileMap, this.normalizeFile(file), sourceFile);
                this.sourceFiles.push(sourceFile);
                this.processImports(sourceFile, file);
            }
        }

        return sourceFile;
    }

    private processImports(sourceFile: SourceFile, refererName: string) {
        for (const element of sourceFile.elements) {
            if (element.kind === SyntaxKind.Import) {
                const importNode = <Import>element;
                if (importNode.path) {
                    const importPath = this.resolveFile(importNode.path.text, refererName);
                    this.processFile(importPath, sourceFile, importNode.pos, importNode.end);
                }
            }
        }
    }

    private parseSourceFile(file: string): SourceFile {
        const sourceText = this.readFile(file);
        if (sourceText !== undefined) {
            if (this.oldGrammar) {
                const oldSourceFile = this.oldGrammar.getSourceFile(file);
                if (oldSourceFile && oldSourceFile.text === sourceText) {
                    return oldSourceFile;
                }
            }

            return this.parser.parseSourceFile(file, sourceText);
        }

        return undefined;
    }
}

function readFile(file: string) {
    return fs.readFileSync(file, "utf8");
}