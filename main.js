const fs = require("fs");
const path = require("path");
const obsidian = require("obsidian");
const {
  Plugin,
  ItemView,
  Notice,
  PluginSettingTab,
  Setting,
  Menu,
  Modal,
  setIcon,
  addIcon,
  TFile
} = obsidian;
const moment = obsidian.moment;

const VIEW_TYPE = "yori-task-view";
const EVENT_DRAG_MIME = "application/x-yori-task-event-id";
const DONE_COLUMN_ID = "done30";
const MAX_DONE_EVENTS = 30;
const DEFAULT_BOARD_COLUMNS = [
  { id: "today", title: "TODO", order: 0 },
  { id: "upcoming", title: "UPCOMING", order: 1 },
  { id: "later", title: "LATER", order: 2 },
  { id: DONE_COLUMN_ID, title: "RECENT 30 DONE", order: 3 }
];
const DONE_CARD_BG = "#f8f7f6";
const SCOPE_BOARD = "board";
const SCOPE_WEEK = "week";
const SCOPE_YEAR = "year";
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

/** 简中 / English，随 Obsidian 界面语言（moment.locale 与 html lang）切换 */
const I18N = {
  zh: {
    "ribbon.open": "打开 Yori Task",
    "command.open": "打开 Yori Task",
    "view.tabTask": "TASK",
    "view.tabWeek": "WEEK PLAN",
    "view.tabYear": "YEAR PLAN",
    "view.yearPlanSuffix": "YEAR PLAN",
    "week.in2": "2周后",
    "week.next": "下周",
    "week.this": "本周",
    "week.prev": "上周",
    "week.ago2": "2周前",
    "top.archiveWeek": "归档该周",
    "top.archiveYear": "归档本年",
    "notice.linkMissing": "该链接文件已删除或丢失",
    "notice.archiveCreated": "已创建归档笔记：{path}",
    "notice.columnCleared": "已清空 {title}",
    "notice.columnEmpty": "{title} 当前没有任务",
    "notice.taskAdded": "已添加任务：{name}",
    "notice.pasteUnavailable": "没有可粘贴任务，或当前区块不支持粘贴。",
    "notice.pasted": "已粘贴任务",
    "notice.pasteFailed": "粘贴失败。",
    "notice.doneManualBlocked": "DONE 区块不支持手动新增。",
    "notice.taskDeleted": "已删除任务",
    "notice.taskCopied": "已复制任务",
    "archive.week.title": "确认归档",
    "archive.week.msg": "是否创建周归档笔记 {name}？",
    "archive.week.confirm": "创建",
    "archive.year.msg": "是否创建年归档笔记 {name}？",
    "archive.md.planLine": "Plan日期：{range}",
    "archive.md.archiveLine": "归档日期：{date}",
    "archive.md.empty": "(空)",
    "clear.title": "确认清空",
    "clear.msg": "将清空区块 '{title}' 的所有任务，且无法恢复",
    "clear.confirm": "清空",
    "delete.title": "确认删除",
    "delete.msg": "将删除任务'{title}'，且无法恢复",
    "delete.confirm": "删除",
    "task.unnamed": "未命名任务",
    "ctx.deleteTask": "删除任务",
    "ctx.copyTask": "复制任务",
    "ctx.restoreIncomplete": "恢复未完成",
    "ctx.pasteHere": "粘贴任务到本区块",
    "ctx.renameBlock": "修改区块名称",
    "ctx.addBlock": "添加区块",
    "ctx.deleteBlock": "删除区块",
    "modal.renameTitle": "修改区块名称",
    "modal.renamePlaceholder": "输入新区块名",
    "modal.save": "保存",
    "modal.cancel": "取消",
    "modal.confirmDefault": "确定",
    "modal.promptDefaultTitle": "请输入",
    "modal.confirmTitle": "请确认",
    "a11y.clearColumn": "清空区块任务",
    "settings.heading": "Yori Task 主题设置",
    "settings.reset": "恢复默认",
    "settings.panelBg": "插件背景色",
    "settings.panelBgDesc": "插件页面背景的颜色",
    "settings.accent": "标题文字",
    "settings.accentDesc": "导航和区块标题的文字颜色",
    "settings.taskText": "任务文字",
    "settings.taskTextDesc": "任务文字的颜色",
    "settings.cardBg": "任务背景色",
    "settings.cardBgDesc": "任务条的背景颜色",
    "settings.linkOpen": "链接打开方式",
    "settings.linkOpenDesc": "任务关联笔记的打开行为",
    "settings.linkSmart": "智能复用（已打开则跳转，否则新开）",
    "settings.linkNew": "总是新开标签页",
    "settings.linkReplace": "在当前标签页打开",
    "settings.donate": "打赏支持",
    "settings.donateDesc": "如果这个插件对你有帮助，欢迎请作者喝杯咖啡。",
    "settings.donateBtn": "微信/支付宝打赏",
    "settings.donateFloatLabel": "打赏",
    "tips.title": "提示：",
    "tips.shiftEnter": "在输入任务时，Shift+回车可换行",
    "tips.dragNote": "支持将笔记直接拖入任务区块中",
    "tips.desktopOnly": "本插件暂不支持移动端"
  },
  en: {
    "ribbon.open": "Open Yori Task",
    "command.open": "Open Yori Task",
    "view.tabTask": "TASK",
    "view.tabWeek": "WEEK PLAN",
    "view.tabYear": "YEAR PLAN",
    "view.yearPlanSuffix": "YEAR PLAN",
    "week.in2": "In 2 weeks",
    "week.next": "Next week",
    "week.this": "This week",
    "week.prev": "Last week",
    "week.ago2": "2 weeks ago",
    "top.archiveWeek": "Archive this week",
    "top.archiveYear": "Archive this year",
    "notice.linkMissing": "That linked file was deleted or is missing.",
    "notice.archiveCreated": "Created archive note: {path}",
    "notice.columnCleared": "Cleared: {title}",
    "notice.columnEmpty": "{title} has no tasks.",
    "notice.taskAdded": "Added task: {name}",
    "notice.pasteUnavailable": "Nothing to paste, or this block does not support paste.",
    "notice.pasted": "Task pasted.",
    "notice.pasteFailed": "Paste failed.",
    "notice.doneManualBlocked": "The DONE column cannot receive new tasks here.",
    "notice.taskDeleted": "Task deleted.",
    "notice.taskCopied": "Task copied.",
    "archive.week.title": "Confirm archive",
    "archive.week.msg": "Create weekly archive note {name}?",
    "archive.week.confirm": "Create",
    "archive.year.msg": "Create yearly archive note {name}?",
    "archive.md.planLine": "Plan dates: {range}",
    "archive.md.archiveLine": "Archived on: {date}",
    "archive.md.empty": "(empty)",
    "clear.title": "Confirm clear",
    "clear.msg": "All tasks in “{title}” will be cleared. This cannot be undone.",
    "clear.confirm": "Clear",
    "delete.title": "Confirm delete",
    "delete.msg": "The task “{title}” will be deleted. This cannot be undone.",
    "delete.confirm": "Delete",
    "task.unnamed": "Untitled",
    "ctx.deleteTask": "Delete task",
    "ctx.copyTask": "Copy task",
    "ctx.restoreIncomplete": "Restore as not done",
    "ctx.pasteHere": "Paste task into this block",
    "ctx.renameBlock": "Rename block",
    "ctx.addBlock": "Add block",
    "ctx.deleteBlock": "Delete block",
    "modal.renameTitle": "Rename block",
    "modal.renamePlaceholder": "New block name",
    "modal.save": "Save",
    "modal.cancel": "Cancel",
    "modal.confirmDefault": "OK",
    "modal.promptDefaultTitle": "Enter text",
    "modal.confirmTitle": "Please confirm",
    "a11y.clearColumn": "Clear tasks in this block",
    "settings.heading": "Yori Task — Appearance",
    "settings.reset": "Reset to default",
    "settings.panelBg": "Panel background",
    "settings.panelBgDesc": "Background color of the plugin panel.",
    "settings.accent": "Title text",
    "settings.accentDesc": "Color for navigation and section titles.",
    "settings.taskText": "Task text",
    "settings.taskTextDesc": "Color for task labels.",
    "settings.cardBg": "Task row background",
    "settings.cardBgDesc": "Background color of task rows.",
    "settings.linkOpen": "Open linked notes",
    "settings.linkOpenDesc": "How linked notes open from tasks.",
    "settings.linkSmart": "Reuse open tab, otherwise new tab",
    "settings.linkNew": "Always open in a new tab",
    "settings.linkReplace": "Open in the current tab",
    "settings.donate": "Support the plugin",
    "settings.donateDesc": "If this plugin helps you, consider buying the author a coffee.",
    "settings.donateBtn": "Donate via WeChat / Alipay",
    "settings.donateFloatLabel": "Donate",
    "tips.title": "Tips",
    "tips.shiftEnter": "When adding a task, Shift+Enter inserts a new line.",
    "tips.dragNote": "Drag a note into a task column to create a linked task.",
    "tips.desktopOnly": "This plugin does not support the mobile app yet."
  }
};

