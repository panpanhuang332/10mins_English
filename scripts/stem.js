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
  if (word.endsWith('er')) {
    push(word.slice(0, -2));
    push(word.slice(0, -1));
  }
  if (word.endsWith('est')) {
    push(word.slice(0, -3));
    push(word.slice(0, -2));
  }
  if (word.endsWith('ly')) push(word.slice(0, -2));
  return c;
}

function lookup(dict, raw) {
  const word = normalizeWord(raw);
  if (!word) return null;
  if (dict[word]) return word;
  for (const cand of stemCandidates(word)) {
    if (dict[cand]) return cand;
  }
  return null;
}

module.exports = { normalizeWord, stemCandidates, lookup };
