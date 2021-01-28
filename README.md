[![Build Status](https://travis-ci.com/uyumyuuy/markdown-it-translit.svg?branch=master)](https://travis-ci.com/uyumyuuy/markdown-it-translit)
[![npm version](https://badge.fury.io/js/%40uyum%2Fmarkdown-it-translit.svg)](https://badge.fury.io/js/%40uyum%2Fmarkdown-it-translit)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

Asscyriology Transliteration

## Install

```
yarn add @uyum/markdown-it-translit
```

## Use

```javascript
var md = require('markdown-it')()
            .use(require('@uyum/markdown-it-translit'),
            {    
                accentIndex: false,
                useSubSupUnicode: false,
                convertTypography: false,
            });
md.render('=={DIS}LUGAL.MES2==') 
//=><p><span class="sumero-transliteral"><sup>DIS</sup>LUGAL.MES<sub>2</sub></span></p>


md.render('=*{DIS}LUGAL.MES2*=') 
//=><p><span class="akkado-transliteral"><sup>DIS</sup>LUGAL.MES<sub>2</sub></span></p>
```

### Options

#### accentIndex
if true, it will convert a2 to á, a3 to à.

#### useSubSupUnicode

if true, it will try to use Unicode superscripts and subscripts instead of `<sup>` and `<sub>`.

#### convertTypography

if true, it will convert according to the table below.

| ascii | unicode |
| ----- | ------- |
| c     | š       |
| sz    | š       |
| s,    | ṣ       |
| t,    | ṭ       |
| t_    | ṯ       |
| j     | ŋ       |
| g~    | g̃       |
| h     | ḫ       |
| h,    | ḥ       |
| a^    | â       |
| a^    | â       |
| i^    | î       |
| u^    | û       |
| o^    | ô       |
| e^    | ê       |
| a~    | ā       |
| i~    | ī       |
| u~    | ū       |
| o~    | ō       |
| '     | ʿ       |
| `     | ʾ       |

## Licence

MIT