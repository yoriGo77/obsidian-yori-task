const I18N = {
  zh: {
    "ribbon.open": "打开 Yori Task",
    "command.open": "打开 Yori Task",
    "view.tabTask": "任务",
    "view.tabWeek": "周计划",
    "view.tabYear": "年计划",
    "view.yearPlanSuffix": "YEAR PLAN",
    "view.yearPlanTitle": "{year} 年计划",
    "week.in2": "2周后",
    "week.next": "下周",
    "week.this": "本周",
    "week.prev": "上周",
    "week.ago2": "2周前",
    "week.backToThis": "回到本周",
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
    "notice.restoredToColumn": "已恢复至 “{title}”",
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
    "ctx.restoreIncomplete": "恢复至未完成",
    "ctx.pasteHere": "粘贴任务到该区块",
    "ctx.renameBlock": "修改区块名",
    "ctx.addBlock": "创建新区块",
    "ctx.deleteBlock": "删除该区块",
    "modal.renameTitle": "修改区块名称",
    "modal.renamePlaceholder": "输入新区块名",
    "modal.save": "保存",
    "modal.cancel": "取消",
    "modal.confirmDefault": "确定",
    "modal.promptDefaultTitle": "请输入",
    "modal.confirmTitle": "请确认",
    "a11y.clearColumn": "清空该区块",
    "a11y.lockColumn": "锁定区块滚动",
    "a11y.unlockColumn": "解除区块滚动锁定",
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
    "settings.linkOpen": "带链接的任务打开方式",
    "settings.linkOpenDesc": "任务关联笔记的打开行为",
    "settings.language": "语言",
    "settings.languageDesc": "插件界面语言",
    "settings.languageZh": "中文",
    "settings.languageEn": "English",
    "settings.linkSmart": "智能（已打开则跳转，否则新开）",
    "settings.linkNew": "总是新开标签页",
    "settings.linkReplace": "在当前标签页打开",
    "settings.donate": "打赏支持",
    "settings.donateDesc": "如果这个插件对你有帮助，欢迎请作者喝杯咖啡。",
    "settings.donateBtn": "微信/支付宝打赏",
    "settings.donateFloatLabel": "打赏",
    "tips.title": "提示：",
    "tips.shiftEnter": "在输入任务时，Shift+回车可换行",
    "tips.dragNote": "支持将笔记直接拖入任务区块中",
    "tips.weekRangeCtx": "周计划中，右键周范围可快速回到本周",
    "tips.desktopOnly": "本插件暂不支持移动端"
  },
  en: {
    "ribbon.open": "Open Yori Task",
    "command.open": "Open Yori Task",
    "view.tabTask": "TASK",
    "view.tabWeek": "WEEK PLAN",
    "view.tabYear": "YEAR PLAN",
    "view.yearPlanSuffix": "YEAR PLAN",
    "view.yearPlanTitle": "{year} YEAR PLAN",
    "week.in2": "In 2 weeks",
    "week.next": "Next week",
    "week.this": "This week",
    "week.prev": "Last week",
    "week.ago2": "2 weeks ago",
    "week.backToThis": "Back to this week",
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
    "notice.restoredToColumn": "Restored to \"{title}\".",
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
    "a11y.lockColumn": "Lock column scroll",
    "a11y.unlockColumn": "Unlock column scroll",
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
    "settings.language": "Language",
    "settings.languageDesc": "Plugin UI language.",
    "settings.languageZh": "Chinese",
    "settings.languageEn": "English",
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
    "tips.weekRangeCtx": "In Week Plan, right-click the week range to jump back to this week.",
    "tips.desktopOnly": "This plugin does not support the mobile app yet."
  }
};

function createTranslator(moment, getLanguageOverride) {
  function yoriLang() {
    let override = "";
    try {
      if (typeof getLanguageOverride === "function") {
        override = (getLanguageOverride() || "").toLowerCase();
      }
    } catch (_e) {
      /* ignore */
    }
    if (override === "zh" || override === "en") return override;
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

  return { t, yoriLang, I18N };
}

module.exports = {
  I18N,
  createTranslator
};
