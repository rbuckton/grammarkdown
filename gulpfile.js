/* global process */
const path = require("path");
const fs = require("fs");
const gulp = require("gulp");
const chalk = require("chalk");
const log = require("fancy-log");
const sourcemaps = require("gulp-sourcemaps");
const tsb = require("gulp-tsb");
const mocha = require("gulp-mocha");
const { transform } = require("gulp-insert");
const del = require("del");
const spawn = require("child_process").spawn;
const { argv } = require("yargs")
    .option("serve", { type: Boolean, default: false });

let errorCount = 0;
const src = {
    compile: tsb.create("src/tsconfig.json", {}, false, message => {
        log(message);
        errorCount++;
    }),
    src: () => gulp.src(["src/**/*.ts"])
};

const clean_dist = () => del(["dist/**/*"]);
gulp.task("clean:dist", clean_dist);

const clean_baselines = () => del(["baselines/local"]);
gulp.task("clean:baselines", clean_baselines);

const clean_obj = () => del(["obj"]);
gulp.task("clean:obj", clean_obj);

const clean = gulp.parallel(clean_dist, clean_baselines, clean_obj);
gulp.task("clean", clean);

const generate_diagnostics = () => exec(process.execPath, ["./scripts/generateDiagnostics.js", "./src/diagnostics.json", "./src/diagnostics.generated.ts"]);
gulp.task("generate-diagnostics", generate_diagnostics);

const build = () => src.src()
    .pipe(sourcemaps.init())
    .pipe(src.compile())
    .pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" }))
    .pipe(gulp.dest("dist"))
    .on("end", () => { if (errorCount) throw new Error(`Build failed: ${errorCount} error(s)`); });
gulp.task("build", gulp.series(generate_diagnostics, build));

const set_package_version = async () => {
    if (!process.env.npm_package_version) {
        process.env.npm_package_version = require("./package.json").version;
    }
};

const pre_test = gulp.parallel(set_package_version, gulp.series(generate_diagnostics, build), clean_baselines);
gulp.task("pre-test", pre_test);

const run_tests = () => gulp
    .src(["dist/tests/index.js"], { read: false })
    .pipe(mocha({}));
    // .pipe(mocha({ reporter: "dot" })));
const test = gulp.series(pre_test, run_tests);
gulp.task("test", test);

const accept_baselines = () => gulp
    .src("baselines/local/**/*")
    .pipe(gulp.dest("baselines/reference"));
gulp.task("accept-baselines", accept_baselines);

const watch = () => gulp.watch(["src/**/*", "spec/*.grammar"], test);
gulp.task("watch", watch);

gulp.task("default", test);

gulp.task("diff", () => diff("baselines/reference/", "baselines/local/"));

const emu = async () => {
    await exec(process.execPath, [require.resolve("./dist/cli.js"), "spec/es6.grammar", "-o", "spec/es6.grammar.html", "-f", "ecmarkup", "--emitLinks"]);
    await exec(process.execPath, [require.resolve("./dist/cli.js"), "spec/typescript.grammar", "-o", "spec/typescript.grammar.html", "-f", "ecmarkup", "--emitLinks"]);
    try { await fs.mkdirSync("obj/resources", { recursive: true }); } catch { }
    await exec(process.execPath, [require.resolve("ecmarkup/bin/ecmarkup.js"), "spec/es6.html", "obj/resources/es6.html", "--css-out", "obj/resources/elements.css", "--js-out", "obj/resources/menu.js"]);
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
const docfx = () => exec("docfx", argv.serve ? ["--serve"] : []);
gulp.task("docs", gulp.series(
    generate_diagnostics,
    build,
    emu,
    api_extractor,
    api_extractor_fixup,
    api_documenter,
    api_documenter_fixup,
    docfx
));

function diff(remote, local) {
    var cmd = process.env.DIFF;
    if (!cmd) throw new Error("Please set the 'DIFF' environment variable.");
    return exec(cmd, [remote, local]);
}

function exec(cmd, args) {
    return new Promise((resolve, reject) => {
        log((cmd ? cmd + " " : "") + args.join(" "));
        spawn(cmd || process.argv[0], args, { stdio: "inherit" })
            .on("error", function (e) { reject(e); })
            .on("close", function (code) { code ? reject(new Error("Process exited with code: " + code)) : resolve(); });
    });
}