import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

interface Props {
  year: number;
  month: number; // 1–12
  minutesByDate: Record<string, number>; // 'YYYY-MM-DD' -> 分鐘
  goalMinutes: number;
}

// §3.3:月曆熱力圖,深淺代表閱讀分鐘(自繪,DECISIONS.md D6)
export default function HeatMap({ year, month, minutesByDate, goalMinutes }: Props) {
  const { colors } = useTheme();
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // 0=日

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const intensity = (day: number): number => {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const minutes = minutesByDate[key] ?? 0;
    if (minutes <= 0) return 0;
    return Math.min(1, minutes / goalMinutes);
  };

  const cellColor = (v: number): string => {
    if (v === 0) return 'transparent';
    if (v < 0.34) return colors.primary + '44';
    if (v < 0.67) return colors.primary + '88';
    if (v < 1) return colors.primary + 'CC';
    return colors.primary;
  };

  return (
    <View>
      <Text style={[styles.title, { color: colors.text }]}>
        {year} 年 {month} 月
      </Text>
      <View style={styles.weekHeader}>
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <Text key={d} style={[styles.weekday, { color: colors.textSecondary }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, i) => (
          <View key={i} style={styles.cellWrap}>
            {day !== null && (
              <View
                style={[
                  styles.cell,
                  { borderColor: colors.border, backgroundColor: cellColor(intensity(day)) },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: intensity(day) >= 0.67 ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {day}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  weekHeader: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  cell: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 11 },
});
