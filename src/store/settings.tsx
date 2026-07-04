import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Settings } from '../types';

// PLAN.md §5.4:設定存 AsyncStorage(單一物件)
const SETTINGS_KEY = 'settings';

export const DEFAULT_SETTINGS: Settings = {
  level: 'intermediate',
  daily_goal_minutes: 10,
  reminder_time: null,
  speech_rate: 0.9,
  topics: ['technology', 'life', 'business'],
};

interface SettingsContextValue {
  settings: Settings;
  ready: boolean;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  ready: false,
  updateSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        }
      } catch {
        // 讀取失敗 → 用預設值
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, ready, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
