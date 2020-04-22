/*!
 *  Copyright 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { assert } from "chai";
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
        assert.throws(() => scanner.scan());
    });
});