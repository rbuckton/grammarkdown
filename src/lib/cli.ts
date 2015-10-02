/*!
 *  Copyright 2015 Ron Buckton (rbuckton@chronicles.org)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import * as path from "path";
import { readFileSync, writeFileSync } from "fs";
import { readPackageSync } from "./read-package";
import { Dict } from "./core";
import { CompilerOptions, EmitFormat, getDefaultOptions, KnownOptions, ParsedArguments, parse, usage } from "./options";
import { Grammar } from "./grammar";

try {
    require("source-map-support").install();
}
catch (e) { }

const knownOptions: KnownOptions = {
    "help": { shortName: "h", type: "boolean", description: "Prints this message." },
    "version": { shortName: "v", type: "boolean", description: "Prints the version." },
    "out": { shortName: "o", param: "FILE", type: "file", description: "Specify the output file." },
    "format": { shortName: "f", param: "FORMAT", type: { "markdown": EmitFormat.markdown, "ecmarkup": EmitFormat.ecmarkup, "html": EmitFormat.html }, description: "The output format." },
    "noEmit": { type: "boolean", description: "Does not emit output." },
    "noEmitOnError": { type: "boolean", description: "Does not emit output if there are errors." },
    "noChecks": { type: "boolean", description: "Does not perform static checking of the grammar." },
    "emitLinks": { type: "boolean", hidden: true },
    "usage": { aliasFor: ["--help"], hidden: true },
    "md": { aliasFor: ["--format", "markdown"], hidden: true },
};

interface ParsedCommandLine extends ParsedArguments, CompilerOptions {
    help: boolean;
    version: boolean;
}

function main(): void {
    
    let opts = parse<ParsedCommandLine>(knownOptions);
    if (opts.help) {
        printUsage();
    }
    else if (opts.version) {
        printVersion();
    }
    else {
        performCompilation(opts);
    }
}

function printUsage(): void {
    let node_package = readPackageSync(path.resolve(__dirname, "../package.json"));
    usage(knownOptions, 25, (writer) => {
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
    let node_package = readPackageSync(path.resolve(__dirname, "../package.json"));
    console.log(node_package.version);
}

function performCompilation(options: ParsedCommandLine): void {
    let compilerOptions = getDefaultOptions();
    if (options.out) compilerOptions.out = options.out;
    if (options.noChecks) compilerOptions.noChecks = true;
    if (options.noEmit) compilerOptions.noEmit = true;
    if (options.noEmitOnError) compilerOptions.noEmitOnError = true;
    if (options.emitLinks) compilerOptions.emitLinks = true;
    compilerOptions.format = options.format || EmitFormat.markdown;
    
    let inputFiles = options.rest;
    let grammar = new Grammar(inputFiles, compilerOptions);
    grammar.bind();
    grammar.check();
    
    if (!compilerOptions.noEmit) {
        if (!compilerOptions.noEmitOnError || grammar.diagnostics.count() <= 0) {
            grammar.emit();
        }
    }
    
    if (grammar.diagnostics.count() > 0) {
        grammar.diagnostics.forEach(message => console.log(message));
        process.exit(-1);
    }
}

main();