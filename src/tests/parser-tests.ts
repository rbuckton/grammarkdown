import { readFileSync } from "fs";
import { basename } from "path";
import { DiagnosticMessages, LineMap } from "../diagnostics";
import { SyntaxKind } from "../tokens";
import { SourceFile } from "../nodes";
import { Parser } from "../parser";
import { getGrammarFiles } from "./resources";
import { writeNodes, writeDiagnostics, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Parser", () => {
    defineTests();

    it("cancelable", () => {
        const cts = new CancellationTokenSource();
        const parser = new Parser();
        cts.cancel();
        assert.throws(() => parser.parseSourceFile("cancelable.grammar", "", cts.token));
    });

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest(basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name + " parse tree", () => {
            const text = readFileSync(file, "utf8");
            const parser = new Parser();
            const sourceFile = parser.parseSourceFile(file, text);
            compareBaseline(writeNodes(name, sourceFile));
        });
    }
});