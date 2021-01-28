"use strict";

function convert(text) {
  text = text.replace(/c/g, "š");
  text = text.replace(/C/g, "Š");
  text = text.replace(/sz/g, "š");
  text = text.replace(/SZ/g, "Š");
  text = text.replace(/s,/g, "ṣ");
  text = text.replace(/S,/g, "Ṣ");
  text = text.replace(/t,/g, "ṭ");
  text = text.replace(/T,/g, "Ṭ");
  text = text.replace(/t_/g, "ṯ");
  text = text.replace(/T_/g, "Ṯ");
  text = text.replace(/j/g, "ŋ");
  text = text.replace(/J/g, "Ŋ");
  text = text.replace(/g~/g, "g̃");
  text = text.replace(/G~/g, "G̃");
  text = text.replace(/h,/g, "ḥ");
  text = text.replace(/h/g, "ḫ");
  text = text.replace(/H/g, "Ḫ");
  text = text.replace(/a\^/g, "â");
  text = text.replace(/i\^/g, "î");
  text = text.replace(/u\^/g, "û");
  text = text.replace(/e\^/g, "ê");
  text = text.replace(/o\^/g, "ô");
  text = text.replace(/A\^/g, "Â");
  text = text.replace(/I\^/g, "Î");
  text = text.replace(/U\^/g, "Û");
  text = text.replace(/E\^/g, "Ê");
  text = text.replace(/O\^/g, "Ô");
  text = text.replace(/a~/g, "ā");
  text = text.replace(/i~/g, "ī");
  text = text.replace(/u~/g, "ū");
  text = text.replace(/e~/g, "ē");
  text = text.replace(/o~/g, "ō");
  text = text.replace(/A~/g, "Ā");
  text = text.replace(/I~/g, "Ī");
  text = text.replace(/U~/g, "Ū");
  text = text.replace(/E~/g, "Ē");
  text = text.replace(/O~/g, "Ō");
  text = text.replace(/'/g, "ʿ"); //ayin
  text = text.replace(/`/g, "ʾ"); //aleph

  return text;
}

function create_rule(type, accentIndex, convertTypography, useSubSupUnicode) {
  const first_marker = "=".charCodeAt(0);
  const second_maker_sumerian = "=".charCodeAt(0);
  const second_marker_akkadian = "*".charCodeAt(0);

  let akkadian;
  if (type === "akkadian") {
    akkadian = true;
  } else {
    akkadian = false;
  }

  function to_sub(x) {
    if (x === "x") {
      return "ₓ";
    } else {
      var n = Number(x);
      return String.fromCharCode(0x2080 + n);
    }
  }

  function transliterate_index(content, state) {
    if (convertTypography) {
      content = convert(content);
    }
    var m = content.match(/^([^0-9x]+)([0-9]*[0-9x])$/);
    if (m) {
      const capital = akkadian && m[1] === m[1].toUpperCase();
      const number = Number(m[2]);
      if (capital) {
        state.push("em_open", "em", 1);
      }
      if (accentIndex && (number === 2 || number === 3)) {
        const accent = function (c) {
          return {
            a: ["a", "á", "à"],
            i: ["i", "í", "ì"],
            u: ["u", "ú", "ù"],
            e: ["e", "é", "è"],
            A: ["A", "Á", "À"],
            I: ["I", "Í", "Ì"],
            U: ["U", "Ú", "Ù"],
            E: ["E", "É", "È"],
          }[c][number - 1];
        };
        var token = state.push("text", "", 0);
        token.content = m[1].replace(/[aiueAIUE]/, accent);
      } else if (useSubSupUnicode) {
        var token = state.push("text", "", 0);
        token.content = m[1] + m[2].split("").map(to_sub).join("");
      } else {
        var token = state.push("text", "", 0);
        token.content = m[1];
        state.push("sub_open", "sub", 1);
        var token = state.push("text", "", 0);
        token.content = m[2];
        state.push("sub_close", "sub", -1);
      }
      if (capital) {
        state.push("em_close", "em", -1);
      }
    } else {
      if (
        akkadian &&
        content === content.toUpperCase() &&
        !content.match(/[ .\-()]/)
      ) {
        state.push("em_open", "em", 1);
        var token = state.push("text", "", 0);
        token.content = content;
        state.push("em_close", "em", -1);
      } else {
        var token = state.push("text", "", 0);
        token.content = content;
      }
    }
  }

  function transliterate(content, state) {
    var tokens = content.split(/({[^}]+)}|([ .\-()])/);
    tokens.forEach((text) => {
      if (!text) return;
      if (text == "") return;
      var ch = text.charCodeAt(0);
      if (ch === 0x7b /* { */) {
        if (useSubSupUnicode) {
          switch (text.slice(1)) {
            case "d":
              state.push("text", "", 0).content = "ᵈ";
              return;
            case "f":
              state.push("text", "", 0).content = "ᶠ";
              return;
            case "m":
              state.push("text", "", 0).content = "ᵐ";
              return;
            case "ki":
              state.push("text", "", 0).content = "ᵏⁱ";
              return;
          }
        }
        state.push("sup_open", "sup", 1);
        transliterate_index(text.slice(1), state);
        state.push("sup_close", "sup", -1);
      } else {
        transliterate_index(text, state);
      }
    });
  }

  return function tokenize(state, silent) {
    var found,
      content,
      token,
      max = state.posMax,
      start = state.pos,
      second_marker;

    if (akkadian) {
      second_marker = second_marker_akkadian;
    } else {
      second_marker = second_maker_sumerian;
    }

    if (state.src.charCodeAt(start) !== first_marker) {
      return false;
    }
    if (silent) {
      return false;
    } // don't run any pairs in validation mode
    if (start + 4 >= max) {
      return false;
    }

    state.pos++;
    if (state.src.charCodeAt(state.pos) !== second_marker) {
      state.pos = start;
      return false;
    }

    state.pos++;
    while (state.pos < max - 1) {
      if (state.src.charCodeAt(state.pos) === second_marker) {
        state.pos++;
        if (state.src.charCodeAt(state.pos) === first_marker) {
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
    if (akkadian) {
      token.markup = "=*";
      token.attrJoin("class", "akkado-transliteral");
    } else {
      token.markup = "==";
      token.attrJoin("class", "sumero-transliteral");
    }

    transliterate(content, state);

    token = state.push("translit_close", "span", -1);
    if (akkadian) {
      token.markup = "*=";
    } else {
      token.markup = "==";
    }

    state.pos = state.posMax + 1;
    state.posMax = max;
    return true;
  };
}

module.exports = function ins_plugin(md, options) {
  var defaults = {
    accentIndex: false,
    useSubSupUnicode: false,
    convertTypography: false,
  };
  var opts = md.utils.assign({}, defaults, options || {});
  md.inline.ruler.before(
    "emphasis",
    "assyriology-translit1",
    create_rule(
      "sumerian",
      opts.accentIndex,
      opts.convertTypography,
      opts.useSubSupUnicode
    )
  );
  md.inline.ruler.before(
    "emphasis",
    "assyriology-translit2",
    create_rule(
      "akkadian",
      opts.accentIndex,
      opts.convertTypography,
      opts.useSubSupUnicode
    )
  );
};
