import { useEffect, useRef, useState } from "react";
import { requestCards } from "../lib/api";
import { questionsFromCards } from "../lib/quiz";
import { useBack } from "../lib/back";
import {
  createSet,
  loadSets,
  persistSets,
  type SavedCardSet,
} from "../lib/savedCards";
import QuizSession from "./QuizSession";
import type { ApiConfig, Card } from "../types";

export default function CardGenerator({
  config,
  apiKey,
  activity,
}: {
  config: ApiConfig;
  apiKey: string;
  activity: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [name, setName] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<SavedCardSet[]>(loadSets);
  const [practice, setPractice] = useState<{
    title: string;
    cards: Card[];
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useBack(practice ? 3 : cards.length ? 2 : 0, () => {
    if (practice) setPractice(null);
    else {
      setCards([]);
      setName("");
      setError("");
    }
  });
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError("");
    setCards([]);
    controller.current = new AbortController();
    try {
      const result = await requestCards(
        config,
        apiKey,
        topic.trim(),
        controller.current.signal,
      );
      setCards(result);
      setName(topic.trim());
      activity();
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }
  function save() {
    const label = name.trim() || topic.trim();
    if (!label || cards.length === 0) return;
    const next = [createSet(label, cards), ...sets];
    persistSets(next);
    setSets(next);
    setCards([]);
    setName("");
  }
  function remove(id: string) {
    const next = sets.filter((set) => set.id !== id);
    persistSets(next);
    setSets(next);
  }
  if (practice)
    return (
      <QuizSession
        key={practice.title}
        title={practice.title}
        subtitle="我的卡片"
        rebuild={() => questionsFromCards(practice.cards)}
        finish={() => {}}
        exit={() => setPractice(null)}
      />
    );
  return (
    <div className="chat-box">
      <form className="chat-input" onSubmit={generate}>
        <input
          aria-label="卡片主题"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：在便利店买东西"
          maxLength={200}
          disabled={busy}
        />
        <button className="primary" disabled={busy}>
          {busy ? "生成中…" : "生成卡片"}
        </button>
      </form>
      <div className="generator-body">
        {cards.length > 0 && (
          <>
            <div className="card-preview-list">
              {cards.map((card) => (
                <div className="card-preview" key={card.id}>
                  <strong lang="ja">{card.front}</strong>
                  <span>
                    {card.back}
                    {card.reading ? ` · ${card.reading}` : ""}
                  </span>
                </div>
              ))}
            </div>
            <div className="save-row">
              <input
                aria-label="卡片集名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="这叠卡片叫什么名字？"
                maxLength={60}
              />
              <button className="secondary" onClick={save}>
                保存
              </button>
              <button
                className="primary"
                onClick={() =>
                  setPractice({
                    title: name.trim() || topic.trim(),
                    cards,
                  })
                }
              >
                开始练习 →
              </button>
            </div>
          </>
        )}
        {sets.length > 0 && (
          <div className="saved-sets">
            <h2>已保存的卡片集</h2>
            {sets.map((set) => (
              <div className="saved-set" key={set.id}>
                <div className="set-meta">
                  <strong>{set.topic}</strong>
                  <span>{set.cards.length} 张卡片</span>
                </div>
                <div className="set-actions">
                  <button
                    className="secondary"
                    onClick={() =>
                      setPractice({ title: set.topic, cards: set.cards })
                    }
                  >
                    练习
                  </button>
                  <button className="link" onClick={() => remove(set.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="muted">
          输入一个主题，AI
          生成一叠带读音、例句和讲解的卡片。保存后可在本机反复练习。
        </p>
        <p className="status error" role="status">
          {error}
        </p>
      </div>
    </div>
  );
}
