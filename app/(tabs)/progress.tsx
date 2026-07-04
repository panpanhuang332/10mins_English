import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeatMap from '@/components/HeatMap';
import WeekBars from '@/components/WeekBars';
import { computeStreak, getAllRecords, getTotalStats, TotalStats } from '@/db/records';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { DailyRecord } from '@/types';

// §3.3 進度:streak 大數字 + 月曆熱力圖 + 統計卡 + 本週長條圖
export default function ProgressScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<TotalStats>({
    totalArticles: 0,
    totalMinutes: 0,
    totalWords: 0,
  });
  const [records, setRecords] = useState<DailyRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      setStreak(computeStreak());
      setStats(getTotalStats());
      setRecords(getAllRecords());
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.text }]}>進度</Text>

        <View style={[styles.streakCard, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.streakNum, { color: colors.primary }]}>{streak}</Text>
          <Text style={[styles.streakLabel, { color: colors.primary }]}>天連續閱讀 🔥</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="累計篇數" value={String(stats.totalArticles)} />
          <StatCard label="累計分鐘" value={String(stats.totalMinutes)} />
          <StatCard label="收藏生字" value={String(stats.totalWords)} />
        </View>

        {records.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            完成第一篇閱讀後,這裡會開始累積你的紀錄。
          </Text>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <HeatMap
                year={new Date().getFullYear()}
                month={new Date().getMonth() + 1}
                minutesByDate={minutesByDate(records)}
                goalMinutes={settings.daily_goal_minutes}
              />
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <WeekBars
                minutesByDate={minutesByDate(records)}
                goalMinutes={settings.daily_goal_minutes}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function minutesByDate(records: DailyRecord[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of records) map[r.date] = r.minutes_read;
  return map;
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  streakCard: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 28,
    marginBottom: 16,
  },
  streakNum: { fontSize: 64, fontWeight: '800' },
  streakLabel: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingVertical: 18,
  },
  statValue: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
  empty: { marginTop: 24, fontSize: 14, lineHeight: 22 },
});
