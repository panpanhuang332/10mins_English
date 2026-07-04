import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimerRing from '@/components/TimerRing';
import SentenceRow from '@/components/SentenceRow';
import WordSheet from '@/components/WordSheet';
import { getRecord } from '@/db/records';
import { useReadingTimer } from '@/hooks/useReadingTimer';
import { getTodayArticle } from '@/services/content';
import { speakArticle, speakOnce, stopSpeaking } from '@/services/speech';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';
import { Article, LEVEL_LABELS, TOPIC_LABELS } from '@/types';
import { formatDateHuman, formatSeconds, todayStr } from '@/utils/date';

const RATES = [0.7, 0.9, 1.1];
const RATE_LABELS: Record<number, string> = { 0.7: '慢', 0.9: '正常', 1.1: '快' };

export default function TodayScreen() {
  const { colors } = useTheme();
  const { settings, ready, updateSettings } = useSettings();
  const [article, setArticle] = useState<Article | null>(null);
  const [showZh, setShowZh] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [activeSentence, setActiveSentence] = useState<number>(-1);
  const [tappedWord, setTappedWord] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!ready) return;
    getTodayArticle(settings.level, settings.topics).then(setArticle).catch(console.warn);
  }, [ready, settings.level, settings.topics]);

  useFocusEffect(
    useCallback(() => {
      setCompleted(getRecord(todayStr())?.completed ?? false);
      return () => stopSpeaking();
    }, [])
  );

  const onGoal = useCallback(() => {
    Alert.alert('達標 🎉', `今天已閱讀滿 ${settings.daily_goal_minutes} 分鐘,繼續保持!`);
  }, [settings.daily_goal_minutes]);

  const seconds = useReadingTimer(article?.id, settings.daily_goal_minutes, onGoal);
  const goalSeconds = settings.daily_goal_minutes * 60;

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary, padding: 20 }}>載入中…</Text>
      </SafeAreaView>
    );
  }

  const stopAll = () => {
    stopSpeaking();
    setPlaying(false);
    setActiveSentence(-1);
  };

  const playWholeArticle = () => {
    if (playing) {
      stopAll();
      return;
    }
    setPlaying(true);
    speakArticle(
      article.sentences.map((s) => s.en),
      settings.speech_rate,
      0,
      {
        onSentence: setActiveSentence,
        onDone: () => {
          setPlaying(false);
          setActiveSentence(-1);
        },
      }
    );
  };

  const playSentence = (i: number) => {
    stopSpeaking();
    setPlaying(false);
    setActiveSentence(i);
    speakOnce(article.sentences[i].en, settings.speech_rate, () => setActiveSentence(-1));
  };

  const cycleRate = () => {
    const idx = RATES.indexOf(settings.speech_rate);
    const next = RATES[(idx + 1) % RATES.length] ?? 0.9;
    updateSettings({ speech_rate: next });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {formatDateHuman(todayStr())}
          </Text>
          <View style={[styles.tag, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>
              {TOPIC_LABELS[article.topic] ?? article.topic}・{LEVEL_LABELS[article.level]}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={cycleRate} style={[styles.rateChip, { borderColor: colors.border }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {RATE_LABELS[settings.speech_rate] ?? `${settings.speech_rate}x`}
            </Text>
          </Pressable>
          <Pressable onPress={playWholeArticle} hitSlop={8} accessibilityLabel="朗讀整篇">
            <Ionicons
              name={playing ? 'stop-circle' : 'play-circle'}
              size={38}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text, fontFamily: serifFont }]}>
          {article.title_en}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{article.title_zh}</Text>

        <Pressable
          onPress={() => setShowZh((v) => !v)}
          style={[styles.zhToggle, { borderColor: colors.border }]}
        >
          <Ionicons
            name={showZh ? 'eye' : 'eye-off'}
            size={15}
            color={colors.textSecondary}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {showZh ? '顯示中文' : '只看英文'}
          </Text>
        </Pressable>

        {article.sentences.map((s, i) => (
          <SentenceRow
            key={i}
            sentence={s}
            index={i}
            showZh={showZh}
            isActive={i === activeSentence}
            onWordPress={setTappedWord}
            onPlaySentence={playSentence}
          />
        ))}
        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TimerRing
          size={56}
          strokeWidth={5}
          progress={seconds / goalSeconds}
          label={formatSeconds(seconds)}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            已讀 {formatSeconds(seconds)} / {settings.daily_goal_minutes}:00
          </Text>
          <Pressable
            style={[styles.quizBtn, { backgroundColor: completed ? colors.success : colors.primary }]}
            onPress={() => {
              stopAll();
              router.push({ pathname: '/quiz', params: { id: article.id } });
            }}
          >
            <Text style={styles.quizBtnText}>
              {completed ? '今日已完成 ✅ 再測一次' : '讀完了,開始小測 →'}
            </Text>
          </Pressable>
        </View>
      </View>

      <WordSheet
        word={tappedWord}
        articleId={article.id}
        onClose={() => setTappedWord(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  date: { fontSize: 14 },
  tag: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 12, fontWeight: '600' },
  rateChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scroll: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 8 },
  subtitle: { fontSize: 16, marginTop: 4, marginBottom: 12 },
  zhToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 16,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quizBtn: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quizBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
