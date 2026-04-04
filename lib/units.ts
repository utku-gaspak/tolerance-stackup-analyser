import type { MonteCarloResult, MonteCarloSpecLimits } from "./monte-carlo";
import type { EngineeringUnit, SavedStackVariant, StackCalculationResult, StackRow } from "./types";

const MILLIMETERS_PER_INCH = 25.4;

export function convertLength(value: number, from: EngineeringUnit, to: EngineeringUnit): number {
  if (from === to) {
    return value;
  }

  return from === "mm" ? value / MILLIMETERS_PER_INCH : value * MILLIMETERS_PER_INCH;
}

export function formatEngineeringValue(value: number): string {
  return value.toFixed(4);
}

export function formatEditableEngineeringValue(value: number): string {
  return trimTrailingZeros(value.toFixed(5));
}

export function convertOptionalLength(
  value: number | null,
  from: EngineeringUnit,
  to: EngineeringUnit
): number | null {
  if (value === null) {
    return null;
  }

  return convertLength(value, from, to);
}

export function convertRows(rows: StackRow[], from: EngineeringUnit, to: EngineeringUnit): StackRow[] {
  if (from === to) {
    return rows.map((row) => ({ ...row }));
  }

  return rows.map((row) => ({
    ...row,
    nominal: convertEditableField(row.nominal, from, to),
    plusTolerance: convertEditableField(row.plusTolerance, from, to),
    minusTolerance: convertEditableField(row.minusTolerance, from, to)
  }));
}

export function convertCalculationResult(
  result: StackCalculationResult,
  from: EngineeringUnit,
  to: EngineeringUnit
): StackCalculationResult {
  if (from === to) {
    return { ...result };
  }

  return {
    totalNominal: convertLength(result.totalNominal, from, to),
    worstCaseMin: convertLength(result.worstCaseMin, from, to),
    worstCaseMax: convertLength(result.worstCaseMax, from, to),
    rssTolerance: convertLength(result.rssTolerance, from, to),
    rssMin: convertLength(result.rssMin, from, to),
    rssMax: convertLength(result.rssMax, from, to)
  };
}

export function convertSpecLimits(
  specLimits: MonteCarloSpecLimits,
  from: EngineeringUnit,
  to: EngineeringUnit
): MonteCarloSpecLimits {
  if (from === to) {
    return { ...specLimits };
  }

  return {
    lower: convertOptionalLength(specLimits.lower, from, to),
    upper: convertOptionalLength(specLimits.upper, from, to)
  };
}

export function convertMonteCarloResult(
  result: MonteCarloResult,
  from: EngineeringUnit,
  to: EngineeringUnit
): MonteCarloResult {
  if (from === to) {
    return {
      ...result,
      histogram: result.histogram.map((bin) => ({ ...bin }))
    };
  }

  return {
    ...result,
    mean: convertLength(result.mean, from, to),
    min: convertLength(result.min, from, to),
    max: convertLength(result.max, from, to),
    p05: convertLength(result.p05, from, to),
    p95: convertLength(result.p95, from, to),
    lowerSpecLimit: convertOptionalLength(result.lowerSpecLimit, from, to),
    upperSpecLimit: convertOptionalLength(result.upperSpecLimit, from, to),
    histogram: result.histogram.map((bin) => ({
      min: convertLength(bin.min, from, to),
      max: convertLength(bin.max, from, to),
      count: bin.count
    }))
  };
}

export function convertSavedVariants(
  variants: SavedStackVariant[],
  from: EngineeringUnit,
  to: EngineeringUnit
): SavedStackVariant[] {
  if (from === to) {
    return variants.map((variant) => ({
      ...variant,
      rows: variant.rows.map((row) => ({ ...row })),
      result: { ...variant.result }
    }));
  }

  return variants.map((variant) => ({
    ...variant,
    unit: to,
    rows: convertRows(variant.rows, from, to),
    result: convertCalculationResult(variant.result, from, to)
  }));
}

function convertEditableField(value: string, from: EngineeringUnit, to: EngineeringUnit): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return value;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return value;
  }

  return formatEditableEngineeringValue(convertLength(parsed, from, to));
}

function trimTrailingZeros(value: string): string {
  const trimmed = value.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  return trimmed === "" ? "0" : trimmed;
}
