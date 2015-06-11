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
  
&emsp;&emsp;*IdentifierReference*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*Identifier*  
&emsp;&emsp;&emsp;[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;*BindingIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*Identifier*  
&emsp;&emsp;&emsp;[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;*LabelIdentifier*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*Identifier*  
&emsp;&emsp;&emsp;[~Yield]&emsp;`` yield ``  
  
&emsp;&emsp;*Identifier* **:**  
&emsp;&emsp;&emsp;*IdentifierName* **but not** *ReservedWord*  
  
&emsp;&emsp;*PrimaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` this ``  
&emsp;&emsp;&emsp;*IdentifierReference*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*Literal*  
&emsp;&emsp;&emsp;*ArrayLiteral*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ObjectLiteral*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*FunctionExpression*  
&emsp;&emsp;&emsp;*ClassExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*GeneratorExpression*  
&emsp;&emsp;&emsp;*RegularExpressionLiteral*  
&emsp;&emsp;&emsp;*TemplateLiteral*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CoverParenthesizedExpressionAndArrowParameterList*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*CoverParenthesizedExpressionAndArrowParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;`` ( ``&emsp;`` ... ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;*Literal* **:**  
&emsp;&emsp;&emsp;*NullLiteral*  
&emsp;&emsp;&emsp;*BooleanLiteral*  
&emsp;&emsp;&emsp;*NumericLiteral*  
&emsp;&emsp;&emsp;*StringLiteral*  
  
&emsp;&emsp;*ArrayLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` [ ``&emsp;*Elision*<sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;`` [ ``&emsp;*ElementList*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;`` [ ``&emsp;*ElementList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*Elision*<sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;*ElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*Elision*<sub>opt</sub>&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*Elision*<sub>opt</sub>&emsp;*SpreadElement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ElementList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*Elision*<sub>opt</sub>&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*ElementList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*Elision*<sub>opt</sub>&emsp;*SpreadElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*Elision* **:**  
&emsp;&emsp;&emsp;`` , ``  
&emsp;&emsp;&emsp;*Elision*&emsp;`` , ``  
  
&emsp;&emsp;*SpreadElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` ... ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;*ObjectLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*PropertyDefinitionList*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*PropertyDefinitionList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;*PropertyDefinitionList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*PropertyDefinition*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*PropertyDefinitionList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*PropertyDefinition*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*PropertyDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*IdentifierReference*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CoverInitializedName*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*MethodDefinition*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*PropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LiteralPropertyName*  
&emsp;&emsp;&emsp;*ComputedPropertyName*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*LiteralPropertyName* **:**  
&emsp;&emsp;&emsp;*IdentifierName*  
&emsp;&emsp;&emsp;*StringLiteral*  
&emsp;&emsp;&emsp;*NumericLiteral*  
  
&emsp;&emsp;*ComputedPropertyName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` [ ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
  
&emsp;&emsp;*CoverInitializedName*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*IdentifierReference*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;*Initializer*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` = ``&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*TemplateLiteral*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*NoSubstitutionTemplate*  
&emsp;&emsp;&emsp;*TemplateHead*&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;*TemplateSpans*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*TemplateSpans*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*TemplateTail*  
&emsp;&emsp;&emsp;*TemplateMiddleList*<sub>[?Yield]</sub>&emsp;*TemplateTail*  
  
&emsp;&emsp;*TemplateMiddleList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*TemplateMiddle*&emsp;*Expression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*TemplateMiddleList*<sub>[?Yield]</sub>&emsp;*TemplateMiddle*&emsp;*Expression*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;*MemberExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*PrimaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*MemberExpression*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;*MemberExpression*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*IdentifierName*  
&emsp;&emsp;&emsp;*MemberExpression*<sub>[?Yield]</sub>&emsp;*TemplateLiteral*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*SuperProperty*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*MetaProperty*  
&emsp;&emsp;&emsp;`` new ``&emsp;*MemberExpression*<sub>[?Yield]</sub>&emsp;*Arguments*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*SuperProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` super ``&emsp;`` [ ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;`` super ``&emsp;`` . ``&emsp;*IdentifierName*  
  
&emsp;&emsp;*MetaProperty* **:**  
&emsp;&emsp;&emsp;*NewTarget*  
  
&emsp;&emsp;*NewTarget* **:**  
&emsp;&emsp;&emsp;`` new ``&emsp;`` . ``&emsp;`` target ``  
  
&emsp;&emsp;*NewExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*MemberExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` new ``&emsp;*NewExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*CallExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*MemberExpression*<sub>[?Yield]</sub>&emsp;*Arguments*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*SuperCall*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CallExpression*<sub>[?Yield]</sub>&emsp;*Arguments*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CallExpression*<sub>[?Yield]</sub>&emsp;`` [ ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;*CallExpression*<sub>[?Yield]</sub>&emsp;`` . ``&emsp;*IdentifierName*  
&emsp;&emsp;&emsp;*CallExpression*<sub>[?Yield]</sub>&emsp;*TemplateLiteral*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*SuperCall*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` super ``&emsp;*Arguments*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*Arguments*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` ( ``&emsp;`` ) ``  
&emsp;&emsp;&emsp;`` ( ``&emsp;*ArgumentList*<sub>[?Yield]</sub>&emsp;`` ) ``  
  
&emsp;&emsp;*ArgumentList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;`` ... ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*ArgumentList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*ArgumentList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` ... ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;*LeftHandSideExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*NewExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CallExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*PostfixExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;[no *LineTerminator* here]&emsp;`` ++ ``  
&emsp;&emsp;&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;[no *LineTerminator* here]&emsp;`` -- ``  
  
&emsp;&emsp;*UnaryExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*PostfixExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` delete ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` void ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` typeof ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` ++ ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` -- ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` + ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` - ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` ~ ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` ! ``&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*MultiplicativeExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*MultiplicativeExpression*<sub>[?Yield]</sub>&emsp;*MultiplicativeOperator*&emsp;*UnaryExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*MultiplicativeOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*</code> <code>/</code> <code>%</code></pre>  
  
&emsp;&emsp;*AdditiveExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*MultiplicativeExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*AdditiveExpression*<sub>[?Yield]</sub>&emsp;`` + ``&emsp;*MultiplicativeExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*AdditiveExpression*<sub>[?Yield]</sub>&emsp;`` - ``&emsp;*MultiplicativeExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ShiftExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*AdditiveExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ShiftExpression*<sub>[?Yield]</sub>&emsp;`` << ``&emsp;*AdditiveExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ShiftExpression*<sub>[?Yield]</sub>&emsp;`` >> ``&emsp;*AdditiveExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ShiftExpression*<sub>[?Yield]</sub>&emsp;`` >>> ``&emsp;*AdditiveExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*RelationalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>&emsp;`` < ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>&emsp;`` > ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>&emsp;`` <= ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>&emsp;`` >= ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>&emsp;`` instanceof ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;[+In]&emsp;*RelationalExpression*<sub>[In, ?Yield]</sub>&emsp;`` in ``&emsp;*ShiftExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*EqualityExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>&emsp;`` == ``&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>&emsp;`` != ``&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>&emsp;`` === ``&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>&emsp;`` !== ``&emsp;*RelationalExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*BitwiseANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*BitwiseANDExpression*<sub>[?In, ?Yield]</sub>&emsp;`` & ``&emsp;*EqualityExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*BitwiseXORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BitwiseANDExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*BitwiseXORExpression*<sub>[?In, ?Yield]</sub>&emsp;`` ^ ``&emsp;*BitwiseANDExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*BitwiseORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BitwiseXORExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*BitwiseORExpression*<sub>[?In, ?Yield]</sub>&emsp;`` | ``&emsp;*BitwiseXORExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*LogicalANDExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BitwiseORExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*LogicalANDExpression*<sub>[?In, ?Yield]</sub>&emsp;`` && ``&emsp;*BitwiseORExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*LogicalORExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LogicalANDExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*LogicalORExpression*<sub>[?In, ?Yield]</sub>&emsp;`` || ``&emsp;*LogicalANDExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*ConditionalExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LogicalORExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*LogicalORExpression*<sub>[?In, ?Yield]</sub>&emsp;`` ? ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>&emsp;`` : ``&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*AssignmentExpression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ConditionalExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;[+Yield]&emsp;*YieldExpression*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;*ArrowFunction*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;`` = ``&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;*AssignmentOperator*&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*AssignmentOperator* **:** **one of**  
<pre>&emsp;&emsp;&emsp;<code>*=</code>   <code>/=</code>   <code>%=</code>   <code>+=</code>   <code>-=</code>   <code>&lt;&lt;=</code>  <code>&gt;&gt;=</code>  
&emsp;&emsp;&emsp;<code>&gt;&gt;&gt;=</code> <code>&amp;=</code>   <code>^=</code>   <code>|=</code></pre>  
  
&emsp;&emsp;*Expression*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*Expression*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*AssignmentExpression*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*Statement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*BlockStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*VariableStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*EmptyStatement*  
&emsp;&emsp;&emsp;*ExpressionStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*IfStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*BreakableStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*ContinueStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BreakStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;[+Return]&emsp;*ReturnStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*WithStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*LabelledStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*ThrowStatement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*TryStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*DebuggerStatement*  
  
&emsp;&emsp;*Declaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*HoistableDeclaration*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ClassDeclaration*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*LexicalDeclaration*<sub>[In, ?Yield]</sub>  
  
&emsp;&emsp;*HoistableDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;*FunctionDeclaration*<sub>[?Yield, ?Default]</sub>  
&emsp;&emsp;&emsp;*GeneratorDeclaration*<sub>[?Yield, ?Default]</sub>  
  
&emsp;&emsp;*BreakableStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*IterationStatement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*SwitchStatement*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*BlockStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*Block*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*Block*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;*StatementList*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;*StatementList*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*StatementListItem*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*StatementList*<sub>[?Yield, ?Return]</sub>&emsp;*StatementListItem*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*StatementListItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*Declaration*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*LexicalDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LetOrConst*&emsp;*BindingList*<sub>[?In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*LetOrConst* **:**  
&emsp;&emsp;&emsp;`` let ``  
&emsp;&emsp;&emsp;`` const ``  
  
&emsp;&emsp;*BindingList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LexicalBinding*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingList*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*LexicalBinding*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*LexicalBinding*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;*BindingPattern*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*VariableStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` var ``&emsp;*VariableDeclarationList*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*VariableDeclarationList*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*VariableDeclaration*<sub>[?In, ?Yield]</sub>  
&emsp;&emsp;&emsp;*VariableDeclarationList*<sub>[?In, ?Yield]</sub>&emsp;`` , ``&emsp;*VariableDeclaration*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*VariableDeclaration*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[?In, ?Yield]</sub><sub>opt</sub>  
&emsp;&emsp;&emsp;*BindingPattern*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[?In, ?Yield]</sub>  
  
&emsp;&emsp;*BindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ObjectBindingPattern*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ArrayBindingPattern*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ObjectBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*BindingPropertyList*<sub>[?Yield]</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*BindingPropertyList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;*ArrayBindingPattern*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` [ ``&emsp;*Elision*<sub>opt</sub>&emsp;*BindingRestElement*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;`` [ ``&emsp;*BindingElementList*<sub>[?Yield]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;`` [ ``&emsp;*BindingElementList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*Elision*<sub>opt</sub>&emsp;*BindingRestElement*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;*BindingPropertyList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingProperty*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingPropertyList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*BindingProperty*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*BindingElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingElisionElement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingElementList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*BindingElisionElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*BindingElisionElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*Elision*<sub>opt</sub>&emsp;*BindingElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*BindingProperty*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*SingleNameBinding*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*BindingElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*BindingElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*SingleNameBinding*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingPattern*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;*SingleNameBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;*Initializer*<sub>[In, ?Yield]</sub><sub>opt</sub>  
  
&emsp;&emsp;*BindingRestElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` ... ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*EmptyStatement* **:**  
&emsp;&emsp;&emsp;`` ; ``  
  
&emsp;&emsp;*ExpressionStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;[lookahead ∉ `` { ```` function ```` class ```` let ``&emsp;`` [ ``]&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*IfStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` if ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>&emsp;`` else ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` if ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*IterationStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` do ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>&emsp;`` while ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` while ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ `` let ``&emsp;`` [ ``]&emsp;*Expression*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*VariableDeclarationList*<sub>[?Yield]</sub>&emsp;`` ; ``&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;*LexicalDeclaration*<sub>[?Yield]</sub>&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ; ``&emsp;*Expression*<sub>[In, ?Yield]</sub><sub>opt</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;[lookahead ∉ `` let ``&emsp;`` [ ``]&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*ForBinding*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;*ForDeclaration*<sub>[?Yield]</sub>&emsp;`` in ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;[lookahead ≠ `` let ``]&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;`` var ``&emsp;*ForBinding*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` for ``&emsp;`` ( ``&emsp;*ForDeclaration*<sub>[?Yield]</sub>&emsp;`` of ``&emsp;*AssignmentExpression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*ForDeclaration*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*LetOrConst*&emsp;*ForBinding*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ForBinding*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingPattern*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ContinueStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` continue ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` continue ``&emsp;[no *LineTerminator* here]&emsp;*LabelIdentifier*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*BreakStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` break ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` break ``&emsp;[no *LineTerminator* here]&emsp;*LabelIdentifier*<sub>[?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*ReturnStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` return ``&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` return ``&emsp;[no *LineTerminator* here]&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*WithStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` with ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*SwitchStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` switch ``&emsp;`` ( ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ) ``&emsp;*CaseBlock*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*CaseBlock*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;*CaseClauses*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*CaseClauses*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;*DefaultClause*<sub>[?Yield, ?Return]</sub>&emsp;*CaseClauses*<sub>[?Yield, ?Return]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;*CaseClauses*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*CaseClause*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*CaseClauses*<sub>[?Yield, ?Return]</sub>&emsp;*CaseClause*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*CaseClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` case ``&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` : ``&emsp;*StatementList*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;*DefaultClause*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` default ``&emsp;`` : ``&emsp;*StatementList*<sub>[?Yield, ?Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;*LabelledStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*LabelIdentifier*<sub>[?Yield]</sub>&emsp;`` : ``&emsp;*LabelledItem*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*LabelledItem*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;*Statement*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;*FunctionDeclaration*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ThrowStatement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` throw ``&emsp;[no *LineTerminator* here]&emsp;*Expression*<sub>[In, ?Yield]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*TryStatement*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` try ``&emsp;*Block*<sub>[?Yield, ?Return]</sub>&emsp;*Catch*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` try ``&emsp;*Block*<sub>[?Yield, ?Return]</sub>&emsp;*Finally*<sub>[?Yield, ?Return]</sub>  
&emsp;&emsp;&emsp;`` try ``&emsp;*Block*<sub>[?Yield, ?Return]</sub>&emsp;*Catch*<sub>[?Yield, ?Return]</sub>&emsp;*Finally*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*Catch*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` catch ``&emsp;`` ( ``&emsp;*CatchParameter*<sub>[?Yield]</sub>&emsp;`` ) ``&emsp;*Block*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*Finally*<sub>[Yield, Return]</sub> **:**  
&emsp;&emsp;&emsp;`` finally ``&emsp;*Block*<sub>[?Yield, ?Return]</sub>  
  
&emsp;&emsp;*CatchParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*BindingPattern*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*DebuggerStatement* **:**  
&emsp;&emsp;&emsp;`` debugger ``&emsp;`` ; ``  
  
&emsp;&emsp;*FunctionDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;`` function ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*FormalParameters*&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
&emsp;&emsp;&emsp;[+Default]&emsp;`` function ``&emsp;`` ( ``&emsp;*FormalParameters*&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
  
&emsp;&emsp;*FunctionExpression* **:**  
&emsp;&emsp;&emsp;`` function ``&emsp;*BindingIdentifier*<sub>opt</sub>&emsp;`` ( ``&emsp;*FormalParameters*&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
  
&emsp;&emsp;*StrictFormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*FormalParameters*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FormalParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;[empty]  
&emsp;&emsp;&emsp;*FormalParameterList*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FormalParameterList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*FunctionRestParameter*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*FormalsList*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*FormalsList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*FunctionRestParameter*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FormalsList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*FormalParameter*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*FormalsList*<sub>[?Yield]</sub>&emsp;`` , ``&emsp;*FormalParameter*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FunctionRestParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingRestElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FormalParameter*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FunctionBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*FunctionStatementList*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*FunctionStatementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*StatementList*<sub>[?Yield, Return]</sub><sub>opt</sub>  
  
&emsp;&emsp;*ArrowFunction*<sub>[In, Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ArrowParameters*<sub>[?Yield]</sub>&emsp;[no *LineTerminator* here]&emsp;`` => ``&emsp;*ConciseBody*<sub>[?In]</sub>  
  
&emsp;&emsp;*ArrowParameters*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*CoverParenthesizedExpressionAndArrowParameterList*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ConciseBody*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;[lookahead ≠ `` { ``]&emsp;*AssignmentExpression*<sub>[?In]</sub>  
&emsp;&emsp;&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
  
&emsp;&emsp;*MethodDefinition*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*StrictFormalParameters*&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
&emsp;&emsp;&emsp;*GeneratorMethod*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` get ``&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
&emsp;&emsp;&emsp;`` set ``&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*PropertySetParameterList*&emsp;`` ) ``&emsp;`` { ``&emsp;*FunctionBody*&emsp;`` } ``  
  
&emsp;&emsp;*PropertySetParameterList* **:**  
&emsp;&emsp;&emsp;*FormalParameter*  
  
&emsp;&emsp;*GeneratorMethod*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` * ``&emsp;*PropertyName*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*StrictFormalParameters*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*GeneratorBody*&emsp;`` } ``  
  
&emsp;&emsp;*GeneratorDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;`` function ``&emsp;`` * ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;`` ( ``&emsp;*FormalParameters*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*GeneratorBody*&emsp;`` } ``  
&emsp;&emsp;&emsp;[+Default]&emsp;`` function ``&emsp;`` * ``&emsp;`` ( ``&emsp;*FormalParameters*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*GeneratorBody*&emsp;`` } ``  
  
&emsp;&emsp;*GeneratorExpression* **:**  
&emsp;&emsp;&emsp;`` function ``&emsp;`` * ``&emsp;*BindingIdentifier*<sub>[Yield]</sub><sub>opt</sub>&emsp;`` ( ``&emsp;*FormalParameters*<sub>[Yield]</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*GeneratorBody*&emsp;`` } ``  
  
&emsp;&emsp;*GeneratorBody* **:**  
&emsp;&emsp;&emsp;*FunctionBody*<sub>[Yield]</sub>  
  
&emsp;&emsp;*YieldExpression*<sub>[In]</sub> **:**  
&emsp;&emsp;&emsp;`` yield ``  
&emsp;&emsp;&emsp;`` yield ``&emsp;[no *LineTerminator* here]&emsp;*AssignmentExpression*<sub>[?In, Yield]</sub>  
&emsp;&emsp;&emsp;`` yield ``&emsp;[no *LineTerminator* here]&emsp;`` * ``&emsp;*AssignmentExpression*<sub>[?In, Yield]</sub>  
  
&emsp;&emsp;*ClassDeclaration*<sub>[Yield, Default]</sub> **:**  
&emsp;&emsp;&emsp;`` class ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub>&emsp;*ClassTail*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;[+Default]&emsp;`` class ``&emsp;*ClassTail*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ClassExpression*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` class ``&emsp;*BindingIdentifier*<sub>[?Yield]</sub><sub>opt</sub>&emsp;*ClassTail*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ClassTail*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ClassHeritage*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` { ``&emsp;*ClassBody*<sub>[?Yield]</sub><sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;*ClassHeritage*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;`` extends ``&emsp;*LeftHandSideExpression*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ClassBody*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ClassElementList*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ClassElementList*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*ClassElement*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;*ClassElementList*<sub>[?Yield]</sub>&emsp;*ClassElement*<sub>[?Yield]</sub>  
  
&emsp;&emsp;*ClassElement*<sub>[Yield]</sub> **:**  
&emsp;&emsp;&emsp;*MethodDefinition*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` static ``&emsp;*MethodDefinition*<sub>[?Yield]</sub>  
&emsp;&emsp;&emsp;`` ; ``  
  
&emsp;&emsp;*Script* **:**  
&emsp;&emsp;&emsp;*ScriptBody*<sub>opt</sub>  
  
&emsp;&emsp;*ScriptBody* **:**  
&emsp;&emsp;&emsp;*StatementList*  
  
&emsp;&emsp;*Module* **:**  
&emsp;&emsp;&emsp;*ModuleBody*<sub>opt</sub>  
  
&emsp;&emsp;*ModuleBody* **:**  
&emsp;&emsp;&emsp;*ModuleItemList*  
  
&emsp;&emsp;*ModuleItemList* **:**  
&emsp;&emsp;&emsp;*ModuleItem*  
&emsp;&emsp;&emsp;*ModuleItemList*&emsp;*ModuleItem*  
  
&emsp;&emsp;*ModuleItem* **:**  
&emsp;&emsp;&emsp;*ImportDeclaration*  
&emsp;&emsp;&emsp;*ExportDeclaration*  
&emsp;&emsp;&emsp;*StatementListItem*  
  
&emsp;&emsp;*ImportDeclaration* **:**  
&emsp;&emsp;&emsp;`` import ``&emsp;*ImportClause*&emsp;*FromClause*&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` import ``&emsp;*ModuleSpecifier*&emsp;`` ; ``  
  
&emsp;&emsp;*ImportClause* **:**  
&emsp;&emsp;&emsp;*ImportedDefaultBinding*  
&emsp;&emsp;&emsp;*NameSpaceImport*  
&emsp;&emsp;&emsp;*NamedImports*  
&emsp;&emsp;&emsp;*ImportedDefaultBinding*&emsp;`` , ``&emsp;*NameSpaceImport*  
&emsp;&emsp;&emsp;*ImportedDefaultBinding*&emsp;`` , ``&emsp;*NamedImports*  
  
&emsp;&emsp;*ImportedDefaultBinding* **:**  
&emsp;&emsp;&emsp;*ImportedBinding*  
  
&emsp;&emsp;*NameSpaceImport* **:**  
&emsp;&emsp;&emsp;`` * ``&emsp;`` as ``&emsp;*ImportedBinding*  
  
&emsp;&emsp;*NamedImports* **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*ImportsList*&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*ImportsList*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;*FromClause* **:**  
&emsp;&emsp;&emsp;`` from ``&emsp;*ModuleSpecifier*  
  
&emsp;&emsp;*ImportsList* **:**  
&emsp;&emsp;&emsp;*ImportSpecifier*  
&emsp;&emsp;&emsp;*ImportsList*&emsp;`` , ``&emsp;*ImportSpecifier*  
  
&emsp;&emsp;*ImportSpecifier* **:**  
&emsp;&emsp;&emsp;*ImportedBinding*  
&emsp;&emsp;&emsp;*IdentifierName*&emsp;`` as ``&emsp;*ImportedBinding*  
  
&emsp;&emsp;*ModuleSpecifier* **:**  
&emsp;&emsp;&emsp;*StringLiteral*  
  
&emsp;&emsp;*ImportedBinding* **:**  
&emsp;&emsp;&emsp;*BindingIdentifier*  
  
&emsp;&emsp;*ExportDeclaration* **:**  
&emsp;&emsp;&emsp;`` export ``&emsp;`` * ``&emsp;*FromClause*&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` export ``&emsp;*ExportClause*&emsp;*FromClause*&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` export ``&emsp;*ExportClause*&emsp;`` ; ``  
&emsp;&emsp;&emsp;`` export ``&emsp;*VariableStatement*  
&emsp;&emsp;&emsp;`` export ``&emsp;*Declaration*  
&emsp;&emsp;&emsp;`` export ``&emsp;`` default ``&emsp;*HoistableDeclaration*<sub>[Default]</sub>  
&emsp;&emsp;&emsp;`` export ``&emsp;`` default ``&emsp;*ClassDeclaration*<sub>[Default]</sub>  
&emsp;&emsp;&emsp;`` export ``&emsp;`` default ``&emsp;[lookahead ∉ `` function ```` class ``]&emsp;*AssignmentExpression*<sub>[In]</sub>&emsp;`` ; ``  
  
&emsp;&emsp;*ExportClause* **:**  
&emsp;&emsp;&emsp;`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*ExportsList*&emsp;`` } ``  
&emsp;&emsp;&emsp;`` { ``&emsp;*ExportsList*&emsp;`` , ``&emsp;`` } ``  
  
&emsp;&emsp;*ExportsList* **:**  
&emsp;&emsp;&emsp;*ExportSpecifier*  
&emsp;&emsp;&emsp;*ExportsList*&emsp;`` , ``&emsp;*ExportSpecifier*  
  
&emsp;&emsp;*ExportSpecifier* **:**  
&emsp;&emsp;&emsp;*IdentifierName*  
&emsp;&emsp;&emsp;*IdentifierName*&emsp;`` as ``&emsp;*IdentifierName*  
  