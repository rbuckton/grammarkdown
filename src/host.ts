import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as url from "url";
import * as util from "util";
import * as performance from "./performance";
import { SourceFile } from "./nodes";
import { DiagnosticMessages } from "./diagnostics";
import { Parser } from "./parser";
import { CompilerOptions } from "./options";
import { CancellationToken } from "prex";
import { promiseFinally, pipe } from "./core";

export interface HostOptions {
    knownGrammars?: Record<string, string>;
    useBuiltinGrammars?: boolean;
    readFile?: (this: never, file: string, cancellationToken?: CancellationToken) => Promise<string>;
    readFileSync?: (this: never, file: string, cancellationToken?: CancellationToken) => string;
    writeFile?: (this: never, file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>;
    writeFileSync?: (this: never, file: string, content: string, cancellationToken?: CancellationToken) => void;
}

export class Host {
    public readonly ignoreCase = /^(win32|win64|darwin)$/.test(os.platform());

    private static builtinGrammars: Map<string, string> | undefined;
    private useBuiltinGrammars: boolean;
    private innerParser: Parser | undefined;
    private knownGrammars: Map<string, string> | undefined;
    private readFileCallback?: (file: string, cancellationToken?: CancellationToken) => Promise<string> | string | undefined;
    private readFileSyncCallback?: (file: string, cancellationToken?: CancellationToken) => string;
    private writeFileCallback?: (file: string, content: string, cancellationToken?: CancellationToken) => Promise<void> | void;
    private writeFileSyncCallback?: (file: string, content: string, cancellationToken?: CancellationToken) => void;

    constructor({ knownGrammars, useBuiltinGrammars = true, readFile, readFileSync, writeFile, writeFileSync }: HostOptions = {}) {
        this.useBuiltinGrammars = useBuiltinGrammars;

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
        if (!Host.builtinGrammars) {
            Host.builtinGrammars = new Map<string, string>([
                ["es6", path.resolve(__dirname, "../grammars/es2015.grammar")],
                ["es2015", path.resolve(__dirname, "../grammars/es2015.grammar")],
                ["ts", path.resolve(__dirname, "../grammars/typescript.grammar")],
                ["typescript", path.resolve(__dirname, "../grammars/typescript.grammar")],
            ]);
        }
        return Host.builtinGrammars.get(name.toLowerCase());
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