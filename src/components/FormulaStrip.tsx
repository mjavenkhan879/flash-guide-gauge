import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { FORMULA_H } from '../constants/config';

type Props = { text: string; tone?: 'formula' | 'quiz' };

/** ASCII only — no arrows or chevrons, they fall back to tofu on Android (rule #15). */
export function FormulaStrip({ text, tone = 'formula' }: Props) {
  const quiz = tone === 'quiz';
  return (
    <View
      style={[
        styles.strip,
        quiz
          ? { backgroundColor: 'rgba(255,224,102,0.08)', borderColor: 'rgba(255,224,102,0.26)' }
          : { backgroundColor: 'rgba(179,136,255,0.07)', borderColor: 'rgba(179,136,255,0.18)' },
      ]}>
      <Text
        style={[styles.text, { color: quiz ? THEME.colors.accent.flash : THEME.colors.text.soft }]}
        numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    minHeight: FORMULA_H,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: { fontSize: 11.5, fontWeight: '600', lineHeight: 16, textAlign: 'center' },
});

export default FormulaStrip;
