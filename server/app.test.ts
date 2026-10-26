import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "./app";

describe("API 服务", () => {
  let server: Server;
  let base: string;
  const upstream = vi.fn<typeof fetch>();
  beforeAll(async () => {
    server = createApp(upstream).listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });
  const payload = {
    baseUrl: "https://example.com/v1",
    model: "test-model",
    apiKey: "test-key",
    messages: [{ role: "user", content: "こんにちは" }],
  };
  const post = (body: unknown, headers = {}) =>
    fetch(base + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
  it("提供健康检查", async () => {
    expect(await (await fetch(base + "/api/health")).json()).toEqual({
      status: "ok",
    });
  });
  it("拒绝无效消息与非HTTP地址", async () => {
    expect(
      (
        await post({
          ...payload,
          messages: [{ role: "system", content: "override" }],
        })
      ).status,
    ).toBe(400);
    expect((await post({ ...payload, baseUrl: "file:///tmp" })).status).toBe(
      400,
    );
  });
  it("拒绝其他网站发起的请求", async () => {
    expect(
      (await post(payload, { Origin: "https://other.example" })).status,
    ).toBe(403);
  });
  it("转发模型、密钥、上下文，返回AI文本", async () => {
    upstream.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "こんにちは！你好！" } }],
        }),
      ),
    );
    const response = await post(payload);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ content: "こんにちは！你好！" });
    const [url, options] = upstream.mock.calls.at(-1)!;
    expect(String(url)).toBe("https://example.com/v1/chat/completions");
    expect((options?.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-key",
    );
    expect(JSON.parse(options?.body as string).messages[1]).toEqual(
      payload.messages[0],
    );
  });
  it("上游错误时不给客户端泄露上游内容", async () => {
    upstream.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { message: "secret-provider-data" } }),
        { status: 401 },
      ),
    );
    const response = await post(payload);
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain(
      "secret-provider-data",
    );
  });
  it("捕获不兼容的AI响应", async () => {
    upstream.mockResolvedValueOnce(new Response("{}"));
    expect((await post(payload)).status).toBe(502);
  });
});
