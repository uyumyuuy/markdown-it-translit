"use strict";

function to_sub(x) {
  if (x === "x") {
    return "ₓ"
  } else {
    var n = Number(x)
    return String.fromCharCode(0x2080+n)
  }

}

function transliterate_index(content, state) {
  var m = content.match(/^([^0-9x]+)([0-9x])$/);
  if (m) {
    content = m[1] + m[2].split().map(to_sub).join("")
  }
  if (content === content.toUpperCase()) {
    state.push("em_open", "em", 1);
    var token = state.push("text", "", 0);
    token.content = content;
    state.push("em_close", "em", -1);
  } else {
    var token = state.push("text", "", 0);
    token.content = content;
  }
}

function transliterate(content, state) {
  var splitter = /([ ().-])/
  var tokens = content.split(/({[^}]+)}|([ ().-])/);
  tokens.forEach((text) => {
    if (!text) return;
    if (text == "") return;
    if (splitter.test(text)) {
      var token = state.push("text", "", 0)
      token.content = text
    } else {
      var ch = text.charCodeAt(0);
      if (ch === 0x7b /* { */) {
        state.push("sup_open", "sup", 1);
        transliterate_index(text.slice(1), state);
        state.push("sup_close", "sup", -1);
      } else {
        transliterate_index(text, state);
      }  
    }
  });
}

function tokenize(state, silent) {
  var found,
    content,
    token,
    max = state.posMax,
    start = state.pos;

  const equal = "=".charCodeAt(0);

  if (state.src.charCodeAt(start) !== equal /* = */) {
    return false;
  }
  if (silent) {
    return false;
  } // don't run any pairs in validation mode
  if (start + 4 >= max) {
    return false;
  }

  state.pos++;
  if (state.src.charCodeAt(state.pos) !== equal /* = */) {
    state.pos = start;
    return false;
  }

  state.pos++;
  while (state.pos < max - 1) {
    if (state.src.charCodeAt(state.pos) === equal /* = */) {
      state.pos++;
      if (state.src.charCodeAt(state.pos) === equal /* = */) {
        found = true;
        break;
      }
    }
    state.md.inline.skipToken(state);
  }

  if (!found || start + 2 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 2, state.pos - 1);

  state.posMax = state.pos;
  state.pos = start + 2;

  token = state.push("translit_open", "span", 1);
  token.markup = "==";
  token.attrJoin("class", "sumero-transliteral");

  transliterate(content, state);

  token = state.push("translit_close", "span", -1);
  token.markup = "==";

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}

function tokenize_akkadian(state, silent) {
  var found,
    content,
    token,
    max = state.posMax,
    start = state.pos;
  const equal = "=".charCodeAt(0);
  const asterisk = "*".charCodeAt(0);

  if (state.src.charCodeAt(start) !== equal) {
    return false;
  }
  if (silent) {
    return false;
  } // don't run any pairs in validation mode
  if (start + 4 >= max) {
    return false;
  }

  state.pos++;
  if (state.src.charCodeAt(state.pos) !== asterisk) {
    state.pos = start;
    return false;
  }

  state.pos++;
  while (state.pos < max - 1) {
    if (state.src.charCodeAt(state.pos) === asterisk) {
      state.pos++;
      if (state.src.charCodeAt(state.pos) === equal) {
        found = true;
        break;
      }
    }
    state.md.inline.skipToken(state);
  }

  if (!found || start + 2 === state.pos) {
    state.pos = start;
    return false;
  }

  content = state.src.slice(start + 2, state.pos - 1);

  state.posMax = state.pos;
  state.pos = start + 2;

  token = state.push("translit_open", "span", 1);
  token.markup = "=*";
  token.attrJoin("class", "akkado-transliteral");

  transliterate(content, state);

  token = state.push("translit_close", "span", -1);
  token.markup = "*=";

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
}

module.exports = function ins_plugin(md) {
  md.inline.ruler.before("emphasis", "assyriology-translit1", tokenize);
  md.inline.ruler.before(
    "emphasis",
    "assyriology-translit2",
    tokenize_akkadian
  );
};
