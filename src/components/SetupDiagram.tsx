import React, { useMemo, useRef, useState } from 'react';
import { Image, PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';
import { ASSETS } from '../assets';
import { THEME } from '../constants/theme';
import { DIST_MAX, DIST_MIN } from '../constants/config';
import { clamp } from '../game/flashMath';

type Props = {
  distanceM: number;
  distanceLabel: string;
  beamStrength: number;
  onDragDistance: (metres: number) => void;
};

const TOP_PAD = 26;
const BOTTOM_PAD = 46;

/**
 * Top view of the set. Dragging anywhere on the panel moves the flash head and
 * writes the distance straight into the solver. PanResponder + Animated only —
 * external gesture libraries are forbidden on this stack (rule #8).
 */
export function SetupDiagram({ distanceM, distanceLabel, beamStrength, onDragDistance }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          emit(evt.nativeEvent.locationY);
        },
        onPanResponderMove: evt => {
          emit(evt.nativeEvent.locationY);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  function emit(locationY: number) {
    const h = sizeRef.current.h;
    if (h <= 0) {
      return;
    }
    const span = Math.max(1, h - TOP_PAD - BOTTOM_PAD);
    const t = clamp((h - BOTTOM_PAD - locationY) / span, 0, 1);
    onDragDistance(DIST_MIN + t * (DIST_MAX - DIST_MIN));
  }

  const { w, h } = size;
  const ready = w > 4 && h > 4;
  const t = clamp((distanceM - DIST_MIN) / (DIST_MAX - DIST_MIN), 0, 1);
  const subjectY = h - BOTTOM_PAD;
  const flashY = subjectY - t * Math.max(1, h - TOP_PAD - BOTTOM_PAD);
  const cx = w / 2;
  const cone = Math.max(16, w * 0.3);
  const beamOpacity = 0.07 + clamp(beamStrength, 0, 1) * 0.19;

  return (
    <View style={styles.panel} onLayout={e => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {ready ? (
        <Svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}>
          <Polygon
            points={
              cx + ',' + (flashY + 11) + ' ' +
              (cx - cone) + ',' + subjectY + ' ' +
              (cx + cone) + ',' + subjectY
            }
            fill={THEME.colors.accent.flash}
            fillOpacity={beamOpacity}
          />
          <Line
            x1={cx}
            y1={flashY + 11}
            x2={cx}
            y2={subjectY - 10}
            stroke={THEME.colors.accent.primary}
            strokeWidth={1.5}
            strokeDasharray="4 5"
            strokeOpacity={0.5}
          />
          <Circle cx={cx} cy={subjectY} r={13} fill={THEME.colors.accent.primary} fillOpacity={0.18} />
          <Circle
            cx={cx}
            cy={subjectY}
            r={9}
            fill={THEME.colors.accent.primary}
            stroke={THEME.colors.text.primary}
            strokeWidth={1.5}
          />
          <Rect
            x={cx - 17}
            y={flashY - 11}
            width={34}
            height={22}
            rx={7}
            fill={THEME.colors.accent.flash}
            stroke={THEME.colors.bg.deep}
            strokeWidth={1.5}
          />
        </Svg>
      ) : null}

      <View pointerEvents="none" style={styles.labelWrap}>
        <Text style={styles.distance} numberOfLines={1}>
          {distanceLabel}
        </Text>
        <Text style={styles.hint} numberOfLines={1}>
          DRAG TO MOVE THE FLASH
        </Text>
      </View>

      <Image source={ASSETS.sprite2} style={styles.sprite} resizeMode="contain" />
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />
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
    overflow: 'hidden',
  },
  labelWrap: { position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center' },
  distance: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 18,
    color: THEME.colors.accent.flash,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 1.2,
    lineHeight: 12,
    color: THEME.colors.text.muted,
  },
  sprite: { position: 'absolute', right: 10, bottom: 10, width: 44, height: 44, opacity: 0.75 },
});

export default SetupDiagram;
