# 每天 10 分鐘英文閱讀 App —— 開發計畫書 (Development Spec)

> 版本:v1.0 ｜ 作者:黄國津 (U+9EC4) ｜ 用途:供 Claude Code 依此規格自主開發
> 本文件即專案的「單一事實來源 (single source of truth)」。Claude Code 應把本文件放在 repo 根目錄,並在每個 milestone 前後回讀對照驗收標準。

---

## 0. 給 Claude Code 的執行原則 (務必先讀)

1. **本文件是規格,不是聊天。** 遇到規格未定義處,採用「最小可行、可離線、可測試」原則自行補齊,並在 `DECISIONS.md` 記錄你的選擇與理由。
2. **一次只做一個 Milestone**,每個 Milestone 結束都要能 `expo start` 跑起來、通過該階段驗收標準 (§10),再進下一階段。
3. **禁止過度工程。** MVP 階段不要接雲端、不要做帳號系統、不要接付費。全部本地離線可跑。
4. **每個檔案 < 300 行**;超過就拆模組。狀態管理優先用 React 內建 (Context + useReducer),不要一開始就上 Redux。
5. 每完成一個任務,更新 `PROGRESS.md`(勾選 checklist)並 commit,commit message 格式:`[M<階段>-T<任務>] 說明`。

---

## 1. 專案概述

| 項目 | 內容 |
|---|---|
| 產品名 (暫定) | **Daily English 10** / 中文「每天10分鐘英文閱讀」 |
| 一句話定位 | 用每天一篇 10 分鐘可讀完的雙語短文,把「讀英文」變成像刷牙一樣的日常習慣。 |
| 目標使用者 | 台灣中階英文學習者(多益 400–750 區間)、想維持語感但沒時間讀長文的上班族/學生。 |
| 核心價值 | ①內容夠短(降低啟動門檻)②英中對照+點字即查(降低理解門檻)③連續天數/進度(提供堅持動機)。 |
| 平台 | iOS + Android(單一 codebase),MVP 可先在手機用 Expo Go 直接測。 |
| 商業模式(後期) | 免費每日一篇 + 進階訂閱(客製主題、AI 生成無限篇、離線語音包)。MVP 不實作。 |

### 影片觀察 vs. 規格補完(誠實標註)
本規格核心功能來自對參考影片(Facebook reel,約 39 秒)的逐格分析,**可明確辨識**的是:雙語對照閱讀、每日短篇、單字互動、語音朗讀、進度追蹤。影片中未能逐字看清的細節(如確切排版、配色、次要按鈕),由本規格依同類產品慣例補完並標為「[推定]」。開發前 Eric 可就標為 [推定] 的部分覆寫。

---

## 2. 核心功能總覽 (Feature Map)

```
Daily English 10
├── ① 今日閱讀 (Today)          ← App 主畫面,核心
│    ├── 每日一篇短文 (150–250 字)
│    ├── 英中對照切換 (逐句 / 整篇)
│    ├── 點按單字 → 查詢彈窗 (釋義/詞性/例句/發音)
│    ├── 語音朗讀 (整篇 / 逐句 / 可調語速)
│    ├── 閱讀計時器 (顯示今日已讀分鐘,目標 10 分鐘)
│    └── 讀完 → 3 題理解小測 → 標記完成
├── ② 生字本 (Vocabulary)
│    ├── 收藏的單字清單
│    ├── 間隔複習 (簡化版 SRS:今天/明天/3天/7天)
│    └── 卡片式複習模式
├── ③ 進度 (Progress)
│    ├── 連續天數 (streak) + 日曆熱力圖
│    ├── 累計閱讀篇數 / 分鐘數 / 生字數
│    └── 本週長條圖
└── ④ 設定 (Settings)
     ├── 難度等級 (初/中/高)
     ├── 每日目標分鐘數 (預設 10)
     ├── 語音語速、每日提醒時間
     └── 內容主題偏好 (科技/生活/商業/文化…)
```

MVP(Milestone 0–1)只需交付 ①③ + ② 的收藏功能;SRS 複習與 AI 內容留到後期。

---

## 3. 逐畫面功能規格 (含驗收標準)

### 3.1 今日閱讀 Today(核心畫面)

**佈局(由上到下):**
1. 頂部:日期 + 今日主題標籤 + 右上「語音朗讀 ▶」鈕。
2. 標題 (英文) + 副標 (中文)。
3. 內文區:英文段落。每一句下方可展開中文翻譯(逐句對照);頂部有切換鈕「顯示中文 / 只看英文」。
4. **點按任一英文單字** → 從底部滑出查詢面板 (bottom sheet):單字、KK/IPA 音標、詞性、中文釋義、一句例句、「🔊 發音」、「★ 收藏到生字本」。
5. 底部固定條:閱讀計時器(圓環進度,顯示 `已讀 X:XX / 10:00`)+「讀完了,開始小測 →」鈕。

