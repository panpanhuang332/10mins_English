# PROGRESS — Daily English 10

> 依 PLAN.md §9 的 Milestone 逐項勾選;每完成一個任務即 commit。

## Milestone 0 — 專案骨架

- [x] [M0-T1] Expo + TypeScript + expo-router 專案設定(package.json / app.json / tsconfig / babel)
- [x] [M0-T2] 型別檔(§5)、主題(含深色模式)、日期工具
- [x] [M0-T3] SQLite 初始化(vocab / daily_records 建表)與 DB 查詢模組
- [x] [M0-T4] 服務層骨架(content / dictionary / speech / srs)與 Settings store
- [x] [M0-T5] 四個 Tab 空殼可切換 + 種子 JSON 載入驗證
- [x] [M0-驗收] `npx tsc --noEmit` 通過、`expo export` 可打包、四 Tab 可切、深色模式正常

## Milestone 1 — 核心閱讀(MVP 主體)

- [x] [M1-T1] 今日閱讀畫面:逐句英中對照、顯示中文/只看英文切換
- [x] [M1-T2] 點字查詢面板(bottom sheet,接離線字典,可收藏)
- [x] [M1-T3] expo-speech 朗讀:整篇 / 逐句 / 語速可調
- [x] [M1-T4] 閱讀計時器(前景累計、圓環進度、10 分鐘達標提示)
- [x] [M1-T5] 3 題理解小測 → 完成寫入 DailyRecord
- [x] [M1-T6] 進度頁:streak 大數字 + 累計統計(持久化)
- [ ] [M1-驗收] §3.1 全部 checkbox 通過;完成一篇後 streak/統計持久化正確(程式完成,待 Expo Go 真機驗證)

## Milestone 2 — 生字本與複習

- [x] [M2-T1] 生字本清單(字/釋義/來源/日期,可刪、可播音)
- [x] [M2-T2] 卡片複習模式(翻面、認識/不認識)+ 簡化 SRS 排程
- [x] [M2-T3] 進度頁月曆熱力圖 + 本週長條圖
- [x] [M2-T4] 設定頁:難度 / 每日目標分鐘 / 語速 / 主題偏好(持久化)
- [x] [M2-T5] 每日提醒本地通知(expo-notifications)
- [ ] [M2-驗收] 收藏的字可複習並更新排程;熱力圖反映實際完成日;提醒可觸發(程式完成,待 Expo Go 真機驗證)

## 內容(§6.1)

- [x] [C-T1] 30 篇分級種子文章(英中逐句對照 + 3 題小測)
- [x] [C-T2] 離線字典(涵蓋種子文章 100% 用字)
- [x] [C-T3] 內容驗證腳本(schema / 字數 / 字典覆蓋率)

## Milestone 3 — AI 動態內容(選配,未開始)

## Milestone 4 — 上架準備(選配,未開始)
