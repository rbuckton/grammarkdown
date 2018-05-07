import { DiagnosticMessages } from "../diagnostics";
import { SourceFile } from "../nodes";
import { Scanner } from "../scanner";
import { CancellationTokenSource } from "prex";
import { assert } from "chai";

describe("Scanner", () => {
    it("cancelable", () => {
        const sourceFile = new SourceFile("cancelable.grammar", "", []);
        const diagnostics = new DiagnosticMessages();
        diagnostics.setSourceFile(sourceFile);
        const cts = new CancellationTokenSource();
        const scanner = new Scanner(sourceFile.filename, sourceFile.text, diagnostics, cts.token);
        cts.cancel();
        assert.throws(() => scanner.scan());
    });
});