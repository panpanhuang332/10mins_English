import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { addDays, todayStr } from '@/utils/date';

interface Props {
  minutesByDate: Record<string, number>;
  goalMinutes: number;
}

const BAR_MAX_HEIGHT = 96;

// §3.3:本週長條圖(週一起算,自繪)
export default function WeekBars({ minutesByDate, goalMinutes }: Props) {
  const { colors } = useTheme();
  const today = todayStr();
  const dow = new Date().getDay(); // 0=日
  const monday = addDays(today, dow === 0 ? -6 : 1 - dow);

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  const maxMinutes = Math.max(goalMinutes, ...days.map((d) => minutesByDate[d] ?? 0));

  return (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>本週閱讀分鐘</Text>
      <View style={styles.chart}>
        {days.map((d, i) => {
          const minutes = minutesByDate[d] ?? 0;
          const h = minutes > 0 ? Math.max(4, (minutes / maxMinutes) * BAR_MAX_HEIGHT) : 2;
          const reached = minutes >= goalMinutes;
          const isToday = d === today;
          return (
            <View key={d} style={styles.col}>
              <Text style={[styles.value, { color: colors.textSecondary }]}>
                {minutes > 0 ? minutes : ''}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: h,
                    backgroundColor:
                      minutes > 0 ? (reached ? colors.success : colors.primary) : colors.border,
                  },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  { color: isToday ? colors.primary : colors.textSecondary },
                  isToday && styles.labelToday,
                ]}
              >
                {labels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 40,
  },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  value: { fontSize: 10, marginBottom: 3 },
  bar: { width: 18, borderRadius: 6 },
  label: { fontSize: 12, marginTop: 6 },
  labelToday: { fontWeight: '700' },
});
