import * as Speech from 'expo-speech';

// expo-speech 不支援佇列,整篇朗讀以逐句 onDone 串接(DECISIONS.md D10)

let playToken = 0; // 遞增 token:停止/重新播放時讓舊回呼失效

export interface ArticlePlayback {
  onSentence?: (index: number) => void;
  onDone?: () => void;
}

export function stopSpeaking(): void {
  playToken += 1;
  Speech.stop();
}

export function speakOnce(text: string, rate: number, onDone?: () => void): void {
  stopSpeaking();
  const token = playToken;
  Speech.speak(text, {
    language: 'en-US',
    rate,
    onDone: () => {
      if (token === playToken) onDone?.();
    },
    onStopped: () => {},
    onError: () => {
      if (token === playToken) onDone?.();
    },
  });
}

/** 從指定句開始逐句朗讀整篇 */
export function speakArticle(
  sentences: string[],
  rate: number,
  startIndex: number,
  callbacks: ArticlePlayback
): void {
  stopSpeaking();
  const token = playToken;

  const speakAt = (i: number) => {
    if (token !== playToken) return;
    if (i >= sentences.length) {
      callbacks.onDone?.();
      return;
    }
    callbacks.onSentence?.(i);
    Speech.speak(sentences[i], {
      language: 'en-US',
      rate,
      onDone: () => speakAt(i + 1),
      onError: () => speakAt(i + 1),
    });
  };

  speakAt(startIndex);
}
