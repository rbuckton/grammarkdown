# grammarkdown

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

## Summary

`grammarkdown` is a markdown-style parser for syntactic grammars, designed to make it easily to rapidly prototype a grammar and statically verify its consistency.
The grammar supported by `grammarkdown` is based on the parametric grammar used by ECMA-262 (the JavaScript language standard).

## Usage
```
Syntax:                   grammarkdown [options] [...files]

Examples:                 grammarkdown es6.grammar
                          grammarkdown --out es6.md --format markdown es6.grammar

Options:
 -f, --format FORMAT      The output format.
 -h, --help               Prints this message.
     --noChecks           Does not perform static checking of the grammar.
     --noEmit             Does not emit output.
     --noEmitOnError      Does not emit output if there are errors.
 -o, --out FILE           Specify the output file.
 -v, --version            Prints the version.
```

## Syntax

A `grammarkdown` grammar file uses significant whitespace in the form of line terminators and indentation. Tab (ASCII 0x9) characters are preferred,
however using multiple spaces for indentation is supported as long as all nested elements have the same amount of leading whitespace.

#### Productions

A *Production* consists of a left-hand-side *Nonterminal* followed by a colon (`:`) separator and one or more *right-hand-side* sentences consisting of
various forms of *terminal* and *nonterminal* symbols. For example:

```
NameSpaceImport : `*` `as` ImportedBinding
```

It is recommended that *Productions* should follow pascal-case naming conventions, to avoid collision with reserved keywords.

You may specify multiple productions for a *Nonterminal* on multiple lines, as follows:

```
NamedImports : `{` `}`
NamedImports : `{` ImportList `}`
NamedImports : `{` ImportList `,` `}`
```

You may also specify multiple right-hand-side sentences for a single production by indenting them:

```
NamedImports :
    `{` `}`
    `{` ImportList `}`
    `{` ImportList `,` `}`
```

A *Production* may specify one or more *parameters* that can be used to reuse a *Nonterminal* in various circumstances:

```
IdentifierReference[Yield] :
    Identifier
    [~Yield] `yield`
```

A *Production* may also specify a limited set of terminals, by using the `one of` keyphrase:

```
Keyword :: one of
	`break`		`do`		`in`			`typeof`
	`case`		`else`		`instanceof`	`var`
	`catch`		`export`	`new`			`void`
	`class`		`extends`	`return`		`while`
	`const`		`finally`	`super`			`with`
	`continue`	`for`		`switch`		`yield`
	`debugger`	`function`	`this`
	`default`	`if`		`throw`
	`delete`	`import`	`try`
```

#### Parameters

