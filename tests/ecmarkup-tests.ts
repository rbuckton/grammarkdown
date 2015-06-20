import { basename } from "path";
import { Grammar } from "../lib/grammar";
import { EmitFormat } from "../lib/options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeBaseline, compareBaselines } from "./diff";

describe("ECMarkup Emitter", () => {
    defineTests();
    
    function defineTests() {
        for (let file of getGrammarFiles()) {
            defineTest("[ECMarkup]" + basename(file), file);
        }
    }
    
    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let grammar = new Grammar([file], { format: EmitFormat.ecmarkup });
            let output: string;
            grammar.emit(/*sourceFile*/ undefined, (_, _output) => output = _output);
            writeBaseline(name + ".emu.html", output, baselines);
            writeDiagnostics(name, grammar.diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});