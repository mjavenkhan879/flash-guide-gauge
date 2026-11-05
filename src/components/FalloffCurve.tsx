import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { DIST_MAX, DIST_MIN } from '../constants/config';
import { clamp } from '../game/flashMath';

type Props = { distanceM: number; height?: number };

/** Inverse-square falloff with a marker at the solved distance. */
export function FalloffCurve({ distanceM, height = 92 }: Props) {
  const [w, setW] = useState(0);
  const h = height;
  const pad = 10;

  const path = useMemo(() => {
    if (w <= 4) {
      return '';
    }
    const steps = 28;
    let d = '';
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const dist = DIST_MIN + t * (DIST_MAX - DIST_MIN);
      const rel = (DIST_MIN * DIST_MIN) / (dist * dist);
      const x = pad + t * (w - pad * 2);
      const y = pad + (1 - rel) * (h - pad * 2);
      d += (i === 0 ? 'M' : ' L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }, [h, w]);

  const t = clamp((distanceM - DIST_MIN) / (DIST_MAX - DIST_MIN), 0, 1);
  const mx = pad + t * (w - pad * 2);
  const rel = (DIST_MIN * DIST_MIN) / (distanceM * distanceM);
  const my = pad + (1 - clamp(rel, 0, 1)) * (h - pad * 2);

  return (
    <View style={[styles.wrap, { height: h }]} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {w > 4 ? (
        <Svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}>
          <Line
            x1={pad}
            y1={h - pad}
            x2={w - pad}
            y2={h - pad}
            stroke={THEME.colors.text.muted}
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <Path d={path} stroke={THEME.colors.accent.primary} strokeWidth={2} fill="none" />
          <Circle cx={mx} cy={my} r={5} fill={THEME.colors.accent.flash} />
        </Svg>
      ) : null}
      <Text style={styles.caption} numberOfLines={1}>
        INVERSE SQUARE FALLOFF
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', justifyContent: 'center' },
  caption: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 12,
    color: THEME.colors.text.muted,
  },
});

export default FalloffCurve;
