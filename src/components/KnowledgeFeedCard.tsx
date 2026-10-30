import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Stack,
} from "@phosphor-icons/react";
import type { KanaGridBlock, KnowledgeFeedEntry } from "../types/knowledge";

function kanaGridFor(entry: KnowledgeFeedEntry): KanaGridBlock | undefined {
  return entry.revision.blocks.find(
    (block): block is KanaGridBlock => block.type === "kana-grid",
  );
}

export default function KnowledgeFeedCard({
  entry,
  onOpen,
}: {
  entry: KnowledgeFeedEntry;
  onOpen: () => void;
}) {
  const grid = kanaGridFor(entry);
  const isKatakana = grid?.script === "katakana";
  const titleId = `knowledge-title-${entry.card.id}`;
  const summaryId = `knowledge-summary-${entry.card.id}`;

  return (
    <article
      className={`knowledge-feed-card ${isKatakana ? "is-katakana" : "is-hiragana"}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
      >
        <div className="knowledge-card-meta">
          <span className="knowledge-card-author">
            <BookOpen size={16} weight="regular" aria-hidden="true" />
            学点新的？
          </span>
          <span className="knowledge-card-format">五十音学习卡</span>
        </div>

        {grid && (
          <div className="knowledge-card-glyphs" aria-hidden="true">
            {grid.entries.slice(0, 10).map((item) => (
              <span key={`${item.glyph}-${item.reading}`}>{item.glyph}</span>
            ))}
          </div>
        )}

        <div className="knowledge-card-copy">
          <span className="eyebrow">
            {isKatakana ? "KATAKANA" : "HIRAGANA"}
          </span>
          <h2 id={titleId}>{entry.revision.title}</h2>
          <p id={summaryId}>{entry.revision.summary}</p>
        </div>

        <div className="knowledge-card-footer">
          <span>
            <Stack size={16} weight="regular" aria-hidden="true" />
            {entry.revision.studyItemIds.length} 张复习卡
          </span>
          <span>
            <CheckCircle size={16} weight="regular" aria-hidden="true" />
            随卡测试
          </span>
          <span className="knowledge-card-open" aria-hidden="true">
            开始学习 <ArrowRight size={16} weight="bold" />
          </span>
        </div>
      </button>
    </article>
  );
}
