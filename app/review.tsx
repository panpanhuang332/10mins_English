import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { listDueVocab, reviewVocab } from '@/db/vocab';
import { speakOnce } from '@/services/speech';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';

// §3.2 [M2]:卡片複習模式 — 正面英文、翻面中文,認識/不認識更新 SRS 排程
export default function ReviewScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [queue] = useState(() => listDueVocab());
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const done = index >= queue.length;
  const card = done ? null : queue[index];

  const answer = (known: boolean) => {
    if (!card) return;
    reviewVocab(card.id, known);
    if (known) setKnownCount((n) => n + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  if (queue.length === 0 || done) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.emoji}>{queue.length === 0 ? '🎉' : '✅'}</Text>
        <Text style={[styles.doneTitle, { color: colors.text }]}>
          {queue.length === 0 ? '目前沒有到期的生字' : '複習完成!'}
        </Text>
        {queue.length > 0 && (
          <Text style={[styles.doneSub, { color: colors.textSecondary }]}>
            認識 {knownCount} / {queue.length} 個字
          </Text>
        )}
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryBtnText}>返回生字本</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.progress, { color: colors.textSecondary }]}>
        {index + 1} / {queue.length}
      </Text>

      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setFlipped((f) => !f)}
      >
        {!flipped ? (
          <>
            <Text style={[styles.word, { color: colors.text, fontFamily: serifFont }]}>
              {card!.word}
            </Text>
            <Text style={[styles.phonetic, { color: colors.textSecondary }]}>
              {card!.phonetic}
            </Text>
            <Pressable
              hitSlop={12}
              onPress={() => speakOnce(card!.word, settings.speech_rate)}
              style={styles.speakBtn}
            >
              <Ionicons name="volume-high" size={26} color={colors.primary} />
            </Pressable>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>點卡片看解釋</Text>
          </>
        ) : (
          <>
            <Text style={[styles.pos, { color: colors.textSecondary }]}>{card!.pos}</Text>
            <Text style={[styles.def, { color: colors.text }]}>{card!.definition_zh}</Text>
            {!!card!.example_en && (
              <Text style={[styles.example, { color: colors.zhText, fontFamily: serifFont }]}>
                “{card!.example_en}”
              </Text>
            )}
          </>
        )}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={[styles.answerBtn, { backgroundColor: colors.danger }]}
          onPress={() => answer(false)}
        >
          <Text style={styles.answerText}>不認識</Text>
        </Pressable>
        <Pressable
          style={[styles.answerBtn, { backgroundColor: colors.success }]}
          onPress={() => answer(true)}
        >
          <Text style={styles.answerText}>認識</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  progress: { textAlign: 'center', fontSize: 14, marginTop: 12 },
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    padding: 24,
  },
  word: { fontSize: 40, fontWeight: '700' },
  phonetic: { fontSize: 18, marginTop: 8 },
  speakBtn: { marginTop: 16 },
  hint: { position: 'absolute', bottom: 20, fontSize: 12 },
  pos: { fontSize: 16 },
  def: { fontSize: 26, fontWeight: '600', marginTop: 10, textAlign: 'center', lineHeight: 38 },
  example: { fontSize: 16, marginTop: 16, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 14 },
  answerBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  answerText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  emoji: { fontSize: 56, marginBottom: 12 },
  doneTitle: { fontSize: 22, fontWeight: '700' },
  doneSub: { fontSize: 15, marginTop: 8 },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 28,
  },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