function yoriLang() {
  let loc = "";
  try {
    if (moment && typeof moment.locale === "function") loc = moment.locale() || "";
  } catch (_e) {
    /* ignore */
  }
  loc = (loc || "").toLowerCase().replace(/_/g, "-");
  if (loc.startsWith("zh")) return "zh";
  if (typeof document !== "undefined") {
    const h = (document.documentElement.getAttribute("lang") || "").toLowerCase().replace(/_/g, "-");
    if (h.startsWith("zh")) return "zh";
  }
  return "en";
}

function t(key, vars) {
  const lang = yoriLang();
  const bag = I18N[lang] || I18N.zh;
  let s = bag[key];
  if (s == null) s = I18N.zh[key];
  if (s == null) s = key;
  if (vars && typeof vars === "object") {
    Object.keys(vars).forEach((k) => {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(vars[k]));
    });
  }
  return s;
}

/** 标签页 / 顶栏等：Obsidian setIcon 体系使用的自定义图标 id（与 Ribbon DOM 挂载独立） */
const YORI_TAB_ICON_ID = "yori-task-logo";
/** 与插件目录 Yori.svg 同步内嵌：避免 fs 路径异常时仍显示错误占位图 */
const YORI_EMBEDDED_SVG = `<svg width="337" height="275" viewBox="0 0 337 275" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M126.896 132.096C122.775 132.196 118.991 138.176 118.985 146.288C118.978 153.985 123.69 156.783 126.896 156.932C131.055 156.868 134.385 153.028 134.278 145.781C134.162 137.842 131.332 131.986 126.896 132.096Z" fill="black"/>
<path d="M202.896 132.096C198.775 132.196 194.991 138.176 194.985 146.288C194.978 153.985 199.69 156.783 202.896 156.932C207.055 156.868 210.385 153.028 210.278 145.781C210.162 137.842 207.332 131.986 202.896 132.096Z" fill="black"/>
<path d="M84.8422 114.781C50.2368 156.698 55.4061 180.849 55.3422 184.281C55.2782 187.713 59.7329 209.59 65.8593 218.781M248.842 114.781C270.596 133.738 285.406 171.349 283.842 188.781C282.278 206.213 277.779 211.036 274.071 218.781M65.8593 218.781C72.001 227.996 75.4062 233.349 84.8422 240.781C94.2782 248.213 120.842 268.808 173.842 268.781C214.75 268.761 246.278 247.713 254.842 240.781C263.406 233.849 270.164 226.941 274.071 218.781M65.8593 218.781C55.8509 232.761 51.2782 240.781 33.8422 240.781C16.4062 240.781 10.2782 229.213 6.84221 211.781C3.40619 194.349 10.827 171.016 22.8422 145.781C35.9948 118.618 45.9002 103.561 73.8422 76.7813C93.7339 57.6275 131.151 42.6412 137.342 43.2812C137.342 43.2812 142.023 35.2133 134.278 26.2133C126.534 17.2133 118.888 19.1666 110.342 18.7812C124.516 11.4083 131.635 9.30343 142.023 11.2076C151.063 13.8283 158.767 20.202 162.023 24.2077C165.278 28.2133 166.842 33.7813 166.842 33.7813C169.947 22.5146 169.778 24.2077 173.842 18.7812C177.906 13.3547 189.278 8.21331 198.842 6.78121C208.406 5.34911 214.278 6.21332 220.842 6.7812C227.406 7.34907 239.778 11.2076 239.778 11.2076C222.344 15.0419 213.342 16.2812 204.278 20.7133C195.214 25.1454 193.778 26.2133 188.842 31.7812C183.906 37.3491 191.406 44.8493 197.842 46.7813C204.278 48.7133 238.087 54.7548 266.842 76.7813C295.281 102.997 302.115 117.087 314.842 145.781C323.592 171.926 332.212 188.016 329.842 211.781C327.472 235.546 317.483 239.765 299.842 240.781C290.102 239.558 284.534 236.428 274.071 218.781M128.689 199.999C129.958 206.015 132.5 208.999 136.072 211.192C139.644 213.385 144.554 214.72 151 213.499C157.576 212.124 160.625 207.986 163.588 202.653C166.551 197.32 166.598 193.799 166.598 193.799C166.598 193.799 167.204 203.223 169 205.999C170.796 208.775 171.5 210.499 177.5 213.499C183.5 216.499 192.778 214.088 196.778 211.781C200.778 209.474 202.597 207.53 204.689 199.999M126.896 132.096C122.775 132.196 118.991 138.176 118.985 146.288C118.978 153.985 123.69 156.783 126.896 156.932C131.055 156.868 134.385 153.028 134.278 145.781C134.162 137.842 131.332 131.986 126.896 132.096ZM202.896 132.096C198.775 132.196 194.991 138.176 194.985 146.288C194.978 153.985 199.69 156.783 202.896 156.932C207.055 156.868 210.385 153.028 210.278 145.781C210.162 137.842 207.332 131.986 202.896 132.096Z" fill="none" stroke="black" stroke-width="12"/>
</svg>`;

function normalizeRibbonSvgColors(s) {
  return s.replace(/fill="black"/gi, 'fill="currentColor"').replace(/stroke="black"/gi, 'stroke="currentColor"');
}

/** SVG 默认 fill 为黑色：仅有描边的 path 若不写 fill="none" 会被整块填黑 */
function ensureStrokePathsHaveFillNone(s) {
  return s.replace(/<path\b([^>]+)>/gi, (match, rawAttrs) => {
    let attrs = rawAttrs.trim();
    let selfClose = false;
    if (attrs.endsWith("/")) {
      selfClose = true;
      attrs = attrs.slice(0, -1).trim();
    }
    if (!/\bstroke\s*=/.test(attrs)) return match;
    if (/\bfill\s*=/.test(attrs)) return match;
    const inner = `${attrs} fill="none"`;
    return selfClose ? `<path ${inner} />` : `<path ${inner}>`;
  });
}

function prepareYoriSvgMarkup(s) {
  return ensureStrokePathsHaveFillNone(normalizeRibbonSvgColors((s || "").trim()));
}

/**
 * 将完整 Yori.svg 转为 addIcon 可用的「无 svg 根」片段，并缩放到约 100×100 视口（与官方图标栅格一致）。
 */
function buildYoriIconInnerForAddIcon(fullSvgMarkup) {
  let s = prepareYoriSvgMarkup(fullSvgMarkup || "");
  let vbW = 100;
  let vbH = 100;
  const vbMatch = s.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (vbMatch) {
    const parts = vbMatch[1].trim().split(/[\s,]+/).map(parseFloat);
    if (parts.length >= 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3]) && parts[2] > 0 && parts[3] > 0) {
      vbW = parts[2];
      vbH = parts[3];
    }
  }
  const innerMatch = s.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const inner = innerMatch ? innerMatch[1].trim() : s;
  const scale = Math.min(100 / vbW, 100 / vbH);
  const tx = (100 - vbW * scale) / 2;
  const ty = (100 - vbH * scale) / 2;
  return `<g transform="translate(${tx},${ty}) scale(${scale})">${inner}</g>`;
}

function loadYoriRibbonSvgMarkup(plugin) {
  const dirs = [typeof __dirname === "string" ? __dirname : null, plugin.manifest?.dir, path.join(plugin.app.vault.configDir, "plugins", plugin.manifest.id)].filter(
    Boolean
  );
  for (const d of dirs) {
    const fp = path.join(d, "Yori.svg");
    try {
      if (fs.existsSync(fp)) return fs.readFileSync(fp, "utf8");
    } catch (_err) {
      /* ignore */
    }
  }
  return YORI_EMBEDDED_SVG;
}

