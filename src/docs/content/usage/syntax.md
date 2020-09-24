## Syntax

A `grammarkdown` grammar file uses significant whitespace in the form of line terminators and indentation. Tab (ASCII 0x9) characters are preferred,
however using multiple spaces for indentation is supported as long as all nested elements have the same amount of leading whitespace.

#### Productions

A *Production* consists of a left-hand-side *Nonterminal* followed by a colon (`:`) separator and one or more *right-hand-side* sentences consisting of
various forms of *terminal* and *nonterminal* symbols. For example:

```grammarkdown
NameSpaceImport : `*` `as` ImportedBinding
```

It is recommended that *Productions* should follow pascal-case naming conventions, to avoid collision with reserved keywords.

You may specify multiple productions for a *Nonterminal* on multiple lines, as follows:

```grammarkdown
NamedImports : `{` `}`
NamedImports : `{` ImportList `}`
NamedImports : `{` ImportList `,` `}`
```

You may also specify multiple left-hand-side sentences for a single production by indenting them:

```grammarkdown
NamedImports :
    `{` `}`
    `{` ImportList `}`
    `{` ImportList `,` `}`
```

A *Production* may specify one or more *parameters* that can be used to reuse a *Nonterminal* in various circumstances:

```grammarkdown
IdentifierReference[Yield] :
    Identifier
    [~Yield] `yield`
```

A *Production* may also specify a limited set of terminals, by using the `one of` keyphrase:

```grammarkdown
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

*Productions* in Grammarkdown can be parametric, allowing you to define syntax that can be conditionally modified by passing arguments. To pass an argument to a *Production*, you must provide
the name of a *Parameter* in a bracketed argument list. *Parameters* are both positional and named, so to provide an argument you must supply the name of the argument along with one of the following
prefixes:

- `+` - Indicates the named parameter is *set* in the referenced production. For example: `+In`
- `~` - Indicates the named parameter is *unset* in the referenced production. For example: `~Async`
- `?` - Indicates the current state of the named parameter is used in the referenced production. For example: `?Yield`

```grammarkdown
Declaration[Yield] :
	HoistableDeclaration[?Yield]
	ClassDeclaration[?Yield]
	LexicalDeclaration[+In, ?Yield]
```

### Right-Hand-Sides

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

* An abbreviation for a Unicode Code point, of the form `<NBSP>`
* A Unicode code point, of the form `U+00A0`

Character ranges may be specified using the `through` keyword:

```grammarkdown
    SourceCharacter but not one of `"` or `\` or U+0000 through U+001F
```

#### Prose

A sentence of *Prose* is a single line with a leading greater-than ('>') character. For example:

```grammarkdown
> any Unicode code point
```

#### The `but not` Condition

The `but not` condition allows you to reference a production, excluding some part of that production. For example:

```grammarkdown
MultiLineNotAsteriskChar ::
	SourceCharacter but not `*`
```

Here, *MultiLineNotAsteriskChar* may contain any alternative from *SourceCharacter*, except the terminal `` `*` ``.

#### The `one of` Condition

You can exclude multiple alternatives by including a list of symbols to exclude through the use of the `one of` keyphrase.
Each entry in the list is separated by `or`:

```grammarkdown
MultiLineNotForwardSlashOrAsteriskChar ::
	SourceCharacter but not one of `/` or `*`
```

#### Constraint

A *Constraint* is a zero-width test at the start of a right-hand-side that indicates that the right-hand-side is only matched
when the specified *Parameter* is either *set* (using the `+` prefix), or *unset* (using the `~` prefix). For example:

```grammarkdown
[~Yield] `yield`
```

#### Assertions

An *Assertion* is a zero-width test that must evaluate successfully for the *Production* to be considered.
*Assertions* are enclosed in a leading open bracket ('\[') character and a trailing close-bracket ('\]') character.

The possible assertions include:

* The *empty assertion*, which matches exactly zero tokens: `[empty]`
* The *lookahead assertion*, which verifies the next tokens in the stream: ``[lookahead != `function`]``
* The *no-symbol-here assertion*, which verifies the next token is not the provided symbol: `[no LineTerminator here]`
* The *lexical-goal assertion*, which states that the current lexical goal is the supplied *Nonterminal*: `[lexical goal InputElementRegExp]`
* The *prose assertion*, which allows for arbitrary prose, mixed with terminals and nonterminals: ``[> prose text `terminal` prose text |NonTerminal| prose text]``

A *lookahead assertion* has the following operators:

* The `==` operator states the lookahead phrase is matched: ``[lookahead == `class`]``
* The `!=` operator states the lookahead phrase is not matched: ``[lookahead != `function`]``
* The `<-` operator states that any matching phrase in the provided set is matched: ``[lookahead <- { `public`, `private` }]``
* The `<!` operator states that any matching phrase in the provided set is not matched: ``[lookahead <! { `{`, `function` }]``

#### Linking

During emit, `grammarkdown` implicitly adds a generated name for each *Production* and *Right-hand side* that can be used to
link directly to the production using a URI fragment. You can explicitly set the name for a production by tagging it with a custom link name:

```grammarkdown
Declaration[Yield] :
	HoistableDeclaration[?Yield]       #declaration-hoistable
	ClassDeclaration[?Yield]           #declaration-class
	LexicalDeclaration[In, ?Yield]     #declaration-lexical
```

#### Comments

You can also annotate your grammar with C-style single-line and multi-line comments.

#### `@`-Directives

Grammarkdown provides several directives for customizing the behavior of the grammar checker from within the grammar file itself:

- `@import "path"` - Import another grammar.
- `@define <setting> <value>` - Override a limited set of grammar options.
	- `setting` can be:
		- `noStrictParametricProductions` - Disables strict checking of parameters.
		- `noUnusedParameters` - Determines whether to report errors when parameters are unused.
	- `value` can be:
		- `true` - Sets the provided setting to `true`.
		- `false` - Sets the provided setting to `false`.
		- `default` - Sets the provided setting to the value provided in the grammar options.
- `@line <number> ["path"]` or `@line default` - Changes the grammar checker to report errors using the provided line number and path, or resets line numbering to the current line number in the file.

#### Examples

For comprehensive examples of `grammarkdown` syntax and output, you can review the following samples:

* ECMA-262 version 2020 (ES2020) Grammar
  * [Plain-text](https://github.com/rbuckton/grammarkdown/blob/master/spec/es2020.grammar)
  * [HTML](https://rbuckton.github.io/grammarkdown/es2020.html)
* ECMA-262 version 2015 (ES6) Grammar
  * [Plain-text](https://github.com/rbuckton/grammarkdown/blob/master/spec/es6.grammar)
  * [HTML](https://rbuckton.github.io/grammarkdown/es6.html)
* TypeScript 1.5 Supplemental Grammar
  * [Plain-text](https://github.com/rbuckton/grammarkdown/blob/master/spec/typescript.grammar)
  * [HTML](https://rbuckton.github.io/grammarkdown/typescript.html)
