import { VocabItem } from '../types';
import { todayStr } from '../utils/date';
import { getDb } from './index';
import { initialSrs, nextSrs } from '../services/srs';

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface NewVocab {
  word: string;
  phonetic: string;
  pos: string;
  definition_zh: string;
  example_en: string;
  source_article_id: string;
}

export function addVocab(v: NewVocab): VocabItem {
  const srs = initialSrs();
  const item: VocabItem = {
    id: newId(),
    ...v,
    word: v.word.toLowerCase(),
    created_at: new Date().toISOString(),
    ...srs,
  };
  getDb().runSync(
    `INSERT INTO vocab (id, word, phonetic, pos, definition_zh, example_en, source_article_id, created_at, srs_stage, next_review)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.word,
      item.phonetic,
      item.pos,
      item.definition_zh,
      item.example_en,
      item.source_article_id,
      item.created_at,
      item.srs_stage,
      item.next_review,
    ]
  );
  return item;
}

export function listVocab(): VocabItem[] {
  const rows = getDb().getAllSync<VocabItem>(
    'SELECT * FROM vocab ORDER BY created_at DESC'
  );
  return rows;
}

export function deleteVocab(id: string): void {
  getDb().runSync('DELETE FROM vocab WHERE id = ?', [id]);
}

export function findVocabByWord(word: string): VocabItem | null {
  return (
    getDb().getFirstSync<VocabItem>('SELECT * FROM vocab WHERE word = ?', [
      word.toLowerCase(),
    ]) ?? null
  );
}

/** 今天(含之前)到期、尚未熟練的字 */
export function listDueVocab(): VocabItem[] {
  return getDb().getAllSync<VocabItem>(
    'SELECT * FROM vocab WHERE next_review <= ? AND srs_stage < 4 ORDER BY next_review ASC',
    [todayStr()]
  );
}

export function countSavedFromArticle(articleId: string): number {
  return (
    getDb().getFirstSync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM vocab WHERE source_article_id = ?',
      [articleId]
    )?.n ?? 0
  );
}

/** 複習作答後更新 SRS 排程 */
export function reviewVocab(id: string, known: boolean): void {
  const item = getDb().getFirstSync<VocabItem>('SELECT * FROM vocab WHERE id = ?', [id]);
  if (!item) return;
  const next = nextSrs(item.srs_stage, known);
  getDb().runSync('UPDATE vocab SET srs_stage = ?, next_review = ? WHERE id = ?', [
    next.srs_stage,
    next.next_review,
    id,
  ]);
}
