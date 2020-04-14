---
uid: 'grammarkdown!'
title: API Reference
---

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
grammar.bindSync();

// check (optional, check happens automatically during emit)
grammar.checkSync();

// emit
grammar.emitSync(undefined, function (file, text) { output = text; });

console.log(output);
```