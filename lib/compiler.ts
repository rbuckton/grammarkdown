import { DiagnosticMessages, NullDiagnosticMessages } from "./diagnostics";
import { SourceFile } from "./nodes";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Binder, BindingTable } from "./binder";
import { Checker } from "./checker";
import { EmitterBase } from "./emitter/emitter-base";
import { MarkdownEmitter } from "./emitter/markdown";
import { EcmarkupEmitter } from "./emitter/ecmarkup";
import { HtmlEmitter } from "./emitter/html";
import { StringWriter } from "./stringwriter";

export interface CompileOptions {
	noChecks?: boolean;	
}

export interface EmitOptions {
	format?: EmitFormat;
	emitterFactory?: (checker: Checker, diagnostics: DiagnosticMessages, writer: StringWriter) => EmitterBase;
}

export interface CompileAndEmitOptions extends CompileOptions, EmitOptions {
	noEmit?: boolean;
	noEmitOnError?: boolean;
}

export enum EmitFormat {
	markdown,
	html,
	ecmarkup
}

export interface CompileResult {
	sourceFile: SourceFile;
	diagnostics: DiagnosticMessages;
	checker: Checker;
}

export interface EmitResult {
	sourceFile: SourceFile;
	diagnostics: DiagnosticMessages;
	output: string;
}

export function compileAndEmit(source: string, filename: string, { noEmit, noEmitOnError, noChecks, format = EmitFormat.markdown, emitterFactory }: CompileAndEmitOptions = { }): CompileResult | EmitResult {
	let { sourceFile, diagnostics, checker } = compile(source, filename, { noChecks });

	if (noEmit || (noEmitOnError && diagnostics.count() > 0)) {
		return { sourceFile, diagnostics, checker };
	}

	return emit({ sourceFile, diagnostics, checker }, { format, emitterFactory });	
}

export function compile(source: string, filename: string, { noChecks }: CompileAndEmitOptions = { }): CompileResult {
	let diagnostics = new DiagnosticMessages();
	
	// parse
	let parser = new Parser(diagnostics);
	let sourceFile = parser.parseSourceFile(filename, source);
	
	// bind
	let bindings = new BindingTable();
	let binder = new Binder(bindings);
	binder.bindSourceFile(sourceFile);
	
	// check
	let checker = new Checker(bindings, noChecks ? NullDiagnosticMessages.instance : diagnostics);
	checker.checkSourceFile(sourceFile);
	
	// emit
	return { sourceFile, diagnostics, checker };
}

export function emit({ sourceFile, diagnostics, checker }: CompileResult, { format = EmitFormat.markdown, emitterFactory }: CompileAndEmitOptions = { }): EmitResult {
	let writer = new StringWriter();
	let emitter: EmitterBase;
	if (typeof emitterFactory === "function") {
		emitter = emitterFactory(checker, diagnostics, writer);
	}
	else {
		switch (format) {
			case EmitFormat.html:
				emitter = new HtmlEmitter(checker, diagnostics, writer);
				break;
				
			case EmitFormat.ecmarkup:
				emitter = new EcmarkupEmitter(checker, diagnostics, writer);
				break;
				
			case EmitFormat.markdown:
			default:
				emitter = new MarkdownEmitter(checker, diagnostics, writer);
				break;
		}
	}

	emitter.emitSourceFile(sourceFile);
	
	let output = writer.toString();	
	return { sourceFile, diagnostics, output };
}