import { describe, expect, it } from "vitest";
import { initialProgress, parseProgress, scheduleReview } from "./progress";
describe("学习进度与复习", () => {
  it("兼容首版已有的本地进度", () => {
    const legacy = {
      done: [0, 0, 1],
      days: ["2026-10-26"],
      reviews: { 0: { level: 1, due: 1000 } },
    };
    expect(parseProgress(JSON.stringify(legacy))).toEqual({
      ...legacy,
      done: [0, 1],
      config: initialProgress().config,
      quiz: {},
    });
  });
  it("拒绝损坏的备份", () => {
    expect(() => parseProgress("{")).toThrow();
    expect(() =>
      parseProgress(
        JSON.stringify({
          ...initialProgress(),
          reviews: { 0: { level: 99, due: 1000 } },
        }),
      ),
    ).toThrow();
  });
  it("遗忘一分钟后重试，记住逐步延长，最多60天", () => {
    expect(scheduleReview(undefined, false, 0)).toEqual({
      level: 0,
      due: 60000,
    });
    expect(scheduleReview(undefined, true, 0)).toEqual({
      level: 1,
      due: 86400000,
    });
    expect(scheduleReview({ level: 1, due: 0 }, true, 0)).toEqual({
      level: 2,
      due: 3 * 86400000,
    });
    expect(scheduleReview({ level: 6, due: 0 }, true, 0)).toEqual({
      level: 6,
      due: 60 * 86400000,
    });
  });
});
