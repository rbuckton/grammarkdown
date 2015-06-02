import { assert, expect } from "chai";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, extname } from "path";
import { DiagnosticMessages, LineMap } from "../diagnostics";
import { SyntaxKind } from "../core";
import { SourceFile } from "../nodes";
import { Parser } from "../parser";
import { writeNodes, writeDiagnostics, compareBaselines } from "./diff";

describe("Parser", () => {
    defineTests();
    
    function defineTests() {
        let resourcesPath = resolve(__dirname, "resources");
        let files = readdirSync(resourcesPath);
        for (let file of files) {
            let filePath = resolve(resourcesPath, file); 
            if (statSync(filePath).isFile() && extname(file) === ".grammar") {
                defineTest("[Parser]" + file, filePath);
            }
        }
    }
    
    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let text = readFileSync(file, "utf8"); 
            let diagnostics = new DiagnosticMessages();
            let parser = new Parser(diagnostics);
            let sourceFile = parser.parseSourceFile(file, text); 
            writeNodes(name, sourceFile, baselines);
            writeDiagnostics(name, diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});