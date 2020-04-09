import { assert } from "chai";
import { execSync } from "child_process";

describe("cli", () => {
  it("exits cleanly when given good input", () => {
    execSync("node bin/grammarkdown src/tests/resources/specs/es6.grammar --noEmit", { stdio: "ignore", encoding: "utf8" });
  });

  it("exits with an error when given bad input", () => {
    assert.throws(() => {
      execSync("node bin/grammarkdown src/tests/resources/specs/test.grammar --noEmit", { stdio: "ignore", encoding: "utf8" });
    });
  });

  it("prints help given --help", () => {
    let help = execSync("node bin/grammarkdown --help", { encoding: "utf8" });
    assert(/Prints this message/.test(help));
  });

  it("prints version given --version", () => {
    let version = execSync("node bin/grammarkdown --version", { encoding: "utf8" });
    assert.strictEqual(version.trim(), process.env.npm_package_version!.trim());
  });
});
