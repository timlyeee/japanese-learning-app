import type { Card, Course } from "../types";
import { parseCardItem } from "./cards";

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim())
    throw new Error(`课程数据缺少 ${key}`);
  return value;
}

export function parseCourses(value: unknown): Course[] {
  if (!Array.isArray(value)) throw new Error("课程数据不是数组");
  return value.map((entry, courseIndex) => {
    if (!entry || typeof entry !== "object")
      throw new Error(`第 ${courseIndex + 1} 门课程格式不正确`);
    const record = entry as Record<string, unknown>;
    const id = record.id;
    if (typeof id !== "number" || !Number.isInteger(id))
      throw new Error(`第 ${courseIndex + 1} 门课程缺少 id`);
    if (!Array.isArray(record.cards) || record.cards.length === 0)
      throw new Error(`第 ${courseIndex + 1} 门课程缺少 cards`);
    const cards: Card[] = record.cards.map((card, cardIndex) =>
      parseCardItem(card, `course-${id}-${cardIndex}`),
    );
    return {
      id,
      title: requiredString(record, "title"),
      description: requiredString(record, "description"),
      symbol: requiredString(record, "symbol"),
      dialogue: requiredString(record, "dialogue"),
      grammar: requiredString(record, "grammar"),
      cards,
    };
  });
}
