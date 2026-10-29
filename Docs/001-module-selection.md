# 模块选择入口（学点新的？）

> 状态：已完成

## 背景

应用转型为「学点新的？」知识卡片课程平台，入口改为模块选择：打开先选模块，再进入对应模块。日语是当前唯一真实模块。

## 现状（实现后）

- 打开应用落在「模块选择」页（`src/components/ModuleSelect.tsx`），展示品牌与模块卡片。
- 模块元信息在 `src/data/modules.ts`；模块类型 `ModuleId` / `Module` 在 `src/types.ts`。
- 「日语」是唯一模块；选中后进入日语模块，沿用原侧边栏导航（`src/components/Layout.tsx`），并可通过「返回模块」回到模块选择。
- 品牌显示名「学点新的？」；Android 包名 `com.learnnew.app`，进度存储键 `learnnew`，原生备份文件 `learnnew-progress.json`，npm 包名 `learn-new`，APK 输出名 `learnnew-android.apk`。

## 设计

### 核心概念

模块（`Module`）= 主题领域。当前仅 `japanese`（日语），未来可扩展。

### 导航结构（两级）

- 第 0 级：模块选择（`activeModule === null` 时渲染 `ModuleSelect`）。
- 第 1 级：模块内，沿用原 `Page` 导航。

### 数据与状态

- `types.ts`：`ModuleId`、`Module`。
- `src/data/modules.ts`：模块元信息。
- `App.tsx`：`module: ModuleId | null` 状态；`null` 显示模块选择，否则渲染 `Layout`。

## 非目标（本次不做）

- 不新建「学点新的？」卡片生成流程（后续子任务）
- 不引入用户系统、社区、去重、审核

## 验证

- `npm run build` 通过（tsc 无类型错误 + vite 构建成功）。
