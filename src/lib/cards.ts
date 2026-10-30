import type { Card, CardKind } from "../types";

const KINDS: CardKind[] = ["word", "grammar", "dialogue"];

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export function parseCardItem(item: unknown, id: string): Card {
  if (!item || typeof item !== "object") throw new Error("卡片格式不正确");
  const card = item as Record<string, unknown>;
  if (typeof card.kind !== "string" || !KINDS.includes(card.kind as CardKind))
    throw new Error("卡片的 kind 不正确");
  const front = optionalText(card.front);
  const back = optionalText(card.back);
  if (!front || !back) throw new Error("卡片缺少 front 或 back");
  return {
    id,
    kind: card.kind as CardKind,
    front,
    back,
    reading: optionalText(card.reading),
    example: optionalText(card.example),
    exampleMeaning: optionalText(card.exampleMeaning),
    note: optionalText(card.note),
  };
}

export function parseCards(raw: string): Card[] {
  const text = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("AI 返回的卡片不是有效 JSON");
  }
  if (!Array.isArray(value) || value.length === 0)
    throw new Error("AI 没有返回卡片");
  return value.map((item, index) => parseCardItem(item, `ai-${index}`));
}
