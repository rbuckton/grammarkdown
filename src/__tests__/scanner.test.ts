/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { DiagnosticMessages } from "../diagnostics";
import { SourceFile } from "../nodes";
import { Scanner } from "../scanner";

describe("Scanner", () => {
    it("cancelable", () => {
        const sourceFile = new SourceFile("cancelable.grammar", "", []);
        const diagnostics = new DiagnosticMessages();
        diagnostics.setSourceFile(sourceFile);
        const cts = CancelToken.source();
        const scanner = new Scanner(sourceFile.filename, sourceFile.text, diagnostics, cts.token);
        cts.cancel();
        expect(() => scanner.scan()).toThrow();
    });
});