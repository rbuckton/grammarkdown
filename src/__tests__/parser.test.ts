/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { CancelToken } from "@esfx/async-canceltoken";
import { Parser } from "../parser";

describe("Parser", () => {
    it("cancelable", () => {
        const cts = CancelToken.source();
        const parser = new Parser();
        cts.cancel();
        expect(() => parser.parseSourceFile("cancelable.grammar", "", cts.token)).toThrow();
    });
});