import { useState } from "react";
import { SpeakerHigh } from "@phosphor-icons/react";
import { allCourseCards, courses } from "../data/content";
import { speak } from "../lib/speech";
import { questionsFromCards, type QuizResult } from "../lib/quiz";
import { useBack } from "../lib/back";
import QuizSession from "../components/QuizSession";

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
  const [started, setStarted] = useState(false);
  const course = courses.find((c) => c.id === selected);
  function open(id: number | null) {
    setStarted(false);
    select(id);
  }
  useBack(course ? (started ? 3 : 2) : 0, () => {
    if (started) setStarted(false);
    else if (course) open(null);
  });
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
              <small>{c.description} · 对话 / 语法 / 卡片练习</small>
            </button>
          ))}
        </div>
      </>
    );
  if (started)
    return (
      <QuizSession
        key={course.id}
        title={course.title}
        subtitle="课程练习"
        rebuild={() => questionsFromCards(course.cards, allCourseCards)}
        finish={(result: QuizResult) => {
          if (result.stars > 0) complete(course.id);
        }}
        exit={() => setStarted(false)}
      />
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
          <SpeakerHigh size={16} weight="regular" /> 听日语示范
        </button>
        <p className="notice">{course.grammar}</p>
        <div className="card-preview-list">
          {course.cards.map((card) => (
            <div className="card-preview" key={card.id}>
              <strong lang="ja">{card.front}</strong>
              <span>
                {card.back}
                {card.reading ? ` · ${card.reading}` : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="actions">
          <button className="primary" onClick={() => setStarted(true)}>
            开始卡片练习 →
          </button>
        </div>
        {completed.includes(course.id) && (
          <button
            className="secondary"
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
