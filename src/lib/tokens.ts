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

import { Dictionary } from "./core";

export const enum CharacterCodes {
    NullCharacter = 0,
    MaxAsciiCharacter = 0x7F,

    LineFeed = 0x0A,              // \n
    CarriageReturn = 0x0D,        // \r
    LineSeparator = 0x2028,
    ParagraphSeparator = 0x2029,
    NextLine = 0x0085,

    // Unicode 3.0 space characters
    Space = 0x0020,               // " "
    NonBreakingSpace = 0x00A0,    //
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
    Tab = 0x09,                   // \t
    VerticalTab = 0x0B,           // \v

    NotEqualTo = 0x2260,          // ≠
    ElementOf = 0x2208,           // ∈
    NotAnElementOf = 0x2209,      // ∉
    ByteOrderMark = 0xFEFF,
}

export enum SyntaxKind {
    Unknown,
    EndOfFileToken,

    // Significant Whitespace
    LineTerminatorToken,
    IndentToken,
    DedentToken,

    // Literals
    StringLiteral,
    Terminal,
    UnicodeCharacterLiteral,
    Prose,

    ProseHead,
    ProseMiddle,
    ProseTail,
    ProseFull,

    // Punctuation
    AtToken,                    // @
    OpenBraceToken,             // {
    CloseBraceToken,            // }
    OpenBracketToken,           // [
    OpenBracketGreaterThanToken,// [>
    CloseBracketToken,          // ]
    GreaterThanToken,           // >
    OpenParenToken,             // (
    CloseParenToken,            // )
    ColonToken,                 // :
    ColonColonToken,            // ::
    ColonColonColonToken,       // :::
    CommaToken,                 // ,
    PlusToken,                  // +
    TildeToken,                 // ~
    QuestionToken,              // ?
    EqualsToken,                // =
    EqualsEqualsToken,          // ==
    ExclamationEqualsToken,     // !=
    LessThanExclamationToken,   // <!
    LessThanMinusToken,         // <-
    NotEqualToToken,            // ≠
    ElementOfToken,             // ∈
    NotAnElementOfToken,        // ∉

    // Identifiers
    Identifier,

    // Keywords
    ButKeyword, // FirstKeyword
    DefineKeyword,
    EmptyKeyword,
    FalseKeyword,
    GoalKeyword,
    HereKeyword,
    ImportKeyword,
    LexicalKeyword,
    LookaheadKeyword,
    NoKeyword,
    NotKeyword,
    OfKeyword,
    OneKeyword,
    OrKeyword,
    ThroughKeyword,
    TrueKeyword, // LastKeyword

    // Nodes
    Parameter,                  // Production(Parameter):
    ParameterList,
    Argument,                   // NonTerminal(Argument)
    ArgumentList,
    LinkReference,              // #link

    Import,                     // @import "path"
    Define,                     // @define key value
    Production,                 // Production: ...
    OneOfList,                  // Production: one of ...
    RightHandSideList,          // Production: RightHandSide...
    RightHandSide,              // ...: SymbolSpan
    SymbolSpan,                 // Symbol Symbolopt

    // Symbols
    ButNotSymbol,               // x but not y
    UnicodeCharacterRange,      // x through y
    OneOfSymbol,                // one of OrClause
    Nonterminal,
    TerminalList,
    SymbolSet,

    // Zero-width Assertions
    EmptyAssertion,             // `[` `empty` `]`
    LookaheadAssertion,
    LexicalGoalAssertion,
    NoSymbolHereAssertion,
    ParameterValueAssertion,
    ProseAssertion,

    // error nodes
    InvalidSymbol,
    InvalidAssertion,
    InvalidSourceElement,

    // top nodes
    SourceFile,

    FirstProseFragment = ProseHead,
    LastProseFragment = ProseTail,
    FirstKeyword = ButKeyword,
    LastKeyword = TrueKeyword,
    FirstPunctuation = AtToken,
    LastPunctuation = LessThanMinusToken,
}

export type ProseFragmentLiteralKinds =
    | SyntaxKind.ProseFull
    | SyntaxKind.ProseHead
    | SyntaxKind.ProseMiddle
    | SyntaxKind.ProseTail;

export type MetaKinds =
    | SyntaxKind.Import
    | SyntaxKind.Define;

const textToToken = new Dictionary({
    "but": SyntaxKind.ButKeyword,
    "define": SyntaxKind.DefineKeyword,
    "empty": SyntaxKind.EmptyKeyword,
    "false": SyntaxKind.FalseKeyword,
    "goal": SyntaxKind.GoalKeyword,
    "here": SyntaxKind.HereKeyword,
    "import": SyntaxKind.ImportKeyword,
    "lexical": SyntaxKind.LexicalKeyword,
    "lookahead": SyntaxKind.LookaheadKeyword,
    "no": SyntaxKind.NoKeyword,
    "not": SyntaxKind.NotKeyword,
    "of": SyntaxKind.OfKeyword,
    "one": SyntaxKind.OneKeyword,
    "or": SyntaxKind.OrKeyword,
    "through": SyntaxKind.ThroughKeyword,
    "true": SyntaxKind.TrueKeyword,
    "@": SyntaxKind.AtToken,
    ":": SyntaxKind.ColonToken,
    "::": SyntaxKind.ColonColonToken,
    ":::": SyntaxKind.ColonColonColonToken,
    "{": SyntaxKind.OpenBraceToken,
    "}": SyntaxKind.CloseBraceToken,
    "(": SyntaxKind.OpenParenToken,
    ")": SyntaxKind.CloseParenToken,
    "[": SyntaxKind.OpenBracketToken,
    "[>": SyntaxKind.OpenBracketGreaterThanToken,
    "]": SyntaxKind.CloseBracketToken,
    ">": SyntaxKind.GreaterThanToken,
    ",": SyntaxKind.CommaToken,
    "+": SyntaxKind.PlusToken,
    "~": SyntaxKind.TildeToken,
    "?": SyntaxKind.QuestionToken,
    "=": SyntaxKind.EqualsToken,
    "==": SyntaxKind.EqualsEqualsToken,
    "!=": SyntaxKind.ExclamationEqualsToken,
    "≠": SyntaxKind.NotEqualToToken,
    "<-": SyntaxKind.LessThanMinusToken,
    "∈": SyntaxKind.ElementOfToken,
    "<!": SyntaxKind.LessThanExclamationToken,
    "∉": SyntaxKind.NotAnElementOfToken,
});

const tokenToText = Dictionary.invert(textToToken);

export function stringToToken(text: string) {
    return Dictionary.get(textToToken, text);
}

export function tokenToString(kind: SyntaxKind, quoted?: boolean) {
    if (kind in tokenToText) {
        var text = tokenToText[kind];
        return quoted ? `'${text}'` : text;
    }

    switch (kind) {
        case SyntaxKind.LineTerminatorToken:
            return "«line terminator»";
        case SyntaxKind.IndentToken:
            return "«indent»";
        case SyntaxKind.DedentToken:
            return "«dedent»";
        case SyntaxKind.Identifier:
            return "«identifier»";
        case SyntaxKind.Terminal:
            return "«terminal»";
        case SyntaxKind.UnicodeCharacterLiteral:
            return "«unicode character literal»";
        case SyntaxKind.Prose:
            return "«prose»";
        case SyntaxKind.Production:
            return "«production»";
        case SyntaxKind.OneOfList:
            return "«one of»";
        case SyntaxKind.RightHandSide:
            return "«right hand side»";
    }

    return "«" + SyntaxKind[kind] + "»";
}