import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

// M0 佔位(M1 實作 3 題理解小測)
export default function QuizScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>理解小測(M1 實作)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
