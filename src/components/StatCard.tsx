import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';

export type Stat = { key: string; value: string; label: string; valueColor: string };

type Props = { value: string; label: string; valueColor: string };

/**
 * Rule #21: colour carries the semantics, no raster icon inside a stat pill.
 * `width:'100%'` (never flex:1) because the parent slot is already flex:1 — rule #19a.
 */
export function StatCard({ value, label, valueColor }: Props) {
  return (
    <View style={[styles.card, { borderColor: valueColor + '55' }]}>
      <View style={[styles.dot, { backgroundColor: valueColor }]} />
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Renders nothing unless at least two pills carry a real value — no orphan pill, no empty box. */
export function StatRow({ stats }: { stats: Stat[] }) {
  const visible = stats.filter(s => s.value.length > 0 && s.value !== '0');
  if (visible.length < 2) {
    return null;
  }
  return (
    <View style={styles.row}>
      {visible.map(s => (
        <View key={s.key} style={styles.slot}>
          <StatCard value={s.value} label={s.label} valueColor={s.valueColor} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
  card: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: THEME.colors.bg.secondary,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  value: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 21,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 13,
    marginTop: 2,
    color: THEME.colors.text.muted,
  },
});

export default StatCard;
