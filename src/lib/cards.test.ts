import { describe, expect, it } from "vitest";
import { parseCards } from "./cards";

describe("解析 AI 生成的卡片", () => {
  it("解析合法卡片并补齐 id", () => {
    const cards = parseCards(
      JSON.stringify([
        {
          kind: "word",
          front: "猫",
          back: "猫",
          reading: "neko",
          example: "猫が好きです。",
        },
        {
          kind: "grammar",
          front: "…です",
          back: "是……",
          note: "判断句",
          example: "猫です。",
        },
      ]),
    );
    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({ id: "ai-0", kind: "word", front: "猫" });
    expect(cards[1].id).toBe("ai-1");
    expect(cards[1].note).toBe("判断句");
  });
  it("剥离 markdown 代码块", () => {
    const cards = parseCards(
      '```json\n[{"kind":"dialogue","front":"こんにちは","back":"你好","reading":"konnichiwa"}]\n```',
    );
    expect(cards).toHaveLength(1);
    expect(cards[0].kind).toBe("dialogue");
  });
  it("拒绝非 JSON 与空数组", () => {
    expect(() => parseCards("不是 json")).toThrow("不是有效 JSON");
    expect(() => parseCards("[]")).toThrow("没有返回卡片");
  });
  it("拒绝非法 kind 与缺失字段", () => {
    expect(() =>
      parseCards('[{"kind":"other","front":"a","back":"b"}]'),
    ).toThrow("kind 不正确");
    expect(() => parseCards('[{"kind":"word","front":"猫"}]')).toThrow(
      "缺少 front 或 back",
    );
  });
});
