// 與 src/services/dictionary.ts 相同的字形還原邏輯(Node 版,供內容驗證用)

function normalizeWord(raw) {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z'’-]+/g, ' ')
    .trim()
    .split(' ')[0];
  return cleaned || '';
}

function stemCandidates(word) {
  const c = [];
  const push = (w) => {
    if (w.length >= 2 && !c.includes(w)) c.push(w);
  };
  if (word.endsWith("'s") || word.endsWith('’s')) push(word.slice(0, -2));
  if (word.endsWith('ies')) push(word.slice(0, -3) + 'y');
  if (word.endsWith('es')) push(word.slice(0, -2));
  if (word.endsWith('s')) push(word.slice(0, -1));
  if (word.endsWith('ing')) {
    push(word.slice(0, -3));
    push(word.slice(0, -3) + 'e');
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      push(word.slice(0, -4));
    }
  }
  if (word.endsWith('ied')) push(word.slice(0, -3) + 'y');
  if (word.endsWith('ed')) {
    push(word.slice(0, -2));
    push(word.slice(0, -1));
    if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) {
      push(word.slice(0, -3));
    }
  }
  if (word.endsWith('ier')) push(word.slice(0, -3) + 'y');
  if (word.endsWith('iest')) push(word.slice(0, -4) + 'y');
  if (word.endsWith('er')) {
    push(word.slice(0, -2));
    push(word.slice(0, -1));
    if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) {
      push(word.slice(0, -3));
    }
  }
  if (word.endsWith('est')) {
    push(word.slice(0, -3));
    push(word.slice(0, -2));
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      push(word.slice(0, -4));
    }
  }
  if (word.endsWith('ly')) push(word.slice(0, -2));
  return c;
}

// 與 src/services/irregulars.ts 同步的不規則變化表
const IRREGULARS_TS = require('fs').readFileSync(
  require('path').join(__dirname, '../src/services/irregulars.ts'),
  'utf8'
);
const IRREGULARS = {};
for (const m of IRREGULARS_TS.matchAll(/([a-z]+):\s*'([a-z]+)'/g)) {
  IRREGULARS[m[1]] = m[2];
}

function lookup(dict, raw) {
  const word = normalizeWord(raw);
  if (!word) return null;
  if (dict[word]) return word;
  if (IRREGULARS[word] && dict[IRREGULARS[word]]) return IRREGULARS[word];
  for (const cand of stemCandidates(word)) {
    if (dict[cand]) return cand;
  }
  return null;
}

module.exports = { normalizeWord, stemCandidates, lookup };
