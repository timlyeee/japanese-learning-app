import { useState } from "react";
import {
  kana,
  kanaWords,
  levelsFor,
  type Level,
  type Script,
} from "../data/kana";
import { speak } from "../lib/speech";
import { isUnlocked, type QuizResult } from "../lib/quiz";
import QuizSession from "../components/QuizSession";

export default function Kana({
  activity,
  results,
  finish,
}: {
  activity: () => void;
  results: Record<string, QuizResult>;
  finish: (id: string, result: QuizResult) => void;
}) {
  const [script, setScript] = useState<Script>("hiragana");
  const [view, setView] = useState<"path" | "chart">("path");
  const [selected, setSelected] = useState<Level | null>(null);
  const [started, setStarted] = useState(false);
  const levels = levelsFor(script);
  const completed = levels.filter(
    (level) => results[level.id]?.stars > 0,
  ).length;
  if (selected && started)
    return (
      <QuizSession
        key={selected.id}
        level={selected}
        finish={(result) => finish(selected.id, result)}
        exit={() => {
          setSelected(null);
          setStarted(false);
        }}
      />
    );
  if (selected)
    return (
      <section className="quiz-card lesson-intro">
        <button className="link" onClick={() => setSelected(null)}>
          ← 返回地图
        </button>
        <span className="lesson-symbol">
          {script === "hiragana" ? "あ" : "ア"}
        </span>
        <h1>{selected.title}</h1>
        <p className="muted">先认识这一关的内容，再开始 10 道小测试。</p>
        <div
          className={
            selected.kind === "word" ? "word-preview-grid" : "kana-grid"
          }
        >
          {selected.kind === "word"
            ? kanaWords
                .filter((w) => w.script === script)
                .map((w) => (
                  <button
                    className="word-preview"
                    key={w.text}
                    onClick={() => speak(w.text)}
                  >
                    <ruby lang="ja">
                      {w.text}
                      <rt>{w.romaji}</rt>
                    </ruby>
                    <span>{w.meaning}</span>
                  </button>
                ))
            : kana
                .filter((k) => selected.rows.includes(k.row))
                .map((k) => (
                  <button
                    className="kana"
                    key={k.hiragana}
                    onClick={() => speak(k[script])}
                  >
                    {k[script]}
                    <small>{k.reading}</small>
                  </button>
                ))}
        </div>
        <p className="notice">
          {selected.kind === "word"
            ? "注音使用罗马音。长音符号 ō / ī 表示多读一拍；外来语常用片假名书写。"
            : "两种题型交替练习：读音选假名、假名选读音。点击卡片可听发音。"}
          　答对 8 题即可过关。
        </p>
        <button
          className="primary"
          onClick={() => {
            setStarted(true);
            activity();
          }}
        >
          准备好了，开始挑战 →
        </button>
      </section>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SMALL STEPS, REAL PROGRESS</span>
          <h1>从五十音，开启冒险。</h1>
          <p className="muted">认一个音，闯一小关。每次十题，慢慢学会。</p>
        </div>
        <div className="completion-chip">
          {completed} / {levels.length} 关已完成
        </div>
      </div>
      <div className="toolbar">
        <div className="segmented" aria-label="假名种类">
          <button
            className={script === "hiragana" ? "selected" : ""}
            onClick={() => setScript("hiragana")}
          >
            あ 平假名
          </button>
          <button
            className={script === "katakana" ? "selected" : ""}
            onClick={() => setScript("katakana")}
          >
            ア 片假名
          </button>
        </div>
        <div className="segmented">
          <button
            className={view === "path" ? "selected" : ""}
            onClick={() => setView("path")}
          >
            闯关练习
          </button>
          <button
            className={view === "chart" ? "selected" : ""}
            onClick={() => setView("chart")}
          >
            假名表
          </button>
        </div>
      </div>
      {view === "path" ? (
        <>
          <div className="path-summary">
            <span>✦</span>
            <div>
              <strong>
                {script === "hiragana" ? "平假名" : "片假名"}基础之旅
              </strong>
              <p>7 关读音练习 + 1 关词语理解 · 80% 正确率解锁下一关</p>
            </div>
          </div>
          <div className="level-grid">
            {levels.map((level, index) => {
              const unlocked = isUnlocked(index, levels, results);
              const result = results[level.id];
              return (
                <button
                  className={`level-card ${result?.stars ? "completed" : unlocked ? "available" : "locked"}`}
                  key={level.id}
                  disabled={!unlocked}
                  onClick={() => setSelected(level)}
                >
                  <div className="level-top">
                    <span className="level-number">
                      {result?.stars
                        ? "✓"
                        : unlocked
                          ? String(index + 1).padStart(2, "0")
                          : "⌑"}
                    </span>
                    <span className="level-state">
                      {result?.stars
                        ? "已通关"
                        : unlocked
                          ? "可以挑战"
                          : "完成上一关解锁"}
                    </span>
                  </div>
                  <h3>{level.title}</h3>
                  <p>{level.subtitle}</p>
                  <div className="level-bottom">
                    <span
                      className="stars"
                      aria-label={`${result?.stars ?? 0}颗星`}
                    >
                      {"★".repeat(result?.stars ?? 0)}
                      {"☆".repeat(3 - (result?.stars ?? 0))}
                    </span>
                    <span>
                      {result ? `${result.correct}/${result.total}` : "10 题"}
                      　→
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <section className="panel">
          <div className="section-head">
            <h2>{script === "hiragana" ? "平假名表" : "片假名表"}</h2>
            <span className="muted">点击听发音</span>
          </div>
          <div className="kana-grid">
            {kana.map((k) => (
              <button
                className="kana"
                key={k.hiragana}
                onClick={() => {
                  speak(k[script]);
                  activity();
                }}
              >
                {k[script]}
                <small>{k.reading}</small>
              </button>
            ))}
          </div>
          <p className="notice">
            を 作助词通常读 o；ん 是鼻音。じ / ぢ 通常同读 ji，ず / づ 通常同读
            zu。小写 っ / ッ 表示停顿一拍。拗音如 きゃ / キャ 用小写 ゃ / ャ
            组合。本轮闯关覆盖清音、浊音和半浊音。
          </p>
        </section>
      )}
    </>
  );
}
