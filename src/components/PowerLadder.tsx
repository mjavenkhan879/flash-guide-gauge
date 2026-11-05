import React, { useCallback } from 'react';
import {
  DimensionValue,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from '../constants/theme';
import { HIT } from '../constants/config';
import type { LadderRow } from '../game/flashMath';

type Props = {
  rows: LadderRow[];
  activeIndex: number;
  unit: string;
  onPick: (index: number) => void;
};

type RowProps = {
  index: number;
  label: string;
  ratio: number;
  value: number;
  active: boolean;
  unit: string;
  onPick: (index: number) => void;
};

function pct(ratio: number): DimensionValue {
  return (Math.round(ratio * 100) + '%') as DimensionValue;
}

/** Primitive props only, so React.memo actually holds (list-perf rule 2.5). */
const LadderItem = React.memo(function LadderItem({
  index,
  label,
  ratio,
  value,
  active,
  unit,
  onPick,
}: RowProps) {
  const text = value >= 100 ? String(Math.round(value)) : value.toFixed(1);
  const press = useCallback(() => onPick(index), [index, onPick]);
  return (
    <Pressable
      onPress={press}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={'Set power ' + label}
      style={[styles.row, active ? styles.rowActive : null]}>
      <View
        style={[
          styles.marker,
          { backgroundColor: active ? THEME.colors.accent.flash : 'transparent' },
        ]}
      />
      <Text style={styles.power} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <LinearGradient
          colors={THEME.gradients.beam}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bar, { width: pct(ratio) }]}
        />
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {text + ' ' + unit}
      </Text>
    </Pressable>
  );
});

/** FlatList is used INSIDE the panel — never as the screen wrapper (rule #3). */
export function PowerLadder({ rows, activeIndex, unit, onPick }: Props) {
  const keyExtractor = useCallback((item: LadderRow) => item.key, []);
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<LadderRow>) => (
      <LadderItem
        index={index}
        label={item.label}
        ratio={item.ratio}
        value={item.value}
        active={index === activeIndex}
        unit={unit}
        onPick={onPick}
      />
    ),
    [activeIndex, onPick, unit],
  );

  return (
    <View style={styles.panel}>
      <View style={styles.head}>
        <Text style={styles.headText} numberOfLines={1}>
          POWER LADDER
        </Text>
        <Text style={styles.headHint} numberOfLines={1}>
          TAP A STEP TO SET THE POWER
        </Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={activeIndex}
        scrollEnabled={false}
        initialNumToRender={9}
        removeClippedSubviews={false}
      />
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  head: { marginBottom: 4 },
  headText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 14,
    color: THEME.colors.text.primary,
  },
  headHint: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 1,
    lineHeight: 12,
    color: THEME.colors.text.muted,
  },
  row: {
    height: 28,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingRight: 4,
  },
  rowActive: { backgroundColor: 'rgba(255,224,102,0.08)' },
  marker: { width: 2, height: 18, borderRadius: 1, marginRight: 6 },
  power: {
    width: 42,
    fontSize: 10.5,
    fontWeight: '700',
    lineHeight: 15,
    color: THEME.colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(243,239,250,0.06)',
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  bar: { height: 8, borderRadius: 4 },
  value: {
    width: 62,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    color: THEME.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});

export default PowerLadder;
