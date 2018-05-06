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

export interface HostOptions {
    knownGrammars?: Record<string, string>;
    useBuiltinGrammars?: boolean;
    readFile?: (this: never, file: string, cancellationToken?: CancellationToken) => Promise<string>;
    writeFile?: (this: never, file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>;
}

export class Host {
    public readonly ignoreCase = /^(win32|win64|darwin)$/.test(os.platform());

    private static builtinGrammars: Map<string, string> | undefined;
    private useBuiltinGrammars: boolean;
    private innerParser: Parser | undefined;
    private knownGrammars: Map<string, string> | undefined;
    private readFileCallback: (file: string, cancellationToken?: CancellationToken) => Promise<string>;
    private writeFileCallback: (file: string, content: string, cancellationToken?: CancellationToken) => Promise<void>;

    constructor({ knownGrammars, useBuiltinGrammars = true, readFile = readFileFallback, writeFile = writeFileFallback }: HostOptions = {}) {
        this.useBuiltinGrammars = useBuiltinGrammars;
        this.readFileCallback = readFile;
        this.writeFileCallback = writeFile;
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

    public async readFile(file: string, cancellationToken?: CancellationToken) {
        performance.mark("ioRead");
        file = getLocalPath(file);
        if (isUri(file)) return undefined; // TODO: support uris?
        const content = await (void 0, this.readFileCallback)(file, cancellationToken);
        performance.measure("ioRead", "ioRead");
        return content;
    }

    public async writeFile(file: string, text: string, cancellationToken?: CancellationToken) {
        performance.mark("ioWrite");
        file = getLocalPath(file);
        if (isUri(file)) throw new Error("Cannot write to a non-file URI.");
        await (void 0, this.writeFileCallback)(file, text, cancellationToken);
        performance.measure("ioWrite", "ioWrite");
    }

    public async getSourceFile(file: string, cancellationToken?: CancellationToken) {
        const text = await this.readFile(file, cancellationToken);
        if (text === undefined) return undefined;
        return this.parseSourceFile(file, text, cancellationToken);
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

function writeFileFallback(file: string, content: string) {
    return new Promise<void>((resolve, reject) => fs.writeFile(file, content, "utf8", (error) => error ? reject(error) : resolve()));
}