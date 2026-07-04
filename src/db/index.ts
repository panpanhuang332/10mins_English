import { DbLike, openDatabase } from './adapter';

let db: DbLike | null = null;

export function getDb(): DbLike {
  if (!db) {
    db = openDatabase('daily_english_10.db');
  }
  return db;
}

export function initDb(): void {
  const d = getDb();
  d.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS vocab (
      id TEXT PRIMARY KEY,
      word TEXT NOT NULL,
      phonetic TEXT NOT NULL DEFAULT '',
      pos TEXT NOT NULL DEFAULT '',
      definition_zh TEXT NOT NULL DEFAULT '',
      example_en TEXT NOT NULL DEFAULT '',
      source_article_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      srs_stage INTEGER NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_records (
      date TEXT PRIMARY KEY,
      seconds_read INTEGER NOT NULL DEFAULT 0,
      article_id TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0,
      quiz_score INTEGER NOT NULL DEFAULT 0,
      words_saved INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_vocab_next_review ON vocab(next_review);
    CREATE INDEX IF NOT EXISTS idx_vocab_word ON vocab(word);
  `);
}
