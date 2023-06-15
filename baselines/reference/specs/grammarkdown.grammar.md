&emsp;&emsp;<a name="SourceCharacter"></a>*SourceCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SourceCharacter-xks4vqzw"></a>any Unicode code point  
  
&emsp;&emsp;<a name="LineTerminator"></a>*LineTerminator* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminator-eznvjwhz"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-q1yr1eki"></a>&lt;CR&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-eaiqsw9w"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-z8h10fxn"></a>&lt;PS&gt;  
  
&emsp;&emsp;<a name="LineTerminatorSequence"></a>*LineTerminatorSequence* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-eznvjwhz"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-hiltsszk"></a>&lt;CR&gt;&emsp;[lookahead ≠ &lt;LF&gt;]  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-eaiqsw9w"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-z8h10fxn"></a>&lt;PS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-lajs7kyd"></a>&lt;CR&gt;&emsp;&lt;LF&gt;  
  
&emsp;&emsp;<a name="IdentifierName"></a>*IdentifierName* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierName-q0afq8g8"></a>*[IdentifierStart](#IdentifierStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierName-cawc7ktu"></a>*[IdentifierName](#IdentifierName)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="IdentifierStart"></a>*IdentifierStart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierStart-cgljdgmz"></a>*[UnicodeIDStart](#UnicodeIDStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierStart-b1zllonv"></a>`` _ ``  
  
&emsp;&emsp;<a name="IdentifierPart"></a>*IdentifierPart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierPart-nkrgdqi0"></a>*[UnicodeIDContinue](#UnicodeIDContinue)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-b1zllonv"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-ynldexir"></a>&lt;ZWNJ&gt;  
&emsp;&emsp;&emsp;<a name="IdentifierPart-zfgp9vws"></a>&lt;ZWJ&gt;  
  
&emsp;&emsp;<a name="UnicodeIDStart"></a>*UnicodeIDStart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDStart-0uivrwr2"></a>any Unicode code point with the Unicode property "ID_Start" or "Other_ID_Start"  
  
&emsp;&emsp;<a name="UnicodeIDContinue"></a>*UnicodeIDContinue* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDContinue-dc1rjkto"></a>any Unicode code point with the Unicode property "ID_Continue" or "Other_ID_Continue", or "Other_ID_Start"  
  
&emsp;&emsp;<a name="ReservedWord"></a>*ReservedWord* **::**  
&emsp;&emsp;&emsp;<a name="ReservedWord-o5jua5_x"></a>*[Keyword](#Keyword)*  
  
&emsp;&emsp;<a name="Keyword"></a>*Keyword* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>empty</code>     <code>lookahead</code> <code>lexical</code>   <code>goal</code>      <code>no</code>  
&emsp;&emsp;&emsp;<code>here</code>      <code>one</code>       <code>of</code>        <code>or</code>        <code>but</code>  
&emsp;&emsp;&emsp;<code>not</code></pre>
  
&emsp;&emsp;<a name="DecimalDigit"></a>*DecimalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="HexDigits"></a>*HexDigits* **::**  
&emsp;&emsp;&emsp;<a name="HexDigits-omskcs0d"></a>*[HexDigit](#HexDigit)*  
&emsp;&emsp;&emsp;<a name="HexDigits-yciymy2l"></a>*[HexDigits](#HexDigits)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="HexDigit"></a>*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code>  
&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>  
&emsp;&emsp;&emsp;<code>E</code>     <code>F</code></pre>
  
&emsp;&emsp;<a name="NonZeroHexDigit"></a>*NonZeroHexDigit* **::**  
&emsp;&emsp;&emsp;<a name="NonZeroHexDigit-vkht0l2b"></a>*[HexDigit](#HexDigit)* **but not** `` 0 ``  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteral"></a>*UnicodeCharacterLiteral* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-60pqswpp"></a>`` < ``&emsp;*[UnicodeCharacterLiteralChars](#UnicodeCharacterLiteralChars)*&emsp;`` > ``  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-qndmauba"></a>`` U+ ``&emsp;*[UnicodeCharacterLiteralHexDigits](#UnicodeCharacterLiteralHexDigits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-jyzae20u"></a>`` u+ ``&emsp;*[UnicodeCharacterLiteralHexDigits](#UnicodeCharacterLiteralHexDigits)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits"></a>*UnicodeCharacterLiteralHexDigits* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-pptelolr"></a>*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-7snh6qvu"></a>*[NonZeroHexDigit](#NonZeroHexDigit)*&emsp;*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-7cudep2z"></a>`` 10 ``&emsp;*[Hex4Digits](#Hex4Digits)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralChars"></a>*UnicodeCharacterLiteralChars* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChars-oo12fh_i"></a>*[UnicodeCharacterLiteralChar](#UnicodeCharacterLiteralChar)*&emsp;*[UnicodeCharacterLiteralChars](#UnicodeCharacterLiteralChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralChar"></a>*UnicodeCharacterLiteralChar* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChar-8ognh64m"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` < `` **or** `` > `` **or** `` \ `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChar-6n2njt_x"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChar-ajkpm2ja"></a>*[LineContinuation](#LineContinuation)*  
  
&emsp;&emsp;<a name="LineContinuation"></a>*LineContinuation* **::**  
&emsp;&emsp;&emsp;<a name="LineContinuation-xik9y9lz"></a>`` \ ``&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*  
  
&emsp;&emsp;<a name="EscapeSequence"></a>*EscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="EscapeSequence-6ehvb3kw"></a>*[CharacterEscapeSequence](#CharacterEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="EscapeSequence-awshns7m"></a>`` 0 ``&emsp;[lookahead ∉ *[DecimalDigit](#DecimalDigit)*]  
&emsp;&emsp;&emsp;<a name="EscapeSequence-qacbhaps"></a>*[HexEscapeSequence](#HexEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="EscapeSequence-rl1vvdtr"></a>*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
  
&emsp;&emsp;<a name="CharacterEscapeSequence"></a>*CharacterEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="CharacterEscapeSequence-desdj6ig"></a>*[SingleEscapeCharacter](#SingleEscapeCharacter)*  
&emsp;&emsp;&emsp;<a name="CharacterEscapeSequence-t5gkmnte"></a>*[NonEscapeCharacter](#NonEscapeCharacter)*  
  
&emsp;&emsp;<a name="SingleEscapeCharacter"></a>*SingleEscapeCharacter* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>&apos;</code>     <code>&quot;</code>     <code>\</code>     <code>b</code>     <code>f</code>     <code>n</code>     <code>r</code>     <code>t</code>     <code>v</code></pre>
  
&emsp;&emsp;<a name="NonEscapeCharacter"></a>*NonEscapeCharacter* **::**  
&emsp;&emsp;&emsp;<a name="NonEscapeCharacter-g6xhj53i"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** *[EscapeCharacter](#EscapeCharacter)* **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="EscapeCharacter"></a>*EscapeCharacter* **::**  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-desdj6ig"></a>*[SingleEscapeCharacter](#SingleEscapeCharacter)*  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-s4me4hlz"></a>*[DecimalDigit](#DecimalDigit)*  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-fqodqad9"></a>`` x ``  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-jc5mvt_f"></a>`` u ``  
  
&emsp;&emsp;<a name="HexEscapeSequence"></a>*HexEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="HexEscapeSequence-2o-xpa4a"></a>`` x ``&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="UnicodeEscapeSequence"></a>*UnicodeEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeEscapeSequence-ghktjvoi"></a>`` u ``&emsp;*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeEscapeSequence-va21h0xq"></a>`` u{ ``&emsp;*[HexDigits](#HexDigits)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="Hex4Digits"></a>*Hex4Digits* **::**  
&emsp;&emsp;&emsp;<a name="Hex4Digits-c6jeysfq"></a>*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="Indent"></a>*Indent* **::**  
&emsp;&emsp;&emsp;<a name="Indent-4e0izqku"></a>An increase in the indentation depth from the previous line.  
  
&emsp;&emsp;<a name="Dedent"></a>*Dedent* **::**  
&emsp;&emsp;&emsp;<a name="Dedent-maowseza"></a>A decrease in the indentation depth from the previous line.  
  
&emsp;&emsp;<a name="Terminal"></a>*Terminal* **::**  
&emsp;&emsp;&emsp;<a name="Terminal-is2937ur"></a>`` ` ``&emsp;`` ` ``&emsp;`` ` ``  
&emsp;&emsp;&emsp;<a name="Terminal-jcw57e9m"></a>`` ` ``&emsp;*[TerminalChars](#TerminalChars)*&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TerminalChars"></a>*TerminalChars* **::**  
&emsp;&emsp;&emsp;<a name="TerminalChars-z8cufjel"></a>*[TerminalChar](#TerminalChar)*&emsp;*[TerminalChars](#TerminalChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TerminalChar"></a>*TerminalChar* **::**  
&emsp;&emsp;&emsp;<a name="TerminalChar-lbu9_s-b"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Prose"></a>*Prose* **::**  
&emsp;&emsp;&emsp;<a name="Prose-pnxhiuaa"></a>*[ProseLines](#ProseLines)*  
  
&emsp;&emsp;<a name="ProseLines"></a>*ProseLines* **::**  
&emsp;&emsp;&emsp;<a name="ProseLines-woqw5wcn"></a>*[ProseLine](#ProseLine)*  
&emsp;&emsp;&emsp;<a name="ProseLines-f4rjmond"></a>*[ProseLine](#ProseLine)*&emsp;*[LineTerminator](#LineTerminator)*&emsp;*[ProseLines](#ProseLines)*  
  
&emsp;&emsp;<a name="ProseLine"></a>*ProseLine* **::**  
&emsp;&emsp;&emsp;<a name="ProseLine-ows5lsia"></a>`` > ``&emsp;*[ProseChars](#ProseChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ProseChars"></a>*ProseChars* **::**  
&emsp;&emsp;&emsp;<a name="ProseChars-alfclf2w"></a>*[ProseChar](#ProseChar)*&emsp;*[ProseChars](#ProseChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ProseChar"></a>*ProseChar* **::**  
&emsp;&emsp;&emsp;<a name="ProseChar-lvvfp8iw"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Identifier"></a>*Identifier* **:**  
&emsp;&emsp;&emsp;<a name="Identifier-v6xddc2h"></a>*[IdentifierName](#IdentifierName)* **but not** *[ReservedWord](#ReservedWord)*  
  
&emsp;&emsp;<a name="Argument"></a>*Argument* **:**  
&emsp;&emsp;&emsp;<a name="Argument-bras6mo_"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments* **:**  
&emsp;&emsp;&emsp;<a name="Arguments-eormm5tk"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="Arguments-i0-5a5el"></a>`` ( ``&emsp;*[ArgumentList](#ArgumentList)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ArgumentList"></a>*ArgumentList* **:**  
&emsp;&emsp;&emsp;<a name="ArgumentList-zl5xkul_"></a>*[Argument](#Argument)*  
&emsp;&emsp;&emsp;<a name="ArgumentList-wbwlats7"></a>*[ArgumentList](#ArgumentList)*&emsp;`` , ``&emsp;*[Argument](#Argument)*  
  
&emsp;&emsp;<a name="PrimarySymbol"></a>*PrimarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-ofus3lpy"></a>*[Terminal](#Terminal)*  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-et-jcbuk"></a>*[UnicodeCharacterLiteral](#UnicodeCharacterLiteral)*  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-albg-zcu"></a>*[Nonterminal](#Nonterminal)*  
  
&emsp;&emsp;<a name="Nonterminal"></a>*Nonterminal* **:**  
&emsp;&emsp;&emsp;<a name="Nonterminal-lnyy3waz"></a>*[Identifier](#Identifier)*&emsp;*[Arguments](#Arguments)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="OptionalSymbol"></a>*OptionalSymbol* **:**  
&emsp;&emsp;&emsp;<a name="OptionalSymbol-bccimhkg"></a>*[PrimarySymbol](#PrimarySymbol)*&emsp;`` ? ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="OrClause"></a>*OrClause* **:**  
&emsp;&emsp;&emsp;<a name="OrClause-pyd5rjuf"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="OrClause-ach7eup_"></a>*[OrClause](#OrClause)*&emsp;`` or ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="OneOfSymbol"></a>*OneOfSymbol* **:**  
&emsp;&emsp;&emsp;<a name="OneOfSymbol-pyd5rjuf"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="OneOfSymbol-xxnuftsv"></a>`` one ``&emsp;`` of ``&emsp;*[OrClause](#OrClause)*  
  
&emsp;&emsp;<a name="UnarySymbol"></a>*UnarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="UnarySymbol-hqtcclln"></a>*[OneOfSymbol](#OneOfSymbol)*  
  
&emsp;&emsp;<a name="ButNotSymbol"></a>*ButNotSymbol* **:**  
&emsp;&emsp;&emsp;<a name="ButNotSymbol-e0angx0t"></a>*[UnarySymbol](#UnarySymbol)*&emsp;`` but ``&emsp;`` not ``&emsp;*[UnarySymbol](#UnarySymbol)*  
  
&emsp;&emsp;<a name="BinarySymbol"></a>*BinarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="BinarySymbol-cr_bba3k"></a>*[ButNotSymbol](#ButNotSymbol)*  
&emsp;&emsp;&emsp;<a name="BinarySymbol-qzyma0vr"></a>*[UnarySymbol](#UnarySymbol)*  
  
&emsp;&emsp;<a name="SymbolList"></a>*SymbolList* **:**  
&emsp;&emsp;&emsp;<a name="SymbolList-pyd5rjuf"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="SymbolList-rd0i2fsc"></a>*[SymbolList](#SymbolList)*&emsp;`` , ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="SymbolSet"></a>*SymbolSet* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSet-p0bczfyr"></a>`` { ``&emsp;*[SymbolList](#SymbolList)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="EmptyAssertionClause"></a>*EmptyAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="EmptyAssertionClause-pvkpaovp"></a>`` empty ``  
  
&emsp;&emsp;<a name="LookaheadEqualsAssertionClause"></a>*LookaheadEqualsAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadEqualsAssertionClause-bztc4vjc"></a>`` lookahead ``&emsp;`` == ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause"></a>*LookaheadNotEqualsAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause-ia_lwidb"></a>`` lookahead ``&emsp;`` != ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadInAssertionClause"></a>*LookaheadInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadInAssertionClause-0hqgcnwj"></a>`` lookahead ``&emsp;`` <- ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadNotInAssertionClause"></a>*LookaheadNotInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotInAssertionClause-f13ybrfp"></a>`` lookahead ``&emsp;`` <! ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadAssertionClause"></a>*LookaheadAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-6kw2gsod"></a>*[LookaheadEqualsAssertionClause](#LookaheadEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-qnalyzwm"></a>*[LookaheadNotEqualsAssertionClause](#LookaheadNotEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-taejfmwk"></a>*[LookaheadInAssertionClause](#LookaheadInAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-vmr8b1wa"></a>*[LookaheadNotInAssertionClause](#LookaheadNotInAssertionClause)*  
  
&emsp;&emsp;<a name="NoSymbolAssertionClause"></a>*NoSymbolAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="NoSymbolAssertionClause-k9pnaevx"></a>`` no ``&emsp;*[OrClause](#OrClause)*&emsp;`` here ``  
  
&emsp;&emsp;<a name="LexicalGoalAssertionClause"></a>*LexicalGoalAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LexicalGoalAssertionClause-dd_vvq2z"></a>`` lexical ``&emsp;`` goal ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="ParameterValueAssertionClause"></a>*ParameterValueAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="ParameterValueAssertionClause-dwxa7c0h"></a>`` ~ ``&emsp;*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="ParameterValueAssertionClause-qyr5b2v0"></a>`` + ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="AssertionClause"></a>*AssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="AssertionClause-z3-vy0_t"></a>*[EmptyAssertionClause](#EmptyAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-ljiirtvv"></a>*[LookaheadAssertionClause](#LookaheadAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-ncisqmtk"></a>*[NoSymbolAssertionClause](#NoSymbolAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-fzqqffgp"></a>*[LexicalGoalAssertionClause](#LexicalGoalAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-g6tlzimv"></a>*[ParameterValueAssertionClause](#ParameterValueAssertionClause)*  
  
&emsp;&emsp;<a name="Assertion"></a>*Assertion* **:**  
&emsp;&emsp;&emsp;<a name="Assertion-ofao6yda"></a>`` [ ``&emsp;*[AssertionClause](#AssertionClause)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ProseSpan"></a>*ProseSpan* **:**  
&emsp;&emsp;&emsp;<a name="ProseSpan-cx0hfwg8"></a>*[Prose](#Prose)*  
&emsp;&emsp;&emsp;<a name="ProseSpan-ro0tsqu_"></a>*[ProseSpan](#ProseSpan)*&emsp;*[LineTerminator](#LineTerminator)*&emsp;*[Prose](#Prose)*  
  
&emsp;&emsp;<a name="Symbol"></a>*Symbol* **:**  
&emsp;&emsp;&emsp;<a name="Symbol-4d3cub6p"></a>*[Assertion](#Assertion)*  
&emsp;&emsp;&emsp;<a name="Symbol-2zwilala"></a>*[BinarySymbol](#BinarySymbol)*  
  
&emsp;&emsp;<a name="SymbolSpan"></a>*SymbolSpan* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpan-6vm8k_ys"></a>*[ProseSpan](#ProseSpan)*  
&emsp;&emsp;&emsp;<a name="SymbolSpan-avztmrvm"></a>*[SymbolSpanRest](#SymbolSpanRest)*  
  
&emsp;&emsp;<a name="SymbolSpanRest"></a>*SymbolSpanRest* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpanRest-8uqt4hoo"></a>*[Symbol](#Symbol)*&emsp;*[SymbolSpanRest](#SymbolSpanRest)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSideList"></a>*RightHandSideList* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSideList-nolbdbjn"></a>*[RightHandSide](#RightHandSide)*&emsp;*[RightHandSideList](#RightHandSideList)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSide"></a>*RightHandSide* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSide-ixmdjeqh"></a>*[SymbolSpan](#SymbolSpan)*&emsp;*[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Terminals"></a>*Terminals* **:**  
&emsp;&emsp;&emsp;<a name="Terminals-gk1eqqdx"></a>*[Terminal](#Terminal)*&emsp;*[Terminals](#Terminals)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TerminalList"></a>*TerminalList* **:**  
&emsp;&emsp;&emsp;<a name="TerminalList-gusliiae"></a>*[Terminals](#Terminals)*  
&emsp;&emsp;&emsp;<a name="TerminalList-qf65uuyc"></a>*[TerminalList](#TerminalList)*&emsp;*[LineTerminator](#LineTerminator)*&emsp;*[Terminals](#Terminals)*  
  
&emsp;&emsp;<a name="OneOfList"></a>*OneOfList* **:**  
&emsp;&emsp;&emsp;<a name="OneOfList--ih0ncgp"></a>`` one ``&emsp;`` of ``&emsp;*[Terminals](#Terminals)*  
&emsp;&emsp;&emsp;<a name="OneOfList-pgmvglzt"></a>`` one ``&emsp;`` of ``&emsp;*[LineTerminator](#LineTerminator)*&emsp;*[Indent](#Indent)*&emsp;*[TerminalList](#TerminalList)*&emsp;*[Dedent](#Dedent)*  
  
&emsp;&emsp;<a name="Parameter"></a>*Parameter* **:**  
&emsp;&emsp;&emsp;<a name="Parameter-bras6mo_"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ParameterList"></a>*ParameterList* **:**  
&emsp;&emsp;&emsp;<a name="ParameterList-9pnylewu"></a>*[Parameter](#Parameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-enfn1fax"></a>*[ParameterList](#ParameterList)*&emsp;`` , ``&emsp;*[Parameter](#Parameter)*  
  
&emsp;&emsp;<a name="Parameters"></a>*Parameters* **:**  
&emsp;&emsp;&emsp;<a name="Parameters-n-ahepcg"></a>`` ( ``&emsp;*[ParameterList](#ParameterList)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="Production"></a>*Production* **:**  
&emsp;&emsp;&emsp;<a name="Production-0gqocmed"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[OneOfList](#OneOfList)*  
&emsp;&emsp;&emsp;<a name="Production-vhjnckof"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[RightHandSide](#RightHandSide)*  
&emsp;&emsp;&emsp;<a name="Production-e-zpzl_w"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[LineTerminator](#LineTerminator)*&emsp;*[Indent](#Indent)*&emsp;*[RightHandSideList](#RightHandSideList)*&emsp;*[Dedent](#Dedent)*  
  
&emsp;&emsp;<a name="SourceElement"></a>*SourceElement* **:**  
&emsp;&emsp;&emsp;<a name="SourceElement-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="SourceElement-33d8ezht"></a>*[Production](#Production)*  
  
&emsp;&emsp;<a name="SourceElements"></a>*SourceElements* **:**  
&emsp;&emsp;&emsp;<a name="SourceElements-pgyhgrp-"></a>*[SourceElement](#SourceElement)*&emsp;*[SourceElements](#SourceElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SourceFile"></a>*SourceFile* **:**  
&emsp;&emsp;&emsp;<a name="SourceFile-y5ymnvv-"></a>*[SourceElements](#SourceElements)*  
  
