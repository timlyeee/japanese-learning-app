import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarCheck,
  CheckCircle,
  Repeat,
  Sparkle,
} from "@phosphor-icons/react";
import KnowledgeFeed from "../components/KnowledgeFeed";
import { builtInKnowledgeFeed } from "../data/knowledgeCards";
import { words } from "../data/content";
import type { Page, Progress } from "../types";

export default function Home({
  progress,
  navigate,
  openKnowledgeCard,
}: {
  progress: Progress;
  navigate: (page: Page) => void;
  openKnowledgeCard: (cardId: string) => void;
}) {
  const due = words.filter(
    (word) =>
      !progress.reviews[word.id] || progress.reviews[word.id].due <= Date.now(),
  ).length;
  const completedQuizzes = Object.values(progress.quiz).filter(
    (result) => result.stars > 0,
  ).length;
  const stats: [ReactNode, number, string, string][] = [
    [
      <CalendarCheck size={22} weight="regular" />,
      progress.days.length,
      "天",
      "累计学习",
    ],
    [
      <CheckCircle size={22} weight="regular" />,
      completedQuizzes,
      "组",
      "完成测试",
    ],
    [
      <BookOpen size={22} weight="regular" />,
      builtInKnowledgeFeed.length,
      "张",
      "内置知识卡",
    ],
    [<Repeat size={22} weight="regular" />, due, "个", "今日待复习"],
  ];

  return (
    <>
      <div className="intro knowledge-intro">
        <div>
          <span className="eyebrow">DISCOVER SOMETHING NEW</span>
          <h1>今天，想学点什么？</h1>
          <span className="muted">
            向下浏览知识卡片，读完内容后马上来一轮小测试。
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

      <section className="feed-welcome">
        <div className="feed-welcome-icon" aria-hidden="true">
          <Sparkle size={26} weight="regular" />
        </div>
        <div>
          <h2>五十音知识流已经准备好</h2>
          <p>
            每张卡片对应一组假名，包含学习内容、复习卡和随卡测试。内容会在浏览时逐批加载。
          </p>
        </div>
        <button className="secondary" onClick={() => navigate("kana")}>
          查看完整卡组
        </button>
      </section>

      <div className="stats knowledge-stats">
        {stats.map(([icon, value, unit, label]) => (
          <div className="stat" key={label}>
            <div className="stat-icon" aria-hidden="true">
              {icon}
            </div>
            <div>
              <strong>{value}</strong>
              <small>{unit}</small>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="knowledge-feed-heading">
        <div>
          <span className="eyebrow">KNOWLEDGE FEED</span>
          <h2>继续向下，遇见下一张卡片</h2>
        </div>
        <p>平假名与片假名交替出现</p>
      </div>

      <KnowledgeFeed
        entries={builtInKnowledgeFeed}
        onOpen={({ card }) => openKnowledgeCard(card.id)}
      />
    </>
  );
}
