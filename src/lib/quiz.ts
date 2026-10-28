import { kana, kanaWords, type Level } from "../data/kana";
export interface Question {
  id: string;
  kind: "sound-to-kana" | "kana-to-sound" | "word";
  prompt: string;
  hint: string;
  reading?: string;
  speak: string;
  answer: string;
  options: string[];
  explanation: string;
}
export interface QuizResult {
  correct: number;
  total: number;
  stars: number;
}
export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function choices(answer: string, pool: string[], random: () => number) {
  return shuffle(
    [
      answer,
      ...shuffle(
        [...new Set(pool)].filter((option) => option !== answer),
        random,
      ).slice(0, 3),
    ],
    random,
  );
}
export function buildQuestions(level: Level, random = Math.random): Question[] {
  if (level.kind === "word")
    return shuffle(
      kanaWords.filter((w) => w.script === level.script),
      random,
    ).map((word, index) => ({
      id: `${level.id}-${index}`,
      kind: "word",
      prompt: word.text,
      hint: "这个词是什么意思？",
      reading: word.romaji,
      speak: word.text,
      answer: word.meaning,
      options: choices(
        word.meaning,
        kanaWords.map((w) => w.meaning),
        random,
      ),
      explanation: `${word.text}（${word.romaji}）的意思是「${word.meaning}」。`,
    }));
  const targets = shuffle(
    kana.filter((k) => level.rows.includes(k.row)),
    random,
  );
  return Array.from({ length: 10 }, (_, index) => {
    const target = targets[Math.floor(index / 2) % targets.length];
    const text = target[level.script];
    const soundToKana = index % 2 === 0;
    const answer = soundToKana ? text : target.reading;
    const pool = kana
      .filter((k) => k.reading !== target.reading)
      .map((k) => (soundToKana ? k[level.script] : k.reading));
    return {
      id: `${level.id}-${index}`,
      kind: soundToKana ? "sound-to-kana" : "kana-to-sound",
      prompt: soundToKana ? target.reading : text,
      hint: soundToKana ? "选择这个读音对应的假名" : "选择这个假名的读音",
      speak: text,
      answer,
      options: choices(answer, pool, random),
      explanation: `${target.hiragana} / ${target.katakana} 的读音是 ${target.reading}。`,
    };
  });
}
export function resultFor(correct: number, total: number): QuizResult {
  const ratio = total ? correct / total : 0;
  return {
    correct,
    total,
    stars: ratio === 1 ? 3 : ratio >= 0.9 ? 2 : ratio >= 0.8 ? 1 : 0,
  };
}
export function isUnlocked(
  index: number,
  levels: Level[],
  results: Record<string, QuizResult>,
) {
  return index === 0 || (results[levels[index - 1].id]?.stars ?? 0) > 0;
}
