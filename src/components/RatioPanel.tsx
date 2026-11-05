import React, { useCallback } from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { HIT } from '../constants/config';
import { clamp, formatRatio } from '../game/flashMath';

type Props = {
  deltaEV: number;
  keyDistance: string;
  fillDistance: string;
  unit: string;
  onStep: (dir: number) => void;
};

function pct(ratio: number): DimensionValue {
  return (Math.round(clamp(ratio, 0.08, 1) * 100) + '%') as DimensionValue;
}

/** Key / fill balance: one stepper, two facing bars, one big ratio figure. */
export function RatioPanel({ deltaEV, keyDistance, fillDistance, unit, onStep }: Props) {
  const down = useCallback(() => onStep(-1), [onStep]);
  const up = useCallback(() => onStep(1), [onStep]);
  const fillRatio = Math.pow(2, -deltaEV);

  return (
    <View style={styles.panel}>
      <Text style={styles.ratio} numberOfLines={1}>
        {formatRatio(deltaEV)}
      </Text>
      <Text style={styles.caption} numberOfLines={1}>
        {'KEY TO FILL · ' + deltaEV.toFixed(1) + ' EV'}
      </Text>

      <View style={styles.barBlock}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>
            KEY
          </Text>
          <View style={styles.track}>
            <View style={[styles.bar, { width: '100%', backgroundColor: THEME.colors.accent.flash }]} />
          </View>
          <Text style={[styles.barValue, { color: THEME.colors.accent.flash }]} numberOfLines={1}>
            {keyDistance + ' ' + unit}
          </Text>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>
            FILL
          </Text>
          <View style={styles.track}>
            <View
              style={[styles.bar, { width: pct(fillRatio), backgroundColor: THEME.colors.accent.primary }]}
            />
          </View>
          <Text style={[styles.barValue, { color: THEME.colors.accent.primary }]} numberOfLines={1}>
            {fillDistance + ' ' + unit}
          </Text>
        </View>
      </View>

      <View style={styles.stepRow}>
        <Pressable
          onPress={down}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel="Less fill difference"
          style={styles.stepper}>
          <Minus size={16} color={THEME.colors.text.primary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.stepLabel} numberOfLines={1}>
          FILL OFFSET
        </Text>
        <Pressable
          onPress={up}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel="More fill difference"
          style={styles.stepper}>
          <Plus size={16} color={THEME.colors.text.primary} strokeWidth={2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(243,239,250,0.07)',
    backgroundColor: THEME.colors.bg.tertiary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ratio: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    color: THEME.colors.accent.flash,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    lineHeight: 13,
    color: THEME.colors.text.muted,
  },
  barBlock: { width: '100%', marginTop: 10, gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: {
    width: 34,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 13,
    color: THEME.colors.text.secondary,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(243,239,250,0.06)',
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  bar: { height: 10, borderRadius: 5 },
  barValue: {
    width: 56,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    fontVariant: ['tabular-nums'],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
    paddingTop: 8,
  },
  stepper: {
    width: 36,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.ui.fill,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  stepLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.3,
    lineHeight: 13,
    color: THEME.colors.text.muted,
  },
});

export default RatioPanel;
