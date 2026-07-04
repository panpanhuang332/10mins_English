import { Article } from '../types';

// 遠端文章的執行期結構檢查(與 server/worker.js 的 isValidArticle 同步)
export function validateArticle(a: unknown): Article | null {
  if (!a || typeof a !== 'object') return null;
  const x = a as Record<string, unknown>;

  if (typeof x.id !== 'string' || !x.id) return null;
  if (typeof x.title_en !== 'string' || !x.title_en) return null;
  if (typeof x.title_zh !== 'string' || !x.title_zh) return null;
  if (x.level !== 'beginner' && x.level !== 'intermediate' && x.level !== 'advanced') return null;
  if (typeof x.topic !== 'string' || !x.topic) return null;

  const sentences = x.sentences;
  if (!Array.isArray(sentences) || sentences.length < 8 || sentences.length > 20) return null;
  for (const s of sentences) {
    if (!s || typeof s.en !== 'string' || !s.en.trim()) return null;
    if (typeof s.zh !== 'string' || !s.zh.trim()) return null;
  }

  const quiz = x.quiz;
  if (!Array.isArray(quiz) || quiz.length !== 3) return null;
  for (const q of quiz) {
    if (!q || typeof q.q !== 'string' || !q.q) return null;
    if (!Array.isArray(q.options) || q.options.length !== 4) return null;
    if (!q.options.every((o: unknown) => typeof o === 'string')) return null;
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) return null;
  }

  return x as unknown as Article;
}
