import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";
import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { Parser } from "./parser";
import { CancellationToken } from "prex";
import { promiseFinally, pipe } from "./core";

const ignoreCaseFallback = /^(win32|win64|darwin)$/.test(os.platform());

let builtinGrammars: Map<string, string> | undefined;

export interface HostBaseOptions {
    ignoreCase?: boolean;
    knownGrammars?: Record<string, string>;
    useBuiltinGrammars?: boolean;
}

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

    public parseSourceFile(file: string, text: string, cancellationToken?: CancellationToken) {
        performance.mark("beforeParse");
        const sourceFile = this.parser.parseSourceFile(file, text, cancellationToken);
        performance.mark("afterParse");
        performance.measure("parse", "beforeParse", "afterParse");
        return sourceFile;
    }

    protected createParser(): Parser {
        return new Parser();
    }
}

export interface SyncHostOptions extends HostBaseOptions {
    readFileSync?: ((this: never, file: string, cancellationToken?: CancellationToken) => string) | false;
    writeFileSync?: ((this: never, file: string, content: string, cancellationToken?: CancellationToken) => void) | false;
}

export class SyncHost extends HostBase {
    private readFileSyncCallback?: ((file: string, cancellationToken?: CancellationToken) => string) | false;
    private writeFileSyncCallback?: ((file: string, content: string, cancellationToken?: CancellationToken) => void) | false;

    constructor({ readFileSync = readFileSyncFallback, writeFileSync = writeFileSyncFallback, ...baseOptions }: SyncHostOptions = {}) {
        super(baseOptions);
        this.readFileSyncCallback = readFileSync;
        this.writeFileSyncCallback = writeFileSync;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: SyncHost) {
        return new SyncSingleFileHost(file, content, hostFallback);
    }

    public readFileSync(file: string, cancellationToken?: CancellationToken): string | undefined {
        const readFile = this.readFileSyncCallback;
        if (!readFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = readFile(file, cancellationToken);
        performance.measure("ioRead", "ioRead");
        return result;
    }

    public writeFileSync(file: string, text: string, cancellationToken?: CancellationToken) {
        const writeFile = this.writeFileSyncCallback;
        if (!writeFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        writeFile(file, text, cancellationToken);
        performance.measure("ioWrite", "ioWrite");
    }

    public getSourceFileSync(file: string, cancellationToken?: CancellationToken) {
        const result = this.readFileSync(file, cancellationToken);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancellationToken) : undefined;
    }
}

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

