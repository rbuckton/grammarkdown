// @ts-check
const fs = require("fs");
const path = require("path");
const jsonc_parser = require("jsonc-parser");
const ajv = require("ajv");
const chalk = require("chalk");

function binarySearch(array, value) {
    if (array.length === 0 || value < array[0]) {
        return -1;
    }
    if (value > array[array.length - 1]) {
        return ~array.length;
    }
    let low = 0;
    let high = array.length - 1;
    while (low <= high) {
        const middle = low + ((high - low) >> 1);
        const mid = array[middle];
        const cmp = mid - value;
        if (cmp > 0) {
            high = middle - 1;
        } else if (cmp < 0) {
            low = middle + 1;
        } else {
            return middle;
        }
    }
    return ~low;
}

class LineMap {
    constructor(text) {
        this.text = text;
    }

    get lineCount() {
        this.computeLineStarts();
        return this.lineStarts.length;
    }

    formatOffset(pos) {
        this.computeLineStarts();
        var lineNumber = binarySearch(this.lineStarts, pos);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the negative value of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2
            lineNumber = (~lineNumber) - 1;
        }
        return `${lineNumber + 1},${pos - this.lineStarts[lineNumber] + 1}`;
    }

    positionAt(offset) {
        this.computeLineStarts();
        let lineNumber = binarySearch(this.lineStarts, offset);
        if (lineNumber < 0) {
            // If the actual position was not found,
            // the binary search returns the negative value of the next line start
            // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
            // then the search will return -2
            lineNumber = (~lineNumber) - 1;
        }

        return { line: lineNumber, character: offset - this.lineStarts[lineNumber] };
    }

    computeLineStarts() {
        if (this.lineStarts) {
            return;
        }

        const lineStarts = [];
        let lineStart = 0;
        for (var pos = 0; pos < this.text.length;) {
            var ch = this.text.charCodeAt(pos++);
            switch (ch) {
                case 13:
                    if (this.text.charCodeAt(pos) === 10) {
                        pos++;
                    }
                case 10:
                case 8232:
                case 8233:
                case 133:
                    lineStarts.push(lineStart);
                    lineStart = pos;
                    break;

            }
        }
        lineStarts.push(lineStart);
        this.lineStarts = lineStarts;
    }
}

const ERR = chalk.red("ERR!");

/**
 * @typedef {{ message: string, file?: string, position?: { line: number, character: number } }} Diagnostic
 * @typedef {{ version: string, lang: string, messages: Record<string, DiagnosticEntry> }} DiagnosticMessagesEnvelope
 * @typedef {ObsoleteDiagnostic | ErrorDiagnostic | WarningDiagnostic | MessageDiagnostic | string} DiagnosticEntry
 * @typedef {{ since: string }} ObsoleteDiagnostic
 * @typedef {{ kind: "error", code: number }} ErrorDiagnostic
 * @typedef {{ kind: "warning", code: number }} WarningDiagnostic
 * @typedef {{ kind: "message", code?: number }} MessageDiagnostic
 *
 * @param {string} file
 * @param {boolean} jsonc
 * @returns {{ kind: "error", errors: Diagnostic[] } | { kind: "success", lineMap: LineMap, ast: jsonc_parser.Node, value: any }}
 */
function readJsonFile(file, jsonc = false) {
    file = path.resolve(file);

    /** @type {Diagnostic[]} */
    const errors = [];
    let text;
    try {
        text = fs.readFileSync(file, "utf8");
    }
    catch {
        errors.push({ message: `File not found: ${file}` });
    }

    if (errors.length) return { kind: "error", errors };

    const lineMap = new LineMap(text);

    /** @type {jsonc_parser.ParseError[]} */
    const parseErrors = [];
    const ast = jsonc_parser.parseTree(text, parseErrors, { disallowComments: !jsonc, allowTrailingComma: jsonc });
    if (parseErrors.length) {
        for (const error of parseErrors) {
            const position = lineMap.positionAt(error.offset);
            errors.push({ message: jsonc_parser.printParseErrorCode(error.error), file, position });
        }
    }

    if (errors.length) return { kind: "error", errors };

    const value = jsonc_parser.getNodeValue(ast);
    return { kind: "success", lineMap, ast, value };
}

const jsonPathRegExp = /^\.(?<prop>[a-zA-Z_$][a-zA-Z_$0-9]*)|^\[(?<number>\d+)\]/;
const numberRegExp = /^\d+$/;

/**
 * @param {string} dataPath
 */
function getSegments(dataPath) {
    if (!dataPath) return [];

    /** @type {jsonc_parser.Segment[]} */
    const segments = [];
    if (dataPath.startsWith("data")) dataPath = dataPath.slice(4);

    let match;
    while (match = jsonPathRegExp.exec(dataPath)) {
        if (match.groups.prop) {
            segments.push(match.groups.prop);
        }
        else if (match.groups.number) {
            segments.push(parseInt(match.groups.number, 10));
        }
        else {
            break;
        }
        dataPath = dataPath.slice(match[0].length);
    }

    if (dataPath) throw new Error("Unsupported path.");
    return segments;
}

