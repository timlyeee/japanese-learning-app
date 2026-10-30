import { describe, expect, it } from "vitest";
import { kana, kanaWords, levelsFor } from "../data/kana";
import {
  buildQuestions,
  isUnlocked,
  questionsFromCards,
  resultFor,
} from "./quiz";
import type { Card } from "../types";

describe("五十音闯关", () => {
  it("平假名八关、片假名十三关，所有假名均有对应读音", () => {
    expect(levelsFor("hiragana")).toHaveLength(8);
    expect(levelsFor("katakana")).toHaveLength(13);
    expect(kana).toHaveLength(71);
    expect(kana.every((k) => k.hiragana && k.katakana && k.reading)).toBe(true);
  });
  it("假名关15题、词语关按词量出题，四个不同选项、唯一正确答案", () => {
    for (const script of ["hiragana", "katakana"] as const)
      for (const level of levelsFor(script)) {
        const questions = buildQuestions(level);
        const expected =
          level.kind === "word"
            ? kanaWords.filter((w) => w.script === script).length
            : 15;
        expect(questions).toHaveLength(expected);
        for (const q of questions) {
          expect(q.options).toHaveLength(4);
          expect(new Set(q.options).size).toBe(4);
          expect(
            q.options.filter((option) => option === q.answer),
          ).toHaveLength(1);
          if (q.kind === "word") expect(q.reading).toBeTruthy();
          if (q.kind === "sound-to-kana") {
            const matching = kana
              .filter((k) => k.reading === q.prompt)
              .map((k) => k[script]);
            expect(
              q.options.filter((option) => matching.includes(option)),
            ).toHaveLength(1);
          }
        }
        expect(new Set(questions.map((q) => q.kind))).toEqual(
          level.kind === "word"
            ? new Set(["word"])
            : new Set(["sound-to-kana", "kana-to-sound"]),
        );
      }
  });
  it("片假名以字形选读音为主", () => {
    const questions = buildQuestions(levelsFor("katakana")[0]);
    const kanaToSound = questions.filter(
      (q) => q.kind === "kana-to-sound",
    ).length;
    expect(kanaToSound).toBeGreaterThan(questions.length / 2);
  });
  it("只在达到80%时解锁下一关，两个路线分别记录", () => {
    const levels = levelsFor("hiragana");
    expect(isUnlocked(0, levels, {})).toBe(true);
    expect(isUnlocked(1, levels, { [levels[0].id]: resultFor(11, 15) })).toBe(
      false,
    );
    expect(isUnlocked(1, levels, { [levels[0].id]: resultFor(12, 15) })).toBe(
      true,
    );
    expect(
      isUnlocked(1, levelsFor("katakana"), {
        [levels[0].id]: resultFor(15, 15),
      }),
    ).toBe(false);
    expect([12, 14, 15].map((n) => resultFor(n, 15).stars)).toEqual([1, 2, 3]);
  });
});

describe("卡片动态出题", () => {
  it("按卡片字段生成题目，字段多题就多", () => {
    const cards: Card[] = [
      {
        id: "a",
        kind: "word",
        front: "猫",
        back: "猫（动物）",
        reading: "neko",
        example: "猫が好きです。",
      },
      { id: "b", kind: "grammar", front: "…です", back: "是……" },
    ];
    const questions = questionsFromCards(cards, cards);
    expect(questions).toHaveLength(4);
    for (const q of questions) {
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
