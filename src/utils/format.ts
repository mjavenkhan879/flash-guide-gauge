import { metersToFeet } from '../game/flashMath';

export type Units = 'metres' | 'feet';

export function formatDistance(metres: number, units: Units): string {
  const v = units === 'feet' ? metersToFeet(metres) : metres;
  return v.toFixed(1);
}

export function distanceUnitLabel(units: Units): string {
  return units === 'feet' ? 'FT' : 'M';
}

export function formatAperture(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatIso(value: number): string {
  return String(Math.round(value));
}

export function formatEv(value: number): string {
  return value.toFixed(1);
}

export function formatStops(value: number): string {
  return value.toFixed(1);
}

export function formatPowerLabel(label: string): string {
  return label;
}
