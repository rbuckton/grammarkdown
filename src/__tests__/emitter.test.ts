/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { Grammar } from "../grammar";
import { CoreAsyncHost } from "../host";

describe("Emitter", () => {
    it("cancelable", async () => {
        const cts = CancelToken.source();
        const grammar = new Grammar(["cancelable.grammar"], {}, CoreAsyncHost.from({
            resolveFile: file => file,
            async readFile(file: string) { return ""; },
            async writeFile(file: string, content: string) { }
        }));
        await grammar.check(/*sourceFile*/ undefined, cts.token);
        cts.cancel();
        try {
            await grammar.emit(/*sourceFile*/ undefined, /*writeFile*/ undefined, cts.token);
            fail("Expected grammar.emit() to throw an error.");
        }
        catch (e) {
        }
    });
});