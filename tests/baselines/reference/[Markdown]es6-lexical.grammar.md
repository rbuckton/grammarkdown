&emsp;&emsp;*SourceCharacter* **::**  
&emsp;&emsp;&emsp;any Unicode code point  
  
&emsp;&emsp;*InputElementDiv* **::**  
&emsp;&emsp;&emsp;*WhiteSpace*  
&emsp;&emsp;&emsp;*LineTerminator*  
&emsp;&emsp;&emsp;*Comment*  
&emsp;&emsp;&emsp;*CommonToken*  
&emsp;&emsp;&emsp;*DivPunctuator*  
&emsp;&emsp;&emsp;*RightBracePunctuator*  
  
&emsp;&emsp;*InputElementRegExp* **::**  
&emsp;&emsp;&emsp;*WhiteSpace*  
&emsp;&emsp;&emsp;*LineTerminator*  
&emsp;&emsp;&emsp;*Comment*  
&emsp;&emsp;&emsp;*CommonToken*  
&emsp;&emsp;&emsp;*RightBracePunctuator*  
&emsp;&emsp;&emsp;*RegularExpressionLiteral*  
  
&emsp;&emsp;*InputElementRegExpOrTemplateTail* **::**  
&emsp;&emsp;&emsp;*WhiteSpace*  
&emsp;&emsp;&emsp;*LineTerminator*  
&emsp;&emsp;&emsp;*Comment*  
&emsp;&emsp;&emsp;*CommonToken*  
&emsp;&emsp;&emsp;*RegularExpressionLiteral*  
&emsp;&emsp;&emsp;*TemplateSubstitutionTail*  
  
&emsp;&emsp;*InputElementTemplateTail* **::**  
&emsp;&emsp;&emsp;*WhiteSpace*  
&emsp;&emsp;&emsp;*LineTerminator*  
&emsp;&emsp;&emsp;*Comment*  
&emsp;&emsp;&emsp;*CommonToken*  
&emsp;&emsp;&emsp;*DivPunctuator*  
&emsp;&emsp;&emsp;*TemplateSubstitutionTail*  
  
&emsp;&emsp;*WhiteSpace* **::**  
&emsp;&emsp;&emsp;&lt;TAB&gt;  
&emsp;&emsp;&emsp;&lt;VT&gt;  
&emsp;&emsp;&emsp;&lt;FF&gt;  
&emsp;&emsp;&emsp;&lt;SP&gt;  
&emsp;&emsp;&emsp;&lt;NBSP&gt;  
&emsp;&emsp;&emsp;&lt;ZWNBSP&gt;  
&emsp;&emsp;&emsp;&lt;USP&gt;  
  
&emsp;&emsp;*LineTerminator* **::**  
&emsp;&emsp;&emsp;&lt;LF&gt;  
&emsp;&emsp;&emsp;&lt;CR&gt;  
&emsp;&emsp;&emsp;&lt;LS&gt;  
&emsp;&emsp;&emsp;&lt;PS&gt;  
  
&emsp;&emsp;*LineTerminatorSequence* **::**  
&emsp;&emsp;&emsp;&lt;LF&gt;  
&emsp;&emsp;&emsp;&lt;CR&gt;&emsp;[lookahead ≠ &lt;LF&gt;]  
&emsp;&emsp;&emsp;&lt;LS&gt;  
&emsp;&emsp;&emsp;&lt;PS&gt;  
&emsp;&emsp;&emsp;&lt;CR&gt;&emsp;&lt;LF&gt;  
  
&emsp;&emsp;*Comment* **::**  
&emsp;&emsp;&emsp;*MultiLineComment*  
&emsp;&emsp;&emsp;*SingleLineComment*  
  
&emsp;&emsp;*MultiLineComment* **::**  
&emsp;&emsp;&emsp;`` /* ``&emsp;*MultiLineCommentChars*<sub>opt</sub>&emsp;`` */ ``  
  
