import { useEffect, useState } from "react";
import { SpeakerHigh, Plant } from "@phosphor-icons/react";
import { words } from "../data/content";
import { speak } from "../lib/speech";
import type { Progress } from "../types";
export default function Words({
  progress,
  rate,
  chat,
}: {
  progress: Progress;
  rate: (id: number, known: boolean) => void;
  chat: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const due = words.filter(
    (w) => !progress.reviews[w.id] || progress.reviews[w.id].due <= now,
  );
  const word = due[0];
  if (!word)
    return (
      <div className="study-card">
        <div className="result-icon">
          <Plant size={48} weight="regular" />
        </div>
        <h1>本轮复习完成了</h1>
        <p>到期的单词会自动重新出现。休息一下，也可以练习对话。</p>
        <button className="primary" onClick={chat}>
          用日语聊聊天
        </button>
      </div>
    );
  return (
    <>
      <h1>让每一个词，慢慢变熟悉。</h1>
      <p className="muted">
        当前待学习 {due.length} 个 · 根据记忆情况安排下次复习
      </p>
      <div className="study-card">
        <span className="eyebrow">VOCABULARY PRACTICE</span>
        <div className="big-word">{word.text}</div>
        <button className="link" onClick={() => speak(word.text)}>
          <SpeakerHigh size={16} weight="regular" /> 听发音
        </button>
        <div className={`review-reveal ${revealed ? "" : "hidden"}`}>
          <p>
            {word.reading} · {word.meaning}
          </p>
          <div className="example">
            {word.example}
            <small>{word.translation}</small>
          </div>
        </div>
        <div className="actions">
          {revealed ? (
            <>
              <button
                className="secondary"
                onClick={() => {
                  rate(word.id, false);
                  setRevealed(false);
                  setNow(Date.now());
                }}
              >
                还没记住
              </button>
              <button
                className="primary"
                onClick={() => {
                  rate(word.id, true);
                  setRevealed(false);
                  setNow(Date.now());
                }}
              >
                记住了 ✓
              </button>
            </>
          ) : (
            <button className="primary" onClick={() => setRevealed(true)}>
              查看释义
            </button>
          )}
        </div>
        <p className="muted">先回想读音和含义，再查看答案。</p>
      </div>
    </>
  );
}
