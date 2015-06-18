import { readdirSync, statSync } from "fs";
import { resolve, extname } from "path";
import { Grammar } from "../lib/grammar";
import { EmitFormat } from "../lib/options";
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
            let grammar = new Grammar([file], { format: EmitFormat.markdown });
            let output: string;
            grammar.emit(/*sourceFile*/ undefined, (_, _output) => output = _output);
            writeBaseline(name + ".md", output, baselines);
            writeDiagnostics(name, grammar.diagnostics, baselines);
            compareBaselines(baselines);
        });
    }
});