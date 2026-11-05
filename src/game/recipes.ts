import { VarKind } from './flashMath';
import { formatAperture, formatDistance, distanceUnitLabel, Units } from '../utils/format';

export type Recipe = {
  id: string;
  name: string;
  gn: number;
  distance: number;
  aperture: number;
  iso: number;
  powerLabel: string;
  modifier: string;
  solved: VarKind;
};

export type Flash = { id: string; name: string; gn: number; accent: string };

/** The starting Light Kit — three manual strobes, guide numbers in metres at ISO 100. */
export const FLASH_KIT: Flash[] = [
  { id: 'sb900', name: 'SB-900', gn: 58, accent: '#B388FF' },
  { id: 'v1pro', name: 'V1 PRO', gn: 60, accent: '#FFE066' },
  { id: 'ad200', name: 'AD200', gn: 52, accent: '#7FD8C9' },
];

/** Six seeded recipes so the kit never looks empty on a fresh install. */
export const SEED_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: 'PORTRAIT KEY 4:1',
    gn: 58,
    distance: 10.4,
    aperture: 5.6,
    iso: 100,
    powerLabel: '1/1',
    modifier: 'bare',
    solved: 'distance',
  },
  {
    id: 'r2',
    name: 'SOFT BEAUTY',
    gn: 60,
    distance: 2.1,
    aperture: 4,
    iso: 200,
    powerLabel: '1/4',
    modifier: 'softbox',
    solved: 'aperture',
  },
  {
    id: 'r3',
    name: 'GROUP WIDE',
    gn: 52,
    distance: 6.5,
    aperture: 8,
    iso: 400,
    powerLabel: '1/2',
    modifier: 'umbrella',
    solved: 'iso',
  },
  {
    id: 'r4',
    name: 'EVENT BOUNCE',
    gn: 58,
    distance: 3.2,
    aperture: 2.8,
    iso: 800,
    powerLabel: '1/8',
    modifier: 'bare',
    solved: 'aperture',
  },
  {
    id: 'r5',
    name: 'PRODUCT TABLE',
    gn: 60,
    distance: 1.2,
    aperture: 11,
    iso: 100,
    powerLabel: '1/16',
    modifier: 'softbox',
    solved: 'distance',
  },
  {
    id: 'r6',
    name: 'NIGHT RIM',
    gn: 52,
    distance: 4.5,
    aperture: 4,
    iso: 200,
    powerLabel: '1/4',
    modifier: 'bare',
    solved: 'distance',
  },
];

const RECIPE_NAMES = [
  'PORTRAIT KEY 4:1',
  'STUDIO HEADSHOT',
  'RIM AND FILL',
  'LOW KEY DRAMA',
  'WINDOW MIX',
  'CLEAN CATALOGUE',
  'EDITORIAL WIDE',
];

export function nextRecipeName(count: number): string {
  return RECIPE_NAMES[count % RECIPE_NAMES.length];
}

export function saveRecipe(list: Recipe[], recipe: Recipe): Recipe[] {
  return list.concat(recipe);
}

/** The three plain-language lines that explain exactly how the value was reached. */
export function explainSolve(
  recipe: Recipe,
  stopsLost: number,
  gnEff: number,
  units: Units,
): string[] {
  const u = distanceUnitLabel(units);
  const d = formatDistance(recipe.distance, units);
  const f = formatAperture(recipe.aperture);
  const lines: string[] = [];

  lines.push(
    'GN ' +
      recipe.gn +
      ' at ISO ' +
      recipe.iso +
      ', power ' +
      recipe.powerLabel +
      ' gives an effective GN of ' +
      gnEff.toFixed(1) +
      '.',
  );
  lines.push(
    stopsLost > 0
      ? 'The ' +
          recipe.modifier.toUpperCase() +
          ' eats ' +
          stopsLost.toFixed(1) +
          ' stops, so the working GN drops before the divide.'
      : 'Bare head, so nothing is lost between the tube and the subject.',
  );

  if (recipe.solved === 'distance') {
    lines.push('d = GN / f = ' + gnEff.toFixed(1) + ' / ' + f + ' = ' + d + ' ' + u + '.');
  } else if (recipe.solved === 'aperture') {
    lines.push('f = GN / d = ' + gnEff.toFixed(1) + ' / ' + d + ' = f/' + f + '.');
  } else {
    lines.push(
      'ISO = 100 x (d x f / GN)^2 = ' + d + ' x ' + f + ' solved to ISO ' + recipe.iso + '.',
    );
  }
  return lines;
}

/** What the solver hands to the result screen when a run ends. */
export type ResultSummary = {
  kind: 'recipe' | 'quiz';
  name: string;
  gn: number;
  distance: number;
  aperture: number;
  iso: number;
  powerLabel: string;
  modifier: string;
  solved: VarKind;
  gnEff: number;
  stopsLost: number;
  ev: number;
  recipeCount: number;
  quizCorrect?: number;
  quizTotal?: number;
};

export function recipeFromSummary(summary: ResultSummary): Recipe {
  return {
    id: 'r' + (summary.recipeCount + 1),
    name: summary.name,
    gn: summary.gn,
    distance: summary.distance,
    aperture: summary.aperture,
    iso: summary.iso,
    powerLabel: summary.powerLabel,
    modifier: summary.modifier,
    solved: summary.solved,
  };
}
