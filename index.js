"use strict";

function transliterate_index(content, state) {
  var m = content.match(/^([^0-9x]+)([0-9x])$/);
  if (m) {
    var token = state.push("text", "", 0);
    token.content = m[1];
    state.push("sub_open", "sub", 1);
    var token = state.push("text", "", 0);
    token.content = m[2];
    state.push("sub_close", "sub", -1);
  } else {
    var token = state.push("text", "", 0);
    token.content = content;
  }
}

function transliterate(content, state) {
  var tokens = content.split(/({[^}]+)}|([ .-])/);
  tokens.forEach((text) => {
    if (!text) return;
    if (text == "") return;
    var ch = text.charCodeAt(0);
    if (ch === 0x7b /* { */) {
      state.push("sup_open", "sup", 1);
      transliterate_index(text.slice(1), state);
      state.push("sup_close", "sup", -1);
    } else {
      transliterate_index(text, state);
    }
  });
}

function tokenize(state, silent) {
  var found,
    content,
    token,
    max = state.posMax,
    start = state.pos;

  if (state.src.charCodeAt(start) !== 0x3d /* = */) {
    return false;
  }
  if (silent) {
    return false;
  } // don't run any pairs in validation mode
  if (start + 4 >= max) {
    return false;
  }

  state.pos++;
  if (state.src.charCodeAt(state.pos) !== 0x3d /* = */) {
    return false;
  }

  state.pos++;
  while (state.pos < max - 1) {
    if (state.src.charCodeAt(state.pos) === 0x3d /* = */) {
      state.pos++;
      if (state.src.charCodeAt(state.pos) === 0x3d /* = */) {
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

module.exports = function ins_plugin(md) {
  md.inline.ruler.before("emphasis", "assyriology-translit", tokenize);
};
