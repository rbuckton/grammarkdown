import { Grammar } from "../grammar";
import { Host } from "../host";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Emitter", () => {
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
});