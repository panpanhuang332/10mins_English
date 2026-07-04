import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VocabDetail from '@/components/VocabDetail';
import { deleteVocab, listDueVocab, listVocab } from '@/db/vocab';
import { speakOnce } from '@/services/speech';
import { SRS_STAGE_LABELS } from '@/services/srs';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';
import { VocabItem } from '@/types';

// §3.2 生字本:清單(字/釋義/來源/日期)、可刪、可播音、可點入看卡片、複習入口
export default function VocabScreen() {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [items, setItems] = useState<VocabItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [selected, setSelected] = useState<VocabItem | null>(null);

  const reload = useCallback(() => {
    setItems(listVocab());
    setDueCount(listDueVocab().length);
  }, []);

  useFocusEffect(reload);

  const confirmDelete = (item: VocabItem) => {
    Alert.alert('刪除生字', `確定要刪除「${item.word}」嗎?`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          deleteVocab(item.id);
          reload();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>生字本</Text>
        <Pressable
          style={[
            styles.reviewBtn,
            { backgroundColor: dueCount > 0 ? colors.primary : colors.border },
          ]}
          disabled={dueCount === 0}
          onPress={() => router.push('/review')}
        >
          <Ionicons name="albums" size={16} color={dueCount > 0 ? '#FFF' : colors.textSecondary} />
          <Text style={[styles.reviewText, { color: dueCount > 0 ? '#FFF' : colors.textSecondary }]}>
            複習 {dueCount > 0 ? `(${dueCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            閱讀時點按單字並收藏,生字會出現在這裡。
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.wordRow}>
                <Text style={[styles.word, { color: colors.text, fontFamily: serifFont }]}>
                  {item.word}
                </Text>
                <Text style={[styles.stage, { color: colors.textSecondary }]}>
                  {SRS_STAGE_LABELS[item.srs_stage] ?? ''}
                </Text>
              </View>
              <Text style={[styles.def, { color: colors.zhText }]} numberOfLines={1}>
                {item.pos} {item.definition_zh}
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {item.created_at.slice(0, 10)}・來自 {item.source_article_id}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => speakOnce(item.word, settings.speech_rate)}
              style={styles.iconBtn}
            >
              <Ionicons name="volume-medium" size={20} color={colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => confirmDelete(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={19} color={colors.textSecondary} />
            </Pressable>
          </Pressable>
        )}
      />

      <VocabDetail item={selected} onClose={() => setSelected(null)} />
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
    paddingVertical: 12,
  },
  heading: { fontSize: 24, fontWeight: '700' },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reviewText: { fontSize: 14, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 48, fontSize: 14, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  wordRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  word: { fontSize: 19, fontWeight: '700' },
  stage: { fontSize: 11 },
  def: { fontSize: 14, marginTop: 3 },
  meta: { fontSize: 11, marginTop: 3 },
  iconBtn: { paddingHorizontal: 6, paddingVertical: 8 },
});
