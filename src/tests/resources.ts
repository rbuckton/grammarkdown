import { readdirSync, statSync, existsSync } from "fs";
import { resolve, extname } from "path";

let grammarFiles: string[];

export function getGrammarFiles() {
    if (grammarFiles) {
        return grammarFiles;
    }

    grammarFiles = [];
    collectFilesInPath("../../spec", grammarFiles);
    collectFilesInPath("../../src/tests/resources", grammarFiles);
    return grammarFiles;
}

function collectFilesInPath(path: string, output: string[]) {
    path = resolve(__dirname, path);
    if (existsSync(path)) {
        for (let file of readdirSync(path)) {
            if (extname(file) === ".grammar") {
                let filePath = resolve(path, file);
                if (statSync(filePath).isFile()) {
                    output.push(filePath);
                }
            }
        }
    }
}