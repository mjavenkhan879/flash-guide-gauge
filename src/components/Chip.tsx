import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';
import { CHIP_H, HIT } from '../constants/config';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
  style?: ViewStyle;
};

/** Height is explicit; width comes from the flex slot the row gives it. */
export function Chip({ label, active, onPress, accent, style }: Props) {
  const tone = accent || THEME.colors.accent.primary;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        active
          ? { backgroundColor: tone + '29', borderColor: tone }
          : { backgroundColor: 'rgba(243,239,250,0.05)', borderColor: THEME.colors.ui.border },
        style,
      ]}>
      <Text
        style={[
          styles.label,
          { color: active ? THEME.colors.text.primary : THEME.colors.text.muted },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    height: CHIP_H,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, lineHeight: 15 },
});

export default Chip;
