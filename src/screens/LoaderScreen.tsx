import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { THEME } from '../constants/theme';
import {
  LOADER_BAR_H,
  LOADER_BAR_W,
  LOADER_DURATION_MS,
  LOADER_FADE_MS,
  LOADER_PROGRESS_MS,
} from '../constants/config';

type Props = { onFinish: () => void };

/**
 * Deliberately nothing like the Menu (rule #14): darkest overlay in the app,
 * no tiles, no chips, no CTA — just the brand panel and a progress bar.
 */
export function LoaderScreen({ onFinish }: Props) {
  const screen = useRef(new Animated.Value(1)).current;
  const panel = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const subtitle = useRef(new Animated.Value(0)).current;
  const barFade = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(panel, { toValue: 1, tension: 42, friction: 8, useNativeDriver: true }),
      Animated.timing(title, {
        toValue: 1,
        duration: 420,
        delay: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(subtitle, {
        toValue: 1,
        duration: 420,
        delay: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(barFade, {
        toValue: 1,
        duration: 360,
        delay: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // width is NOT native-drivable — rule #8 / animation-gpu-properties.
    Animated.timing(progress, {
      toValue: 1,
      duration: LOADER_PROGRESS_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(halo, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    const timer = setTimeout(() => {
      Animated.timing(screen, {
        toValue: 0,
        duration: LOADER_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        if (!done.current) {
          done.current = true;
          onFinish();
        }
      });
    }, LOADER_DURATION_MS - LOADER_FADE_MS);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [barFade, halo, onFinish, panel, progress, screen, subtitle, title]);

  const panelScale = panel.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const titleShift = title.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const subShift = subtitle.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.07, 0.16] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, LOADER_BAR_W] });

  return (
    <AppBackground variant="loader">
      <Animated.View style={[styles.root, { opacity: screen }]}>
        <View style={styles.center}>
          <View style={styles.brandWrap}>
            <Animated.View
              pointerEvents="none"
              style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: panelScale }] }]}
            />
            <Animated.View
              style={[styles.panel, { opacity: panel, transform: [{ scale: panelScale }] }]}>
              <Image source={ASSETS.logo} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          </View>

          <Animated.View
            style={[styles.titleWrap, { opacity: title, transform: [{ translateY: titleShift }] }]}>
            <Text style={styles.title}>FLASH GUIDE</Text>
            <Text style={styles.title}>GAUGE</Text>
          </Animated.View>

          <Animated.Text
            style={[styles.subtitle, { opacity: subtitle, transform: [{ translateY: subShift }] }]}>
            MANUAL FLASH MATH, OFFLINE
          </Animated.Text>
        </View>

        <Animated.View style={[styles.barBlock, { opacity: barFade }]}>
          <View style={styles.track}>
            <Animated.View style={[styles.fillWrap, { width: barWidth }]}>
              <LinearGradient
                colors={THEME.gradients.beam}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <Text style={styles.loading}>LOADING STUDIO DATA</Text>
        </Animated.View>
      </Animated.View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  center: { alignItems: 'center' },
  brandWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#B388FF',
  },
  panel: {
    width: 168,
    height: 168,
    borderRadius: 34,
    backgroundColor: 'rgba(179,136,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(243,239,250,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 132, height: 132 },
  titleWrap: { marginTop: 26, alignItems: 'center' },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 3.5,
    lineHeight: 36,
    textAlign: 'center',
    color: THEME.colors.text.primary,
    textShadowColor: 'rgba(179,136,255,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    lineHeight: 15,
    textAlign: 'center',
    color: THEME.colors.text.secondary,
  },
  barBlock: { position: 'absolute', bottom: 64, alignItems: 'center' },
  track: {
    width: LOADER_BAR_W,
    height: LOADER_BAR_H,
    borderRadius: 2,
    backgroundColor: 'rgba(243,239,250,0.08)',
    overflow: 'hidden',
  },
  fillWrap: { height: LOADER_BAR_H, borderRadius: 2, overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  loading: {
    marginTop: 12,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 2.2,
    lineHeight: 13,
    color: THEME.colors.text.muted,
  },
});

export default LoaderScreen;
