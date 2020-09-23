/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { Grammar } from "../grammar";
import { CoreAsyncHost } from "../host";

describe("Checker", () => {
    it("cancelable", async () => {
        const cts = CancelToken.source();
        const grammar = new Grammar(["cancelable.grammar"], {}, CoreAsyncHost.from({
            async readFile(file: string) { return ""; },
            async writeFile(file: string, content: string) { }
        }));
        cts.cancel();
        try {
            await grammar.check(/*sourceFile*/ undefined, cts.token);
            fail("Expected grammar.check() to throw an error.");
        }
        catch (e) {
        }
    });
});