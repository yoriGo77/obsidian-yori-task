const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ensureSettingsDataShape,
  migrateEventScopes,
  migrateWeekKeysToLastWeek,
  ensureDefaultColumns,
  normalizeBoardColumnOrders
} = require("../lib/data-migrations");
const { DEFAULT_SETTINGS, DONE_COLUMN_ID, SCOPE_BOARD, SCOPE_WEEK } = require("../lib/constants");

function createSettings(partial) {
  return {
    accentColor: "#000000",
    addHintColor: "#000000",
    cardBgColor: "#000000",
    panelBgColor: "#000000",
    noteOpenMode: "smart",
    taskTextColor: "#000000",
    data: {
      boardColumns: [],
      events: []
    },
    ...partial
  };
}

test("ensureSettingsDataShape fills missing data", () => {
  const settings = createSettings({ data: null });
  ensureSettingsDataShape(settings, DEFAULT_SETTINGS.data);
  assert.ok(Array.isArray(settings.data.events));
  assert.ok(Array.isArray(settings.data.boardColumns));
  assert.equal(settings.data.boardColumns.length > 0, true);
});

test("migrateEventScopes adds default scope", () => {
  const settings = createSettings({
    data: {
      boardColumns: [],
      events: [{ id: "1", title: "a" }, { id: "2", title: "b", scope: SCOPE_WEEK }]
    }
  });
  migrateEventScopes(settings);
  assert.equal(settings.data.events[0].scope, SCOPE_BOARD);
  assert.equal(settings.data.events[1].scope, SCOPE_WEEK);
});

test("migrateWeekKeysToLastWeek fills missing weekKey only for week scope", () => {
  const settings = createSettings({
    data: {
      boardColumns: [],
      events: [
        { id: "w1", scope: SCOPE_WEEK, title: "wk no key" },
        { id: "w2", scope: SCOPE_WEEK, weekKey: "20250101", title: "wk has key" },
        { id: "b1", scope: SCOPE_BOARD, title: "board task" }
      ]
    }
  });
  migrateWeekKeysToLastWeek(settings, "20261221");
  assert.equal(settings.data.events[0].weekKey, "20261221");
  assert.equal(settings.data.events[1].weekKey, "20250101");
  assert.equal("weekKey" in settings.data.events[2], false);
});

test("ensureDefaultColumns keeps custom columns and fixed default titles", () => {
  const settings = createSettings({
    data: {
      boardColumns: [
        { id: DONE_COLUMN_ID, title: "DONE CUSTOM", order: 0 },
        { id: "today", title: "TODAY CUSTOM", order: 1 },
        { id: "custom_col", title: "MY BLOCK", order: 2 }
      ],
      events: []
    }
  });
  ensureDefaultColumns(settings);
  const ids = settings.data.boardColumns.map((c) => c.id);
  assert.deepEqual(ids, ["today", "upcoming", "later", "custom_col", DONE_COLUMN_ID]);
  const today = settings.data.boardColumns.find((c) => c.id === "today");
  assert.equal(today.title, "TODO");
});

test("normalizeBoardColumnOrders keeps done column at the end", () => {
  const settings = createSettings({
    data: {
      boardColumns: [
        { id: DONE_COLUMN_ID, title: "RECENT 30 DONE", order: 0 },
        { id: "later", title: "LATER", order: 7 },
        { id: "today", title: "TODO", order: 3 }
      ],
      events: []
    }
  });
  normalizeBoardColumnOrders(settings);
  const ids = settings.data.boardColumns.map((c) => c.id);
  assert.deepEqual(ids, ["today", "later", DONE_COLUMN_ID]);
  assert.equal(settings.data.boardColumns[2].order, 2);
});
