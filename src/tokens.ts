/*!
 * Copyright (c) 2020 Ron Buckton (rbuckton@chronicles.org)
 *
 * This file is licensed to you under the terms of the MIT License, found in the LICENSE file
 * in the root of this repository or package.
 */

import { formatEnum } from "./core";

/** {@docCategory Parse} */
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

    Hash = 0x23,                  // #
    Ampersand = 0x26,             // &
    Asterisk = 0x2A,              // *
    At = 0x40,                    // @
    Backslash = 0x5C,             // \
    Backtick = 0x60,              // `
    Bar = 0x7C,                   // |
    CloseBrace = 0x7D,            // }
    CloseBracket = 0x5D,          // ]
    CloseParen = 0x29,            // )
    Colon = 0x3A,                 // :
    Semicolon = 0x3b,             // ;
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

/** {@docCategory Parse} */
export enum SyntaxKind {
    Unknown,

    // Trivia, Comments
    SingleLineCommentTrivia, // FirstCommentTrivia, FirstTrivia
    MultiLineCommentTrivia, // LastCommentTrivia

    // Trivia, Html
    HtmlOpenTagTrivia, // FirstHtmlTrivia
    HtmlCloseTagTrivia, // LastHtmlTrivia, LastTrivia

    // Tokens, Other
    EndOfFileToken, // FirstToken

    // Tokens, Punctuation
    AtToken, // FirstPunctuation, `@`
    OpenBraceToken, // `{`
    CloseBraceToken, // `}`
    OpenBracketToken, // `[`
    OpenBracketGreaterThanToken, // `[>`
    CloseBracketToken, // `]`
    GreaterThanToken, // `>`
    OpenParenToken, // `(`
    CloseParenToken, // `)`
    ColonToken, // `:`
    ColonColonToken, // `::`
    ColonColonColonToken, // `:::`
    CommaToken, // `,`
    PlusToken, // `+`
    TildeToken, // `~`
    QuestionToken, // `?`
    EqualsToken, // `=`
    EqualsEqualsToken, // `==`
    ExclamationEqualsToken, // `!=`
    LessThanExclamationToken, // `<!`
    LessThanMinusToken, // `<-`
    NotEqualToToken, // `≠`
    ElementOfToken, // `∈`
    NotAnElementOfToken, // LastPunctuation, `∉`

    // Tokens, Keywords
    ButKeyword, // FirstKeyword
    DefineKeyword,
    DefaultKeyword,
    EmptyKeyword,
    FalseKeyword,
    GoalKeyword,
    HereKeyword,
    ImportKeyword,
    LexicalKeyword,
    LineKeyword,
    LookaheadKeyword,
    NoKeyword,
    NotKeyword,
    OfKeyword,
    OneKeyword,
    OrKeyword,
    ThroughKeyword,
    TrueKeyword, // LastKeyword, LastToken

    // TextContent, Literals
    StringLiteral, // FirstLiteral, FirstTextContent
    NumberLiteral,
    Terminal,
    UnicodeCharacterLiteral, // LastLiteral

    // TextContent, Literals, Prose Fragments
    ProseHead, // FirstProseFragment
    ProseMiddle,
    ProseTail,
    ProseFull, // LastProseFragment

    // TextContent, Identifiers
    Identifier, // LastTextContent

    // Nodes, File
    SourceFile,

    // Nodes, Top Level
    Import, // @import "path"
    Define, // @define key value
    Line,   // @line 10 "path"
    Production, // Production: ...

    // Nodes, Elements
    Parameter,
    ParameterList, // [In, Yield, Await]
    Argument,
    ArgumentList, // [+In, ~Yield, ?Await]
    LinkReference, // #link
    OneOfList, // Production: one of ...
    RightHandSideList, // Production: RightHandSide...
    RightHandSide, // ...: SymbolSpan
    Constraints, // [~Default]
    SymbolSpan, // Symbol Symbolopt
    SymbolSet, // `{ A, B }`

    // Nodes, Symbols
    ButNotSymbol, // `x but not y`
    UnicodeCharacterRange, // `x through y`
    OneOfSymbol, // `one of OrClause`
    PlaceholderSymbol, // `@`
    Nonterminal, // `` `a` ``
    Prose, // > head |NonTerminal| middle `terminal` tail

    // Nodes, Symbols, Assertions
    EmptyAssertion, // `[empty]`
    LookaheadAssertion,
    LexicalGoalAssertion,
    NoSymbolHereAssertion,
    ProseAssertion,

    // Nodes, Error
    InvalidSymbol, // FirstErrorNode
    InvalidAssertion, // LastErrorNode