/**
 * @param {LineMap} lineMap
 * @param {jsonc_parser.Node} ast
 * @param {string|jsonc_parser.JSONPath} dataPath
 */
function getPosition(lineMap, ast, dataPath) {
    if (!dataPath) return { line: 0, character: 0 };
    const segments = Array.isArray(dataPath) ? dataPath : getSegments(dataPath);
    const node = jsonc_parser.findNodeAtLocation(ast, segments);
    return lineMap.positionAt(node.offset);
}

/**
 * @param {string} file
 * @param {string} output
 */
function generateDiagnostics(file, output) {
    const inputResult = readJsonFile(file, true);
    if (inputResult.kind === "error") return inputResult.errors;
    const { lineMap, ast } = inputResult;

    const schemaResult = readJsonFile(require.resolve("../schema/diagnostics.schema.json"), false);
    if (schemaResult.kind === "error") return schemaResult.errors;

    /** @type {Diagnostic[]} */
    const errors = [];
    const validator = ajv({ allErrors: true });
    if (!validator.validate(schemaResult.value, inputResult.value)) {
        for (const error of validator.errors) {
            const message = validator.errorsText([error]);
            const position = getPosition(inputResult.lineMap, inputResult.ast, error.dataPath);
            errors.push({ message, file, position });
        }
        return errors;
    }


    /** @type {DiagnosticMessagesEnvelope} */
    const envelope = inputResult.value;
    if (envelope.lang !== "en") {
        const position = getPosition(inputResult.lineMap, inputResult.ast, "lang");
        errors.push({ message: "Only supported for the 'en' language file.", file, position });
        return errors;
    }

    /** @type {Map<number, string>} */
    const usedCodes = new Map();

    /** @type {Set<string>} */
    const usedNames = new Set();

    /** @type {Set<number>} */
    const obsoleteCodes = new Set();

    let result = "";
    result += "import type { Diagnostic } from \"./diagnostics\";\n";
    result += "export const Diagnostics = {\n";
    for (const [key, value] of Object.entries(envelope.messages)) {
        if (typeof value === "string") throw new TypeError("String overrides are not allowed in an 'en' language file.");
        if (numberRegExp.test(key)) {
            obsoleteCodes.add(parseInt(key, 10));
        }
        else {
            if ("since" in value) throw new Error("Illegal state.");
            let name = key;
            name = name.replace(/\.$/, "");
            name = name.replace(/[^a-z0-9]+/gi, "_");
            name = name.replace(/^(?=\d)/, "_");
            const code = value.kind === "message" && value.code === undefined ? 0 : value.code;
            if ((code === 0 || useCode(value.code, key)) && useName(name, key)) {
                result += `    ${name}: { code: ${code}, message: ${JSON.stringify(key)}${value.kind === "warning" ? ", warning: true" : ""} } as Diagnostic,\n`;
            }
        }
    }
    result += "};\n";

    for (const code of obsoleteCodes) {
        const key = usedCodes.get(code);
        if (key) {
            const position = getPosition(lineMap, ast, ["messages", key, "code"]);
            errors.push({ message: `Code ${code} is obsolete and shouldn't be reused.`, file, position });
        }
    }

    if (errors.length) return errors;

    output = path.resolve(output);
    const dirname = path.dirname(output);
    try {
        fs.mkdirSync(dirname, { recursive: true });
    }
    catch {
    }

    fs.writeFileSync(output, result, "utf8");

    function useCode(code, key) {
        if (usedCodes.has(code)) {
            const position = getPosition(lineMap, ast, ["messages", key, "code"]);
            errors.push({ message: `Code ${code} is already in use.`, file, position });
            return false;
        }
        usedCodes.set(code, key);
        return true;
    }

    function useName(name, key) {
        if (usedNames.has(name)) {
            const position = getPosition(lineMap, ast, ["messages", key, "code"]);
            errors.push({ message: `Name ${name} is already in use.`, file, position });
            return false;
        }
        usedNames.add(name);
        return true;
    }
}

/** @type {Diagnostic[]} */
let errors;
const [, , file, output] = process.argv;
if (!file) {
    errors = [{ message: "Argument expected: file" }];
}
else if (!output) {
    errors = [{ message: "Argument expected: output" }];
}
else {
    errors = generateDiagnostics(file, output);
}

if (errors && errors.length) {
    for (const error of errors) {
        const position = error.position ? `(${error.position.line + 1},${error.position.character + 1})`: "";
        const file = error.file ? `${chalk.yellow(`${error.file}${position}`)}: ` : "";
        console.log(`generateDiagnostics ${ERR} ${file}${error.message}`);
    }
    process.exit(1);
}