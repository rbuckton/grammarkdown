import { Parser } from "../parser";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Parser", () => {
    it("cancelable", () => {
        const cts = new CancellationTokenSource();
        const parser = new Parser();
        cts.cancel();
        assert.throws(() => parser.parseSourceFile("cancelable.grammar", "", cts.token));
    });
});