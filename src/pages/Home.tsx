import { courses, words } from "../data/content";
import CourseCard from "../components/CourseCard";
import { speak } from "../lib/speech";
import type { Page, Progress } from "../types";
export default function Home({
  progress,
  navigate,
  openCourse,
}: {
  progress: Progress;
  navigate: (page: Page) => void;
  openCourse: (id: number) => void;
}) {
  const due = words.filter(
    (w) => !progress.reviews[w.id] || progress.reviews[w.id].due <= Date.now(),
  ).length;
  const next = courses.find((c) => !progress.done.includes(c.id));
  const stats = [
    ["◷", progress.days.length, "天", "累计学习"],
    ["あ", Object.keys(progress.reviews).length, "个", "已学习单词"],
    ["▤", progress.done.length, "课", "已完成课程"],
    ["↻", due, "个", "今日待复习"],
  ];
  return (
    <>
      <div className="intro">
        <div>
          <h1>今天，也和日语见个面吧。</h1>
          <span className="muted">
            不必着急，每天一点点，让喜欢变成会说的语言。
          </span>
        </div>
        <span className="date">
          {new Date().toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </span>
      </div>
      <section className="hero">
        <div>
          <span className="eyebrow">YOUR JAPANESE JOURNEY</span>
          <h2>
            从「こんにちは」开始，
            <br />
            走向更大的世界。
          </h2>
          <p>平假名 · 片假名 · 每关十题，学完就练。</p>
          <button className="primary" onClick={() => navigate("kana")}>
            开始五十音闯关 →
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun" />
          <div className="hill" />
          <div className="plant">🌿</div>
          <div className="japanese-art">日々、少しずつ。</div>
        </div>
      </section>
      <div className="stats">
        {stats.map(([icon, n, unit, label]) => (
          <div className="stat" key={label}>
            <div className="stat-icon">{icon}</div>
            <div>
              <strong>{n}</strong>
              <small>{unit}</small>
              <label>{label}</label>
            </div>
          </div>
        ))}
      </div>
      <div className="columns">
        <div>
          <div className="section-head">
            <h2>循序渐进，学会表达</h2>
            <button className="link" onClick={() => navigate("courses")}>
              查看学习路线 →
            </button>
          </div>
          <div className="lessons">
            {courses.slice(0, 4).map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                completed={progress.done.includes(c.id)}
                onOpen={() => openCourse(c.id)}
              />
            ))}
          </div>
        </div>
        <div className="right-column">
          <section className="panel">
            <div className="section-head">
              <h3>每日一词</h3>
              <button className="link" onClick={() => speak("木漏れ日")}>
                ♬ 发音
              </button>
            </div>
            <div className="word-day">
              <strong>木漏れ日</strong>
              <span>こもれび · komorebi</span>
              <p>透过树叶缝隙洒下的阳光</p>
            </div>
            <div className="example">
              木漏れ日がきれいですね。<small>树隙间的阳光真美啊。</small>
            </div>
          </section>
          <section className="panel quote">
            <strong>継続は力なり。</strong>坚持就是力量。
            <br />
            哪怕只有十分钟，也值得为自己停留。
          </section>
        </div>
      </div>
      <div className="bottom-banner">
        <div>
          <h3>把学过的日语，变成说出口的勇气。</h3>
          <p>和 AI 伙伴聊聊天，从熟悉的生活场景开始。</p>
        </div>
        <button className="secondary" onClick={() => navigate("chat")}>
          开始对话 ↗
        </button>
      </div>
    </>
  );
}