    // Ranges
    FirstToken = EndOfFileToken,
    LastToken = TrueKeyword,
    FirstKeyword = ButKeyword,
    LastKeyword = TrueKeyword,
    FirstPunctuation = AtToken,
    LastPunctuation = NotAnElementOfToken,
    FirstLiteral = StringLiteral,
    LastLiteral = UnicodeCharacterLiteral,
    FirstProseFragmentLiteral = ProseHead,
    LastProseFragmentLiteral = ProseFull,
    FirstTextContent = StringLiteral,
    LastTextContent = ProseFull,
    FirstErrorNode = InvalidSymbol,
    LastErrorNode = InvalidAssertion,
    FirstTrivia = SingleLineCommentTrivia,
    LastTrivia = HtmlCloseTagTrivia,
    FirstCommentTrivia = SingleLineCommentTrivia,
    LastCommentTrivia = MultiLineCommentTrivia,
    FirstHtmlTrivia = HtmlOpenTagTrivia,
    LastHtmlTrivia = HtmlCloseTagTrivia,
}

export type CommentTriviaKind =
    | SyntaxKind.SingleLineCommentTrivia
    | SyntaxKind.MultiLineCommentTrivia;

export function isCommentTriviaKind(kind: SyntaxKind): kind is CommentTriviaKind {
    return kind >= SyntaxKind.FirstCommentTrivia
        && kind <= SyntaxKind.LastCommentTrivia;
}

export type HtmlTriviaKind =
    | SyntaxKind.HtmlOpenTagTrivia
    | SyntaxKind.HtmlCloseTagTrivia;

export function isHtmlTriviaKind(kind: SyntaxKind): kind is HtmlTriviaKind {
    return kind >= SyntaxKind.FirstHtmlTrivia
        && kind <= SyntaxKind.LastHtmlTrivia;
}

export type TriviaKind =
    | CommentTriviaKind
    | HtmlTriviaKind;

export function isTriviaKind(kind: SyntaxKind): kind is TriviaKind {
    return kind >= SyntaxKind.FirstTrivia
        && kind <= SyntaxKind.LastTrivia;
}

export type PunctuationKind =
    | SyntaxKind.AtToken
    | SyntaxKind.OpenBraceToken
    | SyntaxKind.CloseBraceToken
    | SyntaxKind.OpenBracketToken
    | SyntaxKind.OpenBracketGreaterThanToken
    | SyntaxKind.CloseBracketToken
    | SyntaxKind.GreaterThanToken
    | SyntaxKind.OpenParenToken
    | SyntaxKind.CloseParenToken
    | SyntaxKind.ColonToken
    | SyntaxKind.ColonColonToken
    | SyntaxKind.ColonColonColonToken
    | SyntaxKind.CommaToken
    | SyntaxKind.PlusToken
    | SyntaxKind.TildeToken
    | SyntaxKind.QuestionToken
    | SyntaxKind.EqualsToken
    | SyntaxKind.EqualsEqualsToken
    | SyntaxKind.ExclamationEqualsToken
    | SyntaxKind.LessThanExclamationToken
    | SyntaxKind.LessThanMinusToken
    | SyntaxKind.NotEqualToToken
    | SyntaxKind.ElementOfToken
    | SyntaxKind.NotAnElementOfToken;

export function isPunctuationKind(kind: SyntaxKind): kind is PunctuationKind {
    return kind >= SyntaxKind.FirstPunctuation
        && kind <= SyntaxKind.LastPunctuation;
}

export type LookaheadOperatorKind =
    | SyntaxKind.EqualsToken
    | SyntaxKind.EqualsEqualsToken
    | SyntaxKind.ExclamationEqualsToken
    | SyntaxKind.NotEqualToToken
    | SyntaxKind.LessThanMinusToken
    | SyntaxKind.ElementOfToken
    | SyntaxKind.LessThanExclamationToken
    | SyntaxKind.NotAnElementOfToken;

export type ProductionSeperatorKind =
    | SyntaxKind.ColonToken
    | SyntaxKind.ColonColonToken
    | SyntaxKind.ColonColonColonToken;

export type ParameterOperatorKind =
    | SyntaxKind.PlusToken
    | SyntaxKind.TildeToken;

export type ArgumentOperatorKind =
    | SyntaxKind.QuestionToken
    | SyntaxKind.PlusToken
    | SyntaxKind.TildeToken;

