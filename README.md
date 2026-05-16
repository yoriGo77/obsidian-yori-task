# Yori Task

**Tasks, week planner, and year planner for Obsidian (desktop-only).**

**Language:** English (required for the Obsidian catalog) • [简体中文说明见下方](#简体中文)

## Overview

Yori Task gives you:

- **Task board**: backlog / upcoming / later columns (plus Recent Done)
- **Week plan**: 7-column week view with week navigation
- **Year plan**: twelve monthly columns per year

You can reorder tasks via drag-and-drop, highlight tasks, archive the current view to a Markdown note, and link tasks dropped from existing notes back to those notes.

## Installation

### Obsidian Community Plugins (recommended once listed)

1. Open **Settings → Community plugins**.
2. Open **Browse** and search **Yori Task**.
3. Install **Yori Task** and enable it.
4. Open the plugin from the ribbon or command palette (**Yori Task** view).

### Manual install (manual / beta / prerelease ZIP)

1. Download **`main.js`**, **`manifest.json`**, and **`styles.css`** from the **[Releases page](https://github.com/yoriGo77/obsidian-yori-task/releases)** for the exact version you want.
2. Create the folder `.obsidian/plugins/yori-task/` inside your vault (if it does not exist).
3. Place the three files in that folder.
4. In Obsidian → **Settings → Community plugins**, enable **Yori Task**.
5. Relaunch Obsidian **or** disable and enable the plugin once after replacing files.

> **Tip:** If the plugin fails to load, verify that all three files are from the **same release** and that folder name matches `manifest.json`'s `"id"` (`yori-task`).

## Basic usage

1. **Sidebar / ribbon**: Click the ribbon icon **or** use the command palette to open the **Yori Task** view.
2. **Tabs**: Switch between **TASK** (English UI default), **WEEK**, and **YEAR** tabs at the top of the pane.
3. **Columns / blocks**: Right‑click a column title to rename, add, reorder, lock scroll, etc. Right‑click a task for highlight and other actions.
4. **Drag‑and‑drop**: Drag tasks between columns; desktop **custom drag** supports scrolling while dragging.
5. **Notes**: Drag a note file from Obsidian onto a column to create a linked task row.
6. **Archive**: Use the archive control in WEEK / YEAR to export the current planner state into vault notes.

For multi-line drafts in task inputs use **Shift+Enter** where supported.

## Settings

Go to **Settings → Community plugins → Yori Task**:

- Customize accent, panel, card, task text / hint colours.
- Toggle **ZH / EN** UI language via the dropdown.
- Configure **how linked-note tasks open** (tab / pane / reuse / smart reuse).

Compatibility is defined by `manifest.json` (`minAppVersion`, `isDesktopOnly`).

## Development

Clone the repo, then install lockfile-pin dependencies and run checks:

```bash
npm ci
npm test
```

Release workflow: tagging a semver-style tag pushes a GitHub Actions run that verifies `npm ci` and generates **artifact attestations** for `main.js` and `styles.css` (see Actions tab).

## Feedback & license

Issues: [repo issues](https://github.com/yoriGo77/obsidian-yori-task/issues).

License: **MIT** (`LICENSE` in the repo root).

---

## 简体中文

一个用于 Obsidian 的任务插件，帮助你把当日、近期与后续要做的事情安排清楚。

### 功能

- **任务视图**：今日 / 近期 / 后续等列 + 近期完成汇总
- **周计划**：按周浏览，按日分列
- **年计划**：按月份分列
- 支持拖拽排序、右键高亮、将当前视图归档为 Markdown 笔记、从库中拖入笔记生成带链接的任务

### 安装

**社区插件**（上架后）：**设置 → 第三方插件 → 社区插件 → 浏览**，搜索「Yori Task」安装并启用。

**手动安装**：

1. 从 [GitHub Releases](https://github.com/yoriGo77/obsidian-yori-task/releases) 下载对应版本的 **`main.js`、`manifest.json`、`styles.css`**
2. 放入库 `.obsidian/plugins/yori-task/`（若无则新建该文件夹）
3. 在 **设置 → 第三方插件** 中启用 **Yori Task**

### 使用说明

1. 打开右侧栏 / 功能区中的插件视图，顶端可切换任务 / 周 / 年
2. 右键区块标题可管理区块；右键任务可操作高亮等
3. 可将 Obsidian 中的笔记拖到区块生成任务（可链接回原笔记）
4. 在周 / 年视图中可对当前计划做归档导出
5. 部分输入框中 **Shift+回车** 可换行

### 设置

在 **设置 → 第三方插件 → Yori Task** 中可调：

- 页面与任务配色
- **中文 / English** 界面语言
- 带链接任务的打开方式

最低版本与是否为仅桌面端，以 `manifest.json` 为准。

### 开发与反馈

同上所述使用 `npm ci` 与 `npm test`。问题请到 [Issues](https://github.com/yoriGo77/obsidian-yori-task/issues)。开源协议：**MIT**。
