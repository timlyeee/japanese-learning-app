# 返回键与页内导航

> 状态：已完成

## 背景

Android 端未处理系统返回键/返回手势，滑动返回直接退出整个 APP，操作体验不顺畅。

## 现状（改造前）

- 项目未安装 `@capacitor/app`；`MainActivity` 仅注册 `NativeLearningPlugin`，无返回键处理。
- 页面与子状态（课程详情、假名关卡、答题中）分散在 App 与各页的 `useState`，无统一导航栈。

## 设计

- 安装 `@capacitor/app`，在 `App.tsx` 通过 `initBackButton()` 注册 `backButton` 监听；当没有处理器响应时调用 `App.exitApp()`。
- `src/lib/back.ts` 用「深度键控的处理器注册表」管理返回：`useBack(depth, handler)` 在挂载时登记、卸载时移除；`handleBack()` 始终执行深度最大的处理器，因此 React 子/父组件的挂载顺序不影响优先级。
- 返回顺序由显式深度值决定：答题中(3) → 关卡/卡片预览(2) → 模块内首页(1) → 模块选择(0)。`Kana`、`Courses`、`CardGenerator` 在子状态切换时调整深度，`App` 处理模块与页标签层级。
- 系统返回与页内「返回」按钮复用同一处理器，行为一致。

## 验证

- `npm run check`、`npm test`、`npm run build`；真机返回键/手势需在 Android 端 `cap sync android` 后确认。
