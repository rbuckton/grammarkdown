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
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, unlinkSync } from "fs";
import { EOL } from "os";
import { resolve, basename } from "path";
import { Scanner } from "../lib/scanner";
import { SyntaxKind, tokenToString, CharacterCodes } from "../lib/tokens";
import { DiagnosticMessages, LineMap } from "../lib/diagnostics";
import {
    SourceFile,
    Node,
    Identifier,
    Nonterminal,
    Argument,
    Prose,
    ProseFragmentLiteral,
    Terminal,
    UnicodeCharacterLiteral,
    forEachChild
} from "../lib/nodes";

export function writeTokens(test: string, scanner: Scanner, lineMap: LineMap, baselines?: string[]) {
    let text: string = `/// ${test}:` + EOL;
    let token: SyntaxKind;
    do {
        token = scanner.scan();
        let message = `SyntaxKind[${formatKind(token)}](${lineMap.formatPosition(scanner.getTokenPos()) }): `;
        switch (token) {
            case SyntaxKind.ProseFull:
            case SyntaxKind.ProseHead:
            case SyntaxKind.ProseMiddle:
            case SyntaxKind.ProseTail:
                message += scanner.getTokenValue();
                break;
            case SyntaxKind.Identifier:
                message += `${scanner.getTokenValue()}`;
                break;
            case SyntaxKind.Terminal:
                message += `\`${scanner.getTokenValue()}\``;
                break;
            case SyntaxKind.UnicodeCharacterLiteral:
                message += scanner.getTokenText();
                break;
            default:
                message += `${tokenToString(token)}`;
        }

        text += message + EOL;
    }
    while (token !== SyntaxKind.EndOfFileToken)
    return writeBaseline(test + ".tokens", text, baselines);
}

export function writeDiagnostics(test: string, diagnostics: DiagnosticMessages, baselines?: string[]) {
    let text: string = undefined;
    diagnostics.forEach(message => {
        if (!text) {
            text = `/// ${test}:` + EOL;
        }
        text += message + EOL;
    });

    if (!!text) {
        // Remove absolute pathnames from text
        const root = resolve(".").replace(/\\/g,"/");
        const re = new RegExp(root.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"), "gi");
        text = text.replace(re, ".");
    }
    return writeBaseline(test + ".diagnostics", text, baselines);
}

export function writeNodes(test: string, sourceFile: SourceFile, baselines?: string[]) {
    let text = `/// ${test}:` + EOL;
    let indents = ["", "  "];
    let indentDepth = 0;

    printNode(sourceFile);
    return writeBaseline(test + ".nodes", text, baselines);

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

export function writeOutput(test: string, extname: string, text: string, baselines?: string[]) {
    return writeBaseline(test + extname, text, baselines);
}

export function writeBaseline(file: string, text: string, baselines?: string[]) {
    if (baselines) {
        baselines.push(file);
    }

    let { localFile } = resolveBaseline(file);
    if (text === undefined) {
        if (existsSync(localFile)) {
            unlinkSync(localFile);
        }
    }
    else {
        writeFileSync(localFile, text, { encoding: "utf8" });
    }

    return file;
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

export function compareBaseline(file: string) {
    let { localFile, referenceFile } = resolveBaseline(file);
    let localText = existsSync(localFile) ? readFileSync(localFile, "utf8") : undefined;
    let referenceText = existsSync(referenceFile) ? readFileSync(referenceFile, "utf8") : undefined;
    if (localText !== referenceText) {
        throw new Error(`The baseline file '${file}' has changed.`);
    }
}

function resolveBaseline(file: string) {
    let baselinePath = resolve(__dirname, "../../baselines");
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

function formatKind(kind: SyntaxKind) {
    for (var p in SyntaxKind) {
        if (SyntaxKind[<string>p] === kind) {
            return p;
        }
    }
    return SyntaxKind[kind];
}

function formatNode(node: Node, sourceFile: SourceFile) {
    var text = `(${sourceFile.lineMap.formatPosition(node.pos) })`;
    text += `SyntaxKind[${formatKind(node.kind)}]`;
    switch (node.kind) {
        case SyntaxKind.Identifier:
        case SyntaxKind.Terminal:
        case SyntaxKind.ProseFull:
        case SyntaxKind.ProseHead:
        case SyntaxKind.ProseMiddle:
        case SyntaxKind.ProseTail:
            text += `(text = "${(<ProseFragmentLiteral | Identifier | Terminal>node).text}")`;
            break;
        case SyntaxKind.UnicodeCharacterLiteral:
            text += `(text = ${sourceFile.text.slice(node.pos, node.end)})`;
            break;
        case SyntaxKind.SourceFile:
            text += `(filename = "${basename((<SourceFile>node).filename)}")`;
            break;
    }
    switch (node.kind) {
        case SyntaxKind.Terminal:
        case SyntaxKind.Nonterminal:
        case SyntaxKind.UnicodeCharacterLiteral:
            if ((<Terminal | Nonterminal | UnicodeCharacterLiteral>node).questionToken) {
                text += "?";
            }
            break;
        case SyntaxKind.Argument:
            if ((<Argument>node).operatorToken) {
                switch ((<Argument>node).operatorToken.kind) {
                    case SyntaxKind.QuestionToken:
                        text += "?";
                        break;
                    case SyntaxKind.TildeToken:
                        text += "~";
                        break;
                    case SyntaxKind.PlusToken:
                        text += "+";
                        break;
                }
            }
            break;
    }
    return text;
}