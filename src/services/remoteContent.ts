import Constants from 'expo-constants';
import { Article, Level } from '../types';
import { validateArticle } from './articleValidate';

// M3:App 只打自家 proxy endpoint(§6.2),金鑰不在前端。
// endpoint 設定於 app.json → expo.extra.contentEndpoint;空字串 = 純離線模式。

export function getContentEndpoint(): string | null {
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const url = typeof extra?.contentEndpoint === 'string' ? extra.contentEndpoint.trim() : '';
  return url.length > 0 ? url.replace(/\/$/, '') : null;
}

const FETCH_TIMEOUT_MS = 12000;

export async function fetchRemoteArticle(
  endpoint: string,
  level: Level,
  topic: string,
  date: string
): Promise<Article | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = `${endpoint}/daily?level=${encodeURIComponent(level)}&topic=${encodeURIComponent(
      topic
    )}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return validateArticle(await res.json());
  } catch {
    return null; // 離線/逾時/格式錯誤 → 由呼叫端退回種子內容
  } finally {
    clearTimeout(timer);
  }
}
