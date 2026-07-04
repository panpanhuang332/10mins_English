// web 預覽用 stub:App 目標平台是 iOS/Android,web 不載入 expo-sqlite
// (避免 wa-sqlite.wasm 打包問題;資料功能在 web 上為空操作)

export interface DbLike {
  execSync(sql: string): void;
  runSync(sql: string, params?: unknown[]): void;
  getFirstSync<T>(sql: string, params?: unknown[]): T | null;
  getAllSync<T>(sql: string, params?: unknown[]): T[];
}

export function openDatabase(_name: string): DbLike {
  return {
    execSync: () => {},
    runSync: () => {},
    getFirstSync: () => null,
    getAllSync: <T>() => [] as T[],
  };
}
