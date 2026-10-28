import { useRef, useState } from "react";
import type { Level } from "../data/kana";
import {
  buildQuestions,
  resultFor,
  type Question,
  type QuizResult,
} from "../lib/quiz";
import { speak } from "../lib/speech";

export default function QuizSession({
  level,
  finish,
  exit,
}: {
  level: Level;
  finish: (result: QuizResult) => void;
  exit: () => void;
}) {
  const [questions, setQuestions] = useState(() => buildQuestions(level));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [done, setDone] = useState(false);
  const [practice, setPractice] = useState(false);
  const recorded = useRef(false);
  const question = questions[index];
  const correct = selected === question?.answer;
  const result = resultFor(score, questions.length);

  function restart(onlyMistakes: boolean) {
    setQuestions(onlyMistakes ? mistakes : buildQuestions(level));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setMistakes([]);
    setDone(false);
    setPractice(onlyMistakes);
    recorded.current = false;
  }
  function next() {
    if (selected === null) return;
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    if (!recorded.current && !practice) {
      recorded.current = true;
      finish(result);
    }
    setDone(true);
  }
  if (done)
    return (
      <section className="quiz-card result-card">
        <div className="result-icon">{result.stars ? "✦" : "🌱"}</div>
        <span className="eyebrow">
          {practice ? "MISTAKE PRACTICE" : "LESSON COMPLETE"}
        </span>
        <h1>
          {practice
            ? "错题复习完成"
            : result.stars
              ? "又向前走了一小步！"
              : "慢慢来，再练一次。"}
        </h1>
        <div className="stars" aria-label={`${result.stars}颗星`}>
          {"★".repeat(result.stars)}
          {"☆".repeat(3 - result.stars)}
        </div>
        <p>
          答对{" "}
          <strong>
            {score} / {questions.length}
          </strong>{" "}
          题 · 正确率 {Math.round((score / questions.length) * 100)}%
        </p>
        <p className="muted">
          {practice
            ? "复习不会改变本关成绩，再挑战一次来点亮星星。"
            : result.stars
              ? "成绩已保存，下一关已解锁。"
              : "达到 80% 正确率就能解锁下一关，没有次数限制。"}
        </p>
        {mistakes.length > 0 && (
          <div className="mistake-list">
            <h3>把这些再记一记</h3>
            {mistakes.map((q) => (
              <div key={q.id}>
                <strong>{q.prompt}</strong>
                <span>{q.explanation}</span>
              </div>
            ))}
          </div>
        )}
        <div className="actions">
          {mistakes.length > 0 && (
            <button className="secondary" onClick={() => restart(true)}>
              练习错题
            </button>
          )}
          <button className="secondary" onClick={() => restart(false)}>
            再挑战一次
          </button>
          <button className="primary" onClick={exit}>
            返回闯关地图 →
          </button>
        </div>
      </section>
    );
  return (
    <section className="quiz-card">
      <div className="quiz-top">
        <button
          className="link"
          onClick={() => {
            if (confirm("退出会放弃本轮未完成的答题，已完成的关卡不受影响。"))
              exit();
          }}
          aria-label="退出本轮练习"
        >
          ✕
        </button>
        <div className="progress">
          <span style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <span>
          {index + 1} / {questions.length}
        </span>
      </div>
      <span className="eyebrow">
        {practice ? "错题巩固" : level.title} ·{" "}
        {level.script === "hiragana" ? "平假名" : "片假名"}
      </span>
      <h2 className="question-title">{question.hint}</h2>
      <div
        className={`question-prompt ${question.kind === "word" ? "word-prompt" : ""}`}
        lang="ja"
      >
        {question.kind === "word" ? (
          <ruby>
            {question.prompt}
            <rt>{question.reading}</rt>
          </ruby>
        ) : (
          question.prompt
        )}
      </div>
      <button className="sound-button" onClick={() => speak(question.speak)}>
        ♫ 听一听
      </button>
      <div className="answer-grid">
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            disabled={selected !== null}
            className={`answer-option ${selected !== null && option === question.answer ? "is-correct" : selected === option ? "is-wrong" : ""}`}
            onClick={() => {
              if (selected !== null) return;
              setSelected(option);
              if (option === question.answer) setScore((n) => n + 1);
              else setMistakes((items) => [...items, question]);
            }}
          >
            <span className="option-number">{optionIndex + 1}</span>
            {option}
          </button>
        ))}
      </div>
      <div
        className={`answer-feedback ${selected !== null ? (correct ? "good" : "retry") : ""}`}
        role="status"
      >
        {selected !== null ? (
          <>
            <strong>
              {correct ? "✓ 答对了！" : `再记一次：${question.answer}`}
            </strong>
            <p>{question.explanation}</p>
          </>
        ) : (
          <p>选出你的答案，再继续下一题。</p>
        )}
        <button className="primary" disabled={selected === null} onClick={next}>
          {index + 1 === questions.length ? "查看成绩" : "继续 →"}
        </button>
      </div>
    </section>
  );
}
