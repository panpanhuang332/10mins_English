import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

// M0 殼層(M1 換成 streak + 統計)
export default function ProgressScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>進度</Text>
      <Text style={{ color: colors.textSecondary }}>連續天數與統計會出現在這裡。</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});
