/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { readFileSync } from "fs";
import { mapFromObject } from "./core";
import { CharacterCodes } from "./tokens";

/**
 * Indicates the token to use for line terminators during emit.
 * {@docCategory Compiler}
 */
export enum NewLineKind {
    /**
     * Lines should be terminated with a line-feed (Unix-style).
     */
    LineFeed,
    /**
     * Lines should be terminted with a carriage-return followed by a line-feed (DOS-style).
     */
    CarriageReturnLineFeed,
}

/**
 * Indicates the emit output format.
 * {@docCategory Compiler}
 */
export enum EmitFormat {
    /**
     * Output should be emitted in Markdown format.
     */
    markdown,
    /**
     * Output should be emitted in HTML format.
     */
    html,
    /**
     * Output should be emitted in ECMArkup format.
     */
    ecmarkup
}

/**
 * Options that control the behavior of the compiler.
 * {@docCategory Compiler}
 */
export interface CompilerOptions {
    /**
     * Indicates the token to use for line terminators during emit.
     */
    newLine?: NewLineKind;
    /**
     * Indicates that diagnostics should not be reported.
     */
    noChecks?: boolean;
    /**
     * Indicates that emit output should not be produced.
     */
    noEmit?: boolean;
    /**
     * Indicates that emit output should not be produced if any diagnostics are reported.
     */
    noEmitOnError?: boolean;
    /**
     * Disables strict checking of production parameters.
     */
    noStrictParametricProductions?: boolean;
    /**
     * Indicates that diagnostics should be produced if production parameters are unused.
     */
    noUnusedParameters?: boolean;
    /**
     * Indicates the emit output format.
     */
    format?: EmitFormat;
    /**
     * Indicates the file path for emit output.
     */
    out?: string;
    /**
     * Indicates whether to include hyperlinks in the emit output.
     */
    emitLinks?: boolean;
    /**
     * Indicates whether internal diagnostic information should be reported to the console.
     */
    diagnostics?: boolean;
}

/**
 * Gets the default options for the compiler.
 */
export function getDefaultOptions(): CompilerOptions {
    return { format: EmitFormat.markdown };
}

export interface KnownOptions {
    [name: string]: Partial<KnownOption>;
}

export interface KnownOption {
    shortName?: string;
    longName: string;
    param?: string;
    type?: string | Map<string, any>;
    many?: boolean;
    description?: string;
    error?: string;
    aliasFor?: string[];
    hidden?: boolean;
    isUsage?: boolean;
    validate?: (key: string, value: string, raw: RawArguments) => boolean;
    convert?: (key: string, value: string, raw: RawArguments) => any;
}

interface KnownOptionMaps {
    longNames: Map<string, KnownOption>;
    shortNames: Map<string, KnownOption>;
}

export interface RawArgument {
    rawKey: string;
    formattedKey: string;
    value: any;
    option: KnownOption;
}

export interface RawArguments {
    args: RawArgument[];
    rest: string[];
}

export interface ParsedArguments {
    [key: string]: any;
    argv: string[];
    rest: string[];
}

export function parse<T extends ParsedArguments>(options: KnownOptions, args: string[] = process.argv.slice(2)): T | undefined {
    const known = createKnownOptionMaps(mapFromObject(options));
    const raw: RawArguments = { args: [], rest: [] };
    const messages: string[] = [];
    let result: ParseResult
    result = parseArguments(args, known, raw, messages);
    if (result === ParseResult.Success) {
        result = expandArguments(known, raw, messages);
        if (result === ParseResult.Success) {
            Object.freeze(raw.rest);
            Object.freeze(raw.args);
            Object.freeze(raw);
            const parsed: T = <T>{ argv: args.slice(0) };
            result = evaluateArguments(parsed, known, raw, messages);
            if (result === ParseResult.Success) {
                return parsed;
            }
        }
    }

    printErrors(messages);
}

const emptyArray: any[] = [];

export class UsageWriter {
    private margin: number;
    private padding: number;
    private remainder: number;

    constructor(margin: number, padding: number) {
        this.margin = margin;
        this.padding = padding;
        this.remainder = 120 - margin - padding;
    }

    public writeOption(left: string | undefined, right: string | undefined) {
        const leftLines = left ? this.fit(left, this.margin) : emptyArray;
        const rightLines = right ? this.fit(right, this.remainder) : emptyArray;
        const lineCount = Math.max(leftLines.length, rightLines.length);
        for (let i = 0; i < lineCount; ++i) {
            let line = "";
            if (i < leftLines.length) {
                line += leftLines[i];
            }
            if (i < rightLines.length) {
                line = padRight(line, this.margin + this.padding);
                line += rightLines[i];
            }

            console.log(line);
        }
    }