/** 不用 addIcon：直接把完整 SVG 挂到 Ribbon 按钮里，避免版本差异导致不渲染 */
function mountYoriRibbonSvg(ribbonBtn, svgMarkup) {
  if (!ribbonBtn || typeof svgMarkup !== "string") return;
  const colored = prepareYoriSvgMarkup(svgMarkup.trim());
  const inject = () => {
    ribbonBtn.querySelectorAll("svg").forEach((n) => n.remove());
    let doc;
    try {
      doc = new DOMParser().parseFromString(colored, "image/svg+xml");
    } catch (_e) {
      return;
    }
    if (doc.querySelector("parsererror")) return;
    const svg = doc.querySelector("svg");
    if (!svg) return;
    const el = document.importNode(svg, true);
    el.classList.add("yori-task-ribbon-svg");
    ribbonBtn.appendChild(el);
  };
  inject();
  window.requestAnimationFrame(inject);
}

function getMondayOfOffset(offset = 0) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = base.getDay(); // 0 Sun ... 6 Sat
  const mondayDelta = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + mondayDelta - offset * 7);
  return monday;
}

function getWeekKeyByOffset(offset = 0) {
  const monday = getMondayOfOffset(offset);
  const y = monday.getFullYear();
  const m = `${monday.getMonth() + 1}`.padStart(2, "0");
  const d = `${monday.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}`;
}
const PALETTE = [
  { name: "yellow", color: "#f1eac9" },
  { name: "green", color: "#e3e8c6" },
  { name: "blue", color: "#d7e6ef" },
  { name: "red", color: "#f6e0d2" },
  { name: "purple", color: "#e8e0f1" },
  { name: "gray", color: "#dfdfdf" }
];

