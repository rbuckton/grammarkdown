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
 
import { SyntaxKind, Dict, forEachEntry, hasOwnProperty } from "./core";

var textToToken: Dict<SyntaxKind> = Dict.create({
    "but": SyntaxKind.ButKeyword,
    "not": SyntaxKind.NotKeyword,
    "empty": SyntaxKind.EmptyKeyword,
    "lexical": SyntaxKind.LexicalKeyword,
    "goal": SyntaxKind.GoalKeyword,
    "lookahead": SyntaxKind.LookaheadKeyword,
    "one": SyntaxKind.OneKeyword,
    "of": SyntaxKind.OfKeyword,
    "no": SyntaxKind.NoKeyword,
    "here": SyntaxKind.HereKeyword,
    "or": SyntaxKind.OrKeyword,
    ":": SyntaxKind.ColonToken,
    "::": SyntaxKind.ColonColonToken,
    ":::": SyntaxKind.ColonColonColonToken,
    "{": SyntaxKind.OpenBraceToken,
    "}": SyntaxKind.CloseBraceToken,
    "(": SyntaxKind.OpenParenToken,
    ")": SyntaxKind.CloseParenToken,
    "[": SyntaxKind.OpenBracketToken,
    "]": SyntaxKind.CloseBracketToken,
    ",": SyntaxKind.CommaToken,
    "+": SyntaxKind.PlusToken,
    "~": SyntaxKind.TildeToken,
    "?": SyntaxKind.QuestionToken,
    "=": SyntaxKind.EqualsToken,
    "==": SyntaxKind.EqualsEqualsToken,
    "!=": SyntaxKind.ExclamationEqualsToken,
    "<!": SyntaxKind.LessThanExclamationToken,
    "<-": SyntaxKind.LessThanMinusToken,
});

var tokenToText: string[] = [];
forEachEntry(textToToken, (token, text) => {
    tokenToText[token] = text;
});

export function stringToToken(text: string) {
    return Dict.get(textToToken, text);
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
        case SyntaxKind.UnicodeCharacter:
            return "«prose»";
        case SyntaxKind.Production:
            return "«production»";
        case SyntaxKind.OneOfList:
            return "«one of»";
        case SyntaxKind.RightHandSide:
            return "«right hand side»";
    }
    return "«" + kind + "»";
}