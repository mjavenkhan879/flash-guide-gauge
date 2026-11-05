import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/theme';
import { BTN_GAP, BTN_ICON, HIT, PRIMARY_BTN_H } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';
import type { LucideIcon } from './ScreenHeader';

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  gradient?: [string, string];
  shadowColor?: string;
  textColor?: string;
  style?: ViewStyle;
};

/**
 * Rule #20 / button-icon centering: fixed 24x24 icon, label lineHeight 24,
 * row + center + gap 10. Never an absolutely positioned glyph.
 */
export function PrimaryButton({
  label,
  onPress,
  Icon,
  gradient,
  shadowColor,
  textColor,
  style,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  const colors = gradient || THEME.gradients.primary;
  const tint = textColor || THEME.colors.text.onAccent;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.press, { shadowColor: shadowColor || colors[0] }, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}>
          <View style={styles.row}>
            {Icon ? <Icon size={BTN_ICON} color={tint} strokeWidth={1.5} /> : null}
            <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: PRIMARY_BTN_H,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 9,
  },
  fill: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
  grad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BTN_GAP,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: BTN_ICON,
  },
});

export default PrimaryButton;