**行為規格:**
- 計時器在畫面可見且使用者停留時累計(切到背景暫停)。
- 中文翻譯採**逐句對齊**:資料模型中每篇文章存為 `sentences: [{en, zh}]`,前端逐句渲染,才能做逐句對照與逐句朗讀。
- 點字查詢:先查**本地離線字典**(bundled JSON,涵蓋常見 8k–1 萬字);查不到再顯示「查無,長按複製」。MVP 不接線上字典 API。
- 「讀完了」→ 進入 3 題選擇題小測 → 作答後顯示對錯與正確答案 → 「完成今日閱讀 ✅」寫入當日紀錄、streak +1。

**驗收標準:**
- [ ] 能載入當日文章,英中逐句對照可切換。
- [ ] 點任一單字跳出查詢面板,可收藏。
- [ ] 語音可朗讀整篇與逐句,語速可調。
- [ ] 計時器正確累計並在 10 分鐘達標時給提示。
- [ ] 完成小測後正確寫入完成紀錄。

### 3.2 生字本 Vocabulary
- 清單顯示收藏單字(單字 / 釋義 / 來源文章 / 收藏日)。
- 可刪除、可點入看完整卡片、可播發音。
- [Milestone 2] 卡片複習模式:正面英文、翻面中文,標「認識 / 不認識」更新複習排程。
- **驗收:** 收藏的字出現在此清單,可刪可播音。

### 3.3 進度 Progress
- 大數字:目前連續天數 streak。
- 月曆熱力圖:有完成的日子上色(深淺代表閱讀分鐘)。
- 統計卡:累計篇數、累計分鐘、生字數。
- 本週長條圖(用 `chart` 或簡單 `View` 畫)。
- **驗收:** 完成一篇後,streak 與各統計即時更新且重開 App 後仍在(持久化)。

### 3.4 設定 Settings
- 難度等級(影響選文與 AI 生成參數)。
- 每日目標分鐘(預設 10)。
- 每日提醒時間 → 排本地通知 (expo-notifications)。
- 語音語速、主題偏好多選。
- **驗收:** 設定持久化;設定提醒時間後能收到本地通知(可先用「1 分鐘後」測試)。

---

## 4. 技術架構選型

| 層 | 選型 | 理由 |
|---|---|---|
| 框架 | **Expo (React Native) + TypeScript** | 單一 codebase 出 iOS/Android;Expo Go 可即時在真機測,無需先處理原生簽章;最適合 Claude Code 快速迭代。 |
| 導航 | `expo-router` (file-based) | 檔案即路由,結構清楚,Claude Code 好維護。 |
| 狀態 | React Context + `useReducer`(MVP) | 免額外依賴;複雜後再評估 Zustand。 |
| 本地儲存 | `expo-sqlite`(結構化資料) + `AsyncStorage`(設定值) | 文章/生字/進度用 SQLite;偏好設定用 KV。 |
| 語音朗讀 | `expo-speech` | 內建 TTS,離線可用,支援語速。MVP 足夠。 |
| 通知 | `expo-notifications` | 每日提醒。 |
| 圖表 | `react-native-svg` 自繪 或 `react-native-gifted-charts` | 熱力圖與長條圖。優先自繪避免重依賴。 |
| 離線字典 | bundled JSON(見 §6) | 點字即查、離線可用。 |
| 內容來源 | MVP:bundled JSON;後期:Anthropic API 生成(見 §6) | 先離線可跑,再升級動態內容。 |

> **不要**在 MVP 引入:後端伺服器、使用者帳號、雲端資料庫、付費金流、Redux。這些是 Milestone 3+ 的事。

---

## 5. 資料模型 (Schema)

### 5.1 文章 Article (`articles` table / seed JSON)
```jsonc
{
  "id": "2026-07-04",              // 用日期當每日文章 id
  "date": "2026-07-04",
  "level": "intermediate",        // beginner | intermediate | advanced
  "topic": "technology",
  "title_en": "Why Cats Purr",
  "title_zh": "貓為什麼會呼嚕",
  "sentences": [                   // 逐句對照,這是關鍵結構
    { "en": "Cats purr for many reasons.", "zh": "貓咪呼嚕的原因有很多。" },
    { "en": "It is not always about happiness.", "zh": "並不總是因為開心。" }
  ],
  "word_count": 180,
  "est_minutes": 8,
  "quiz": [
    {
      "q": "Why do cats purr according to the article?",
      "options": ["Only when happy", "For many reasons", "Never", "When hungry"],
      "answer": 1
    }
  ]
}
```

