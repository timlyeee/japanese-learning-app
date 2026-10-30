import { describe, expect, it } from "vitest";
import { builtInKanaDecks, builtInKnowledgeFeed } from "../data/knowledgeCards";
import { getKnowledgeFeedPage } from "./knowledgeFeed";

describe("getKnowledgeFeedPage", () => {
  it("按稳定游标逐页返回且不重复", () => {
    const first = getKnowledgeFeedPage(builtInKnowledgeFeed, null, 4);
    const second = getKnowledgeFeedPage(
      builtInKnowledgeFeed,
      first.nextCursor,
      4,
    );

    expect(first.items).toHaveLength(4);
    expect(second.items).toHaveLength(4);
    expect(first.nextCursor).toBe(first.items.at(-1)?.card.id);
    expect(
      first.items.some(({ card }) =>
        second.items.some((entry) => entry.card.id === card.id),
      ),
    ).toBe(false);
  });

  it("最后一页没有后续游标", () => {
    let page = getKnowledgeFeedPage(builtInKnowledgeFeed, null, 5);
    const ids = page.items.map(({ card }) => card.id);

    while (page.nextCursor) {
      page = getKnowledgeFeedPage(builtInKnowledgeFeed, page.nextCursor, 5);
      ids.push(...page.items.map(({ card }) => card.id));
    }

    expect(ids).toHaveLength(builtInKnowledgeFeed.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(page.nextCursor).toBeNull();
  });

  it("拒绝无效分页数量", () => {
    expect(() => getKnowledgeFeedPage(builtInKnowledgeFeed, null, 0)).toThrow(
      "正整数",
    );
  });

  it("拒绝已经失效的游标，避免从头重复追加", () => {
    expect(() =>
      getKnowledgeFeedPage(builtInKnowledgeFeed, "missing-card", 4),
    ).toThrow("游标不存在");
  });

  it("知识卡版本和内置卡组引用保持完整", () => {
    const cardIds = new Set(
      builtInKnowledgeFeed.map(({ card, revision }) => {
        expect(card.currentRevisionId).toBe(revision.id);
        expect(revision.cardId).toBe(card.id);
        expect(revision.quizBundleIds).toHaveLength(1);
        return card.id;
      }),
    );

    for (const deck of builtInKanaDecks) {
      expect(deck.sourceCardIds.length).toBeGreaterThan(0);
      expect(deck.studyItemIds.length).toBeGreaterThan(0);
      expect(deck.sourceCardIds.every((id) => cardIds.has(id))).toBe(true);
    }
  });
});
