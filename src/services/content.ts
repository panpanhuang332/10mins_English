import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article, Level } from '../types';
import { diffDays, todayStr } from '../utils/date';

// MVP:bundled 種子內容(PLAN.md §6.1;id 規則見 DECISIONS.md D2)
const seedArticles = require('../../assets/content/seed_articles.json') as Article[];

const FIRST_USE_KEY = 'first_use_date';

export function getAllArticles(): Article[] {
  return seedArticles;
}

export function getArticleById(id: string): Article | null {
  return seedArticles.find((a) => a.id === id) ?? null;
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

export async function getTodayArticle(level: Level): Promise<Article> {
  const day = await getDayNumber();
  return pickArticleForDay(level, day);
}
