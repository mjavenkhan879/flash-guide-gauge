import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, DimensionValue, Easing, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronLeft, RotateCcw, Save } from 'lucide-react-native';
import { AppBackground } from '../components/AppBackground';
import { Chip } from '../components/Chip';
import { FalloffCurve } from '../components/FalloffCurve';
import { FormulaStrip } from '../components/FormulaStrip';
import { PowerLadder } from '../components/PowerLadder';
import { PrimaryButton } from '../components/PrimaryButton';
import { RatioPanel } from '../components/RatioPanel';
import { IconButton, ScreenHeader } from '../components/ScreenHeader';
import { SetupDiagram } from '../components/SetupDiagram';
import { Stat, StatRow } from '../components/StatCard';
import { VariableCard } from '../components/VariableCard';
import { THEME } from '../constants/theme';
import { DIST_MAX, DIST_MIN, DIST_STEP, QUIZ_LENGTH } from '../constants/config';
import {
  F_STOPS,
  ISO_STEPS,
  MODIFIERS,
  VarKind,
  apertureIndex,
  clamp,
  effectiveGN,
  inverseSquareFalloff,
  isoIndex,
  modifierStops,
  solveDistance,
} from '../game/flashMath';
import { checkAnswer, generateProblem } from '../game/quiz';
import { nextRecipeName } from '../game/recipes';
import type { ResultSummary } from '../game/recipes';
import { useSolver } from '../hooks/useSolver';
import {
  Units,
  distanceUnitLabel,
  formatAperture,
  formatDistance,
  formatEv,
} from '../utils/format';

type Props = {
  units: Units;
  activeFlashId: string;
  practice: boolean;
  recipeCount: number;
  onBack: () => void;
  onGameOver: (summary: ResultSummary) => void;
};

type Mode = 'solve' | 'ladder' | 'ratio';

const MODES: { id: Mode; label: string }[] = [
  { id: 'solve', label: 'SOLVE' },
  { id: 'ladder', label: 'LADDER' },
  { id: 'ratio', label: 'RATIO' },
];

const KIND_LABEL: Record<VarKind, string> = {
  distance: 'DISTANCE',
  aperture: 'APERTURE',
  iso: 'ISO',
};

const QUIZ_POWER_LABELS = ['1/1', '1/2', '1/4', '1/8', '1/16'];

function quizStart(ask: VarKind): number {
  if (ask === 'distance') {
    return 3;
  }
  if (ask === 'aperture') {
    return F_STOPS[12];
  }
  return 400;
}

function stepValue(kind: VarKind, value: number, dir: number): number {
  if (kind === 'distance') {
    return clamp(Math.round((value + dir * DIST_STEP) * 10) / 10, DIST_MIN, DIST_MAX);
  }
  if (kind === 'aperture') {
    return F_STOPS[Math.round(clamp(apertureIndex(value) + dir, 0, F_STOPS.length - 1))];
  }
  return ISO_STEPS[Math.round(clamp(isoIndex(value) + dir * 3, 0, ISO_STEPS.length - 1))];
}