    public writeln(text: string = "") {
        console.log(text);
    }

    private fit(text: string, width: number) {
        const lines: string[] = [];
        let pos = 0, len = text.length;
        while (pos < len) {
            const ch = text.charCodeAt(pos);
            if (ch === CharacterCodes.CarriageReturn || ch === CharacterCodes.LineFeed) {
                pos++;
                if (ch === CharacterCodes.CarriageReturn && pos < len && text.charCodeAt(pos) === CharacterCodes.LineFeed) {
                    pos++;
                }

                lines.push("");
                continue;
            }

            let end = pos + width;
            if (end >= len) {
                lines.push(text.substr(pos));
                break;
            }

            while (end > pos && !isWhiteSpace(text.charCodeAt(end))) end--;
            while (end > pos && isWhiteSpace(text.charCodeAt(end), true)) end--;

            if (end <= pos) {
                lines.push(text.substr(pos, width));
                pos += width;
            }
            else {
                lines.push(text.substring(pos, end));
                pos = end;
            }

            while (pos < len && isWhiteSpace(text.charCodeAt(pos), true)) pos++;
        }

        return lines;
    }
}

export function usage(options: KnownOptions, margin: number = 0, printHeader?: (writer: UsageWriter) => void) {
    const optionsDictionary = mapFromObject(options);
    const knownOptions: (KnownOption)[] = [];
    let hasShortNames = false;
    for (const [key, value] of optionsDictionary) {
        const option = importKnownOption(key, value);
        if (option.hidden) {
            continue;
        }

        let size = option.longName.length + 3;
        if (option.shortName) {
            hasShortNames = true;
            size += 4;
        }

        if (option.param) {
            size += 1;
        }

        if (size > margin) {
            margin = size;
        }

        knownOptions.push(option);
    }

    const writer = new UsageWriter(margin, 1);
    if (printHeader) {
        printHeader(writer);
    }

    knownOptions.sort(compareKnownOptions);

    for (const option of knownOptions) {
        let left = " ";
        if (option.shortName) {
            left += `-${option.shortName}, `;
        }
        else if (hasShortNames) {
            left += "    ";
        }

        left += `--${option.longName}`;
        if (option.param) {
            left += ` ${option.param}`;
        }

        left = padRight(left, margin);
        writer.writeOption(left, option.description);
    }
}

function padRight(text: string, size: number, char: string = " ") {
    while (text.length < size) text += char;
    return text;
}

function printErrors(messages: string[]) {
    for (const message of messages) {
        console.error(message);
    }
}

function compareKnownOptions(x: KnownOption, y: KnownOption) {
    const xName = x.longName.toLowerCase();
    const yName = y.longName.toLowerCase();
    return xName.localeCompare(yName);
}

function importTypeMap(dict: Map<string, any>) {
    const copy = new Map(dict);
    Object.freeze(copy);
    return copy;
}

function importKnownOption(key: string, option: Partial<KnownOption>) {
    const copy: KnownOption = { longName: key };
    if (typeof option.longName === "string") copy.longName = option.longName;
    if (typeof option.shortName === "string" && option.shortName.length > 0) copy.shortName = option.shortName.substr(0, 1);
    if (typeof option.param === "string") copy.param = option.param;
    if (typeof option.type === "string") copy.type = option.type;
    if (typeof option.type === "object") copy.type = importTypeMap(option.type);
    if (typeof option.many === "boolean") copy.many = option.many;
    if (typeof option.description === "string") copy.description = option.description;
    if (typeof option.error === "string") copy.error = option.error;
    if (typeof option.aliasFor === "string") copy.aliasFor = option.aliasFor;
    if (typeof option.hidden === "boolean" && option.hidden) copy.hidden = option.hidden;
    if (typeof option.isUsage === "boolean" && option.isUsage) copy.isUsage = option.isUsage;
    if (typeof option.validate === "function") copy.validate = option.validate;
    if (typeof option.convert === "function") copy.convert = option.convert;
    Object.freeze(copy);
    return copy;
}

function createKnownOptionMaps(options: Map<string, Partial<KnownOption>>): KnownOptionMaps {
    const longNames = new Map<string, KnownOption>();
    const shortNames = new Map<string, KnownOption>();
    for (const [key, rawOption] of options) {
        if (rawOption) {
            const knownOption = importKnownOption(key, rawOption);
            longNames.set(knownOption.longName.toLowerCase(), knownOption);
            if (knownOption.shortName) {
                shortNames.set(knownOption.shortName, knownOption);
            }
        }
    }

    const maps: KnownOptionMaps = { longNames, shortNames };
    Object.freeze(longNames);
    Object.freeze(shortNames);
    Object.freeze(maps);
    return maps;
}

