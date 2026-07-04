# Daily English 10 — 內容生成 Proxy

PLAN.md §6.2 的 serverless proxy:App 只打這個 endpoint,**Anthropic API key 絕不進前端**。

## 部署(Cloudflare Workers)

```bash
cd server
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # 貼上你的 API key
npx wrangler deploy
```

部署後得到 `https://daily-english-10-content.<account>.workers.dev`。

## 接上 App

在 repo 根目錄 `app.json` 填入:

```jsonc
"extra": { "contentEndpoint": "https://daily-english-10-content.<account>.workers.dev" }
```

留空字串 = 純離線模式(只用 30 篇種子文章)。App 端流程(`src/services/content.ts`):

1. 先查 SQLite 快取(當日文章離線可重讀)。
2. 快取沒有 → 打 `GET {endpoint}/daily?level=&topic=&date=`,驗證結構後寫入快取。
3. 取失敗(離線/伺服器掛)→ 自動退回種子文章,App 永遠可用。

## 端點

`GET /daily?level=intermediate&topic=technology&date=2026-07-04`

回傳 §5.1 的 Article JSON。參數不合法回 400;生成/驗證失敗(重試一次後)回 502。

## 成本備註

- 預設模型 `claude-sonnet-5`;要省成本可在 wrangler.toml 設 `MODEL = "claude-haiku-4-5-20251001"`。
- 建議開 KV 快取(見 wrangler.toml),同一天同參數只生成一次。
- 可用 Cloudflare Cron Trigger 每日預生成明日文章(選配,搭配推播另計)。
