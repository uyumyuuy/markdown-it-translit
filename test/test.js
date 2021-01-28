"use strict";

var path = require("path");
var generate = require("markdown-it-testgen");

/*eslint-env mocha*/

describe("markdown-it-assyriology-translit", function () {
  var md = require("markdown-it")().use(require("../"));

  generate(path.join(__dirname, "fixtures/translit.txt"), md);
});

describe("markdown-it-assyriology-translit", function () {
  var md = require("markdown-it")().use(require("../"), {
    accentIndex: true,
    useSubSupUnicode: false,
    convertTypography: false,
  });
  generate(path.join(__dirname, "fixtures/accent_index.txt"), md);
});

describe("markdown-it-assyriology-translit", function () {
  var md = require("markdown-it")().use(require("../"), {
    accentIndex: false,
    useSubSupUnicode: true,
    convertTypography: false,
  });
  generate(path.join(__dirname, "fixtures/subsup_unicode.txt"), md);
});

describe("markdown-it-assyriology-translit", function () {
  var md = require("markdown-it")().use(require("../"), {
    accentIndex: false,
    useSubSupUnicode: false,
    convertTypography: true,
  });
  generate(path.join(__dirname, "fixtures/convert_typography.txt"), md);
});
