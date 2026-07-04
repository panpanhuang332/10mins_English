import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

// M0 殼層(M2 換成完整生字本)
export default function VocabScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>生字本</Text>
      <Text style={{ color: colors.textSecondary }}>收藏的單字會出現在這裡。</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
});
