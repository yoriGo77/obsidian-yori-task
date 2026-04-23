const test = require("node:test");
const assert = require("node:assert/strict");

const { getMondayOfOffset, getWeekKeyByOffset } = require("../lib/date-utils");

test("getMondayOfOffset returns Monday", () => {
  const date = getMondayOfOffset(0);
  assert.equal(date.getDay(), 1);
});

test("getWeekKeyByOffset returns YYYYMMDD format", () => {
  const key = getWeekKeyByOffset(0);
  assert.match(key, /^\d{8}$/);
});

test("getWeekKeyByOffset moves by weeks", () => {
  const thisWeek = getWeekKeyByOffset(0);
  const nextWeek = getWeekKeyByOffset(-1);
  const lastWeek = getWeekKeyByOffset(1);
  assert.notEqual(thisWeek, nextWeek);
  assert.notEqual(thisWeek, lastWeek);
});
