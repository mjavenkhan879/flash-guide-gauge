import {
  F_STOPS,
  ISO_STEPS,
  POWER_LABELS,
  POWER_STEPS,
  VarKind,
  effectiveGN,
  modifierStops,
  snapAperture,
  snapIso,
  solveAperture,
  solveDistance,
  solveIso,
  clamp,
} from './flashMath';
import { QUIZ_TOLERANCE } from '../constants/config';
import { FLASH_KIT } from './recipes';

export type Problem = {
  index: number;
  gn: number;
  flashName: string;
  distance: number;
  aperture: number;
  iso: number;
  powerIndex: number;
  modifier: string;
  ask: VarKind;
  answer: number;
  prompt: string;
};

const MODIFIER_IDS = ['bare', 'bare', 'umbrella', 'softbox'];
const ASK_ORDER: VarKind[] = ['distance', 'aperture', 'iso'];

function pick<T>(list: T[], seed: number): T {
  return list[Math.abs(seed) % list.length];
}

/** Deterministic-ish generator: a seed keeps a run reproducible inside one session. */
export function generateProblem(index: number, seed: number): Problem {
  const s = seed + index * 7919;
  const flash = pick(FLASH_KIT, s);
  const ask = ASK_ORDER[(index + Math.abs(s)) % 3];
  const modifier = pick(MODIFIER_IDS, s >> 2);
  const powerIndex = Math.abs(s >> 3) % 5;
  const stopsLost = modifierStops(modifier);
  const power = POWER_STEPS[powerIndex];

  const aperture = F_STOPS[6 + (Math.abs(s >> 4) % 10)];
  const iso = ISO_STEPS[(Math.abs(s >> 5) % 4) * 3];
  const distance = clamp(1 + (Math.abs(s >> 6) % 90) / 10, 0.8, 12);

  const gnEff = effectiveGN(flash.gn, iso, power, stopsLost);

  let answer: number;
  if (ask === 'distance') {
    answer = clamp(solveDistance(gnEff, aperture), 0.5, 20);
  } else if (ask === 'aperture') {
    answer = snapAperture(solveAperture(gnEff, distance));
  } else {
    answer = snapIso(solveIso(flash.gn, distance, aperture, power, stopsLost));
  }

  const askLabel =
    ask === 'distance' ? 'DISTANCE' : ask === 'aperture' ? 'APERTURE' : 'SENSITIVITY';

  const prompt =
    'Q' +
    (index + 1) +
    '  ' +
    flash.name +
    ' GN ' +
    flash.gn +
    ' at ' +
    POWER_LABELS[powerIndex] +
    ' - set the ' +
    askLabel;

  return {
    index,
    gn: flash.gn,
    flashName: flash.name,
    distance: ask === 'distance' ? clamp(answer, 0.5, 20) : distance,
    aperture: ask === 'aperture' ? answer : aperture,
    iso: ask === 'iso' ? answer : iso,
    powerIndex,
    modifier,
    ask,
    answer,
    prompt,
  };
}

/** One third of a stop of slack counts as a hit. */
export function checkAnswer(given: number, answer: number): boolean {
  if (!isFinite(given) || given <= 0 || answer <= 0) {
    return false;
  }
  const ratio = given > answer ? given / answer : answer / given;
  return ratio <= QUIZ_TOLERANCE + 0.0001;
}

export type QuizRun = { correct: number; total: number };

export function scoreRun(run: QuizRun): string {
  return run.correct + ' of ' + run.total;
}

export function scoreVerdict(run: QuizRun): string {
  const pct = run.total > 0 ? run.correct / run.total : 0;
  if (pct >= 0.9) {
    return 'STUDIO READY';
  }
  if (pct >= 0.6) {
    return 'SOLID GRASP';
  }
  if (pct >= 0.3) {
    return 'KEEP DRILLING';
  }
  return 'BACK TO THE CARDS';
}
