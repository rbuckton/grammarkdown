&emsp;&emsp;<a name="SourceCharacter"></a>*SourceCharacter* **::**  
&emsp;&emsp;&emsp;<a name="SourceCharacter-xks4vqzw"></a>any Unicode code point  
  
&emsp;&emsp;<a name="WhiteSpace"></a>*WhiteSpace* **::**  
&emsp;&emsp;&emsp;<a name="WhiteSpace-k4soaizl"></a>&lt;TAB&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-w_cit1lu"></a>&lt;VT&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-dvfflmsr"></a>&lt;FF&gt;  
&emsp;&emsp;&emsp;<a name="WhiteSpace-01dfufyk"></a>&lt;SP&gt;  
  
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
  
&emsp;&emsp;<a name="Comment"></a>*Comment* **::**  
&emsp;&emsp;&emsp;<a name="Comment-sieyeref"></a>*[MultiLineComment](#MultiLineComment)*  
&emsp;&emsp;&emsp;<a name="Comment-sscrkqcd"></a>*[SingleLineComment](#SingleLineComment)*  
  
&emsp;&emsp;<a name="MultiLineComment"></a>*MultiLineComment* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineComment-hhzm60cr"></a>`` /* ``&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>&emsp;`` */ ``  
  
&emsp;&emsp;<a name="MultiLineCommentChars"></a>*MultiLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-yfpqe0t3"></a>*[MultiLineCommentNotAsteriskChar](#MultiLineCommentNotAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="MultiLineCommentChars-fjc-za7u"></a>`` * ``&emsp;*[MultiLineCommentPostAsteriskChars](#MultiLineCommentPostAsteriskChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="MultiLineCommentPostAsteriskChars"></a>*MultiLineCommentPostAsteriskChars* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentPostAsteriskChars-tgjdyy1d"></a>*[MultiLineCommentNotForwardSlashOrAsteriskChar](#MultiLineCommentNotForwardSlashOrAsteriskChar)*&emsp;*[MultiLineCommentChars](#MultiLineCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="MultiLineCommentPostAsteriskChars-fjc-za7u"></a>`` * ``&emsp;*[MultiLineCommentPostAsteriskChars](#MultiLineCommentPostAsteriskChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="MultiLineCommentNotAsteriskChar"></a>*MultiLineCommentNotAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentNotAsteriskChar-lflef8ko"></a>*[SourceCharacter](#SourceCharacter)* **but not** `` * ``  
  
&emsp;&emsp;<a name="MultiLineCommentNotForwardSlashOrAsteriskChar"></a>*MultiLineCommentNotForwardSlashOrAsteriskChar* **::**  
&emsp;&emsp;&emsp;<a name="MultiLineCommentNotForwardSlashOrAsteriskChar-hdfnrv5z"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` / `` **or** `` * ``  
  
&emsp;&emsp;<a name="SingleLineComment"></a>*SingleLineComment* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineComment-u-3whel6"></a>`` // ``&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChars"></a>*SingleLineCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChars-rshuryvh"></a>*[SingleLineCommentChar](#SingleLineCommentChar)*&emsp;*[SingleLineCommentChars](#SingleLineCommentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SingleLineCommentChar"></a>*SingleLineCommentChar* **::**  
&emsp;&emsp;&emsp;<a name="SingleLineCommentChar-lvvfp8iw"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="HtmlTrivia"></a>*HtmlTrivia* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTrivia-87zi44aw"></a>*[HtmlTagTrivia](#HtmlTagTrivia)*  
&emsp;&emsp;&emsp;<a name="HtmlTrivia-cbd1u4ma"></a>*[HtmlCommentTrivia](#HtmlCommentTrivia)*  
  
&emsp;&emsp;<a name="HtmlTagTrivia"></a>*HtmlTagTrivia* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagTrivia-753elqeu"></a>`` < ``&emsp;*[HtmlTagName](#HtmlTagName)*&emsp;*[HtmlTagContentChars](#HtmlTagContentChars)*<sub>opt</sub>&emsp;`` > ``  
&emsp;&emsp;&emsp;<a name="HtmlTagTrivia-mpg6pec4"></a>`` </ ``&emsp;*[HtmlTagName](#HtmlTagName)*&emsp;*[HtmlTagContentChars](#HtmlTagContentChars)*<sub>opt</sub>&emsp;`` > ``  
  
&emsp;&emsp;<a name="HtmlTagName"></a>*HtmlTagName* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagName-zexbxouy"></a>*[HtmlTagNameNotLowerUChar](#HtmlTagNameNotLowerUChar)*&emsp;*[HtmlTagNameChars](#HtmlTagNameChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="HtmlTagName-cf_cnmz9"></a>`` u ``&emsp;[lookahead ≠ `` + ``]&emsp;*[HtmlTagNameChars](#HtmlTagNameChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlTagNameChars"></a>*HtmlTagNameChars* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagNameChars-rfzkezha"></a>*[HtmlTagNameChar](#HtmlTagNameChar)*&emsp;*[HtmlTagNameChars](#HtmlTagNameChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlTagNameChar"></a>*HtmlTagNameChar* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>g</code>     <code>h</code>     <code>i</code>     <code>j</code>  
&emsp;&emsp;&emsp;<code>k</code>     <code>l</code>     <code>m</code>     <code>n</code>     <code>o</code>     <code>p</code>     <code>q</code>     <code>r</code>     <code>s</code>     <code>t</code>  
&emsp;&emsp;&emsp;<code>u</code>     <code>v</code>     <code>w</code>     <code>x</code>     <code>y</code>     <code>z</code></pre>
  
&emsp;&emsp;<a name="HtmlTagNameNotLowerUChar"></a>*HtmlTagNameNotLowerUChar* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagNameNotLowerUChar-dktipvte"></a>*[HtmlTagNameChar](#HtmlTagNameChar)* **but not** `` u ``  
  
&emsp;&emsp;<a name="HtmlTagContentChars"></a>*HtmlTagContentChars* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagContentChars-ywjljzwj"></a>*[HtmlTagContentChar](#HtmlTagContentChar)*&emsp;*[HtmlTagContentChars](#HtmlTagContentChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlTagContentChar"></a>*HtmlTagContentChar* **::**  
&emsp;&emsp;&emsp;<a name="HtmlTagContentChar-pgmy9wfw"></a>*[SourceCharacter](#SourceCharacter)* **but not** `` > ``  
  
&emsp;&emsp;<a name="HtmlCommentTrivia"></a>*HtmlCommentTrivia* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentTrivia-7hlzqyyv"></a>`` <!-- ``&emsp;*[HtmlCommentChars](#HtmlCommentChars)*<sub>opt</sub>&emsp;`` --> ``  
  
&emsp;&emsp;<a name="HtmlCommentChars"></a>*HtmlCommentChars* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentChars-macgozjl"></a>*[HtmlCommentNotMinusChar](#HtmlCommentNotMinusChar)*&emsp;*[HtmlCommentChars](#HtmlCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="HtmlCommentChars-s4hjpagd"></a>`` - ``&emsp;*[HtmlCommentPostMinusChars](#HtmlCommentPostMinusChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlCommentPostMinusChars"></a>*HtmlCommentPostMinusChars* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentPostMinusChars-macgozjl"></a>*[HtmlCommentNotMinusChar](#HtmlCommentNotMinusChar)*&emsp;*[HtmlCommentChars](#HtmlCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="HtmlCommentPostMinusChars-vtgqwuws"></a>`` - ``&emsp;*[HtmlCommentPostMinusMinusChars](#HtmlCommentPostMinusMinusChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlCommentPostMinusMinusChars"></a>*HtmlCommentPostMinusMinusChars* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentPostMinusMinusChars-mvaeifnj"></a>*[HtmlCommentNotMinusOrGreaterThanChar](#HtmlCommentNotMinusOrGreaterThanChar)*&emsp;*[HtmlCommentChars](#HtmlCommentChars)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="HtmlCommentPostMinusMinusChars-vtgqwuws"></a>`` - ``&emsp;*[HtmlCommentPostMinusMinusChars](#HtmlCommentPostMinusMinusChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="HtmlCommentNotMinusChar"></a>*HtmlCommentNotMinusChar* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentNotMinusChar-z4htnqqt"></a>*[SourceCharacter](#SourceCharacter)* **but not** `` - ``  
  
&emsp;&emsp;<a name="HtmlCommentNotMinusOrGreaterThanChar"></a>*HtmlCommentNotMinusOrGreaterThanChar* **::**  
&emsp;&emsp;&emsp;<a name="HtmlCommentNotMinusOrGreaterThanChar-5apcqmei"></a>*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` - `` **or** `` > ``  
  
&emsp;&emsp;<a name="HtmlEntity"></a>*HtmlEntity* **::**  
&emsp;&emsp;&emsp;<a name="HtmlEntity-pwt8mgvl"></a>`` &# ``&emsp;*[HtmlEntityEscapeSequence](#HtmlEntityEscapeSequence)*&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="HtmlEntity-rkpixntx"></a>`` & ``&emsp;*[HtmlEntityName](#HtmlEntityName)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="HtmlEntityEscapeSequence"></a>*HtmlEntityEscapeSequence* **::**  
&emsp;&emsp;&emsp;<a name="HtmlEntityEscapeSequence-5cytuf8j"></a>*[HtmlEntityDecimalSequence](#HtmlEntityDecimalSequence)*  
&emsp;&emsp;&emsp;<a name="HtmlEntityEscapeSequence-tu6qk5r_"></a>*[HtmlEntityHexSequence](#HtmlEntityHexSequence)*  
  
&emsp;&emsp;<a name="HtmlEntityDecimalSequence"></a>*HtmlEntityDecimalSequence* **::**  
&emsp;&emsp;&emsp;<a name="HtmlEntityDecimalSequence-bxtox5eb"></a>*[DecimalDigits](#DecimalDigits)*  
  
&emsp;&emsp;<a name="HtmlEntityHexSequence"></a>*HtmlEntityHexSequence* **::**  
&emsp;&emsp;&emsp;<a name="HtmlEntityHexSequence-p9d35iqg"></a>`` X ``&emsp;*[HexDigits](#HexDigits)*  
&emsp;&emsp;&emsp;<a name="HtmlEntityHexSequence-q4wi0pyo"></a>`` x ``&emsp;*[HexDigits](#HexDigits)*  
  
&emsp;&emsp;<a name="HtmlEntityName"></a>*HtmlEntityName* **::**  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-woqvuahe"></a>`` quot ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jcnzx6pt"></a>`` amp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nte56k12"></a>`` apos ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-7jgaplp9"></a>`` lt ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6ig3u-sn"></a>`` gt ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-duf8-2xp"></a>`` nbsp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-l2h6j6sv"></a>`` iexcl ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-meiyjtvh"></a>`` cent ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-xlka7ns0"></a>`` pound ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mwlgjvnd"></a>`` curren ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-u4jlqts4"></a>`` yen ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rscjp_9a"></a>`` brvbar ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zlftuads"></a>`` sect ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-e9ngtbph"></a>`` uml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName--qbnalvs"></a>`` copy ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hnxdrzmv"></a>`` ordf ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-i2wvobxy"></a>`` laquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-gnxkho7v"></a>`` not ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-9c1njvx5"></a>`` shy ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mx1gu6fd"></a>`` reg ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-djtrh7rp"></a>`` macr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-5gf-ogdi"></a>`` deg ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hdqr9q72"></a>`` plusmn ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tfxric6p"></a>`` sup2 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tjjmhuku"></a>`` sup3 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-kqvgkjzt"></a>`` acute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-cd-82bel"></a>`` micro ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-qep4r72v"></a>`` para ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-xon9wfrx"></a>`` middot ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-0ioykbtj"></a>`` cedil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-on1rzp4s"></a>`` sup1 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-w7dtdxpz"></a>`` ordm ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ji9fpklk"></a>`` raquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-wbahcska"></a>`` frac14 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-dda_35gv"></a>`` frac12 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rizhmn97"></a>`` frac34 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-fwttskq_"></a>`` iquest ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pkyhgi5m"></a>`` Agrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6zvkxusi"></a>`` Aacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jsxcciwu"></a>`` Acirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-kjvffwxh"></a>`` Atilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zjz2zziz"></a>`` Auml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-m9im-kho"></a>`` Aring ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pu2wapvs"></a>`` AElig ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-gelbktgh"></a>`` Ccedil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-bn84velw"></a>`` Egrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hhbjhcgk"></a>`` Eacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-70lk6j3z"></a>`` Ecirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-8ubpfaju"></a>`` Euml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vwf8czip"></a>`` Igrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-b-ekrkre"></a>`` Iacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6d_wxhom"></a>`` Icirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ca-_3tbw"></a>`` Iuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-d7hxxcht"></a>`` ETH ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-un7zame9"></a>`` Ntilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pokfirax"></a>`` Ograve ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-1wkjgqri"></a>`` Oacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-83o1gl34"></a>`` Ocirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-okv4sakv"></a>`` Otilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p6axabfb"></a>`` Ouml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ri19pdjg"></a>`` times ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-3k-gs_wc"></a>`` Oslash ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-dmofh5rm"></a>`` Ugrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ydz3ldlp"></a>`` Uacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nvrfqykh"></a>`` Ucirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rrklwzx_"></a>`` Uuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6ogi2owj"></a>`` Yacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-saeafm_u"></a>`` THORN ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-k_wfrxlt"></a>`` szlig ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-psrwdpa4"></a>`` agrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-aenmnvv_"></a>`` aacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mfgieinm"></a>`` acirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-a3s7nh9d"></a>`` atilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-dvfkltjm"></a>`` auml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-klbmhnj0"></a>`` aring ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-w3dfj8xs"></a>`` aelig ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-u4hdnhth"></a>`` ccedil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName--qgjuk1x"></a>`` egrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-34ni0brb"></a>`` eacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zrihn4p6"></a>`` ecirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-kqniuaat"></a>`` euml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-wmvqrtg7"></a>`` igrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-qaxon4es"></a>`` iacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-r9uzzfsj"></a>`` icirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-sv76lq3-"></a>`` iuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-5f_oxsln"></a>`` eth ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-fzdzvqer"></a>`` ntilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-sbavi8rh"></a>`` ograve ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-_z0zuhum"></a>`` oacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-qacppmg0"></a>`` ocirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-oj6xfpkk"></a>`` otilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-bmvjbwdx"></a>`` ouml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zcd0xrfu"></a>`` divide ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-d0hbey8v"></a>`` oslash ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vvdirohu"></a>`` ugrave ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-y_a-rmbm"></a>`` uacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-7xpaowtq"></a>`` ucirc ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hru0oxpc"></a>`` uuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zs39ltxy"></a>`` yacute ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-g_eojzqk"></a>`` thorn ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hi9sxmq4"></a>`` yuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-diwgl6rc"></a>`` OElig ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-oc9kitrf"></a>`` oelig ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ae1elqjw"></a>`` Scaron ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ufjgdaah"></a>`` scaron ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-cxd6hbyf"></a>`` Yuml ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-r5hxaai4"></a>`` fnof ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nyu01joy"></a>`` circ ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-asju6dfg"></a>`` tilde ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-eeyiw0hy"></a>`` Alpha ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mlxo6xcs"></a>`` Beta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-68umcrae"></a>`` Gamma ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jzzizaij"></a>`` Delta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-h14znbi8"></a>`` Epsilon ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ygskupim"></a>`` Zeta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-l1rcg-98"></a>`` Eta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vs1aajyp"></a>`` Theta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zjxle0py"></a>`` Iota ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-xv1hjtfy"></a>`` Kappa ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-c54sbudq"></a>`` Lambda ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ij8n3u6p"></a>`` Mu ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yqs4wif1"></a>`` Nu ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-bovm29dk"></a>`` Xi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rue-u-kq"></a>`` Omicron ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yx130xcm"></a>`` Pi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-058aiveb"></a>`` Rho ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ctpj_cod"></a>`` Sigma ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-9l6l_k-m"></a>`` Tau ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-e_ayaxol"></a>`` Upsilon ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p7fgqfat"></a>`` Phi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-lslr1acp"></a>`` Chi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mpod5_si"></a>`` Psi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ef2a1zse"></a>`` Omega ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-wzncjh-6"></a>`` alpha ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName--uimkp5g"></a>`` beta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vbvz6ox7"></a>`` gamma ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zei3aumu"></a>`` delta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mr5i6zag"></a>`` epsilon ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-a_yu2o3n"></a>`` zeta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mwfp3y5p"></a>`` eta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mwe9oexp"></a>`` theta ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-y-ukhezx"></a>`` iota ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zkwlpcdq"></a>`` kappa ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jjxmoo4g"></a>`` lambda ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pt7fdxjp"></a>`` mu ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vtpvfmxz"></a>`` nu ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-uqk8kejl"></a>`` xi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-07bdzorh"></a>`` omicron ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hhkqs4-c"></a>`` pi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-cmzku7dh"></a>`` rho ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ppbgfha-"></a>`` sigmaf ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-aev3hwus"></a>`` sigma ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-zs6l5irs"></a>`` tau ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tispsqtd"></a>`` upsilon ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tvez0ice"></a>`` phi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-08ab29dh"></a>`` chi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-x2qzcoyc"></a>`` psi ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-1gnvip0r"></a>`` omega ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p0r7w0fa"></a>`` thetasym ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-lwffk9va"></a>`` upsih ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ghg6iuso"></a>`` piv ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-luk2ljdt"></a>`` ensp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p8bafvvh"></a>`` emsp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-etnbx8dr"></a>`` thinsp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ojy2wg4n"></a>`` zwnj ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-b8125wly"></a>`` zwj ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-y1fwxae2"></a>`` lrm ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ketha52w"></a>`` rlm ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-t9u34_en"></a>`` ndash ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jdsxhe4h"></a>`` mdash ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-klzrjocx"></a>`` lsquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-lwybinxj"></a>`` rsquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mv9213af"></a>`` sbquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ihg96_eg"></a>`` ldquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ni5zcqjf"></a>`` rdquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rlzrvcz-"></a>`` bdquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-eugvnyhn"></a>`` dagger ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-w1dbnyft"></a>`` Dagger ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-z-rxvvnn"></a>`` bull ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-auczmix6"></a>`` hellip ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-e6yjqpvd"></a>`` permil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pr36vyd6"></a>`` prime ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-k4qtoqcc"></a>`` Prime ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-o592fx6v"></a>`` lsaquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-xbmegseq"></a>`` rsaquo ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-wrthhjvj"></a>`` oline ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jfdmut6g"></a>`` frasl ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-lvate0yq"></a>`` euro ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-qtpzdgsh"></a>`` image ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-fp8tlqwx"></a>`` weierp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-0rtqroyd"></a>`` real ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rsdacqqb"></a>`` trade ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ylghny6h"></a>`` alefsym ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-idnb2edr"></a>`` larr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName--y8eiamy"></a>`` uarr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-cjyosfh0"></a>`` rarr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-vljtc22z"></a>`` darr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ftn2j1ig"></a>`` harr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jpj8usrz"></a>`` crarr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-jv9jh3bi"></a>`` lArr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rtavaytk"></a>`` uArr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-bclm-oms"></a>`` rArr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-gzzgchae"></a>`` dArr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-1-kmnc_t"></a>`` hArr ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-q3ywbxkl"></a>`` forall ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-iw-cuggg"></a>`` part ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-irgnqdhi"></a>`` exist ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-pvkpaovp"></a>`` empty ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-e-mydweb"></a>`` nabla ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-qbpb4sso"></a>`` isin ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tbusyj7h"></a>`` notin ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-hf1pyje2"></a>`` ni ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-xbfdnobq"></a>`` prod ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-0htsv24g"></a>`` sum ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-k_dk29yc"></a>`` minus ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-_fqe6cf-"></a>`` lowast ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yphqpxsb"></a>`` radic ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nhr1flmv"></a>`` prop ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName--ricvaw-"></a>`` infin ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-smckwoxq"></a>`` ang ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-evbmpyeh"></a>`` and ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-im2xkmn1"></a>`` or ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yfcjcueq"></a>`` cap ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-njdsowfv"></a>`` cup ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p0izja0r"></a>`` int ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-laovbxvx"></a>`` there4 ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ui4xvfzx"></a>`` sim ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-p5cytfgk"></a>`` cong ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yqii828f"></a>`` asymp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6axtqibo"></a>`` ne ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-0zxhxbwr"></a>`` equiv ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-r3to47wu"></a>`` le ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-tkvyohfy"></a>`` ge ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-rwioa9pj"></a>`` sub ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-3zyochxt"></a>`` sup ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-k2330ryz"></a>`` nsub ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6ut-_ydj"></a>`` sube ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-isgyelhy"></a>`` supe ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-736lvtmk"></a>`` oplus ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nkxt9goq"></a>`` otimes ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-yopep4fa"></a>`` perp ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6avvwfn1"></a>`` sdot ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-o3peq_cy"></a>`` lceil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-nkdf-oaw"></a>`` rceil ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-n7kg7hb1"></a>`` lfloor ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-_xo4qio3"></a>`` rfloor ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-4jjedjqr"></a>`` lang ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-6yzacoab"></a>`` rang ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-cbfhvifr"></a>`` loz ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ptlvblh5"></a>`` spades ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-mds7_jxk"></a>`` clubs ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-ubql6z6r"></a>`` hearts ``  
&emsp;&emsp;&emsp;<a name="HtmlEntityName-wihczr6r"></a>`` diams ``  
  
&emsp;&emsp;<a name="LinkReference"></a>*LinkReference* **::**  
&emsp;&emsp;&emsp;<a name="LinkReference-t4xnyzlr"></a>`` # ``&emsp;*[LinkReferenceChars](#LinkReferenceChars)*  
  
&emsp;&emsp;<a name="LinkReferenceChars"></a>*LinkReferenceChars* **::**  
&emsp;&emsp;&emsp;<a name="LinkReferenceChars-99cmq8mk"></a>*[LinkReferenceChar](#LinkReferenceChar)*&emsp;*[LinkReferenceChars](#LinkReferenceChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="LinkReferenceChar"></a>*LinkReferenceChar* **::**  
&emsp;&emsp;&emsp;<a name="LinkReferenceChar-lvvfp8iw"></a>*[SourceCharacter](#SourceCharacter)* **but not** *[LineTerminator](#LineTerminator)*  
  
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
&emsp;&emsp;&emsp;<a name="ReservedWord-nqjh_sxl"></a>*[BooleanLiteral](#BooleanLiteral)*  
  
&emsp;&emsp;<a name="Keyword"></a>*Keyword* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>but</code>       <code>define</code>    <code>default</code>   <code>empty</code>     <code>goal</code>  
&emsp;&emsp;&emsp;<code>here</code>      <code>import</code>    <code>lexical</code>   <code>line</code>      <code>lookahead</code>  
&emsp;&emsp;&emsp;<code>no</code>        <code>not</code>       <code>of</code>        <code>one</code>       <code>or</code>  
&emsp;&emsp;&emsp;<code>through</code></pre>
  
&emsp;&emsp;<a name="Punctuator"></a>*Punctuator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>@</code>     <code>:</code>     <code>::</code>    <code>:::</code>   <code>{</code>     <code>}</code>     <code>(</code>     <code>)</code>     <code>[</code>     <code>]</code>  
&emsp;&emsp;&emsp;<code>&gt;</code>     <code>[&gt;</code>    <code>,</code>     <code>+</code>     <code>~</code>     <code>?</code>     <code>==</code>    <code>=</code>     <code>!=</code>    <code>≠</code>  
&emsp;&emsp;&emsp;<code>&lt;-</code>    <code>∈</code>     <code>&lt;!</code>    <code>∉</code></pre>
  
&emsp;&emsp;<a name="ProductionSeparator"></a>*ProductionSeparator* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>:</code>     <code>::</code>    <code>:::</code></pre>
  
&emsp;&emsp;<a name="BooleanLiteral"></a>*BooleanLiteral* **::**  
&emsp;&emsp;&emsp;<a name="BooleanLiteral--jc4xg27"></a>`` true ``  
&emsp;&emsp;&emsp;<a name="BooleanLiteral-i9lgnxtt"></a>`` false ``  
  
&emsp;&emsp;<a name="NumericLiteral"></a>*NumericLiteral* **::**  
&emsp;&emsp;&emsp;<a name="NumericLiteral-gma1bw5s"></a>*[DecimalLiteral](#DecimalLiteral)*  
  
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
  
&emsp;&emsp;<a name="HexDigits"></a>*HexDigits* **::**  
&emsp;&emsp;&emsp;<a name="HexDigits-omskcs0d"></a>*[HexDigit](#HexDigit)*  
&emsp;&emsp;&emsp;<a name="HexDigits-yciymy2l"></a>*[HexDigits](#HexDigits)*&emsp;*[HexDigit](#HexDigit)*  
  
&emsp;&emsp;<a name="HexDigit"></a>*HexDigit* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>0</code>     <code>1</code>     <code>2</code>     <code>3</code>     <code>4</code>     <code>5</code>     <code>6</code>     <code>7</code>     <code>8</code>     <code>9</code>  
&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>  
&emsp;&emsp;&emsp;<code>E</code>     <code>F</code></pre>
  
&emsp;&emsp;<a name="NonZeroHexDigit"></a>*NonZeroHexDigit* **::**  
&emsp;&emsp;&emsp;<a name="NonZeroHexDigit-vkht0l2b"></a>*[HexDigit](#HexDigit)* **but not** `` 0 ``  
  
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
  
&emsp;&emsp;<a name="UnicodeCharacterLiteral"></a>*UnicodeCharacterLiteral* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-n5vq70kz"></a>*[UnicodeCharacterLiteralCodePoint](#UnicodeCharacterLiteralCodePoint)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-6lfx2hj3"></a>`` < ``&emsp;*[UnicodeCharacterLiteralCodePoint](#UnicodeCharacterLiteralCodePoint)*&emsp;*[WhiteSpace](#WhiteSpace)*&emsp;*[UnicodeCharacterLiteralCodePointDescription](#UnicodeCharacterLiteralCodePointDescription)*&emsp;`` > ``  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteral-diuaxbzl"></a>`` < ``&emsp;*[UnicodeCharacterLiteralCharacterIdentifier](#UnicodeCharacterLiteralCharacterIdentifier)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePoint"></a>*UnicodeCharacterLiteralCodePoint* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePoint-qndmauba"></a>`` U+ ``&emsp;*[UnicodeCharacterLiteralHexDigits](#UnicodeCharacterLiteralHexDigits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePoint-jyzae20u"></a>`` u+ ``&emsp;*[UnicodeCharacterLiteralHexDigits](#UnicodeCharacterLiteralHexDigits)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits"></a>*UnicodeCharacterLiteralHexDigits* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-pptelolr"></a>*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-7snh6qvu"></a>*[NonZeroHexDigit](#NonZeroHexDigit)*&emsp;*[Hex4Digits](#Hex4Digits)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralHexDigits-7cudep2z"></a>`` 10 ``&emsp;*[Hex4Digits](#Hex4Digits)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescription"></a>*UnicodeCharacterLiteralCodePointDescription* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescription-fhhzz-8p"></a>*[UnicodeCharacterLiteralCodePointDescriptionChars](#UnicodeCharacterLiteralCodePointDescriptionChars)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescriptionChars"></a>*UnicodeCharacterLiteralCodePointDescriptionChars* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescriptionChars-69yfewo4"></a>*[UnicodeCharacterLiteralCodePointDescriptionChar](#UnicodeCharacterLiteralCodePointDescriptionChar)*&emsp;*[UnicodeCharacterLiteralCodePointDescriptionChars](#UnicodeCharacterLiteralCodePointDescriptionChars)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescriptionChar"></a>*UnicodeCharacterLiteralCodePointDescriptionChar* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCodePointDescriptionChar-djthjw0q"></a>U+0020 **through** U+007E **but not** **one of** `` < `` **or** `` > `` **or** `` \ ``  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifier"></a>*UnicodeCharacterLiteralCharacterIdentifier* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifier-fsyxiqpy"></a>*[UnicodeCharacterLiteralCharacterIdentifierStart](#UnicodeCharacterLiteralCharacterIdentifierStart)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifier-m7iabant"></a>*[UnicodeCharacterLiteralCharacterIdentifier](#UnicodeCharacterLiteralCharacterIdentifier)*&emsp;*[UnicodeCharacterLiteralCharacterIdentifierPart](#UnicodeCharacterLiteralCharacterIdentifierPart)*  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierStart"></a>*UnicodeCharacterLiteralCharacterIdentifierStart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierStart-qqgs4y6w"></a>*[LowerAlpha](#LowerAlpha)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierStart-xj0u-zwf"></a>*[UpperAlpha](#UpperAlpha)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierStart-b1zllonv"></a>`` _ ``  
  
&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierPart"></a>*UnicodeCharacterLiteralCharacterIdentifierPart* **::**  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierPart-qqgs4y6w"></a>*[LowerAlpha](#LowerAlpha)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierPart-xj0u-zwf"></a>*[UpperAlpha](#UpperAlpha)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierPart-s4me4hlz"></a>*[DecimalDigit](#DecimalDigit)*  
&emsp;&emsp;&emsp;<a name="UnicodeCharacterLiteralCharacterIdentifierPart-b1zllonv"></a>`` _ ``  
  
&emsp;&emsp;<a name="LowerAlpha"></a>*LowerAlpha* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>a</code>     <code>b</code>     <code>c</code>     <code>d</code>     <code>e</code>     <code>f</code>     <code>g</code>     <code>h</code>     <code>i</code>     <code>j</code>  
&emsp;&emsp;&emsp;<code>k</code>     <code>l</code>     <code>m</code>     <code>n</code>     <code>o</code>     <code>p</code>     <code>q</code>     <code>r</code>     <code>s</code>     <code>t</code>  
&emsp;&emsp;&emsp;<code>u</code>     <code>v</code>     <code>w</code>     <code>x</code>     <code>y</code>     <code>z</code></pre>
  
&emsp;&emsp;<a name="UpperAlpha"></a>*UpperAlpha* **::** **one of**  
<pre>&emsp;&emsp;&emsp;<code>A</code>     <code>B</code>     <code>C</code>     <code>D</code>     <code>E</code>     <code>F</code>     <code>G</code>     <code>H</code>     <code>I</code>     <code>J</code>  
&emsp;&emsp;&emsp;<code>K</code>     <code>L</code>     <code>M</code>     <code>N</code>     <code>O</code>     <code>P</code>     <code>Q</code>     <code>R</code>     <code>S</code>     <code>T</code>  
&emsp;&emsp;&emsp;<code>U</code>     <code>V</code>     <code>W</code>     <code>X</code>     <code>Y</code>     <code>Z</code></pre>
  
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
  
&emsp;&emsp;<a name="ProseFull"></a>*ProseFull*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseFull-xtvu7qpy"></a>*[ProseChars](#ProseChars)*<sub>[?MultiLine]</sub>&emsp;[lookahead ∉ { `` ` ``, `` | `` }]  
  
&emsp;&emsp;<a name="ProseHead"></a>*ProseHead*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseHead-kt-xsp78"></a>*[ProseChars](#ProseChars)*<sub>[?MultiLine]</sub>&emsp;[lookahead ∈ { `` ` ``, `` | `` }]  
  
&emsp;&emsp;<a name="ProseMiddle"></a>*ProseMiddle*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseMiddle-kt-xsp78"></a>*[ProseChars](#ProseChars)*<sub>[?MultiLine]</sub>&emsp;[lookahead ∈ { `` ` ``, `` | `` }]  
  
&emsp;&emsp;<a name="ProseTail"></a>*ProseTail*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseTail-xtvu7qpy"></a>*[ProseChars](#ProseChars)*<sub>[?MultiLine]</sub>&emsp;[lookahead ∉ { `` ` ``, `` | `` }]  
  
&emsp;&emsp;<a name="ProseChars"></a>*ProseChars*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseChars-eigsxxd9"></a>*[ProseChar](#ProseChar)*<sub>[?MultiLine]</sub>&emsp;*[ProseChars](#ProseChars)*<sub>[?MultiLine]</sub><sub>opt</sub>  
  
&emsp;&emsp;<a name="ProseChar"></a>*ProseChar*<sub>[MultiLine]</sub> **::**  
&emsp;&emsp;&emsp;<a name="ProseChar-mzo2tvmz"></a>[+MultiLine]&emsp;*[LineTerminator](#LineTerminator)*&emsp;`` > ``  
&emsp;&emsp;&emsp;<a name="ProseChar-wisgg6ul"></a>[+MultiLine]&emsp;*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** `` | `` **or** *[LineTerminator](#LineTerminator)*  
&emsp;&emsp;&emsp;<a name="ProseChar-pmumwkvb"></a>[~MultiLine]&emsp;*[SourceCharacter](#SourceCharacter)* **but not** **one of** `` ` `` **or** `` | `` **or** `` ] ``  
  
&emsp;&emsp;<a name="Identifier"></a>*Identifier* **:**  
&emsp;&emsp;&emsp;<a name="Identifier-v6xddc2h"></a>*[IdentifierName](#IdentifierName)* **but not** *[ReservedWord](#ReservedWord)*  
  
&emsp;&emsp;<a name="Argument"></a>*Argument* **:**  
&emsp;&emsp;&emsp;<a name="Argument-qyr5b2v0"></a>`` + ``&emsp;*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="Argument-dwxa7c0h"></a>`` ~ ``&emsp;*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="Argument-krzcysaa"></a>`` ? ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments* **:**  
&emsp;&emsp;&emsp;<a name="Arguments-mdhsnk3i"></a>`` [ ``&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="Arguments-qwrdii6b"></a>`` [ ``&emsp;*[ArgumentList](#ArgumentList)*&emsp;`` ] ``  
  
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
&emsp;&emsp;&emsp;<a name="LookaheadEqualsAssertionClause-zuemj62o"></a>`` lookahead ``&emsp;`` = ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause"></a>*LookaheadNotEqualsAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause-ia_lwidb"></a>`` lookahead ``&emsp;`` != ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
&emsp;&emsp;&emsp;<a name="LookaheadNotEqualsAssertionClause-giolfcjc"></a>`` lookahead ``&emsp;`` ≠ ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="LookaheadInAssertionClause"></a>*LookaheadInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadInAssertionClause-0hqgcnwj"></a>`` lookahead ``&emsp;`` <- ``&emsp;*[SymbolSet](#SymbolSet)*  
&emsp;&emsp;&emsp;<a name="LookaheadInAssertionClause-tiatwix0"></a>`` lookahead ``&emsp;`` ∈ ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadNotInAssertionClause"></a>*LookaheadNotInAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadNotInAssertionClause-f13ybrfp"></a>`` lookahead ``&emsp;`` <! ``&emsp;*[SymbolSet](#SymbolSet)*  
&emsp;&emsp;&emsp;<a name="LookaheadNotInAssertionClause-dut96xwu"></a>`` lookahead ``&emsp;`` ∉ ``&emsp;*[SymbolSet](#SymbolSet)*  
  
&emsp;&emsp;<a name="LookaheadAssertionClause"></a>*LookaheadAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-6kw2gsod"></a>*[LookaheadEqualsAssertionClause](#LookaheadEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-qnalyzwm"></a>*[LookaheadNotEqualsAssertionClause](#LookaheadNotEqualsAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-taejfmwk"></a>*[LookaheadInAssertionClause](#LookaheadInAssertionClause)*  
&emsp;&emsp;&emsp;<a name="LookaheadAssertionClause-vmr8b1wa"></a>*[LookaheadNotInAssertionClause](#LookaheadNotInAssertionClause)*  
  
&emsp;&emsp;<a name="NoSymbolAssertionClause"></a>*NoSymbolAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="NoSymbolAssertionClause-k9pnaevx"></a>`` no ``&emsp;*[OrClause](#OrClause)*&emsp;`` here ``  
  
&emsp;&emsp;<a name="LexicalGoalAssertionClause"></a>*LexicalGoalAssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="LexicalGoalAssertionClause-dd_vvq2z"></a>`` lexical ``&emsp;`` goal ``&emsp;*[PrimarySymbol](#PrimarySymbol)*  
  
&emsp;&emsp;<a name="AssertionClause"></a>*AssertionClause* **:**  
&emsp;&emsp;&emsp;<a name="AssertionClause-z3-vy0_t"></a>*[EmptyAssertionClause](#EmptyAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-ljiirtvv"></a>*[LookaheadAssertionClause](#LookaheadAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-ncisqmtk"></a>*[NoSymbolAssertionClause](#NoSymbolAssertionClause)*  
&emsp;&emsp;&emsp;<a name="AssertionClause-fzqqffgp"></a>*[LexicalGoalAssertionClause](#LexicalGoalAssertionClause)*  
  
&emsp;&emsp;<a name="Assertion"></a>*Assertion* **:**  
&emsp;&emsp;&emsp;<a name="Assertion-5zr7w94f"></a>`` [ ``&emsp;[lookahead ∉ { `` ~ ``, `` + `` }]&emsp;*[AssertionClause](#AssertionClause)*&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="Assertion-wpchhq_r"></a>*[ProseAssertion](#ProseAssertion)*  
  
&emsp;&emsp;<a name="Prose"></a>*Prose* **:**  
&emsp;&emsp;&emsp;<a name="Prose-2tdvlgin"></a>`` > ``&emsp;*[ProseFull](#ProseFull)*<sub>[+MultiLine]</sub>  
&emsp;&emsp;&emsp;<a name="Prose-yswof6qq"></a>`` > ``&emsp;*[ProseHead](#ProseHead)*<sub>[+MultiLine]</sub>&emsp;*[ProseFragment](#ProseFragment)*&emsp;*[ProseSpans](#ProseSpans)*<sub>[+MultiLine]</sub>  
  
&emsp;&emsp;<a name="ProseAssertion"></a>*ProseAssertion* **:**  
&emsp;&emsp;&emsp;<a name="ProseAssertion-vikyzy02"></a>`` [> ``&emsp;*[ProseFull](#ProseFull)*<sub>[~MultiLine]</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ProseAssertion-y85rvs8l"></a>`` [> ``&emsp;*[ProseHead](#ProseHead)*<sub>[~MultiLine]</sub>&emsp;*[ProseFragment](#ProseFragment)*&emsp;*[ProseSpans](#ProseSpans)*<sub>[~MultiLine]</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ProseFragment"></a>*ProseFragment* **:**  
&emsp;&emsp;&emsp;<a name="ProseFragment-ofus3lpy"></a>*[Terminal](#Terminal)*  
&emsp;&emsp;&emsp;<a name="ProseFragment-k57noby_"></a>`` | ``&emsp;*[Identifier](#Identifier)*&emsp;`` | ``  
  
&emsp;&emsp;<a name="ProseSpans"></a>*ProseSpans*<sub>[MultiLine]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ProseSpans-q7a_gnl8"></a>*[ProseTail](#ProseTail)*<sub>[?MultiLine]</sub>  
&emsp;&emsp;&emsp;<a name="ProseSpans-t9f-vb2n"></a>*[ProseMiddleList](#ProseMiddleList)*<sub>[?MultiLine]</sub>&emsp;*[ProseTail](#ProseTail)*<sub>[?MultiLine]</sub>  
  
&emsp;&emsp;<a name="ProseMiddleList"></a>*ProseMiddleList*<sub>[MultiLine]</sub> **:**  
&emsp;&emsp;&emsp;<a name="ProseMiddleList-lqfl9vdb"></a>*[ProseMiddle](#ProseMiddle)*<sub>[?MultiLine]</sub>&emsp;*[ProseFragment](#ProseFragment)*  
&emsp;&emsp;&emsp;<a name="ProseMiddleList-pt2yvwua"></a>*[ProseMiddleList](#ProseMiddleList)*<sub>[?MultiLine]</sub>&emsp;*[ProseMiddle](#ProseMiddle)*<sub>[?MultiLine]</sub>&emsp;*[ProseFragment](#ProseFragment)*  
  
&emsp;&emsp;<a name="Symbol"></a>*Symbol* **:**  
&emsp;&emsp;&emsp;<a name="Symbol-4d3cub6p"></a>*[Assertion](#Assertion)*  
&emsp;&emsp;&emsp;<a name="Symbol-2zwilala"></a>*[BinarySymbol](#BinarySymbol)*  
  
&emsp;&emsp;<a name="SymbolSpan"></a>*SymbolSpan* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpan-cx0hfwg8"></a>*[Prose](#Prose)*  
&emsp;&emsp;&emsp;<a name="SymbolSpan-avztmrvm"></a>*[SymbolSpanRest](#SymbolSpanRest)*  
  
&emsp;&emsp;<a name="SymbolSpanRest"></a>*SymbolSpanRest* **:**  
&emsp;&emsp;&emsp;<a name="SymbolSpanRest-8uqt4hoo"></a>*[Symbol](#Symbol)*&emsp;*[SymbolSpanRest](#SymbolSpanRest)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSideList"></a>*RightHandSideList* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSideList-nolbdbjn"></a>*[RightHandSide](#RightHandSide)*&emsp;*[RightHandSideList](#RightHandSideList)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="RightHandSide"></a>*RightHandSide* **:**  
&emsp;&emsp;&emsp;<a name="RightHandSide-ii3ijkha"></a>*[Constraints](#Constraints)*<sub>opt</sub>&emsp;*[SymbolSpan](#SymbolSpan)*&emsp;*[LinkReference](#LinkReference)*<sub>opt</sub>&emsp;*[LineTerminator](#LineTerminator)*  
  
&emsp;&emsp;<a name="Constraints"></a>*Constraints* **:**  
&emsp;&emsp;&emsp;<a name="Constraints-m57ag3lb"></a>`` [ ``&emsp;[lookahead ∈ { `` ~ ``, `` + `` }]&emsp;*[ConstraintList](#ConstraintList)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="ConstraintList"></a>*ConstraintList* **:**  
&emsp;&emsp;&emsp;<a name="ConstraintList-zdh7eqf7"></a>*[Constraint](#Constraint)*  
&emsp;&emsp;&emsp;<a name="ConstraintList-hy45ujvx"></a>*[ConstraintList](#ConstraintList)*&emsp;`` , ``&emsp;*[Constraint](#Constraint)*  
  
&emsp;&emsp;<a name="Constraint"></a>*Constraint* **:**  
&emsp;&emsp;&emsp;<a name="Constraint-qyr5b2v0"></a>`` + ``&emsp;*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="Constraint-dwxa7c0h"></a>`` ~ ``&emsp;*[Identifier](#Identifier)*  
  
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
&emsp;&emsp;&emsp;<a name="Parameters-g-_fweri"></a>`` [ ``&emsp;*[ParameterList](#ParameterList)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="Production"></a>*Production* **:**  
&emsp;&emsp;&emsp;<a name="Production-mryms-2l"></a>*[Identifier](#Identifier)*&emsp;*[Parameters](#Parameters)*<sub>opt</sub>&emsp;*[ProductionSeparator](#ProductionSeparator)*&emsp;*[Body](#Body)*  
  
&emsp;&emsp;<a name="Body"></a>*Body* **:**  
&emsp;&emsp;&emsp;<a name="Body-1ccq4omr"></a>*[OneOfList](#OneOfList)*  
&emsp;&emsp;&emsp;<a name="Body-llmigrud"></a>*[RightHandSide](#RightHandSide)*  
&emsp;&emsp;&emsp;<a name="Body-gi-s9hmk"></a>*[LineTerminator](#LineTerminator)*&emsp;*[Indent](#Indent)*&emsp;*[RightHandSideList](#RightHandSideList)*&emsp;*[Dedent](#Dedent)*  
  
&emsp;&emsp;<a name="Import"></a>*Import* **:**  
&emsp;&emsp;&emsp;<a name="Import-fq2yrawj"></a>`` @ ``&emsp;`` import ``&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="Define"></a>*Define* **:**  
&emsp;&emsp;&emsp;<a name="Define-pxc0bbbo"></a>`` @ ``&emsp;`` define ``&emsp;*[Identifier](#Identifier)*&emsp;`` default ``  
&emsp;&emsp;&emsp;<a name="Define-87mg0xo2"></a>`` @ ``&emsp;`` define ``&emsp;*[Identifier](#Identifier)*&emsp;*[BooleanLiteral](#BooleanLiteral)*  
  
&emsp;&emsp;<a name="Line"></a>*Line* **:**  
&emsp;&emsp;&emsp;<a name="Line-yjbsk9nk"></a>`` @ ``&emsp;`` line ``&emsp;`` default ``  
&emsp;&emsp;&emsp;<a name="Line-xrhpmx3b"></a>`` @ ``&emsp;`` line ``&emsp;*[NumericLiteral](#NumericLiteral)*&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="MetaElement"></a>*MetaElement* **:**  
&emsp;&emsp;&emsp;<a name="MetaElement-1vvj0r3v"></a>*[Import](#Import)*  
&emsp;&emsp;&emsp;<a name="MetaElement-mvthdcbx"></a>*[Define](#Define)*  
&emsp;&emsp;&emsp;<a name="MetaElement-6pz2addi"></a>*[Line](#Line)*  
  
&emsp;&emsp;<a name="SourceElement"></a>*SourceElement* **:**  
&emsp;&emsp;&emsp;<a name="SourceElement-n7nathbb"></a>[empty]  
&emsp;&emsp;&emsp;<a name="SourceElement-33d8ezht"></a>*[Production](#Production)*  
&emsp;&emsp;&emsp;<a name="SourceElement-_dycxkfx"></a>*[MetaElement](#MetaElement)*  
  
&emsp;&emsp;<a name="SourceElements"></a>*SourceElements* **:**  
&emsp;&emsp;&emsp;<a name="SourceElements-pgyhgrp-"></a>*[SourceElement](#SourceElement)*&emsp;*[SourceElements](#SourceElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="SourceFile"></a>*SourceFile* **:**  
&emsp;&emsp;&emsp;<a name="SourceFile-y5ymnvv-"></a>*[SourceElements](#SourceElements)*  
  
