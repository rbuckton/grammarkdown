&emsp;&emsp;<a name="SourceCharacter"></a>*SourceCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SourceCharacter-c64b38bd"></a>any Unicode code point  
  
&emsp;&emsp;<a name="LineTerminator"></a>*LineTerminator* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminator-7b39d525"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-435c91d5"></a>&lt;CR&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-10022ab3"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-cfc875d1"></a>&lt;PS&gt;  
  
&emsp;&emsp;<a name="LineTerminatorSequence"></a>*LineTerminatorSequence* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-7b39d525"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-1e22ed49"></a>&lt;CR&gt;&emsp;[lookahead ≠ &lt;LF&gt;]  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-10022ab3"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-cfc875d1"></a>&lt;PS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-2da252ec"></a>&lt;CR&gt;&emsp;&lt;LF&gt;  
  
&emsp;&emsp;<a name="IdentifierName"></a>*IdentifierName* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierName-434685ab"></a>*[IdentifierStart](#IdentifierStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierName-700c1cee"></a>*[IdentifierName](#IdentifierName)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="IdentifierStart"></a>*IdentifierStart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierStart-0862e30c"></a>*[UnicodeIDStart](#UnicodeIDStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierStart-07564b94"></a>`` _ ``  
  
&emsp;&emsp;<a name="IdentifierPart"></a>*IdentifierPart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierPart-364ac675"></a>*[UnicodeIDContinue](#UnicodeIDContinue)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-07564b94"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-60d2dd13"></a>&lt;ZWNJ&gt;  
&emsp;&emsp;&emsp;<a name="IdentifierPart-cdf80ff5"></a>&lt;ZWJ&gt;  
  
&emsp;&emsp;<a name="UnicodeIDStart"></a>*UnicodeIDStart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDStart-d2e8afad"></a>any Unicode code point with the Unicode property "ID_Start" or "Other_ID_Start"  
  
&emsp;&emsp;<a name="UnicodeIDContinue"></a>*UnicodeIDContinue* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDContinue-75cd6b24"></a>any Unicode code point with the Unicode property "ID_Continue" or "Other_ID_Continue", or "Other_ID_Start"  
  
&emsp;&emsp;<a name="ReservedWord"></a>*ReservedWord* **::**  
&emsp;&emsp;&emsp;<a name="ReservedWord-a3926e03"></a>*[Keyword](#Keyword)*  
  
&emsp;&emsp;<a name="Keyword"></a>*Keyword* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>empty</code>     <code>lookahead</code> <code>lexical</code>   <code>goal</code>      <code>no</code>  
&emsp;&emsp;&emsp;<code>here</code>      <code>one</code>       <code>of</code>        <code>or</code>        <code>but</code>  
&emsp;&emsp;&emsp;<code>not</code></pre>
  
&emsp;&emsp;<a name="DecimalDigit"></a>*DecimalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="HexDigit"></a>*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code>  
&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>  
&emsp;&emsp;&emsp;<code>E</code>     <code>F</code></pre>
  
&emsp;&emsp;<a name="UnicodeCharacterLiteral"></a>*UnicodeCharacterLiteral* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-eb4a6a4b"></a>`` < ``&emsp;*[UnicodeCharacterLiteralChars](#UnicodeCharacterLiteralChars)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralChars"></a>*UnicodeCharacterLiteralChars* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChars-38ed7616"></a>*[UnicodeCharacterLiteralChar](#UnicodeCharacterLiteralChar)*&emsp;*[UnicodeCharacterLiteralChars](#UnicodeCharacterLiteralChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralChar"></a>*UnicodeCharacterLiteralChar* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralChar-22948f2e"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` < `` **or** `` > `` **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Indent"></a>*Indent* **::**  
&emsp;&emsp;&emsp;<a name="Indent-e1ed22ce"></a>An increase in the indentation depth from the previous line.  
  
&emsp;&emsp;<a name="Dedent"></a>*Dedent* **::**  
&emsp;&emsp;&emsp;<a name="Dedent-300a16b0"></a>A decrease in the indentation depth from the previous line.  
  
&emsp;&emsp;<a name="Terminal"></a>*Terminal* **::**  
&emsp;&emsp;&emsp;<a name="Terminal-212dbddf"></a>`` ` ``&emsp;`` ` ``&emsp;`` ` ``  
&emsp;&emsp;&emsp;<a name="Terminal-242c39ec"></a>`` ` ``&emsp;*[TerminalChars](#TerminalChars)*&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TerminalChars"></a>*TerminalChars* **::**  
&emsp;&emsp;&emsp;<a name="TerminalChars-cfc72e14"></a>*[TerminalChar](#TerminalChar)*&emsp;*[TerminalChars](#TerminalChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TerminalChar"></a>*TerminalChar* **::**  
&emsp;&emsp;&emsp;<a name="TerminalChar-94153dfd"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Prose"></a>*Prose* **::**  
&emsp;&emsp;&emsp;<a name="Prose-a4d5e18a"></a>*[ProseLines](#ProseLines)*  
  
&emsp;&emsp;<a name="ProseLines"></a>*ProseLines* **::**  
&emsp;&emsp;&emsp;<a name="ProseLines-5a8416e5"></a>*[ProseLine](#ProseLine)*  
&emsp;&emsp;&emsp;<a name="ProseLines-7381e3e8"></a>*[ProseLine](#ProseLine)*&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*&emsp;*[ProseLines](#ProseLines)*  
  
&emsp;&emsp;<a name="ProseLine"></a>*ProseLine* **::**  
&emsp;&emsp;&emsp;<a name="ProseLine-a16b392e"></a>`` > ``&emsp;*[ProseChars](#ProseChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ProseChars"></a>*ProseChars* **::**  
&emsp;&emsp;&emsp;<a name="ProseChars-68b7c295"></a>*[ProseChar](#ProseChar)*&emsp;*[ProseChars](#ProseChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ProseChar"></a>*ProseChar* **::**  
&emsp;&emsp;&emsp;<a name="ProseChar-2d5bdfa7"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Identifier"></a>*Identifier* **:**  
&emsp;&emsp;&emsp;<a name="Identifier-bfa5c374"></a>*[IdentifierName](#IdentifierName)* **but not** *[ReservedWord](#ReservedWord)*  
  
&emsp;&emsp;<a name="Argument"></a>*Argument* **:**  
&emsp;&emsp;&emsp;<a name="Argument-06b6ace8"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments* **:**  
&emsp;&emsp;&emsp;<a name="Arguments-78e44c33"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="Arguments-234fb96b"></a>`` ( ``&emsp;*[ArgumentList](#ArgumentList)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ArgumentList"></a>*ArgumentList* **:**  
&emsp;&emsp;&emsp;<a name="ArgumentList-ce5e5792"></a>*[Argument](#Argument)*  
&emsp;&emsp;&emsp;<a name="ArgumentList-581c256a"></a>*[ArgumentList](#ArgumentList)*&emsp;`` , ``&emsp;*[Argument](#Argument)*  
  
&emsp;&emsp;<a name="PrimarySymbol"></a>*PrimarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-a1f52cdc"></a>*[Terminal](#Terminal)*  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-793f8970"></a>*[UnicodeCharacterLiteral](#UnicodeCharacterLiteral)*  
&emsp;&emsp;&emsp;<a name="PrimarySymbol-025060f9"></a>*[Nonterminal](#Nonterminal)*  
  
&emsp;&emsp;<a name="Nonterminal"></a>*Nonterminal* **:**  
&emsp;&emsp;&emsp;<a name="Nonterminal-967632df"></a>*[Identifier](#Identifier)*&emsp;*[Arguments](#Arguments)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="OptionalSymbol"></a>*OptionalSymbol* **:**  
&emsp;&emsp;&emsp;<a name="OptionalSymbol-05c72298"></a>*[PrimarySymbol](#PrimarySymbol)*&emsp;`` ? ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="OrClause"></a>*OrClause* **:**  
&emsp;&emsp;&emsp;<a name="OrClause-3f20f9ae"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="OrClause-01c87b7a"></a>*[OrClause](#OrClause)*&emsp;`` or ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="OneOfSymbol"></a>*OneOfSymbol* **:**  
&emsp;&emsp;&emsp;<a name="OneOfSymbol-3f20f9ae"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="OneOfSymbol-c573547e"></a>`` one ``&emsp;`` of ``&emsp;*[OrClause](#OrClause)*  
  
&emsp;&emsp;<a name="UnarySymbol"></a>*UnarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="UnarySymbol-1ea4c20a"></a>*[OneOfSymbol](#OneOfSymbol)*  
  
&emsp;&emsp;<a name="ButNotSymbol"></a>*ButNotSymbol* **:**  
&emsp;&emsp;&emsp;<a name="ButNotSymbol-7b400d1b"></a>*[UnarySymbol](#UnarySymbol)*&emsp;`` but ``&emsp;`` not ``&emsp;*[UnarySymbol](#UnarySymbol)*  
  
&emsp;&emsp;<a name="BinarySymbol"></a>*BinarySymbol* **:**  
&emsp;&emsp;&emsp;<a name="BinarySymbol-711fdb04"></a>*[ButNotSymbol](#ButNotSymbol)*  
&emsp;&emsp;&emsp;<a name="BinarySymbol-4336266b"></a>*[UnarySymbol](#UnarySymbol)*  
  
&emsp;&emsp;<a name="SymbolList"></a>*SymbolList* **:**  
&emsp;&emsp;&emsp;<a name="SymbolList-3f20f9ae"></a>*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="SymbolList-45dd22d9"></a>*[SymbolList](#SymbolList)*&emsp;`` , ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="SymbolSet"></a>*SymbolSet* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSet-3f4042cc"></a>`` { ``&emsp;*[SymbolList](#SymbolList)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="EmptyAssertionClause"></a>*EmptyAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="EmptyAssertionClause-a6f2a968"></a>`` empty ``  
  
&emsp;&emsp;<a name="LookaheadEqualsAssertionClause"></a>*LookaheadEqualsAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadEqualsAssertionClause-0594dce2"></a>`` lookahead ``&emsp;`` == ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause"></a>*LookaheadNotEqualsAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause-21afcb5a"></a>`` lookahead ``&emsp;`` != ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadInAssertionClause"></a>*LookaheadInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadInAssertionClause-d21a8670"></a>`` lookahead ``&emsp;`` <- ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadNotInAssertionClause"></a>*LookaheadNotInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotInAssertionClause-175dd806"></a>`` lookahead ``&emsp;`` <! ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadAssertionClause"></a>*LookaheadAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-ea4c3682"></a>*[LookaheadEqualsAssertionClause](#LookaheadEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-40d68bcb"></a>*[LookaheadNotEqualsAssertionClause](#LookaheadNotEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-b407a314"></a>*[LookaheadInAssertionClause](#LookaheadInAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-bccafc6f"></a>*[LookaheadNotInAssertionClause](#LookaheadNotInAssertionClause)*  
  
&emsp;&emsp;<a name="NoSymbolAssertionClause"></a>*NoSymbolAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="NoSymbolAssertionClause-93da6768"></a>`` no ``&emsp;*[OrClause](#OrClause)*&emsp;`` here ``  
  
&emsp;&emsp;<a name="LexicalGoalAssertionClause"></a>*LexicalGoalAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LexicalGoalAssertionClause-75dfd5be"></a>`` lexical ``&emsp;`` goal ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="ParameterValueAssertionClause"></a>*ParameterValueAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="ParameterValueAssertionClause-0d65c0ec"></a>`` ~ ``&emsp;*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="ParameterValueAssertionClause-4324796f"></a>`` + ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="AssertionClause"></a>*AssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="AssertionClause-677faf63"></a>*[EmptyAssertionClause](#EmptyAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-2e322246"></a>*[LookaheadAssertionClause](#LookaheadAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-9dc22c42"></a>*[NoSymbolAssertionClause](#NoSymbolAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-1594107c"></a>*[LexicalGoalAssertionClause](#LexicalGoalAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-83a4e5cc"></a>*[ParameterValueAssertionClause](#ParameterValueAssertionClause)*  
  
&emsp;&emsp;<a name="Assertion"></a>*Assertion* **:**  
&emsp;&emsp;&emsp;<a name="Assertion-a05028e9"></a>`` [ ``&emsp;*[AssertionClause](#AssertionClause)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ProseSpan"></a>*ProseSpan* **:**  
&emsp;&emsp;&emsp;<a name="ProseSpan-097d0715"></a>*[Prose](#Prose)*  
&emsp;&emsp;&emsp;<a name="ProseSpan-177e1aec"></a>*[ProseSpan](#ProseSpan)*&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*&emsp;*[Prose](#Prose)*  
  
&emsp;&emsp;<a name="Symbol"></a>*Symbol* **:**  
&emsp;&emsp;&emsp;<a name="Symbol-e03dc251"></a>*[Assertion](#Assertion)*  
&emsp;&emsp;&emsp;<a name="Symbol-db35a295"></a>*[BinarySymbol](#BinarySymbol)*  
  
&emsp;&emsp;<a name="SymbolSpan"></a>*SymbolSpan* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpan-e959bc2b"></a>*[ProseSpan](#ProseSpan)*  
&emsp;&emsp;&emsp;<a name="SymbolSpan-695ced9a"></a>*[SymbolSpanRest](#SymbolSpanRest)*  
  
&emsp;&emsp;<a name="SymbolSpanRest"></a>*SymbolSpanRest* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpanRest-f1442de0"></a>*[Symbol](#Symbol)*&emsp;*[SymbolSpanRest](#SymbolSpanRest)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSideList"></a>*RightHandSideList* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSideList-34e2c10c"></a>*[RightHandSide](#RightHandSide)*&emsp;*[RightHandSideList](#RightHandSideList)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSide"></a>*RightHandSide* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSide-5379227e"></a>*[SymbolSpan](#SymbolSpan)*&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*  
  
&emsp;&emsp;<a name="Terminals"></a>*Terminals* **:**  
&emsp;&emsp;&emsp;<a name="Terminals-1a4d4441"></a>*[Terminal](#Terminal)*&emsp;*[Terminals](#Terminals)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TerminalList"></a>*TerminalList* **:**  
&emsp;&emsp;&emsp;<a name="TerminalList-814b2520"></a>*[Terminals](#Terminals)*  
&emsp;&emsp;&emsp;<a name="TerminalList-19e4c069"></a>*[TerminalList](#TerminalList)*&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*&emsp;*[Terminals](#Terminals)*  
  
&emsp;&emsp;<a name="OneOfList"></a>*OneOfList* **:**  
&emsp;&emsp;&emsp;<a name="OneOfList-f888749c"></a>`` one ``&emsp;`` of ``&emsp;*[Terminals](#Terminals)*  
&emsp;&emsp;&emsp;<a name="OneOfList-32da5eff"></a>`` one ``&emsp;`` of ``&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*&emsp;*[Indent](#Indent)*&emsp;*[TerminalList](#TerminalList)*&emsp;*[Dedent](#Dedent)*  
  
&emsp;&emsp;<a name="Parameter"></a>*Parameter* **:**  
&emsp;&emsp;&emsp;<a name="Parameter-06b6ace8"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ParameterList"></a>*ParameterList* **:**  
&emsp;&emsp;&emsp;<a name="ParameterList-f699f295"></a>*[Parameter](#Parameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-7a714dd4"></a>*[ParameterList](#ParameterList)*&emsp;`` , ``&emsp;*[Parameter](#Parameter)*  
  
&emsp;&emsp;<a name="Parameters"></a>*Parameters* **:**  
&emsp;&emsp;&emsp;<a name="Parameters-9fe02178"></a>`` ( ``&emsp;*[ParameterList](#ParameterList)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="Production"></a>*Production* **:**  
&emsp;&emsp;&emsp;<a name="Production-d2040e0a"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[OneOfList](#OneOfList)*  
&emsp;&emsp;&emsp;<a name="Production-5478e70a"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[RightHandSide](#RightHandSide)*  
&emsp;&emsp;&emsp;<a name="Production-baa427d7"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;`` : ``&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*&emsp;*[Indent](#Indent)*&emsp;*[RightHandSideList](#RightHandSideList)*&emsp;*[Dedent](#Dedent)*  
  
&emsp;&emsp;<a name="SourceElement"></a>*SourceElement* **:**  
&emsp;&emsp;&emsp;<a name="SourceElement-37b9c04c"></a>[empty]  
&emsp;&emsp;&emsp;<a name="SourceElement-df70fc79"></a>*[Production](#Production)*  
  
&emsp;&emsp;<a name="SourceElements"></a>*SourceElements* **:**  
&emsp;&emsp;&emsp;<a name="SourceElements-3e0c8782"></a>*[SourceElement](#SourceElement)*&emsp;*[SourceElements](#SourceElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SourceFile"></a>*SourceFile* **:**  
&emsp;&emsp;&emsp;<a name="SourceFile-63962636"></a>*[SourceElements](#SourceElements)*  
  
