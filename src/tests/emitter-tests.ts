import { basename } from "path";
import { Grammar } from "../grammar";
import { Host } from "../host";
import { EmitFormat } from "../options";
import { getGrammarFiles } from "./resources";
import { writeTokens, writeDiagnostics, writeOutput, compareBaseline } from "./diff";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Emitter", () => {
    defineTests();

    it("cancelable", async () => {
        const cts = new CancellationTokenSource();
        const grammar = new Grammar(["cancelable.grammar"], {}, new class extends Host {
            async readFile(file: string) { return ""; }
            async writeFile(file: string, content: string) { }
        });
        await grammar.check(/*sourceFile*/ undefined, cts.token);
        cts.cancel();
        try {
            await grammar.emit(/*sourceFile*/ undefined, /*writeFile*/ undefined, cts.token);
            assert.fail("Expected grammar.emit() to throw an error.");
        }
        catch (e) {
        }
    });

    function defineTests() {
        for (const file of getGrammarFiles()) {
            defineTest(basename(file), file, ".md", EmitFormat.markdown);
            defineTest(basename(file), file, ".emu.html", EmitFormat.ecmarkup);
            defineTest(basename(file), file, ".html", EmitFormat.html, true);
        }
    }

    function defineTest(name: string, file: string, extname: string, format: EmitFormat, emitLinks?: boolean) {
        it(`${name} ${EmitFormat[format]} output`, async () => {
            let output: string | undefined;
            const grammar = new Grammar([file], { format, emitLinks });
            await grammar.emit(/*sourceFile*/ undefined, async (_, _output) => { output = _output; });
            compareBaseline(writeOutput(name, extname, output));
        });
    }
});