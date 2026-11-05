import { useCallback, useMemo, useState } from 'react';
import {
  F_STOPS,
  ISO_STEPS,
  POWER_LABELS,
  POWER_STEPS,
  VarKind,
  apertureIndex,
  clamp,
  effectiveGN,
  exposureValue,
  isoIndex,
  modifierStops,
  powerLadder,
  snapAperture,
  snapIso,
  solveAperture,
  solveDistance,
  solveIso,
} from '../game/flashMath';
import { DIST_MAX, DIST_MIN, DIST_STEP } from '../constants/config';
import { FLASH_KIT } from '../game/recipes';
import { Units, formatAperture, formatDistance, distanceUnitLabel } from '../utils/format';

const KINDS: VarKind[] = ['distance', 'aperture', 'iso'];

type SolverState = {
  flashId: string;
  distance: number;
  aperture: number;
  iso: number;
  powerIndex: number;
  modifier: string;
  /** Exactly two entries, oldest lock first (FIFO release). */
  lockOrder: VarKind[];
};

const INITIAL: SolverState = {
  flashId: FLASH_KIT[0].id,
  distance: 10.4,
  aperture: 5.6,
  iso: 100,
  powerIndex: 0,
  modifier: 'bare',
  lockOrder: ['iso', 'aperture'],
};

function gnOf(flashId: string): number {
  const found = FLASH_KIT.find(f => f.id === flashId);
  return found ? found.gn : FLASH_KIT[0].gn;
}

export function useSolver(units: Units) {
  const [state, setState] = useState<SolverState>(INITIAL);

  const flash = useMemo(
    () => FLASH_KIT.find(f => f.id === state.flashId) || FLASH_KIT[0],
    [state.flashId],
  );

  const free = useMemo<VarKind>(() => {
    const found = KINDS.find(k => state.lockOrder.indexOf(k) < 0);
    return found || 'distance';
  }, [state.lockOrder]);

  const stopsLost = modifierStops(state.modifier);
  const power = POWER_STEPS[state.powerIndex];
  const powerLabel = POWER_LABELS[state.powerIndex];

  const values = useMemo(() => {
    const gnEffWithIso = effectiveGN(flash.gn, state.iso, power, stopsLost);
    if (free === 'distance') {
      return {
        distance: clamp(solveDistance(gnEffWithIso, state.aperture), DIST_MIN, DIST_MAX),
        aperture: state.aperture,
        iso: state.iso,
      };
    }
    if (free === 'aperture') {
      return {
        distance: state.distance,
        aperture: snapAperture(solveAperture(gnEffWithIso, state.distance)),
        iso: state.iso,
      };
    }
    return {
      distance: state.distance,
      aperture: state.aperture,
      iso: snapIso(solveIso(flash.gn, state.distance, state.aperture, power, stopsLost)),
    };
  }, [flash.gn, free, power, state.aperture, state.distance, state.iso, stopsLost]);

  const gnEff = effectiveGN(flash.gn, values.iso, power, stopsLost);
  const ev = exposureValue(values.aperture, values.iso);

  const ladder = useMemo(
    () => powerLadder(free, flash.gn, values.distance, values.aperture, values.iso, stopsLost),
    [free, flash.gn, stopsLost, values.aperture, values.distance, values.iso],
  );

  const formulaText = useMemo(() => {
    const u = distanceUnitLabel(units).toLowerCase();
    const d = formatDistance(values.distance, units);
    const f = formatAperture(values.aperture);
    if (free === 'distance') {
      return 'd = GN / f  =  ' + gnEff.toFixed(1) + ' / ' + f + '  =  ' + d + ' ' + u;
    }
    if (free === 'aperture') {
      return 'f = GN / d  =  ' + gnEff.toFixed(1) + ' / ' + d + '  =  f/' + f;
    }
    return 'ISO = 100 x (d x f / GN)^2  =  ' + d + ' x ' + f + '  =  ' + Math.round(values.iso);
  }, [free, gnEff, units, values.aperture, values.distance, values.iso]);

  /** Lock the tapped card and release the lock held longest (FIFO), freezing shown values. */
  const toggleLock = useCallback((kind: VarKind) => {
    setState(prev => {
      if (prev.lockOrder.indexOf(kind) >= 0) {
        return prev;
      }
      const kept = prev.lockOrder[prev.lockOrder.length - 1];
      const freedKind = KINDS.find(k => prev.lockOrder.indexOf(k) < 0) as VarKind;
      const gn = gnOf(prev.flashId);
      const pw = POWER_STEPS[prev.powerIndex];
      const lost = modifierStops(prev.modifier);
      const gnEffPrev = effectiveGN(gn, prev.iso, pw, lost);
      const next: SolverState = { ...prev, lockOrder: [kept, kind] };
      if (freedKind === 'distance') {
        next.distance = clamp(solveDistance(gnEffPrev, prev.aperture), DIST_MIN, DIST_MAX);
      } else if (freedKind === 'aperture') {
        next.aperture = snapAperture(solveAperture(gnEffPrev, prev.distance));
      } else {
        next.iso = snapIso(solveIso(gn, prev.distance, prev.aperture, pw, lost));
      }
      return next;
    });
  }, []);

  const step = useCallback((kind: VarKind, dir: number) => {
    setState(prev => {
      if (prev.lockOrder.indexOf(kind) < 0) {
        return prev;
      }
      if (kind === 'distance') {
        const raw = Math.round((prev.distance + dir * DIST_STEP) * 10) / 10;
        return { ...prev, distance: clamp(raw, DIST_MIN, DIST_MAX) };
      }
      if (kind === 'aperture') {
        const idx = clamp(apertureIndex(prev.aperture) + dir, 0, F_STOPS.length - 1);
        return { ...prev, aperture: F_STOPS[Math.round(idx)] };
      }
      const idx = clamp(isoIndex(prev.iso) + dir * 3, 0, ISO_STEPS.length - 1);
      return { ...prev, iso: ISO_STEPS[Math.round(idx)] };
    });
  }, []);

  /** Dragging the flash marker always writes distance, locking it if it was the free one. */
  const setDistanceFromDrag = useCallback((metres: number) => {
    setState(prev => {
      const d = clamp(Math.round(metres * 10) / 10, DIST_MIN, DIST_MAX);
      if (prev.lockOrder.indexOf('distance') >= 0) {
        if (Math.abs(prev.distance - d) < 0.05) {
          return prev;
        }
        return { ...prev, distance: d };
      }
      const kept = prev.lockOrder[prev.lockOrder.length - 1];
      const nextLocks: VarKind[] = [kept, 'distance'];
      return { ...prev, distance: d, lockOrder: nextLocks };
    });
  }, []);

  const selectFlash = useCallback((flashId: string) => {
    setState(prev => ({ ...prev, flashId }));
  }, []);

  const setPowerIndex = useCallback((powerIndex: number) => {
    setState(prev => ({ ...prev, powerIndex: clamp(powerIndex, 0, POWER_STEPS.length - 1) }));
  }, []);

  const setModifier = useCallback((modifier: string) => {
    setState(prev => ({ ...prev, modifier }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({ ...INITIAL, flashId: prev.flashId }));
  }, []);

  return {
    flash,
    free,
    values,
    gnEff,
    ev,
    ladder,
    formulaText,
    power,
    powerLabel,
    powerIndex: state.powerIndex,
    modifier: state.modifier,
    stopsLost,
    toggleLock,
    step,
    setDistanceFromDrag,
    selectFlash,
    setPowerIndex,
    setModifier,
    reset,
  };
}

export default useSolver;