&emsp;&emsp;*MultiLineCommentChars* **::**  
&emsp;&emsp;&emsp;*MultiLineNotAsteriskChar*&emsp;*MultiLineCommentChars*<sub>opt</sub>  
&emsp;&emsp;&emsp;`` * ``&emsp;*PostAsteriskCommentChars*<sub>opt</sub>  
  
&emsp;&emsp;*PostAsteriskCommentChars* **::**  
&emsp;&emsp;&emsp;*MultiLineNotForwardSlashOrAsteriskChar*&emsp;*MultiLineCommentChars*<sub>opt</sub>  
&emsp;&emsp;&emsp;`` * ``&emsp;*PostAsteriskCommentChars*<sub>opt</sub>  
  
&emsp;&emsp;*MultiLineNotAsteriskChar* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** `` * ``  
  
&emsp;&emsp;*MultiLineNotForwardSlashOrAsteriskChar* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** **one of** `` / `` **or** `` * ``  
  
&emsp;&emsp;*SingleLineComment* **::**  
&emsp;&emsp;&emsp;`` // ``&emsp;*SingleLineCommentChars*<sub>opt</sub>  
  
&emsp;&emsp;*SingleLineCommentChars* **::**  
&emsp;&emsp;&emsp;*SingleLineCommentChar*&emsp;*SingleLineCommentChars*<sub>opt</sub>  
  
&emsp;&emsp;*SingleLineCommentChar* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** *LineTerminator*  
  
&emsp;&emsp;*CommonToken* **::**  
&emsp;&emsp;&emsp;*IdentifierName*  
&emsp;&emsp;&emsp;*Punctuator*  
&emsp;&emsp;&emsp;*NumericLiteral*  
&emsp;&emsp;&emsp;*StringLiteral*  
&emsp;&emsp;&emsp;*Template*  
  
&emsp;&emsp;*IdentifierName* **::**  
&emsp;&emsp;&emsp;*IdentifierStart*  
&emsp;&emsp;&emsp;*IdentifierName*&emsp;*IdentifierPart*  
  
&emsp;&emsp;*IdentifierStart* **::**  
&emsp;&emsp;&emsp;*UnicodeIDStart*  
&emsp;&emsp;&emsp;`` $ ``  
&emsp;&emsp;&emsp;`` _ ``  
&emsp;&emsp;&emsp;`` \ ``&emsp;*UnicodeEscapeSequence*  
  
&emsp;&emsp;*IdentifierPart* **::**  
&emsp;&emsp;&emsp;*UnicodeIDContinue*  
&emsp;&emsp;&emsp;`` $ ``  
&emsp;&emsp;&emsp;`` _ ``  
&emsp;&emsp;&emsp;`` \ ``&emsp;*UnicodeEscapeSequence*  
&emsp;&emsp;&emsp;&lt;ZWNJ&gt;  
&emsp;&emsp;&emsp;&lt;ZWJ&gt;  
  
&emsp;&emsp;*UnicodeIDStart* **::**  
&emsp;&emsp;&emsp;any Unicode code point with the Unicode property "ID_Start" or "Other_ID_Start"  
  
&emsp;&emsp;*UnicodeIDContinue* **::**  
&emsp;&emsp;&emsp;any Unicode code point with the Unicode property "ID_Continue" or "Other_ID_Continue", or "Other_ID_Start"  
  
&emsp;&emsp;*ReservedWord* **::**  
&emsp;&emsp;&emsp;*Keyword*  
&emsp;&emsp;&emsp;*FutureReservedWord*  
&emsp;&emsp;&emsp;*NullLiteral*  
&emsp;&emsp;&emsp;*BooleanLiteral*  
  
