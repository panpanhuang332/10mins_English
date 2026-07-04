// Daily English 10 — 內容生成 proxy(Cloudflare Worker)
// PLAN.md §6.2:App 只打這個 endpoint,Anthropic API key 只存在 Worker secret,不進前端。
//
// 部署:見 server/README.md
// 端點:GET /daily?level=intermediate&topic=technology&date=2026-07-04

const LEVELS = { beginner: 'A2', intermediate: 'B1', advanced: 'B2' };
const TOPICS = ['technology', 'life', 'business', 'culture', 'science', 'health', 'travel', 'nature'];

function systemPrompt(level, topic, date) {
  return `你是一位替台灣英語學習者撰寫每日閱讀教材的老師。

產出一篇 CEFR ${LEVELS[level]} 等級、主題為 ${topic}、150–200 字的原創英文短文。
以 JSON 回傳,結構如下:

{"id":"${date}","date":"${date}","level":"${level}","topic":"${topic}","title_en":"...","title_zh":"...","sentences":[{"en":"一句英文","zh":"該句自然流暢的繁體中文翻譯"}],"word_count":0,"est_minutes":0,"quiz":[{"q":"...","options":["...","...","...","..."],"answer":0}]}

規則:
1. sentences 逐句對照:每個元素恰好一句英文與其繁體中文(台灣用語)翻譯,10–18 句。
2. 附 3 題單選理解題,每題 4 個選項,answer 為正確選項的 index(0–3),題目必須可由文章內容回答。
3. 用字避免罕見俚語,適合台灣學習者;內容必須原創。
4. word_count 填實際英文字數;est_minutes 填 5–10 的整數。
5. 只回傳 JSON,不要任何多餘說明、不要 markdown 圍欄。`;
}

// 與 App 端 src/services/articleValidate.ts 相同的結構檢查
function isValidArticle(a) {
  if (!a || typeof a !== 'object') return false;
  if (!a.title_en || !a.title_zh) return false;
  if (!Array.isArray(a.sentences) || a.sentences.length < 8 || a.sentences.length > 20) return false;
  if (!a.sentences.every((s) => s && typeof s.en === 'string' && s.en.trim() && typeof s.zh === 'string' && s.zh.trim())) return false;
  if (!Array.isArray(a.quiz) || a.quiz.length !== 3) return false;
  return a.quiz.every(
    (q) =>
      q &&
      typeof q.q === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.answer) &&
      q.answer >= 0 &&
      q.answer <= 3
  );
}

async function generateArticle(env, level, topic, date) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.MODEL || 'claude-sonnet-5',
      max_tokens: 4000,
      temperature: 0.8,
      system: systemPrompt(level, topic, date),
      messages: [{ role: 'user', content: `請產出 ${date} 的每日文章。` }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
  const data = await res.json();
  const text = (data.content?.[0]?.text || '').trim();
  const jsonText = text.startsWith('{') ? text : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const article = JSON.parse(jsonText);
  article.id = date;
  article.date = date;
  article.level = level;
  article.topic = topic;
  article.word_count = article.sentences.reduce(
    (n, s) => n + s.en.split(/\s+/).filter(Boolean).length,
    0
  );
  article.est_minutes = Math.min(10, Math.max(5, Math.round(article.word_count / 25)));
  if (!isValidArticle(article)) throw new Error('invalid article structure');
  return article;
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'GET' || url.pathname !== '/daily') {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    const level = url.searchParams.get('level') || 'intermediate';
    const topic = url.searchParams.get('topic') || 'life';
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    if (!LEVELS[level] || !TOPICS.includes(topic) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(JSON.stringify({ error: 'bad params' }), {
        status: 400,
        headers: { ...CORS, 'content-type': 'application/json' },
      });
    }

    // 以 KV 快取同一天同參數的文章,省 API 成本(綁定名稱:CACHE,選配)
    const cacheKey = `article:${date}:${level}:${topic}`;
    if (env.CACHE) {
      const hit = await env.CACHE.get(cacheKey);
      if (hit) return new Response(hit, { headers: { ...CORS, 'content-type': 'application/json' } });
    }

    try {
      let article;
      try {
        article = await generateArticle(env, level, topic, date);
      } catch {
        article = await generateArticle(env, level, topic, date); // 驗證失敗重試一次
      }
      const body = JSON.stringify(article);
      if (env.CACHE) await env.CACHE.put(cacheKey, body, { expirationTtl: 60 * 60 * 48 });
      return new Response(body, { headers: { ...CORS, 'content-type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 502,
        headers: { ...CORS, 'content-type': 'application/json' },
      });
    }
  },
};
