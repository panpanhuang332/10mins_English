import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { speakOnce } from '@/services/speech';
import { SRS_STAGE_LABELS } from '@/services/srs';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';
import { VocabItem } from '@/types';

interface Props {
  item: VocabItem | null;
  onClose: () => void;
}

// §3.2:點入看完整卡片
export default function VocabDetail({ item, onClose }: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();

  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      {item && (
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.wordRow}>
            <Text style={[styles.word, { color: colors.text, fontFamily: serifFont }]}>
              {item.word}
            </Text>
            <Pressable hitSlop={8} onPress={() => speakOnce(item.word, settings.speech_rate)}>
              <Ionicons name="volume-high" size={26} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {item.phonetic}   {item.pos}
          </Text>
          <Text style={[styles.def, { color: colors.text }]}>{item.definition_zh}</Text>
          {!!item.example_en && (
            <Text style={[styles.example, { color: colors.zhText, fontFamily: serifFont }]}>
              “{item.example_en}”
            </Text>
          )}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.footText, { color: colors.textSecondary }]}>
              {SRS_STAGE_LABELS[item.srs_stage] ?? ''}
            </Text>
            <Text style={[styles.footText, { color: colors.textSecondary }]}>
              收藏於 {item.created_at.slice(0, 10)}・來自 {item.source_article_id}
            </Text>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    paddingBottom: 40,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 16 },
  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  word: { fontSize: 32, fontWeight: '700' },
  meta: { fontSize: 15, marginTop: 4 },
  def: { fontSize: 18, marginTop: 12, lineHeight: 27 },
  example: { fontSize: 15, marginTop: 10, fontStyle: 'italic', lineHeight: 23 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 20,
    paddingTop: 12,
    gap: 4,
  },
  footText: { fontSize: 12 },
});