&emsp;&emsp;*Keyword* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>break</code>      <code>do</code>         <code>in</code>  
&emsp;&emsp;&emsp;<code>typeof</code>     <code>case</code>       <code>else</code>  
&emsp;&emsp;&emsp;<code>instanceof</code> <code>var</code>        <code>catch</code>  
&emsp;&emsp;&emsp;<code>export</code>     <code>new</code>        <code>void</code>  
&emsp;&emsp;&emsp;<code>class</code>      <code>extends</code>    <code>return</code>  
&emsp;&emsp;&emsp;<code>while</code>      <code>const</code>      <code>finally</code>  
&emsp;&emsp;&emsp;<code>super</code>      <code>with</code>       <code>continue</code>  
&emsp;&emsp;&emsp;<code>for</code>        <code>switch</code>     <code>yield</code>  
&emsp;&emsp;&emsp;<code>debugger</code>   <code>function</code>   <code>this</code>  
&emsp;&emsp;&emsp;<code>default</code>    <code>if</code>         <code>throw</code>  
&emsp;&emsp;&emsp;<code>delete</code>     <code>import</code>     <code>try</code></pre>  
  
&emsp;&emsp;*FutureReservedWord* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>enum</code>       <code>await</code>      <code>implements</code>  
&emsp;&emsp;&emsp;<code>package</code>    <code>protected</code>  <code>interface</code>  
&emsp;&emsp;&emsp;<code>private</code>    <code>public</code></pre>  
  
&emsp;&emsp;*Punctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>{</code>    <code>}</code>    <code>(</code>    <code>)</code>    <code>[</code>    <code>]</code>    <code>.</code>  
&emsp;&emsp;&emsp;<code>;</code>    <code>,</code>    <code>&lt;</code>    <code>&gt;</code>    <code>&lt;=</code>   <code>&gt;=</code>   <code>==</code>  
&emsp;&emsp;&emsp;<code>!=</code>   <code>===</code>  <code>!==</code>  <code>+</code>    <code>-</code>    <code>*</code>    <code>%</code>  
&emsp;&emsp;&emsp;<code>++</code>   <code>--</code>   <code>&lt;&lt;</code>   <code>&gt;&gt;</code>   <code>&gt;&gt;&gt;</code>  <code>&amp;</code>    <code>|</code>  
&emsp;&emsp;&emsp;<code>^</code>    <code>!</code>    <code>~</code>    <code>&amp;&amp;</code>   <code>||</code>   <code>?</code>    <code> ::</code>  
&emsp;&emsp;&emsp;<code>=</code>    <code>+=</code>   <code>-=</code>   <code>*=</code>   <code>%=</code>   <code>&lt;&lt;=</code>  <code>&gt;&gt;=</code>  
&emsp;&emsp;&emsp;<code>&gt;&gt;&gt;=</code> <code>&amp;=</code>   <code>|=</code>   <code>^=</code>   <code>=&gt;</code></pre>  
  
&emsp;&emsp;*DivPunctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>/</code>  <code>/=</code></pre>  
  
&emsp;&emsp;*RightBracePunctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>)</code></pre>  
  
&emsp;&emsp;*NullLiteral* **::**  
&emsp;&emsp;&emsp;`` null ``  
  
&emsp;&emsp;*BooleanLiteral* **::**  
&emsp;&emsp;&emsp;`` true ``  
&emsp;&emsp;&emsp;`` false ``  
  
&emsp;&emsp;*NumericLiteral* **::**  
&emsp;&emsp;&emsp;*DecimalLiteral*  
&emsp;&emsp;&emsp;*BinaryIntegerLiteral*  
&emsp;&emsp;&emsp;*OctalIntegerLiteral*  
&emsp;&emsp;&emsp;*HexIntegerLiteral*  
  
&emsp;&emsp;*DecimalLiteral* **::**  
&emsp;&emsp;&emsp;*DecimalIntegerLiteral*&emsp;`` . ``&emsp;*DecimalDigits*<sub>opt</sub>&emsp;*ExponentPart*<sub>opt</sub>  
&emsp;&emsp;&emsp;`` . ``&emsp;*DecimalDigits*&emsp;*ExponentPart*<sub>opt</sub>  
&emsp;&emsp;&emsp;*DecimalIntegerLiteral*&emsp;*ExponentPart*<sub>opt</sub>  
  
