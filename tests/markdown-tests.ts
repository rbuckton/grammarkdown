import { assert, expect } from "chai";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, extname } from "path";
import { DiagnosticMessages, LineMap } from "../diagnostics";
import { SyntaxKind } from "../tokens";
import { SourceFile } from "../nodes";
import { compileAndEmit, EmitResult } from "../compiler";
import { MarkdownEmitter } from "../emitter/markdown";
import { writeTokens, writeDiagnostics, writeBaseline, compareBaselines } from "./diff";

describe("Markdown Emitter", () => {
    defineTests();
    
    function defineTests() {
        let resourcesPath = resolve(__dirname, "resources");
        let files = readdirSync(resourcesPath);
        for (let file of files) {
            let filePath = resolve(resourcesPath, file); 
            if (statSync(filePath).isFile() && extname(file) === ".grammar") {
                defineTest("[Markdown]" + file, filePath);
            }
        }
    }
    
    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let text = readFileSync(file, "utf8");
            let result = <EmitResult>compileAndEmit(text, file, { emitterFactory: (checker, diagnostics, writer) => new MarkdownEmitter(checker, diagnostics, writer) });
            writeBaseline(name + ".md", result.output, baselines);
            writeDiagnostics(name, result.diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});