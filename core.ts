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
 export const enum CharacterCodes {
    NullCharacter = 0,
    MaxAsciiCharacter = 0x7F,

    LineFeed = 0x0A,              // \n
    CarriageReturn = 0x0D,        // \r
    LineSeparator = 0x2028,
    ParagraphSeparator = 0x2029,
    NextLine = 0x0085,

    // Unicode 3.0 space characters
    Space = 0x0020,   // " "
    NonBreakingSpace = 0x00A0,   //
    EnQuad = 0x2000,
    EmQuad = 0x2001,
    EnSpace = 0x2002,
    EmSpace = 0x2003,
    ThreePerEmSpace = 0x2004,
    FourPerEmSpace = 0x2005,
    SixPerEmSpace = 0x2006,
    FigureSpace = 0x2007,
    PunctuationSpace = 0x2008,
    ThinSpace = 0x2009,
    HairSpace = 0x200A,
    ZeroWidthSpace = 0x200B,
    NarrowNoBreakSpace = 0x202F,
    IdeographicSpace = 0x3000,
    MathematicalSpace = 0x205F,
    Ogham = 0x1680, 

    Underscore = 0x5F,

    Number0 = 0x30,
    Number1 = 0x31,
    Number2 = 0x32,
    Number3 = 0x33,
    Number4 = 0x34,
    Number5 = 0x35,
    Number6 = 0x36,
    Number7 = 0x37,
    Number8 = 0x38,
    Number9 = 0x39,

    LowerA = 0x61,
    LowerB = 0x62,
    LowerC = 0x63,
    LowerD = 0x64,
    LowerE = 0x65,
    LowerF = 0x66,
    LowerG = 0x67,
    LowerH = 0x68,
    LowerI = 0x69,
    LowerJ = 0x6A,
    LowerK = 0x6B,
    LowerL = 0x6C,
    LowerM = 0x6D,
    LowerN = 0x6E,
    LowerO = 0x6F,
    LowerP = 0x70,
    LowerQ = 0x71,
    LowerR = 0x72,
    LowerS = 0x73,
    LowerT = 0x74,
    LowerU = 0x75,
    LowerV = 0x76,
    LowerW = 0x77,
    LowerX = 0x78,
    LowerY = 0x79,
    LowerZ = 0x7A,

    UpperA = 0x41,
    UpperB = 0x42,
    UpperC = 0x43,
    UpperD = 0x44,
    UpperE = 0x45,
    UpperF = 0x46,
    UpperG = 0x47,
    UpperH = 0x48,
    UpperI = 0x49,
    UpperJ = 0x4A,
    UpperK = 0x4B,
    UpperL = 0x4C,
    UpperM = 0x4D,
    UpperN = 0x4E,
    UpperO = 0x4F,
    UpperP = 0x50,
    UpperQ = 0x51,
    UpperR = 0x52,
    UpperS = 0x53,
    UpperT = 0x54,
    UpperU = 0x55,
    UpperV = 0x56,
    UpperW = 0x57,
    UpperX = 0x58,
    UpperY = 0x59,
    UpperZ = 0x5a,

    Asterisk = 0x2A,              // *
    At = 0x40,                    // @
    Backslash = 0x5C,             // \
    Backtick = 0x60,              // `
    Bar = 0x7C,                   // |
    CloseBrace = 0x7D,            // }
    CloseBracket = 0x5D,          // ]
    CloseParen = 0x29,            // )
    Colon = 0x3A,                 // :
    Comma = 0x2C,                 // ,
    Dot = 0x2E,                   // .
    DoubleQuote = 0x22,           // "
    Equals = 0x3D,                // =
    Exclamation = 0x21,           // !
    GreaterThan = 0x3E,           // >
    LessThan = 0x3C,              // <
    Minus = 0x2D,                 // -
    OpenBrace = 0x7B,             // {
    OpenBracket = 0x5B,           // [
    OpenParen = 0x28,             // (
    Plus = 0x2B,                  // +
    Question = 0x3F,              // ?
    SingleQuote = 0x27,           // '
    Slash = 0x2F,                 // /
    Tilde = 0x7E,                 // ~
    NumberSign = 0x23,            // #
    Backspace = 0x08,             // \b
    FormFeed = 0x0C,              // \f
    ByteOrderMark = 0xFEFF,
    Tab = 0x09,                   // \t
    VerticalTab = 0x0B,           // \v
}

