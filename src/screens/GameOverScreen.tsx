import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { ASSETS } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { Stat, StatRow } from '../components/StatCard';
import { THEME } from '../constants/theme';
import { explainSolve } from '../game/recipes';
import type { ResultSummary } from '../game/recipes';
import { scoreVerdict } from '../game/quiz';
import { Units, distanceUnitLabel, formatAperture, formatDistance, formatEv } from '../utils/format';

type Props = {
  summary: ResultSummary;
  units: Units;
  onPlayAgain: () => void;
  onMenu: () => void;
};

type TileProps = { label: string; value: string; highlight: boolean };

function ResultTile({ label, value, highlight }: TileProps) {
  return (
    <View
      style={[
        styles.tile,
        highlight
          ? { borderColor: 'rgba(255,224,102,0.45)', backgroundColor: 'rgba(255,224,102,0.08)' }
          : null,
      ]}>
      <Text style={styles.tileLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[
          styles.tileValue,
          { color: highlight ? THEME.colors.accent.flash : THEME.colors.text.primary },
        ]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/** The discrete result screen — rule #12. Reached from the solver, never skipped. */
export function GameOverScreen({ summary, units, onPlayAgain, onMenu }: Props) {
  const burst = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const quiz = summary.kind === 'quiz';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(burst, {
        toValue: 1,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(burst, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    Animated.spring(card, {
      toValue: 1,
      tension: 110,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [burst, card]);

  const unit = distanceUnitLabel(units);
  const lines = explainSolve(
    {
      id: 'x',
      name: summary.name,
      gn: summary.gn,
      distance: summary.distance,
      aperture: summary.aperture,
      iso: summary.iso,
      powerLabel: summary.powerLabel,
      modifier: summary.modifier,
      solved: summary.solved,
    },
    summary.stopsLost,
    summary.gnEff,
    units,
  );

  const stats: Stat[] = [
    {
      key: 'recipes',
      value: String(summary.recipeCount + (quiz ? 0 : 1)),
      label: 'RECIPES',
      valueColor: THEME.colors.accent.primary,
    },
    { key: 'ev', value: formatEv(summary.ev), label: 'EV', valueColor: THEME.colors.accent.cool },
  ];
  if (summary.stopsLost > 0) {
    stats.push({
      key: 'lost',
      value: summary.stopsLost.toFixed(1),
      label: 'STOPS LOST',
      valueColor: THEME.colors.accent.flash,
    });
  }
  if (quiz && summary.quizCorrect !== undefined) {
    stats.push({
      key: 'score',
      value: summary.quizCorrect + '/' + (summary.quizTotal || 10),
      label: 'SCORE',
      valueColor: THEME.colors.accent.flash,
    });
  }

  const cardScale = card.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const burstOpacity = burst.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
  const heading = quiz ? 'RUN COMPLETE' : 'RECIPE SAVED';
  const title = quiz
    ? scoreVerdict({ correct: summary.quizCorrect || 0, total: summary.quizTotal || 10 })
    : summary.name;

  return (
    <AppBackground variant="result">
      <ScreenHeader title={heading} />

      <Animated.View
        pointerEvents="box-none"
        style={[styles.body, { opacity: card, transform: [{ scale: cardScale }] }]}>
        <View style={styles.hero}>
          <Image source={ASSETS.sprite1} style={styles.heroSprite} resizeMode="contain" />
          <Text style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.heroSub} numberOfLines={1}>
            {'GN ' + summary.gn + ' · POWER ' + summary.powerLabel + ' · ' + summary.modifier.toUpperCase()}
          </Text>
        </View>

        <View style={styles.tileGrid}>
          <View style={styles.tileRow}>
            <View style={styles.tileSlot}>
              <ResultTile
                label="DISTANCE"
                value={formatDistance(summary.distance, units) + ' ' + unit}
                highlight={summary.solved === 'distance'}
              />
            </View>
            <View style={styles.tileSlot}>
              <ResultTile
                label="APERTURE"
                value={'f/' + formatAperture(summary.aperture)}
                highlight={summary.solved === 'aperture'}
              />
            </View>
          </View>
          <View style={styles.tileRow}>
            <View style={styles.tileSlot}>
              <ResultTile
                label="SENSITIVITY"
                value={'ISO ' + Math.round(summary.iso)}
                highlight={summary.solved === 'iso'}
              />
            </View>
            <View style={styles.tileSlot}>
              <ResultTile label="POWER" value={summary.powerLabel} highlight={false} />
            </View>
          </View>
        </View>

        <View style={styles.statWrap}>
          <StatRow stats={stats} />
        </View>

        <View style={styles.explain}>
          <Text style={styles.explainHead} numberOfLines={1}>
            HOW THIS WAS SOLVED
          </Text>
          {lines.map((line, i) => (
            <Text key={'l' + i} style={styles.explainLine} numberOfLines={2}>
              {line}
            </Text>
          ))}
        </View>
      </Animated.View>

      <View style={styles.actions}>
        <Text style={styles.hint} numberOfLines={1}>
          EVERY ANSWER CARRIES ITS FORMULA
        </Text>
        <PrimaryButton
          label="SOLVE AGAIN"
          Icon={Zap}
          onPress={onPlayAgain}
          gradient={THEME.gradients.flash}
          shadowColor={THEME.colors.accent.flash}
        />
        <View style={styles.secondary}>
          <SecondaryButton label="LIGHT KIT" onPress={onMenu} />
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[styles.burst, { opacity: burstOpacity }]} />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },
  hero: { alignItems: 'center', paddingBottom: 12 },
  heroSprite: { width: 54, height: 54, marginBottom: 6, opacity: 0.95 },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 32,
    textAlign: 'center',
    color: THEME.colors.text.primary,
  },
  heroSub: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    lineHeight: 15,
    textAlign: 'center',
    color: THEME.colors.text.secondary,
  },
  tileGrid: { gap: 10 },
  tileRow: { flexDirection: 'row', gap: 10 },
  tileSlot: { flex: 1 },
  tile: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    backgroundColor: THEME.colors.bg.secondary,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  tileLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 13,
    color: THEME.colors.text.muted,
  },
  tileValue: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  statWrap: { marginTop: 12 },
  explain: {
    flex: 1,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(179,136,255,0.18)',
    backgroundColor: 'rgba(179,136,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  explainHead: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 13,
    color: THEME.colors.text.muted,
    marginBottom: 2,
  },
  explainLine: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: THEME.colors.text.soft,
    marginTop: 3,
  },
  actions: { paddingHorizontal: 18, paddingBottom: 24, paddingTop: 4 },
  hint: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.6,
    lineHeight: 13,
    textAlign: 'center',
    color: THEME.colors.text.muted,
    marginBottom: 10,
  },
  secondary: { marginTop: 10 },
  burst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFE066',
  },
});

export default GameOverScreen;
