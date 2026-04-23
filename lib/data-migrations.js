const { DEFAULT_BOARD_COLUMNS, DONE_COLUMN_ID, SCOPE_BOARD, SCOPE_WEEK } = require("./constants");

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureSettingsDataShape(settings, fallbackData) {
  if (!settings || typeof settings !== "object") return;
  if (!settings.data || !Array.isArray(settings.data.events)) {
    settings.data = cloneJson(fallbackData);
  }
  if (!Array.isArray(settings.data.boardColumns) || settings.data.boardColumns.length === 0) {
    settings.data.boardColumns = cloneJson(DEFAULT_BOARD_COLUMNS);
  }
}

function migrateEventScopes(settings) {
  const events = settings?.data?.events;
  if (!Array.isArray(events)) return;
  for (const event of events) {
    if (!event.scope) event.scope = SCOPE_BOARD;
  }
}

function migrateWeekKeysToLastWeek(settings, lastWeekKey) {
  const events = settings?.data?.events;
  if (!Array.isArray(events)) return;
  for (const event of events) {
    if ((event.scope || SCOPE_BOARD) === SCOPE_WEEK && !event.weekKey) {
      event.weekKey = lastWeekKey;
    }
  }
}

function normalizeBoardColumnOrders(settings) {
  if (!settings?.data?.boardColumns) return;
  const cols = [...settings.data.boardColumns];
  const rest = cols.filter((c) => c.id !== DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
  const doneList = cols.filter((c) => c.id === DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
  rest.forEach((c, i) => {
    c.order = i;
  });
  doneList.forEach((c, i) => {
    c.order = rest.length + i;
  });
  settings.data.boardColumns = [...rest, ...doneList];
}

function ensureDefaultColumns(settings) {
  const current = settings?.data?.boardColumns || [];
  const extraColumns = current.filter((col) => !DEFAULT_BOARD_COLUMNS.some((d) => d.id === col.id));
  const normalized = DEFAULT_BOARD_COLUMNS.map((def) => {
    const existing = current.find((c) => c.id === def.id);
    return { ...(existing || def), id: def.id, title: def.title, order: def.order };
  });
  settings.data.boardColumns = [...normalized, ...extraColumns.map((c, i) => ({ ...c, order: normalized.length + i }))];
  normalizeBoardColumnOrders(settings);
}

module.exports = {
  ensureSettingsDataShape,
  migrateEventScopes,
  migrateWeekKeysToLastWeek,
  ensureDefaultColumns,
  normalizeBoardColumnOrders
};
