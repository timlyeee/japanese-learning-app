import type { ReactNode } from "react";
import type { Page } from "../types";
const navigation: [Page, string, string][] = [
  ["home", "⌂", "学习概览"],
  ["courses", "▤", "学习路线"],
  ["kana", "あ", "五十音图"],
  ["words", "▣", "单词记忆"],
  ["chat", "♧", "AI 对话"],
  ["settings", "⚙", "API 设置"],
];
export default function Layout({
  page,
  navigate,
  days,
  children,
}: {
  page: Page;
  navigate: (page: Page) => void;
  days: number;
  children: ReactNode;
}) {
  return (
    <>
      <aside>
        <div className="brand">
          <span>✳</span>日和
        </div>
        <div className="tagline">让日语融入日常</div>
        <nav>
          {navigation.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className={page === id ? "active" : ""}
            >
              <i>{icon}</i>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="quiet">
            <strong>一小步，也是一种进步。</strong>没有广告，没有会员。
            <br />
            只专注于你的每一次成长。
          </div>
          <div className="profile">
            <div className="avatar">🌱</div>
            <div>
              日语学习者<small>从今天开始，慢慢来</small>
            </div>
          </div>
        </div>
      </aside>
      <main>
        <header>
          <span className="breadcrumb">
            我的学习空间 / {navigation.find((n) => n[0] === page)?.[2]}
          </span>
          <div className="header-right">
            <span className="pill">✧ 已学习 {days} 天</span>
            <span>你好，学习者 ☀</span>
          </div>
        </header>
        {children}
        <div className="footer">
          日々の小さな一歩。每天一点，离日语更近一点。
        </div>
      </main>
    </>
  );
}
