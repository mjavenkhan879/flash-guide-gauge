import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/theme';
import { BTN_GAP, BTN_ICON, HIT } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';
import type { LucideIcon } from './ScreenHeader';

type Props = {
  Icon: LucideIcon;
  label: string;
  caption: string;
  accent: string;
  onPress: () => void;
  size?: 'lg' | 'sm';
  style?: ViewStyle;
};

/**
 * Bento cell. `lg` is the gradient primary CTA of the hub, `sm` a flat tile.
 * Pressable is always the PARENT, the Animated.View the child (rule #8), and the
 * wrapper carries pointerEvents="box-none" so taps always reach the Pressable.
 */
export function BentoTile({ Icon, label, caption, accent, onPress, size = 'sm', style }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(size === 'lg' ? 0.96 : 0.94);
  const large = size === 'lg';

  const body = (
    <View style={large ? styles.lgBody : styles.smBody}>
      {large ? (
        <View style={styles.row}>
          <Icon size={BTN_ICON} color={THEME.colors.text.onAccent} strokeWidth={1.5} />
          <Text style={styles.lgLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: accent + '1A' }]}>
          <Icon size={22} color={accent} strokeWidth={1.5} />
        </View>
      )}
      {large ? null : (
        <Text style={styles.smLabel} numberOfLines={2}>
          {label}
        </Text>
      )}
      <Text style={large ? styles.lgCaption : styles.smCaption} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label + ' ' + caption}
      style={[styles.press, large ? styles.lgShadow : styles.smShadow, style]}>
      <Animated.View pointerEvents="box-none" style={[styles.fill, { transform: [{ scale }] }]}>
        {large ? (
          <LinearGradient
            colors={THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lgSurface}>
            {body}
          </LinearGradient>
        ) : (
          <View style={styles.smSurface}>{body}</View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: '100%', borderRadius: 18 },
  fill: { width: '100%', height: '100%', borderRadius: 18 },
  lgShadow: {
    shadowColor: '#B388FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  smShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  lgSurface: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  smSurface: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.ui.border,
    backgroundColor: THEME.colors.bg.secondary,
    padding: 12,
  },
  lgBody: { alignItems: 'center', justifyContent: 'center' },
  smBody: { flex: 1, justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: BTN_GAP },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lgLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: BTN_ICON,
    color: THEME.colors.text.onAccent,
  },
  lgCaption: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.1,
    lineHeight: 14,
    marginTop: 8,
    color: 'rgba(23,19,31,0.70)',
  },
  smLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 15,
    marginTop: 8,
    color: THEME.colors.text.primary,
  },
  smCaption: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 13,
    marginTop: 3,
    color: THEME.colors.text.muted,
  },
});

export default BentoTile;
