import { kana, kanaWords, katakanaOrigins, type Level } from "../data/kana";
import type { Card } from "../types";
export interface Question {
  id: string;
  kind:
    | "sound-to-kana"
    | "kana-to-sound"
    | "word"
    | "card-meaning"
    | "card-reading"
    | "card-choice";
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
  return Array.from({ length: 15 }, (_, index) => {
    const target = targets[index % targets.length];
    const text = target[level.script];
    const soundToKana =
      level.script === "katakana" ? index % 4 === 3 : index % 2 === 0;
    const answer = soundToKana ? text : target.reading;
    const pool = kana
      .filter((k) => k.reading !== target.reading)
      .map((k) => (soundToKana ? k[level.script] : k.reading));
    const origin =
      level.script === "katakana" ? katakanaOrigins[text] : undefined;
    return {
      id: `${level.id}-${index}`,
      kind: soundToKana ? "sound-to-kana" : "kana-to-sound",
      prompt: soundToKana ? target.reading : text,
      hint: soundToKana ? "选择这个读音对应的假名" : "选择这个假名的读音",
      speak: text,
      answer,
      options: choices(answer, pool, random),
      explanation: origin
        ? `${target.hiragana} / ${target.katakana} 的读音是 ${target.reading}。${text} 来自汉字「${origin.source}」：${origin.story}`
        : `${target.hiragana} / ${target.katakana} 的读音是 ${target.reading}。`,
    };
  });
}

function strings(items: (string | undefined)[]): string[] {
  return items.filter((item): item is string => typeof item === "string");
}

export function questionsFromCards(
  cards: Card[],
  pool: Card[] = cards,
  random = Math.random,
): Question[] {
  const questions: Question[] = [];
  for (const card of cards) {
    questions.push({
      id: `${card.id}-meaning`,
      kind: "card-meaning",
      prompt: card.front,
      hint:
        card.kind === "grammar"
          ? "这个句型表示什么？"
          : card.kind === "dialogue"
            ? "这句话是什么意思？"
            : "这个词是什么意思？",
      speak: card.example ?? card.front,
      answer: card.back,
      options: choices(card.back, strings(pool.map((c) => c.back)), random),
      explanation: card.note
        ? `「${card.front}」的意思是「${card.back}」。${card.note}`
        : `「${card.front}」的意思是「${card.back}」。`,
    });
    if (card.reading) {
      questions.push({
        id: `${card.id}-reading`,
        kind: "card-reading",
        prompt: card.front,
        hint: "这个读音（罗马音）是什么？",
        speak: card.front,
        answer: card.reading,
        options: choices(
          card.reading,
          strings(pool.map((c) => c.reading)),
          random,
        ),
        explanation: `「${card.front}」读作 ${card.reading}。`,
      });
    }
    if (card.example) {
      questions.push({
        id: `${card.id}-example`,
        kind: "card-choice",
        prompt: card.front,
        hint:
          card.kind === "grammar"
            ? "哪个例句正确体现了这个句型？"
            : "哪个例句正确使用了这个词？",
        speak: card.example,
        answer: card.example,
        options: choices(
          card.example,
          strings(pool.map((c) => c.example)),
          random,
        ),
        explanation: `「${card.example}」${card.exampleMeaning ? `（${card.exampleMeaning}）` : ""}。`,
      });
    }
  }
  return shuffle(questions, random);
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