enum ParseResult {
    Success,
    Error
}

function parseArguments(args: string[], known: KnownOptionMaps, raw: RawArguments, messages: string[]): ParseResult {
    let argc = args.length, argi = 0;
    while (argi < argc) {
        let arg = args[argi++];
        let ch = arg.charCodeAt(0);
        if (ch === CharacterCodes.At) {
            const result = parseResponseFile(arg.substr(1), known, raw, messages)
            if (result !== ParseResult.Success) {
                return result;
            }
        }
        else if (ch === CharacterCodes.Minus) {
            ch = arg.charCodeAt(1);
            const colonIndex = arg.indexOf(":");
            const hasInlineValue = colonIndex > 0;
            const shortName = ch !== CharacterCodes.Minus;
            const rawKey = arg.substring(shortName ? 1 : 2, hasInlineValue ? colonIndex : arg.length);
            const match = matchKnownOption(known, rawKey, shortName);

            switch (match.cardinality) {
                case "none":
                    messages.push(`Unrecognized option: ${rawKey}.`);
                    return ParseResult.Error;

                case "many":
                    messages.push(`Unrecognized option: ${rawKey}. Did you mean:`);
                    for (const option of match.candidates) {
                        messages.push(`    --${option.longName}`);
                    }

                    return ParseResult.Error;
            }

            const option = match.option;
            const formattedKey = shortName ? "-" + option.shortName : "--" + option.longName;
            const valueRequired = optionRequiresValue(option);
            let value: string | undefined;
            if (valueRequired || hasInlineValue) {
                if (hasInlineValue) {
                    value = arg.substr(colonIndex + 1);
                }
                else {
                    if (argi >= argc) {
                        messages.push(`Option '${formattedKey}' expects an argument.`);
                        return ParseResult.Error;
                    }

                    value = args[argi++];
                }

                if (value.length > 0) {
                    ch = value.charCodeAt(0);
                    if (ch === CharacterCodes.DoubleQuote) {
                        if (value.length > 1 && value.charCodeAt(value.length - 1) === ch) {
                            value = value.substr(1, value.length - 2);
                        }
                    }
                }

                if (valueRequired) {
                    if (value.length === 0 || value === `""` || value === `''`) {
                        messages.push(`Option '${formattedKey}' expects an argument.`);
                        return ParseResult.Error;
                    }
                }
            }

            if (option.type === "boolean") {
                if (!value) {
                    value = "true";
                }
            }

            const rawArgument: RawArgument = {
                rawKey,
                formattedKey,
                value,
                option
            };

            Object.freeze(rawArgument);
            raw.args.push(rawArgument);
        }
        else {
            if (ch === CharacterCodes.DoubleQuote) {
                if (arg.length > 1 && arg.charCodeAt(arg.length - 1) === ch) {
                    arg = arg.substr(1, arg.length - 2);
                }
            }

            raw.rest.push(arg);
        }
    }

    return ParseResult.Success;
}

function parseResponseFile(file: string, known: KnownOptionMaps, raw: RawArguments, messages: string[]): ParseResult {
    let text: string;
    try {
        text = readFileSync(file, "utf8");
    }
    catch (e) {
        messages.push(`File '${file}'' not found.`);
        return ParseResult.Error;
    }

    const args: string[] = [];
    let pos = 0;
    const len = text.length;
    while (pos < len) {
        let ch = text.charCodeAt(pos);
        if (isWhiteSpace(ch)) {
            pos++;
            continue;
        }

        const start = pos;
        if (ch === CharacterCodes.DoubleQuote) {
            pos++;
            while (pos < len) {
                ch = text.charCodeAt(pos);
                if (ch === CharacterCodes.DoubleQuote) {
                    break;
                }

                pos++;
            }

            args.push(text.substring(start, pos++));
        }
        else {
            pos++;
            while (pos < len) {
                ch = text.charCodeAt(pos);
                if (!isWhiteSpace(ch)) {
                    pos++;
                }
            }
            args.push(text.substring(start, pos));
        }
    }

    return parseArguments(args, known, raw, messages);
}

function isWhiteSpace(ch: number, excludeLineTerminator?: boolean) {
    switch (ch) {
        case CharacterCodes.LineFeed:
        case CharacterCodes.CarriageReturn:
            return !excludeLineTerminator;

        case CharacterCodes.Space:
        case CharacterCodes.Tab:
        case CharacterCodes.VerticalTab:
        case CharacterCodes.FormFeed:
            return true;
    }

    return false;
}

