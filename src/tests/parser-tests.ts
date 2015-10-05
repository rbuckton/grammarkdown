import { readFileSync } from "fs";
import { basename } from "path";
import { DiagnosticMessages, LineMap } from "../lib/diagnostics";
import { SyntaxKind } from "../lib/tokens";
import { SourceFile } from "../lib/nodes";
import { Parser } from "../lib/parser";
import { getGrammarFiles } from "./resources";
import { writeNodes, writeDiagnostics, compareBaselines } from "./diff";

describe("Parser", () => {
    defineTests();

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest("[Parser]" + basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let text = readFileSync(file, "utf8");
            let diagnostics = new DiagnosticMessages();
            let parser = new Parser(diagnostics);
            let sourceFile = parser.parseSourceFile(file, text);
            writeNodes(name, sourceFile, baselines);
            writeDiagnostics(name, diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});