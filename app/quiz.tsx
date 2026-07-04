import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { computeStreak, markCompleted } from '@/db/records';
import { countSavedFromArticle } from '@/db/vocab';
import { getArticleById } from '@/services/content';
import { useTheme } from '@/theme';
import { todayStr } from '@/utils/date';

// §3.1:讀完 → 3 題理解小測 → 顯示對錯 → 完成今日閱讀,寫入當日紀錄
export default function QuizScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = getArticleById(id ?? '');

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (finished) {
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    }
  }, [finished]);

  if (!article) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>找不到文章</Text>
      </View>
    );
  }

  const question = article.quiz[qIndex];
  const isLast = qIndex === article.quiz.length - 1;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === question.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (isLast) {
      const finalScore = score;
      markCompleted(todayStr(), article.id, finalScore, countSavedFromArticle(article.id));
      setStreak(computeStreak());
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
          <Text style={styles.celebrate}>🎉</Text>
          <Text style={[styles.doneTitle, { color: colors.text }]}>完成今日閱讀 ✅</Text>
          <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
            答對 {score} / {article.quiz.length} 題
          </Text>
          <View style={[styles.streakBox, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.streakNum, { color: colors.primary }]}>{streak}</Text>
            <Text style={{ color: colors.primary, fontSize: 14 }}>天連續閱讀 🔥</Text>
          </View>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryBtnText}>回到今日</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.progress, { color: colors.textSecondary }]}>
        理解小測 {qIndex + 1} / {article.quiz.length}
      </Text>
      <Text style={[styles.question, { color: colors.text }]}>{question.q}</Text>

      {question.options.map((opt, i) => {
        const isCorrect = selected !== null && i === question.answer;
        const isWrongPick = selected === i && i !== question.answer;
        return (
          <Pressable
            key={i}
            onPress={() => choose(i)}
            style={[
              styles.option,
              { borderColor: colors.border, backgroundColor: colors.card },
              isCorrect && { borderColor: colors.success, backgroundColor: colors.success + '22' },
              isWrongPick && { borderColor: colors.danger, backgroundColor: colors.danger + '22' },
            ]}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
            {isCorrect && <Text style={{ color: colors.success, fontWeight: '700' }}>✓ 正解</Text>}
            {isWrongPick && <Text style={{ color: colors.danger, fontWeight: '700' }}>✗</Text>}
          </Pressable>
        );
      })}

      {selected !== null && (
        <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={next}>
          <Text style={styles.primaryBtnText}>{isLast ? '完成 ✅' : '下一題 →'}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  progress: { fontSize: 14, marginBottom: 12 },
  question: { fontSize: 20, fontWeight: '700', lineHeight: 30, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: { fontSize: 16, flex: 1, marginRight: 8, lineHeight: 23 },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  celebrate: { fontSize: 64, marginBottom: 12 },
  doneTitle: { fontSize: 24, fontWeight: '700' },
  doneSub: { fontSize: 16, marginTop: 8 },
  streakBox: {
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 24,
  },
  streakNum: { fontSize: 44, fontWeight: '800' },
});
