# Android 与 AI 服务

- 使用 Capacitor 8 和 Vite 的 dist 输出打包，配置在 `capacitor.config.ts`；不要为可安装版配置指向电脑 localhost 的 server.url。
- APK 必须内置学习内容，离线能读课程、背单词和闯关；AI 对话需要网络和用户配置的服务。
- Android 使用原生 HTTP 直接连接 HTTPS AI 接口，网页使用同源 `/api/chat` 代理。共用 `src/lib/prompt.ts` 的教师提示词。
- API 密钥只保存在页面内存；网页服务支持服务器环境变量 AI_API_KEY。不要放进 VITE_ 变量、日志、仓库或 APK。
- API 输入校验、超时、上游错误处理与同源限制要保留。自定义本机上游功能不意味着服务可公开部署；公网部署仍需身份验证、白名单与限流。
- 手机发音使用 NativeLearning 原生 TTS，需要设备安装日语语音；不能把系统缺少语音包误报成题目错误。
- 构建入口为 `scripts/build-android.ps1`，支持显式 SdkPath、JavaPath；优先使用用户指定的 D:\SDK\Android，环境不可写时明确说明，不修改整个 SDK 目录权限。
- Java 使用 21，Android 编译 API 36、最低 API 24，版本以 android/variables.gradle 为准。SDK、Java、Gradle 缓存不入库。
- 本机测试 APK 输出到 artifacts/，构建和签名验证通过后才能提供安装包。调试签名不等于商店发布签名，真机未验证必须明确说明。
