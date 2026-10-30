import { kana, kanaGroups, katakanaGroups, type Script } from "./kana";
import type {
  CardRevision,
  KnowledgeCard,
  KnowledgeFeedEntry,
  StudyDeck,
} from "../types/knowledge";

const BUILTIN_OWNER_ID = "builtin-learn-something-new";

export interface KanaCardTarget {
  script: Script;
  levelId: string;
}

interface KanaKnowledgeData {
  card: KnowledgeCard;
  revision: CardRevision;
  target: KanaCardTarget;
}

function createKanaKnowledgeData(
  script: Script,
  index: number,
): KanaKnowledgeData {
  const groups = script === "hiragana" ? kanaGroups : katakanaGroups;
  const group = groups[index];
  const label = script === "hiragana" ? "平假名" : "片假名";
  const entries = kana
    .filter((item) => group.rows.includes(item.row))
    .map((item) => ({ glyph: item[script], reading: item.reading }));
  const cardId = `builtin-kana-${script}-${index}`;
  const revisionId = `${cardId}-v1`;
  const timestamp = Date.UTC(2026, 0, 1) + index;

  return {
    card: {
      id: cardId,
      ownerId: BUILTIN_OWNER_ID,
      currentRevisionId: revisionId,
      status: "published",
      visibility: "public",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    revision: {
      id: revisionId,
      cardId,
      version: 1,
      format: "article",
      title: group.title,
      summary: `${group.subtitle}。先认清字形和读音，再用随卡测试巩固这一组${label}。`,
      blocks: [
        {
          id: `${revisionId}-intro`,
          type: "rich-text",
          text: `这一张知识卡收录 ${entries.length} 个${label}，点击字符可以听发音。`,
        },
        {
          id: `${revisionId}-grid`,
          type: "kana-grid",
          script,
          entries,
        },
        {
          id: `${revisionId}-tip`,
          type: "callout",
          text: "学习完成后可以立即进行一轮 15 题测试。",
        },
      ],
      quizBundleIds: [`${script}-${index}`],
      studyItemIds: entries.map(
        (entry) => `kana:${script}:${entry.reading}:${entry.glyph}`,
      ),
      publishedAt: timestamp,
    },
    target: { script, levelId: `${script}-${index}` },
  };
}

const hiraganaCards = kanaGroups.map((_, index) =>
  createKanaKnowledgeData("hiragana", index),
);
const katakanaCards = katakanaGroups.map((_, index) =>
  createKanaKnowledgeData("katakana", index),
);

const interleavedCards: KanaKnowledgeData[] = Array.from(
  { length: Math.max(hiraganaCards.length, katakanaCards.length) },
  (_, index) => [hiraganaCards[index], katakanaCards[index]],
).flatMap((pair) => pair.filter((item): item is KanaKnowledgeData => !!item));

export const builtInKnowledgeFeed: KnowledgeFeedEntry[] = interleavedCards.map(
  ({ card, revision }) => ({ card, revision }),
);

export const knowledgeCardTargets = new Map<string, KanaCardTarget>(
  interleavedCards.map(({ card, target }) => [card.id, target]),
);

export const builtInKanaDecks: StudyDeck[] = [
  {
    id: "builtin-deck-hiragana",
    ownerId: BUILTIN_OWNER_ID,
    title: "平假名基础卡组",
    description: "从元音到浊音，按组复习平假名。",
    sourceCardIds: hiraganaCards.map(({ card }) => card.id),
    studyItemIds: hiraganaCards.flatMap(
      ({ revision }) => revision.studyItemIds,
    ),
  },
  {
    id: "builtin-deck-katakana",
    ownerId: BUILTIN_OWNER_ID,
    title: "片假名基础卡组",
    description: "结合字源故事与读音，按组复习片假名。",
    sourceCardIds: katakanaCards.map(({ card }) => card.id),
    studyItemIds: katakanaCards.flatMap(
      ({ revision }) => revision.studyItemIds,
    ),
  },
];
