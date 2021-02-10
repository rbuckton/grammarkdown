// @ts-check
/* global process */
const fs = require("fs");
const gulp = require("gulp");
const del = require("del");
const { transform } = require("gulp-insert");
const { buildProject, cleanProject } = require("./scripts/build");
const { exec, ArgsBuilder } = require("./scripts/exec");
const yargs = require("yargs")
    .option("serve", { type: "boolean", default: false })
    .option("testNamePattern", { type: "string", alias: ["tests", "test", "T", "t"] })
    .option("testPathPattern", { type: "string", alias: ["files", "file", "F"] })
    .option("testPathIgnorePatterns", { type: "string", alias: ["ignore", "I"] })
    .option("maxWorkers", { type: "string", alias: ["w"] })
    .option("onlyChanged", { type: "boolean", alias: ["changed", "o"], default: false })
    .option("runInBand", { type: "boolean", alias: "i", default: false })
    .option("watch", { type: "boolean", default: false })
    .option("watchAll", { type: "boolean", default: false })
    .option("notify", { type: "boolean", default: false })
    .option("fix", { type: "boolean", default: false })
    .option("interactive", { type: "boolean", default: true })
    .option("docPackagePattern", { type: "string" })
    .option("force", { type: "boolean", default: false })
    .option("verbose", { type: "boolean", default: false })
    ;
const { argv } = yargs;

const cleanDist = () => del(["dist/**/*"]);
gulp.task("clean:dist", cleanDist);

const cleanBaselines = () => del(["baselines/local"]);
gulp.task("clean:baselines", cleanBaselines);

const cleanObj = () => del(["obj"]);
gulp.task("clean:obj", cleanObj);

const cleanTest = () => exec(process.execPath, [require.resolve("jest/bin/jest"), "--clearCache"], { verbose: true });
gulp.task("clean:test", cleanTest);

const clean = gulp.parallel(cleanDist, cleanBaselines, cleanObj, cleanTest);
gulp.task("clean", clean);

const generateDiagnostics = () => exec(process.execPath, ["./scripts/generateDiagnostics.js", "./src/diagnostics.json", "./src/diagnostics.generated.ts"]);
gulp.task("generate-diagnostics", generateDiagnostics);

const build = () => buildProject("./tsconfig.json");
gulp.task("build", gulp.series(generateDiagnostics, build));

const preTest = gulp.parallel(generateDiagnostics, cleanBaselines);
gulp.task("pre-test", preTest);

const watchDiagnostics = () => gulp.watch(["./src/diagnostics.json"], { persistent: false }, generateDiagnostics);

/**
 * @param {object} argv
 * @param {string} [argv.testNamePattern]
 * @param {string} [argv.testPathPattern]
 * @param {string} [argv.testPathIgnorePatterns]
 * @param {string} [argv.maxWorkers]
 * @param {boolean} [argv.onlyChanged]
 * @param {boolean} [argv.onlyFailures]
 * @param {boolean} [argv.runInBand]
 * @param {boolean} [argv.watch]
 * @param {boolean} [argv.watchAll]
 * @param {boolean} [argv.notify]
 */
const runTestsWithOptions = (argv) => {
    const args = new ArgsBuilder();
    args.addSwitch("--testNamePattern", argv.testNamePattern);
    args.addSwitch("--testPathPattern", argv.testPathPattern);
    args.addSwitch("--testPathIgnorePatterns", argv.testPathIgnorePatterns);
    args.addSwitch("--maxWorkers", argv.maxWorkers);
    args.addSwitch("--onlyChanged", argv.onlyChanged, false);
    args.addSwitch("--onlyFailures", argv.onlyFailures, false);
    args.addSwitch("--runInBand", argv.runInBand, false);
    args.addSwitch("--watch", argv.watch, false);
    args.addSwitch("--watchAll", argv.watchAll, false);
    args.addSwitch("--notify", argv.notify, false);
    return exec(process.execPath, [require.resolve("jest/bin/jest"), ...args], { verbose: true });
};

const runTests = () => runTestsWithOptions(argv);
const watchTests = () => runTestsWithOptions({ watch: true });

const test = gulp.series(preTest, runTests);
gulp.task("test", test);

const watch = gulp.series(preTest, gulp.parallel(watchDiagnostics, watchTests));
gulp.task("watch", watch);

const accept_baselines = () => gulp
    .src("baselines/local/**/*")
    .pipe(gulp.dest("baselines/reference"));
gulp.task("accept-baselines", accept_baselines);

gulp.task("default", gulp.series(build, test));

gulp.task("diff", () => diff("baselines/reference/", "baselines/local/"));

const emu = async () => {
    await exec(process.execPath, [require.resolve("./dist/cli.js"), "spec/es6.grammar", "-o", "spec/es6.grammar.html", "-f", "ecmarkup", "--emitLinks"]);
    await exec(process.execPath, [require.resolve("./dist/cli.js"), "spec/typescript.grammar", "-o", "spec/typescript.grammar.html", "-f", "ecmarkup", "--emitLinks"]);
    await exec(process.execPath, [require.resolve("./dist/cli.js"), "spec/es2020.grammar", "-o", "spec/es2020.grammar.html", "-f", "ecmarkup", "--emitLinks"]);
    try { await fs.mkdirSync("obj/resources", { recursive: true }); } catch { }
    await exec(process.execPath, [require.resolve("ecmarkup/bin/ecmarkup.js"), "spec/es6.html", "obj/resources/es6.html", "--css-out", "obj/resources/elements.css", "--js-out", "obj/resources/menu.js"]);
    await exec(process.execPath, [require.resolve("ecmarkup/bin/ecmarkup.js"), "spec/es2020.html", "obj/resources/es2020.html"]);
    await exec(process.execPath, [require.resolve("ecmarkup/bin/ecmarkup.js"), "spec/typescript.html", "obj/resources/typescript.html"]);
}

const api_extractor = () => exec(process.execPath, [require.resolve("@microsoft/api-extractor/bin/api-extractor"), "run", "--local"]);
const api_extractor_fixup = async () => {
    const data = fs.readFileSync("obj/json/grammarkdown.api.json", "utf8");
    fs.writeFileSync("obj/json/grammarkdown.api.json", data.replace(/Symbol_2/g, "Symbol"), "utf8");
};
const api_documenter = () => exec(process.execPath, [require.resolve("@microsoft/api-documenter/bin/api-documenter"), "generate", "-i", "obj/json", "-o", "obj/yaml"]);
const api_documenter_fixup = () => gulp.src("obj/yaml/**/*.yml")
    .pipe(transform(content => content.replace(/(?<=\]\(xref:[^#)]*)#(?=[^#)]*\))/g, "%23")))
    .pipe(gulp.dest("obj/yaml"));

const prepareDocs = gulp.series(
    generateDiagnostics,
    build,
    emu,
    api_extractor,
    api_extractor_fixup,
    api_documenter,
    api_documenter_fixup,
);
prepareDocs.displayName = "prepare-docs";
gulp.task("prepare-docs", prepareDocs);

const docfx = () => exec("docfx", argv.serve ? ["--serve"] : []);
gulp.task("docs", gulp.series(
    prepareDocs,
    docfx
));

function diff(remote, local) {
    var cmd = process.env.DIFF;
    if (!cmd) throw new Error("Please set the 'DIFF' environment variable.");
    return exec(cmd, [remote, local]);
}
