import type { KnowledgeFeedEntry } from "../types/knowledge";

export interface KnowledgeFeedPage {
  items: KnowledgeFeedEntry[];
  nextCursor: string | null;
}

export function getKnowledgeFeedPage(
  entries: KnowledgeFeedEntry[],
  cursor: string | null,
  limit = 4,
): KnowledgeFeedPage {
  if (!Number.isInteger(limit) || limit < 1)
    throw new Error("知识卡片分页数量必须是正整数");

  const cursorIndex = cursor
    ? entries.findIndex(({ card }) => card.id === cursor)
    : -1;
  if (cursor && cursorIndex < 0) throw new Error("知识卡片分页游标不存在");
  const start = cursor ? cursorIndex + 1 : 0;
  const items = entries.slice(start, start + limit);
  const lastItem = items.at(-1);
  const hasMore = start + items.length < entries.length;

  return {
    items,
    nextCursor: hasMore && lastItem ? lastItem.card.id : null,
  };
}
