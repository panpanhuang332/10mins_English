import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { initDb } from '@/db';
import { SettingsProvider } from '@/store/settings';
import { useTheme } from '@/theme';

export default function RootLayout() {
  const { dark, colors } = useTheme();

  useEffect(() => {
    try {
      initDb();
    } catch (e) {
      console.warn('SQLite init failed (web 環境可忽略):', e);
    }
  }, []);

  return (
    <SettingsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz" options={{ presentation: 'modal' }} />
        <Stack.Screen name="review" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={dark ? 'light' : 'dark'} />
    </SettingsProvider>
  );
}
