import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheArticle, getCachedArticle } from '../db/articles';
import { Article, Level } from '../types';
import { diffDays, todayStr } from '../utils/date';
import { fetchRemoteArticle, getContentEndpoint } from './remoteContent';

// 內容來源:遠端 AI 生成(M3,有設 endpoint 時)→ SQLite 快取 → 種子內容 fallback(§6.1)
const seedArticles = require('../../assets/content/seed_articles.json') as Article[];

const FIRST_USE_KEY = 'first_use_date';

export function getAllArticles(): Article[] {
  return seedArticles;
}

export function getArticleById(id: string): Article | null {
  const seed = seedArticles.find((a) => a.id === id);
  if (seed) return seed;
  // AI 生成文章的 id = 日期(§5.1)→ 從快取找
  try {
    return getCachedArticle(id);
  } catch {
    return null;
  }
}

/** 使用者第幾天(首次開啟 = 第 1 天) */
export async function getDayNumber(): Promise<number> {
  let first = await AsyncStorage.getItem(FIRST_USE_KEY);
  if (!first) {
    first = todayStr();
    await AsyncStorage.setItem(FIRST_USE_KEY, first);
  }
  return diffDays(first, todayStr()) + 1;
}

/** 依難度過濾後循序取用,30 天內不重複 */
export function pickArticleForDay(level: Level, dayNumber: number): Article {
  const byLevel = seedArticles.filter((a) => a.level === level);
  const pool = byLevel.length > 0 ? byLevel : seedArticles;
  const index = (dayNumber - 1) % pool.length;
  return pool[index];
}

export async function getTodayArticle(level: Level, topics: string[] = []): Promise<Article> {
  const day = await getDayNumber();
  const endpoint = getContentEndpoint();

  if (endpoint) {
    const today = todayStr();
    // 1) 當日快取(離線可重讀)
    try {
      const cached = getCachedArticle(today);
      if (cached) return cached;
    } catch {
      // 快取不可用(如 web stub)→ 繼續
    }
    // 2) 打自家 endpoint,依偏好主題輪替
    const topic = topics.length > 0 ? topics[(day - 1) % topics.length] : 'life';
    const remote = await fetchRemoteArticle(endpoint, level, topic, today);
    if (remote) {
      try {
        cacheArticle(today, remote);
      } catch {
        // 快取失敗不影響閱讀
      }
      return remote;
    }
  }

  // 3) fallback:種子內容循序取用
  return pickArticleForDay(level, day);
}
