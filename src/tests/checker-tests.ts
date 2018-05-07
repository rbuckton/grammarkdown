import { Grammar } from "../grammar";
import { Host } from "../host";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Checker", () => {
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
});