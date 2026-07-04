// 原生平台(iOS/Android):使用 expo-sqlite
// web 平台由 adapter.web.ts 提供 stub(見 DECISIONS.md D12)
import * as SQLite from 'expo-sqlite';

export interface DbLike {
  execSync(sql: string): void;
  runSync(sql: string, params?: SQLite.SQLiteBindParams): void;
  getFirstSync<T>(sql: string, params?: SQLite.SQLiteBindParams): T | null;
  getAllSync<T>(sql: string, params?: SQLite.SQLiteBindParams): T[];
}

export function openDatabase(name: string): DbLike {
  return SQLite.openDatabaseSync(name);
}