export const enum SyntaxKind {
    Unknown,
    EndOfFileToken,

    // Significant Whitespace
    LineTerminatorToken,
    IndentToken,
    DedentToken,

    // Literals
    StringLiteral,
    NumericLiteral,
    Terminal,
    Prose,

    // Punctuation
    OpenBraceToken,             // {
    CloseBraceToken,            // }
    OpenBracketToken,           // [
    CloseBracketToken,          // ]
    OpenParenToken,             // (
    CloseParenToken,            // )
    ColonToken,                 // :
    CommaToken,                 // ,
    PlusToken,                  // +
    TildeToken,                 // ~
    QuestionToken,              // ?
    EqualsToken,                // =
    EqualsEqualsToken,          // == 
    ExclamationEqualsToken,     // !=
    LessThanExclamationToken,   // <!
    LessThanMinusToken,         // <-
    AtToken,                    // @
    
    // Identifiers
    Identifier,
    
    // Preprocessor keywords
    DefineKeyword,
    ImportKeyword,

    // Keywords
    AsKeyword,
    ButKeyword,
    EmptyKeyword,
    GoalKeyword,
    HereKeyword,
    LexicalKeyword,
    LookaheadKeyword,
    NoKeyword,
    NotKeyword,
    OfKeyword,
    OneKeyword,
    OrKeyword,
    TrueKeyword,
    FalseKeyword,

    // Nodes
    Import,                     // #import "path"
    Type,                       // @lexical
    Parameter,                  // Production(Parameter):
    ParameterList,
    Argument,                   // NonTerminal(Argument)
    ArgumentList,

    Production,                 // Production: ...
    OneOfList,                  // Production: one of ...
    RightHandSideList,          // Production: RightHandSide...
    RightHandSide,              // ...: SymbolSpan
    SymbolSpan,                 // Symbol Symbolopt

    ButNotOperator,             // x but not y

    // Symbols
    BinarySymbol,               // x but not y
    OneOfSymbol,                // one of OrClause
    Nonterminal,
    InvalidSymbol,
    TerminalList,
    TerminalSet,

    // Constraints
    LookaheadConstraint,
    LexicalGoalConstraint,
    NoSymbolHereConstraint,
    ParameterValueConstraint,

    Definition,
    DefinitionOption,

    // error nodes
    InvalidConstraint,
    InvalidSourceElement,

    // top nodes
    SourceFile,
    Grammar,

    FirstKeyword = AsKeyword,
    LastKeyword = FalseKeyword
}

export interface Dict<T> {
    [key: string]: T;
}

export module Dict {
    const hasOwn = Object.prototype.hasOwnProperty;
    
    export function create<T>(object?: Dict<T>): Dict<T> {
        let newObject = Object.create ? Object.create(null) : {};
        if (object) {
            for (let key in object) {
                if (hasOwn.call(object, key)) {
                    newObject[key] = object[key];
                }
            }
        }
        return newObject;
    }
    
    export function has<T>(object: Dict<T>, key: string): boolean {
        return hasOwn.call(object, key);
    }
    
    export function get<T>(object: Dict<T>, key: string): T {
        return hasOwn.call(object, key) ? object[key] : undefined;
    }
    
    export function set<T>(object: Dict<T>, key: string, value: T): Dict<T> {
        object[key] = value;
        return object;
    }
    
