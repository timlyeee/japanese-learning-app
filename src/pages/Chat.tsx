import { useEffect, useRef, useState } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { scenarios } from "../data/content";
import { requestChat } from "../lib/api";
import type { ApiConfig, Message } from "../types";
export default function Chat({
  config,
  apiKey,
  activity,
}: {
  config: ApiConfig;
  apiKey: string;
  activity: () => void;
}) {
  const [scenario, setScenario] = useState(scenarios[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [messages]);
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy) return;
    const text = input.trim();
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    controller.current = new AbortController();
    try {
      const content = await requestChat(
        config,
        apiKey,
        next.slice(-20),
        scenario,
        controller.current.signal,
      );
      setMessages([...next, { role: "assistant", content }]);
      activity();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages(messages);
      setInput(text);
      setError(err instanceof Error ? err.message : "连接失败");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <h1>说得慢一点，也没关系。</h1>
      <p className="muted">你的日语陪练伙伴 · 练习真实场景，获得中文讲解</p>
      <div className="chat-layout">
        <div className="scenarios">
          {scenarios.map((scene) => (
            <button
              key={scene}
              disabled={busy}
              className={`scenario ${scene === scenario ? "selected" : ""}`}
              onClick={() => {
                setScenario(scene);
                setMessages([]);
                setError("");
              }}
            >
              {scene}
            </button>
          ))}
        </div>
        <div className="chat-box">
          <div className="messages" ref={list} aria-live="polite">
            <div className="bubble">
              こんにちは！一起练习「{scenario}」吧。
              <br />
              你可以用日语开场，也可以用中文问我怎么表达。
            </div>
            {messages.map((message, i) => (
              <div
                key={i}
                className={`bubble ${message.role === "user" ? "user" : ""}`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={send}>
            <input
              aria-label="对话内容"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="试着说：こんにちは！"
              maxLength={2000}
              disabled={busy}
            />
            <button className="primary" disabled={busy}>
              {busy ? (
                "思考中…"
              ) : (
                <>
                  发送 <PaperPlaneRight size={16} weight="regular" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <p className="muted">
        请先在 API
        设置中配置服务。对话内容会发送给你选择的提供商。离开本页面将结束当前对话。
      </p>
      <p className="status error" role="status">
        {error}
      </p>
    </>
  );
}
