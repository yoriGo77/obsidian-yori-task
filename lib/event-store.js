const { normalizeHex } = require("./color-utils");
const {
  DONE_COLUMN_ID,
  DONE_CARD_BG,
  MAX_DONE_EVENTS,
  SCOPE_BOARD,
  SCOPE_WEEK
} = require("./constants");

function getEvents(settings, options) {
  const sc = options.scope || SCOPE_BOARD;
  const columnId = options.columnId;
  const activeWeekKey = options.activeWeekKey;
  const currentWeekKey = options.currentWeekKey;
  const events = settings?.data?.events || [];
  if (sc === SCOPE_BOARD) {
    const isDoneColumn = columnId === DONE_COLUMN_ID;
    return events
      .filter((event) => (event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === columnId && !!event.completed === isDoneColumn)
      .sort((a, b) => a.order - b.order);
  }
  if (sc === SCOPE_WEEK) {
    const wk = activeWeekKey || currentWeekKey;
    return events
      .filter(
        (event) =>
          (event.scope || SCOPE_BOARD) === SCOPE_WEEK &&
          event.columnId === columnId &&
          ((event.weekKey && event.weekKey === wk) || (!event.weekKey && wk === currentWeekKey))
      )
      .sort((a, b) => a.order - b.order);
  }
  return events.filter((event) => (event.scope || SCOPE_BOARD) === sc && event.columnId === columnId).sort((a, b) => a.order - b.order);
}

function normalizeOrders(settings, options) {
  const sc = options.scope || SCOPE_BOARD;
  getEvents(settings, options).forEach((event, index) => {
    event.order = index;
  });
  return sc;
}

function createEvent(settings, options) {
  const sc = options.scope || SCOPE_BOARD;
  const columnId = options.columnId;
  if (sc === SCOPE_BOARD && columnId === DONE_COLUMN_ID) return null;
  const createId = typeof options.createId === "function" ? options.createId : () => `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const nextOrder = getEvents(settings, options).length;
  const event = {
    id: createId(),
    scope: sc,
    columnId,
    order: nextOrder,
    title: options.title,
    completed: false,
    style: { bgColor: options.cardBgColor }
  };
  if (sc === SCOPE_WEEK) {
    event.weekKey = options.activeWeekKey || options.currentWeekKey;
  }
  settings.data.events.push(event);
  return event;
}

function deleteEvent(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return;
  const originalColumnId = event.columnId;
  const originalScope = event.scope || SCOPE_BOARD;
  settings.data.events = settings.data.events.filter((entry) => entry.id !== options.eventId);
  normalizeOrders(settings, { ...options, scope: originalScope, columnId: originalColumnId });
}

function moveEventTo(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return;

  const fromScope = event.scope || SCOPE_BOARD;
  const fromColumnId = event.columnId;
  const targetScope = options.targetScope;
  const targetColumnId = options.targetColumnId;

  if (fromScope !== targetScope) return;

  if (fromScope === SCOPE_BOARD && fromColumnId === DONE_COLUMN_ID && targetColumnId !== DONE_COLUMN_ID) {
    delete event.previousColumnId;
  }

  if (targetScope === SCOPE_BOARD && targetColumnId === DONE_COLUMN_ID) {
    if (fromColumnId !== DONE_COLUMN_ID) {
      event.previousColumnId = fromColumnId;
    }
    event.completed = true;
    event.style = event.style || {};
    event.style.bgColor = DONE_CARD_BG;
  } else {
    event.completed = false;
    if (fromScope === SCOPE_BOARD && fromColumnId === DONE_COLUMN_ID) {
      event.style = event.style || {};
      if (normalizeHex(event.style.bgColor) === normalizeHex(DONE_CARD_BG)) {
        event.style.bgColor = options.cardBgColor;
      }
    }
  }

  event.columnId = targetColumnId;
  event.scope = targetScope;

  const targetEvents = getEvents(settings, {
    ...options,
    scope: targetScope,
    columnId: targetColumnId
  }).filter((entry) => entry.id !== options.eventId);
  const insertAt =
    options.targetOrder == null
      ? targetScope === SCOPE_BOARD && targetColumnId === DONE_COLUMN_ID
        ? 0
        : targetEvents.length
      : Math.max(0, Math.min(options.targetOrder, targetEvents.length));
  targetEvents.splice(insertAt, 0, event);
  targetEvents.forEach((item, i) => {
    item.order = i;
  });

  if (fromColumnId !== targetColumnId || fromScope !== targetScope) {
    normalizeOrders(settings, { ...options, scope: fromScope, columnId: fromColumnId });
  }

  if (targetScope === SCOPE_BOARD && targetColumnId === DONE_COLUMN_ID) {
    const doneEvents = getEvents(settings, { ...options, scope: SCOPE_BOARD, columnId: DONE_COLUMN_ID });
    while (doneEvents.length > MAX_DONE_EVENTS) {
      const removed = doneEvents.pop();
      settings.data.events = settings.data.events.filter((entry) => entry.id !== removed.id);
    }
    normalizeOrders(settings, { ...options, scope: SCOPE_BOARD, columnId: DONE_COLUMN_ID });
  }
}

function setEventDone(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return;
  if ((event.scope || SCOPE_BOARD) !== SCOPE_BOARD) return;
  if (options.done) {
    moveEventTo(settings, {
      ...options,
      targetScope: SCOPE_BOARD,
      targetColumnId: DONE_COLUMN_ID,
      targetOrder: null
    });
    return;
  }
  if (event.columnId === DONE_COLUMN_ID) {
    let targetColumnId = event.previousColumnId || "today";
    if (!options.hasColumn || !options.hasColumn(targetColumnId) || targetColumnId === DONE_COLUMN_ID) {
      targetColumnId = "today";
    }
    moveEventTo(settings, {
      ...options,
      targetScope: SCOPE_BOARD,
      targetColumnId,
      targetOrder: null
    });
    return;
  }
  event.completed = false;
}

function setEventColor(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return;
  if ((event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID) return;
  event.style = event.style || {};
  event.style.bgColor = options.color;
}

function clearEventHighlight(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return;
  if ((event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID) return;
  event.style = event.style || {};
  event.style.bgColor = options.cardBgColor;
}

function copyEvent(settings, options) {
  const event = settings.data.events.find((entry) => entry.id === options.eventId);
  if (!event) return null;
  const style =
    (event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID
      ? { bgColor: options.cardBgColor }
      : { ...(event.style || {}) };
  return {
    title: (typeof event.title === "string" ? event.title : "").trim() || options.unnamedLabel,
    style,
    notePath: event.notePath || ""
  };
}

function pasteEvent(settings, options) {
  const sc = options.scope || SCOPE_BOARD;
  const clipboardEvent = options.clipboardEvent;
  if (!clipboardEvent || (sc === SCOPE_BOARD && options.columnId === DONE_COLUMN_ID)) return null;
  const title = (typeof clipboardEvent.title === "string" ? clipboardEvent.title : "").trim() || options.unnamedLabel;
  const event = createEvent(settings, {
    ...options,
    scope: sc,
    title
  });
  if (!event) return null;
  event.style = { ...(clipboardEvent.style || {}) };
  event.completed = false;
  if (clipboardEvent.notePath) {
    event.notePath = clipboardEvent.notePath;
  } else {
    delete event.notePath;
  }
  return event;
}

module.exports = {
  getEvents,
  createEvent,
  deleteEvent,
  normalizeOrders,
  moveEventTo,
  setEventDone,
  setEventColor,
  clearEventHighlight,
  copyEvent,
  pasteEvent
};
