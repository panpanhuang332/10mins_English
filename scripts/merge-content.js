// 合併 content agents 產出的 batch JSON → assets/content/seed_articles.json + assets/dict/dictionary.json
// 用法: node scripts/merge-content.js <batch1.json> <batch2.json> ...
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('用法: node scripts/merge-content.js <batch1.json> ...');
  process.exit(1);
}

const articles = [];
const dict = {};

for (const f of files) {
  const batch = JSON.parse(fs.readFileSync(f, 'utf8'));
  articles.push(...batch.articles);
  for (const [word, entry] of Object.entries(batch.dictionary)) {
    const key = word.toLowerCase();
    if (!dict[key]) dict[key] = entry; // 先到先贏,避免覆蓋
  }
}

articles.sort((a, b) => a.id.localeCompare(b.id));

// 重新計算 word_count / est_minutes(agents 的估計值不可靠)
for (const a of articles) {
  const wc = a.sentences.reduce(
    (n, s) => n + s.en.split(/\s+/).filter(Boolean).length,
    0
  );
  a.word_count = wc;
  a.est_minutes = Math.min(10, Math.max(5, Math.round(wc / 25)));
}

fs.writeFileSync(
  path.join(root, 'assets/content/seed_articles.json'),
  JSON.stringify(articles, null, 1)
);
fs.writeFileSync(
  path.join(root, 'assets/dict/dictionary.json'),
  JSON.stringify(dict, null, 1)
);

console.log(`合併完成: ${articles.length} 篇文章, ${Object.keys(dict).length} 個字典條目`);
