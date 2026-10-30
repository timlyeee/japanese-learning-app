import express from "express";
import type { ErrorRequestHandler } from "express";
import type { Card, Message } from "../src/types";
import { cardPrompt, tutorPrompt } from "../src/lib/prompt";
import { parseCards } from "../src/lib/cards";

export function createApp(fetcher: typeof fetch = fetch) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && origin !== `http://${req.get("host")}`) {
      res.status(403).json({ error: "仅允许本机同源请求" });
      return;
    }
    next();
  });
  app.use(express.json({ limit: "100kb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.post("/api/chat", async (req, res) => {
    try {
      const { baseUrl, apiKey, model, messages, scenario } = req.body ?? {};
      if (
        typeof baseUrl !== "string" ||
        typeof model !== "string" ||
        !model.trim() ||
        model.length > 200 ||
        (apiKey !== undefined && typeof apiKey !== "string") ||
        !Array.isArray(messages) ||
        messages.length < 1 ||
        messages.length > 20 ||
        !messages.every(
          (m: Message) =>
            m &&
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string" &&
            m.content.length <= 4000,
        )
      ) {
        res.status(400).json({ error: "请检查服务地址、模型和对话内容" });
        return;
      }
      let endpoint: URL;
      try {
        endpoint = new URL(baseUrl);
      } catch {
        res.status(400).json({ error: "API 地址格式不正确" });
        return;
      }
      if (
        !["https:", "http:"].includes(endpoint.protocol) ||
        endpoint.username ||
        endpoint.password ||
        endpoint.search ||
        endpoint.hash
      ) {
        res
          .status(400)
          .json({ error: "请填写不含账户、查询参数的 HTTP 或 HTTPS 基础地址" });
        return;
      }
      endpoint.pathname =
        endpoint.pathname.replace(/\/$/, "") + "/chat/completions";
      const upstream = await fetcher(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey || process.env.AI_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: tutorPrompt(
                typeof scenario === "string" ? scenario : "日常交流",
              ),
            },
            ...messages,
          ],
        }),
        signal: AbortSignal.timeout(45000),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        res.status(502).json({
          error: `AI 服务返回 ${upstream.status}，请检查密钥、模型、余额和服务地址`,
        });
        return;
      }
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        res.status(502).json({ error: "AI 返回格式不兼容" });
        return;
      }
      res.json({ content });
    } catch (error) {
      res.status(502).json({
        error:
          error instanceof Error &&
          ["TimeoutError", "AbortError"].includes(error.name)
            ? "AI 响应超时，请重试"
            : "无法连接 AI 服务，请检查网络和 API 地址",
      });
    }
  });
  app.post("/api/cards", async (req, res) => {
    try {
      const { baseUrl, apiKey, model, topic } = req.body ?? {};
      if (
        typeof baseUrl !== "string" ||
        typeof model !== "string" ||
        !model.trim() ||
        model.length > 200 ||
        (apiKey !== undefined && typeof apiKey !== "string") ||
        typeof topic !== "string" ||
        !topic.trim() ||
        topic.length > 200
      ) {
        res.status(400).json({ error: "请检查服务地址、模型和主题" });
        return;
      }
      let endpoint: URL;
      try {
        endpoint = new URL(baseUrl);
      } catch {
        res.status(400).json({ error: "API 地址格式不正确" });
        return;
      }
      if (
        !["https:", "http:"].includes(endpoint.protocol) ||
        endpoint.username ||
        endpoint.password ||
        endpoint.search ||
        endpoint.hash
      ) {
        res
          .status(400)
          .json({ error: "请填写不含账户、查询参数的 HTTP 或 HTTPS 基础地址" });
        return;
      }
      endpoint.pathname =
        endpoint.pathname.replace(/\/$/, "") + "/chat/completions";
      const upstream = await fetcher(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey || process.env.AI_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          messages: [{ role: "user", content: cardPrompt(topic.trim()) }],
        }),
        signal: AbortSignal.timeout(45000),
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        res.status(502).json({
          error: `AI 服务返回 ${upstream.status}，请检查密钥、模型、余额和服务地址`,
        });
        return;
      }
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        res.status(502).json({ error: "AI 返回格式不兼容" });
        return;
      }
      let cards: Card[];
      try {
        cards = parseCards(content);
      } catch {
        res.status(502).json({ error: "AI 生成的卡片格式不正确，请重试" });
        return;
      }
      res.json({ cards });
    } catch (error) {
      res.status(502).json({
        error:
          error instanceof Error &&
          ["TimeoutError", "AbortError"].includes(error.name)
            ? "AI 响应超时，请重试"
            : "无法连接 AI 服务，请检查网络和 API 地址",
      });
    }
  });
  const errors: ErrorRequestHandler = (err, _req, res, _next) => {
    res
      .status(err.status === 413 ? 413 : 400)
      .json({ error: err.status === 413 ? "请求内容过大" : "请求格式不正确" });
  };
  app.use(errors);
  return app;
}
