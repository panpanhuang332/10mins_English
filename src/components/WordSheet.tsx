import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { addVocab, findVocabByWord } from '@/db/vocab';
import { lookupWord, normalizeWord } from '@/services/dictionary';
import { speakOnce } from '@/services/speech';
import { useSettings } from '@/store/settings';
import { serifFont, useTheme } from '@/theme';

interface Props {
  word: string | null; // 使用者點按的原始 token;null = 關閉
  articleId: string;
  onClose: () => void;
  onSaved?: () => void;
}

// §3.1:點按單字 → 底部滑出查詢面板(離線字典;可發音、可收藏)
export default function WordSheet({ word, articleId, onClose, onSaved }: Props) {
  const { colors } = useTheme();
  const { settings } = useSettings();
  const [saved, setSaved] = useState(false);

  const result = word ? lookupWord(word) : null;
  const displayWord = result?.matchedWord ?? (word ? normalizeWord(word) || word : '');

  useEffect(() => {
    if (word && result) {
      setSaved(!!findVocabByWord(result.matchedWord));
    } else {
      setSaved(false);
    }
  }, [word]);

  const handleSave = () => {
    if (!result || saved) return;
    addVocab({
      word: result.matchedWord,
      phonetic: result.entry.phonetic,
      pos: result.entry.pos,
      definition_zh: result.entry.zh,
      example_en: result.entry.example,
      source_article_id: articleId,
    });
    setSaved(true);
    onSaved?.();
  };

  return (
    <Modal visible={word !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.word, { color: colors.text, fontFamily: serifFont }]} selectable>
          {displayWord}
        </Text>
        {result ? (
          <>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {result.entry.phonetic}   {result.entry.pos}
            </Text>
            <Text style={[styles.def, { color: colors.text }]}>{result.entry.zh}</Text>
            {!!result.entry.example && (
              <Text style={[styles.example, { color: colors.zhText, fontFamily: serifFont }]}>
                “{result.entry.example}”
              </Text>
            )}
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, { backgroundColor: colors.primarySoft }]}
                onPress={() => speakOnce(displayWord, settings.speech_rate)}
              >
                <Ionicons name="volume-high" size={18} color={colors.primary} />
                <Text style={[styles.btnText, { color: colors.primary }]}>發音</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.btn,
                  { backgroundColor: saved ? colors.border : colors.primary },
                ]}
                onPress={handleSave}
                disabled={saved}
              >
                <Ionicons
                  name={saved ? 'checkmark' : 'star-outline'}
                  size={18}
                  color={saved ? colors.textSecondary : '#FFF'}
                />
                <Text style={[styles.btnText, { color: saved ? colors.textSecondary : '#FFF' }]}>
                  {saved ? '已收藏' : '收藏到生字本'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={[styles.def, { color: colors.textSecondary }]}>
            查無此字。可長按上方單字複製後自行查詢。
          </Text>
        )}
      </View>
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
  word: { fontSize: 30, fontWeight: '700' },
  meta: { fontSize: 15, marginTop: 4 },
  def: { fontSize: 17, marginTop: 12, lineHeight: 26 },
  example: { fontSize: 15, marginTop: 8, fontStyle: 'italic', lineHeight: 23 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  btnText: { fontSize: 15, fontWeight: '600' },
});