### 5.2 生字 VocabItem (`vocab` table)
```jsonc
{
  "id": "uuid",
  "word": "purr",
  "phonetic": "/pɜːr/",
  "pos": "v.",
  "definition_zh": "(貓)發出呼嚕聲",
  "example_en": "The cat purred softly on my lap.",
  "source_article_id": "2026-07-04",
  "created_at": "2026-07-04T06:00:00+08:00",
  "srs_stage": 0,                  // 0=今天 1=明天 2=+3天 3=+7天 4=已熟
  "next_review": "2026-07-05"
}
```

### 5.3 每日紀錄 DailyRecord (`daily_records` table)
```jsonc
{
  "date": "2026-07-04",
  "minutes_read": 11,
  "article_id": "2026-07-04",
  "completed": true,
  "quiz_score": 3,                 // 答對題數
  "words_saved": 4
}
```

### 5.4 設定 Settings (AsyncStorage,單一物件)
```jsonc
{
  "level": "intermediate",
  "daily_goal_minutes": 10,
  "reminder_time": "07:00",
  "speech_rate": 0.9,
  "topics": ["technology", "life", "business"]
}
```

### 5.5 離線字典 dictionary.json(唯讀 bundled)
```jsonc
// key 為小寫單字
{
  "purr": { "phonetic": "/pɜːr/", "pos": "v.", "zh": "發出呼嚕聲", "example": "The cat purred." }
}
```

---

## 6. 內容策略 (Content Pipeline) —— 最關鍵的一環

閱讀 app 的成敗在「每天有沒有新內容可讀」。分兩階段:

### 6.1 MVP:靜態種子內容
- 在 `assets/content/seed_articles.json` 預先放 **30 篇** 分級短文(依 §5.1 結構,含逐句翻譯與 3 題小測)。
- App 依「使用者第幾天」循序取用,先確保 30 天不重複、完全離線可跑。
- Claude Code 可先自行生成這 30 篇種子內容(英中對照 + 小測),放進 JSON。生成時遵守:每篇 150–250 字、逐句翻譯、CEFR B1 為主、主題多元。

### 6.2 後期:AI 動態生成(接 Anthropic API)
- 目的:內容無限、可依 `level` 與 `topics` 客製。
- 架構:**不要把 API key 放進 App**。用一個極輕量 serverless proxy(如 Cloudflare Workers / Vercel Function)代呼 Anthropic API,App 只打自己的 endpoint。
- 生成用的 system prompt 規格(交付時寫成 `content-gen-prompt.md`):
  > 產出一篇 CEFR {level} 等級、主題為 {topic}、150–200 字的英文短文。以 JSON 回傳,結構為 §5.1 的 Article,`sentences` 逐句提供自然流暢的繁體中文翻譯,並附 3 題單選理解題。用字避免罕見俚語,適合台灣學習者。只回 JSON,不要多餘說明。
- 快取:生成後存入本地 SQLite,離線仍可重讀。

> Eric 生態備註:此 proxy 與生成流程可直接沿用你既有的 Claude Code / n8n on GCE 基礎設施;每日排程生成明日文章 → 推播通知。此為 Milestone 3 選配。

---

## 7. UI/UX 設計規格

