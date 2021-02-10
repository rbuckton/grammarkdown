/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as performance from "./performance";
import { EOL } from "os";
import { Package } from "./read-package";
import { CompilerOptions, EmitFormat, getDefaultOptions, KnownOptions, ParsedArguments, parse, usage, NewLineKind } from "./options";
import { Grammar } from "./grammar";
import { mapFromObject } from "./core";

try {
    require("source-map-support").install();
}
catch (e) { }

const knownOptions: KnownOptions = {
    "help": { shortName: "h", type: "boolean", description: "Prints this message." },
    "version": { shortName: "v", type: "boolean", description: "Prints the version." },
    "out": { shortName: "o", param: "FILE", type: "file", description: "Specify the output file." },
    "format": { shortName: "f", param: "FORMAT", type: mapFromObject({
        "markdown": EmitFormat.markdown,
        "ecmarkup": EmitFormat.ecmarkup,
        "html": EmitFormat.html
    }), description: "The output format." },
    "newLine": { param: "NEWLINE", type: mapFromObject({
        "lf": NewLineKind.LineFeed,
        "crlf": NewLineKind.CarriageReturnLineFeed
    }), description: "The line terminator to use during emit." },
    "noEmit": { type: "boolean", description: "Does not emit output." },
    "noEmitOnError": { type: "boolean", description: "Does not emit output if there are errors." },
    "noChecks": { type: "boolean", description: "Does not perform static checking of the grammar." },
    "noStrictParametricProductions": { type: "boolean", description: "Does not perform strict checking of parametric productions and nonterminals." },
    "noUnusedParameters": { type: "boolean", description: "Disallow unused parameters in productions." },
    "emitLinks": { type: "boolean", hidden: true },
    "usage": { aliasFor: ["--help"], hidden: true },
    "md": { aliasFor: ["--format", "markdown"], hidden: true },
    "diagnostics": { type: "boolean", description: "Prints diagnostics information." }
};

interface ParsedCommandLine extends ParsedArguments, CompilerOptions {
    help: boolean;
    version: boolean;
}

async function main(): Promise<void> {
    const opts = parse<ParsedCommandLine>(knownOptions);
    if (!opts || opts.help) {
        printUsage();
    }
    else if (opts.version) {
        printVersion();
    }
    else {
        await performCompilation(opts);
    }
}

function printUsage(): void {
    const node_package = <Package>require("../package.json");
    usage(knownOptions, 36, (writer) => {
        writer.writeln(`Version ${node_package.version}`);
        writer.writeOption("Syntax:", "grammarkdown [options] [...files]");
        writer.writeln();
        writer.writeOption("Examples:", "grammarkdown es6.grammar");
        writer.writeOption("", "grammarkdown --out es6.md --format markdown es6.grammar");
        writer.writeln();
        writer.writeln("Options:");
    });
}

function printVersion(): void {
    const node_package = <Package>require("../package.json");
    console.log(node_package.version);
}

async function performCompilation(options: ParsedCommandLine): Promise<void> {
    const compilerOptions = getDefaultOptions();
    if (options.out) compilerOptions.out = options.out;
    if (options.noChecks) compilerOptions.noChecks = true;
    if (options.noEmit) compilerOptions.noEmit = true;
    if (options.noEmitOnError) compilerOptions.noEmitOnError = true;
    if (options.noStrictParametricProductions) compilerOptions.noStrictParametricProductions = true;
    if (options.emitLinks) compilerOptions.emitLinks = true;
    if (options.diagnostics) compilerOptions.diagnostics = true;
    compilerOptions.format = options.format || EmitFormat.markdown;
    compilerOptions.newLine = options.newLine;

    performance.mark("beforeCompile");

    const inputFiles = options.rest;
    const grammar = new Grammar(inputFiles, compilerOptions);
    await grammar.bind();
    await grammar.check();

    if (!compilerOptions.noEmit) {
        if (!compilerOptions.noEmitOnError || grammar.diagnostics.size <= 0) {
            await grammar.emit();
        }
    }

    performance.mark("afterCompile");
    performance.measure("compile", "beforeCompile", "afterCompile");

    grammar.diagnostics.forEach(message => console.log(message));

    if (compilerOptions.diagnostics) {
        process.stderr.write(`ioRead:  ${Math.round(performance.getDuration("ioRead"))}ms${EOL}`);
        process.stderr.write(`ioWrite: ${Math.round(performance.getDuration("ioWrite"))}ms${EOL}`);
        process.stderr.write(`parse:   ${Math.round(performance.getDuration("parse"))}ms${EOL}`);
        process.stderr.write(`bind:    ${Math.round(performance.getDuration("bind"))}ms${EOL}`);
        process.stderr.write(`check:   ${Math.round(performance.getDuration("check"))}ms${EOL}`);
        process.stderr.write(`emit:    ${Math.round(performance.getDuration("emit"))}ms${EOL}`);
    }

    if (grammar.diagnostics.size > 0) {
        process.exit(-1);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(-1);
});