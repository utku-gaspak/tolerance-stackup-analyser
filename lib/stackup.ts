import type { ParsedStackRow, StackCalculationResult, StackDirection } from "./types";

export function calculateTotalNominal(rows: ParsedStackRow[]): number {
  return rows.reduce((total, row) => total + signedValue(row.direction, row.nominal), 0);
}

export function calculateWorstCaseBounds(rows: ParsedStackRow[]): Pick<StackCalculationResult, "worstCaseMin" | "worstCaseMax"> {
  return rows.reduce(
    (bounds, row) => {
      const localMin = row.nominal - row.minusTolerance;
      const localMax = row.nominal + row.plusTolerance;

      if (row.direction === "+") {
        return {
          worstCaseMin: bounds.worstCaseMin + localMin,
          worstCaseMax: bounds.worstCaseMax + localMax
        };
      }

      return {
        worstCaseMin: bounds.worstCaseMin - localMax,
        worstCaseMax: bounds.worstCaseMax - localMin
      };
    },
    { worstCaseMin: 0, worstCaseMax: 0 }
  );
}

export function calculateRssBand(rows: ParsedStackRow[]): Pick<StackCalculationResult, "rssTolerance" | "rssMin" | "rssMax"> {
  const totalNominal = calculateTotalNominal(rows);
  const rssTolerance = Math.sqrt(
    rows.reduce((sum, row) => {
      const effectiveTolerance = (row.plusTolerance + row.minusTolerance) / 2;
      return sum + effectiveTolerance * effectiveTolerance;
    }, 0)
  );

  return {
    rssTolerance,
    rssMin: totalNominal - rssTolerance,
    rssMax: totalNominal + rssTolerance
  };
}

export function calculateStackup(rows: ParsedStackRow[]): StackCalculationResult {
  const totalNominal = calculateTotalNominal(rows);
  const { worstCaseMin, worstCaseMax } = calculateWorstCaseBounds(rows);
  const { rssTolerance, rssMin, rssMax } = calculateRssBand(rows);

  return {
    totalNominal,
    worstCaseMin,
    worstCaseMax,
    rssTolerance,
    rssMin,
    rssMax
  };
}

function signedValue(direction: StackDirection, value: number): number {
  return direction === "+" ? value : -value;
}
