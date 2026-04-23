const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_BOARD_COLUMNS,
  DONE_COLUMN_ID,
  DONE_CARD_BG,
  MAX_DONE_EVENTS,
  SCOPE_BOARD,
  SCOPE_WEEK
} = require("../lib/constants");
const {
  getEvents,
  createEvent,
  moveEventTo,
  setEventDone,
  copyEvent,
  pasteEvent
} = require("../lib/event-store");

function createSettings() {
  return {
    cardBgColor: "#f6f1eb",
    data: {
      boardColumns: JSON.parse(JSON.stringify(DEFAULT_BOARD_COLUMNS)),
      events: []
    }
  };
}

test("createEvent blocks manual create in done column", () => {
  const settings = createSettings();
  const created = createEvent(settings, {
    scope: SCOPE_BOARD,
    columnId: DONE_COLUMN_ID,
    title: "blocked",
    activeWeekKey: "20260101",
    currentWeekKey: "20260101",
    cardBgColor: settings.cardBgColor,
    createId: () => "evt-1"
  });
  assert.equal(created, null);
  assert.equal(settings.data.events.length, 0);
});

test("createEvent creates week event with weekKey", () => {
  const settings = createSettings();
  const created = createEvent(settings, {
    scope: SCOPE_WEEK,
    columnId: "week_1",
    title: "week task",
    activeWeekKey: "20260101",
    currentWeekKey: "20260108",
    cardBgColor: settings.cardBgColor,
    createId: () => "evt-week-1"
  });
  assert.equal(created.id, "evt-week-1");
  assert.equal(created.weekKey, "20260101");
  assert.equal(created.style.bgColor, settings.cardBgColor);
});

test("moveEventTo done marks completed and caps done list", () => {
  const settings = createSettings();
  for (let i = 0; i < MAX_DONE_EVENTS + 1; i += 1) {
    createEvent(settings, {
      scope: SCOPE_BOARD,
      columnId: "today",
      title: `task-${i}`,
      activeWeekKey: "20260101",
      currentWeekKey: "20260101",
      cardBgColor: settings.cardBgColor,
      createId: () => `evt-${i}`
    });
    moveEventTo(settings, {
      eventId: `evt-${i}`,
      targetScope: SCOPE_BOARD,
      targetColumnId: DONE_COLUMN_ID,
      targetOrder: null,
      activeWeekKey: "20260101",
      currentWeekKey: "20260101",
      cardBgColor: settings.cardBgColor
    });
  }
  const doneEvents = getEvents(settings, {
    scope: SCOPE_BOARD,
    columnId: DONE_COLUMN_ID,
    activeWeekKey: "20260101",
    currentWeekKey: "20260101"
  });
  assert.equal(doneEvents.length, MAX_DONE_EVENTS);
  assert.equal(doneEvents[0].id, `evt-${MAX_DONE_EVENTS}`);
  assert.equal(doneEvents.at(-1).id, "evt-1");
  assert.equal(doneEvents[0].style.bgColor, DONE_CARD_BG);
});

test("setEventDone false restores to previous column", () => {
  const settings = createSettings();
  createEvent(settings, {
    scope: SCOPE_BOARD,
    columnId: "later",
    title: "restore me",
    activeWeekKey: "20260101",
    currentWeekKey: "20260101",
    cardBgColor: settings.cardBgColor,
    createId: () => "evt-restore"
  });
  setEventDone(settings, {
    eventId: "evt-restore",
    done: true,
    hasColumn: (columnId) => settings.data.boardColumns.some((col) => col.id === columnId),
    activeWeekKey: "20260101",
    currentWeekKey: "20260101",
    cardBgColor: settings.cardBgColor
  });
  setEventDone(settings, {
    eventId: "evt-restore",
    done: false,
    hasColumn: (columnId) => settings.data.boardColumns.some((col) => col.id === columnId),
    activeWeekKey: "20260101",
    currentWeekKey: "20260101",
    cardBgColor: settings.cardBgColor
  });
  const event = settings.data.events.find((entry) => entry.id === "evt-restore");
  assert.equal(event.columnId, "later");
  assert.equal(event.completed, false);
  assert.equal(event.style.bgColor, settings.cardBgColor);
});

test("copyEvent and pasteEvent keep notePath and reset done style", () => {
  const settings = createSettings();
  settings.data.events.push({
    id: "done-1",
    scope: SCOPE_BOARD,
    columnId: DONE_COLUMN_ID,
    order: 0,
    title: "done task",
    completed: true,
    style: { bgColor: DONE_CARD_BG },
    notePath: "notes/a.md"
  });
  const clipboardEvent = copyEvent(settings, {
    eventId: "done-1",
    cardBgColor: settings.cardBgColor,
    unnamedLabel: "未命名任务"
  });
  assert.equal(clipboardEvent.style.bgColor, settings.cardBgColor);
  const pasted = pasteEvent(settings, {
    clipboardEvent,
    scope: SCOPE_BOARD,
    columnId: "today",
    activeWeekKey: "20260101",
    currentWeekKey: "20260101",
    cardBgColor: settings.cardBgColor,
    unnamedLabel: "未命名任务",
    createId: () => "evt-pasted"
  });
  assert.equal(pasted.id, "evt-pasted");
  assert.equal(pasted.notePath, "notes/a.md");
  assert.equal(pasted.completed, false);
  assert.equal(pasted.style.bgColor, settings.cardBgColor);
});