&emsp;&emsp;*DecimalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;`` 0 ``  
&emsp;&emsp;&emsp;*NonZeroDigit*&emsp;*DecimalDigits*<sub>opt</sub>  
  
&emsp;&emsp;*DecimalDigits* **::**  
&emsp;&emsp;&emsp;*DecimalDigit*  
&emsp;&emsp;&emsp;*DecimalDigits*&emsp;*DecimalDigit*  
  
&emsp;&emsp;*DecimalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code> <code>1</code> <code>2</code> <code>3</code> <code>4</code> <code>5</code> <code>6</code> <code>7</code> <code>8</code> <code>9</code></pre>  
  
&emsp;&emsp;*NonZeroDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>1</code> <code>2</code> <code>3</code> <code>4</code> <code>5</code> <code>6</code> <code>7</code> <code>8</code> <code>9</code></pre>  
  
&emsp;&emsp;*ExponentPart* **::**  
&emsp;&emsp;&emsp;*ExponentIndicator*&emsp;*SignedInteger*  
  
&emsp;&emsp;*ExponentIndicator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>e</code> <code>E</code></pre>  
  
&emsp;&emsp;*SignedInteger* **::**  
&emsp;&emsp;&emsp;*DecimalDigits*  
&emsp;&emsp;&emsp;`` + ``&emsp;*DecimalDigits*  
&emsp;&emsp;&emsp;`` - ``&emsp;*DecimalDigits*  
  
&emsp;&emsp;*BinaryIntegerLiteral* **::**  
&emsp;&emsp;&emsp;`` 0b ``&emsp;*BinaryDigits*  
&emsp;&emsp;&emsp;`` 0B ``&emsp;*BinaryDigits*  
  
&emsp;&emsp;*BinaryDigits* **::**  
&emsp;&emsp;&emsp;*BinaryDigit*  
&emsp;&emsp;&emsp;*BinaryDigits*&emsp;*BinaryDigit*  
  
&emsp;&emsp;*BinaryDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code> <code>1</code></pre>  
  
&emsp;&emsp;*OctalIntegerLiteral* **::**  
&emsp;&emsp;&emsp;`` 0o ``&emsp;*OctalDigits*  
&emsp;&emsp;&emsp;`` 0O ``&emsp;*OctalDigits*  
  
&emsp;&emsp;*OctalDigits* **::**  
&emsp;&emsp;&emsp;*OctalDigit*  
&emsp;&emsp;&emsp;*OctalDigits*&emsp;*OctalDigit*  
  
&emsp;&emsp;*OctalDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code> <code>1</code> <code>2</code> <code>3</code> <code>4</code> <code>5</code> <code>6</code> <code>7</code></pre>  
  
&emsp;&emsp;*HexIntegerLiteral* **::**  
&emsp;&emsp;&emsp;`` 0x ``&emsp;*HexDigits*  
&emsp;&emsp;&emsp;`` 0X ``&emsp;*HexDigits*  
  
&emsp;&emsp;*HexDigits* **::**  
&emsp;&emsp;&emsp;*HexDigit*  
&emsp;&emsp;&emsp;*HexDigits*&emsp;*HexDigit*  
  
&emsp;&emsp;*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code> <code>1</code> <code>2</code> <code>3</code> <code>4</code> <code>5</code> <code>6</code> <code>7</code> <code>8</code> <code>9</code> <code>a</code> <code>b</code> <code>c</code> <code>d</code> <code>e</code> <code>f</code> <code>A</code> <code>B</code> <code>C</code> <code>D</code> <code>E</code> <code>F</code></pre>  
  
&emsp;&emsp;*StringLiteral* **::**  
&emsp;&emsp;&emsp;`` " ``&emsp;*DoubleStringCharacters*<sub>opt</sub>&emsp;`` " ``  
&emsp;&emsp;&emsp;`` ' ``&emsp;*SingleStringCharacters*<sub>opt</sub>&emsp;`` ' ``  
  
