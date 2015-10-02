&emsp;&emsp;<a name="SourceCharacter"></a>*SourceCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SourceCharacter-c64b38bd"></a>any Unicode code point  
  
&emsp;&emsp;<a name="InputElementDiv"></a>*InputElementDiv* **::**  
&emsp;&emsp;&emsp;<a name="InputElementDiv-1424dc49"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-3b331ccd"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-153d7a58"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-83158895"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-28035084"></a>*[DivPunctuator](#DivPunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-121314a7"></a>*[RightBracePunctuator](#RightBracePunctuator)*  
  
&emsp;&emsp;<a name="InputElementRegExp"></a>*InputElementRegExp* **::**  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-1424dc49"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-3b331ccd"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-153d7a58"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-83158895"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-121314a7"></a>*[RightBracePunctuator](#RightBracePunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-31b672e8"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
  
&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail"></a>*InputElementRegExpOrTemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-1424dc49"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-3b331ccd"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-153d7a58"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-83158895"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-31b672e8"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-62ae6eb9"></a>*[TemplateSubstitutionTail](#TemplateSubstitutionTail)*  
  
&emsp;&emsp;<a name="InputElementTemplateTail"></a>*InputElementTemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-1424dc49"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-3b331ccd"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-153d7a58"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-83158895"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-28035084"></a>*[DivPunctuator](#DivPunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-62ae6eb9"></a>*[TemplateSubstitutionTail](#TemplateSubstitutionTail)*  
  
&emsp;&emsp;<a name="WhiteSpace"></a>*WhiteSpace* **::**  
&emsp;&emsp;&emsp;<a name="WhiteSpace-9384a802"></a>&lt;TAB&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-c3f7084f"></a>&lt;VT&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-0d57c596"></a>&lt;FF&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-d35745b8"></a>&lt;SP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-404e9052"></a>&lt;NBSP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-fb8196ba"></a>&lt;ZWNBSP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-ebc9d288"></a>&lt;USP&gt;  
  
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
  
&emsp;&emsp;<a name="Comment"></a>*Comment* **::**  
&emsp;&emsp;&emsp;<a name="Comment-b221187a"></a>*[MultiLineComment](#MultiLineComment)*  
&emsp;&emsp;&emsp;<a name="Comment-49272b29"></a>*[SingleLineComment](#SingleLineComment)*  
  
&emsp;&emsp;<a name="MultiLineComment"></a>*MultiLineComment* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineComment-1e164ceb"></a>`` /* ``&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>&emsp;`` */ ``  
  
&emsp;&emsp;<a name="MultiLineCommentChars"></a>*MultiLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-24a6effb"></a>*[MultiLineNotAsteriskChar](#MultiLineNotAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-6fcb6b58"></a>`` * ``&emsp;*[PostAsteriskCommentChars](#PostAsteriskCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="PostAsteriskCommentChars"></a>*PostAsteriskCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="PostAsteriskCommentChars-25615007"></a>*[MultiLineNotForwardSlashOrAsteriskChar](#MultiLineNotForwardSlashOrAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="PostAsteriskCommentChars-6fcb6b58"></a>`` * ``&emsp;*[PostAsteriskCommentChars](#PostAsteriskCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="MultiLineNotAsteriskChar"></a>*MultiLineNotAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineNotAsteriskChar-162032ca"></a>*[SourceCharacter](#SourceCharacter)* **but not** `` * ``  
  
&emsp;&emsp;<a name="MultiLineNotForwardSlashOrAsteriskChar"></a>*MultiLineNotForwardSlashOrAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineNotForwardSlashOrAsteriskChar-475d2033"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` / `` **or** `` * ``  
  
&emsp;&emsp;<a name="SingleLineComment"></a>*SingleLineComment* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineComment-53edd61c"></a>`` // ``&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChars"></a>*SingleLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChars-4521d447"></a>*[SingleLineCommentChar](#SingleLineCommentChar)*&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChar"></a>*SingleLineCommentChar* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChar-42edda0b"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="CommonToken"></a>*CommonToken* **::**  
&emsp;&emsp;&emsp;<a name="CommonToken-0ebb31e2"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="CommonToken-ee18f3d6"></a>*[Punctuator](#Punctuator)*  
&emsp;&emsp;&emsp;<a name="CommonToken-a548b407"></a>*[NumericLiteral](#NumericLiteral)*  
&emsp;&emsp;&emsp;<a name="CommonToken-5c74e54d"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="CommonToken-3ec1ae06"></a>*[Template](#Template)*  
  
&emsp;&emsp;<a name="IdentifierName"></a>*IdentifierName* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierName-434685ab"></a>*[IdentifierStart](#IdentifierStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierName-700c1cee"></a>*[IdentifierName](#IdentifierName)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="IdentifierStart"></a>*IdentifierStart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierStart-0862e30c"></a>*[UnicodeIDStart](#UnicodeIDStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierStart-1262cc92"></a>`` $ ``  
&emsp;&emsp;&emsp;<a name="IdentifierStart-07564b94"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierStart-6fbc8b19"></a>`` \ ``&emsp;*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
  
&emsp;&emsp;<a name="IdentifierPart"></a>*IdentifierPart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierPart-364ac675"></a>*[UnicodeIDContinue](#UnicodeIDContinue)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-1262cc92"></a>`` $ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-07564b94"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-6fbc8b19"></a>`` \ ``&emsp;*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-60d2dd13"></a>&lt;ZWNJ&gt;  
&emsp;&emsp;&emsp;<a name="IdentifierPart-cdf80ff5"></a>&lt;ZWJ&gt;  
  
&emsp;&emsp;<a name="UnicodeIDStart"></a>*UnicodeIDStart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDStart-d2e8afad"></a>any Unicode code point with the Unicode property "ID_Start" or "Other_ID_Start"  
  
&emsp;&emsp;<a name="UnicodeIDContinue"></a>*UnicodeIDContinue* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDContinue-75cd6b24"></a>any Unicode code point with the Unicode property "ID_Continue" or "Other_ID_Continue", or "Other_ID_Start"  
  
&emsp;&emsp;<a name="ReservedWord"></a>*ReservedWord* **::**  
&emsp;&emsp;&emsp;<a name="ReservedWord-a3926e03"></a>*[Keyword](#Keyword)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-9d71bdc1"></a>*[FutureReservedWord](#FutureReservedWord)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-54f84188"></a>*[NullLiteral](#NullLiteral)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-3508e1fd"></a>*[BooleanLiteral](#BooleanLiteral)*  
  
&emsp;&emsp;<a name="Keyword"></a>*Keyword* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>break</code>      <code>do</code>         <code>in</code>         <code>typeof</code>     <code>case</code>  
&emsp;&emsp;&emsp;<code>else</code>       <code>instanceof</code> <code>var</code>        <code>catch</code>      <code>export</code>  
&emsp;&emsp;&emsp;<code>new</code>        <code>void</code>       <code>class</code>      <code>extends</code>    <code>return</code>  
&emsp;&emsp;&emsp;<code>while</code>      <code>const</code>      <code>finally</code>    <code>super</code>      <code>with</code>  
&emsp;&emsp;&emsp;<code>continue</code>   <code>for</code>        <code>switch</code>     <code>yield</code>      <code>debugger</code>  
&emsp;&emsp;&emsp;<code>function</code>   <code>this</code>       <code>default</code>    <code>if</code>         <code>throw</code>  
&emsp;&emsp;&emsp;<code>delete</code>     <code>import</code>     <code>try</code></pre>
  
&emsp;&emsp;<a name="FutureReservedWord"></a>*FutureReservedWord* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>enum</code>       <code>await</code>      <code>implements</code> <code>package</code>    <code>protected</code>  
&emsp;&emsp;&emsp;<code>interface</code>  <code>private</code>    <code>public</code></pre>
  
&emsp;&emsp;<a name="Punctuator"></a>*Punctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>{</code>     <code>}</code>     <code>(</code>     <code>)</code>     <code>[</code>     <code>]</code>     <code>.</code>     <code>;</code>     <code>,</code>     <code>&lt;</code>  
&emsp;&emsp;&emsp;<code>&gt;</code>     <code>&lt;=</code>    <code>&gt;=</code>    <code>==</code>    <code>!=</code>    <code>===</code>   <code>!==</code>   <code>+</code>     <code>-</code>     <code>*</code>  
&emsp;&emsp;&emsp;<code>%</code>     <code>++</code>    <code>--</code>    <code>&lt;&lt;</code>    <code>&gt;&gt;</code>    <code>&gt;&gt;&gt;</code>   <code>&amp;</code>     <code>|</code>     <code>^</code>     <code>!</code>  
&emsp;&emsp;&emsp;<code>~</code>     <code>&amp;&amp;</code>    <code>||</code>    <code>?</code>     <code> ::</code>   <code>=</code>     <code>+=</code>    <code>-=</code>    <code>*=</code>    <code>%=</code>  
&emsp;&emsp;&emsp;<code>&lt;&lt;=</code>   <code>&gt;&gt;=</code>   <code>&gt;&gt;&gt;=</code>  <code>&amp;=</code>    <code>|=</code>    <code>^=</code>    <code>=&gt;</code></pre>
  
&emsp;&emsp;<a name="DivPunctuator"></a>*DivPunctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>/</code>     <code>/=</code></pre>
  
&emsp;&emsp;<a name="RightBracePunctuator"></a>*RightBracePunctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>)</code></pre>
  
&emsp;&emsp;<a name="NullLiteral"></a>*NullLiteral* **::**  
&emsp;&emsp;&emsp;<a name="NullLiteral-77b50868"></a>`` null ``  
  
&emsp;&emsp;<a name="BooleanLiteral"></a>*BooleanLiteral* **::**  
&emsp;&emsp;&emsp;<a name="BooleanLiteral-fa30b8c6"></a>`` true ``  
&emsp;&emsp;&emsp;<a name="BooleanLiteral-23d2c69d"></a>`` false ``  
  
&emsp;&emsp;<a name="NumericLiteral"></a>*NumericLiteral* **::**  
&emsp;&emsp;&emsp;<a name="NumericLiteral-18c0356f"></a>*[DecimalLiteral](#DecimalLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-d3d71ddd"></a>*[BinaryIntegerLiteral](#BinaryIntegerLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-832f57ee"></a>*[OctalIntegerLiteral](#OctalIntegerLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-1d0c4a66"></a>*[HexIntegerLiteral](#HexIntegerLiteral)*  
  
&emsp;&emsp;<a name="DecimalLiteral"></a>*DecimalLiteral* **::**  
&emsp;&emsp;&emsp;<a name="DecimalLiteral-fb5198a6"></a>*[DecimalIntegerLiteral](#DecimalIntegerLiteral)*&emsp;`` . ``&emsp;*[DecimalDigits](#DecimalDigits)*<sub>opt</sub>&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="DecimalLiteral-5cf3aa35"></a>`` . ``&emsp;*[DecimalDigits](#DecimalDigits)*&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="DecimalLiteral-13dbaf21"></a>*[DecimalIntegerLiteral](#DecimalIntegerLiteral)*&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DecimalIntegerLiteral"></a>*DecimalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="DecimalIntegerLiteral-5259a431"></a>`` 0 ``  
&emsp;&emsp;&emsp;<a name="DecimalIntegerLiteral-2353f0a3"></a>*[NonZeroDigit](#NonZeroDigit)*&emsp;*[DecimalDigits](#DecimalDigits)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DecimalDigits"></a>*DecimalDigits* **::**  
&emsp;&emsp;&emsp;<a name="DecimalDigits-b3831ee0"></a>*[DecimalDigit](#DecimalDigit)*  
&emsp;&emsp;&emsp;<a name="DecimalDigits-9f250657"></a>*[DecimalDigits](#DecimalDigits)*&emsp;*[DecimalDigit](#DecimalDigit)*  
  
&emsp;&emsp;<a name="DecimalDigit"></a>*DecimalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="NonZeroDigit"></a>*NonZeroDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="ExponentPart"></a>*ExponentPart* **::**  
&emsp;&emsp;&emsp;<a name="ExponentPart-7f837518"></a>*[ExponentIndicator](#ExponentIndicator)*&emsp;*[SignedInteger](#SignedInteger)*  
  
&emsp;&emsp;<a name="ExponentIndicator"></a>*ExponentIndicator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>e</code>     <code>E</code></pre>
  
&emsp;&emsp;<a name="SignedInteger"></a>*SignedInteger* **::**  
&emsp;&emsp;&emsp;<a name="SignedInteger-6d7b4e5f"></a>*[DecimalDigits](#DecimalDigits)*  
&emsp;&emsp;&emsp;<a name="SignedInteger-3bd7fe57"></a>`` + ``&emsp;*[DecimalDigits](#DecimalDigits)*  
&emsp;&emsp;&emsp;<a name="SignedInteger-58000348"></a>`` - ``&emsp;*[DecimalDigits](#DecimalDigits)*  
  
&emsp;&emsp;<a name="BinaryIntegerLiteral"></a>*BinaryIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="BinaryIntegerLiteral-600d7817"></a>`` 0b ``&emsp;*[BinaryDigits](#BinaryDigits)*  
&emsp;&emsp;&emsp;<a name="BinaryIntegerLiteral-7c1f17d9"></a>`` 0B ``&emsp;*[BinaryDigits](#BinaryDigits)*  
  
&emsp;&emsp;<a name="BinaryDigits"></a>*BinaryDigits* **::**  
&emsp;&emsp;&emsp;<a name="BinaryDigits-e5f1ee23"></a>*[BinaryDigit](#BinaryDigit)*  
&emsp;&emsp;&emsp;<a name="BinaryDigits-82aa7443"></a>*[BinaryDigits](#BinaryDigits)*&emsp;*[BinaryDigit](#BinaryDigit)*  
  
&emsp;&emsp;<a name="BinaryDigit"></a>*BinaryDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code></pre>
  
&emsp;&emsp;<a name="OctalIntegerLiteral"></a>*OctalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="OctalIntegerLiteral-a8056cb0"></a>`` 0o ``&emsp;*[OctalDigits](#OctalDigits)*  
&emsp;&emsp;&emsp;<a name="OctalIntegerLiteral-3a3652fa"></a>`` 0O ``&emsp;*[OctalDigits](#OctalDigits)*  
  
&emsp;&emsp;<a name="OctalDigits"></a>*OctalDigits* **::**  
&emsp;&emsp;&emsp;<a name="OctalDigits-99bc1d53"></a>*[OctalDigit](#OctalDigit)*  
&emsp;&emsp;&emsp;<a name="OctalDigits-37a295fe"></a>*[OctalDigits](#OctalDigits)*&emsp;*[OctalDigit](#OctalDigit)*  
  
&emsp;&emsp;<a name="OctalDigit"></a>*OctalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code></pre>
  
&emsp;&emsp;<a name="HexIntegerLiteral"></a>*HexIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="HexIntegerLiteral-cf154180"></a>`` 0x ``&emsp;*[HexDigits](#HexDigits)*  
&emsp;&emsp;&emsp;<a name="HexIntegerLiteral-9ef756f3"></a>`` 0X ``&emsp;*[HexDigits](#HexDigits)*  
  
&emsp;&emsp;<a name="HexDigits"></a>*HexDigits* **::**  
&emsp;&emsp;&emsp;<a name="HexDigits-a0c48a71"></a>*[HexDigit](#HexDigit)*  
&emsp;&emsp;&emsp;<a name="HexDigits-c8221899"></a>*[HexDigits](#HexDigits)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="HexDigit"></a>*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code>  
&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>  
&emsp;&emsp;&emsp;<code>E</code>     <code>F</code></pre>
  
&emsp;&emsp;<a name="StringLiteral"></a>*StringLiteral* **::**  
&emsp;&emsp;&emsp;<a name="StringLiteral-15d8b1f1"></a>`` " ``&emsp;*[DoubleStringCharacters](#DoubleStringCharacters)*<sub>opt</sub>&emsp;`` " ``  
&emsp;&emsp;&emsp;<a name="StringLiteral-82ecb3d9"></a>`` ' ``&emsp;*[SingleStringCharacters](#SingleStringCharacters)*<sub>opt</sub>&emsp;`` ' ``  
  
&emsp;&emsp;<a name="DoubleStringCharacters"></a>*DoubleStringCharacters* **::**  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacters-8bdabc77"></a>*[DoubleStringCharacter](#DoubleStringCharacter)*&emsp;*[DoubleStringCharacters](#DoubleStringCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleStringCharacters"></a>*SingleStringCharacters* **::**  
&emsp;&emsp;&emsp;<a name="SingleStringCharacters-17d28457"></a>*[SingleStringCharacter](#SingleStringCharacter)*&emsp;*[SingleStringCharacters](#SingleStringCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DoubleStringCharacter"></a>*DoubleStringCharacter* **::**  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-25593d43"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` " `` **or** `` \ `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-ea7d8d26"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-00992933"></a>*[LineContinuation](#LineContinuation)*  
  
&emsp;&emsp;<a name="SingleStringCharacter"></a>*SingleStringCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-c574e0b6"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ' `` **or** `` \ `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-ea7d8d26"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-00992933"></a>*[LineContinuation](#LineContinuation)*  
  
&emsp;&emsp;<a name="LineContinuation"></a>*LineContinuation* **::**  
&emsp;&emsp;&emsp;<a name="LineContinuation-c4893d63"></a>`` \ ``&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*  
  
&emsp;&emsp;<a name="EscapeSequence"></a>*EscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="EscapeSequence-e9e86f07"></a>*[CharacterEscapeSequence](#CharacterEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="EscapeSequence-3651e0da"></a>`` 0 ``&emsp;[lookahead ≠ *[DecimalDigit](#DecimalDigit)*]  
&emsp;&emsp;&emsp;<a name="EscapeSequence-a8071b85"></a>*[HexEscapeSequence](#HexEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="EscapeSequence-44bd6f55"></a>*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
  
&emsp;&emsp;<a name="CharacterEscapeSequence"></a>*CharacterEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="CharacterEscapeSequence-7444838f"></a>*[SingleEscapeCharacter](#SingleEscapeCharacter)*  
&emsp;&emsp;&emsp;<a name="CharacterEscapeSequence-b7980a98"></a>*[NonEscapeCharacter](#NonEscapeCharacter)*  
  
&emsp;&emsp;<a name="SingleEscapeCharacter"></a>*SingleEscapeCharacter* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>&apos;</code>     <code>&quot;</code>     <code>\</code>     <code>b</code>     <code>f</code>     <code>n</code>     <code>r</code>     <code>t</code>     <code>v</code></pre>
  
&emsp;&emsp;<a name="NonEscapeCharacter"></a>*NonEscapeCharacter* **::**  
&emsp;&emsp;&emsp;<a name="NonEscapeCharacter-a23e757b"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** *[EscapeCharacter](#EscapeCharacter)* **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="EscapeCharacter"></a>*EscapeCharacter* **::**  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-7444838f"></a>*[SingleEscapeCharacter](#SingleEscapeCharacter)*  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-b3831ee0"></a>*[DecimalDigit](#DecimalDigit)*  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-150383a9"></a>`` x ``  
&emsp;&emsp;&emsp;<a name="EscapeCharacter-8c2e6655"></a>`` u ``  
  
&emsp;&emsp;<a name="HexEscapeSequence"></a>*HexEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="HexEscapeSequence-d8ef973c"></a>`` x ``&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="UnicodeEscapeSequence"></a>*UnicodeEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeEscapeSequence-8072ad8d"></a>`` u ``&emsp;*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeEscapeSequence-bc0db51f"></a>`` u{ ``&emsp;*[HexDigits](#HexDigits)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="Hex4Digits"></a>*Hex4Digits* **::**  
&emsp;&emsp;&emsp;<a name="Hex4Digits-0ba8de61"></a>*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="RegularExpressionLiteral"></a>*RegularExpressionLiteral* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionLiteral-5778053b"></a>`` / ``&emsp;*[RegularExpressionBody](#RegularExpressionBody)*&emsp;`` / ``&emsp;*[RegularExpressionFlags](#RegularExpressionFlags)*  
  
&emsp;&emsp;<a name="RegularExpressionBody"></a>*RegularExpressionBody* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionBody-bba7969e"></a>*[RegularExpressionFirstChar](#RegularExpressionFirstChar)*&emsp;*[RegularExpressionChars](#RegularExpressionChars)*  
  
&emsp;&emsp;<a name="RegularExpressionChars"></a>*RegularExpressionChars* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionChars-37b9c04c"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionChars-a9881cec"></a>*[RegularExpressionChars](#RegularExpressionChars)*&emsp;*[RegularExpressionChar](#RegularExpressionChar)*  
  
&emsp;&emsp;<a name="RegularExpressionFirstChar"></a>*RegularExpressionFirstChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-e5c95cf5"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` * `` **or** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-9c9579a7"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-5cc6858e"></a>*[RegularExpressionClass](#RegularExpressionClass)*  
  
&emsp;&emsp;<a name="RegularExpressionChar"></a>*RegularExpressionChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-70196e5d"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-9c9579a7"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-5cc6858e"></a>*[RegularExpressionClass](#RegularExpressionClass)*  
  
&emsp;&emsp;<a name="RegularExpressionBackslashSequence"></a>*RegularExpressionBackslashSequence* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionBackslashSequence-d7656bad"></a>`` \ ``&emsp;*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)*  
  
&emsp;&emsp;<a name="RegularExpressionNonTerminator"></a>*RegularExpressionNonTerminator* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionNonTerminator-42edda0b"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="RegularExpressionClass"></a>*RegularExpressionClass* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClass-4c1bc40a"></a>`` [ ``&emsp;*[RegularExpressionClassChars](#RegularExpressionClassChars)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="RegularExpressionClassChars"></a>*RegularExpressionClassChars* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChars-37b9c04c"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChars-76bdcb05"></a>*[RegularExpressionClassChars](#RegularExpressionClassChars)*&emsp;*[RegularExpressionClassChar](#RegularExpressionClassChar)*  
  
&emsp;&emsp;<a name="RegularExpressionClassChar"></a>*RegularExpressionClassChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChar-6941a3c7"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` ] `` **or** `` \ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChar-9c9579a7"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
  
&emsp;&emsp;<a name="RegularExpressionFlags"></a>*RegularExpressionFlags* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionFlags-37b9c04c"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionFlags-fceefdcd"></a>*[RegularExpressionFlags](#RegularExpressionFlags)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="Template"></a>*Template* **::**  
&emsp;&emsp;&emsp;<a name="Template-7bf3ad2b"></a>*[NoSubstitutionTemplate](#NoSubstitutionTemplate)*  
&emsp;&emsp;&emsp;<a name="Template-ab9a4b96"></a>*[TemplateHead](#TemplateHead)*  
  
&emsp;&emsp;<a name="NoSubstitutionTemplate"></a>*NoSubstitutionTemplate* **::**  
&emsp;&emsp;&emsp;<a name="NoSubstitutionTemplate-056f5c6b"></a>`` ` ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TemplateHead"></a>*TemplateHead* **::**  
&emsp;&emsp;&emsp;<a name="TemplateHead-bfb172fc"></a>`` ` ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;<a name="TemplateSubstitutionTail"></a>*TemplateSubstitutionTail* **::**  
&emsp;&emsp;&emsp;<a name="TemplateSubstitutionTail-ccbc035d"></a>*[TemplateMiddle](#TemplateMiddle)*  
&emsp;&emsp;&emsp;<a name="TemplateSubstitutionTail-57fe6188"></a>*[TemplateTail](#TemplateTail)*  
  
&emsp;&emsp;<a name="TemplateMiddle"></a>*TemplateMiddle* **::**  
&emsp;&emsp;&emsp;<a name="TemplateMiddle-37635b4e"></a>`` } ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;<a name="TemplateTail"></a>*TemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="TemplateTail-fcef5bc0"></a>`` } ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TemplateCharacters"></a>*TemplateCharacters* **::**  
&emsp;&emsp;&emsp;<a name="TemplateCharacters-f8c26ac5"></a>*[TemplateCharacter](#TemplateCharacter)*&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TemplateCharacter"></a>*TemplateCharacter* **::**  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-03c3b542"></a>`` $ ``&emsp;[lookahead ≠ `` { ``]  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-ea7d8d26"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-00992933"></a>*[LineContinuation](#LineContinuation)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-544825da"></a>*[LineTerminatorSequence](#LineTerminatorSequence)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-660db50f"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** `` \ `` **or** `` $ `` **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="IdentifierReference"></a>*IdentifierReference*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IdentifierReference-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="IdentifierReference-481cca15"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="BindingIdentifier"></a>*BindingIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingIdentifier-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="BindingIdentifier-481cca15"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="LabelIdentifier"></a>*LabelIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelIdentifier-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="LabelIdentifier-481cca15"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="Identifier"></a>*Identifier* **:**  
&emsp;&emsp;&emsp;<a name="Identifier-bb0c62c5"></a>*[IdentifierName](#IdentifierName)* **but not** *[ReservedWord](#ReservedWord)*  
  
&emsp;&emsp;<a name="PrimaryExpression"></a>*PrimaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-8cee0c59"></a>`` this ``  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-3a0131bb"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-92e97e03"></a>*[Literal](#Literal)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-ac47bb6b"></a>*[ArrayLiteral](#ArrayLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-0392c02a"></a>*[ObjectLiteral](#ObjectLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-242eeccd"></a>*[FunctionExpression](#FunctionExpression)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-c2664089"></a>*[ClassExpression](#ClassExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-abb7f7f4"></a>*[GeneratorExpression](#GeneratorExpression)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-31b672e8"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-2d2930d1"></a>*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-b3fd8fa6"></a>*[CoverParenthesizedExpressionAndArrowParameterList](#CoverParenthesizedExpressionAndArrowParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList"></a>*CoverParenthesizedExpressionAndArrowParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-029ac257"></a>`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-78e44c33"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-1f3e167a"></a>`` ( ``&emsp;`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-73ce9d37"></a>`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="Literal"></a>*Literal* **:**  
&emsp;&emsp;&emsp;<a name="Literal-54f84188"></a>*[NullLiteral](#NullLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-3508e1fd"></a>*[BooleanLiteral](#BooleanLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-a548b407"></a>*[NumericLiteral](#NumericLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-5c74e54d"></a>*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="ArrayLiteral"></a>*ArrayLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-906e476b"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-71e00db5"></a>`` [ ``&emsp;*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-eaaf3387"></a>`` [ ``&emsp;*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ElementList"></a>*ElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ElementList-337c482b"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-05f42a48"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-5fbdc8af"></a>*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-df01e14f"></a>*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="Elision"></a>*Elision* **:**  
&emsp;&emsp;&emsp;<a name="Elision-9471f753"></a>`` , ``  
&emsp;&emsp;&emsp;<a name="Elision-806d0124"></a>*[Elision](#Elision)*&emsp;`` , ``  
  
&emsp;&emsp;<a name="SpreadElement"></a>*SpreadElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SpreadElement-06932152"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="ObjectLiteral"></a>*ObjectLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-81ba5a4a"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-e8cab933"></a>`` { ``&emsp;*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-f3799aaa"></a>`` { ``&emsp;*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertyDefinitionList"></a>*PropertyDefinitionList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyDefinitionList-9c5ab7a0"></a>*[PropertyDefinition](#PropertyDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinitionList-fa54c4a2"></a>*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[PropertyDefinition](#PropertyDefinition)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PropertyDefinition"></a>*PropertyDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-3a0131bb"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-024b5337"></a>*[CoverInitializedName](#CoverInitializedName)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-e6a7ef49"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-da6bdd4c"></a>*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PropertyName"></a>*PropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyName-e71e2304"></a>*[LiteralPropertyName](#LiteralPropertyName)*  
&emsp;&emsp;&emsp;<a name="PropertyName-cb2923ed"></a>*[ComputedPropertyName](#ComputedPropertyName)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="LiteralPropertyName"></a>*LiteralPropertyName* **:**  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-0ebb31e2"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-5c74e54d"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-a548b407"></a>*[NumericLiteral](#NumericLiteral)*  
  
&emsp;&emsp;<a name="ComputedPropertyName"></a>*ComputedPropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ComputedPropertyName-4acbaecf"></a>`` [ ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="CoverInitializedName"></a>*CoverInitializedName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CoverInitializedName-4a7592d9"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="Initializer"></a>*Initializer*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Initializer-345dd547"></a>`` = ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="TemplateLiteral"></a>*TemplateLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateLiteral-7bf3ad2b"></a>*[NoSubstitutionTemplate](#NoSubstitutionTemplate)*  
&emsp;&emsp;&emsp;<a name="TemplateLiteral-e9a466df"></a>*[TemplateHead](#TemplateHead)*&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;*[TemplateSpans](#TemplateSpans)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="TemplateSpans"></a>*TemplateSpans*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateSpans-57fe6188"></a>*[TemplateTail](#TemplateTail)*  
&emsp;&emsp;&emsp;<a name="TemplateSpans-2a7f8392"></a>*[TemplateMiddleList](#TemplateMiddleList)*<sub>[?Yield]</sub>&emsp;*[TemplateTail](#TemplateTail)*  
  
&emsp;&emsp;<a name="TemplateMiddleList"></a>*TemplateMiddleList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateMiddleList-343328ef"></a>*[TemplateMiddle](#TemplateMiddle)*&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="TemplateMiddleList-07b7e954"></a>*[TemplateMiddleList](#TemplateMiddleList)*<sub>[?Yield]</sub>&emsp;*[TemplateMiddle](#TemplateMiddle)*&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="MemberExpression"></a>*MemberExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MemberExpression-0952d8cb"></a>*[PrimaryExpression](#PrimaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-e1a5c9fb"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="MemberExpression-629e16ee"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="MemberExpression-12893548"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-fcc05c23"></a>*[SuperProperty](#SuperProperty)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-c81ee20f"></a>*[MetaProperty](#MetaProperty)*  
&emsp;&emsp;&emsp;<a name="MemberExpression-d5e683a8"></a>`` new ``&emsp;*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="SuperProperty"></a>*SuperProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SuperProperty-0b1ba5b1"></a>`` super ``&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="SuperProperty-f690ec4a"></a>`` super ``&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="MetaProperty"></a>*MetaProperty* **:**  
&emsp;&emsp;&emsp;<a name="MetaProperty-733bdb20"></a>*[NewTarget](#NewTarget)*  
  
&emsp;&emsp;<a name="NewTarget"></a>*NewTarget* **:**  
&emsp;&emsp;&emsp;<a name="NewTarget-d2de213d"></a>`` new ``&emsp;`` . ``&emsp;`` target ``  
  
&emsp;&emsp;<a name="NewExpression"></a>*NewExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="NewExpression-26b6da76"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="NewExpression-e2186e0c"></a>`` new ``&emsp;*[NewExpression](#NewExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="CallExpression"></a>*CallExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CallExpression-eed49138"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-91ffa870"></a>*[SuperCall](#SuperCall)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-13f81c0e"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-cd2dc062"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="CallExpression-710733f7"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="CallExpression-e3527637"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="SuperCall"></a>*SuperCall*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SuperCall-efa163a3"></a>`` super ``&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Arguments-78e44c33"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="Arguments-9c2026a8"></a>`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ArgumentList"></a>*ArgumentList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArgumentList-bdb9ec6f"></a>*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-06932152"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-346fb3ce"></a>*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-34a1ca49"></a>*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LeftHandSideExpression"></a>*LeftHandSideExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LeftHandSideExpression-d2389ef6"></a>*[NewExpression](#NewExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LeftHandSideExpression-f68183d8"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PostfixExpression"></a>*PostfixExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PostfixExpression-377fae86"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PostfixExpression-01e0f909"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` ++ ``  
&emsp;&emsp;&emsp;<a name="PostfixExpression-f1ad4cc5"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` -- ``  
  
&emsp;&emsp;<a name="UnaryExpression"></a>*UnaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="UnaryExpression-3511bc90"></a>*[PostfixExpression](#PostfixExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-7a45ced6"></a>`` delete ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-fecd74e3"></a>`` void ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-ed6968ab"></a>`` typeof ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-58097953"></a>`` ++ ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-b2900693"></a>`` -- ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-b2138170"></a>`` + ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-d7c5d494"></a>`` - ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-e14bfc0e"></a>`` ~ ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-0514e7a2"></a>`` ! ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="MultiplicativeExpression"></a>*MultiplicativeExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MultiplicativeExpression-d499e73d"></a>*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MultiplicativeExpression-dde0aa6f"></a>*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>&emsp;*[MultiplicativeOperator](#MultiplicativeOperator)*&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="MultiplicativeOperator"></a>*MultiplicativeOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*</code>     <code>/</code>     <code>%</code></pre>
  
&emsp;&emsp;<a name="AdditiveExpression"></a>*AdditiveExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-97b824d7"></a>*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-5ba6cc81"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>&emsp;`` + ``&emsp;*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-bf0c1119"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>&emsp;`` - ``&emsp;*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ShiftExpression"></a>*ShiftExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ShiftExpression-2baeb5db"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-1e6dbeb2"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` << ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-639cdc26"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` >> ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-9d297ffd"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` >>> ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="RelationalExpression"></a>*RelationalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="RelationalExpression-14cbe144"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-862f8bef"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` < ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-e1b30960"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` > ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-707c38bf"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` <= ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-cc6c18fa"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` >= ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-3bd34097"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` instanceof ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-bf2605bc"></a>[+In]&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[In, ?Yield]</sub>&emsp;`` in ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="EqualityExpression"></a>*EqualityExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="EqualityExpression-2f008b2b"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-4e8ecf54"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` == ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-73baad0e"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` != ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-5c018f1f"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` === ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-1f512a7e"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` !== ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseANDExpression"></a>*BitwiseANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseANDExpression-003e4dd5"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseANDExpression-dc348a15"></a>*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` & ``&emsp;*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseXORExpression"></a>*BitwiseXORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseXORExpression-67b2e707"></a>*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseXORExpression-2519f36e"></a>*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` ^ ``&emsp;*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseORExpression"></a>*BitwiseORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseORExpression-9dfaebf6"></a>*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseORExpression-afb46f89"></a>*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` | ``&emsp;*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LogicalANDExpression"></a>*LogicalANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LogicalANDExpression-43e84f3f"></a>*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LogicalANDExpression-de0d5414"></a>*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` && ``&emsp;*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LogicalORExpression"></a>*LogicalORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LogicalORExpression-6ab59bc8"></a>*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LogicalORExpression-03547d4d"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` || ``&emsp;*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="ConditionalExpression"></a>*ConditionalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ConditionalExpression-c932f215"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ConditionalExpression-c1f59db1"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` ? ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="AssignmentExpression"></a>*AssignmentExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-0e9e3100"></a>*[ConditionalExpression](#ConditionalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-197afb63"></a>[+Yield]&emsp;*[YieldExpression](#YieldExpression)*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-a9fcaed4"></a>*[ArrowFunction](#ArrowFunction)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-4894ae74"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` = ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-10c3e4bb"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;*[AssignmentOperator](#AssignmentOperator)*&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="AssignmentOperator"></a>*AssignmentOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*=</code>    <code>/=</code>    <code>%=</code>    <code>+=</code>    <code>-=</code>    <code>&lt;&lt;=</code>   <code>&gt;&gt;=</code>   <code>&gt;&gt;&gt;=</code>  <code>&amp;=</code>    <code>^=</code>  
&emsp;&emsp;&emsp;<code>|=</code></pre>
  
&emsp;&emsp;<a name="Expression"></a>*Expression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Expression-786f9dbf"></a>*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Expression-903ff309"></a>*[Expression](#Expression)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="Statement"></a>*Statement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Statement-a078de59"></a>*[BlockStatement](#BlockStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-0829ccbc"></a>*[VariableStatement](#VariableStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-7338aabb"></a>*[EmptyStatement](#EmptyStatement)*  
&emsp;&emsp;&emsp;<a name="Statement-bf83eb13"></a>*[ExpressionStatement](#ExpressionStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-74e1fb03"></a>*[IfStatement](#IfStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-dc2a2400"></a>*[BreakableStatement](#BreakableStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-b9a5a50f"></a>*[ContinueStatement](#ContinueStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-c8c4fc64"></a>*[BreakStatement](#BreakStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-27633cf7"></a>[+Return]&emsp;*[ReturnStatement](#ReturnStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-6530a28f"></a>*[WithStatement](#WithStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-86b75733"></a>*[LabelledStatement](#LabelledStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-6b7b863f"></a>*[ThrowStatement](#ThrowStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-1f0b6d58"></a>*[TryStatement](#TryStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-21212edb"></a>*[DebuggerStatement](#DebuggerStatement)*  
  
&emsp;&emsp;<a name="Declaration"></a>*Declaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Declaration-be3797c8"></a>*[HoistableDeclaration](#HoistableDeclaration)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Declaration-5e5813be"></a>*[ClassDeclaration](#ClassDeclaration)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Declaration-4e8ce3a9"></a>*[LexicalDeclaration](#LexicalDeclaration)*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="HoistableDeclaration"></a>*HoistableDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="HoistableDeclaration-a1547821"></a>*[FunctionDeclaration](#FunctionDeclaration)*<sub>[?Yield, ?Default]</sub>  
&emsp;&emsp;&emsp;<a name="HoistableDeclaration-967c0035"></a>*[GeneratorDeclaration](#GeneratorDeclaration)*<sub>[?Yield, ?Default]</sub>  
  
&emsp;&emsp;<a name="BreakableStatement"></a>*BreakableStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BreakableStatement-a132b5c7"></a>*[IterationStatement](#IterationStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="BreakableStatement-ce99464e"></a>*[SwitchStatement](#SwitchStatement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="BlockStatement"></a>*BlockStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BlockStatement-6fdf1f1f"></a>*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Block"></a>*Block*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Block-a890e138"></a>`` { ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="StatementList"></a>*StatementList*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StatementList-ca6617f3"></a>*[StatementListItem](#StatementListItem)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="StatementList-32cfa255"></a>*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub>&emsp;*[StatementListItem](#StatementListItem)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="StatementListItem"></a>*StatementListItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StatementListItem-a5329c8e"></a>*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="StatementListItem-404bc939"></a>*[Declaration](#Declaration)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="LexicalDeclaration"></a>*LexicalDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LexicalDeclaration-c55fb836"></a>*[LetOrConst](#LetOrConst)*&emsp;*[BindingList](#BindingList)*<sub>[?In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="LetOrConst"></a>*LetOrConst* **:**  
&emsp;&emsp;&emsp;<a name="LetOrConst-940c6b54"></a>`` let ``  
&emsp;&emsp;&emsp;<a name="LetOrConst-36233f0f"></a>`` const ``  
  
&emsp;&emsp;<a name="BindingList"></a>*BindingList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingList-137d39cb"></a>*[LexicalBinding](#LexicalBinding)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingList-300461d5"></a>*[BindingList](#BindingList)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[LexicalBinding](#LexicalBinding)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LexicalBinding"></a>*LexicalBinding*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LexicalBinding-07d82831"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="LexicalBinding-d067a280"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="VariableStatement"></a>*VariableStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableStatement-e21edf3a"></a>`` var ``&emsp;*[VariableDeclarationList](#VariableDeclarationList)*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="VariableDeclarationList"></a>*VariableDeclarationList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclarationList-0f4cd65a"></a>*[VariableDeclaration](#VariableDeclaration)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="VariableDeclarationList-2c3a0675"></a>*[VariableDeclarationList](#VariableDeclarationList)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[VariableDeclaration](#VariableDeclaration)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="VariableDeclaration"></a>*VariableDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-07d82831"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-d067a280"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingPattern"></a>*BindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingPattern-22a4b38f"></a>*[ObjectBindingPattern](#ObjectBindingPattern)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingPattern-4f2a669c"></a>*[ArrayBindingPattern](#ArrayBindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ObjectBindingPattern"></a>*ObjectBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-81ba5a4a"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-290caaf8"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-eadb5f10"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="ArrayBindingPattern"></a>*ArrayBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-f99d733a"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-b7b304c9"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-1fcadd15"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="BindingPropertyList"></a>*BindingPropertyList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-33e60c4b"></a>*[BindingProperty](#BindingProperty)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-17a90c9e"></a>*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[BindingProperty](#BindingProperty)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElementList"></a>*BindingElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElementList-2d312774"></a>*[BindingElisionElement](#BindingElisionElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingElementList-c6c3a6f6"></a>*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[BindingElisionElement](#BindingElisionElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElisionElement"></a>*BindingElisionElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElisionElement-6cfe4dc7"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingProperty"></a>*BindingProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingProperty-88cf21e8"></a>*[SingleNameBinding](#SingleNameBinding)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-b1bb3b8f"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElement"></a>*BindingElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElement-88cf21e8"></a>*[SingleNameBinding](#SingleNameBinding)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingElement-c9872fd0"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleNameBinding"></a>*SingleNameBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SingleNameBinding-461bcf3a"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="BindingRestElement"></a>*BindingRestElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingRestElement-d895576d"></a>`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="EmptyStatement"></a>*EmptyStatement* **:**  
&emsp;&emsp;&emsp;<a name="EmptyStatement-4a0dac03"></a>`` ; ``  
  
&emsp;&emsp;<a name="ExpressionStatement"></a>*ExpressionStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ExpressionStatement-d307f562"></a>[lookahead ∉ { `` { ``, `` function ``, `` class ``, `` let ``&emsp;`` [ `` }]&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="IfStatement"></a>*IfStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IfStatement-fec214c4"></a>`` if ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>&emsp;`` else ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IfStatement-fb98736a"></a>`` if ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="IterationStatement"></a>*IterationStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IterationStatement-ba73fb59"></a>`` do ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>&emsp;`` while ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="IterationStatement-8a37c0c0"></a>`` while ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-17470b61"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ { `` let ``&emsp;`` [ `` }]&emsp;*[Expression](#Expression)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-5780fda0"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[VariableDeclarationList](#VariableDeclarationList)*<sub>[?Yield]</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-84389299"></a>`` for ``&emsp;`` ( ``&emsp;*[LexicalDeclaration](#LexicalDeclaration)*<sub>[?Yield]</sub>&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-89a1d865"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ { `` let ``&emsp;`` [ `` }]&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-09924fdf"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-72a15f72"></a>`` for ``&emsp;`` ( ``&emsp;*[ForDeclaration](#ForDeclaration)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-acb0da27"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ≠ `` let ``]&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-7c78d3a4"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-fa94ed48"></a>`` for ``&emsp;`` ( ``&emsp;*[ForDeclaration](#ForDeclaration)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="ForDeclaration"></a>*ForDeclaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ForDeclaration-0a5be63b"></a>*[LetOrConst](#LetOrConst)*&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ForBinding"></a>*ForBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ForBinding-46cd8f8d"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ForBinding-7a565a71"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ContinueStatement"></a>*ContinueStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ContinueStatement-e903cf81"></a>`` continue ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ContinueStatement-aa0a32b6"></a>`` continue ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="BreakStatement"></a>*BreakStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BreakStatement-b65229e7"></a>`` break ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="BreakStatement-8393d74c"></a>`` break ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ReturnStatement"></a>*ReturnStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ReturnStatement-0b293381"></a>`` return ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ReturnStatement-07ba34fa"></a>`` return ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="WithStatement"></a>*WithStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="WithStatement-3f4e1dc0"></a>`` with ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="SwitchStatement"></a>*SwitchStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SwitchStatement-7243ed39"></a>`` switch ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[CaseBlock](#CaseBlock)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CaseBlock"></a>*CaseBlock*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseBlock-6c183f57"></a>`` { ``&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="CaseBlock-f4a86919"></a>`` { ``&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;*[DefaultClause](#DefaultClause)*<sub>[?Yield, ?Return]</sub>&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="CaseClauses"></a>*CaseClauses*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseClauses-99a26ad4"></a>*[CaseClause](#CaseClause)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="CaseClauses-3f591ceb"></a>*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub>&emsp;*[CaseClause](#CaseClause)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CaseClause"></a>*CaseClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseClause-f2e21f55"></a>`` case ``&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` : ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="DefaultClause"></a>*DefaultClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="DefaultClause-59037441"></a>`` default ``&emsp;`` : ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="LabelledStatement"></a>*LabelledStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelledStatement-30100c33"></a>*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[LabelledItem](#LabelledItem)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="LabelledItem"></a>*LabelledItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelledItem-a5329c8e"></a>*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="LabelledItem-418c3940"></a>*[FunctionDeclaration](#FunctionDeclaration)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ThrowStatement"></a>*ThrowStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ThrowStatement-465bd174"></a>`` throw ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[Expression](#Expression)*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="TryStatement"></a>*TryStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TryStatement-624913c6"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Catch](#Catch)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="TryStatement-4d12a36d"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Finally](#Finally)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="TryStatement-0e4cced4"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Catch](#Catch)*<sub>[?Yield, ?Return]</sub>&emsp;*[Finally](#Finally)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Catch"></a>*Catch*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Catch-626e3734"></a>`` catch ``&emsp;`` ( ``&emsp;*[CatchParameter](#CatchParameter)*<sub>[?Yield]</sub>&emsp;`` ) ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Finally"></a>*Finally*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Finally-a8da6c41"></a>`` finally ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CatchParameter"></a>*CatchParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CatchParameter-46cd8f8d"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CatchParameter-7a565a71"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="DebuggerStatement"></a>*DebuggerStatement* **:**  
&emsp;&emsp;&emsp;<a name="DebuggerStatement-352e6172"></a>`` debugger ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="FunctionDeclaration"></a>*FunctionDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-2f85ccbd"></a>`` function ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-3294d277"></a>[+Default]&emsp;`` function ``&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="FunctionExpression"></a>*FunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="FunctionExpression-8379937e"></a>`` function ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="StrictFormalParameters"></a>*StrictFormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StrictFormalParameters-f2b7baf7"></a>*[FormalParameters](#FormalParameters)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameters"></a>*FormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameters-37b9c04c"></a>[empty]  
&emsp;&emsp;&emsp;<a name="FormalParameters-d2a3a034"></a>*[FormalParameterList](#FormalParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameterList"></a>*FormalParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameterList-e68a5f58"></a>*[FunctionRestParameter](#FunctionRestParameter)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalParameterList-b8cc29a6"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalParameterList-b5146716"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[FunctionRestParameter](#FunctionRestParameter)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalsList"></a>*FormalsList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalsList-09746c9e"></a>*[FormalParameter](#FormalParameter)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalsList-0666e9c8"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[FormalParameter](#FormalParameter)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionRestParameter"></a>*FunctionRestParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionRestParameter-32c9732e"></a>*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameter"></a>*FormalParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameter-9ace2d44"></a>*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionBody"></a>*FunctionBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionBody-aba865c5"></a>*[FunctionStatementList](#FunctionStatementList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionStatementList"></a>*FunctionStatementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionStatementList-ed437440"></a>*[StatementList](#StatementList)*<sub>[?Yield, Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="ArrowFunction"></a>*ArrowFunction*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrowFunction-5a88b959"></a>*[ArrowParameters](#ArrowParameters)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` => ``&emsp;*[ConciseBody](#ConciseBody)*<sub>[?In]</sub>  
  
&emsp;&emsp;<a name="ArrowParameters"></a>*ArrowParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrowParameters-46cd8f8d"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArrowParameters-b3fd8fa6"></a>*[CoverParenthesizedExpressionAndArrowParameterList](#CoverParenthesizedExpressionAndArrowParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ConciseBody"></a>*ConciseBody*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ConciseBody-3d988d12"></a>[lookahead ≠ `` { ``]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;<a name="ConciseBody-004ac004"></a>`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="MethodDefinition"></a>*MethodDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MethodDefinition-5c28c96f"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[StrictFormalParameters](#StrictFormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="MethodDefinition-7dafbe5a"></a>*[GeneratorMethod](#GeneratorMethod)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MethodDefinition-3a410e0c"></a>`` get ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="MethodDefinition-1f33fd7a"></a>`` set ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[PropertySetParameterList](#PropertySetParameterList)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertySetParameterList"></a>*PropertySetParameterList* **:**  
&emsp;&emsp;&emsp;<a name="PropertySetParameterList-497954f5"></a>*[FormalParameter](#FormalParameter)*  
  
&emsp;&emsp;<a name="GeneratorMethod"></a>*GeneratorMethod*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="GeneratorMethod-856e1087"></a>`` * ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[StrictFormalParameters](#StrictFormalParameters)*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorDeclaration"></a>*GeneratorDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="GeneratorDeclaration-5b7c9573"></a>`` function ``&emsp;`` * ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="GeneratorDeclaration-d291018a"></a>[+Default]&emsp;`` function ``&emsp;`` * ``&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorExpression"></a>*GeneratorExpression* **:**  
&emsp;&emsp;&emsp;<a name="GeneratorExpression-3d1a82cb"></a>`` function ``&emsp;`` * ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[Yield]</sub><sub>opt</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorBody"></a>*GeneratorBody* **:**  
&emsp;&emsp;&emsp;<a name="GeneratorBody-5a62e04c"></a>*[FunctionBody](#FunctionBody)*<sub>[Yield]</sub>  
  
&emsp;&emsp;<a name="YieldExpression"></a>*YieldExpression*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;<a name="YieldExpression-d1df3360"></a>`` yield ``  
&emsp;&emsp;&emsp;<a name="YieldExpression-62c9d6fc"></a>`` yield ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, Yield]</sub>  
&emsp;&emsp;&emsp;<a name="YieldExpression-34d90b21"></a>`` yield ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` * ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, Yield]</sub>  
  
&emsp;&emsp;<a name="ClassDeclaration"></a>*ClassDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-3a47f50b"></a>`` class ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-f1909d63"></a>[+Default]&emsp;`` class ``&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassExpression"></a>*ClassExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassExpression-89a169d4"></a>`` class ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassTail"></a>*ClassTail*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassTail-c3a1600d"></a>*[ClassHeritage](#ClassHeritage)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` { ``&emsp;*[ClassBody](#ClassBody)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="ClassHeritage"></a>*ClassHeritage*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassHeritage-ccce93bb"></a>`` extends ``&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassBody"></a>*ClassBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassBody-e993dd69"></a>*[ClassElementList](#ClassElementList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassElementList"></a>*ClassElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassElementList-541da32c"></a>*[ClassElement](#ClassElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElementList-27053723"></a>*[ClassElementList](#ClassElementList)*<sub>[?Yield]</sub>&emsp;*[ClassElement](#ClassElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassElement"></a>*ClassElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassElement-da6bdd4c"></a>*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElement-80402d39"></a>`` static ``&emsp;*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElement-4a0dac03"></a>`` ; ``  
  
&emsp;&emsp;<a name="Script"></a>*Script* **:**  
&emsp;&emsp;&emsp;<a name="Script-08c8df8e"></a>*[ScriptBody](#ScriptBody)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ScriptBody"></a>*ScriptBody* **:**  
&emsp;&emsp;&emsp;<a name="ScriptBody-cf403a0c"></a>*[StatementList](#StatementList)*  
  
&emsp;&emsp;<a name="Module"></a>*Module* **:**  
&emsp;&emsp;&emsp;<a name="Module-52f49b96"></a>*[ModuleBody](#ModuleBody)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ModuleBody"></a>*ModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="ModuleBody-89010d7d"></a>*[ModuleItemList](#ModuleItemList)*  
  
&emsp;&emsp;<a name="ModuleItemList"></a>*ModuleItemList* **:**  
&emsp;&emsp;&emsp;<a name="ModuleItemList-029ec31e"></a>*[ModuleItem](#ModuleItem)*  
&emsp;&emsp;&emsp;<a name="ModuleItemList-75ddb725"></a>*[ModuleItemList](#ModuleItemList)*&emsp;*[ModuleItem](#ModuleItem)*  
  
&emsp;&emsp;<a name="ModuleItem"></a>*ModuleItem* **:**  
&emsp;&emsp;&emsp;<a name="ModuleItem-e0559377"></a>*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleItem-298e81b0"></a>*[ExportDeclaration](#ExportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleItem-d791d1c9"></a>*[StatementListItem](#StatementListItem)*  
  
&emsp;&emsp;<a name="ImportDeclaration"></a>*ImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-1a51d4c5"></a>`` import ``&emsp;*[ImportClause](#ImportClause)*&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-a1d094cc"></a>`` import ``&emsp;*[ModuleSpecifier](#ModuleSpecifier)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ImportClause"></a>*ImportClause* **:**  
&emsp;&emsp;&emsp;<a name="ImportClause-3a2f22cc"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*  
&emsp;&emsp;&emsp;<a name="ImportClause-f35b66f8"></a>*[NameSpaceImport](#NameSpaceImport)*  
&emsp;&emsp;&emsp;<a name="ImportClause-cdf0063c"></a>*[NamedImports](#NamedImports)*  
&emsp;&emsp;&emsp;<a name="ImportClause-cbd47597"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*&emsp;`` , ``&emsp;*[NameSpaceImport](#NameSpaceImport)*  
&emsp;&emsp;&emsp;<a name="ImportClause-8a1f1182"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*&emsp;`` , ``&emsp;*[NamedImports](#NamedImports)*  
  
&emsp;&emsp;<a name="ImportedDefaultBinding"></a>*ImportedDefaultBinding* **:**  
&emsp;&emsp;&emsp;<a name="ImportedDefaultBinding-bedec05a"></a>*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="NameSpaceImport"></a>*NameSpaceImport* **:**  
&emsp;&emsp;&emsp;<a name="NameSpaceImport-b7641ff3"></a>`` * ``&emsp;`` as ``&emsp;*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="NamedImports"></a>*NamedImports* **:**  
&emsp;&emsp;&emsp;<a name="NamedImports-81ba5a4a"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="NamedImports-835252f8"></a>`` { ``&emsp;*[ImportsList](#ImportsList)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="NamedImports-6f18d3a2"></a>`` { ``&emsp;*[ImportsList](#ImportsList)*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="FromClause"></a>*FromClause* **:**  
&emsp;&emsp;&emsp;<a name="FromClause-ac457a7a"></a>`` from ``&emsp;*[ModuleSpecifier](#ModuleSpecifier)*  
  
&emsp;&emsp;<a name="ImportsList"></a>*ImportsList* **:**  
&emsp;&emsp;&emsp;<a name="ImportsList-5292cb55"></a>*[ImportSpecifier](#ImportSpecifier)*  
&emsp;&emsp;&emsp;<a name="ImportsList-82009fbc"></a>*[ImportsList](#ImportsList)*&emsp;`` , ``&emsp;*[ImportSpecifier](#ImportSpecifier)*  
  
&emsp;&emsp;<a name="ImportSpecifier"></a>*ImportSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ImportSpecifier-bedec05a"></a>*[ImportedBinding](#ImportedBinding)*  
&emsp;&emsp;&emsp;<a name="ImportSpecifier-38da6908"></a>*[IdentifierName](#IdentifierName)*&emsp;`` as ``&emsp;*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="ModuleSpecifier"></a>*ModuleSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ModuleSpecifier-5c74e54d"></a>*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="ImportedBinding"></a>*ImportedBinding* **:**  
&emsp;&emsp;&emsp;<a name="ImportedBinding-50e97238"></a>*[BindingIdentifier](#BindingIdentifier)*  
  
&emsp;&emsp;<a name="ExportDeclaration"></a>*ExportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-56ae069c"></a>`` export ``&emsp;`` * ``&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-54a8804a"></a>`` export ``&emsp;*[ExportClause](#ExportClause)*&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-b6878be3"></a>`` export ``&emsp;*[ExportClause](#ExportClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-6c6de801"></a>`` export ``&emsp;*[VariableStatement](#VariableStatement)*  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-828f5ae3"></a>`` export ``&emsp;*[Declaration](#Declaration)*  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-525566ec"></a>`` export ``&emsp;`` default ``&emsp;*[HoistableDeclaration](#HoistableDeclaration)*<sub>[Default]</sub>  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-64efdfce"></a>`` export ``&emsp;`` default ``&emsp;*[ClassDeclaration](#ClassDeclaration)*<sub>[Default]</sub>  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-6c7ca5a7"></a>`` export ``&emsp;`` default ``&emsp;[lookahead ∉ { `` function ``, `` class `` }]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[In]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ExportClause"></a>*ExportClause* **:**  
&emsp;&emsp;&emsp;<a name="ExportClause-81ba5a4a"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ExportClause-29b1414e"></a>`` { ``&emsp;*[ExportsList](#ExportsList)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ExportClause-c16c88fe"></a>`` { ``&emsp;*[ExportsList](#ExportsList)*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="ExportsList"></a>*ExportsList* **:**  
&emsp;&emsp;&emsp;<a name="ExportsList-5b554fef"></a>*[ExportSpecifier](#ExportSpecifier)*  
&emsp;&emsp;&emsp;<a name="ExportsList-1907cd0c"></a>*[ExportsList](#ExportsList)*&emsp;`` , ``&emsp;*[ExportSpecifier](#ExportSpecifier)*  
  
&emsp;&emsp;<a name="ExportSpecifier"></a>*ExportSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ExportSpecifier-0ebb31e2"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="ExportSpecifier-a9552c46"></a>*[IdentifierName](#IdentifierName)*&emsp;`` as ``&emsp;*[IdentifierName](#IdentifierName)*  
  