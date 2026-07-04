import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { reading, serifFont, useTheme } from '@/theme';
import { Sentence } from '@/types';

interface Props {
  sentence: Sentence;
  index: number;
  showZh: boolean;
  isActive: boolean; // 朗讀中的句子高亮
  onWordPress: (word: string) => void;
  onPlaySentence: (index: number) => void;
}

// §3.1:逐句英中對照;點按任一英文單字可查詢;每句可單獨朗讀
function SentenceRow({
  sentence,
  index,
  showZh,
  isActive,
  onWordPress,
  onPlaySentence,
}: Props) {
  const { colors } = useTheme();
  const tokens = sentence.en.split(/\s+/).filter(Boolean);

  return (
    <View
      style={[
        styles.row,
        isActive && { backgroundColor: colors.primarySoft, borderRadius: 8 },
      ]}
    >
      <View style={styles.enRow}>
        <Text
          style={[
            styles.en,
            { color: colors.text, fontFamily: serifFont },
          ]}
        >
          {tokens.map((token, i) => (
            <Text key={i} onPress={() => onWordPress(token)} suppressHighlighting>
              {token}
              {i < tokens.length - 1 ? ' ' : ''}
            </Text>
          ))}
        </Text>
        <Pressable
          onPress={() => onPlaySentence(index)}
          hitSlop={8}
          style={styles.playBtn}
          accessibilityLabel={`朗讀第 ${index + 1} 句`}
        >
          <Ionicons
            name={isActive ? 'volume-high' : 'volume-medium-outline'}
            size={16}
            color={isActive ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>
      {showZh && (
        <Text style={[styles.zh, { color: colors.zhText }]}>{sentence.zh}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 14, paddingHorizontal: 4, paddingVertical: 2 },
  enRow: { flexDirection: 'row', alignItems: 'flex-start' },
  en: {
    flex: 1,
    fontSize: reading.fontSize,
    lineHeight: reading.lineHeight,
  },
  playBtn: { paddingLeft: 8, paddingTop: 6 },
  zh: {
    fontSize: reading.zhFontSize,
    lineHeight: reading.zhLineHeight,
    marginTop: 2,
  },
});

export default memo(SentenceRow);
