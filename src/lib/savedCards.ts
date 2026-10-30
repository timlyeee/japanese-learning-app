import type { Card } from "../types";
import { parseCardItem } from "./cards";

export interface SavedCardSet {
  id: string;
  topic: string;
  createdAt: number;
  cards: Card[];
}

const STORAGE_KEY = "learnnew-cards";

export function parseSets(value: unknown): SavedCardSet[] {
  if (!Array.isArray(value)) throw new Error("卡片集数据不是数组");
  return value.map((entry, index) => {
    if (!entry || typeof entry !== "object")
      throw new Error(`第 ${index + 1} 个卡片集格式不正确`);
    const record = entry as Record<string, unknown>;
    const id = record.id;
    if (typeof id !== "string" || !id.trim())
      throw new Error(`第 ${index + 1} 个卡片集缺少 id`);
    const topic = record.topic;
    if (typeof topic !== "string" || !topic.trim())
      throw new Error(`第 ${index + 1} 个卡片集缺少 topic`);
    const createdAt = record.createdAt;
    if (typeof createdAt !== "number" || !Number.isFinite(createdAt))
      throw new Error(`第 ${index + 1} 个卡片集缺少 createdAt`);
    if (!Array.isArray(record.cards) || record.cards.length === 0)
      throw new Error(`第 ${index + 1} 个卡片集缺少 cards`);
    const cards: Card[] = record.cards.map((card, cardIndex) =>
      parseCardItem(card, `${id}-${cardIndex}`),
    );
    return { id, topic, createdAt, cards };
  });
}

export function createSet(topic: string, cards: Card[]): SavedCardSet {
  return {
    id: `set-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    createdAt: Date.now(),
    cards,
  };
}

export function loadSets(): SavedCardSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseSets(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function persistSets(sets: SavedCardSet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch {
    // 存储空间不足或不可用时静默忽略，不影响本次练习。
  }
}
