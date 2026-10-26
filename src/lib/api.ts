import type { ApiConfig, Message } from "../types";
export async function requestChat(
  config: ApiConfig,
  apiKey: string,
  messages: Message[],
  scenario: string,
  signal: AbortSignal,
): Promise<string> {
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
