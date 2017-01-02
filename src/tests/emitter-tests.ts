import { basename } from "path";
import { Grammar } from "../lib/grammar";
import { Host } from "../lib/host";
import { EmitFormat } from "../lib/options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Emitter", () => {
    defineTests();

    it("cancelable", () => {
        const cts = new CancellationTokenSource();
        const grammar = new Grammar(["cancelable.grammar"], {}, Host.getHost({
            readFile(file) { return ""; },
            writeFile(file, content) { }
        }), /*oldGrammar*/ undefined, cts.token);
        grammar.check(/*sourceFile*/ undefined);
        cts.cancel();
        assert.throws(() => grammar.emit(/*sourceFile*/ undefined));
    });

    function defineTests() {
        for (const file of getGrammarFiles()) {
            defineTest(basename(file), file, ".md", EmitFormat.markdown);
            defineTest(basename(file), file, ".emu.html", EmitFormat.ecmarkup);
            defineTest(basename(file), file, ".html", EmitFormat.html, true);
        }
    }

    function defineTest(name: string, file: string, extname: string, format: EmitFormat, emitLinks?: boolean) {
        it(`${name} ${EmitFormat[format]} output`, () => {
            let output: string;
            const grammar = new Grammar([file], { format, emitLinks });
            grammar.emit(/*sourceFile*/ undefined, (_, _output) => output = _output);
            compareBaseline(writeOutput(name, extname, output));
        });
    }
});