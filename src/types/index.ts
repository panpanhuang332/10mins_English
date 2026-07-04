// 對應 PLAN.md §5 資料模型

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Sentence {
  en: string;
  zh: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number; // 正確選項 index (0-3)
}

// §5.1 文章
export interface Article {
  id: string;
  date?: string;
  level: Level;
  topic: string;
  title_en: string;
  title_zh: string;
  sentences: Sentence[];
  word_count: number;
  est_minutes: number;
  quiz: QuizQuestion[];
}

// §5.2 生字
export interface VocabItem {
  id: string;
  word: string;
  phonetic: string;
  pos: string;
  definition_zh: string;
  example_en: string;
  source_article_id: string;
  created_at: string;
  srs_stage: number; // 0=今天 1=明天 2=+3天 3=+7天 4=已熟
  next_review: string;
}

// §5.3 每日紀錄(DB 以秒儲存,見 DECISIONS.md D3)
export interface DailyRecord {
  date: string;
  minutes_read: number;
  seconds_read: number;
  article_id: string;
  completed: boolean;
  quiz_score: number;
  words_saved: number;
}

// §5.4 設定
export interface Settings {
  level: Level;
  daily_goal_minutes: number;
  reminder_time: string | null; // "HH:mm",null = 未設提醒
  speech_rate: number;
  topics: string[];
}

// §5.5 離線字典條目
export interface DictEntry {
  phonetic: string;
  pos: string;
  zh: string;
  example: string;
}

export type Dictionary = Record<string, DictEntry>;

export interface DictLookupResult {
  entry: DictEntry;
  matchedWord: string; // 實際命中的字典 key(可能是還原後的基本形)
}

export const TOPICS = [
  'technology',
  'life',
  'business',
  'culture',
  'science',
  'health',
  'travel',
  'nature',
] as const;

export const TOPIC_LABELS: Record<string, string> = {
  technology: '科技',
  life: '生活',
  business: '商業',
  culture: '文化',
  science: '科學',
  health: '健康',
  travel: '旅遊',
  nature: '自然',
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '高級',
};