- **設計語言:** 乾淨、閱讀優先、大留白。閱讀區字級 ≥ 17pt、行高 1.6,長時間閱讀不累。
- **配色[推定]:** 主色一種暖色(如 #E8734A 珊瑚橘,呼應「每日/溫暖習慣」),背景近白 #FAFAF8,文字 #1A1A1A;深色模式必做(閱讀 app 剛需)。
- **導航:** 底部 Tab 四頁:今日 / 生字本 / 進度 / 設定。
- **字型:** 英文用系統 serif 或 `Georgia` 增加閱讀感;中文用系統字。
- **微互動:** 完成今日閱讀時有慶祝動畫(streak +1);點字面板從底部彈出。
- **無障礙:** 支援字級縮放、色彩對比達 WCAG AA。
- 詳細視覺可在 Milestone 1 完成後,交由 `frontend-design` 準則再精修。

---

## 8. 專案檔案結構

```
daily-english-10/
├── PLAN.md                     ← 本文件
├── PROGRESS.md                 ← 任務 checklist(Claude Code 持續更新)
├── DECISIONS.md                ← 規格未定處的決策紀錄
├── app/                        ← expo-router 路由
│   ├── (tabs)/
│   │   ├── index.tsx           ← 今日閱讀
│   │   ├── vocab.tsx
│   │   ├── progress.tsx
│   │   └── settings.tsx
│   ├── quiz.tsx                ← 理解小測
│   └── _layout.tsx
├── src/
│   ├── components/             ← ReaderView, WordSheet, Timer, HeatMap...
│   ├── db/                     ← sqlite 初始化與 queries
│   ├── store/                  ← Context + reducers
│   ├── services/               ← speech, notifications, dictionary, content
│   ├── types/                  ← TS 型別(對應 §5)
│   └── theme/                  ← 顏色/字級/深色模式
├── assets/
│   ├── content/seed_articles.json
│   └── dict/dictionary.json
└── app.json
```

---

## 9. 開發階段規劃 (Milestones)

### Milestone 0 — 專案骨架 (0.5 天)
建 Expo + TS + expo-router 專案,四個 Tab 空殼可切換,主題/深色模式,型別檔,SQLite 初始化,種子 JSON 載入。
**產出可跑:** App 開起來能在四頁間切換。

### Milestone 1 — 核心閱讀 (MVP 主體)
今日閱讀畫面全功能:逐句英中對照、點字查詢面板(接離線字典)、expo-speech 朗讀(整篇/逐句/語速)、閱讀計時器、理解小測、完成寫入 DailyRecord。進度頁 streak + 統計。
**產出可跑:** 能完整讀完一篇、查字、聽朗讀、做小測、看到 streak +1。**這階段完成即是可用的 MVP。**

### Milestone 2 — 生字本與複習
生字本清單、卡片複習、簡化 SRS 排程、進度頁熱力圖與長條圖、設定頁(目標分鐘/語速/主題)、每日提醒通知。
**產出可跑:** 收藏的字可複習、可收到每日提醒。

### Milestone 3 — AI 動態內容(選配)
serverless proxy + Anthropic API 生成每日文章、本地快取、依 level/topic 客製、排程生成。

### Milestone 4 — 上架準備(選配)
icon/splash、隱私政策、EAS Build 出正式包、TestFlight / Play 內測。

---

## 10. 各階段驗收標準 (Definition of Done)

| Milestone | 完成條件 |
|---|---|
| M0 | `npx expo start` 可跑,四 Tab 可切,深色模式正常,SQLite 建表成功,種子 JSON 讀得到。 |
| M1 | 依 §3.1 全部 checkbox 通過;完成一篇後 §3.3 的 streak/統計持久化正確。 |
| M2 | 生字可收藏→複習→更新排程;熱力圖反映實際完成日;每日提醒可觸發。 |
| M3 | App 只打自家 endpoint 即取得符合 §5.1 結構的新文章;離線可重讀快取。 |
| M4 | EAS 能產出可安裝包;冷啟動無 crash;基本隱私政策就緒。 |

---

## 11. Claude Code 啟動指令(建議)

Eric 在 repo 建好後,對 Claude Code 下第一個指令可用:

> 「讀 repo 根目錄的 `PLAN.md`。先執行 Milestone 0:建立 Expo + TypeScript + expo-router 專案骨架,依 §8 的檔案結構、§5 的型別、四個 Tab 空殼、深色模式主題、SQLite 建表與種子 JSON 載入。完成後更新 `PROGRESS.md`、commit,並用 `expo start` 確認可跑,再停下來讓我確認,不要自己接著做 M1。」

之後每個 Milestone 都用同樣節奏:**讀 PLAN → 做一個 M → 自測 → 更新 PROGRESS → commit → 暫停待確認**。

---

## 12. 風險與注意事項

1. **內容版權:** 種子文章請用 AI 生成的原創內容,勿直接抄現成教材或新聞全文,避免侵權。
2. **API key 外洩:** AI 生成階段務必走 proxy,金鑰絕不進前端。
3. **TTS 品質:** `expo-speech` 是系統音,品質尚可但非母語級;若日後要高品質語音,再評估雲端 TTS(屬 M3+ 選配,會需連網與成本)。
4. **離線字典覆蓋率:** 8k–1 萬常見字約可覆蓋 B1 文章 90%+;查不到時給「複製」退路即可,別為此接線上 API 拖慢 MVP。
5. **範圍蔓延:** 嚴守「M1 = 可用 MVP」。帳號、雲端、付費、社群都往後放。

---

*本計畫書結束。修訂請更新頂部版本號。*
