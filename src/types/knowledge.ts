export type KnowledgeCardFormat = "post" | "article" | "video" | "mixed";

export interface KnowledgeCard {
  id: string;
  ownerId: string;
  currentRevisionId: string;
  status: "draft" | "published" | "archived";
  visibility: "public" | "unlisted" | "private";
  createdAt: number;
  updatedAt: number;
}

export interface RichTextBlock {
  id: string;
  type: "rich-text";
  text: string;
}

export interface KanaGridBlock {
  id: string;
  type: "kana-grid";
  script: "hiragana" | "katakana";
  entries: Array<{
    glyph: string;
    reading: string;
  }>;
}

export interface CalloutBlock {
  id: string;
  type: "callout";
  text: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  assetId: string;
  alt: string;
  caption?: string;
}

export interface VideoBlock {
  id: string;
  type: "video";
  assetId: string;
  posterAssetId?: string;
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export type ContentBlock =
  RichTextBlock | KanaGridBlock | CalloutBlock | ImageBlock | VideoBlock;

export interface CardRevision {
  id: string;
  cardId: string;
  version: number;
  format: KnowledgeCardFormat;
  title: string;
  summary: string;
  blocks: ContentBlock[];
  quizBundleIds: string[];
  studyItemIds: string[];
  publishedAt?: number;
}

export interface StudyDeck {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  sourceCardIds: string[];
  studyItemIds: string[];
}

export interface KnowledgeFeedEntry {
  card: KnowledgeCard;
  revision: CardRevision;
}
