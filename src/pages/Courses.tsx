import { useState } from "react";
import { courses } from "../data/content";
import { speak } from "../lib/speech";
export default function Courses({
  selected,
  select,
  completed,
  complete,
  kana,
  chat,
}: {
  selected: number | null;
  select: (id: number | null) => void;
  completed: number[];
  complete: (id: number) => void;
  kana: () => void;
  chat: () => void;
}) {
  const [feedback, setFeedback] = useState("");
  const course = courses.find((c) => c.id === selected);
  function open(id: number | null) {
    setFeedback("");
    select(id);
  }
  if (!course)
    return (
      <>
        <h1>一步一步，走向日常交流</h1>
        <p className="muted">入门体验路线 · 先认识假名，再用句子表达自己。</p>
        <button className="secondary" onClick={kana}>
          第 0 站 · 认识五十音 →
        </button>
        <div className="course-list">
          {courses.map((c) => (
            <button
              key={c.id}
              className="course-row"
              onClick={() => open(c.id)}
            >
              {completed.includes(c.id) ? "✓" : "○"}　{c.id + 1}　{c.title}
              <small>{c.description} · 对话 / 语法 / 小测</small>
            </button>
          ))}
        </div>
      </>
    );
  return (
    <>
      <button className="link" onClick={() => open(null)}>
        ← 返回学习路线
      </button>
      <div className="study-card">
        <span className="eyebrow">LESSON {course.id + 1}</span>
        <h1>{course.title}</h1>
        <p className="dialogue">{course.dialogue}</p>
        <button
          className="secondary"
          onClick={() =>
            speak(
              course.dialogue
                .split("\n")
                .filter((_, i) => i % 2 === 0)
                .join("。"),
            )
          }
        >
          ♬ 听日语示范
        </button>
        <p className="notice">{course.grammar}</p>
        <h3>{course.question}</h3>
        <div className="course-list">
          {course.options.map((option, i) => (
            <button
              key={option}
              className="secondary"
              onClick={() => {
                if (i === course.answer) {
                  complete(course.id);
                  setFeedback("✓ 回答正确，已记录学习进度。");
                } else setFeedback("再想一想，可以回看上面的句型提示。");
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="status" role="status">
          {feedback}
        </p>
        {completed.includes(course.id) && (
          <button
            className="primary"
            onClick={() =>
              course.id + 1 < courses.length ? open(course.id + 1) : chat()
            }
          >
            继续学习 →
          </button>
        )}
      </div>
    </>
  );
}
