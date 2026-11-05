import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import type { LucideIcon } from './ScreenHeader';

type Props = {
  Icon: LucideIcon;
  title: string;
  formula: string;
  body: string;
  accent: string;
  sprite: ImageSourcePropType;
};

/** The sprite sits at a positive inset so it can never poke out of the rounded corner (rule #18). */
export function LessonCard({ Icon, title, formula, body, accent, sprite }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
          <Icon size={22} color={accent} strokeWidth={1.5} />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.formulaWrap}>
        <Text style={styles.formula} numberOfLines={2}>
          {formula}
        </Text>
      </View>
      <Text style={styles.body} numberOfLines={3}>
        {body}
      </Text>
      <Image source={sprite} style={styles.sprite} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    backgroundColor: THEME.colors.bg.secondary,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 18,
    color: THEME.colors.text.primary,
  },
  formulaWrap: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,224,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,224,102,0.20)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    maxWidth: '78%',
  },
  formula: {
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 16,
    color: THEME.colors.accent.flash,
    fontVariant: ['tabular-nums'],
  },
  body: {
    marginTop: 8,
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 17,
    color: THEME.colors.text.secondary,
    maxWidth: '80%',
  },
  sprite: { position: 'absolute', right: 12, bottom: 12, width: 52, height: 52, opacity: 0.9 },
});

export default LessonCard;
