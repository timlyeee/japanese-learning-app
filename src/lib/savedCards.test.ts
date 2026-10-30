import { describe, expect, it } from "vitest";
import { parseSets } from "./savedCards";

describe("本地保存的卡片集", () => {
  const valid = {
    id: "set-abc",
    topic: "在便利店买东西",
    createdAt: 1700000000000,
    cards: [
      { kind: "word", front: "パン", back: "面包", reading: "pan" },
      { kind: "grammar", front: "…をください", back: "请给我……", note: "索取" },
    ],
  };
  it("解析合法卡片集并补齐卡片 id", () => {
    const sets = parseSets([valid]);
    expect(sets).toHaveLength(1);
    expect(sets[0].topic).toBe("在便利店买东西");
    expect(sets[0].cards.map((c) => c.id)).toEqual(["set-abc-0", "set-abc-1"]);
  });
  it("拒绝损坏的卡片集", () => {
    expect(() => parseSets("不是数组")).toThrow("不是数组");
    expect(() => parseSets([{ ...valid, id: "" }])).toThrow("缺少 id");
    expect(() => parseSets([{ ...valid, topic: " " }])).toThrow("缺少 topic");
    expect(() => parseSets([{ ...valid, cards: [] }])).toThrow("缺少 cards");
    expect(() =>
      parseSets([{ ...valid, cards: [{ kind: "x", front: "a", back: "b" }] }]),
    ).toThrow("kind 不正确");
  });
});
