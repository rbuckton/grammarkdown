import { DiagnosticMessages } from "./diagnostics";
import { SourceFile, BindingTable } from "./nodes";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { Binder } from "./binder";
import { Checker } from "./checker";
import { EmitterBase } from "./emitter";
import { StringWriter } from "./stringwriter";

export interface CompilerResult {
	sourceFile: SourceFile;
	diagnostics: DiagnosticMessages;
	output: string;
}

export function compile(source: string, filename: string, Emitter?: new (checker: Checker, diagnostics: DiagnosticMessages, writer: StringWriter) => EmitterBase): CompilerResult {
	let diagnostics = new DiagnosticMessages();
	// parse
	let parser = new Parser(diagnostics);
	let sourceFile = parser.parseSourceFile(filename, source);
	
	// bind
	let bindings = new BindingTable();
	let binder = new Binder(bindings);
	binder.bindSourceFile(sourceFile);
	
	// check
	let checker = new Checker(bindings, diagnostics);
	checker.checkSourceFile(sourceFile);
	
	// emit
	let output: string;
	if (Emitter) {
		let writer = new StringWriter();
		let emitter = new Emitter(checker, diagnostics, writer);
		emitter.emitSourceFile(sourceFile);
		output = writer.toString();
	}
	
	return { sourceFile, diagnostics, output };
}