import { basename } from "path";
import { Grammar } from "../lib/grammar";
import { Host } from "../lib/host";
import { EmitFormat } from "../lib/options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Checker", () => {
    defineTests();

    it("cancelable", () => {
        const cts = new CancellationTokenSource();
        const grammar = new Grammar(["cancelable.grammar"], {}, Host.getHost({
            readFile(file) { return ""; }
        }), /*oldGrammar*/ undefined, cts.token);
        cts.cancel();
        assert.throws(() => grammar.check(/*sourceFile*/ undefined));
    });

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest(basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name + " diagnostics", () => {
            const grammar = new Grammar([file]);
            grammar.check(/*sourceFile*/ undefined);
            compareBaseline(writeDiagnostics(name, grammar.diagnostics));
        });
    }
});