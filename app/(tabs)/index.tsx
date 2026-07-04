import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTodayArticle } from '@/services/content';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';
import { Article } from '@/types';

// M0 殼層:載入當日文章標題,驗證種子 JSON 讀得到(M1 換成完整閱讀畫面)
export default function TodayScreen() {
  const { colors } = useTheme();
  const { settings, ready } = useSettings();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (!ready) return;
    getTodayArticle(settings.level).then(setArticle).catch(console.warn);
  }, [ready, settings.level]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.textSecondary }]}>今日閱讀</Text>
      {article ? (
        <View>
          <Text style={[styles.title, { color: colors.text, fontFamily: serifFont }]}>
            {article.title_en}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {article.title_zh}
          </Text>
        </View>
      ) : (
        <Text style={{ color: colors.textSecondary }}>載入中…</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 14, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 16, marginTop: 6 },
});
