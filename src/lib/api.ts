import type { ApiConfig, Card, Message } from "../types";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { parseCards } from "./cards";
import { cardPrompt, tutorPrompt } from "./prompt";

function nativeEndpoint(config: ApiConfig) {
  const endpoint = new URL(config.baseUrl);
  if (
    endpoint.protocol !== "https:" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  )
    throw new Error("Android 版请使用 HTTPS 的 API 基础地址");
  endpoint.pathname =
    endpoint.pathname.replace(/\/$/, "") + "/chat/completions";
  return endpoint;
}

export async function requestChat(
  config: ApiConfig,
  apiKey: string,
  messages: Message[],
  scenario: string,
  signal: AbortSignal,
): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    if (!apiKey)
      throw new Error(
        "请先在 API 设置中填写密钥。Android 版直接连接你的 AI 服务。",
      );
    const endpoint = nativeEndpoint(config);
    const result = await CapacitorHttp.post({
      url: endpoint.toString(),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: config.model,
        temperature: 0.7,
        messages: [
          { role: "system", content: tutorPrompt(scenario) },
          ...messages,
        ],
      },
      connectTimeout: 15000,
      readTimeout: 45000,
    });
    if (signal.aborted) throw new DOMException("已取消", "AbortError");
    if (result.status < 200 || result.status >= 300)
      throw new Error(`AI 服务返回 ${result.status}，请检查密钥、模型和余额`);
    const content = result.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("AI 返回格式不兼容");
    return content;
  }
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ ...config, apiKey, messages, scenario }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data.content;
}

export async function requestCards(
  config: ApiConfig,
  apiKey: string,
  topic: string,
  signal: AbortSignal,
): Promise<Card[]> {
  if (Capacitor.isNativePlatform()) {
    if (!apiKey)
      throw new Error(
        "请先在 API 设置中填写密钥。Android 版直接连接你的 AI 服务。",
      );
    const endpoint = nativeEndpoint(config);
    const result = await CapacitorHttp.post({
      url: endpoint.toString(),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: {
        model: config.model,
        temperature: 0.3,
        messages: [{ role: "user", content: cardPrompt(topic) }],
      },
      connectTimeout: 15000,
      readTimeout: 45000,
    });
    if (signal.aborted) throw new DOMException("已取消", "AbortError");
    if (result.status < 200 || result.status >= 300)
      throw new Error(`AI 服务返回 ${result.status}，请检查密钥、模型和余额`);
    const content = result.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("AI 返回格式不兼容");
    return parseCards(content);
  }
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({ ...config, apiKey, topic }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "请求失败");
  return data.cards;
}
