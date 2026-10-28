# 代码与界面

- TypeScript 保持严格类型；React 页面放 `src/pages/`，复用组件放 `src/components/`，纯逻辑放 `src/lib/`，内容放 `src/data/`。
- 用 React 状态与事件处理交互，不拼接 HTML、不使用 innerHTML 渲染用户或 AI 内容。
- 题目生成、评分、解锁和时间安排保持为可独立测试的纯函数。
- 优先提取现有共享逻辑，不为小改动引入重复状态或额外框架。
- 卡片式、简洁、清楚是用户明确的界面偏好。手机使用底部导航；保证触控尺寸、文字可读性、反馈和禁用状态清楚。
- 不靠颜色单独传达对错；保留文字说明、表单标签、状态提示和键盘焦点。
- `src/style.css` 是基础样式，`src/cards.css` 是卡片和移动端覆盖；同一规则不要在多个文件反复覆盖，后续整理应保证原页面兼容。
- Android 原生实现放在 `android/app/src/main/java/com/hiyori/japanese/`；插件能力通过 `src/lib/native.ts` 暴露。