export type KeywordKind =
    | SyntaxKind.ButKeyword
    | SyntaxKind.DefaultKeyword
    | SyntaxKind.DefineKeyword
    | SyntaxKind.EmptyKeyword
    | SyntaxKind.FalseKeyword
    | SyntaxKind.GoalKeyword
    | SyntaxKind.HereKeyword
    | SyntaxKind.ImportKeyword
    | SyntaxKind.LexicalKeyword
    | SyntaxKind.LineKeyword
    | SyntaxKind.LookaheadKeyword
    | SyntaxKind.NoKeyword
    | SyntaxKind.NotKeyword
    | SyntaxKind.OfKeyword
    | SyntaxKind.OneKeyword
    | SyntaxKind.OrKeyword
    | SyntaxKind.ThroughKeyword
    | SyntaxKind.TrueKeyword;

export function isKeywordKind(kind: SyntaxKind): kind is KeywordKind {
    return kind >= SyntaxKind.FirstKeyword
        && kind <= SyntaxKind.LastKeyword;
}

export type BooleanKind =
    | SyntaxKind.TrueKeyword
    | SyntaxKind.FalseKeyword;

export type TokenKind =
    | SyntaxKind.EndOfFileToken
    | PunctuationKind
    | KeywordKind;

export function isTokenKind(kind: SyntaxKind): kind is TokenKind {
    return kind === SyntaxKind.EndOfFileToken
        || kind >= SyntaxKind.FirstToken
        && kind <= SyntaxKind.LastToken;
}

export type ProseFragmentLiteralKind =
    | SyntaxKind.ProseFull
    | SyntaxKind.ProseHead
    | SyntaxKind.ProseMiddle
    | SyntaxKind.ProseTail;

export function isProseFragmentLiteralKind(kind: SyntaxKind): kind is ProseFragmentLiteralKind {
    return kind >= SyntaxKind.FirstProseFragmentLiteral
        && kind <= SyntaxKind.LastProseFragmentLiteral;
}

export type TextContentKind =
    | SyntaxKind.StringLiteral
    | SyntaxKind.NumberLiteral
    | SyntaxKind.Terminal
    | SyntaxKind.UnicodeCharacterLiteral
    | ProseFragmentLiteralKind
    | SyntaxKind.Identifier;

export function isTextContentKind(kind: SyntaxKind): kind is TextContentKind {
    return kind >= SyntaxKind.FirstTextContent
        && kind <= SyntaxKind.LastTextContent;
}

export type AssertionKind =
    | SyntaxKind.EmptyAssertion
    | SyntaxKind.LookaheadAssertion
    | SyntaxKind.LexicalGoalAssertion
    | SyntaxKind.NoSymbolHereAssertion
    | SyntaxKind.ProseAssertion
    | SyntaxKind.InvalidAssertion
    ;

export function isAssertionKind(kind: SyntaxKind): kind is AssertionKind {
    return kind === SyntaxKind.EmptyAssertion
        || kind === SyntaxKind.LookaheadAssertion
        || kind === SyntaxKind.LexicalGoalAssertion
        || kind === SyntaxKind.NoSymbolHereAssertion
        || kind === SyntaxKind.ProseAssertion
        || kind === SyntaxKind.InvalidAssertion;
}

export type OptionalSymbolKind =
    | SyntaxKind.UnicodeCharacterLiteral
    | SyntaxKind.Terminal
    | SyntaxKind.Nonterminal
    ;

export function isOptionalSymbolKind(kind: SyntaxKind): kind is OptionalSymbolKind {
    return kind === SyntaxKind.UnicodeCharacterLiteral
        || kind === SyntaxKind.Terminal
        || kind === SyntaxKind.Nonterminal;
}

export type PrimarySymbolKind =
    | OptionalSymbolKind
    ;

export function isPrimarySymbolKind(kind: SyntaxKind): kind is PrimarySymbolKind {
    return isOptionalSymbolKind(kind);
}

export type LexicalSymbolKind =
    | PrimarySymbolKind
    | AssertionKind
    | SyntaxKind.PlaceholderSymbol
    | SyntaxKind.UnicodeCharacterRange
    | SyntaxKind.ButNotSymbol
    | SyntaxKind.Prose
    | SyntaxKind.OneOfSymbol
    | SyntaxKind.InvalidSymbol
    ;

export function isLexicalSymbolKind(kind: SyntaxKind): kind is LexicalSymbolKind {
    return isPrimarySymbolKind(kind)
        || isOptionalSymbolKind(kind)
        || kind === SyntaxKind.PlaceholderSymbol
        || kind === SyntaxKind.UnicodeCharacterRange
        || kind === SyntaxKind.ButNotSymbol
        || kind === SyntaxKind.Prose
        || kind === SyntaxKind.OneOfSymbol
        || kind === SyntaxKind.InvalidSymbol;
}

