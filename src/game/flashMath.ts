/**
 * Manual-flash exposure math.
 * Guide numbers are metres at ISO 100, full power, bare head.
 */

export type VarKind = 'distance' | 'aperture' | 'iso';

export const F_STOPS = [
  1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10,
  11, 13, 14, 16, 18, 20, 22,
];

export const ISO_STEPS = [
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000,
  2500, 3200, 4000, 5000, 6400,
];

export const POWER_STEPS = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125, 0.00390625];
export const POWER_LABELS = ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64', '1/128', '1/256'];

export type Modifier = { id: string; label: string; stops: number };

export const MODIFIERS: Modifier[] = [
  { id: 'bare', label: 'BARE', stops: 0 },
  { id: 'umbrella', label: 'UMBRELLA', stops: 1.5 },
  { id: 'softbox', label: 'SOFTBOX', stops: 2 },
];

export const METRES_PER_FOOT = 0.3048;
export const FEET_PER_METRE = 3.2808;

export function clamp(v: number, lo: number, hi: number): number {
  if (!isFinite(v)) {
    return lo;
  }
  return Math.min(hi, Math.max(lo, v));
}

/** The guide number actually available after ISO gain, power cut and modifier loss. */
export function effectiveGN(gn: number, iso: number, power: number, stopsLost: number): number {
  return (gn * Math.sqrt(iso / 100) * Math.sqrt(power)) / Math.pow(2, stopsLost / 2);
}

/** The part of the chain that does not depend on ISO — used when ISO is the unknown. */
export function baseGN(gn: number, power: number, stopsLost: number): number {
  return (gn * Math.sqrt(power)) / Math.pow(2, stopsLost / 2);
}

export function solveDistance(gnEff: number, aperture: number): number {
  return gnEff / aperture;
}

export function solveAperture(gnEff: number, distance: number): number {
  return gnEff / distance;
}

export function solveIso(
  gn: number,
  distance: number,
  aperture: number,
  power: number,
  stopsLost: number,
): number {
  const base = baseGN(gn, power, stopsLost);
  const r = (distance * aperture) / base;
  return 100 * r * r;
}

function snapTo(list: number[], value: number): number {
  let best = list[0];
  let bestDelta = Math.abs(Math.log(value / best));
  for (let i = 1; i < list.length; i += 1) {
    const delta = Math.abs(Math.log(value / list[i]));
    if (delta < bestDelta) {
      bestDelta = delta;
      best = list[i];
    }
  }
  return best;
}

export function snapAperture(value: number): number {
  return snapTo(F_STOPS, clamp(value, F_STOPS[0], F_STOPS[F_STOPS.length - 1]));
}

export function snapIso(value: number): number {
  return snapTo(ISO_STEPS, clamp(value, ISO_STEPS[0], ISO_STEPS[ISO_STEPS.length - 1]));
}

export function apertureIndex(value: number): number {
  const snapped = snapAperture(value);
  const idx = F_STOPS.indexOf(snapped);
  return idx < 0 ? 12 : idx;
}

export function isoIndex(value: number): number {
  const snapped = snapIso(value);
  const idx = ISO_STEPS.indexOf(snapped);
  return idx < 0 ? 0 : idx;
}

export function metersToFeet(m: number): number {
  return m * FEET_PER_METRE;
}

export function modifierStops(id: string): number {
  const found = MODIFIERS.find(m => m.id === id);
  return found ? found.stops : 0;
}

export type LadderRow = {
  key: string;
  label: string;
  power: number;
  value: number;
  ratio: number;
};

/** The free variable recomputed across all nine fractional power steps. */
export function powerLadder(
  free: VarKind,
  gn: number,
  distance: number,
  aperture: number,
  iso: number,
  stopsLost: number,
): LadderRow[] {
  const raw = POWER_STEPS.map(power => {
    const gnEff = effectiveGN(gn, iso, power, stopsLost);
    if (free === 'distance') {
      return clamp(solveDistance(gnEff, aperture), 0.1, 999);
    }
    if (free === 'aperture') {
      return clamp(solveAperture(gnEff, distance), 0.5, 64);
    }
    return clamp(solveIso(gn, distance, aperture, power, stopsLost), 50, 102400);
  });
  const max = raw.reduce((a, b) => (b > a ? b : a), 0.0001);
  return raw.map((value, i) => ({
    key: POWER_LABELS[i],
    label: POWER_LABELS[i],
    power: POWER_STEPS[i],
    value,
    ratio: clamp(value / max, 0.04, 1),
  }));
}

/** Key / fill lighting ratio from a stop difference: 2 EV -> 4:1. */
export function ratioFromStops(deltaEV: number): number {
  return Math.pow(2, deltaEV);
}

export function formatRatio(deltaEV: number): string {
  const r = ratioFromStops(deltaEV);
  const rounded = r >= 10 ? Math.round(r) : Math.round(r * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return text + ':1';
}

/** Exposure value of the solved triangle, a compact quality read-out. */
export function exposureValue(aperture: number, iso: number): number {
  const ev100 = Math.log(aperture * aperture / 0.008) / Math.LN2;
  return ev100 + Math.log(iso / 100) / Math.LN2;
}

export function inverseSquareFalloff(distance: number): number {
  return 1 / (distance * distance);
}
