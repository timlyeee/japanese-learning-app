export interface Word {
  id: number;
  text: string;
  reading: string;
  meaning: string;
  example: string;
  translation: string;
}
export type CardKind = "word" | "grammar" | "dialogue";
export interface Card {
  id: string;
  kind: CardKind;
  front: string;
  back: string;
  reading?: string;
  example?: string;
  exampleMeaning?: string;
  note?: string;
}
export interface Course {
  id: number;
  title: string;
  description: string;
  symbol: string;
  dialogue: string;
  grammar: string;
  cards: Card[];
}
export interface Review {
  level: number;
  due: number;
}
export interface ApiConfig {
  baseUrl: string;
  model: string;
}
export interface Progress {
  quiz: Record<string, import("./lib/quiz").QuizResult>;
  done: number[];
  reviews: Record<number, Review>;
  days: string[];
  config: ApiConfig;
}
export interface Message {
  role: "user" | "assistant";
  content: string;
}
export type ModuleId = "japanese";
export interface Module {
  id: ModuleId;
  name: string;
  description: string;
  symbol: string;
}
export type Page = "home" | "courses" | "kana" | "words" | "chat" | "settings";
