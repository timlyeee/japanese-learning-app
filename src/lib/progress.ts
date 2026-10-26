import type { Progress, Review } from "../types";
export const STORAGE_KEY = "hiyori";
export const initialProgress = (): Progress => ({
  done: [],
  reviews: {},
  days: [],
  config: { baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
});
export function parseProgress(raw: string): Progress {
  const value = JSON.parse(raw);
  if (
    !value ||
    !Array.isArray(value.done) ||
    !value.done.every((n: unknown) => Number.isInteger(n) && Number(n) >= 0) ||
    !Array.isArray(value.days) ||
    !value.days.every(
      (d: unknown) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d),
    ) ||
    !value.reviews ||
    typeof value.reviews !== "object" ||
    Array.isArray(value.reviews)
  )
    throw new Error("学习进度文件格式不正确");
  for (const [key, r] of Object.entries(value.reviews)) {
    const review = r as Review;
    if (
      !/^\d+$/.test(key) ||
      !review ||
      !Number.isInteger(review.level) ||
      review.level < 0 ||
      review.level > 6 ||
      !Number.isFinite(review.due)
    )
      throw new Error("复习记录格式不正确");
  }
  const config = value.config;
  return {
    done: [...new Set<number>(value.done)],
    days: [...new Set<string>(value.days)],
    reviews: value.reviews,
    config:
      config &&
      typeof config.baseUrl === "string" &&
      typeof config.model === "string"
        ? { baseUrl: config.baseUrl, model: config.model }
        : initialProgress().config,
  };
}
export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseProgress(raw) : initialProgress();
  } catch {
    return initialProgress();
  }
}
export function localDay() {
  return new Date().toLocaleDateString("sv-SE");
}
export function withActivity(progress: Progress): Progress {
  return { ...progress, days: [...new Set([...progress.days, localDay()])] };
}
export function scheduleReview(
  previous: Review | undefined,
  known: boolean,
  now = Date.now(),
): Review {
  const level = known ? Math.min((previous?.level ?? 0) + 1, 6) : 0;
  return {
    level,
    due: now + (known ? [0, 1, 3, 7, 14, 30, 60][level] * 86_400_000 : 60_000),
  };
}
