import type { Course } from "../types";
export default function CourseCard({
  course,
  completed,
  onOpen,
}: {
  course: Course;
  completed: boolean;
  onOpen: () => void;
}) {
  return (
    <button className="lesson" onClick={onOpen}>
      <span className="lesson-icon">{course.symbol}</span>
      <span className="badge">
        {completed ? "已完成" : `基础 · ${course.id + 1}`}
      </span>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="progress">
        <span style={{ width: completed ? "100%" : "0%" }} />
      </div>
      <div className="lesson-foot">
        <span>{completed ? "已完成练习" : "对话 · 语法 · 练习"}</span>
        <span>约 5 分钟 →</span>
      </div>
    </button>
  );
}
