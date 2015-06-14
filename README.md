# grammarkdown

## Summary

`grammarkdown` is a markdown-style parser for syntactic grammars, designed to make it easily to rapidly prototype a grammar and statically verify its consistency. 
The grammar supported by `grammarkdown` is based on the parametric grammar used by ECMA-262 (the JavaScript language standard).

## Usage
```
Syntax:   grammarkdown [options] [file]

Examples: grammarkdown es6.grammar
          grammarkdown --out es6.md --format markdown es6.grammar

Options:
 -h, --help                       Print this message.
 -v, --version                    Print the version.
 -o, --out FILE                   Specify the output file. If multiple formats are provided, their 
                                  relevant extensions will be appended to the end of the file.
 -f, --format FORMAT              One or more output formats: 'markdown' (default) or 'ecmarkup'.
 --no-emit                        Does not emit output.
 --no-emit-on-error               Does not emit output if there are errors.
 --no-checks                      Does not perform static checking of the grammar.
 --md                             Shortcut for: --format markdown
```

## Syntax

A `grammarkdown` grammar file uses significant whitespace in the form of line terminators and indentation. Tab (ASCII 0x9) characters are preferred, 
however using multiple spaces for indentation is supported as long as all nested elements have the same amount of leading whitespace.

A *Production* consists of a left-hand-side *Nonterminal* followed by a colon (`:`) separator and one or more *right-hand-side* sentances consisting of
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

You may also specify multiple left-hand-side sentances for a single production by indenting them:

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

If a *Nonterminal* on the right-hand-side of a production needs to set a parameter, they supply it in an argument list. 
Supplying the name of the argument sets the parameter, prefixing the name with a question mark ('?) passes the current value of the parameter, and eliding the argument clears the parameter:

```
Declaration[Yield] :
	HoistableDeclaration[?Yield]
	ClassDeclaration[?Yield]
	LexicalDeclaration[In, ?Yield]
```

The right-hand-side of a *Production* consists of one or more *Terminal* or *Nonterminal* symbols, a sentance of *Prose*, or an *Assertion*.   

A *Terminal* symbol can be one of the following:

* A literal string of one or more characters enclosed in backticks ('\`'). For example: `` `function` ``
* A sequence of three backtick characters, which denotes a backtick token. For example: `` ``` ``
* A unicode character literal enclosed in a leading less-than ('<') character and a trailing greater-than ('>') character. For example: `<TAB>`

A *Nonterminal* symbol is an identifier, followed by an optional argument list, and an optional question mark ('?'). The question mark changes the cardinality of the *Nonterminal* from "exactly one" to "zero or one".  

A sentance of *Prose* is a single line with a leading greater-than ('>') character. For example: `> any Unicode code point`

An *Assertion* is a zero-width assertion that must evaluate successfully for the *Production* to be considered. 
*Assertions* are enclosed in a leading open bracket ('\[') character and a trailing close-bracket ('\]') character.  

The possible assertions include:

* The *empty assertion*, which matches exactly zero tokens: `[empty]`
* The *lookahead assertion*, which verifies the next tokens in the stream: ``[lookahead != `function`]``
* The *no-symbol-here assertion*, which verifies the next token is not the provided symbol: `[no LineTerminator here]`
* The *lexical-goal assertion*, which states that the current lexical goal is the supplied *Nonterminal*: `[lexical goal InputElementRegExp]`
* The *parameter assertion*, which states the supplied parameter to the current production is either set (using the plus ('+') character), or cleared (using the tilde ('~') character): `` [~Yield] `yield` ``    

A *lookahead assertion* has the following operators:

* The `!=` operator states the lookahead phrase is not matched: ``[lookahead != `function`]``
* The `==` operator states the lookahead phrase is matched: ``[lookahead == `class`]``
* The `<!` operator states that any matching phrase in the provided set is not matched: ``[lookahead <! { `{`, `function` }]``  
* The `<=` operator states that any matching phrase in the provided set is matched: ``[lookahead <- { `public`, `private` }]``

You can also annotate your grammar with C-style single-line and multi-line comments.

For a comprehensive example of `grammarkdown` syntax, you can brows the [full grammar for ECMA-262 version 2015 (ES6)](https://github.com/rbuckton/grammarkdown/blob/master/tests/resources/es6.grammar).

## API

`grammarkdown` has an API that can be consumed:

```js
var grammarkdown = require("grammarkdown")
  , DiagnosticMessages = grammarkdown.DiagnosticMessages
  , Parser = grammarkdown.Parser
  , BindingTable = grammarkdown.BindingTable
  , Binder = grammarkdown.Binder
  , Checker = grammarkdown.Checker
  , MarkdownEmitter = grammarkdown.MarkdownEmitter
  , StringWriter = grammarkdown.StringWriter;
  
var filename = "...";
var source = "...";
var diagnostics = new DiagnosticMessages();

// parse
var parser = new Parser(diagnostics);
var sourceFile = parser.parseSourceFile(file, source);

// bind
var bindings = new BindingTable();
var binder = new Binder(bindings);
binder.bindSourceFile(sourceFile);

// check
var checker = new Checker(bindings, diagnostics);
checker.checkSourceFile(sourceFile);

// emit
var writer = new StringWriter();
var emitter = new MarkdownEmitter(checker, diagnostics, writer);
emitter.emitSourceFile(sourceFile);

console.log(writer.toString());
```

## Related

* [ecmarkup](https://bterlson.github.io/ecmarkup)