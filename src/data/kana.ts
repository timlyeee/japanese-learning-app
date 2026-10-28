import { kanaRows } from "./content";

export type Script = "hiragana" | "katakana";
export interface Kana {
  hiragana: string;
  katakana: string;
  reading: string;
  row: number;
}
export const kana: Kana[] = kanaRows.flatMap(
  ([hiragana, katakana, readings], row) =>
    [...hiragana].map((letter, index) => ({
      hiragana: letter,
      katakana: katakana[index],
      reading: readings.split(" ")[index],
      row,
    })),
);
export const kanaGroups = [
  { title: "第一声问候", subtitle: "元音 · あ行", rows: [0] },
  { title: "慢慢找到节奏", subtitle: "か行 · さ行", rows: [1, 2] },
  { title: "再认识十个音", subtitle: "た行 · な行", rows: [3, 4] },
  { title: "把声音连起来", subtitle: "は行 · ま行", rows: [5, 6] },
  {
    title: "清音最后一站",
    subtitle: "や行 · ら行 · わ行 · ん",
    rows: [7, 8, 9],
  },
  {
    title: "声音的小变化",
    subtitle: "浊音 · が行 · ざ行 · だ行",
    rows: [10, 11, 12],
  },
  { title: "带上小圆点", subtitle: "ば行 · ぱ行", rows: [13, 14] },
];
export interface KanaWord {
  text: string;
  kana: string;
  romaji: string;
  meaning: string;
  script: Script;
}
export const kanaWords: KanaWord[] = [
  {
    text: "ねこ",
    kana: "ねこ",
    romaji: "neko",
    meaning: "猫",
    script: "hiragana",
  },
  {
    text: "いぬ",
    kana: "いぬ",
    romaji: "inu",
    meaning: "狗",
    script: "hiragana",
  },
  {
    text: "すし",
    kana: "すし",
    romaji: "sushi",
    meaning: "寿司",
    script: "hiragana",
  },
  {
    text: "みず",
    kana: "みず",
    romaji: "mizu",
    meaning: "水",
    script: "hiragana",
  },
  {
    text: "やま",
    kana: "やま",
    romaji: "yama",
    meaning: "山",
    script: "hiragana",
  },
  {
    text: "そら",
    kana: "そら",
    romaji: "sora",
    meaning: "天空",
    script: "hiragana",
  },
  {
    text: "はな",
    kana: "はな",
    romaji: "hana",
    meaning: "花",
    script: "hiragana",
  },
  {
    text: "あめ",
    kana: "あめ",
    romaji: "ame",
    meaning: "雨",
    script: "hiragana",
  },
  {
    text: "ほし",
    kana: "ほし",
    romaji: "hoshi",
    meaning: "星星",
    script: "hiragana",
  },
  {
    text: "くるま",
    kana: "くるま",
    romaji: "kuruma",
    meaning: "汽车",
    script: "hiragana",
  },
  {
    text: "コーヒー",
    kana: "こーひー",
    romaji: "kōhī",
    meaning: "咖啡",
    script: "katakana",
  },
  {
    text: "パン",
    kana: "ぱん",
    romaji: "pan",
    meaning: "面包",
    script: "katakana",
  },
  {
    text: "ネコ",
    kana: "ねこ",
    romaji: "neko",
    meaning: "猫",
    script: "katakana",
  },
  {
    text: "バス",
    kana: "ばす",
    romaji: "basu",
    meaning: "公交车",
    script: "katakana",
  },
  {
    text: "ホテル",
    kana: "ほてる",
    romaji: "hoteru",
    meaning: "酒店",
    script: "katakana",
  },
  {
    text: "カメラ",
    kana: "かめら",
    romaji: "kamera",
    meaning: "相机",
    script: "katakana",
  },
  {
    text: "テレビ",
    kana: "てれび",
    romaji: "terebi",
    meaning: "电视",
    script: "katakana",
  },
  {
    text: "アイス",
    kana: "あいす",
    romaji: "aisu",
    meaning: "冰淇淋",
    script: "katakana",
  },
  {
    text: "タクシー",
    kana: "たくしー",
    romaji: "takushī",
    meaning: "出租车",
    script: "katakana",
  },
  {
    text: "ケーキ",
    kana: "けーき",
    romaji: "kēki",
    meaning: "蛋糕",
    script: "katakana",
  },
];

export interface Level {
  id: string;
  title: string;
  subtitle: string;
  script: Script;
  rows: number[];
  kind: "kana" | "word";
}
export function levelsFor(script: Script): Level[] {
  return [
    ...kanaGroups.map((group, index) => ({
      ...group,
      id: `${script}-${index}`,
      script,
      kind: "kana" as const,
    })),
    {
      id: `${script}-words`,
      title: "读懂你的第一个词",
      subtitle: "词语 · 看注音选中文",
      script,
      rows: [],
      kind: "word" as const,
    },
  ];
}
