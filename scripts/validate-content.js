// 驗證 assets/content/seed_articles.json 與 assets/dict/dictionary.json
// 檢查:schema、字數、小測、逐句翻譯、字典覆蓋率(PLAN.md §5.1/§5.5/§6.1)
const fs = require('fs');
const path = require('path');
const { lookup } = require('./stem');

const root = path.join(__dirname, '..');
const articles = JSON.parse(
  fs.readFileSync(path.join(root, 'assets/content/seed_articles.json'), 'utf8')
);
const dict = JSON.parse(
  fs.readFileSync(path.join(root, 'assets/dict/dictionary.json'), 'utf8')
);

const errors = [];
const warnings = [];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const hasCJK = (s) => /[一-鿿]/.test(s);

const ids = new Set();
for (const a of articles) {
  const tag = a.id || '(no id)';
  if (ids.has(a.id)) errors.push(`${tag}: 重複 id`);
  ids.add(a.id);
  if (!LEVELS.includes(a.level)) errors.push(`${tag}: level 不合法 (${a.level})`);
  if (!a.topic) errors.push(`${tag}: 缺 topic`);
  if (!a.title_en || !a.title_zh || !hasCJK(a.title_zh)) errors.push(`${tag}: 標題不完整`);

  if (!Array.isArray(a.sentences) || a.sentences.length < 8) {
    errors.push(`${tag}: sentences 太少 (${a.sentences?.length})`);
  } else {
    a.sentences.forEach((s, i) => {
      if (!s.en || !s.en.trim()) errors.push(`${tag}: 第 ${i} 句缺英文`);
      if (!s.zh || !hasCJK(s.zh)) errors.push(`${tag}: 第 ${i} 句缺中文翻譯`);
    });
  }

  const wc = a.sentences.reduce(
    (n, s) => n + s.en.split(/\s+/).filter(Boolean).length,
    0
  );
  if (wc < 140 || wc > 270) warnings.push(`${tag}: 實際字數 ${wc} 超出 150–250 建議範圍`);
  if (Math.abs(wc - a.word_count) > 5) warnings.push(`${tag}: word_count 欄位 (${a.word_count}) 與實際 (${wc}) 不符`);

  if (!Array.isArray(a.quiz) || a.quiz.length !== 3) {
    errors.push(`${tag}: quiz 需 3 題 (實際 ${a.quiz?.length})`);
  } else {
    a.quiz.forEach((q, i) => {
      if (!q.q) errors.push(`${tag}: quiz[${i}] 缺題目`);
      if (!Array.isArray(q.options) || q.options.length !== 4)
        errors.push(`${tag}: quiz[${i}] 需 4 個選項`);
      if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3))
        errors.push(`${tag}: quiz[${i}] answer 不合法 (${q.answer})`);
    });
  }
}

// 字典覆蓋率
const missing = new Map();
let totalTokens = 0;
let hitTokens = 0;
for (const a of articles) {
  const texts = [a.title_en, ...a.sentences.map((s) => s.en)];
  for (const text of texts) {
    for (const raw of text.split(/\s+/)) {
      const norm = raw.toLowerCase().replace(/[^a-z'’-]/g, '');
      if (!norm) continue;
      totalTokens += 1;
      if (lookup(dict, raw)) hitTokens += 1;
      else missing.set(norm, (missing.get(norm) || 0) + 1);
    }
  }
}

console.log(`文章數: ${articles.length}`);
console.log(
  `等級分布: ${LEVELS.map((l) => `${l}=${articles.filter((a) => a.level === l).length}`).join(', ')}`
);
console.log(`字典條目: ${Object.keys(dict).length}`);
console.log(
  `字典覆蓋率: ${hitTokens}/${totalTokens} (${((hitTokens / totalTokens) * 100).toFixed(1)}%)`
);
if (missing.size) {
  console.log(`未覆蓋單字 (${missing.size}): ${[...missing.keys()].sort().join(', ')}`);
}
for (const w of warnings) console.log(`WARN: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  process.exit(1);
}
console.log('驗證通過 ✅');
