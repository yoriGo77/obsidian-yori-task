const VIEW_TYPE = "yori-task-view";
const EVENT_DRAG_MIME = "application/x-yori-task-event-id";
const DONE_COLUMN_ID = "done30";
const MAX_DONE_EVENTS = 30;
const DONE_CARD_BG = "#f8f7f6";

const SCOPE_BOARD = "board";
const SCOPE_WEEK = "week";
const SCOPE_YEAR = "year";

const DEFAULT_BOARD_COLUMNS = [
  { id: "today", title: "TODO", order: 0 },
  { id: "upcoming", title: "UPCOMING", order: 1 },
  { id: "later", title: "LATER", order: 2 },
  { id: DONE_COLUMN_ID, title: "RECENT 30 DONE", order: 3 }
];

const WEEK_COLUMNS = [
  { id: "week_1", title: "MON" },
  { id: "week_2", title: "TUE" },
  { id: "week_3", title: "WED" },
  { id: "week_4", title: "THU" },
  { id: "week_5", title: "FRI" },
  { id: "week_6", title: "SAT" },
  { id: "week_7", title: "SUN" },
  { id: "week_sum", title: "SUMMARY" }
];

const YEAR_MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const YEAR_COLUMNS = YEAR_MONTH_LABELS.map((title, i) => ({
  id: `year_${i + 1}`,
  title
}));

const PALETTE = [
  { name: "yellow", color: "#f1eac9" },
  { name: "green", color: "#e3e8c6" },
  { name: "blue", color: "#d7e6ef" },
  { name: "red", color: "#f6e0d2" },
  { name: "purple", color: "#e8e0f1" },
  { name: "gray", color: "#dfdfdf" }
];

const DEFAULT_SETTINGS = {
  accentColor: "#998052",
  addHintColor: "#cbc0af",
  cardBgColor: "#f6f1eb",
  panelBgColor: "#f8f7f6",
  noteOpenMode: "smart",
  uiLanguage: "en",
  taskTextColor: "#806531",
  data: {
    boardColumns: DEFAULT_BOARD_COLUMNS,
    events: []
  }
};

module.exports = {
  VIEW_TYPE,
  EVENT_DRAG_MIME,
  DONE_COLUMN_ID,
  MAX_DONE_EVENTS,
  DONE_CARD_BG,
  SCOPE_BOARD,
  SCOPE_WEEK,
  SCOPE_YEAR,
  DEFAULT_BOARD_COLUMNS,
  WEEK_COLUMNS,
  YEAR_COLUMNS,
  PALETTE,
  DEFAULT_SETTINGS
};
