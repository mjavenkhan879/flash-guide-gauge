import React, { useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { HIT } from '../constants/config';
import type { Flash } from '../game/recipes';
import { usePressScale } from '../hooks/usePressScale';

type Props = { flashes: Flash[]; activeId: string; onSelect: (id: string) => void };

type CardProps = {
  id: string;
  name: string;
  gn: number;
  accent: string;
  active: boolean;
  onSelect: (id: string) => void;
};

const KitCard = React.memo(function KitCard({ id, name, gn, accent, active, onSelect }: CardProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const press = useCallback(() => onSelect(id), [id, onSelect]);
  return (
    <Pressable
      onPress={press}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={name + ' guide number ' + gn}
      style={styles.slot}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.card,
          {
            borderColor: active ? accent : THEME.colors.ui.border,
            backgroundColor: active ? accent + '1F' : THEME.colors.bg.secondary,
            transform: [{ scale }],
          },
        ]}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={[styles.gn, { color: accent }]} numberOfLines={1}>
          {String(gn)}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

export function KitStrip({ flashes, activeId, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {flashes.map(f => (
        <KitCard
          key={f.id}
          id={f.id}
          name={f.name}
          gn={f.gn}
          accent={f.accent}
          active={f.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, height: 86 },
  slot: { flex: 1, height: '100%' },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 },
  gn: { fontSize: 22, fontWeight: '800', lineHeight: 27, fontVariant: ['tabular-nums'] },
  name: {
    fontSize: 9.5,
    fontWeight: '600',
    letterSpacing: 1.1,
    lineHeight: 13,
    marginTop: 1,
    color: THEME.colors.text.secondary,
  },
});

export default KitStrip;
