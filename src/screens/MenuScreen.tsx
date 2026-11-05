import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { BookOpen, Gauge, LayoutGrid, Scale, Settings, Umbrella, Zap } from 'lucide-react-native';
import { ASSETS } from '../assets';
import { AppBackground } from '../components/AppBackground';
import { BentoTile } from '../components/BentoTile';
import { IconButton, ScreenHeader } from '../components/ScreenHeader';
import { KitStrip } from '../components/KitStrip';
import { SettingsSheet } from '../components/SettingsSheet';
import { Stat, StatRow } from '../components/StatCard';
import { THEME } from '../constants/theme';
import { ENTER_MS, STAGGER_STEP } from '../constants/config';
import { FLASH_KIT } from '../game/recipes';
import type { Units } from '../utils/format';

type Props = {
  activeFlashId: string;
  onSelectFlash: (id: string) => void;
  recipeCount: number;
  bestQuiz: number;
  units: Units;
  defaultIso: number;
  onUnits: (u: Units) => void;
  onIso: (iso: number) => void;
  onPlay: () => void;
  onLessons: () => void;
};

/** One shared entrance animation, reused by every block of the hub. */
function useStagger(count: number) {
  const values = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;
  useEffect(() => {
    Animated.stagger(
      STAGGER_STEP,
      values.map(v =>
        Animated.timing(v, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [values]);
  return values;
}

export function MenuScreen({
  activeFlashId,
  onSelectFlash,
  recipeCount,
  bestQuiz,
  units,
  defaultIso,
  onUnits,
  onIso,
  onPlay,
  onLessons,
}: Props) {
  const [sheet, setSheet] = useState(false);
  const steps = useStagger(4);
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  const enter = (i: number) => ({
    opacity: steps[i],
    transform: [
      { translateY: steps[i].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
    ],
  });

  const activeFlash = FLASH_KIT.find(f => f.id === activeFlashId) || FLASH_KIT[0];

  const stats: Stat[] = [
    {
      key: 'recipes',
      value: String(recipeCount),
      label: 'RECIPES',
      valueColor: THEME.colors.accent.primary,
    },
    {
      key: 'gn',
      value: 'GN ' + activeFlash.gn,
      label: 'ACTIVE FLASH',
      valueColor: THEME.colors.accent.flash,
    },
  ];
  if (bestQuiz > 0) {
    stats.push({
      key: 'quiz',
      value: bestQuiz + '/10',
      label: 'BEST QUIZ',
      valueColor: THEME.colors.accent.cool,
    });
  }

  return (
    <AppBackground variant="menu">
      <ScreenHeader
        title="LIGHT KIT"
        logo={ASSETS.logo}
        rightSlot={
          <IconButton
            Icon={Settings}
            onPress={() => setSheet(true)}
            label="Settings"
            tint={THEME.colors.accent.primary}
            fill="rgba(179,136,255,0.10)"
            border="rgba(179,136,255,0.22)"
          />
        }
      />

      <Animated.View pointerEvents="box-none" style={[styles.kit, enter(0)]}>
        <KitStrip flashes={FLASH_KIT} activeId={activeFlashId} onSelect={onSelectFlash} />
      </Animated.View>

      <View style={styles.grid}>
        <Animated.View pointerEvents="box-none" style={[styles.rowA, enter(1)]}>
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.ctaSlot,
              {
                transform: [
                  { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) },
                ],
              },
            ]}>
            <BentoTile
              Icon={Zap}
              label="START SOLVING"
              caption="GN TO DISTANCE, APERTURE, ISO"
              accent={THEME.colors.accent.primary}
              size="lg"
              onPress={onPlay}
            />
          </Animated.View>

          <View style={styles.rowACol}>
            <View style={styles.tileSlot}>
              <BentoTile
                Icon={Gauge}
                label="POWER LADDER"
                caption="9 STEPS"
                accent={THEME.colors.accent.flash}
                onPress={onPlay}
              />
            </View>
            <View style={styles.tileSlot}>
              <BentoTile
                Icon={Umbrella}
                label="MODIFIER LOSS"
                caption="-1.5 EV"
                accent={THEME.colors.accent.cool}
                onPress={onPlay}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View pointerEvents="box-none" style={[styles.rowB, enter(2)]}>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={Scale}
              label="KEY / FILL"
              caption="4:1"
              accent={THEME.colors.accent.flash}
              onPress={onPlay}
            />
          </View>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={LayoutGrid}
              label="SETUP DIAGRAM"
              caption="TOP VIEW"
              accent={THEME.colors.accent.primary}
              onPress={onPlay}
            />
          </View>
          <View style={styles.tileSlot}>
            <BentoTile
              Icon={BookOpen}
              label="GUIDE LESSONS"
              caption="8 CARDS"
              accent={THEME.colors.accent.cool}
              onPress={onLessons}
            />
          </View>
        </Animated.View>
      </View>

      <Animated.View pointerEvents="box-none" style={[styles.footer, enter(3)]}>
        <StatRow stats={stats} />
      </Animated.View>

      <SettingsSheet
        visible={sheet}
        units={units}
        defaultIso={defaultIso}
        onUnits={onUnits}
        onIso={onIso}
        onClose={() => setSheet(false)}
      />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  kit: { paddingHorizontal: 18, marginTop: 14 },
  grid: { flex: 1, paddingHorizontal: 18, paddingTop: 14 },
  rowA: { flex: 1.35, flexDirection: 'row', gap: 12 },
  ctaSlot: { flex: 1.6, height: '100%' },
  rowACol: { flex: 1, gap: 12 },
  rowB: { flex: 1, flexDirection: 'row', gap: 12, marginTop: 12 },
  tileSlot: { flex: 1 },
  footer: { paddingHorizontal: 18, marginTop: 12, paddingBottom: 16 },
});

export default MenuScreen;
