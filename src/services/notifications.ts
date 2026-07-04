import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// §3.4:每日提醒時間 → 本地通知
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'daily-reminder';

async function ensureChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '每日閱讀提醒',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

const REMINDER_CONTENT = {
  title: '該讀今天的 10 分鐘英文了 📖',
  body: '每天一篇短文,讓英文變成日常習慣。',
};

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  await ensureChannel();
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    content: REMINDER_CONTENT,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

/** 驗收用:1 分鐘後測試通知(PLAN.md §3.4) */
export async function scheduleTestReminder(): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: { ...REMINDER_CONTENT, title: '測試提醒 🔔' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
