&emsp;&emsp;<a name="SourceCharacter"></a>*SourceCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SourceCharacter-xks4vqzw"></a>any Unicode code point  
  
&emsp;&emsp;<a name="InputElementDiv"></a>*InputElementDiv* **::**  
&emsp;&emsp;&emsp;<a name="InputElementDiv-fctcswat"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-ozmczrck"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-ft16wloj"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-gxwilro0"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-kanqhgik"></a>*[DivPunctuator](#DivPunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementDiv-ehmup46z"></a>*[RightBracePunctuator](#RightBracePunctuator)*  
  
&emsp;&emsp;<a name="InputElementRegExp"></a>*InputElementRegExp* **::**  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-fctcswat"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-ozmczrck"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-ft16wloj"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-gxwilro0"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-ehmup46z"></a>*[RightBracePunctuator](#RightBracePunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExp-mbzy6lvr"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
  
&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail"></a>*InputElementRegExpOrTemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-fctcswat"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-ozmczrck"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-ft16wloj"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-gxwilro0"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-mbzy6lvr"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
&emsp;&emsp;&emsp;<a name="InputElementRegExpOrTemplateTail-yq5uuf55"></a>*[TemplateSubstitutionTail](#TemplateSubstitutionTail)*  
  
&emsp;&emsp;<a name="InputElementTemplateTail"></a>*InputElementTemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-fctcswat"></a>*[WhiteSpace](#WhiteSpace)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-ozmczrck"></a>*[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-ft16wloj"></a>*[Comment](#Comment)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-gxwilro0"></a>*[CommonToken](#CommonToken)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-kanqhgik"></a>*[DivPunctuator](#DivPunctuator)*  
&emsp;&emsp;&emsp;<a name="InputElementTemplateTail-yq5uuf55"></a>*[TemplateSubstitutionTail](#TemplateSubstitutionTail)*  
  
&emsp;&emsp;<a name="WhiteSpace"></a>*WhiteSpace* **::**  
&emsp;&emsp;&emsp;<a name="WhiteSpace-k4soaizl"></a>&lt;TAB&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-w_cit1lu"></a>&lt;VT&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-dvfflmsr"></a>&lt;FF&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-01dfufyk"></a>&lt;SP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-qe6qukax"></a>&lt;NBSP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace--4gwujcl"></a>&lt;ZWNBSP&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-68nsiosh"></a>&lt;USP&gt;  
  
&emsp;&emsp;<a name="LineTerminator"></a>*LineTerminator* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminator-eznvjwhz"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-q1yr1eki"></a>&lt;CR&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-eaiqsw9w"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminator-z8h10fxn"></a>&lt;PS&gt;  
  
&emsp;&emsp;<a name="LineTerminatorSequence"></a>*LineTerminatorSequence* **::**  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-eznvjwhz"></a>&lt;LF&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-q1yr1eki"></a>&lt;CR&gt;&emsp;[lookahead ≠ &lt;LF&gt;]  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-eaiqsw9w"></a>&lt;LS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-z8h10fxn"></a>&lt;PS&gt;  
&emsp;&emsp;&emsp;<a name="LineTerminatorSequence-lajs7kyd"></a>&lt;CR&gt;&emsp;&lt;LF&gt;  
  
&emsp;&emsp;<a name="Comment"></a>*Comment* **::**  
&emsp;&emsp;&emsp;<a name="Comment-sieyeref"></a>*[MultiLineComment](#MultiLineComment)*  
&emsp;&emsp;&emsp;<a name="Comment-sscrkqcd"></a>*[SingleLineComment](#SingleLineComment)*  
  
&emsp;&emsp;<a name="MultiLineComment"></a>*MultiLineComment* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineComment-hhzm60cr"></a>`` /* ``&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>&emsp;`` */ ``  
  
&emsp;&emsp;<a name="MultiLineCommentChars"></a>*MultiLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-jkbv-8n6"></a>*[MultiLineNotAsteriskChar](#MultiLineNotAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-b8trwjej"></a>`` * ``&emsp;*[PostAsteriskCommentChars](#PostAsteriskCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="PostAsteriskCommentChars"></a>*PostAsteriskCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="PostAsteriskCommentChars-jwfqbwpm"></a>*[MultiLineNotForwardSlashOrAsteriskChar](#MultiLineNotForwardSlashOrAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="PostAsteriskCommentChars-b8trwjej"></a>`` * ``&emsp;*[PostAsteriskCommentChars](#PostAsteriskCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="MultiLineNotAsteriskChar"></a>*MultiLineNotAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineNotAsteriskChar-lflef8ko"></a>*[SourceCharacter](#SourceCharacter)* **but not** `` * ``  
  
&emsp;&emsp;<a name="MultiLineNotForwardSlashOrAsteriskChar"></a>*MultiLineNotForwardSlashOrAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineNotForwardSlashOrAsteriskChar-hdfnrv5z"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` / `` **or** `` * ``  
  
&emsp;&emsp;<a name="SingleLineComment"></a>*SingleLineComment* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineComment-u-3whel6"></a>`` // ``&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChars"></a>*SingleLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChars-rshuryvh"></a>*[SingleLineCommentChar](#SingleLineCommentChar)*&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChar"></a>*SingleLineCommentChar* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChar-lvvfp8iw"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="CommonToken"></a>*CommonToken* **::**  
&emsp;&emsp;&emsp;<a name="CommonToken-drsx4tka"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="CommonToken-7hjz1m8p"></a>*[Punctuator](#Punctuator)*  
&emsp;&emsp;&emsp;<a name="CommonToken-pui0b1rt"></a>*[NumericLiteral](#NumericLiteral)*  
&emsp;&emsp;&emsp;<a name="CommonToken-xhtltz00"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="CommonToken-psgubhwn"></a>*[Template](#Template)*  
  
&emsp;&emsp;<a name="IdentifierName"></a>*IdentifierName* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierName-q0afq8g8"></a>*[IdentifierStart](#IdentifierStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierName-cawc7ktu"></a>*[IdentifierName](#IdentifierName)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="IdentifierStart"></a>*IdentifierStart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierStart-cgljdgmz"></a>*[UnicodeIDStart](#UnicodeIDStart)*  
&emsp;&emsp;&emsp;<a name="IdentifierStart-emlmkqfm"></a>`` $ ``  
&emsp;&emsp;&emsp;<a name="IdentifierStart-b1zllonv"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierStart-b7ylgc5w"></a>`` \ ``&emsp;*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
  
&emsp;&emsp;<a name="IdentifierPart"></a>*IdentifierPart* **::**  
&emsp;&emsp;&emsp;<a name="IdentifierPart-nkrgdqi0"></a>*[UnicodeIDContinue](#UnicodeIDContinue)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-emlmkqfm"></a>`` $ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-b1zllonv"></a>`` _ ``  
&emsp;&emsp;&emsp;<a name="IdentifierPart-b7ylgc5w"></a>`` \ ``&emsp;*[UnicodeEscapeSequence](#UnicodeEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="IdentifierPart-ynldexir"></a>&lt;ZWNJ&gt;  
&emsp;&emsp;&emsp;<a name="IdentifierPart-zfgp9vws"></a>&lt;ZWJ&gt;  
  
&emsp;&emsp;<a name="UnicodeIDStart"></a>*UnicodeIDStart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDStart-0uivrwr2"></a>any Unicode code point with the Unicode property "ID_Start" or "Other_ID_Start"  
  
&emsp;&emsp;<a name="UnicodeIDContinue"></a>*UnicodeIDContinue* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeIDContinue-dc1rjkto"></a>any Unicode code point with the Unicode property "ID_Continue" or "Other_ID_Continue", or "Other_ID_Start"  
  
&emsp;&emsp;<a name="ReservedWord"></a>*ReservedWord* **::**  
&emsp;&emsp;&emsp;<a name="ReservedWord-o5jua5_x"></a>*[Keyword](#Keyword)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-nxg9wyg0"></a>*[FutureReservedWord](#FutureReservedWord)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-vphbieby"></a>*[NullLiteral](#NullLiteral)*  
&emsp;&emsp;&emsp;<a name="ReservedWord-nqjh_sxl"></a>*[BooleanLiteral](#BooleanLiteral)*  
  
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
&emsp;&emsp;&emsp;<a name="NullLiteral-d7uiab7a"></a>`` null ``  
  
&emsp;&emsp;<a name="BooleanLiteral"></a>*BooleanLiteral* **::**  
&emsp;&emsp;&emsp;<a name="BooleanLiteral--jc4xg27"></a>`` true ``  
&emsp;&emsp;&emsp;<a name="BooleanLiteral-i9lgnxtt"></a>`` false ``  
  
&emsp;&emsp;<a name="NumericLiteral"></a>*NumericLiteral* **::**  
&emsp;&emsp;&emsp;<a name="NumericLiteral-gma1bw5s"></a>*[DecimalLiteral](#DecimalLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-09cd3aiw"></a>*[BinaryIntegerLiteral](#BinaryIntegerLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-gy9x7snd"></a>*[OctalIntegerLiteral](#OctalIntegerLiteral)*  
&emsp;&emsp;&emsp;<a name="NumericLiteral-hqxkzjla"></a>*[HexIntegerLiteral](#HexIntegerLiteral)*  
  
&emsp;&emsp;<a name="DecimalLiteral"></a>*DecimalLiteral* **::**  
&emsp;&emsp;&emsp;<a name="DecimalLiteral--1gypvbs"></a>*[DecimalIntegerLiteral](#DecimalIntegerLiteral)*&emsp;`` . ``&emsp;*[DecimalDigits](#DecimalDigits)*<sub>opt</sub>&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="DecimalLiteral-xpoqnclz"></a>`` . ``&emsp;*[DecimalDigits](#DecimalDigits)*&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="DecimalLiteral-e9uvir9w"></a>*[DecimalIntegerLiteral](#DecimalIntegerLiteral)*&emsp;*[ExponentPart](#ExponentPart)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DecimalIntegerLiteral"></a>*DecimalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="DecimalIntegerLiteral-ulmkmvlx"></a>`` 0 ``  
&emsp;&emsp;&emsp;<a name="DecimalIntegerLiteral-i1pwo3hj"></a>*[NonZeroDigit](#NonZeroDigit)*&emsp;*[DecimalDigits](#DecimalDigits)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DecimalDigits"></a>*DecimalDigits* **::**  
&emsp;&emsp;&emsp;<a name="DecimalDigits-s4me4hlz"></a>*[DecimalDigit](#DecimalDigit)*  
&emsp;&emsp;&emsp;<a name="DecimalDigits-nyugv7lw"></a>*[DecimalDigits](#DecimalDigits)*&emsp;*[DecimalDigit](#DecimalDigit)*  
  
&emsp;&emsp;<a name="DecimalDigit"></a>*DecimalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="NonZeroDigit"></a>*NonZeroDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code></pre>
  
&emsp;&emsp;<a name="ExponentPart"></a>*ExponentPart* **::**  
&emsp;&emsp;&emsp;<a name="ExponentPart-f4n1gm76"></a>*[ExponentIndicator](#ExponentIndicator)*&emsp;*[SignedInteger](#SignedInteger)*  
  
&emsp;&emsp;<a name="ExponentIndicator"></a>*ExponentIndicator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>e</code>     <code>E</code></pre>
  
&emsp;&emsp;<a name="SignedInteger"></a>*SignedInteger* **::**  
&emsp;&emsp;&emsp;<a name="SignedInteger-bxtox5eb"></a>*[DecimalDigits](#DecimalDigits)*  
&emsp;&emsp;&emsp;<a name="SignedInteger-o9f-v3mh"></a>`` + ``&emsp;*[DecimalDigits](#DecimalDigits)*  
&emsp;&emsp;&emsp;<a name="SignedInteger-waadsnwo"></a>`` - ``&emsp;*[DecimalDigits](#DecimalDigits)*  
  
&emsp;&emsp;<a name="BinaryIntegerLiteral"></a>*BinaryIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="BinaryIntegerLiteral-ya14f57w"></a>`` 0b ``&emsp;*[BinaryDigits](#BinaryDigits)*  
&emsp;&emsp;&emsp;<a name="BinaryIntegerLiteral-fb8x2bgl"></a>`` 0B ``&emsp;*[BinaryDigits](#BinaryDigits)*  
  
&emsp;&emsp;<a name="BinaryDigits"></a>*BinaryDigits* **::**  
&emsp;&emsp;&emsp;<a name="BinaryDigits-5fhui2lc"></a>*[BinaryDigit](#BinaryDigit)*  
&emsp;&emsp;&emsp;<a name="BinaryDigits-gqp0qw4u"></a>*[BinaryDigits](#BinaryDigits)*&emsp;*[BinaryDigit](#BinaryDigit)*  
  
&emsp;&emsp;<a name="BinaryDigit"></a>*BinaryDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code></pre>
  
&emsp;&emsp;<a name="OctalIntegerLiteral"></a>*OctalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="OctalIntegerLiteral-qavsshas"></a>`` 0o ``&emsp;*[OctalDigits](#OctalDigits)*  
&emsp;&emsp;&emsp;<a name="OctalIntegerLiteral-ojzs-r9-"></a>`` 0O ``&emsp;*[OctalDigits](#OctalDigits)*  
  
&emsp;&emsp;<a name="OctalDigits"></a>*OctalDigits* **::**  
&emsp;&emsp;&emsp;<a name="OctalDigits-mbwdu1ji"></a>*[OctalDigit](#OctalDigit)*  
&emsp;&emsp;&emsp;<a name="OctalDigits-n6kv_lqw"></a>*[OctalDigits](#OctalDigits)*&emsp;*[OctalDigit](#OctalDigit)*  
  
&emsp;&emsp;<a name="OctalDigit"></a>*OctalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code></pre>
  
&emsp;&emsp;<a name="HexIntegerLiteral"></a>*HexIntegerLiteral* **::**  
&emsp;&emsp;&emsp;<a name="HexIntegerLiteral-zxvbgn4l"></a>`` 0x ``&emsp;*[HexDigits](#HexDigits)*  
&emsp;&emsp;&emsp;<a name="HexIntegerLiteral-nvdw81s7"></a>`` 0X ``&emsp;*[HexDigits](#HexDigits)*  
  
&emsp;&emsp;<a name="HexDigits"></a>*HexDigits* **::**  
&emsp;&emsp;&emsp;<a name="HexDigits-omskcs0d"></a>*[HexDigit](#HexDigit)*  
&emsp;&emsp;&emsp;<a name="HexDigits-yciymy2l"></a>*[HexDigits](#HexDigits)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="HexDigit"></a>*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code>  
&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>  
&emsp;&emsp;&emsp;<code>E</code>     <code>F</code></pre>
  
&emsp;&emsp;<a name="StringLiteral"></a>*StringLiteral* **::**  
&emsp;&emsp;&emsp;<a name="StringLiteral-fdix8v-c"></a>`` " ``&emsp;*[DoubleStringCharacters](#DoubleStringCharacters)*<sub>opt</sub>&emsp;`` " ``  
&emsp;&emsp;&emsp;<a name="StringLiteral-guyz2t4p"></a>`` ' ``&emsp;*[SingleStringCharacters](#SingleStringCharacters)*<sub>opt</sub>&emsp;`` ' ``  
  
&emsp;&emsp;<a name="DoubleStringCharacters"></a>*DoubleStringCharacters* **::**  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacters-i9q8d_st"></a>*[DoubleStringCharacter](#DoubleStringCharacter)*&emsp;*[DoubleStringCharacters](#DoubleStringCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleStringCharacters"></a>*SingleStringCharacters* **::**  
&emsp;&emsp;&emsp;<a name="SingleStringCharacters-f9kevwoi"></a>*[SingleStringCharacter](#SingleStringCharacter)*&emsp;*[SingleStringCharacters](#SingleStringCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DoubleStringCharacter"></a>*DoubleStringCharacter* **::**  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-qh-v7bpd"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` " `` **or** `` \ `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-6n2njt_x"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="DoubleStringCharacter-ajkpm2ja"></a>*[LineContinuation](#LineContinuation)*  
  
&emsp;&emsp;<a name="SingleStringCharacter"></a>*SingleStringCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-xqnh0twg"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ' `` **or** `` \ `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-6n2njt_x"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="SingleStringCharacter-ajkpm2ja"></a>*[LineContinuation](#LineContinuation)*  
  
&emsp;&emsp;<a name="LineContinuation"></a>*LineContinuation* **::**  
&emsp;&emsp;&emsp;<a name="LineContinuation-xik9y9lz"></a>`` \ ``&emsp;*[LineTerminatorSequence](#LineTerminatorSequence)*  
  
&emsp;&emsp;<a name="EscapeSequence"></a>*EscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="EscapeSequence-6ehvb3kw"></a>*[CharacterEscapeSequence](#CharacterEscapeSequence)*  
&emsp;&emsp;&emsp;<a name="EscapeSequence-ulmkmvlx"></a>`` 0 ``&emsp;[lookahead ∉ *[DecimalDigit](#DecimalDigit)*]  
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
  
&emsp;&emsp;<a name="RegularExpressionLiteral"></a>*RegularExpressionLiteral* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionLiteral-v3gfo--_"></a>`` / ``&emsp;*[RegularExpressionBody](#RegularExpressionBody)*&emsp;`` / ``&emsp;*[RegularExpressionFlags](#RegularExpressionFlags)*  
  
&emsp;&emsp;<a name="RegularExpressionBody"></a>*RegularExpressionBody* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionBody-u6ewnk3q"></a>*[RegularExpressionFirstChar](#RegularExpressionFirstChar)*&emsp;*[RegularExpressionChars](#RegularExpressionChars)*  
  
&emsp;&emsp;<a name="RegularExpressionChars"></a>*RegularExpressionChars* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionChars-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionChars-qygc7azr"></a>*[RegularExpressionChars](#RegularExpressionChars)*&emsp;*[RegularExpressionChar](#RegularExpressionChar)*  
  
&emsp;&emsp;<a name="RegularExpressionFirstChar"></a>*RegularExpressionFirstChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-2hsmcj0g"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` * `` **or** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-njv5p0rd"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
&emsp;&emsp;&emsp;<a name="RegularExpressionFirstChar-xmafjorq"></a>*[RegularExpressionClass](#RegularExpressionClass)*  
  
&emsp;&emsp;<a name="RegularExpressionChar"></a>*RegularExpressionChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-8mp_fppd"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-njv5p0rd"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
&emsp;&emsp;&emsp;<a name="RegularExpressionChar-xmafjorq"></a>*[RegularExpressionClass](#RegularExpressionClass)*  
  
&emsp;&emsp;<a name="RegularExpressionBackslashSequence"></a>*RegularExpressionBackslashSequence* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionBackslashSequence-12vrrw1t"></a>`` \ ``&emsp;*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)*  
  
&emsp;&emsp;<a name="RegularExpressionNonTerminator"></a>*RegularExpressionNonTerminator* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionNonTerminator-lvvfp8iw"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="RegularExpressionClass"></a>*RegularExpressionClass* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClass-tbvecnsu"></a>`` [ ``&emsp;*[RegularExpressionClassChars](#RegularExpressionClassChars)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="RegularExpressionClassChars"></a>*RegularExpressionClassChars* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChars-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChars-dr3lbtf5"></a>*[RegularExpressionClassChars](#RegularExpressionClassChars)*&emsp;*[RegularExpressionClassChar](#RegularExpressionClassChar)*  
  
&emsp;&emsp;<a name="RegularExpressionClassChar"></a>*RegularExpressionClassChar* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChar-f9eiuy71"></a>*[RegularExpressionNonTerminator](#RegularExpressionNonTerminator)* **but not** **one of** `` ] `` **or** `` \ ``  
&emsp;&emsp;&emsp;<a name="RegularExpressionClassChar-njv5p0rd"></a>*[RegularExpressionBackslashSequence](#RegularExpressionBackslashSequence)*  
  
&emsp;&emsp;<a name="RegularExpressionFlags"></a>*RegularExpressionFlags* **::**  
&emsp;&emsp;&emsp;<a name="RegularExpressionFlags-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="RegularExpressionFlags-_o79zthn"></a>*[RegularExpressionFlags](#RegularExpressionFlags)*&emsp;*[IdentifierPart](#IdentifierPart)*  
  
&emsp;&emsp;<a name="Template"></a>*Template* **::**  
&emsp;&emsp;&emsp;<a name="Template-e_otk8es"></a>*[NoSubstitutionTemplate](#NoSubstitutionTemplate)*  
&emsp;&emsp;&emsp;<a name="Template-q5pllvwq"></a>*[TemplateHead](#TemplateHead)*  
  
&emsp;&emsp;<a name="NoSubstitutionTemplate"></a>*NoSubstitutionTemplate* **::**  
&emsp;&emsp;&emsp;<a name="NoSubstitutionTemplate-bw9ca6ur"></a>`` ` ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TemplateHead"></a>*TemplateHead* **::**  
&emsp;&emsp;&emsp;<a name="TemplateHead-v7fy_fdt"></a>`` ` ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;<a name="TemplateSubstitutionTail"></a>*TemplateSubstitutionTail* **::**  
&emsp;&emsp;&emsp;<a name="TemplateSubstitutionTail-zlwdxe92"></a>*[TemplateMiddle](#TemplateMiddle)*  
&emsp;&emsp;&emsp;<a name="TemplateSubstitutionTail-v_5hijma"></a>*[TemplateTail](#TemplateTail)*  
  
&emsp;&emsp;<a name="TemplateMiddle"></a>*TemplateMiddle* **::**  
&emsp;&emsp;&emsp;<a name="TemplateMiddle-n2nbtpup"></a>`` } ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;<a name="TemplateTail"></a>*TemplateTail* **::**  
&emsp;&emsp;&emsp;<a name="TemplateTail-_o9bwnqb"></a>`` } ``&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;<a name="TemplateCharacters"></a>*TemplateCharacters* **::**  
&emsp;&emsp;&emsp;<a name="TemplateCharacters--mjqxz72"></a>*[TemplateCharacter](#TemplateCharacter)*&emsp;*[TemplateCharacters](#TemplateCharacters)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TemplateCharacter"></a>*TemplateCharacter* **::**  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-emlmkqfm"></a>`` $ ``&emsp;[lookahead ≠ `` { ``]  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-6n2njt_x"></a>`` \ ``&emsp;*[EscapeSequence](#EscapeSequence)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-ajkpm2ja"></a>*[LineContinuation](#LineContinuation)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-vegl2qv9"></a>*[LineTerminatorSequence](#LineTerminatorSequence)*  
&emsp;&emsp;&emsp;<a name="TemplateCharacter-tidqqejp"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** `` \ `` **or** `` $ `` **or** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="IdentifierReference"></a>*IdentifierReference*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IdentifierReference-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="IdentifierReference-0d8zyjn8"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="BindingIdentifier"></a>*BindingIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingIdentifier-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="BindingIdentifier-0d8zyjn8"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="LabelIdentifier"></a>*LabelIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelIdentifier-bras6mo_"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="LabelIdentifier-0d8zyjn8"></a>[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;<a name="Identifier"></a>*Identifier* **:**  
&emsp;&emsp;&emsp;<a name="Identifier-v6xddc2h"></a>*[IdentifierName](#IdentifierName)* **but not** *[ReservedWord](#ReservedWord)*  
  
&emsp;&emsp;<a name="PrimaryExpression"></a>*PrimaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-jo4mwtvh"></a>`` this ``  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-i2hxnrih"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-kul-a19e"></a>*[Literal](#Literal)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-g_mjk5cm"></a>*[ArrayLiteral](#ArrayLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-zreje_zz"></a>*[ObjectLiteral](#ObjectLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-jc7szv1s"></a>*[FunctionExpression](#FunctionExpression)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-2m5tsvzv"></a>*[ClassExpression](#ClassExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-q7f39ayg"></a>*[GeneratorExpression](#GeneratorExpression)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-mbzy6lvr"></a>*[RegularExpressionLiteral](#RegularExpressionLiteral)*  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-2zis6bbu"></a>*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PrimaryExpression-yrb110hm"></a>*[CoverParenthesizedExpressionAndArrowParameterList](#CoverParenthesizedExpressionAndArrowParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList"></a>*CoverParenthesizedExpressionAndArrowParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-s6bvnd5v"></a>`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-eormm5tk"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-lr2tpcvq"></a>`` ( ``&emsp;`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CoverParenthesizedExpressionAndArrowParameterList-8guaj-ks"></a>`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="Literal"></a>*Literal* **:**  
&emsp;&emsp;&emsp;<a name="Literal-vphbieby"></a>*[NullLiteral](#NullLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-nqjh_sxl"></a>*[BooleanLiteral](#BooleanLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-pui0b1rt"></a>*[NumericLiteral](#NumericLiteral)*  
&emsp;&emsp;&emsp;<a name="Literal-xhtltz00"></a>*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="ArrayLiteral"></a>*ArrayLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-kg5ha7xc"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-cqjjuksr"></a>`` [ ``&emsp;*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayLiteral-yjc94a7j"></a>`` [ ``&emsp;*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ElementList"></a>*ElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ElementList-2aa1epou"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-fbpz0ate"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-_sr5sq6t"></a>*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ElementList-aleaauxs"></a>*[ElementList](#ElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="Elision"></a>*Elision* **:**  
&emsp;&emsp;&emsp;<a name="Elision-lhh3u7f7"></a>`` , ``  
&emsp;&emsp;&emsp;<a name="Elision-gg0bjle3"></a>*[Elision](#Elision)*&emsp;`` , ``  
  
&emsp;&emsp;<a name="SpreadElement"></a>*SpreadElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SpreadElement-w7ifpmpd"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="ObjectLiteral"></a>*ObjectLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-gbpaspne"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-g--o073w"></a>`` { ``&emsp;*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectLiteral-hwnsf_iz"></a>`` { ``&emsp;*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertyDefinitionList"></a>*PropertyDefinitionList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyDefinitionList-zxofg8tg"></a>*[PropertyDefinition](#PropertyDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinitionList-mvlwazei"></a>*[PropertyDefinitionList](#PropertyDefinitionList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[PropertyDefinition](#PropertyDefinition)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PropertyDefinition"></a>*PropertyDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-i2hxnrih"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-3wg6qczf"></a>*[CoverInitializedName](#CoverInitializedName)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-8tkldtak"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PropertyDefinition-s8ilfl9g"></a>*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PropertyName"></a>*PropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PropertyName-5x4jbee2"></a>*[LiteralPropertyName](#LiteralPropertyName)*  
&emsp;&emsp;&emsp;<a name="PropertyName-nimmmso5"></a>*[ComputedPropertyName](#ComputedPropertyName)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="LiteralPropertyName"></a>*LiteralPropertyName* **:**  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-drsx4tka"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-xhtltz00"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="LiteralPropertyName-pui0b1rt"></a>*[NumericLiteral](#NumericLiteral)*  
  
&emsp;&emsp;<a name="ComputedPropertyName"></a>*ComputedPropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ComputedPropertyName-ltvvc-5a"></a>`` [ ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="CoverInitializedName"></a>*CoverInitializedName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CoverInitializedName-wtjotzwk"></a>*[IdentifierReference](#IdentifierReference)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[+In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="Initializer"></a>*Initializer*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Initializer-_d0ijvnh"></a>`` = ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="TemplateLiteral"></a>*TemplateLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateLiteral-e_otk8es"></a>*[NoSubstitutionTemplate](#NoSubstitutionTemplate)*  
&emsp;&emsp;&emsp;<a name="TemplateLiteral-vpxmqc6d"></a>*[TemplateHead](#TemplateHead)*&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;*[TemplateSpans](#TemplateSpans)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="TemplateSpans"></a>*TemplateSpans*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateSpans-v_5hijma"></a>*[TemplateTail](#TemplateTail)*  
&emsp;&emsp;&emsp;<a name="TemplateSpans-slt0jvdm"></a>*[TemplateMiddleList](#TemplateMiddleList)*<sub>[?Yield]</sub>&emsp;*[TemplateTail](#TemplateTail)*  
  
&emsp;&emsp;<a name="TemplateMiddleList"></a>*TemplateMiddleList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TemplateMiddleList-3h7jyz9j"></a>*[TemplateMiddle](#TemplateMiddle)*&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="TemplateMiddleList-r6zwqruv"></a>*[TemplateMiddleList](#TemplateMiddleList)*<sub>[?Yield]</sub>&emsp;*[TemplateMiddle](#TemplateMiddle)*&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="MemberExpression"></a>*MemberExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MemberExpression-jvcvemtw"></a>*[PrimaryExpression](#PrimaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-a74xd7de"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="MemberExpression-frbj984t"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="MemberExpression-fj52gjle"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-x4tzletw"></a>*[SuperProperty](#SuperProperty)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MemberExpression-yb7id2be"></a>*[MetaProperty](#MetaProperty)*  
&emsp;&emsp;&emsp;<a name="MemberExpression-cfq-hbbx"></a>`` new ``&emsp;*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="SuperProperty"></a>*SuperProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SuperProperty-tpjzdyqv"></a>`` super ``&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="SuperProperty-9pdsslwb"></a>`` super ``&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="MetaProperty"></a>*MetaProperty* **:**  
&emsp;&emsp;&emsp;<a name="MetaProperty-czvbijjt"></a>*[NewTarget](#NewTarget)*  
  
&emsp;&emsp;<a name="NewTarget"></a>*NewTarget* **:**  
&emsp;&emsp;&emsp;<a name="NewTarget-0t4hpsv9"></a>`` new ``&emsp;`` . ``&emsp;`` target ``  
  
&emsp;&emsp;<a name="NewExpression"></a>*NewExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="NewExpression-cnogaraa"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="NewExpression-51p618ta"></a>`` new ``&emsp;*[NewExpression](#NewExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="CallExpression"></a>*CallExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CallExpression-vks-z6n3"></a>*[MemberExpression](#MemberExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-ljkqw-iw"></a>*[SuperCall](#SuperCall)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-qugahahu"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CallExpression-2u2urbmg"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="CallExpression-u6lsbvgu"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="CallExpression-rc744wey"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>&emsp;*[TemplateLiteral](#TemplateLiteral)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="SuperCall"></a>*SuperCall*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SuperCall-qdmdlzzo"></a>`` super ``&emsp;*[Arguments](#Arguments)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Arguments-eormm5tk"></a>`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="Arguments-i0-5a5el"></a>`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ArgumentList"></a>*ArgumentList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArgumentList-1px9pijq"></a>*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-w7ifpmpd"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-f_i_7oqe"></a>*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArgumentList-z4rq-va3"></a>*[ArgumentList](#ArgumentList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LeftHandSideExpression"></a>*LeftHandSideExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LeftHandSideExpression-rq6tm1h6"></a>*[NewExpression](#NewExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LeftHandSideExpression-i8det4ck"></a>*[CallExpression](#CallExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="PostfixExpression"></a>*PostfixExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="PostfixExpression-glqbepvz"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="PostfixExpression-i_jjg0ex"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` ++ ``  
&emsp;&emsp;&emsp;<a name="PostfixExpression-jr0tcoqg"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` -- ``  
  
&emsp;&emsp;<a name="UnaryExpression"></a>*UnaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="UnaryExpression-tnvm6wcz"></a>*[PostfixExpression](#PostfixExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-v9wiw5nl"></a>`` delete ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-5dgdjy7z"></a>`` void ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-qxosuesc"></a>`` typeof ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-vwgxygda"></a>`` ++ ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-onrvwudi"></a>`` -- ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-o0kdmush"></a>`` + ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-odzkxnu5"></a>`` - ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-b9nqec7b"></a>`` ~ ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="UnaryExpression-ulcvcjyx"></a>`` ! ``&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="MultiplicativeExpression"></a>*MultiplicativeExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MultiplicativeExpression-1lzwwxvc"></a>*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MultiplicativeExpression-qxlmttl0"></a>*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>&emsp;*[MultiplicativeOperator](#MultiplicativeOperator)*&emsp;*[UnaryExpression](#UnaryExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="MultiplicativeOperator"></a>*MultiplicativeOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*</code>     <code>/</code>     <code>%</code></pre>
  
&emsp;&emsp;<a name="AdditiveExpression"></a>*AdditiveExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-zj3_9bui"></a>*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-dkl7f70y"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>&emsp;`` + ``&emsp;*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AdditiveExpression-7gvefllu"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>&emsp;`` - ``&emsp;*[MultiplicativeExpression](#MultiplicativeExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ShiftExpression"></a>*ShiftExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ShiftExpression-gcpjaxbx"></a>*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-s1cueleg"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` << ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-gabc2w-s"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` >> ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ShiftExpression-bfpitn7a"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>&emsp;`` >>> ``&emsp;*[AdditiveExpression](#AdditiveExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="RelationalExpression"></a>*RelationalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="RelationalExpression-5o0jutoh"></a>*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression--hocaojj"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` < ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-owny7otd"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` > ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-_ymfijdt"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` <= ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-sy_fnjl1"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` >= ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-1ec9rmdp"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` instanceof ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="RelationalExpression-9mtjpkmx"></a>[+In]&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` in ``&emsp;*[ShiftExpression](#ShiftExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="EqualityExpression"></a>*EqualityExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="EqualityExpression-hwqbsk2b"></a>*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-dxo0lfgu"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` == ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-cn2twrby"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` != ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-4hu79ipe"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` === ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="EqualityExpression-irptryux"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` !== ``&emsp;*[RelationalExpression](#RelationalExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseANDExpression"></a>*BitwiseANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseANDExpression-lun9ukxu"></a>*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseANDExpression-5qnlcti0"></a>*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` & ``&emsp;*[EqualityExpression](#EqualityExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseXORExpression"></a>*BitwiseXORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseXORExpression-xpbduqqp"></a>*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseXORExpression-tgmxlg5x"></a>*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` ^ ``&emsp;*[BitwiseANDExpression](#BitwiseANDExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BitwiseORExpression"></a>*BitwiseORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BitwiseORExpression-cey9dti3"></a>*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BitwiseORExpression-aw36khwc"></a>*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` | ``&emsp;*[BitwiseXORExpression](#BitwiseXORExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LogicalANDExpression"></a>*LogicalANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LogicalANDExpression-w3t6vbyj"></a>*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LogicalANDExpression-pfhxsi49"></a>*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` && ``&emsp;*[BitwiseORExpression](#BitwiseORExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LogicalORExpression"></a>*LogicalORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LogicalORExpression-3tsdtkb_"></a>*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="LogicalORExpression-tku92t5q"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` || ``&emsp;*[LogicalANDExpression](#LogicalANDExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="ConditionalExpression"></a>*ConditionalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ConditionalExpression-c0t3dfmv"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ConditionalExpression-quxiu2pr"></a>*[LogicalORExpression](#LogicalORExpression)*<sub>[?In, ?Yield]</sub>&emsp;`` ? ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="AssignmentExpression"></a>*AssignmentExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-p6xtyrzd"></a>*[ConditionalExpression](#ConditionalExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-uglis9ea"></a>[+Yield]&emsp;*[YieldExpression](#YieldExpression)*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-k987eemp"></a>*[ArrowFunction](#ArrowFunction)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-ijpo4eaq"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` = ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-xzqhr---"></a>*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;*[AssignmentOperator](#AssignmentOperator)*&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="AssignmentOperator"></a>*AssignmentOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*=</code>    <code>/=</code>    <code>%=</code>    <code>+=</code>    <code>-=</code>    <code>&lt;&lt;=</code>   <code>&gt;&gt;=</code>   <code>&gt;&gt;&gt;=</code>  <code>&amp;=</code>    <code>^=</code>  
&emsp;&emsp;&emsp;<code>|=</code></pre>
  
&emsp;&emsp;<a name="Expression"></a>*Expression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Expression-1px9pijq"></a>*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Expression-cwoazx1t"></a>*[Expression](#Expression)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="Statement"></a>*Statement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Statement-gre9qn6e"></a>*[BlockStatement](#BlockStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-iwwn8atx"></a>*[VariableStatement](#VariableStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-cziqu-45"></a>*[EmptyStatement](#EmptyStatement)*  
&emsp;&emsp;&emsp;<a name="Statement-gsqkt2bv"></a>*[ExpressionStatement](#ExpressionStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-skawbrez"></a>*[IfStatement](#IfStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-cdyywqxx"></a>*[BreakableStatement](#BreakableStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-hx0ynljx"></a>*[ContinueStatement](#ContinueStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-q4uv-sm3"></a>*[BreakStatement](#BreakStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-qm95e4wi"></a>[+Return]&emsp;*[ReturnStatement](#ReturnStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-ye6wwgts"></a>*[WithStatement](#WithStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-cij_anje"></a>*[LabelledStatement](#LabelledStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-hntake-o"></a>*[ThrowStatement](#ThrowStatement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-ex_crokj"></a>*[TryStatement](#TryStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="Statement-iseu28qi"></a>*[DebuggerStatement](#DebuggerStatement)*  
  
&emsp;&emsp;<a name="Declaration"></a>*Declaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Declaration-ykusttdk"></a>*[HoistableDeclaration](#HoistableDeclaration)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Declaration-bwk3zfoi"></a>*[ClassDeclaration](#ClassDeclaration)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="Declaration-jxaobega"></a>*[LexicalDeclaration](#LexicalDeclaration)*<sub>[+In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="HoistableDeclaration"></a>*HoistableDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="HoistableDeclaration--nqupnlb"></a>*[FunctionDeclaration](#FunctionDeclaration)*<sub>[?Yield, ?Default]</sub>  
&emsp;&emsp;&emsp;<a name="HoistableDeclaration-r3zmbc2x"></a>*[GeneratorDeclaration](#GeneratorDeclaration)*<sub>[?Yield, ?Default]</sub>  
  
&emsp;&emsp;<a name="BreakableStatement"></a>*BreakableStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BreakableStatement-kmxl4yum"></a>*[IterationStatement](#IterationStatement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="BreakableStatement-nuio-xfp"></a>*[SwitchStatement](#SwitchStatement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="BlockStatement"></a>*BlockStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BlockStatement-gt0s3zb5"></a>*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Block"></a>*Block*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Block--v-zyr0v"></a>`` { ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="StatementList"></a>*StatementList*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StatementList-15hryu6r"></a>*[StatementListItem](#StatementListItem)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="StatementList-dbrzeh7l"></a>*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub>&emsp;*[StatementListItem](#StatementListItem)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="StatementListItem"></a>*StatementListItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StatementListItem-pyyivtxj"></a>*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="StatementListItem-1vn3ibwe"></a>*[Declaration](#Declaration)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="LexicalDeclaration"></a>*LexicalDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LexicalDeclaration-deqecbrp"></a>*[LetOrConst](#LetOrConst)*&emsp;*[BindingList](#BindingList)*<sub>[?In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="LetOrConst"></a>*LetOrConst* **:**  
&emsp;&emsp;&emsp;<a name="LetOrConst-laxrvawy"></a>`` let ``  
&emsp;&emsp;&emsp;<a name="LetOrConst-nim_d4hb"></a>`` const ``  
  
&emsp;&emsp;<a name="BindingList"></a>*BindingList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingList-py_eo7ni"></a>*[LexicalBinding](#LexicalBinding)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingList-dt40zeyt"></a>*[BindingList](#BindingList)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[LexicalBinding](#LexicalBinding)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="LexicalBinding"></a>*LexicalBinding*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LexicalBinding-c5neqctp"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="LexicalBinding-dd1t5ekf"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="VariableStatement"></a>*VariableStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableStatement-m0ehvb8m"></a>`` var ``&emsp;*[VariableDeclarationList](#VariableDeclarationList)*<sub>[+In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="VariableDeclarationList"></a>*VariableDeclarationList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclarationList-n3piepmh"></a>*[VariableDeclaration](#VariableDeclaration)*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="VariableDeclarationList-oavweevb"></a>*[VariableDeclarationList](#VariableDeclarationList)*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*[VariableDeclaration](#VariableDeclaration)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="VariableDeclaration"></a>*VariableDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-c5neqctp"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-dd1t5ekf"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingPattern"></a>*BindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingPattern-mh3oqyo8"></a>*[ObjectBindingPattern](#ObjectBindingPattern)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingPattern-xjjvo5sr"></a>*[ArrayBindingPattern](#ArrayBindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ObjectBindingPattern"></a>*ObjectBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-gbpaspne"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-gk43jrsm"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-d1upprvx"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="ArrayBindingPattern"></a>*ArrayBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-njmfo-uj"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-hqlkkwfb"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-12yahkzg"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="BindingPropertyList"></a>*BindingPropertyList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-y9z6szrc"></a>*[BindingProperty](#BindingProperty)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-bzdeo9zt"></a>*[BindingPropertyList](#BindingPropertyList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[BindingProperty](#BindingProperty)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElementList"></a>*BindingElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElementList-arhlr9hd"></a>*[BindingElisionElement](#BindingElisionElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingElementList-hiwampap"></a>*[BindingElementList](#BindingElementList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[BindingElisionElement](#BindingElisionElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElisionElement"></a>*BindingElisionElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElisionElement-wo9nasvo"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingProperty"></a>*BindingProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingProperty-lof8ala-"></a>*[SingleNameBinding](#SingleNameBinding)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-mhvrwluk"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="BindingElement"></a>*BindingElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingElement-lof8ala-"></a>*[SingleNameBinding](#SingleNameBinding)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="BindingElement-ahx6lm0w"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[+In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleNameBinding"></a>*SingleNameBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SingleNameBinding-c5neqctp"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[Initializer](#Initializer)*<sub>[+In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="BindingRestElement"></a>*BindingRestElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BindingRestElement-ffhe3nqa"></a>`` ... ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="EmptyStatement"></a>*EmptyStatement* **:**  
&emsp;&emsp;&emsp;<a name="EmptyStatement-sg2sawim"></a>`` ; ``  
  
&emsp;&emsp;<a name="ExpressionStatement"></a>*ExpressionStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ExpressionStatement-4ttdnuln"></a>[lookahead ∉ { `` { ``, `` function ``, `` class ``, `` let ``&emsp;`` [ `` }]&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="IfStatement"></a>*IfStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IfStatement-fuhqe2xq"></a>`` if ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>&emsp;`` else ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IfStatement-9ogvciaf"></a>`` if ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="IterationStatement"></a>*IterationStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="IterationStatement-jocmqoht"></a>`` do ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>&emsp;`` while ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="IterationStatement-92j78-b5"></a>`` while ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-_do88got"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ { `` let ``&emsp;`` [ `` }]&emsp;*[Expression](#Expression)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-sodmtko8"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[VariableDeclarationList](#VariableDeclarationList)*<sub>[?Yield]</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-k8b-ryxj"></a>`` for ``&emsp;`` ( ``&emsp;*[LexicalDeclaration](#LexicalDeclaration)*<sub>[?Yield]</sub>&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-v1ibcd1w"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ { `` let ``&emsp;`` [ `` }]&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-7pgjrcn-"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-jzctgxkp"></a>`` for ``&emsp;`` ( ``&emsp;*[ForDeclaration](#ForDeclaration)*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-jqzgi_en"></a>`` for ``&emsp;`` ( ``&emsp;[lookahead ≠ `` let ``]&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-7m-adytu"></a>`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="IterationStatement-b3wzboyu"></a>`` for ``&emsp;`` ( ``&emsp;*[ForDeclaration](#ForDeclaration)*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="ForDeclaration"></a>*ForDeclaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ForDeclaration-0y1vvm1x"></a>*[LetOrConst](#LetOrConst)*&emsp;*[ForBinding](#ForBinding)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ForBinding"></a>*ForBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ForBinding-uolyom43"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ForBinding-mdrfyhm6"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ContinueStatement"></a>*ContinueStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ContinueStatement-6qppgxyk"></a>`` continue ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ContinueStatement-wh7qddgu"></a>`` continue ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="BreakStatement"></a>*BreakStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="BreakStatement-tlip5zkt"></a>`` break ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="BreakStatement-kcg-yy3r"></a>`` break ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ReturnStatement"></a>*ReturnStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ReturnStatement-cykzgrgr"></a>`` return ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ReturnStatement-tpdzx2lh"></a>`` return ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="WithStatement"></a>*WithStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="WithStatement-i70kview"></a>`` with ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="SwitchStatement"></a>*SwitchStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="SwitchStatement-uvrp_hkw"></a>`` switch ``&emsp;`` ( ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ) ``&emsp;*[CaseBlock](#CaseBlock)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CaseBlock"></a>*CaseBlock*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseBlock-wfjxvoh5"></a>`` { ``&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="CaseBlock-ududlhou"></a>`` { ``&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;*[DefaultClause](#DefaultClause)*<sub>[?Yield, ?Return]</sub>&emsp;*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="CaseClauses"></a>*CaseClauses*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseClauses-wfpqsvlo"></a>*[CaseClause](#CaseClause)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="CaseClauses-addji9rs"></a>*[CaseClauses](#CaseClauses)*<sub>[?Yield, ?Return]</sub>&emsp;*[CaseClause](#CaseClause)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CaseClause"></a>*CaseClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CaseClause-x20nmjyd"></a>`` case ``&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` : ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="DefaultClause"></a>*DefaultClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="DefaultClause-z4ihpgum"></a>`` default ``&emsp;`` : ``&emsp;*[StatementList](#StatementList)*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="LabelledStatement"></a>*LabelledStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelledStatement-ubbvtbun"></a>*[LabelIdentifier](#LabelIdentifier)*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*[LabelledItem](#LabelledItem)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="LabelledItem"></a>*LabelledItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="LabelledItem-pyyivtxj"></a>*[Statement](#Statement)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="LabelledItem--nqupnlb"></a>*[FunctionDeclaration](#FunctionDeclaration)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ThrowStatement"></a>*ThrowStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ThrowStatement-lauy4mhi"></a>`` throw ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[Expression](#Expression)*<sub>[+In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="TryStatement"></a>*TryStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="TryStatement-qhfov2lc"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Catch](#Catch)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="TryStatement-xsakufa6"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Finally](#Finally)*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;<a name="TryStatement-gxlzfd5s"></a>`` try ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>&emsp;*[Catch](#Catch)*<sub>[?Yield, ?Return]</sub>&emsp;*[Finally](#Finally)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Catch"></a>*Catch*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Catch-3ce8nhiw"></a>`` catch ``&emsp;`` ( ``&emsp;*[CatchParameter](#CatchParameter)*<sub>[?Yield]</sub>&emsp;`` ) ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="Finally"></a>*Finally*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;<a name="Finally-6r-6rvtx"></a>`` finally ``&emsp;*[Block](#Block)*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;<a name="CatchParameter"></a>*CatchParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="CatchParameter-uolyom43"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="CatchParameter-mdrfyhm6"></a>*[BindingPattern](#BindingPattern)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="DebuggerStatement"></a>*DebuggerStatement* **:**  
&emsp;&emsp;&emsp;<a name="DebuggerStatement-ns5hclvt"></a>`` debugger ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="FunctionDeclaration"></a>*FunctionDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-gxoavzvy"></a>`` function ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-smus6qca"></a>[+Default]&emsp;`` function ``&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="FunctionExpression"></a>*FunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="FunctionExpression-g3mtfiqq"></a>`` function ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="StrictFormalParameters"></a>*StrictFormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="StrictFormalParameters-ahjg9bb6"></a>*[FormalParameters](#FormalParameters)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameters"></a>*FormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameters-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="FormalParameters-mupdqnts"></a>*[FormalParameterList](#FormalParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameterList"></a>*FormalParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameterList-dnjnbote"></a>*[FunctionRestParameter](#FunctionRestParameter)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalParameterList-cqzrhujt"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalParameterList-_topmjn8"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[FunctionRestParameter](#FunctionRestParameter)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalsList"></a>*FormalsList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalsList-sxlu9ab0"></a>*[FormalParameter](#FormalParameter)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="FormalsList-kd8qayl8"></a>*[FormalsList](#FormalsList)*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*[FormalParameter](#FormalParameter)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionRestParameter"></a>*FunctionRestParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionRestParameter-xw3lyuix"></a>*[BindingRestElement](#BindingRestElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FormalParameter"></a>*FormalParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FormalParameter-azzrmst0"></a>*[BindingElement](#BindingElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionBody"></a>*FunctionBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionBody-xn8an8nx"></a>*[FunctionStatementList](#FunctionStatementList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="FunctionStatementList"></a>*FunctionStatementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="FunctionStatementList-qwwklbsn"></a>*[StatementList](#StatementList)*<sub>[?Yield, +Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="ArrowFunction"></a>*ArrowFunction*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrowFunction-ieeod2mi"></a>*[ArrowParameters](#ArrowParameters)*<sub>[?Yield]</sub>&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` => ``&emsp;*[ConciseBody](#ConciseBody)*<sub>[?In]</sub>  
  
&emsp;&emsp;<a name="ArrowParameters"></a>*ArrowParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ArrowParameters-uolyom43"></a>*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ArrowParameters-yrb110hm"></a>*[CoverParenthesizedExpressionAndArrowParameterList](#CoverParenthesizedExpressionAndArrowParameterList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ConciseBody"></a>*ConciseBody*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ConciseBody-1px9pijq"></a>[lookahead ≠ `` { ``]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;<a name="ConciseBody-aerabkqd"></a>`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="MethodDefinition"></a>*MethodDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="MethodDefinition-en8ekdz2"></a>*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[StrictFormalParameters](#StrictFormalParameters)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="MethodDefinition-uv5zsffy"></a>*[GeneratorMethod](#GeneratorMethod)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="MethodDefinition-8uh5vkw0"></a>`` get ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="MethodDefinition-rai1tkqc"></a>`` set ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[PropertySetParameterList](#PropertySetParameterList)*&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertySetParameterList"></a>*PropertySetParameterList* **:**  
&emsp;&emsp;&emsp;<a name="PropertySetParameterList-sxlu9ab0"></a>*[FormalParameter](#FormalParameter)*  
  
&emsp;&emsp;<a name="GeneratorMethod"></a>*GeneratorMethod*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="GeneratorMethod-oxchly8_"></a>`` * ``&emsp;*[PropertyName](#PropertyName)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[StrictFormalParameters](#StrictFormalParameters)*<sub>[+Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorDeclaration"></a>*GeneratorDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="GeneratorDeclaration-fbyztjbh"></a>`` function ``&emsp;`` * ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[+Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="GeneratorDeclaration-dsczygsq"></a>[+Default]&emsp;`` function ``&emsp;`` * ``&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[+Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorExpression"></a>*GeneratorExpression* **:**  
&emsp;&emsp;&emsp;<a name="GeneratorExpression-32ghovyc"></a>`` function ``&emsp;`` * ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[+Yield]</sub><sub>opt</sub>&emsp;`` ( ``&emsp;*[FormalParameters](#FormalParameters)*<sub>[+Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[GeneratorBody](#GeneratorBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="GeneratorBody"></a>*GeneratorBody* **:**  
&emsp;&emsp;&emsp;<a name="GeneratorBody-iqzbkm-h"></a>*[FunctionBody](#FunctionBody)*<sub>[+Yield]</sub>  
  
&emsp;&emsp;<a name="YieldExpression"></a>*YieldExpression*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;<a name="YieldExpression-0d8zyjn8"></a>`` yield ``  
&emsp;&emsp;&emsp;<a name="YieldExpression-50ht6hl2"></a>`` yield ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, +Yield]</sub>  
&emsp;&emsp;&emsp;<a name="YieldExpression-r6m4ewun"></a>`` yield ``&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` * ``&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[?In, +Yield]</sub>  
  
&emsp;&emsp;<a name="ClassDeclaration"></a>*ClassDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-tusuwhcv"></a>`` class ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub>&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-1ghyizwr"></a>[+Default]&emsp;`` class ``&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassExpression"></a>*ClassExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassExpression-0cliiy0w"></a>`` class ``&emsp;*[BindingIdentifier](#BindingIdentifier)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;*[ClassTail](#ClassTail)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassTail"></a>*ClassTail*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassTail-uopqpdqx"></a>*[ClassHeritage](#ClassHeritage)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` { ``&emsp;*[ClassBody](#ClassBody)*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="ClassHeritage"></a>*ClassHeritage*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassHeritage-5ovudy-k"></a>`` extends ``&emsp;*[LeftHandSideExpression](#LeftHandSideExpression)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassBody"></a>*ClassBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassBody-1y1dunax"></a>*[ClassElementList](#ClassElementList)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassElementList"></a>*ClassElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassElementList-crvluhmw"></a>*[ClassElement](#ClassElement)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElementList-msulavvt"></a>*[ClassElementList](#ClassElementList)*<sub>[?Yield]</sub>&emsp;*[ClassElement](#ClassElement)*<sub>[?Yield]</sub>  
  
&emsp;&emsp;<a name="ClassElement"></a>*ClassElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ClassElement-s8ilfl9g"></a>*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElement--ljgtrpo"></a>`` static ``&emsp;*[MethodDefinition](#MethodDefinition)*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;<a name="ClassElement-sg2sawim"></a>`` ; ``  
  
&emsp;&emsp;<a name="Script"></a>*Script* **:**  
&emsp;&emsp;&emsp;<a name="Script-cmjfjhkc"></a>*[ScriptBody](#ScriptBody)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ScriptBody"></a>*ScriptBody* **:**  
&emsp;&emsp;&emsp;<a name="ScriptBody-z0a6dhkf"></a>*[StatementList](#StatementList)*  
  
&emsp;&emsp;<a name="Module"></a>*Module* **:**  
&emsp;&emsp;&emsp;<a name="Module-uvsblmsd"></a>*[ModuleBody](#ModuleBody)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ModuleBody"></a>*ModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="ModuleBody-iqenfemp"></a>*[ModuleItemList](#ModuleItemList)*  
  
&emsp;&emsp;<a name="ModuleItemList"></a>*ModuleItemList* **:**  
&emsp;&emsp;&emsp;<a name="ModuleItemList-ap7dhqxm"></a>*[ModuleItem](#ModuleItem)*  
&emsp;&emsp;&emsp;<a name="ModuleItemList-dd23jrxs"></a>*[ModuleItemList](#ModuleItemList)*&emsp;*[ModuleItem](#ModuleItem)*  
  
&emsp;&emsp;<a name="ModuleItem"></a>*ModuleItem* **:**  
&emsp;&emsp;&emsp;<a name="ModuleItem-4fwtd8-6"></a>*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleItem-ky6bsn7x"></a>*[ExportDeclaration](#ExportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleItem-15hryu6r"></a>*[StatementListItem](#StatementListItem)*  
  
&emsp;&emsp;<a name="ImportDeclaration"></a>*ImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-glhuxxec"></a>`` import ``&emsp;*[ImportClause](#ImportClause)*&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-odcuzpbi"></a>`` import ``&emsp;*[ModuleSpecifier](#ModuleSpecifier)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ImportClause"></a>*ImportClause* **:**  
&emsp;&emsp;&emsp;<a name="ImportClause-oi8izote"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*  
&emsp;&emsp;&emsp;<a name="ImportClause-81tm-dw4"></a>*[NameSpaceImport](#NameSpaceImport)*  
&emsp;&emsp;&emsp;<a name="ImportClause-zfagpfvq"></a>*[NamedImports](#NamedImports)*  
&emsp;&emsp;&emsp;<a name="ImportClause-y9r1l58g"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*&emsp;`` , ``&emsp;*[NameSpaceImport](#NameSpaceImport)*  
&emsp;&emsp;&emsp;<a name="ImportClause-ih8rgsdx"></a>*[ImportedDefaultBinding](#ImportedDefaultBinding)*&emsp;`` , ``&emsp;*[NamedImports](#NamedImports)*  
  
&emsp;&emsp;<a name="ImportedDefaultBinding"></a>*ImportedDefaultBinding* **:**  
&emsp;&emsp;&emsp;<a name="ImportedDefaultBinding-vt7awvcp"></a>*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="NameSpaceImport"></a>*NameSpaceImport* **:**  
&emsp;&emsp;&emsp;<a name="NameSpaceImport-t2qf80pb"></a>`` * ``&emsp;`` as ``&emsp;*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="NamedImports"></a>*NamedImports* **:**  
&emsp;&emsp;&emsp;<a name="NamedImports-gbpaspne"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="NamedImports-g1js-lhi"></a>`` { ``&emsp;*[ImportsList](#ImportsList)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="NamedImports-bxjtogxx"></a>`` { ``&emsp;*[ImportsList](#ImportsList)*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="FromClause"></a>*FromClause* **:**  
&emsp;&emsp;&emsp;<a name="FromClause-rev6es22"></a>`` from ``&emsp;*[ModuleSpecifier](#ModuleSpecifier)*  
  
&emsp;&emsp;<a name="ImportsList"></a>*ImportsList* **:**  
&emsp;&emsp;&emsp;<a name="ImportsList-upllvvnq"></a>*[ImportSpecifier](#ImportSpecifier)*  
&emsp;&emsp;&emsp;<a name="ImportsList-ggcfvgot"></a>*[ImportsList](#ImportsList)*&emsp;`` , ``&emsp;*[ImportSpecifier](#ImportSpecifier)*  
  
&emsp;&emsp;<a name="ImportSpecifier"></a>*ImportSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ImportSpecifier-vt7awvcp"></a>*[ImportedBinding](#ImportedBinding)*  
&emsp;&emsp;&emsp;<a name="ImportSpecifier-onppcdhk"></a>*[IdentifierName](#IdentifierName)*&emsp;`` as ``&emsp;*[ImportedBinding](#ImportedBinding)*  
  
&emsp;&emsp;<a name="ModuleSpecifier"></a>*ModuleSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ModuleSpecifier-xhtltz00"></a>*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="ImportedBinding"></a>*ImportedBinding* **:**  
&emsp;&emsp;&emsp;<a name="ImportedBinding-uolyom43"></a>*[BindingIdentifier](#BindingIdentifier)*  
  
&emsp;&emsp;<a name="ExportDeclaration"></a>*ExportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-vq4gnfsg"></a>`` export ``&emsp;`` * ``&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-vkiasvwr"></a>`` export ``&emsp;*[ExportClause](#ExportClause)*&emsp;*[FromClause](#FromClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-toel4xq5"></a>`` export ``&emsp;*[ExportClause](#ExportClause)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-bg3oaw2m"></a>`` export ``&emsp;*[VariableStatement](#VariableStatement)*  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-go9a4xdq"></a>`` export ``&emsp;*[Declaration](#Declaration)*  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-cdfbfvfu"></a>`` export ``&emsp;`` default ``&emsp;*[HoistableDeclaration](#HoistableDeclaration)*<sub>[+Default]</sub>  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-w8pljwgc"></a>`` export ``&emsp;`` default ``&emsp;*[ClassDeclaration](#ClassDeclaration)*<sub>[+Default]</sub>  
&emsp;&emsp;&emsp;<a name="ExportDeclaration-4f6ct71n"></a>`` export ``&emsp;`` default ``&emsp;[lookahead ∉ { `` function ``, `` class `` }]&emsp;*[AssignmentExpression](#AssignmentExpression)*<sub>[+In]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ExportClause"></a>*ExportClause* **:**  
&emsp;&emsp;&emsp;<a name="ExportClause-gbpaspne"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ExportClause-kbfbtt8z"></a>`` { ``&emsp;*[ExportsList](#ExportsList)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ExportClause-wwyi_qo2"></a>`` { ``&emsp;*[ExportsList](#ExportsList)*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;<a name="ExportsList"></a>*ExportsList* **:**  
&emsp;&emsp;&emsp;<a name="ExportsList-w1vp78-i"></a>*[ExportSpecifier](#ExportSpecifier)*  
&emsp;&emsp;&emsp;<a name="ExportsList-gqfndot_"></a>*[ExportsList](#ExportsList)*&emsp;`` , ``&emsp;*[ExportSpecifier](#ExportSpecifier)*  
  
&emsp;&emsp;<a name="ExportSpecifier"></a>*ExportSpecifier* **:**  
&emsp;&emsp;&emsp;<a name="ExportSpecifier-drsx4tka"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="ExportSpecifier-qvusrr4h"></a>*[IdentifierName](#IdentifierName)*&emsp;`` as ``&emsp;*[IdentifierName](#IdentifierName)*  
  
