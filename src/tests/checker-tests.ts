import { basename } from "path";
import { Grammar } from "../lib/grammar";
import { EmitFormat } from "../lib/options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";

describe("Checker", () => {
    defineTests();

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