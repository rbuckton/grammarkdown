import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { Dict } from "./core";
import { DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { EmitFormat, CompilerOptions, getDefaultOptions } from "./options";
import { SyntaxKind } from "./tokens";
import { Parser } from "./parser";
import { Binder, BindingTable } from "./binder";
import { Checker, Resolver } from "./checker";
import { Emitter, EcmarkupEmitter, MarkdownEmitter, HtmlEmitter } from "./emitter/index";
import { SourceFile, Import } from "./nodes";

export class Grammar {
	public rootFiles: SourceFile[] = [];
	public sourceFiles: SourceFile[] = [];
	public options: CompilerOptions;
	public diagnostics: DiagnosticMessages = new DiagnosticMessages();
	
	private bindings: BindingTable = new BindingTable();
	private fileMap: Dict<SourceFile> = new Dict<SourceFile>();
	private ignoreCase: boolean;
	private innerParser: Parser;
	private innerBinder: Binder;
	private innerChecker: Checker;
	private innerEmitter: Emitter;
	private innerReadFile: (file: string) => string;
	
	constructor(rootNames: string[], options: CompilerOptions = getDefaultOptions(), readFile?: (file: string) => string) {
		let platform = os.platform();
		this.ignoreCase = /^(win32|win64|darwin)$/.test(platform);
		this.innerReadFile = readFile; 
		this.options = options;
		for (let rootName of rootNames) {
			this.processRootFile(this.resolveFile(rootName));
		}
		
		Object.freeze(this.sourceFiles);
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
	
	public getSourceFile(file: string) {
		file = this.resolveFile(file);
		return Dict.get(this.fileMap, this.normalizeFile(file));
	}
	
	public bind(sourceFile?: SourceFile) {
		let binder = this.binder;
		
		if (sourceFile) {
			binder.bindSourceFile(sourceFile);
		}
		else {
			for (let sourceFile of this.sourceFiles) {
				binder.bindSourceFile(sourceFile);
			}
		}
	}

	public check(sourceFile?: SourceFile): void {
		this.bind(sourceFile);
		
		let checker = this.checker;
		if (sourceFile) {
			checker.checkSourceFile(sourceFile);
		}
		else {
			for (let sourceFile of this.sourceFiles) {
				checker.checkSourceFile(sourceFile);
			}
		}
	}
	
	public resetEmitter(): void {
		this.innerEmitter = undefined;
	}
	
	public emit(sourceFile?: SourceFile, writeFile?: (file: string, output: string) => void): void {
		this.bind(sourceFile);
		this.check(sourceFile);
		
		let emitter = this.emitter;
		if (sourceFile) {
			emitter.emit(sourceFile, writeFile);
		}
		else {
			for (let sourceFile of this.rootFiles) {
				emitter.emit(sourceFile, writeFile);
			}
		}
	}
		
	protected createParser(options: CompilerOptions): Parser {
		return new Parser(this.diagnostics);
	}
	
	protected createBinder(options: CompilerOptions, bindings: BindingTable): Binder {
		return new Binder(bindings);
	}
	
	protected createChecker(options: CompilerOptions, bindings: BindingTable): Checker {
		return new Checker(bindings, options.noChecks ? NullDiagnosticMessages.instance : this.diagnostics); 
	}
	
	protected createEmitter(options: CompilerOptions, resolver: Resolver): Emitter {
		switch (options.format) {
			case EmitFormat.ecmarkup:
				return new EcmarkupEmitter(options, resolver, this.diagnostics)
			
			case EmitFormat.html:
				return new HtmlEmitter(options, resolver, this.diagnostics);
				
			case EmitFormat.markdown:
			default:
				return new MarkdownEmitter(options, resolver, this.diagnostics);
		}
	}

	protected readFile(file: string): string {
		try {
			let callback = this.innerReadFile;
			if (callback) {
				return callback(file);
			}
			
			return readFile(file);
		}
		catch (e) {
			// report error
			return undefined;
		}
	}
		
	private resolveFile(file: string, referer?: string) {
		let result: string;
		if (referer) {
			result = path.resolve(path.dirname(referer), file);
		} 
		else {
			result = path.resolve(file);
		}
		
		result = result.replace(/\\/g, "/");
		return result;
	}
	
	private normalizeFile(file: string) {
		return this.ignoreCase ? file.toLowerCase() : file;
	}
	
	private processRootFile(file: string) {
		let sourceFile = this.processFile(file);
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
				Dict.set(this.fileMap, this.normalizeFile(file), sourceFile);
				this.sourceFiles.push(sourceFile);
				this.processImports(sourceFile, file);
			}
		}

		return sourceFile;
	}
	
	private processImports(sourceFile: SourceFile, refererName: string) {
		for (let element of sourceFile.elements) {
			if (element.kind === SyntaxKind.Import) {
				let importNode = <Import>element;
				if (importNode.path) {
					let importPath = this.resolveFile(importNode.path.text, refererName);
					this.processFile(importPath, sourceFile, importNode.pos, importNode.end);
				}
			}
		}
	}
	
	private parseSourceFile(file: string): SourceFile {
		if (!this.parser) {
			this.parser = new Parser(this.diagnostics);
		}
		
		let sourceText = this.readFile(file);
		if (sourceText !== undefined) {		
			return this.parser.parseSourceFile(file, sourceText);
		}
		
		return undefined;
	}
}

function readFile(file: string) {
	return fs.readFileSync(file, "utf8");
}