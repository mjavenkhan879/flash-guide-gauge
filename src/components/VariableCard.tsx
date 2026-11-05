import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { Lock, Minus, Plus, Unlock, Zap } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { HAPTIC_MS, HIT, HOLD_REPEAT_MS, LOCK_CLICK_MS, VAR_CARD_H } from '../constants/config';
import type { VarKind } from '../game/flashMath';

type Props = {
  kind: VarKind;
  label: string;
  value: string;
  unit: string;
  locked: boolean;
  onToggleLock: (kind: VarKind) => void;
  onStep: (kind: VarKind, dir: number) => void;
  tone?: string;
};

type StepperProps = { dir: number; onStep: () => void; label: string };

function Stepper({ dir, onStep, label }: StepperProps) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(onStep, HOLD_REPEAT_MS);
  }, [onStep, stop]);

  return (
    <Pressable
      onPress={onStep}
      onPressIn={start}
      onPressOut={stop}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.stepper}>
      {dir > 0 ? (
        <Plus size={16} color={THEME.colors.text.primary} strokeWidth={2} />
      ) : (
        <Minus size={16} color={THEME.colors.text.primary} strokeWidth={2} />
      )}
    </Pressable>
  );
}

/**
 * The lock/solve card. Exactly two of the three are locked; the free one shows its
 * derived value in flash-yellow. Tapping a free card's padlock locks it.
 */
export function VariableCard({
  kind,
  label,
  value,
  unit,
  locked,
  onToggleLock,
  onStep,
  tone,
}: Props) {
  const click = useRef(new Animated.Value(1)).current;
  const accent = locked ? THEME.colors.accent.primary : tone || THEME.colors.accent.flash;

  const toggle = useCallback(() => {
    Animated.sequence([
      Animated.timing(click, {
        toValue: 0.82,
        duration: LOCK_CLICK_MS / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(click, {
        toValue: 1,
        duration: LOCK_CLICK_MS / 2,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    Vibration.vibrate(HAPTIC_MS);
    onToggleLock(kind);
  }, [click, kind, onToggleLock]);

  const stepDown = useCallback(() => onStep(kind, -1), [kind, onStep]);
  const stepUp = useCallback(() => onStep(kind, 1), [kind, onStep]);

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: accent,
          backgroundColor: locked ? 'rgba(179,136,255,0.10)' : 'rgba(255,224,102,0.08)',
        },
      ]}>
      <Pressable
        onPress={toggle}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={(locked ? 'Unlock ' : 'Lock ') + label}
        style={styles.lockPress}>
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.lockInner,
            { backgroundColor: accent + '22', transform: [{ scale: click }] },
          ]}>
          {locked ? (
            <Lock size={15} color={accent} strokeWidth={1.8} />
          ) : (
            <Zap size={15} color={accent} strokeWidth={1.8} />
          )}
        </Animated.View>
      </Pressable>

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, { color: locked ? THEME.colors.text.primary : accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.unit} numberOfLines={1}>
        {unit}
      </Text>

      <View style={styles.footer}>
        {locked ? (
          <View style={styles.stepRow}>
            <Stepper dir={-1} onStep={stepDown} label={'Decrease ' + label} />
            <Stepper dir={1} onStep={stepUp} label={'Increase ' + label} />
          </View>
        ) : (
          <View style={styles.solvedWrap}>
            <Unlock size={11} color={accent} strokeWidth={2} />
            <Text style={[styles.solved, { color: accent }]} numberOfLines={1}>
              SOLVED
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: VAR_CARD_H,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 9,
    alignItems: 'center',
  },
  lockPress: { width: 28, height: 28, alignSelf: 'flex-start' },
  lockInner: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
    lineHeight: 13,
    marginTop: 4,
    color: THEME.colors.text.muted,
  },
  value: {
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 29,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 13,
    color: THEME.colors.text.secondary,
  },
  footer: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  stepper: {
    width: 32,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.ui.fill,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
  },
  solvedWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  solved: { fontSize: 9, fontWeight: '700', letterSpacing: 1.3, lineHeight: 13 },
});

export default VariableCard;
