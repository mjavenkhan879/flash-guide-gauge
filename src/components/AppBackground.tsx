import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { THEME } from '../constants/theme';

export type BgVariant = 'loader' | 'menu' | 'game' | 'result' | 'lessons';

type Blob = {
  size: number;
  color: string;
  opacity: number;
  top?: number | string;
  left?: number;
  right?: number;
  bottom?: number;
};

/**
 * One source of truth for every screen's backdrop: the single Codex background
 * image plus a per-variant gradient overlay and decorative blobs.
 * Loader is deliberately the darkest and the only one without warm bloom (rule #14).
 */
const BLOBS: Record<BgVariant, Blob[]> = {
  loader: [
    { size: 260, color: '#B388FF', opacity: 0.1, top: -60, left: -70 },
    { size: 320, color: '#2C2438', opacity: 0.1, bottom: -120, right: -90 },
    { size: 140, color: '#FFE066', opacity: 0.07, top: '38%', right: 28 },
  ],
  menu: [{ size: 300, color: '#B388FF', opacity: 0.13, top: -90, right: -70 }],
  game: [
    { size: 240, color: '#B388FF', opacity: 0.1, top: -70, left: -60 },
    { size: 200, color: '#FFE066', opacity: 0.05, bottom: 120, right: -70 },
  ],
  result: [{ size: 300, color: '#FFE066', opacity: 0.1, top: '34%', left: 36 }],
  lessons: [{ size: 260, color: '#B388FF', opacity: 0.11, top: -80, right: -60 }],
};

const DIAGONAL = { start: { x: 0.1, y: 0 }, end: { x: 0.9, y: 1 } };
const VERTICAL = { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } };

type Props = { variant: BgVariant; children: React.ReactNode };

export function AppBackground({ variant, children }: Props) {
  const sweep = variant === 'loader' ? DIAGONAL : VERTICAL;
  return (
    <ImageBackground source={ASSETS.bgGame} style={styles.fill} resizeMode="cover">
      <LinearGradient
        colors={THEME.gradients[variant]}
        start={sweep.start}
        end={sweep.end}
        style={StyleSheet.absoluteFill}
      />
      {BLOBS[variant].map((b, i) => (
        <View
          key={variant + i}
          pointerEvents="none"
          style={[
            styles.blob,
            {
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              backgroundColor: b.color,
              opacity: b.opacity,
              top: b.top as number,
              left: b.left,
              right: b.right,
              bottom: b.bottom,
            },
          ]}
        />
      ))}
      <View style={styles.fill}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  blob: { position: 'absolute' },
});

export default AppBackground;