&emsp;&emsp;*DoubleStringCharacters* **::**  
&emsp;&emsp;&emsp;*DoubleStringCharacter*&emsp;*DoubleStringCharacters*<sub>opt</sub>  
  
&emsp;&emsp;*SingleStringCharacters* **::**  
&emsp;&emsp;&emsp;*SingleStringCharacter*&emsp;*SingleStringCharacters*<sub>opt</sub>  
  
&emsp;&emsp;*DoubleStringCharacter* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** **one of** `` " `` **or** `` \ `` **or** *LineTerminator*  
&emsp;&emsp;&emsp;`` \ ``&emsp;*EscapeSequence*  
&emsp;&emsp;&emsp;*LineContinuation*  
  
&emsp;&emsp;*SingleStringCharacter* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** **one of** `` ' `` **or** `` \ `` **or** *LineTerminator*  
&emsp;&emsp;&emsp;`` \ ``&emsp;*EscapeSequence*  
&emsp;&emsp;&emsp;*LineContinuation*  
  
&emsp;&emsp;*LineContinuation* **::**  
&emsp;&emsp;&emsp;`` \ ``&emsp;*LineTerminatorSequence*  
  
&emsp;&emsp;*EscapeSequence* **::**  
&emsp;&emsp;&emsp;*CharacterEscapeSequence*  
&emsp;&emsp;&emsp;`` 0 ``&emsp;[lookahead ≠ *DecimalDigit*]  
&emsp;&emsp;&emsp;*HexEscapeSequence*  
&emsp;&emsp;&emsp;*UnicodeEscapeSequence*  
  
&emsp;&emsp;*CharacterEscapeSequence* **::**  
&emsp;&emsp;&emsp;*SingleEscapeCharacter*  
&emsp;&emsp;&emsp;*NonEscapeCharacter*  
  
&emsp;&emsp;*SingleEscapeCharacter* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>&apos;</code> <code>&quot;</code> <code>\</code> <code>b</code> <code>f</code> <code>n</code> <code>r</code> <code>t</code> <code>v</code></pre>  
  
&emsp;&emsp;*NonEscapeCharacter* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** **one of** *EscapeCharacter* **or** *LineTerminator*  
  
&emsp;&emsp;*EscapeCharacter* **::**  
&emsp;&emsp;&emsp;*SingleEscapeCharacter*  
&emsp;&emsp;&emsp;*DecimalDigit*  
&emsp;&emsp;&emsp;`` x ``  
&emsp;&emsp;&emsp;`` u ``  
  
&emsp;&emsp;*HexEscapeSequence* **::**  
&emsp;&emsp;&emsp;`` x ``&emsp;*HexDigit*&emsp;*HexDigit*  
  
&emsp;&emsp;*UnicodeEscapeSequence* **::**  
&emsp;&emsp;&emsp;`` u ``&emsp;*Hex4Digits*  
&emsp;&emsp;&emsp;`` u{ ``&emsp;*HexDigits*&emsp;`` } ``  
  
&emsp;&emsp;*Hex4Digits* **::**  
&emsp;&emsp;&emsp;*HexDigit*&emsp;*HexDigit*&emsp;*HexDigit*&emsp;*HexDigit*  
  
&emsp;&emsp;*RegularExpressionLiteral* **::**  
&emsp;&emsp;&emsp;`` / ``&emsp;*RegularExpressionBody*&emsp;`` / ``&emsp;*RegularExpressionFlags*  
  
&emsp;&emsp;*RegularExpressionBody* **::**  
&emsp;&emsp;&emsp;*RegularExpressionFirstChar*&emsp;*RegularExpressionChars*  
  
&emsp;&emsp;*RegularExpressionChars* **::**  
&emsp;&emsp;&emsp;[empty]  
&emsp;&emsp;&emsp;*RegularExpressionChars*&emsp;*RegularExpressionChar*  
  
