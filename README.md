# Yori Task
一个用于 Obsidian 的任务相关插件，适合所有需要将近期或后续生活工作中的任务安排清楚，以便将任务执行思路条理有序的用户。

## 功能
- 管理日常，近期和后续任务
- 周视图安排或记录7日任务
- 年视图安排或记录每月任务
- 将生成的诸多任务归档以便日后查看

## 安装

### 社区插件（若尚未在「社区插件」中上架，请先使用下方的「手动安装」）
1. 打开 Obsidian：**设置 → 第三方插件 → 社区插件 → 浏览**  
2. 搜索：**Yori Task**
3. 安装并启用

### 手动安装
1. 下载本仓库 Release 中的 `main.js`、`manifest.json`、`styles.css`
2. 放到库目录：`.obsidian/plugins/yori-task/`  
4. 若不存在该文件夹，请在 `plugins` 下新建 `yori-task` 再放入上述文件
3. 在 Obsidian 中启用插件

## 使用说明
1.  Task视图中，右键区块可创建或修改区块。
2.  右键事件可设置高亮。拖拽事件可在区块之间移动。
3.  支持将Obisidian笔记直接拖进区块来生成任务。
4.  Week视图中，切换周来安排之后的任务，或查看之前的任务。
5.  点击归档，可将当前视图中的任务数据保存为汇总笔记。
6.  添加任务时，在输入框内shift+回车可换行

## 设置
在 **设置 → 第三方插件 → Yori Task** 中可配置：
- 页面背景颜色，标题文字颜色，任务文字颜色，任务背景颜色等
- 以笔记添加的任务可链接到该笔记，设置打开该笔记标签页的方式

## 兼容性
- 最低 Obsidian 版本：以 `manifest.json` 的 `minAppVersion` 为准  
- 桌面端 / 移动端：暂只支持桌面端，以 `manifest.json` 的 `isDesktopOnly` 为准

## 反馈与贡献
- Issue：https://github.com/yoriGo77/obsidian-yori-task/issues

## 许可证
MIT（见仓库根目录 `LICENSE`）