function optionRequiresValue(option: KnownOption) {
    switch (option.type) {
        case undefined:
        case "":
        case "boolean":
            return false;

        default:
            return true;
    }
}

type KnownOptionMatchResult =
    | { cardinality: "one", option: KnownOption }
    | { cardinality: "many", candidates: KnownOption[] }
    | { cardinality: "none" };

function matchKnownOption(known: KnownOptionMaps, key: string, shortName: boolean): KnownOptionMatchResult {
    if (shortName) {
        const option = known.shortNames.get(key);
        if (option) return { cardinality: "one", option };
    }
    else {
        const keyLower = key.toLowerCase();
        let option = known.longNames.get(keyLower);
        if (option) return { cardinality: "one", option };
        const keyLen = keyLower.length;
        let candidates: KnownOption[] | undefined;
        for (const [knownKey, option] of known.longNames) {
            if (option &&
                knownKey.length > keyLen &&
                knownKey.substr(0, keyLen) === keyLower) {
                if (!candidates) {
                    candidates = [];
                }

                candidates.push(option);
            }
        }

        if (candidates) {
            if (candidates.length === 1) {
                const option = candidates[0];
                return { cardinality: "one", option };
            }
            else if (candidates.length > 1) {
                return { cardinality: "many", candidates };
            }
        }
    }

    return { cardinality: "none" };
}

function expandArguments(known: KnownOptionMaps, raw: RawArguments, messages: string[]) {
    for (let i = 0; i < raw.args.length; ++i) {
        const arg = raw.args[i];
        const option = arg.option;
        if (option.aliasFor) {
            let args = option.aliasFor;
            if (arg.value) {
                args = args.concat([arg.value]);
            }

            if (parseArguments(args, known, raw, messages) === ParseResult.Error) {
                return ParseResult.Error;
            }
        }
    }

    return ParseResult.Success;
}

function evaluateArguments(parsed: ParsedArguments, known: KnownOptionMaps, raw: RawArguments, messages: string[]) {
    for (const arg of raw.args) {
        let { formattedKey, value, option } = arg;
        if (option.aliasFor) {
            continue;
        }

        let type: string = typeof option.type;
        if (type === "string") {
            type = <string>option.type;
        }

        if (option.validate && !option.validate(option.longName, value, raw)) {
            if (option.error) {
                messages.push(option.error);
            }
            else {
                messages.push(`Invalid argument for option '${formattedKey}'.`)
            }

            return ParseResult.Error;
        }

        let booleanValue: boolean | undefined;
        let numberValue: number | undefined;
        switch (type) {
            case "file":
            case "string":
                break;

            case "boolean":
                if (value) {
                    value = value.toLowerCase();
                    if (!/^(true|false)$/.test(value)) {
                        if (option.error) {
                            messages.push(option.error);
                        }
                        else {
                            messages.push(`Invalid argument for option '${formattedKey}'. Expected either 'true' or 'false'.`);
                        }

                        return ParseResult.Error;
                    }

                    booleanValue = value === "true";
                }
                else {
                    booleanValue = true;
                }

                break;

            case "number":
                if (value) {
                    numberValue = parseFloat(value);
                    if (isNaN(numberValue) || !isFinite(numberValue)) {
                        if (option.error) {
                            messages.push(option.error);
                        }
                        else {
                            messages.push(`Invalid argument for option '${formattedKey}'. Expected a finite number.`);
                        }

                        return ParseResult.Error;
                    }
                }

                break;

            case "object":
                if (value) {
                    const type = <Map<string, any>>option.type;
                    let result = type.get(value);
                    if (result === undefined) {
                        const valueLower = (<string>value).toLowerCase();
                        result = type.get(valueLower);
                        if (!result) {
                            for (const key in type) {
                                if (key.toLowerCase() === valueLower) {
                                    result = type.get(key);
                                    break;
                                }
                            }
                        }
                    }

                    if (result === undefined) {
                        if (option.error) {
                            messages.push(option.error);
                        }
                        else {
                            messages.push(`Invalid argument for option '${formattedKey}'.`);
                        }

                        return ParseResult.Error;
                    }

                    value = result;
                }
                break;
        }

        if (option.convert) {
            value = option.convert(option.longName, value, raw);
        }
        else {
            switch (option.type) {
                case "boolean":
                    value = booleanValue;
                    break;

                case "number":
                    value = numberValue;
                    break;
            }
        }

        parsed[option.longName] = value;
    }

    parsed.rest = raw.rest.slice(0);
    return ParseResult.Success;
}