&emsp;&emsp;*RegularExpressionFirstChar* **::**  
&emsp;&emsp;&emsp;*RegularExpressionNonTerminator* **but not** **one of** `` * `` **or** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;*RegularExpressionBackslashSequence*  
&emsp;&emsp;&emsp;*RegularExpressionClass*  
  
&emsp;&emsp;*RegularExpressionChar* **::**  
&emsp;&emsp;&emsp;*RegularExpressionNonTerminator* **but not** **one of** `` \ `` **or** `` / `` **or** `` [ ``  
&emsp;&emsp;&emsp;*RegularExpressionBackslashSequence*  
&emsp;&emsp;&emsp;*RegularExpressionClass*  
  
&emsp;&emsp;*RegularExpressionBackslashSequence* **::**  
&emsp;&emsp;&emsp;`` \ ``&emsp;*RegularExpressionNonTerminator*  
  
&emsp;&emsp;*RegularExpressionNonTerminator* **::**  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** *LineTerminator*  
  
&emsp;&emsp;*RegularExpressionClass* **::**  
&emsp;&emsp;&emsp;`` [ ``&emsp;*RegularExpressionClassChars*&emsp;`` ] ``  
  
&emsp;&emsp;*RegularExpressionClassChars* **::**  
&emsp;&emsp;&emsp;[empty]  
&emsp;&emsp;&emsp;*RegularExpressionClassChars*&emsp;*RegularExpressionClassChar*  
  
&emsp;&emsp;*RegularExpressionClassChar* **::**  
&emsp;&emsp;&emsp;*RegularExpressionNonTerminator* **but not** **one of** `` ] `` **or** `` \ ``  
&emsp;&emsp;&emsp;*RegularExpressionBackslashSequence*  
  
&emsp;&emsp;*RegularExpressionFlags* **::**  
&emsp;&emsp;&emsp;[empty]  
&emsp;&emsp;&emsp;*RegularExpressionFlags*&emsp;*IdentifierPart*  
  
&emsp;&emsp;*Template* **::**  
&emsp;&emsp;&emsp;*NoSubstitutionTemplate*  
&emsp;&emsp;&emsp;*TemplateHead*  
  
&emsp;&emsp;*NoSubstitutionTemplate* **::**  
&emsp;&emsp;&emsp;`` ` ``&emsp;*TemplateCharacters*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;*TemplateHead* **::**  
&emsp;&emsp;&emsp;`` ` ``&emsp;*TemplateCharacters*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;*TemplateSubstitutionTail* **::**  
&emsp;&emsp;&emsp;*TemplateMiddle*  
&emsp;&emsp;&emsp;*TemplateTail*  
  
&emsp;&emsp;*TemplateMiddle* **::**  
&emsp;&emsp;&emsp;`` } ``&emsp;*TemplateCharacters*<sub>opt</sub>&emsp;`` ${ ``  
  
&emsp;&emsp;*TemplateTail* **::**  
&emsp;&emsp;&emsp;`` } ``&emsp;*TemplateCharacters*<sub>opt</sub>&emsp;`` ` ``  
  
&emsp;&emsp;*TemplateCharacters* **::**  
&emsp;&emsp;&emsp;*TemplateCharacter*&emsp;*TemplateCharacters*<sub>opt</sub>  
  
&emsp;&emsp;*TemplateCharacter* **::**  
&emsp;&emsp;&emsp;`` $ ``&emsp;[lookahead ≠ `` { ``]  
&emsp;&emsp;&emsp;`` \ ``&emsp;*EscapeSequence*  
&emsp;&emsp;&emsp;*LineContinuation*  
&emsp;&emsp;&emsp;*LineTerminatorSequence*  
&emsp;&emsp;&emsp;*SourceCharacter* **but not** **one of** `` ` `` **or** `` \ `` **or** `` $ `` **or** *LineTerminator*  
  