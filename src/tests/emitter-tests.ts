import { basename } from "path";
import { Grammar } from "../lib/grammar";
import { EmitFormat } from "../lib/options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";

describe("Emitter", () => {
    defineTests();

    function defineTests() {
        for (const file of getGrammarFiles()) {
            defineTest(basename(file), file, ".md", EmitFormat.markdown);
            defineTest(basename(file), file, ".emu.html", EmitFormat.ecmarkup);
        }
    }

    function defineTest(name: string, file: string, extname: string, format: EmitFormat) {
        it(`${name} ${EmitFormat[format]} output`, () => {
            let output: string;
            const grammar = new Grammar([file], { format });
            grammar.emit(/*sourceFile*/ undefined, (_, _output) => output = _output);
            compareBaseline(writeOutput(name, extname, output));
        });
    }
});