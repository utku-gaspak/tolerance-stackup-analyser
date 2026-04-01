import type { ParsedStackRow } from "./types";

export interface SensitivityItem {
  id: string;
  label: string;
  direction: "+" | "-";
  effectiveTolerance: number;
  rssContribution: number;
  rssShare: number;
  worstCaseSpan: number;
  worstCaseShare: number;
}

export function calculateSensitivityAnalysis(rows: ParsedStackRow[]): SensitivityItem[] {
  const totalRssContribution = rows.reduce((sum, row) => {
    const effectiveTolerance = (row.plusTolerance + row.minusTolerance) / 2;
    return sum + effectiveTolerance * effectiveTolerance;
  }, 0);

  const totalWorstCaseSpan = rows.reduce((sum, row) => sum + row.plusTolerance + row.minusTolerance, 0);

  return rows
    .map((row) => {
      const effectiveTolerance = (row.plusTolerance + row.minusTolerance) / 2;
      const rssContribution = effectiveTolerance * effectiveTolerance;
      const worstCaseSpan = row.plusTolerance + row.minusTolerance;

      return {
        id: row.id,
        label: row.label,
        direction: row.direction,
        effectiveTolerance,
        rssContribution,
        rssShare: totalRssContribution > 0 ? rssContribution / totalRssContribution : 0,
        worstCaseSpan,
        worstCaseShare: totalWorstCaseSpan > 0 ? worstCaseSpan / totalWorstCaseSpan : 0
      };
    })
    .sort((a, b) => b.rssShare - a.rssShare || b.worstCaseShare - a.worstCaseShare || a.label.localeCompare(b.label));
}
