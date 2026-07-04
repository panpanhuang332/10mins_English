import { DailyRecord } from '../types';
import { addDays, todayStr } from '../utils/date';
import { getDb } from './index';

interface RecordRow {
  date: string;
  seconds_read: number;
  article_id: string;
  completed: number;
  quiz_score: number;
  words_saved: number;
}

function rowToRecord(r: RecordRow): DailyRecord {
  return {
    date: r.date,
    seconds_read: r.seconds_read,
    minutes_read: Math.floor(r.seconds_read / 60),
    article_id: r.article_id,
    completed: r.completed === 1,
    quiz_score: r.quiz_score,
    words_saved: r.words_saved,
  };
}

export function getRecord(date: string): DailyRecord | null {
  const row = getDb().getFirstSync<RecordRow>(
    'SELECT * FROM daily_records WHERE date = ?',
    [date]
  );
  return row ? rowToRecord(row) : null;
}

export function getAllRecords(): DailyRecord[] {
  const rows = getDb().getAllSync<RecordRow>(
    'SELECT * FROM daily_records ORDER BY date ASC'
  );
  return rows.map(rowToRecord);
}

/** 累加當日已讀秒數(計時器每隔一段時間寫回) */
export function addReadingSeconds(date: string, articleId: string, seconds: number): void {
  getDb().runSync(
    `INSERT INTO daily_records (date, seconds_read, article_id)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       seconds_read = seconds_read + excluded.seconds_read,
       article_id = excluded.article_id`,
    [date, seconds, articleId]
  );
}

/** 小測完成 → 標記當日完成(冪等,見 DECISIONS.md D9) */
export function markCompleted(
  date: string,
  articleId: string,
  quizScore: number,
  wordsSaved: number
): void {
  getDb().runSync(
    `INSERT INTO daily_records (date, seconds_read, article_id, completed, quiz_score, words_saved)
     VALUES (?, 0, ?, 1, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       completed = 1,
       article_id = excluded.article_id,
       quiz_score = excluded.quiz_score,
       words_saved = excluded.words_saved`,
    [date, articleId, quizScore, wordsSaved]
  );
}

/** 連續天數:從今天(或昨天)往回數 completed 的連續日 */
export function computeStreak(): number {
  const completedDates = new Set(
    getDb()
      .getAllSync<{ date: string }>('SELECT date FROM daily_records WHERE completed = 1')
      .map((r) => r.date)
  );
  const today = todayStr();
  let cursor = completedDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface TotalStats {
  totalArticles: number;
  totalMinutes: number;
  totalWords: number;
}

export function getTotalStats(): TotalStats {
  const d = getDb();
  const articles =
    d.getFirstSync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM daily_records WHERE completed = 1'
    )?.n ?? 0;
  const seconds =
    d.getFirstSync<{ s: number }>(
      'SELECT COALESCE(SUM(seconds_read), 0) AS s FROM daily_records'
    )?.s ?? 0;
  const words =
    d.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM vocab')?.n ?? 0;
  return {
    totalArticles: articles,
    totalMinutes: Math.floor(seconds / 60),
    totalWords: words,
  };
}
