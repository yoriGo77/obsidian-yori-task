const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeHex } = require("../lib/color-utils");

test("normalizeHex normalizes shorthand hex", () => {
  assert.equal(normalizeHex("#AbC"), "#aabbcc");
});

test("normalizeHex trims and lowercases normal hex", () => {
  assert.equal(normalizeHex("  #A1B2C3 "), "#a1b2c3");
});

test("normalizeHex keeps non-hex color tokens as lowercase strings", () => {
  assert.equal(normalizeHex(" RGB(1,2,3) "), "rgb(1,2,3)");
});

test("normalizeHex handles empty input", () => {
  assert.equal(normalizeHex(""), "");
  assert.equal(normalizeHex(null), "");
});
