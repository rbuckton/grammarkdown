import { readFileSync } from "fs";
import { basename } from "path";
import { DiagnosticMessages, LineMap } from "../diagnostics";
import { SyntaxKind } from "../tokens";
import { SourceFile } from "../nodes";
import { Scanner } from "../scanner";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Scanner", () => {
    defineTests();

    it("cancelable", () => {
        const sourceFile = new SourceFile("cancelable.grammar", "", []);
        const diagnostics = new DiagnosticMessages();
        diagnostics.setSourceFile(sourceFile);
        const cts = new CancellationTokenSource();
        const scanner = new Scanner(sourceFile.filename, sourceFile.text, diagnostics, cts.token);
        cts.cancel();
        assert.throws(() => scanner.scan());
    });

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest(basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name + " tokens", () => {
            const text = readFileSync(file, "utf8");
            const sourceFile = new SourceFile(file, text, []);
            const diagnostics = new DiagnosticMessages();
            diagnostics.setSourceFile(sourceFile);
            const scanner = new Scanner(file, text, diagnostics);
            compareBaseline(writeTokens(name, scanner, sourceFile.lineMap));
        });
    }
});