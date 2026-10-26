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

当前内容为 6 节课程、20 个示范单词，仍是入门原型。发音依赖设备日语语音包。
