# 日和

React + Vite + TypeScript 前端，Express + TypeScript API。需要 Node.js 22.12+ 或 24+。

## 开发

```sh
npm ci
npm run dev
```

访问 http://127.0.0.1:3000 。保持终端运行，Ctrl+C 同时停止前后端。页面使用 3000 端口，API 使用 3001 端口，由 Vite 转发 `/api`。端口占用会报错，不会自动切换。健康检查：http://127.0.0.1:3001/api/health 。

localhost 超时时请使用明确 IPv4 地址，并确保系统代理对 localhost 和 127.0.0.1 直连。

## 构建运行

```sh
npm run build
npm start
```

正式运行由一个 Express 服务提供构建后的页面和 API，访问地址仍为 http://127.0.0.1:3000 。修改代码后需重新构建。

## 维护

- `src/pages/`：首页、课程、假名、单词、AI 对话、设置。
- `src/components/`：导航布局与课程卡片。
- `src/data/content.ts`：强类型课程和词库，扩充内容时保持既有 ID 稳定。
- `src/lib/progress.ts`：进度校验、旧数据兼容和复习规则。
- `src/lib/api.ts`、`speech.ts`：对话请求与发音。
- `src/types.ts`：共享类型。
- `server/app.ts`：API 校验、健康检查、AI 代理。
- `server/index.ts`：服务启动及正式构建文件托管。
- `vite.config.ts`：开发端口与 API 转发。

## API 与数据

设置页填写兼容 Chat Completions 的基础地址、模型、密钥，自动追加 `/chat/completions`。密钥只保存在内存中；刷新后重新填写。也可以复制 `.env.example` 为 `.env` 并设置 `AI_API_KEY`。不要给密钥使用 VITE_ 前缀或提交 .env。

应用免费，提供商可能计费。对话和密钥发送至你配置的服务商，服务器不主动记录它们。进度沿用 `hiyori` 本地存储，支持导出及校验后导入。localhost 与 127.0.0.1 的浏览器存储相互独立，切换地址时可通过备份迁移。

服务只监听本机。支持自定义地址和本机模型，请勿直接公开到公网。公网部署需增加身份验证、上游白名单、配额及限流。

## 检查

```sh
npm run check
npm test
npm run build
```

测试覆盖旧进度、损坏备份、间隔复习、健康检查、输入校验、同源校验、模拟 AI 成功与错误。真实 AI 需有效密钥验证。

## 五十音闯关

五十音页包含独立的平假名、片假名路线，每条路线 8 关。支持假名表、关前预习、每关 10 题、答题解释、错题复练和本地星级记录。

题型为读音选假名、假名选读音、带罗马音的词语选中文。至少答对 8 题过关，解锁下一关；达到 80% / 90% / 100% 分别获得 1 / 2 / 3 星。重复挑战保留最高成绩，错题练习不改变正式成绩。

## Android 安装与打包

使用 npm 的 Capacitor 8，APK 内置网页资源，课程、单词、两条假名路线均可离线使用。最低 Android 7.0（API 24），推荐使用更新版本的系统 WebView。

```sh
npm run android:sync
npm run android:build
```

Windows 构建需要 Java 21、Android SDK API 36 和 Build Tools 36.0.0。脚本依次检测环境变量、`D:\SDK\Android` 与项目 `.tools/android-sdk`；Java 同样支持环境变量、`D:\SDK\Java` 和项目 `.tools/java`。也可显式指定：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-android.ps1 -SdkPath D:\SDK\Android -JavaPath D:\SDK\Java\jdk21.0.13_0
```

安装包输出为 `artifacts/hiyori-learning-android.apk`，使用本机调试签名，适合直接安装学习，不能视为商店发布版。升级需保持包名和签名不变；卸载会清除本地进度，建议先导出备份。

手机端直接通过原生 HTTPS 请求连接设置中的 AI 服务，不访问电脑 localhost，不需要电脑常开。需要在手机设置页填写密钥。发音使用手机原生 TTS；若提示缺少日语语音，需要在系统文字转语音设置安装日语语音包。备份通过系统分享菜单保存，网页与手机进度可通过 JSON 导出、导入迁移。

`android/` 是可维护的原生工程，`capacitor.config.ts` 为打包配置。`npx cap sync android` 同步网页输出，不应覆盖自定义的 NativeLearning 插件。密钥、签名文件、SDK 路径、缓存、APK 输出不提交。

## 项目规则

从根目录 `AGENTS.md` 进入 `Rules/README.md`，按需加载工作流程、代码风格、学习内容和 Android/API 约定。

当前内容仍是入门原型，包含 6 节情境课程、20 个单词复习条目、平片假名各 71 个假名，以及 20 个假名词语题。尚非完整的零基础到日常交流教材。
