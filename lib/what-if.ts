import type { ParsedStackRow } from "./types";

export type WhatIfPercents = Record<string, number>;

export const DEFAULT_WHAT_IF_PERCENT = 100;
export const MIN_WHAT_IF_PERCENT = 50;
export const MAX_WHAT_IF_PERCENT = 200;

export function applyWhatIfScenario(
  rows: ParsedStackRow[],
  globalPercent: number,
  rowPercents: WhatIfPercents
): ParsedStackRow[] {
  const globalMultiplier = percentToMultiplier(globalPercent);

  return rows.map((row) => {
    const rowPercent = rowPercents[row.id] ?? DEFAULT_WHAT_IF_PERCENT;
    const multiplier = globalMultiplier * percentToMultiplier(rowPercent);

    return {
      ...row,
      plusTolerance: row.plusTolerance * multiplier,
      minusTolerance: row.minusTolerance * multiplier
    };
  });
}

export function clampWhatIfPercent(value: number): number {
  return Math.min(MAX_WHAT_IF_PERCENT, Math.max(MIN_WHAT_IF_PERCENT, value));
}

export function percentToMultiplier(percent: number): number {
  return clampWhatIfPercent(percent) / 100;
}
