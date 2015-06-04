/*!
 *  Copyright 2015 Ron Buckton (rbuckton@chronicles.org)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { assert } from "chai";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from "fs";
import { EOL } from "os";
import { resolve } from "path";
import { SyntaxKind } from "../core";
import { Scanner } from "../scanner";
import { tokenToString } from "../tokens";
import { DiagnosticMessages, LineMap, formatNode } from "../diagnostics";
import { SourceFile, Node, forEachChild } from "../nodes";

export function writeTokens(test: string, scanner: Scanner, lineMap: LineMap, baselines: string[]) {
    let text: string = `/// ${test}:` + EOL;
    let token: SyntaxKind; 
    do {
        token = scanner.scan();
        let message = `SyntaxKind[${SyntaxKind[token]}](${lineMap.formatPosition(scanner.getPos()) }): `;
        switch (token) {
            case SyntaxKind.Prose:
                message += `> ${scanner.getTokenValue()}`;
                break;
            case SyntaxKind.Identifier:
                message += `${scanner.getTokenValue()}`;
                break;
            case SyntaxKind.Terminal:
                message += `\`${scanner.getTokenValue()}\``;
                break;
            case SyntaxKind.UnicodeCharacter:
                message += `<${scanner.getTokenValue()}>`;
                break;
            default:
                message += `${tokenToString(token)}`;
        }
        
        text += message + EOL;
    }
    while (token !== SyntaxKind.EndOfFileToken)
    writeBaseline(test + ".tokens", text);
    baselines.push(test + ".tokens");
}

export function writeDiagnostics(test: string, diagnostics: DiagnosticMessages, baselines: string[]) {
    let text: string = undefined;
    diagnostics.forEach(message => {
        if (!text) {
            text = `/// ${test}:` + EOL;
        }
        text += message + EOL;
    });
    writeBaseline(test + ".diagnostics", text);
    baselines.push(test + ".diagnostics");
}

export function writeNodes(test: string, sourceFile: SourceFile, baselines: string[]) {
    let text = `/// ${test}:` + EOL;
    let indents = ["", "  "];
    let indentDepth = 0;

    printNode(sourceFile);
    writeBaseline(test + ".nodes", text);
    baselines.push(test + ".nodes");

    function getIndent(depth: number) {
        if (depth >= indents.length) {
            indents[depth] = getIndent(depth - 1) + indents[1];
        }
        return indents[depth];
    }

    function printNode(node: Node) {
        text += getIndent(indentDepth) + formatNode(node, sourceFile) + EOL;
        indentDepth++;
        forEachChild(node, printNode);
        indentDepth--;
    }
}

export function writeBaseline(file: string, text: string) {
    let { localFile } = resolveBaseline(file);
    if (text === undefined) {
        if (existsSync(localFile)) {
            unlinkSync(localFile);
        }
    }
    else {
        writeFileSync(localFile, text, { encoding: "utf8" });
    }
}

export function compareBaselines(baselines: string[]) {
    for (let file of baselines) {
        let { localFile, referenceFile } = resolveBaseline(file);
        let localText = existsSync(localFile) ? readFileSync(localFile, "utf8") : undefined;
        let referenceText = existsSync(referenceFile) ? readFileSync(referenceFile, "utf8") : undefined;
        if (localText !== referenceText) {
            throw new Error(`The baseline file '${file}' has changed.`);
        }
    }
}

function resolveBaseline(file: string) {
    let baselinePath = resolve(__dirname, "baselines");
    let localPath = resolve(baselinePath, "local");
    let localFile = resolve(localPath, file);
    let referencePath = resolve(baselinePath, "reference");
    let referenceFile = resolve(referencePath, file);
    ensureDirectory(baselinePath);
    ensureDirectory(localPath);
    ensureDirectory(referencePath);
    return { localFile, referenceFile };
}

function ensureDirectory(path: string) {
    if (!existsSync(path)) {
        mkdirSync(path);
    }
}