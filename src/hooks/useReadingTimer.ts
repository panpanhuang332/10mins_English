import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { addReadingSeconds, getRecord } from '@/db/records';
import { todayStr } from '@/utils/date';

// §3.1 + DECISIONS.md D11:
// 畫面取得焦點且 App 在前景時,每秒累計;每 10 秒與離開畫面時寫回 DB。
export function useReadingTimer(
  articleId: string | undefined,
  goalMinutes: number,
  onGoalReached: () => void
) {
  const [seconds, setSeconds] = useState(0);
  const unsavedRef = useRef(0);
  const goalFiredRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!articleId) return;

      const date = todayStr();
      const initial = getRecord(date)?.seconds_read ?? 0;
      setSeconds(initial);
      // 進畫面時已達標 → 不再提示
      if (initial >= goalMinutes * 60) goalFiredRef.current = true;

      const flush = () => {
        if (unsavedRef.current > 0) {
          addReadingSeconds(date, articleId, unsavedRef.current);
          unsavedRef.current = 0;
        }
      };

      const interval = setInterval(() => {
        if (AppState.currentState !== 'active') return; // 背景暫停
        unsavedRef.current += 1;
        setSeconds((s) => {
          const next = s + 1;
          if (!goalFiredRef.current && next >= goalMinutes * 60) {
            goalFiredRef.current = true;
            onGoalReached();
          }
          return next;
        });
        if (unsavedRef.current >= 10) flush();
      }, 1000);

      return () => {
        clearInterval(interval);
        flush();
      };
    }, [articleId, goalMinutes, onGoalReached])
  );

  return seconds;
}
