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
  const current = Array.isArray(settings?.data?.boardColumns) ? settings.data.boardColumns : [];
  const ordered = [...current].sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));
  const seen = new Set();
  const merged = [];
  for (const col of ordered) {
    if (!col || !col.id || seen.has(col.id)) continue;
    seen.add(col.id);
    merged.push({ ...col });
  }
  let nextOrder = merged.length;
  for (const def of DEFAULT_BOARD_COLUMNS) {
    if (seen.has(def.id)) continue;
    merged.push({ ...def, order: nextOrder });
    nextOrder += 1;
  }
  settings.data.boardColumns = merged;
  normalizeBoardColumnOrders(settings);
}

module.exports = {
  ensureSettingsDataShape,
  migrateEventScopes,
  migrateWeekKeysToLastWeek,
  ensureDefaultColumns,
  normalizeBoardColumnOrders
};