    public readFileSync(file: string, cancellationToken?: CancellationToken): string | undefined {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFileSync(file, cancellationToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public writeFileSync(file: string, text: string, cancellationToken?: CancellationToken) {
        if (this.hostFallback) return this.hostFallback.writeFileSync(file, text, cancellationToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

export interface AsyncHostOptions extends HostBaseOptions {
    readFile?: ((this: never, file: string, cancellationToken?: CancellationToken) => Promise<string>) | false;
    writeFile?: ((this: never, file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>) | false;
}

export class AsyncHost extends HostBase {
    private readFileCallback?: ((file: string, cancellationToken?: CancellationToken) => Promise<string>) | false;
    private writeFileCallback?: ((file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>) | false;

    constructor({ readFile = readFileFallback, writeFile = writeFileFallback, ...baseOptions }: AsyncHostOptions = {}) {
        super(baseOptions);
        this.readFileCallback = readFile;
        this.writeFileCallback = writeFile;
    }

    public static forFile(content: string, file = "file.grammar", hostFallback?: AsyncHost) {
        return new AsyncSingleFileHost(file, content, hostFallback);
    }

    public async readFile(file: string, cancellationToken?: CancellationToken): Promise<string | undefined> {
        const readFile = this.readFileCallback;
        if (!readFile) throw new Error("Operation cannot be completed asynchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = await readFile(file, cancellationToken);
        performance.measure("ioRead", "ioRead");
        return result;
    }

    public async writeFile(file: string, text: string, cancellationToken?: CancellationToken) {
        const writeFile = this.writeFileCallback;
        if (!writeFile) throw new Error("Operation cannot be completed asynchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        await writeFile(file, text, cancellationToken);
        performance.measure("ioWrite", "ioWrite");
    }

    public async getSourceFile(file: string, cancellationToken?: CancellationToken) {
        const result = await this.readFile(file, cancellationToken);
        return typeof result === "string" ? this.parseSourceFile(file, result, cancellationToken) : undefined;
    }
}

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

    public async readFile(file: string, cancellationToken?: CancellationToken): Promise<string | undefined> {
        if (file === this.file) return this.content;
        if (this.hostFallback) return await this.hostFallback.readFile(file, cancellationToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public async writeFile(file: string, text: string, cancellationToken?: CancellationToken) {
        if (this.hostFallback) return this.hostFallback.writeFile(file, text, cancellationToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }
}

export interface HostOptions extends HostBaseOptions {
    readFile?: (this: never, file: string, cancellationToken?: CancellationToken) => Promise<string>;
    readFileSync?: (this: never, file: string, cancellationToken?: CancellationToken) => string;
    writeFile?: (this: never, file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>;
    writeFileSync?: (this: never, file: string, content: string, cancellationToken?: CancellationToken) => void;
}

/** @deprecated Use `SyncHost` or `AsyncHost` instead */
export class Host extends HostBase {
    private readFileCallback?: (file: string, cancellationToken?: CancellationToken) => Promise<string> | string | undefined;
    private readFileSyncCallback?: (file: string, cancellationToken?: CancellationToken) => string;
    private writeFileCallback?: (file: string, content: string, cancellationToken?: CancellationToken) => Promise<void> | void;
    private writeFileSyncCallback?: (file: string, content: string, cancellationToken?: CancellationToken) => void;

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

    public async readFile(file: string, cancellationToken?: CancellationToken): Promise<string | undefined> {
        return await this.readFilePossiblyAsync(/*sync*/ false, file, cancellationToken);
    }

    public readFileSync(file: string, cancellationToken?: CancellationToken): string | undefined {
        return this.readFilePossiblyAsync(/*sync*/ true, file, cancellationToken);
    }

    private readFilePossiblyAsync(sync: true, file: string, cancellationToken?: CancellationToken): string | undefined;
    private readFilePossiblyAsync(sync: boolean, file: string, cancellationToken?: CancellationToken): Promise<string | undefined> | string | undefined;
    private readFilePossiblyAsync(sync: boolean, file: string, cancellationToken?: CancellationToken): Promise<string | undefined> | string | undefined {
        const readFile = sync ? this.readFileSyncCallback : this.readFileCallback;
        if (!readFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const result = readFile(file, cancellationToken);
        return typeof result === "object" ? promiseFinally(result, endIORead) : endIORead(result);
    }

    public async writeFile(file: string, text: string, cancellationToken?: CancellationToken) {
        return await this.writeFilePossiblyAsync(/*sync*/ false, file, text, cancellationToken);
    }

    public writeFileSync(file: string, text: string, cancellationToken?: CancellationToken) {
        this.writeFilePossiblyAsync(/*sync*/ true, file, text, cancellationToken);
    }

    private writeFilePossiblyAsync(sync: true, file: string, text: string, cancellationToken?: CancellationToken): void;
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancellationToken?: CancellationToken): Promise<void> | void;
    private writeFilePossiblyAsync(sync: boolean, file: string, text: string, cancellationToken?: CancellationToken) {
        const writeFile = sync ? this.writeFileSyncCallback : this.writeFileCallback;
        if (!writeFile) throw new Error("Operation cannot be completed synchronously");

        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        const result = writeFile(file, text, cancellationToken);
        return typeof result === "object" ? promiseFinally(result, endIOWrite) : endIOWrite();
    }

    public async getSourceFile(file: string, cancellationToken?: CancellationToken) {
        return this.getSourceFilePossiblyAsync(/*sync*/ false, file, cancellationToken);
    }

    public getSourceFileSync(file: string, cancellationToken?: CancellationToken) {
        return this.getSourceFilePossiblyAsync(/*sync*/ true, file, cancellationToken);
    }

    private getSourceFilePossiblyAsync(sync: true, file: string, cancellationToken?: CancellationToken): SourceFile | undefined;
    private getSourceFilePossiblyAsync(sync: boolean, file: string, cancellationToken?: CancellationToken): Promise<SourceFile | undefined> | SourceFile | undefined;
    private getSourceFilePossiblyAsync(sync: boolean, file: string, cancellationToken?: CancellationToken) {
        return pipe(
            sync ? this.readFileSync(file, cancellationToken) : this.readFile(file, cancellationToken),
            result => typeof result === "string" ? this.parseSourceFile(file, result, cancellationToken) : undefined);
    }
}

/** @deprecated Use `SyncHost.forFile` or `AsyncHost.forFile` instead */
export class SingleFileHost extends Host {
    public readonly file: string;
    public readonly content: string;
    private hostFallback: Host | undefined;

    constructor(content: string, file: string = "file.grammar", hostFallback?: Host) {
        super({ useBuiltinGrammars: false });
        this.file = file;
        this.content = content;
        this.hostFallback = this.hostFallback;
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

    public async readFile(file: string, cancellationToken?: CancellationToken): Promise<string | undefined> {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFile(file, cancellationToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public readFileSync(file: string, cancellationToken?: CancellationToken): string | undefined {
        if (file === this.file) return this.content;
        if (this.hostFallback) return this.hostFallback.readFileSync(file, cancellationToken);
        throw new Error(`File '${file}' cannot be read without a fallback host.`);
    }

    public async writeFile(file: string, text: string, cancellationToken?: CancellationToken) {
        if (this.hostFallback) return this.hostFallback.writeFile(file, text, cancellationToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public writeFileSync(file: string, text: string, cancellationToken?: CancellationToken) {
        if (this.hostFallback) return this.hostFallback.writeFileSync(file, text, cancellationToken);
        throw new Error(`Cannot write file without a fallback host.`);
    }

    public async getSourceFile(file: string, cancellationToken?: CancellationToken) {
        return file !== this.file && this.hostFallback ? this.hostFallback.getSourceFile(file, cancellationToken) :
            super.getSourceFile(file, cancellationToken);
    }

    public getSourceFileSync(file: string, cancellationToken?: CancellationToken) {
        return file !== this.file && this.hostFallback ? this.hostFallback.getSourceFileSync(file, cancellationToken) :
            super.getSourceFileSync(file, cancellationToken);
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