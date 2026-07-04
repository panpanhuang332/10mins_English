# DECISIONS — 規格未定處的決策紀錄

> 依 PLAN.md §0-1:規格未定義處採「最小可行、可離線、可測試」原則補齊,並在此記錄。

## D1. 專案根目錄

PLAN §8 的檔案結構以 `daily-english-10/` 為根;本 repo 即為專案專用 repo,故直接以 repo 根目錄作為專案根,結構其餘照 §8。

## D2. 種子文章 id 用 `seed-001`…`seed-030`,不用日期

§5.1 以日期當 id 是針對「每日一篇」的動態內容;§6.1 種子內容是「依使用者第幾天循序取用」,與日曆日期解耦。因此:

- 種子文章 id 為 `seed-001`…`seed-030`,`date` 欄位省略。
- 「第幾天」= 首次使用日(存於 AsyncStorage `first_use_date`)到今天的天數 + 1。
- 依設定的難度過濾後,以 `(dayNumber - 1) % N` 循序取文,保證 30 天內不重複。
- `daily_records` 記錄實際日期與當日文章 id,統計不受影響。

## D3. `daily_records` 以秒儲存閱讀時間

§5.3 的 `minutes_read` 若以分鐘存,累計會有進位誤差。DB 欄位改存 `seconds_read`(INTEGER),TS 層 `DailyRecord.minutes_read` 由秒換算,對外介面仍符合 §5.3。

## D4. 離線字典改為「100% 覆蓋種子文章用字」

§5.5 建議 8k–1 萬常見字的通用字典,但無現成可直接引用且授權明確的繁中資料(引入外部字典檔另有版權與簡繁轉換問題)。MVP 的查字場景只發生在種子文章內,故字典改為涵蓋 30 篇種子文章「全部」用字(含基本字),對實際閱讀情境的覆蓋率為 100%,優於通用 8k 字表。查詢時做字形還原(複數、-ed、-ing、比較級等)後查基本形;查不到仍依 §3.1 顯示「查無此字,長按複製」退路。M3 接 AI 內容時再擴充字典或由生成端同步產出字典條目。

## D5. `expo install` 無法使用,版本改由 `bundledNativeModules.json` 對齊

開發環境的 HTTPS proxy 擋掉 Expo API(`expo install` 回 Forbidden),npm registry 正常。故依 `expo@57` 套件內附的 `bundledNativeModules.json` 手動釘選各原生套件版本,效果等同 `expo install`。

## D6. 圖表全部自繪

熱力圖與本週長條圖用純 `View` 繪製;只有計時器圓環用 `react-native-svg`。避免引入 chart 套件(§4「優先自繪避免重依賴」)。

## D7. MVP 不建 `articles` 資料表

§5.1 標示「articles table / seed JSON」二擇一;MVP 內容全來自 bundled JSON,SQLite 只建 `vocab` 與 `daily_records`。M3 快取 AI 生成文章時再加表。

## D8. 生字 id 產生方式

不引入 uuid 套件,以 `Date.now() + 隨機字串` 組成,本地單機唯一性足夠。

## D9. 小測入口與路由

小測為獨立路由 `/quiz?id=<articleId>`(modal 呈現),作答完才寫入完成紀錄;重複進入同一天的小測不會重複 +1 streak(以 `daily_records.completed` 冪等判斷)。

## D10. 朗讀實作

`expo-speech` 不支援佇列,整篇朗讀以「逐句 onDone 串接」實作,並以 token 機制支援中途停止;逐句朗讀時高亮當前句 [推定]。語速直接使用設定值(預設 0.9)。

## D11. 計時規則

計時器以 1 秒 tick 累計,條件:今日 Tab 取得焦點(useFocusEffect)且 App 在前景(AppState === 'active')。每 10 秒與畫面離開時寫回 DB,避免高頻寫入。達每日目標分鐘時提示一次(當日不重複提示)。

## D12. web 平台的 SQLite stub

`expo-sqlite` 的 web 支援需要額外的 wasm/metro 設定,且本產品目標平台是 iOS/Android(§1)。故以 platform-specific module(`src/db/adapter.web.ts`)在 web 提供空操作 stub:web 僅作 UI 預覽/打包驗證用,資料功能在原生平台完整運作。
