import { readFileSync } from "fs";
import { basename } from "path";
import { DiagnosticMessages, LineMap } from "../lib/diagnostics";
import { SyntaxKind } from "../lib/tokens";
import { SourceFile } from "../lib/nodes";
import { Scanner } from "../lib/scanner";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, compareBaselines } from "./diff";

describe("Scanner", () => {
    defineTests();

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest("[Scanner]" + basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let text = readFileSync(file, "utf8");
            let sourceFile = new SourceFile(file, text);
            let diagnostics = new DiagnosticMessages();
            diagnostics.setSourceFile(sourceFile);
            let scanner = new Scanner(file, text, diagnostics);
            writeTokens(name, scanner, sourceFile.lineMap, baselines);
            writeDiagnostics(name, diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});