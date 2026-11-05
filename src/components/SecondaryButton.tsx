import React from 'react';
import { Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { HIT, SECONDARY_BTN_H } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type Props = { label: string; onPress: () => void; style?: ViewStyle };

/** Text-only by design — a clean button beats a crooked one with a stray glyph (rule #20). */
export function SecondaryButton({ label, onPress, style }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.press, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.inner, { transform: [{ scale }] }]}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: SECONDARY_BTN_H },
  inner: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.ui.fill,
    borderWidth: 1,
    borderColor: THEME.colors.ui.borderStrong,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 20,
    color: THEME.colors.text.primary,
  },
});

export default SecondaryButton;
