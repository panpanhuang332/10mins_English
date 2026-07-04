import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  cancelDailyReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleTestReminder,
} from '@/services/notifications';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { Level, LEVEL_LABELS, TOPICS, TOPIC_LABELS } from '@/types';

const RATE_OPTIONS: { value: number; label: string }[] = [
  { value: 0.7, label: '慢' },
  { value: 0.9, label: '正常' },
  { value: 1.1, label: '快' },
];

// §3.4 設定:難度 / 每日目標分鐘 / 語速 / 主題偏好 / 每日提醒(全部持久化)
export default function SettingsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();

  const [hour, minute] = (settings.reminder_time ?? '07:00').split(':').map(Number);

  const toggleTopic = (topic: string) => {
    const has = settings.topics.includes(topic);
    const next = has ? settings.topics.filter((t) => t !== topic) : [...settings.topics, topic];
    if (next.length === 0) return; // 至少保留一個主題
    updateSettings({ topics: next });
  };

  const setReminder = async (h: number, m: number) => {
    const ok = await requestNotificationPermission();
    if (!ok) {
      Alert.alert('無法設定提醒', '請到系統設定開啟通知權限。');
      return;
    }
    await scheduleDailyReminder(h, m);
    await updateSettings({ reminder_time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
  };

  const adjustReminder = (deltaMinutes: number) => {
    const total = (hour * 60 + minute + deltaMinutes + 1440) % 1440;
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (settings.reminder_time) {
      setReminder(h, m);
    } else {
      updateSettings({ reminder_time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.heading, { color: colors.text }]}>設定</Text>

        <Section title="難度等級">
          <View style={styles.chipRow}>
            {(Object.keys(LEVEL_LABELS) as Level[]).map((lv) => (
              <Chip
                key={lv}
                label={LEVEL_LABELS[lv]}
                active={settings.level === lv}
                onPress={() => updateSettings({ level: lv })}
              />
            ))}
          </View>
        </Section>

        <Section title="每日目標分鐘">
          <View style={styles.stepperRow}>
            <StepBtn label="−" onPress={() => updateSettings({ daily_goal_minutes: Math.max(5, settings.daily_goal_minutes - 5) })} />
            <Text style={[styles.stepValue, { color: colors.text }]}>
              {settings.daily_goal_minutes} 分鐘
            </Text>
            <StepBtn label="＋" onPress={() => updateSettings({ daily_goal_minutes: Math.min(60, settings.daily_goal_minutes + 5) })} />
          </View>
        </Section>

        <Section title="語音語速">
          <View style={styles.chipRow}>
            {RATE_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={settings.speech_rate === o.value}
                onPress={() => updateSettings({ speech_rate: o.value })}
              />
            ))}
          </View>
        </Section>

        <Section title="內容主題偏好">
          <View style={styles.chipRow}>
            {TOPICS.map((t) => (
              <Chip
                key={t}
                label={TOPIC_LABELS[t]}
                active={settings.topics.includes(t)}
                onPress={() => toggleTopic(t)}
              />
            ))}
          </View>
        </Section>

        <Section title="每日提醒">
          <View style={styles.stepperRow}>
            <StepBtn label="−15分" onPress={() => adjustReminder(-15)} wide />
            <Text style={[styles.stepValue, { color: colors.text }]}>
              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </Text>
            <StepBtn label="＋15分" onPress={() => adjustReminder(15)} wide />
          </View>
          <View style={[styles.chipRow, { marginTop: 12 }]}>
            <Chip
              label={settings.reminder_time ? '提醒已開啟 ✓' : '開啟提醒'}
              active={!!settings.reminder_time}
              onPress={() => setReminder(hour, minute)}
            />
            {settings.reminder_time && (
              <Chip
                label="關閉提醒"
                active={false}
                onPress={async () => {
                  await cancelDailyReminder();
                  await updateSettings({ reminder_time: null });
                }}
              />
            )}
            <Chip
              label="測試(1 分鐘後)"
              active={false}
              onPress={async () => {
                const ok = await requestNotificationPermission();
                if (!ok) return;
                await scheduleTestReminder();
                Alert.alert('已排程', '1 分鐘後會收到測試通知。');
              }}
            />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? colors.primary : colors.border },
        active && { backgroundColor: colors.primarySoft },
      ]}
    >
      <Text style={{ color: active ? colors.primary : colors.textSecondary, fontWeight: active ? '700' : '400', fontSize: 14 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function StepBtn({ label, onPress, wide }: { label: string; onPress: () => void; wide?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.stepBtn, wide && styles.stepBtnWide, { backgroundColor: colors.primarySoft }]}
    >
      <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  stepValue: { fontSize: 20, fontWeight: '700', minWidth: 90, textAlign: 'center' },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnWide: { width: 68, borderRadius: 20 },
});
