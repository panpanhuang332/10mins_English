import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

// M0 佔位(M2 實作卡片複習模式)
export default function ReviewScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>卡片複習(M2 實作)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