export function GameScreen({
  units,
  activeFlashId,
  practice,
  recipeCount,
  onBack,
  onGameOver,
}: Props) {
  const solver = useSolver(units);
  const [mode, setMode] = useState<Mode>('solve');
  const [deltaEV, setDeltaEV] = useState(2);
  const slide = useRef(new Animated.Value(0)).current;

  // --- practice quiz state -------------------------------------------------
  const seed = useRef(Math.floor(Date.now() % 100000)).current;
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [verdict, setVerdict] = useState<'none' | 'ok' | 'bad'>('none');
  const problem = useMemo(() => generateProblem(qIndex, seed), [qIndex, seed]);
  const [quizValue, setQuizValue] = useState(() => quizStart(problem.ask));
  const busy = useRef(false);

  const selectFlash = solver.selectFlash;
  const solverFlashId = solver.flash.id;

  useEffect(() => {
    if (activeFlashId !== solverFlashId) {
      selectFlash(activeFlashId);
    }
  }, [activeFlashId, selectFlash, solverFlashId]);

  useEffect(() => {
    setQuizValue(quizStart(problem.ask));
    setVerdict('none');
    busy.current = false;
  }, [problem.ask, qIndex]);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [slide]);

  const unit = distanceUnitLabel(units);
  const lost = practice ? modifierStops(problem.modifier) : solver.stopsLost;

  // --- displayed triangle --------------------------------------------------
  const shown = practice
    ? {
        distance: problem.ask === 'distance' ? quizValue : problem.distance,
        aperture: problem.ask === 'aperture' ? quizValue : problem.aperture,
        iso: problem.ask === 'iso' ? quizValue : problem.iso,
      }
    : solver.values;

  const freeKind: VarKind = practice ? problem.ask : solver.free;
  const gn = practice ? problem.gn : solver.flash.gn;
  const powerLabelText = practice
    ? QUIZ_POWER_LABELS[problem.powerIndex] || '1/1'
    : solver.powerLabel;
  const gnEff = practice
    ? effectiveGN(problem.gn, shown.iso, Math.pow(2, -problem.powerIndex), lost)
    : solver.gnEff;
  const ev = practice
    ? Math.log((shown.aperture * shown.aperture) / 0.008) / Math.LN2 +
      Math.log(shown.iso / 100) / Math.LN2
    : solver.ev;

  const valueText = useCallback(
    (kind: VarKind) => {
      if (kind === 'distance') {
        return formatDistance(shown.distance, units);
      }
      if (kind === 'aperture') {
        return formatAperture(shown.aperture);
      }
      return String(Math.round(shown.iso));
    },
    [shown.aperture, shown.distance, shown.iso, units],
  );

  const unitText = useCallback(
    (kind: VarKind) => {
      if (kind === 'distance') {
        return unit;
      }
      return kind === 'aperture' ? 'F STOP' : 'ISO';
    },
    [unit],
  );

  const solverStep = solver.step;
  const solverToggle = solver.toggleLock;

  const onStep = useCallback(
    (kind: VarKind, dir: number) => {
      if (practice) {
        if (kind !== problem.ask) {
          return;
        }
        setQuizValue(v => stepValue(kind, v, dir));
        return;
      }
      solverStep(kind, dir);
    },
    [practice, problem.ask, solverStep],
  );

  const onToggleLock = useCallback(
    (kind: VarKind) => {
      if (practice) {
        return;
      }
      solverToggle(kind);
    },
    [practice, solverToggle],
  );

  // --- primary action ------------------------------------------------------
  const onPrimary = useCallback(() => {
    if (!practice) {
      onGameOver({
        kind: 'recipe',
        name: nextRecipeName(recipeCount),
        gn,
        distance: shown.distance,
        aperture: shown.aperture,
        iso: shown.iso,
        powerLabel: powerLabelText,
        modifier: solver.modifier,
        solved: freeKind,
        gnEff,
        stopsLost: lost,
        ev,
        recipeCount,
      });
      return;
    }
    if (busy.current) {
      return;
    }
    busy.current = true;
    const hit = checkAnswer(quizValue, problem.answer);
    const nextCorrect = hit ? correct + 1 : correct;
    setVerdict(hit ? 'ok' : 'bad');
    setCorrect(nextCorrect);
    setTimeout(() => {
      if (qIndex + 1 >= QUIZ_LENGTH) {
        onGameOver({
          kind: 'quiz',
          name: 'PRACTICE RUN',
          gn: problem.gn,
          distance: shown.distance,
          aperture: shown.aperture,
          iso: shown.iso,
          powerLabel: powerLabelText,
          modifier: problem.modifier,
          solved: problem.ask,
          gnEff,
          stopsLost: lost,
          ev,
          recipeCount,
          quizCorrect: nextCorrect,
          quizTotal: QUIZ_LENGTH,
        });
      } else {
        setQIndex(i => i + 1);
      }
    }, 520);
  }, [
    correct,
    ev,
    freeKind,
    gn,
    gnEff,
    lost,
    onGameOver,
    powerLabelText,
    practice,
    problem,
    qIndex,
    quizValue,
    recipeCount,
    shown,
    solver.modifier,
  ]);

  // --- strips --------------------------------------------------------------
  let stripText = solver.formulaText;
  if (practice) {
    if (verdict === 'ok') {
      stripText = 'CORRECT - ' + KIND_LABEL[problem.ask] + ' IS ' + problem.answer.toFixed(1);
    } else if (verdict === 'bad') {
      stripText = 'CLOSE - THE ANSWER WAS ' + problem.answer.toFixed(1);
    } else {
      stripText = problem.prompt;
    }
  }

  const stats: Stat[] = [
    { key: 'gn', value: String(gn), label: 'GUIDE NO', valueColor: THEME.colors.accent.primary },
    { key: 'power', value: powerLabelText, label: 'POWER', valueColor: THEME.colors.accent.flash },
    { key: 'ev', value: formatEv(ev), label: 'EV', valueColor: THEME.colors.accent.cool },
  ];

  const beam = clamp(inverseSquareFalloff(shown.distance) * 12, 0, 1);
  const keyDistance = formatDistance(shown.distance, units);
  const fillDistance = formatDistance(
    clamp(solveDistance(gnEff, shown.aperture) * Math.pow(2, deltaEV / 2), DIST_MIN, DIST_MAX),
    units,
  );
  const progressWidth = (Math.round((qIndex / QUIZ_LENGTH) * 100) + '%') as DimensionValue;

  const ladderUnit =
    freeKind === 'distance' ? unit : freeKind === 'aperture' ? 'F' : 'ISO';

  const onRatioStep = useCallback((dir: number) => {
    setDeltaEV(v => clamp(v + dir * 0.5, 0, 5));
  }, []);

  const verdictTone =
    verdict === 'ok'
      ? THEME.colors.accent.cool
      : verdict === 'bad'
      ? THEME.colors.accent.warm
      : undefined;

  return (
    <AppBackground variant="game">
      <ScreenHeader
        title={practice ? 'PRACTICE QUIZ' : 'EXPOSURE SOLVER'}
        subtitle={
          practice
            ? 'QUESTION ' + (qIndex + 1) + ' OF ' + QUIZ_LENGTH
            : solver.flash.name + ' · GN ' + solver.flash.gn
        }
        leftSlot={<IconButton Icon={ChevronLeft} onPress={onBack} label="Back to light kit" />}
        rightSlot={
          practice ? null : (
            <IconButton
              Icon={RotateCcw}
              onPress={solver.reset}
              label="Reset locks"
              tint={THEME.colors.accent.primary}
            />
          )
        }
      />

      <View style={styles.area}>
        {practice ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        ) : (
          <View style={styles.tabs}>
            {MODES.map(m => (
              <Chip
                key={m.id}
                label={m.label}
                active={mode === m.id}
                onPress={() => setMode(m.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.varRow}>
          {(['distance', 'aperture', 'iso'] as VarKind[]).map(kind => (
            <View key={kind} style={styles.varSlot}>
              <VariableCard
                kind={kind}
                label={KIND_LABEL[kind]}
                value={valueText(kind)}
                unit={unitText(kind)}
                locked={kind !== freeKind}
                onToggleLock={onToggleLock}
                onStep={onStep}
                tone={practice && kind === freeKind ? verdictTone : undefined}
              />
            </View>
          ))}
        </View>

        <View style={styles.strip}>
          <FormulaStrip text={stripText} tone={practice ? 'quiz' : 'formula'} />
        </View>

        {practice ? (
          <View style={styles.quizPanel}>
            <Text style={styles.quizScore} numberOfLines={1}>
              {correct + ' / ' + QUIZ_LENGTH}
            </Text>
            <Text style={styles.quizLabel} numberOfLines={1}>
              CORRECT SO FAR
            </Text>
            <FalloffCurve distanceM={shown.distance} height={80} />
          </View>
        ) : null}

        {!practice && mode === 'solve' ? (
          <View style={styles.body}>
            <SetupDiagram
              distanceM={shown.distance}
              distanceLabel={formatDistance(shown.distance, units) + ' ' + unit}
              beamStrength={beam}
              onDragDistance={solver.setDistanceFromDrag}
            />
          </View>
        ) : null}

        {!practice && mode === 'ladder' ? (
          <View style={styles.body}>
            <PowerLadder
              rows={solver.ladder}
              activeIndex={solver.powerIndex}
              unit={ladderUnit}
              onPick={solver.setPowerIndex}
            />
          </View>
        ) : null}

        {!practice && mode === 'ratio' ? (
          <View style={styles.body}>
            <RatioPanel
              deltaEV={deltaEV}
              keyDistance={keyDistance}
              fillDistance={fillDistance}
              unit={unit}
              onStep={onRatioStep}
            />
          </View>
        ) : null}
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.controls,
          {
            opacity: slide,
            transform: [
              { translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
            ],
          },
        ]}>
        <StatRow stats={stats} />

        <View style={styles.modRow}>
          {MODIFIERS.map(m => (
            <Chip
              key={m.id}
              label={m.label}
              active={(practice ? problem.modifier : solver.modifier) === m.id}
              onPress={() => {
                if (!practice) {
                  solver.setModifier(m.id);
                }
              }}
              accent={THEME.colors.accent.flash}
            />
          ))}
        </View>

        <View style={styles.cta}>
          <PrimaryButton
            label={practice ? 'CHECK ANSWER' : 'SAVE RECIPE'}
            Icon={practice ? Check : Save}
            onPress={onPrimary}
            gradient={practice ? THEME.gradients.flash : THEME.gradients.primary}
          />
        </View>
      </Animated.View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  tabs: { flexDirection: 'row', gap: 8 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(243,239,250,0.07)',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: THEME.colors.accent.flash },
  varRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  varSlot: { flex: 1 },
  strip: { marginTop: 12 },
  body: { flex: 1, marginTop: 12, marginBottom: 12 },
  quizPanel: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(243,239,250,0.07)',
    backgroundColor: THEME.colors.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quizScore: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    color: THEME.colors.accent.flash,
    fontVariant: ['tabular-nums'],
  },
  quizLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    lineHeight: 13,
    color: THEME.colors.text.muted,
    marginBottom: 6,
  },
  controls: {
    backgroundColor: THEME.colors.bg.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(243,239,250,0.09)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  modRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cta: { marginTop: 12 },
});

export default GameScreen;
