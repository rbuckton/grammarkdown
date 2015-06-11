import { assert, expect } from "chai";
import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, extname } from "path";
import { DiagnosticMessages, LineMap } from "../lib/diagnostics";
import { SyntaxKind } from "../lib/tokens";
import { SourceFile } from "../lib/nodes";
import { Scanner } from "../lib/scanner";
import { writeTokens, writeDiagnostics, compareBaselines } from "./diff";

describe("Scanner", () => {
    defineTests();
    
    function defineTests() {
        let resourcesPath = resolve(__dirname, "resources");
        let files = readdirSync(resourcesPath);
        for (let file of files) {
            let filePath = resolve(resourcesPath, file); 
            if (statSync(filePath).isFile() && extname(file) === ".grammar") {
                defineTest("[Scanner]" + file, filePath);
            }
        }
    }
    
    function defineTest(name: string, file: string) {
        it(name, () => {
            let baselines: string[] = [];
            let text = readFileSync(file, "utf8"); 
            let sourceFile = new SourceFile(file, text);
            let diagnostics = new DiagnosticMessages();
            diagnostics.setSourceFile(sourceFile);
            let scanner = new Scanner(file, text, diagnostics);
            writeTokens(name, scanner, sourceFile.lineMap, baselines);
            writeDiagnostics(name, diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});