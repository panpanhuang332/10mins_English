import { Dictionary, DictEntry, DictLookupResult } from '../types';
import { IRREGULARS } from './irregulars';

// 離線字典(bundled JSON,見 PLAN.md §5.5 與 DECISIONS.md D4)
const dictionary = require('../../assets/dict/dictionary.json') as Dictionary;

/** 把畫面上的 token 清成可查的字(去頭尾標點、小寫) */
export function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z'’-]+/g, ' ')
    .trim()
    .split(' ')[0] ?? '';
}

/** 產生字形還原候選(複數、過去式、進行式、比較級…) */
function stemCandidates(word: string): string[] {
  const c: string[] = [];
  const push = (w: string) => {
    if (w.length >= 2 && !c.includes(w)) c.push(w);
  };

  if (word.endsWith("'s") || word.endsWith('’s')) push(word.slice(0, -2));
  if (word.endsWith('ies')) push(word.slice(0, -3) + 'y');
  if (word.endsWith('es')) push(word.slice(0, -2));
  if (word.endsWith('s')) push(word.slice(0, -1));
  if (word.endsWith('ing')) {
    push(word.slice(0, -3));
    push(word.slice(0, -3) + 'e'); // making → make
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      push(word.slice(0, -4)); // running → run
    }
  }
  if (word.endsWith('ied')) push(word.slice(0, -3) + 'y'); // tried → try
  if (word.endsWith('ed')) {
    push(word.slice(0, -2));
    push(word.slice(0, -1)); // loved → love
    if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) {
      push(word.slice(0, -3)); // stopped → stop
    }
  }
  if (word.endsWith('ier')) push(word.slice(0, -3) + 'y'); // happier → happy
  if (word.endsWith('iest')) push(word.slice(0, -4) + 'y'); // easiest → easy
  if (word.endsWith('er')) {
    push(word.slice(0, -2));
    push(word.slice(0, -1)); // nicer → nice
    if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) {
      push(word.slice(0, -3)); // bigger → big
    }
  }
  if (word.endsWith('est')) {
    push(word.slice(0, -3));
    push(word.slice(0, -2)); // nicest → nice
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      push(word.slice(0, -4)); // biggest → big
    }
  }
  if (word.endsWith('ly')) push(word.slice(0, -2));
  return c;
}

/** 查離線字典:先查原形,再做字形還原 */
export function lookupWord(raw: string): DictLookupResult | null {
  const word = normalizeWord(raw);
  if (!word) return null;

  const direct = dictionary[word];
  if (direct) return { entry: direct, matchedWord: word };

  const irregular = IRREGULARS[word];
  if (irregular && dictionary[irregular]) {
    return { entry: dictionary[irregular], matchedWord: irregular };
  }

  for (const candidate of stemCandidates(word)) {
    const hit = dictionary[candidate];
    if (hit) return { entry: hit, matchedWord: candidate };
  }
  return null;
}

export function getDictionarySize(): number {
  return Object.keys(dictionary).length;
}

export type { DictEntry };