function normalizeHex(color) {
  if (!color || typeof color !== "string") return "";
  let c = color.trim().toLowerCase();
  if (!c.startsWith("#")) return c;
  if (c.length === 4) {
    c = `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
  }
  return c;
}

const DEFAULT_SETTINGS = {
  accentColor: "#998052",
  addHintColor: "#cbc0af",
  cardBgColor: "#f6f1eb",
  panelBgColor: "#f8f7f6",
  noteOpenMode: "smart",
  taskTextColor: "#806531",
  data: {
    boardColumns: DEFAULT_BOARD_COLUMNS,
    events: []
  }
};

class YoriTaskPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.clipboardEvent = null;
    this.activeWeekKey = getWeekKeyByOffset(0);
    const yoriSvgMarkup = loadYoriRibbonSvgMarkup(this);
    try {
      addIcon(YORI_TAB_ICON_ID, buildYoriIconInnerForAddIcon(yoriSvgMarkup));
    } catch (_err) {
      /* 忽略：极旧环境 */
    }
    this.registerView(VIEW_TYPE, (leaf) => new YoriTaskView(leaf, this));
    const ribbonBtn = this.addRibbonIcon("calendar-clock", t("ribbon.open"), () => this.activateView());
    if (ribbonBtn && ribbonBtn.classList) ribbonBtn.classList.add("yori-task-ribbon");
    mountYoriRibbonSvg(ribbonBtn, yoriSvgMarkup);
    this.addCommand({
      id: "open-yori-task",
      name: t("command.open"),
      callback: () => this.activateView()
    });

    this.addSettingTab(new YoriTaskSettingsTab(this.app, this));

    // 归档笔记内：统一链接打开策略；失效链接给出提示，不进入默认“创建/跳转”流程
    let lastMissingLinkNoticeAt = 0;
    const handleArchiveLink = async (evt) => {
      const target = evt.target;
      if (!(target instanceof HTMLElement)) return;
      const linkEl = target.closest(".yori-archive-note .internal-link, .yori-archive-note .cm-hmd-internal-link");
      if (!(linkEl instanceof HTMLElement)) return;

      const activePath = this.app.workspace.getActiveFile()?.path || "";
      let raw = (linkEl.getAttribute("data-href") || linkEl.getAttribute("href") || "").replace(/^#/, "").trim();
      if (!raw) {
        const txt = (linkEl.textContent || "").trim();
        raw = txt.replace(/^\[\[|\]\]$/g, "");
      }
      const isUnresolved = linkEl.classList.contains("is-unresolved");
      const resolved = raw ? this.app.metadataCache.getFirstLinkpathDest(raw, activePath) : null;
      const missing = isUnresolved || (raw && !(resolved instanceof TFile));
      evt.preventDefault();
      evt.stopPropagation();
      if (typeof evt.stopImmediatePropagation === "function") evt.stopImmediatePropagation();
      if (missing) {
        const nowTs = Date.now();
        if (nowTs - lastMissingLinkNoticeAt > 250) {
          new Notice(t("notice.linkMissing"));
          lastMissingLinkNoticeAt = nowTs;
        }
        return;
      }
      if (!(resolved instanceof TFile)) return;
      await this.openLinkedNoteByMode(resolved);
    };
    document.addEventListener("click", handleArchiveLink, true);
    this.register(() => {
      document.removeEventListener("click", handleArchiveLink, true);
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.data || !Array.isArray(this.settings.data.events)) {
      this.settings.data = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.data));
    }
    if (!Array.isArray(this.settings.data.boardColumns) || this.settings.data.boardColumns.length === 0) {
      this.settings.data.boardColumns = JSON.parse(JSON.stringify(DEFAULT_BOARD_COLUMNS));
    }
    this.ensureDefaultColumns();
    this.migrateEventScopes();
    this.migrateWeekKeysToLastWeek();
  }

  migrateEventScopes() {
    for (const e of this.settings.data.events) {
      if (!e.scope) e.scope = SCOPE_BOARD;
    }
  }

  // 兼容旧数据：之前没有 weekKey 的周任务，统一归到「上周」
  migrateWeekKeysToLastWeek() {
    const lastWeekKey = getWeekKeyByOffset(1);
    for (const e of this.settings.data.events) {
      if ((e.scope || SCOPE_BOARD) === SCOPE_WEEK && !e.weekKey) {
        e.weekKey = lastWeekKey;
      }
    }
  }

  ensureDefaultColumns() {
    const current = this.settings.data.boardColumns || [];
    const extraColumns = current.filter((col) => !DEFAULT_BOARD_COLUMNS.some((d) => d.id === col.id));
    const normalized = DEFAULT_BOARD_COLUMNS.map((def) => {
      const existing = current.find((c) => c.id === def.id);
      return { ...(existing || def), id: def.id, title: def.title, order: def.order };
    });
    this.settings.data.boardColumns = [...normalized, ...extraColumns.map((c, i) => ({ ...c, order: normalized.length + i }))];
    this.normalizeBoardColumnOrders();
  }

  /** 非 DONE 列按 order 排序；RECENT 30 DONE（done30）永远排在最后并修正 order。 */
  normalizeBoardColumnOrders() {
    if (!this.settings?.data?.boardColumns) return;
    const cols = [...this.settings.data.boardColumns];
    const rest = cols.filter((c) => c.id !== DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
    const doneList = cols.filter((c) => c.id === DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
    rest.forEach((c, i) => {
      c.order = i;
    });
    doneList.forEach((c, i) => {
      c.order = rest.length + i;
    });
    this.settings.data.boardColumns = [...rest, ...doneList];
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  applyCardBgColorToEvents(previousColor, nextColor) {
    const prev = normalizeHex(previousColor || "");
    const next = nextColor || DEFAULT_SETTINGS.cardBgColor;
    this.settings.data.events.forEach((e) => {
      if ((e.scope || SCOPE_BOARD) === SCOPE_BOARD && e.columnId === DONE_COLUMN_ID) return;
      e.style = e.style || {};
      const cur = normalizeHex(e.style.bgColor || "");
      if (!cur || cur === prev) {
        e.style.bgColor = next;
      }
    });
  }

  refreshOpenView() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view && typeof leaf.view.render === "function") leaf.view.render();
    });
  }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    this.app.workspace.revealLeaf(leaf);
  }

  findOpenLeafByFile(file) {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const opened = leaf?.view?.file;
      if (opened instanceof TFile && opened.path === file.path) return leaf;
    }
    return null;
  }

  async openLinkedNoteByMode(file) {
    const mode = this.settings.noteOpenMode || "smart";
    if (mode === "replace-current") {
      const leaf = this.app.workspace.getMostRecentLeaf() || this.app.workspace.getLeaf(false);
      await leaf.openFile(file);
      this.app.workspace.revealLeaf(leaf);
      return;
    }
    if (mode === "new-tab") {
      const leaf = this.app.workspace.getLeaf(true);
      await leaf.openFile(file);
      this.app.workspace.revealLeaf(leaf);
      return;
    }
    const existedLeaf = this.findOpenLeafByFile(file);
    if (existedLeaf) {
      this.app.workspace.revealLeaf(existedLeaf);
      return;
    }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
    this.app.workspace.revealLeaf(leaf);
  }

  listColumns() {
    const cols = [...this.settings.data.boardColumns];
    const rest = cols.filter((c) => c.id !== DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
    const doneList = cols.filter((c) => c.id === DONE_COLUMN_ID).sort((a, b) => a.order - b.order);
    return [...rest, ...doneList];
  }

  getColumn(columnId) {
    return this.settings.data.boardColumns.find((c) => c.id === columnId);
  }

  getEvents(scope, columnId) {
    const sc = scope || SCOPE_BOARD;
    if (sc === SCOPE_BOARD) {
      const isDoneColumn = columnId === DONE_COLUMN_ID;
      return this.settings.data.events
        .filter((e) => (e.scope || SCOPE_BOARD) === SCOPE_BOARD && e.columnId === columnId && !!e.completed === isDoneColumn)
        .sort((a, b) => a.order - b.order);
    }
    if (sc === SCOPE_WEEK) {
      const wk = this.activeWeekKey || getWeekKeyByOffset(0);
      return this.settings.data.events
        .filter(
          (e) =>
            (e.scope || SCOPE_BOARD) === SCOPE_WEEK &&
            e.columnId === columnId &&
            ((e.weekKey && e.weekKey === wk) || (!e.weekKey && wk === getWeekKeyByOffset(0)))
        )
        .sort((a, b) => a.order - b.order);
    }
    return this.settings.data.events
      .filter((e) => (e.scope || SCOPE_BOARD) === sc && e.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }

  createEvent(scope, columnId, title) {
    const sc = scope || SCOPE_BOARD;
    if (sc === SCOPE_BOARD && columnId === DONE_COLUMN_ID) return null;
    const nextOrder = this.getEvents(sc, columnId).length;
    const event = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      scope: sc,
      columnId,
      order: nextOrder,
      title,
      completed: false,
      style: { bgColor: this.settings.cardBgColor }
    };
    if (sc === SCOPE_WEEK) {
      event.weekKey = this.activeWeekKey || getWeekKeyByOffset(0);
    }
    this.settings.data.events.push(event);
    return event;
  }

  deleteEvent(eventId) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;
    const originalColumnId = event.columnId;
    const originalScope = event.scope || SCOPE_BOARD;
    this.settings.data.events = this.settings.data.events.filter((e) => e.id !== eventId);
    this.normalizeOrders(originalScope, originalColumnId);
  }

  normalizeOrders(scope, columnId) {
    const sc = scope || SCOPE_BOARD;
    this.getEvents(sc, columnId).forEach((event, index) => {
      event.order = index;
    });
  }

  moveEventTo(eventId, targetScope, targetColumnId, targetOrder = null) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;

    const fromScope = event.scope || SCOPE_BOARD;
    const fromColumnId = event.columnId;
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
          event.style.bgColor = this.settings.cardBgColor;
        }
      }
    }
    event.columnId = targetColumnId;
    event.scope = targetScope;

    const targetEvents = this.getEvents(targetScope, targetColumnId).filter((e) => e.id !== eventId);
    const insertAt = targetOrder == null ? targetEvents.length : Math.max(0, Math.min(targetOrder, targetEvents.length));
    targetEvents.splice(insertAt, 0, event);
    targetEvents.forEach((item, i) => {
      item.order = i;
    });

    if (fromColumnId !== targetColumnId || fromScope !== targetScope) {
      this.normalizeOrders(fromScope, fromColumnId);
    }

    if (targetScope === SCOPE_BOARD && targetColumnId === DONE_COLUMN_ID) {
      const doneEvents = this.getEvents(SCOPE_BOARD, DONE_COLUMN_ID);
      while (doneEvents.length > MAX_DONE_EVENTS) {
        const removed = doneEvents.shift();
        this.settings.data.events = this.settings.data.events.filter((e) => e.id !== removed.id);
      }
      this.normalizeOrders(SCOPE_BOARD, DONE_COLUMN_ID);
    }
  }

  setEventDone(eventId, done) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;
    if ((event.scope || SCOPE_BOARD) !== SCOPE_BOARD) return;
    if (done) {
      this.moveEventTo(eventId, SCOPE_BOARD, DONE_COLUMN_ID, null);
      return;
    }
    if (event.columnId === DONE_COLUMN_ID) {
      let targetColumnId = event.previousColumnId || "today";
      if (!this.getColumn(targetColumnId) || targetColumnId === DONE_COLUMN_ID) {
        targetColumnId = "today";
      }
      this.moveEventTo(eventId, SCOPE_BOARD, targetColumnId, null);
      return;
    }
    event.completed = false;
  }

  setEventColor(eventId, color) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;
    if ((event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID) return;
    event.style = event.style || {};
    event.style.bgColor = color;
  }

  clearEventHighlight(eventId) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;
    if ((event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID) return;
    event.style = event.style || {};
    event.style.bgColor = this.settings.cardBgColor;
  }

  copyEvent(eventId) {
    const event = this.settings.data.events.find((e) => e.id === eventId);
    if (!event) return;
    const style =
      (event.scope || SCOPE_BOARD) === SCOPE_BOARD && event.columnId === DONE_COLUMN_ID
        ? { bgColor: this.settings.cardBgColor }
        : { ...(event.style || {}) };
    this.clipboardEvent = {
      title: (typeof event.title === "string" ? event.title : "").trim() || t("task.unnamed"),
      style,
      notePath: event.notePath || ""
    };
  }

  pasteEvent(scope, columnId) {
    const sc = scope || SCOPE_BOARD;
    if (!this.clipboardEvent || (sc === SCOPE_BOARD && columnId === DONE_COLUMN_ID)) return null;
    const title = (typeof this.clipboardEvent.title === "string" ? this.clipboardEvent.title : "").trim() || t("task.unnamed");
    const event = this.createEvent(sc, columnId, title);
    if (!event) return null;
    event.style = { ...(this.clipboardEvent.style || {}) };
    event.completed = false;
    if (this.clipboardEvent.notePath) {
      event.notePath = this.clipboardEvent.notePath;
    } else {
      delete event.notePath;
    }
    return event;
  }
}

/** 使用 Obsidian 弹窗代替 window.confirm，避免 Electron 原生对话框破坏视图焦点。 */
class YoriConfirmModal extends Modal {
  constructor(app, options) {
    super(app);
    this.title = options.title || t("modal.confirmTitle");
    this.message = options.message || "";
    this.confirmText = options.confirmText || t("modal.confirmDefault");
    this.warning = !!options.warning;
    this.onConfirm = options.onConfirm;
  }

  onOpen() {
    this.titleEl.empty();
    this.titleEl.createSpan({ text: this.title });
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("p", { cls: "yori-delete-confirm-msg", text: this.message });
    new Setting(contentEl)
      .addButton((btn) => btn.setButtonText(t("modal.cancel")).onClick(() => this.close()))
      .addButton((btn) => {
        btn.setButtonText(this.confirmText);
        if (this.warning) btn.setWarning();
        btn.onClick(async () => {
          this.close();
          await this.onConfirm();
        });
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class YoriTextInputModal extends Modal {
  constructor(app, options) {
    super(app);
    this.title = options.title || t("modal.promptDefaultTitle");
    this.placeholder = options.placeholder || "";
    this.initialValue = options.initialValue || "";
    this.confirmText = options.confirmText || t("modal.confirmDefault");
    this.onConfirm = options.onConfirm;
  }

  onOpen() {
    this.titleEl.empty();
    this.titleEl.createSpan({ text: this.title });
    const { contentEl } = this;
    contentEl.empty();
    const input = contentEl.createEl("input", { type: "text", cls: "yori-text-input" });
    input.placeholder = this.placeholder;
    input.value = this.initialValue;
    input.onkeydown = async (evt) => {
      if (evt.key === "Enter") {
        evt.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        this.close();
        await this.onConfirm(value);
      }
    };
    new Setting(contentEl)
      .addButton((btn) => btn.setButtonText(t("modal.cancel")).onClick(() => this.close()))
      .addButton((btn) =>
        btn.setButtonText(this.confirmText).setCta().onClick(async () => {
          const value = input.value.trim();
          if (!value) return;
          this.close();
          await this.onConfirm(value);
        })
      );
    window.requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class YoriTaskView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.tab = "task";
    this.weekOffset = 0;
    this.contextMenuEl = null;
    this.nativeMenu = null;
    this._addOutsideHandler = null;
    this._closeCurrentAdd = null;
    this._menuOutsideHandler = null;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "Yori Task";
  }

  getIcon() {
    return YORI_TAB_ICON_ID;
  }

  applyLayoutShell() {
    this.containerEl.style.height = "100%";
    this.containerEl.style.maxHeight = "100%";
    this.containerEl.style.overflow = "hidden";
    this.containerEl.style.display = "flex";
    this.containerEl.style.flexDirection = "column";
    const header = this.containerEl.children[0];
    if (header) header.style.flexShrink = "0";
    const body = this.containerEl.children[1];
    if (body) {
      body.style.flex = "1";
      body.style.minHeight = "0";
      body.style.overflow = "hidden";
      body.style.display = "flex";
      body.style.flexDirection = "column";
    }
  }

  async onOpen() {
    this.applyLayoutShell();
    this.render();
  }

  _detachAddOutsideHandler() {
    if (!this._addOutsideHandler) return;
    document.removeEventListener("mousedown", this._addOutsideHandler, true);
    document.removeEventListener("touchstart", this._addOutsideHandler, true);
    this._addOutsideHandler = null;
  }

  _attachAddOutsideHandler(handler) {
    this._detachAddOutsideHandler();
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, { capture: true, passive: true });
    this._addOutsideHandler = handler;
  }

  async onClose() {
    this._detachAddOutsideHandler();
    if (this._menuOutsideHandler) {
      document.removeEventListener("mousedown", this._menuOutsideHandler, true);
      this._menuOutsideHandler = null;
    }
    this._closeCurrentAdd = null;
    this.closeContextMenu();
  }

  render() {
    this.applyLayoutShell();
    this._detachAddOutsideHandler();
    if (this._menuOutsideHandler) {
      document.removeEventListener("mousedown", this._menuOutsideHandler, true);
      this._menuOutsideHandler = null;
    }
    this._closeCurrentAdd = null;
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("lp-root");
    container.style.setProperty("--lp-accent", this.plugin.settings.accentColor);
    container.style.setProperty("--lp-card-bg", this.plugin.settings.cardBgColor);
    container.style.setProperty("--lp-add-hint", this.plugin.settings.addHintColor);
    container.style.setProperty("--lp-panel-bg", this.plugin.settings.panelBgColor || DEFAULT_SETTINGS.panelBgColor);
    container.style.setProperty("--lp-task-text", this.plugin.settings.taskTextColor || DEFAULT_SETTINGS.taskTextColor);

    const tabs = container.createDiv({ cls: "lp-tabs" });
    this.createTab(tabs, "task", t("view.tabTask"));
    this.createTab(tabs, "week", t("view.tabWeek"));
    this.createTab(tabs, "year", t("view.tabYear"));

    container.onclick = (evt) => {
      if (evt?.target && typeof evt.target.closest === "function" && evt.target.closest(".lp-add-area")) return;
      this.closeContextMenu();
    };

    if (this.tab === "task") {
      const board = container.createDiv({ cls: "lp-board-grid lp-board-grid--task" });
      this.plugin.listColumns().forEach((column) => {
        this.renderColumn(board, column, SCOPE_BOARD);
      });
      return;
    }

    if (this.tab === "week") {
      this.renderWeekTopbar(container);
      const board = container.createDiv({ cls: "lp-board-grid lp-board-grid--week" });
      WEEK_COLUMNS.forEach((column) => {
        this.renderColumn(board, column, SCOPE_WEEK);
      });
      return;
    }

    if (this.tab === "year") {
      this.renderYearTopbar(container);
      const board = container.createDiv({ cls: "lp-board-grid lp-board-grid--year" });
      YEAR_COLUMNS.forEach((column) => {
        this.renderColumn(board, column, SCOPE_YEAR);
      });
    }
  }

  formatMD(d) {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  formatMMDD(d) {
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${m}${day}`;
  }

  getWeekRange(offset = 0) {
    const monday = getMondayOfOffset(offset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  }

  renderWeekTopbar(container) {
    this.plugin.activeWeekKey = getWeekKeyByOffset(this.weekOffset);
    const top = container.createDiv({ cls: "lp-view-topbar" });
    const { monday, sunday } = this.getWeekRange(this.weekOffset);
    top.createDiv({ cls: "lp-view-range", text: `${this.formatMD(monday)} - ${this.formatMD(sunday)}` });

    const controls = top.createDiv({ cls: "lp-week-controls" });
    const weekOffsets = [-2, -1, 0, 1, 2];
    weekOffsets.forEach((i) => {
      const btn = controls.createDiv({
        cls: `lp-week-chip ${this.weekOffset === i ? "is-active" : ""}`,
        text:
          i === -2
            ? t("week.in2")
            : i === -1
              ? t("week.next")
              : i === 0
                ? t("week.this")
                : i === 1
                  ? t("week.prev")
                  : t("week.ago2")
      });
      btn.onclick = () => {
        this.weekOffset = i;
        this.plugin.activeWeekKey = getWeekKeyByOffset(i);
        this.render();
      };
    });

    const archiveBtn = top.createDiv({ cls: "lp-archive-btn", text: t("top.archiveWeek") });
    archiveBtn.onclick = () => this.confirmAndArchiveWeek();
  }

  renderYearTopbar(container) {
    const top = container.createDiv({ cls: "lp-view-topbar" });
    const now = new Date();
    top.createDiv({ cls: "lp-view-range", text: `${now.getFullYear()} ${t("view.yearPlanSuffix")}` });
    const archiveBtn = top.createDiv({ cls: "lp-archive-btn", text: t("top.archiveYear") });
    archiveBtn.onclick = () => this.confirmAndArchiveYear();
  }

  async createArchiveNote(baseName, content) {
    const folder = "";
    let target = `${baseName}.md`;
    let n = 1;
    while (this.app.vault.getAbstractFileByPath(target)) {
      target = `${baseName}-${n}.md`;
      n += 1;
    }
    await this.app.vault.create(target, content);
    new Notice(t("notice.archiveCreated", { path: target }));
  }

  buildWeekArchiveContent() {
    const { monday, sunday } = this.getWeekRange(this.weekOffset);
    const now = new Date();
    const lines = [
      "---",
      "cssclasses: yori-archive-note",
      "---",
      "",
      `# WeekPlan-${this.formatMMDD(monday)}-${this.formatMMDD(sunday)}`,
      "",
      `- ${t("archive.md.planLine", { range: `${this.formatMD(monday)} - ${this.formatMD(sunday)}` })}`,
      `- ${t("archive.md.archiveLine", { date: this.formatMD(now) })}`,
      ""
    ];
    WEEK_COLUMNS.forEach((col) => {
      lines.push(`## ${col.title}`);
      const list = this.plugin.getEvents(SCOPE_WEEK, col.id);
      if (!list.length) {
        lines.push(`- ${t("archive.md.empty")}`);
      } else {
        list.forEach((e) => lines.push(`- ${this.formatArchiveTaskText(e)}`));
      }
      lines.push("");
    });
    return lines.join("\n");
  }

  buildYearArchiveContent() {
    const now = new Date();
    const lines = [
      "---",
      "cssclasses: yori-archive-note",
      "---",
      "",
      `# YearPlan-${this.formatMMDD(now)}`,
      "",
      `- ${t("archive.md.archiveLine", { date: this.formatMD(now) })}`,
      ""
    ];
    YEAR_COLUMNS.forEach((col) => {
      lines.push(`## ${col.title}`);
      const list = this.plugin.getEvents(SCOPE_YEAR, col.id);
      if (!list.length) {
        lines.push(`- ${t("archive.md.empty")}`);
      } else {
        list.forEach((e) => lines.push(`- ${this.formatArchiveTaskText(e)}`));
      }
      lines.push("");
    });
    return lines.join("\n");
  }

  formatArchiveTaskText(event) {
    const title = (event?.title || "").trim() || t("task.unnamed");
    const path = (event?.notePath || "").trim();
    if (!path) return title;
    const safeTitle = title.replace(/\|/g, " ");
    return `[[${path}|${safeTitle}]]`;
  }

  confirmAndArchiveWeek() {
    this.plugin.activeWeekKey = getWeekKeyByOffset(this.weekOffset);
    const { monday, sunday } = this.getWeekRange(this.weekOffset);
    const name = `WeekPlan-${this.formatMMDD(monday)}-${this.formatMMDD(sunday)}`;
    const modal = new YoriConfirmModal(this.app, {
      title: t("archive.week.title"),
      message: t("archive.week.msg", { name }),
      confirmText: t("archive.week.confirm"),
      onConfirm: async () => {
        await this.createArchiveNote(name, this.buildWeekArchiveContent());
      }
    });
    modal.open();
  }

  confirmAndArchiveYear() {
    const now = new Date();
    const name = `YearPlan-${this.formatMMDD(now)}`;
    const modal = new YoriConfirmModal(this.app, {
      title: t("archive.week.title"),
      message: t("archive.year.msg", { name }),
      confirmText: t("archive.week.confirm"),
      onConfirm: async () => {
        await this.createArchiveNote(name, this.buildYearArchiveContent());
      }
    });
    modal.open();
  }

  resolveDroppedNoteFile(evt) {
    const dt = evt.dataTransfer;
    if (!dt) return null;
    const candidates = [];
    const pushRaw = (v) => {
      if (!v || typeof v !== "string") return;
      const first = v.split(/\r?\n/).map((s) => s.trim()).find(Boolean);
      if (first) candidates.push(first);
    };
    pushRaw(dt.getData("text/plain"));
    pushRaw(dt.getData("text/uri-list"));
    pushRaw(dt.getData("text/x-obsidian-link"));
    pushRaw(dt.getData("application/x-obsidian-file"));

    const toPathCandidate = (raw) => {
      let s = raw.trim();
      if (!s) return "";
      if (s.startsWith("[[") && s.endsWith("]]")) s = s.slice(2, -2);
      if (s.startsWith("obsidian://")) {
        const m = s.match(/[?&]file=([^&]+)/i);
        if (m && m[1]) s = decodeURIComponent(m[1]);
      }
      if (s.startsWith("file://")) {
        s = decodeURIComponent(s.replace(/^file:\/\//i, ""));
        s = s.replace(/^\/([a-zA-Z]:\/)/, "$1");
      }
      return s;
    };

    for (const raw of candidates) {
      const path = toPathCandidate(raw);
      if (!path) continue;
      const byPath = this.app.vault.getAbstractFileByPath(path);
      if (byPath instanceof TFile && byPath.extension === "md") return byPath;
      const byLink = this.app.metadataCache.getFirstLinkpathDest(path, "");
      if (byLink instanceof TFile && byLink.extension === "md") return byLink;
    }
    return null;
  }

  renderEventDisplay(displayEl, event) {
    displayEl.empty();
    if (event.notePath) {
      const link = displayEl.createEl("a", { cls: "lp-event-link", text: event.title || t("task.unnamed"), href: "#" });
      link.onclick = async (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const file = this.app.vault.getAbstractFileByPath(event.notePath);
        if (!(file instanceof TFile)) {
          new Notice(t("notice.linkMissing"));
          return;
        }
        await this.plugin.openLinkedNoteByMode(file);
      };
      return;
    }
    displayEl.textContent = event.title;
  }

  createTab(parent, id, label) {
    const tab = parent.createDiv({ cls: `lp-tab ${this.tab === id ? "is-active" : ""}`, text: label });
    tab.onclick = () => {
      this.tab = id;
      this.render();
    };
  }

  async confirmAndClearColumn(scope, column) {
    const count = this.plugin.getEvents(scope, column.id).length;
    const modal = new YoriConfirmModal(this.app, {
      title: t("clear.title"),
      message: t("clear.msg", { title: column.title }),
      confirmText: t("clear.confirm"),
      warning: true,
      onConfirm: async () => {
        if (count > 0) {
          const idSet = new Set(this.plugin.getEvents(scope, column.id).map((e) => e.id));
          this.plugin.settings.data.events = this.plugin.settings.data.events.filter((e) => !idSet.has(e.id));
          this.plugin.normalizeOrders(scope, column.id);
          await this.plugin.saveSettings();
          this.render();
          new Notice(t("notice.columnCleared", { title: column.title }));
          return;
        }
        new Notice(t("notice.columnEmpty", { title: column.title }));
      }
    });
    modal.open();
  }

  renderColumn(parent, column, scope) {
    const sc = scope || SCOPE_BOARD;
    const box = parent.createDiv({ cls: "lp-column" });
    box.dataset.columnId = column.id;
    box.dataset.scope = sc;

    const head = box.createDiv({ cls: "lp-column-head" });
    const titleCls =
      sc === SCOPE_BOARD && column.id === DONE_COLUMN_ID ? "lp-column-title lp-column-title--done" : "lp-column-title";
    const title = head.createDiv({ cls: titleCls, text: column.title });
    const openColumnContextMenu = (evt) => {
      evt.preventDefault();
      if (sc === SCOPE_BOARD) {
        this.openColumnMenu(evt, column);
      } else {
        this.openFixedScopeColumnMenu(evt, column, sc);
      }
    };
    title.oncontextmenu = openColumnContextMenu;
    head.oncontextmenu = (evt) => {
      if (evt.target && evt.target.closest && evt.target.closest(".lp-clear-column-btn")) return;
      openColumnContextMenu(evt);
    };
    const clearBtn = head.createEl("button", {
      cls: "lp-clear-column-btn",
      attr: { type: "button", "aria-label": t("a11y.clearColumn"), title: t("a11y.clearColumn") }
    });
    setIcon(clearBtn, "trash-2");
    clearBtn.onclick = (evt) => {
      evt.stopPropagation();
      this.closeContextMenu();
      this.confirmAndClearColumn(sc, column);
    };

    const list = box.createDiv({ cls: "lp-list" });
    list.dataset.scope = sc;
    list.dataset.columnId = column.id;
    const events = this.plugin.getEvents(sc, column.id);

    list.ondragover = (evt) => {
      evt.preventDefault();
      list.addClass("drag-over");
    };
    list.ondragleave = () => list.removeClass("drag-over");
    list.ondrop = async (evt) => {
      evt.preventDefault();
      list.removeClass("drag-over");
      const eventId = evt.dataTransfer ? evt.dataTransfer.getData(EVENT_DRAG_MIME) : "";
      const existing = eventId ? this.plugin.settings.data.events.find((e) => e.id === eventId) : null;
      if (existing) {
        const targetOrder = this.getDropIndex(list, evt.clientY);
        this.plugin.moveEventTo(eventId, sc, column.id, targetOrder);
        await this.plugin.saveSettings();
        this.render();
        return;
      }
      const noteFile = this.resolveDroppedNoteFile(evt);
      if (!noteFile) return;
      const created = this.plugin.createEvent(sc, column.id, noteFile.basename);
      if (!created) return;
      created.notePath = noteFile.path;
      await this.plugin.saveSettings();
      new Notice(t("notice.taskAdded", { name: noteFile.basename }));
      this.render();
    };
    list.oncontextmenu = async (evt) => {
      if (evt.target !== list) return;
      if (!this.plugin.clipboardEvent) return;
      if (sc === SCOPE_BOARD && column.id === DONE_COLUMN_ID) return;
      evt.preventDefault();
      const menu = new Menu();
      menu.addItem((item) =>
        item.setTitle(t("ctx.pasteHere")).onClick(async () => {
          const pasted = this.plugin.pasteEvent(sc, column.id);
          if (!pasted) {
            new Notice(t("notice.pasteUnavailable"));
            return;
          }
          new Notice(t("notice.pasted"));
          await this.plugin.saveSettings();
          this.render();
        })
      );
      this.registerNativeMenu(menu);
      menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
    };

    events.forEach((event) => this.renderEventCard(list, event, column.id, sc));

    if (sc !== SCOPE_BOARD || column.id !== DONE_COLUMN_ID) {
      const addArea = box.createDiv({ cls: "lp-add-area lp-add-area--bottom" });
      const addTrigger = addArea.createDiv({ cls: "lp-add-trigger", text: "+ Add" });
      const addInput = addArea.createEl("textarea", {
        cls: "lp-add-input lp-add-input--expand is-hidden",
        attr: { rows: 2, spellcheck: "false", autocomplete: "off", enterkeyhint: "done" }
      });
      const resizeAdd = () => {
        addInput.style.height = "auto";
        const cs = window.getComputedStyle(addInput);
        const maxPx = parseFloat(cs.maxHeight);
        const cap = Number.isFinite(maxPx) && maxPx > 0 ? maxPx : 220;
        const next = Math.max(48, Math.min(addInput.scrollHeight, cap));
        addInput.style.height = `${next}px`;
      };
      const closeInput = () => {
        this._detachAddOutsideHandler();
        if (this._closeCurrentAdd === closeInput) this._closeCurrentAdd = null;
        addInput.value = "";
        resizeAdd();
        addInput.addClass("is-hidden");
        addTrigger.removeClass("is-hidden");
      };
      const openInput = () => {
        if (this._closeCurrentAdd) this._closeCurrentAdd();
        this._detachAddOutsideHandler();
        addTrigger.addClass("is-hidden");
        addInput.removeClass("is-hidden");
        addInput.value = "";
        addInput.removeAttribute("placeholder");
        resizeAdd();
        this._closeCurrentAdd = closeInput;
        const onDocDown = (e) => {
          if (addInput.classList.contains("is-hidden")) return;
          if (addArea.contains(e.target)) return;
          if (addInput.value.trim() !== "") return;
          closeInput();
        };
        this._attachAddOutsideHandler(onDocDown);
        window.requestAnimationFrame(() => {
          addInput.focus({ preventScroll: true });
        });
      };
      addTrigger.onclick = (e) => {
        e.stopPropagation();
        openInput();
      };
      addTrigger.onmousedown = (e) => e.stopPropagation();
      addInput.onmousedown = (e) => e.stopPropagation();
      addInput.onclick = (e) => e.stopPropagation();
      addInput.oninput = () => resizeAdd();
      const isEnterKey = (evt) =>
        evt.key === "Enter" ||
        evt.code === "Enter" ||
        evt.code === "NumpadEnter" ||
        evt.keyCode === 13 ||
        evt.which === 13;
      const tryCommitAddInput = async () => {
        if (addInput.dataset.lpCommitting === "1") return;
        addInput.dataset.lpCommitting = "1";
        const value = addInput.value.replace(/\u200b/g, "").trim();
        if (!value) {
          delete addInput.dataset.lpCommitting;
          return;
        }
        try {
          const created = this.plugin.createEvent(sc, column.id, value);
          if (!created) {
            new Notice(t("notice.doneManualBlocked"));
            delete addInput.dataset.lpCommitting;
            return;
          }
          await this.plugin.saveSettings();
          this.render();
        } catch (err) {
          delete addInput.dataset.lpCommitting;
          throw err;
        }
      };
      addInput.addEventListener("beforeinput", (evt) => {
        if (evt.inputType !== "insertLineBreak") return;
        if (evt.getModifierState && evt.getModifierState("Shift")) return;
        evt.preventDefault();
        void tryCommitAddInput();
      });
      addInput.onkeydown = (evt) => {
        evt.stopPropagation();
        if (evt.key === "Escape") {
          closeInput();
          return;
        }
        if (isEnterKey(evt) && evt.shiftKey) return;
        if (isEnterKey(evt)) {
          evt.preventDefault();
          void tryCommitAddInput();
        }
      };
    }
  }

  renderEventCard(parent, event, currentColumnId, scope) {
    const sc = scope || SCOPE_BOARD;
    const isDoneColumn = sc === SCOPE_BOARD && currentColumnId === DONE_COLUMN_ID;
    const card = parent.createDiv({ cls: "lp-card" });
    card.draggable = true;
    card.dataset.eventId = event.id;
    card.style.backgroundColor = isDoneColumn ? DONE_CARD_BG : event.style?.bgColor || this.plugin.settings.cardBgColor;

    card.ondragstart = (evt) => {
      if (evt.dataTransfer) {
        evt.dataTransfer.setData(EVENT_DRAG_MIME, event.id);
        evt.dataTransfer.effectAllowed = "move";
      }
    };

    card.oncontextmenu = (evt) => {
      evt.preventDefault();
      this.openEventMenu(evt, event, currentColumnId, sc);
    };

    const row = card.createDiv({ cls: `lp-card-row ${isDoneColumn ? "lp-card-row--done" : ""}` });
    if (sc === SCOPE_BOARD && !isDoneColumn) {
      const checkbox = row.createEl("input", { type: "checkbox", cls: "lp-check" });
      checkbox.checked = !!event.completed;
      checkbox.onclick = (e) => e.stopPropagation();
      checkbox.onmousedown = (e) => e.stopPropagation();
      checkbox.onchange = async () => {
        this.plugin.setEventDone(event.id, checkbox.checked);
        await this.plugin.saveSettings();
        this.render();
      };
    }

    const bodyWrap = row.createDiv({ cls: "lp-event-body" });
    const displayEl = bodyWrap.createDiv({ cls: "lp-event-display" });
    this.renderEventDisplay(displayEl, event);

    const editWrap = bodyWrap.createDiv({ cls: "lp-event-edit-wrap is-hidden" });
    const editor = editWrap.createEl("textarea", { cls: "lp-event-text" });
    editor.value = event.title;

    const fitEditor = () => {
      editor.style.height = "auto";
      editor.style.height = `${Math.max(42, editor.scrollHeight)}px`;
    };

    const enterEdit = (e) => {
      if (e) e.stopPropagation();
      this.closeContextMenu();
      displayEl.addClass("is-hidden");
      editWrap.removeClass("is-hidden");
      editor.value = event.title;
      fitEditor();
      editor.focus();
    };

    const exitEditWithoutSave = () => {
      editor.value = event.title;
      this.renderEventDisplay(displayEl, event);
      editWrap.addClass("is-hidden");
      displayEl.removeClass("is-hidden");
    };

    const commitEdit = async () => {
      if (editWrap.classList.contains("is-hidden")) return;
      event.title = editor.value.trim() || t("task.unnamed");
      this.renderEventDisplay(displayEl, event);
      editWrap.addClass("is-hidden");
      displayEl.removeClass("is-hidden");
      await this.plugin.saveSettings();
    };

    displayEl.onclick = (e) => enterEdit(e);

    editor.oninput = () => fitEditor();

    editor.onkeydown = async (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exitEditWithoutSave();
        editor.blur();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await commitEdit();
        editor.blur();
        return;
      }
    };

    editor.onblur = async () => {
      if (editWrap.classList.contains("is-hidden")) return;
      await commitEdit();
    };
  }

  getDropIndex(list, cursorY) {
    const cards = Array.from(list.querySelectorAll(".lp-card"));
    for (let i = 0; i < cards.length; i += 1) {
      const rect = cards[i].getBoundingClientRect();
      if (cursorY < rect.top + rect.height / 2) return i;
    }
    return cards.length;
  }

  openEventMenu(evt, event, currentColumnId, scope) {
    const sc = scope || SCOPE_BOARD;
    this.closeContextMenu();
    const panel = document.createElement("div");
    panel.className = "lp-context-menu";

    const addAction = (label, handler) => {
      const btn = document.createElement("button");
      btn.className = "lp-context-action";
      btn.textContent = label;
      btn.onclick = async () => {
        await handler();
        this.closeContextMenu();
      };
      panel.appendChild(btn);
    };

    const delBtn = document.createElement("button");
    delBtn.className = "lp-context-action";
    delBtn.textContent = t("ctx.deleteTask");
    delBtn.onclick = () => {
      const eventId = event.id;
      const rawTitle = (event.title || "").trim() || t("task.unnamed");
      const shortTitle = rawTitle.length > 10 ? `${rawTitle.slice(0, 10)}...` : rawTitle;
      this.closeContextMenu();
      const modal = new YoriConfirmModal(this.app, {
        title: t("delete.title"),
        message: t("delete.msg", { title: shortTitle }),
        confirmText: t("delete.confirm"),
        warning: true,
        onConfirm: async () => {
          this.plugin.deleteEvent(eventId);
          await this.plugin.saveSettings();
          new Notice(t("notice.taskDeleted"));
          this.render();
        }
      });
      modal.open();
    };
    panel.appendChild(delBtn);

    addAction(t("ctx.copyTask"), async () => {
      this.plugin.copyEvent(event.id);
      new Notice(t("notice.taskCopied"));
    });

    if (sc === SCOPE_BOARD && currentColumnId === DONE_COLUMN_ID) {
      addAction(t("ctx.restoreIncomplete"), async () => {
        this.plugin.setEventDone(event.id, false);
        await this.plugin.saveSettings();
        this.render();
      });
    }

    if (!(sc === SCOPE_BOARD && currentColumnId === DONE_COLUMN_ID)) {
      const swatchWrap = document.createElement("div");
      swatchWrap.className = "lp-context-swatches";
      const currentHex = normalizeHex(event.style?.bgColor);
      PALETTE.forEach((entry) => {
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "lp-swatch";
        swatch.style.backgroundColor = entry.color;
        swatch.title = entry.name;
        if (currentHex === normalizeHex(entry.color)) swatch.classList.add("is-selected");
        swatch.onclick = async () => {
          if (normalizeHex(event.style?.bgColor) === normalizeHex(entry.color)) {
            this.plugin.clearEventHighlight(event.id);
          } else {
            this.plugin.setEventColor(event.id, entry.color);
          }
          await this.plugin.saveSettings();
          this.render();
          this.closeContextMenu();
        };
        swatchWrap.appendChild(swatch);
      });
      panel.appendChild(swatchWrap);

    }

    panel.onmousedown = (e) => e.stopPropagation();
    document.body.appendChild(panel);
    panel.style.left = `${evt.clientX}px`;
    panel.style.top = `${evt.clientY}px`;
    this.contextMenuEl = panel;
    this.installMenuOutsideClose();
  }

  registerNativeMenu(menu) {
    this.closeContextMenu();
    this.nativeMenu = menu;
    if (typeof menu.onHide === "function") {
      menu.onHide(() => {
        if (this.nativeMenu === menu) this.nativeMenu = null;
      });
    }
  }

  installMenuOutsideClose() {
    if (this._menuOutsideHandler) {
      document.removeEventListener("mousedown", this._menuOutsideHandler, true);
    }
    this._menuOutsideHandler = (evt) => {
      if (!this.contextMenuEl) return;
      const target = evt.target;
      if (this.contextMenuEl && this.contextMenuEl.contains(target)) return;
      if (this.containerEl && this.containerEl.contains(target)) return;
      this.closeContextMenu();
    };
    document.addEventListener("mousedown", this._menuOutsideHandler, true);
  }

  openFixedScopeColumnMenu(evt, column, scope) {
    if (!this.plugin.clipboardEvent) return;
    const menu = new Menu();
    menu.addItem((item) =>
      item.setTitle(t("ctx.pasteHere")).onClick(async () => {
        const pasted = this.plugin.pasteEvent(scope, column.id);
        if (!pasted) {
          new Notice(t("notice.pasteFailed"));
          return;
        }
        new Notice(t("notice.pasted"));
        await this.plugin.saveSettings();
        this.render();
      })
    );
    this.registerNativeMenu(menu);
    menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
  }

  openColumnMenu(evt, column) {
    const menu = new Menu();
    if (column.id !== DONE_COLUMN_ID) {
      menu.addItem((item) =>
        item.setTitle(t("ctx.renameBlock")).onClick(async () => {
          const modal = new YoriTextInputModal(this.app, {
            title: t("modal.renameTitle"),
            placeholder: t("modal.renamePlaceholder"),
            initialValue: column.title,
            confirmText: t("modal.save"),
            onConfirm: async (value) => {
              column.title = value || column.title;
              await this.plugin.saveSettings();
              this.render();
            }
          });
          modal.open();
        })
      );
    }

    menu.addItem((item) =>
      item.setTitle(t("ctx.addBlock")).onClick(async () => {
        this.plugin.settings.data.boardColumns.push({
          id: `col_${Date.now()}`,
          title: "NEW BLOCK",
          order: this.plugin.settings.data.boardColumns.length
        });
        this.plugin.normalizeBoardColumnOrders();
        await this.plugin.saveSettings();
        this.render();
      })
    );

    if (this.plugin.clipboardEvent && column.id !== DONE_COLUMN_ID) {
      menu.addItem((item) =>
        item.setTitle(t("ctx.pasteHere")).onClick(async () => {
          const pasted = this.plugin.pasteEvent(SCOPE_BOARD, column.id);
          if (!pasted) {
            new Notice(t("notice.pasteFailed"));
            return;
          }
          new Notice(t("notice.pasted"));
          await this.plugin.saveSettings();
          this.render();
        })
      );
    }

    if (column.id !== DONE_COLUMN_ID) {
      menu.addItem((item) =>
        item.setTitle(t("ctx.deleteBlock")).onClick(async () => {
          this.plugin.settings.data.events = this.plugin.settings.data.events.filter(
            (e) => !((e.scope || SCOPE_BOARD) === SCOPE_BOARD && e.columnId === column.id)
          );
          this.plugin.settings.data.boardColumns = this.plugin.settings.data.boardColumns.filter((c) => c.id !== column.id);
          this.plugin.normalizeBoardColumnOrders();
          await this.plugin.saveSettings();
          this.render();
        })
      );
    }

    this.registerNativeMenu(menu);
    menu.showAtPosition({ x: evt.clientX, y: evt.clientY });
  }

  closeContextMenu() {
    if (this._menuOutsideHandler) {
      document.removeEventListener("mousedown", this._menuOutsideHandler, true);
      this._menuOutsideHandler = null;
    }
    if (this.contextMenuEl && this.contextMenuEl.parentElement) {
      this.contextMenuEl.parentElement.removeChild(this.contextMenuEl);
    }
    this.contextMenuEl = null;
    if (this.nativeMenu) {
      try {
        this.nativeMenu.hide();
      } catch (_err) {
        /* menu may already be detached */
      }
      this.nativeMenu = null;
    }
  }
}

class YoriTaskSettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: t("settings.heading") });
    const donateUrl = "https://yorigo77.github.io/";

    const addColorSetting = (name, desc, key, fallback) => {
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc)
        .addButton((btn) =>
          btn.setClass("yori-reset-btn").setButtonText(t("settings.reset")).onClick(async () => {
            const prev = this.plugin.settings[key] || fallback;
            this.plugin.settings[key] = fallback;
            if (key === "cardBgColor") {
              this.plugin.applyCardBgColorToEvents(prev, fallback);
            }
            await this.plugin.saveSettings();
            this.display();
            this.plugin.refreshOpenView();
          })
        )
        .addText((input) =>
          input.setValue(this.plugin.settings[key] || fallback).onChange(async (value) => {
            const prev = this.plugin.settings[key] || fallback;
            const next = value || fallback;
            this.plugin.settings[key] = next;
            if (key === "cardBgColor") {
              this.plugin.applyCardBgColorToEvents(prev, next);
            }
            await this.plugin.saveSettings();
            this.plugin.refreshOpenView();
          })
        );
    };

    addColorSetting(t("settings.panelBg"), t("settings.panelBgDesc"), "panelBgColor", DEFAULT_SETTINGS.panelBgColor);
    addColorSetting(t("settings.accent"), t("settings.accentDesc"), "accentColor", DEFAULT_SETTINGS.accentColor);
    addColorSetting(t("settings.taskText"), t("settings.taskTextDesc"), "taskTextColor", DEFAULT_SETTINGS.taskTextColor);
    addColorSetting(t("settings.cardBg"), t("settings.cardBgDesc"), "cardBgColor", DEFAULT_SETTINGS.cardBgColor);

    new Setting(containerEl)
      .setName(t("settings.linkOpen"))
      .setDesc(t("settings.linkOpenDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("smart", t("settings.linkSmart"))
          .addOption("new-tab", t("settings.linkNew"))
          .addOption("replace-current", t("settings.linkReplace"))
          .setValue(this.plugin.settings.noteOpenMode || DEFAULT_SETTINGS.noteOpenMode)
          .onChange(async (value) => {
            this.plugin.settings.noteOpenMode = value || DEFAULT_SETTINGS.noteOpenMode;
            await this.plugin.saveSettings();
          })
      );

    const tipsRow = containerEl.createDiv({ cls: "yori-settings-tips-row" });
    const tips = tipsRow.createDiv({ cls: "yori-settings-tips" });
    tips.createEl("div", { text: t("tips.title"), cls: "yori-settings-tips-title" });
    tips.createEl("p", { text: t("tips.shiftEnter") });
    tips.createEl("p", { text: t("tips.dragNote") });
    tips.createEl("p", { text: t("tips.desktopOnly") });

    const donateFloat = tipsRow.createEl("button", {
      cls: "yori-donate-float",
      attr: { type: "button", "aria-label": t("settings.donateBtn") }
    });
    donateFloat.createEl("span", { cls: "yori-donate-float-heart", text: "❤" });
    donateFloat.createEl("span", { cls: "yori-donate-float-label", text: t("settings.donateFloatLabel") });
    donateFloat.addEventListener("click", () => {
      window.open(donateUrl, "_blank", "noopener,noreferrer");
    });
  }
}

module.exports = YoriTaskPlugin;
