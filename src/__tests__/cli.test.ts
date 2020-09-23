/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import * as path from "path";
import { spawnSync } from "child_process";

describe("cli", () => {
  const bin = path.resolve(__dirname, "../../bin/grammarkdown");
  it("exits cleanly when given good input", () => {
    const spec = path.resolve(__dirname, "./resources/specs/es6.grammar");
    const { status } = spawnSync(process.execPath, [bin, spec, "--noEmit"], { stdio: "ignore", encoding: "utf8" });
    expect(status).toEqual(0);
  });

  it("exits with an error when given bad input", () => {
    const spec = path.resolve(__dirname, "./resources/specs/test.grammar");
    const { status } = spawnSync(process.execPath, [bin, spec, "--noEmit"], { stdio: "ignore", encoding: "utf8" });
    expect(status).not.toEqual(0);
  });

  it("prints help given --help", () => {
    const { stdout: help } = spawnSync(process.execPath, [bin, "--help"], { encoding: "utf8" });
    expect(help).toMatch(/Prints this message/);
  });

  it("prints version given --version", () => {
    const { stdout: version } = spawnSync(process.execPath, [bin, "--version"], { encoding: "utf8" });
    const packageVersion = require("../../package.json").version;
    expect(version.trim()).toEqual(packageVersion.trim());
  });

  it("prints diagnostics given --diagnostics", () => {
    const spec = path.resolve(__dirname, "./resources/specs/es6.grammar");
    const { stderr } = spawnSync(process.execPath, [bin, spec, "--noEmit", "--diagnostics"], { stdio: "pipe", encoding: "utf8" });
    expect(stderr).toMatch(/^ioRead:\s+\d+ms$/m);
    expect(stderr).toMatch(/^ioWrite:\s+\d+ms$/m);
    expect(stderr).toMatch(/^parse:\s+\d+ms$/m);
    expect(stderr).toMatch(/^bind:\s+\d+ms$/m);
    expect(stderr).toMatch(/^check:\s+\d+ms$/m);
    expect(stderr).toMatch(/^emit:\s+\d+ms$/m);
  });
});
