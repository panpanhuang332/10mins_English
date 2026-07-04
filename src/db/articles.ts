import { Article } from '../types';
import { validateArticle } from '../services/articleValidate';
import { getDb } from './index';

// M3:AI 生成文章的本地快取(§6.2「生成後存入本地 SQLite,離線仍可重讀」)

export function getCachedArticle(date: string): Article | null {
  const row = getDb().getFirstSync<{ json: string }>(
    'SELECT json FROM article_cache WHERE date = ?',
    [date]
  );
  if (!row) return null;
  try {
    return validateArticle(JSON.parse(row.json));
  } catch {
    return null;
  }
}

export function cacheArticle(date: string, article: Article): void {
  getDb().runSync(
    `INSERT INTO article_cache (date, article_id, json)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET article_id = excluded.article_id, json = excluded.json`,
    [date, article.id, JSON.stringify(article)]
  );
}
