import { describe, expect, it } from "vitest";
import coursesData from "../data/courses.json";
import { parseCourses } from "./courses";

describe("课程数据", () => {
  it("内置课程 JSON 解析为 6 门课，每门课都有卡片", () => {
    const courses = parseCourses(coursesData);
    expect(courses).toHaveLength(6);
    expect(courses.every((c) => c.id >= 0 && c.cards.length > 0)).toBe(true);
    expect(courses[0].cards[0].id).toBe("course-0-0");
    expect(courses[5].title).toBe("约个时间");
  });
  it("拒绝损坏的课程数据", () => {
    expect(() => parseCourses("不是数组")).toThrow("不是数组");
    expect(() => parseCourses([{ id: 0, title: "缺字段" }])).toThrow();
    const [first] = parseCourses(coursesData);
    expect(() => parseCourses([{ ...first, cards: [] }])).toThrow("缺少 cards");
    expect(() => parseCourses([{ ...first, id: "x" }])).toThrow("缺少 id");
  });
});