    export function forEach<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => void, thisArg?: any): void {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                callbackfn.call(thisArg, value, key, object);
            }
        }
    }
    
    export function map<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => U, thisArg?: any): Dict<U> {
        let newObject: Dict<U> = create<U>();
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                let mappedValue = <U>callbackfn.call(thisArg, value, key, object);
                newObject[key] = mappedValue;
            }
        }
        return newObject;
    }
    
    export function mapPairs<T, U>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => [string, U], thisArg?: any): Dict<U> {
        let newObject: Dict<U> = create<U>();
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                let [mappedKey, mappedValue] = <[string, U]>callbackfn.call(thisArg, value, key, object);
                newObject[mappedKey] = mappedValue;
            }
        }
        return newObject;
    }
    
    export function filter<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): Dict<T> {
        let newObject: Dict<T> = create<T>();
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                if (callbackfn.call(thisArg, value, key, object)) {
                    newObject[key] = value;
                }
            }
        }
        return newObject;
    }
    
    export function some<T>(object: Dict<T>, callbackfn?: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                if (!callbackfn || callbackfn.call(thisArg, value, key, object)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    export function every<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): boolean {
        let any = false;
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                if (!callbackfn.call(thisArg, value, key, object)) {
                    return false;
                }
                
                any = true;
            }
        }
        
        return any;
    }
    
    export function find<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): T {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return value;
                }
            }
        }
        
        return undefined;
    }
    
    export function findKey<T>(object: Dict<T>, callbackfn: (value: T, key: string, dict: Dict<T>) => boolean, thisArg?: any): string {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                if (callbackfn.call(value, key, object)) {
                    return key;
                }
            }
        }
        
        return undefined;
    }
    
    export function keyOf<T>(object: Dict<T>, value: T): string {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                if (object[key] === value) {
                    return key;
                }
            }
        }
        
        return undefined;
    }
    
    export function includes<T>(object: Dict<T>, value: T): boolean {
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                if (object[key] === value) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    export function reduce<T>(object: Dict<T>, callbackfn: (previousValue: T, value: T, key: string, dict: Dict<T>) => T, initialValue: T): T;
    export function reduce<T, U>(object: Dict<T>, callbackfn: (previousValue: U, value: T, key: string, dict: Dict<T>) => U, initialValue: U): U;
    export function reduce<T, U>(object: Dict<T>, callbackfn: (previousValue: U, value: T, key: string, dict: Dict<T>) => U, initialValue: U): U {
        let aggregate = initialValue;
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                aggregate = callbackfn(aggregate, value, key, object);
            }
        }
        return aggregate;
    }
    
    export function turn<T>(object: Dict<T>, callbackfn: (memo: Dict<T>, value: T, key: string, dict: Dict<T>) => void, memo?: Dict<T>): Dict<T>;
    export function turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<U>): Dict<U>;
    export function turn<T, U>(object: Dict<T>, callbackfn: (memo: Dict<T | U>, value: T, key: string, dict: Dict<T>) => void, memo: Dict<T | U> = object): Dict<U> {        
        for (let key in object) {
            if (hasOwn.call(object, key)) {
                let value = object[key];
                callbackfn(memo, value, key, object);
            }
        }
        return <Dict<U>>memo;
    }
}

export interface Map<T> {
    [key: string]: T;
}

export function binarySearch(array: number[], value: number): number {
    var low = 0;
    var high = array.length - 1;
    while (low <= high) {
        var middle = low + ((high - low) >> 1);
        var midValue = array[middle];
        if (midValue === value) {
            return middle;
        }
        else if (midValue > value) {
            high = middle - 1;
        }
        else {
            low = middle + 1;
        }
    }
    return ~low;
}

var primativeHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty<T>(map: Map<T>, key: string): boolean {
    return map && primativeHasOwnProperty.call(map, key);
}

export function getOwnProperty<T>(map: Map<T>, key: string): T {
    return hasOwnProperty(map, key) && map[key];
}

export function forEachEntry<T, TResult>(map: Map<T>, cbEntry: (value: T, key: string) => TResult): TResult {
    var result: TResult;
    if (map) {
        for (var key in map) {
            if (hasOwnProperty(map, key)) {
                result = cbEntry(getOwnProperty(map, key), key);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
}

export function forEach<T, TResult>(array: T[], cbElement: (value: T, index: number) => TResult): TResult {
    var result: TResult;
    if (array) {
        for (var i = 0; i < array.length; i++) {
            if (i in array) {
                var result = cbElement(array[i], i);
                if (result) {
                    break;
                }
            }
        }
    }
    return result;
}