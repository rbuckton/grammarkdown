import { basename } from "path";
import { Grammar } from "../grammar";
import { Host } from "../host";
import { EmitFormat } from "../options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Checker", () => {
    defineTests();

    it("cancelable", async () => {
        const cts = new CancellationTokenSource();
        const grammar = new Grammar(["cancelable.grammar"], {}, new class extends Host {
            async readFile(file: string) { return ""; }
            async writeFile(file: string, content: string) { }
        });
        cts.cancel();
        try {
            await grammar.check(/*sourceFile*/ undefined, cts.token);
            assert.fail("Expected grammar.check() to throw an error.");
        }
        catch (e) {
        }
    });

    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest(basename(file), file);
        }
    }

    function defineTest(name: string, file: string) {
        it(name + " diagnostics", async () => {
            const grammar = new Grammar([file]);
            await grammar.check(/*sourceFile*/ undefined);
            compareBaseline(writeDiagnostics(name, grammar.diagnostics));
        });
    }
});