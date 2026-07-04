import { addDays, todayStr } from '../utils/date';

// PLAN.md §5.2:簡化版 SRS
// stage 0=今天 1=明天 2=+3天 3=+7天 4=已熟
export const SRS_MAX_STAGE = 4;

const STAGE_OFFSET_DAYS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
};

export const SRS_STAGE_LABELS: Record<number, string> = {
  0: '今天複習',
  1: '明天複習',
  2: '3 天後複習',
  3: '7 天後複習',
  4: '已熟',
};

/** 複習後計算新的 stage 與下次複習日 */
export function nextSrs(currentStage: number, known: boolean): {
  srs_stage: number;
  next_review: string;
} {
  const today = todayStr();
  if (!known) {
    return { srs_stage: 0, next_review: today };
  }
  const stage = Math.min(currentStage + 1, SRS_MAX_STAGE);
  if (stage >= SRS_MAX_STAGE) {
    // 已熟:排到遠期,不再出現在到期清單
    return { srs_stage: SRS_MAX_STAGE, next_review: addDays(today, 3650) };
  }
  return { srs_stage: stage, next_review: addDays(today, STAGE_OFFSET_DAYS[stage]) };
}

/** 新收藏的字:今天即可複習 */
export function initialSrs(): { srs_stage: number; next_review: string } {
  return { srs_stage: 0, next_review: todayStr() };
}