If a *Nonterminal* on the right-hand-side of a production needs to set a parameter, they supply it in an argument list.
Supplying the name of the argument sets the parameter, prefixing the name with a question mark ('?) passes the current value of the parameter, and eliding the argument clears the parameter:

```
Declaration[Yield] :
	HoistableDeclaration[?Yield]
	ClassDeclaration[?Yield]
	LexicalDeclaration[In, ?Yield]
```

The right-hand-side of a *Production* consists of one or more *Terminal* or *Nonterminal* symbols, a sentence of *Prose*, or an *Assertion*.

#### Terminals

A *Terminal* symbol can be one of the following:

* A literal string of one or more characters enclosed in backticks ('\`'). For example: `` `function` ``
* A sequence of three backtick characters, which denotes a backtick token. For example: `` ``` ``
* A unicode character literal enclosed in a leading less-than ('<') character and a trailing greater-than ('>') character. For example: `<TAB>`

#### Nonterminals

A *Nonterminal* symbol is an identifier, followed by an optional argument list, and an optional question mark ('?'). The question mark changes the cardinality of the *Nonterminal* from "exactly one" to "zero or one".
The identifier may optionally be enclosed in `|` characters, if it happens to collide with a keyword.

#### Character Literals and Ranges

Character literals may be specified using one of the following forms:

* A Unicode code point, of the form `U+` followed by four to six non-lowercase hexadecimal digits with no leading zeros other than those necessary for padding to a minimum of four digits, in accordance with [The Unicode Standard, Version 15.0.0, Appendix A, Notational Conventions](https://www.unicode.org/versions/Unicode15.0.0/appA.pdf) (i.e., matching Unicode extended BNF pattern `"U+" ( [1-9 A-F] | "10" )? H H H H` or regular expression pattern `^U[+]([1-9A-F]|10)?[0-9A-F]{4}$` as in `U+00A0` or `U+1D306`).
* An abbreviation for a Unicode Code point, of the form `<NBSP>`
* The preceding representation followed by a space and a printable ASCII prose explanation (such as a character name) free of `<` and `>` and line terminators, all wrapped in `<` and `>` (i.e., matching Unicode extended BNF pattern `"<" "U+" ( [1-9 A-F] | "10" )? H H H H " " [\u0020-\u007E -- [<>]]+ ">"` or regular expression pattern `^<U[+]([1-9A-F]|10)?[0-9A-F]{4} [\x20-\x3b\x3d\x3f-\x7e]+>$` as in `<U+2212 MINUS SIGN>`)
* An abbreviation defined somewhere outside the grammar as an ASCII identifier name (i.e., matching Unicode extended BNF pattern `[A-Z a-z _] [A-Z a-z _ 0-9]*` or regular expression pattern `^[A-Za-z_][A-Za-z_0-9]*$` as in `<NBSP>`).

Character ranges may be specified using the `through` keyword:

```
    SourceCharacter but not one of `"` or `\` or U+0000 through U+001F
```

#### Prose

A sentence of *Prose* is a single line with a leading greater-than ('>') character. For example: `> any Unicode code point`

#### The `but not` Condition

The `but not` condition allows you to reference a production, excluding some part of that production. For example:

```
MultiLineNotAsteriskChar ::
	SourceCharacter but not `*`
```

Here, *MultiLineNotAsteriskChar* may contain any alternative from *SourceCharacter*, except the terminal `` `*` ``.

#### The `one of` Condition

You can exclude multiple alternatives by including a list of symbols to exclude through the use of the `one of` keyphrase.
Each entry in the list is separated by `or`:

```
MultiLineNotForwardSlashOrAsteriskChar ::
	SourceCharacter but not one of `/` or `*`
```

#### Assertions

An *Assertion* is a zero-width test that must evaluate successfully for the *Production* to be considered.
*Assertions* are enclosed in a leading open bracket ('\[') character and a trailing close-bracket ('\]') character.

The possible assertions include:

* The *empty assertion*, which matches exactly zero tokens: `[empty]`
* The *lookahead assertion*, which verifies the next tokens in the stream: ``[lookahead != `function`]``
* The *no-symbol-here assertion*, which verifies the next token is not the provided symbol: `[no LineTerminator here]`
* The *lexical-goal assertion*, which states that the current lexical goal is the supplied *Nonterminal*: `[lexical goal InputElementRegExp]`
* The *parameter assertion*, which states the supplied parameter to the current production is either set (using the plus ('+') character), or cleared (using the tilde ('~') character): `` [~Yield] `yield` ``
* The *prose assertion*, which allows for arbitrary prose, mixed with terminals and nonterminals: ``[> prose text `terminal` prose text |NonTerminal| prose text]``

A *lookahead assertion* has the following operators:

* The `==` operator states the lookahead phrase is matched: ``[lookahead == `class`]``
* The `!=` operator states the lookahead phrase is not matched: ``[lookahead != `function`]``
* The `<-` operator states that any matching phrase in the provided set is matched: ``[lookahead <- { `public`, `private` }]``
* The `<!` operator states that any matching phrase in the provided set is not matched: ``[lookahead <! { `{`, `function` }]``

#### Linking

During emit, `grammarkdown` implicitly adds a generated name for each *Production* and *Right-hand side* that can be used to
link directly to the production using a URI fragment. You can explicitly set the name for a production by tagging it with a custom link name:

```
Declaration[Yield] :
	HoistableDeclaration[?Yield]       #declaration-hoistable
	ClassDeclaration[?Yield]           #declaration-class
	LexicalDeclaration[In, ?Yield]     #declaration-lexical
```

#### Comments

You can also annotate your grammar with C-style single-line and multi-line comments.

#### Examples

For comprehensive examples of `grammarkdown` syntax and output, you can review the following samples:

* ECMA-262 version 2015 (ES6) Grammar
  * [Plain-text](https://github.com/rbuckton/grammarkdown/blob/master/spec/es6.grammar)
  * [HTML](https://rbuckton.github.io/grammarkdown/es6.html)
* TypeScript 1.5 Supplemental Grammar
  * [Plain-text](https://github.com/rbuckton/grammarkdown/blob/master/spec/typescript.grammar)
  * [HTML](https://rbuckton.github.io/grammarkdown/typescript.html)

## API

`grammarkdown` has an API that can be consumed:

```js
var grammarkdown = require("grammarkdown")
  , Grammar = grammarkdown.Grammar
  , EmitFormat = grammarkdown.EmitFormat

var filename = "...";
var source = "...";
var output;

// parse
var grammar = new Grammar(
  [filename],
  { format: EmitFormat.markdown },
  function () { return source; });

// bind (optional, bind happens automatically during check)
grammar.bind();

// check (optional, check happens automatically during emit)
grammar.check();

// emit
grammar.emit(undefined, function (file, text) { output = text; });

console.log(output);
```

## Related

* [ecmarkup](https://bterlson.github.io/ecmarkup)

[npm-image]: https://img.shields.io/npm/v/grammarkdown.svg
[npm-url]: https://npmjs.org/package/grammarkdown

[travis-image]: https://travis-ci.org/rbuckton/grammarkdown.svg?branch=master
[travis-url]: https://travis-ci.org/rbuckton/grammarkdown
