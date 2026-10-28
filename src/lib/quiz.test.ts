import { describe, expect, it } from "vitest";
import { kana, levelsFor } from "../data/kana";
import { buildQuestions, isUnlocked, resultFor } from "./quiz";
describe("五十音闯关", () => {
  it("平假名与片假名各有八关，所有假名均有对应读音", () => {
    expect(levelsFor("hiragana")).toHaveLength(8);
    expect(levelsFor("katakana")).toHaveLength(8);
    expect(kana).toHaveLength(71);
    expect(kana.every((k) => k.hiragana && k.katakana && k.reading)).toBe(true);
  });
  it("每关10题、四个不同选项、唯一正确答案，覆盖两种假名题型和词义题", () => {
    for (const script of ["hiragana", "katakana"] as const)
      for (const level of levelsFor(script)) {
        const questions = buildQuestions(level);
        expect(questions).toHaveLength(10);
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
  it("只在达到80%时解锁下一关，两个路线分别记录", () => {
    const levels = levelsFor("hiragana");
    expect(isUnlocked(0, levels, {})).toBe(true);
    expect(isUnlocked(1, levels, { [levels[0].id]: resultFor(7, 10) })).toBe(
      false,
    );
    expect(isUnlocked(1, levels, { [levels[0].id]: resultFor(8, 10) })).toBe(
      true,
    );
    expect(
      isUnlocked(1, levelsFor("katakana"), {
        [levels[0].id]: resultFor(10, 10),
      }),
    ).toBe(false);
    expect([8, 9, 10].map((n) => resultFor(n, 10).stars)).toEqual([1, 2, 3]);
  });
});