export type ProseFragmentKind =
    | ProseFragmentLiteralKind
    | SyntaxKind.Terminal
    | SyntaxKind.Nonterminal
    ;

export function isProseFragmentKind(kind: SyntaxKind): kind is ProseFragmentKind {
    return isProseFragmentLiteralKind(kind)
        || kind === SyntaxKind.Terminal
        || kind === SyntaxKind.Nonterminal;
}

export type ProductionBodyKind =
    | SyntaxKind.OneOfList
    | SyntaxKind.RightHandSide
    | SyntaxKind.RightHandSideList
    ;

export function isProductionBodyKind(kind: SyntaxKind): kind is ProductionBodyKind {
    return kind === SyntaxKind.OneOfList
        || kind === SyntaxKind.RightHandSide
        || kind === SyntaxKind.RightHandSideList;
}

export type MetaElementKind =
    | SyntaxKind.Import
    | SyntaxKind.Define
    | SyntaxKind.Line
    ;

export function isMetaElementKind(kind: SyntaxKind): kind is MetaElementKind {
    return kind === SyntaxKind.Import
        || kind === SyntaxKind.Define
        || kind === SyntaxKind.Line;
}

export type SourceElementKind =
    | MetaElementKind
    | SyntaxKind.Production
    ;

export function isSourceElementKind(kind: SyntaxKind): kind is SourceElementKind {
    return isMetaElementKind(kind)
        || kind === SyntaxKind.Production;
}

const textToToken = new Map<string, SyntaxKind>([
    ["@", SyntaxKind.AtToken],
    [":", SyntaxKind.ColonToken],
    ["::", SyntaxKind.ColonColonToken],
    [":::", SyntaxKind.ColonColonColonToken],
    ["{", SyntaxKind.OpenBraceToken],
    ["}", SyntaxKind.CloseBraceToken],
    ["(", SyntaxKind.OpenParenToken],
    [")", SyntaxKind.CloseParenToken],
    ["[", SyntaxKind.OpenBracketToken],
    ["[>", SyntaxKind.OpenBracketGreaterThanToken],
    ["]", SyntaxKind.CloseBracketToken],
    [">", SyntaxKind.GreaterThanToken],
    [",", SyntaxKind.CommaToken],
    ["+", SyntaxKind.PlusToken],
    ["~", SyntaxKind.TildeToken],
    ["?", SyntaxKind.QuestionToken],
    ["=", SyntaxKind.EqualsToken],
    ["==", SyntaxKind.EqualsEqualsToken],
    ["!=", SyntaxKind.ExclamationEqualsToken],
    ["≠", SyntaxKind.NotEqualToToken],
    ["<-", SyntaxKind.LessThanMinusToken],
    ["∈", SyntaxKind.ElementOfToken],
    ["<!", SyntaxKind.LessThanExclamationToken],
    ["∉", SyntaxKind.NotAnElementOfToken],
    ["but", SyntaxKind.ButKeyword],
    ["define", SyntaxKind.DefineKeyword],
    ["default", SyntaxKind.DefaultKeyword],
    ["empty", SyntaxKind.EmptyKeyword],
    ["false", SyntaxKind.FalseKeyword],
    ["goal", SyntaxKind.GoalKeyword],
    ["here", SyntaxKind.HereKeyword],
    ["import", SyntaxKind.ImportKeyword],
    ["lexical", SyntaxKind.LexicalKeyword],
    ["line", SyntaxKind.LineKeyword],
    ["lookahead", SyntaxKind.LookaheadKeyword],
    ["no", SyntaxKind.NoKeyword],
    ["not", SyntaxKind.NotKeyword],
    ["of", SyntaxKind.OfKeyword],
    ["one", SyntaxKind.OneKeyword],
    ["or", SyntaxKind.OrKeyword],
    ["through", SyntaxKind.ThroughKeyword],
    ["true", SyntaxKind.TrueKeyword],
]);

const tokenToText = new Map<SyntaxKind, string>([...textToToken]
    .map(([key, value]) => [value, key] as [SyntaxKind, string]));

export function stringToToken(text: string) {
    return textToToken.get(text);
}

/* @internal */
export function formatKind(kind: SyntaxKind) {
    return formatEnum(kind, SyntaxKind, /*isFlags*/ false);
}

export function tokenToString(kind: SyntaxKind | string, quoted?: boolean) {
    if (typeof kind === "string") {
        return kind;
    }

    const text = tokenToText.get(kind);
    if (text) {
        return quoted ? `'${text}'` : text;
    }

    switch (kind) {
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

    return "«" + formatKind(kind) + "»";
}