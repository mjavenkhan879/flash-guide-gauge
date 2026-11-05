import React from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { HEADER_H, HEADER_TOP_PAD, HIT, ICON_BTN } from '../constants/config';
import { usePressScale } from '../hooks/usePressScale';

type IconProps = { size: number; color: string; strokeWidth: number };
export type LucideIcon = React.ComponentType<IconProps>;

type IconButtonProps = {
  Icon: LucideIcon;
  onPress: () => void;
  label: string;
  tint?: string;
  fill?: string;
  border?: string;
};

/** 40x40 square tap target — explicit width AND height, plus hitSlop tolerance. */
export function IconButton({ Icon, onPress, label, tint, fill, border }: IconButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.iconBtn}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.iconBtnInner,
          {
            backgroundColor: fill || THEME.colors.ui.fill,
            borderColor: border || THEME.colors.ui.borderStrong,
            transform: [{ scale }],
          },
        ]}>
        <Icon size={20} color={tint || THEME.colors.text.primary} strokeWidth={1.5} />
      </Animated.View>
    </Pressable>
  );
}

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  logo?: ImageSourcePropType;
};

/**
 * The one header every screen uses (rule: shared ScreenHeader for 3+ screens).
 * Screens only vary leftSlot / title / subtitle / rightSlot — never the styling.
 */
export function ScreenHeader({ title, subtitle, leftSlot, rightSlot, logo }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>{leftSlot ? leftSlot : null}</View>
      <View style={styles.center}>
        <View style={styles.titleRow}>
          {logo ? <Image source={logo} style={styles.logo} resizeMode="contain" /> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>{rightSlot ? rightSlot : null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_H,
    paddingTop: HEADER_TOP_PAD,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243,239,250,0.07)',
  },
  side: { width: ICON_BTN, height: ICON_BTN, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 22, height: 22, marginRight: 8 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: THEME.colors.text.primary,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: THEME.colors.text.muted,
    marginTop: 2,
  },
  iconBtn: { width: ICON_BTN, height: ICON_BTN },
  iconBtnInner: {
    width: ICON_BTN,
    height: ICON_BTN,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ScreenHeader;
