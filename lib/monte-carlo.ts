import type { ParsedStackRow, StackDirection } from "./types";

export interface MonteCarloSpecLimits {
  lower: number | null;
  upper: number | null;
}

export interface MonteCarloHistogramBin {
  min: number;
  max: number;
  count: number;
}

export interface MonteCarloResult {
  sampleCount: number;
  mean: number;
  min: number;
  max: number;
  p05: number;
  p95: number;
  passCount: number | null;
  failCount: number | null;
  passRate: number | null;
  lowerSpecLimit: number | null;
  upperSpecLimit: number | null;
  histogram: MonteCarloHistogramBin[];
  seed: number;
}

export function runMonteCarloSimulation(
  rows: ParsedStackRow[],
  sampleCount: number,
  seed: number,
  specLimits: MonteCarloSpecLimits | null = null
): MonteCarloResult {
  const rng = mulberry32(seed);
  const totals: number[] = [];
  const hasLowerSpec = specLimits?.lower !== null && specLimits?.lower !== undefined;
  const hasUpperSpec = specLimits?.upper !== null && specLimits?.upper !== undefined;
  const lowerSpecLimit = hasLowerSpec ? (specLimits?.lower ?? null) : null;
  const upperSpecLimit = hasUpperSpec ? (specLimits?.upper ?? null) : null;
  let passCount = 0;

  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    let total = 0;

    for (const row of rows) {
      const sampledDimension = sampleDimension(row, rng);
      total += signedValue(row.direction, sampledDimension);
    }

    totals.push(total);

    if (isInSpec(total, lowerSpecLimit, upperSpecLimit)) {
      passCount += 1;
    }
  }

  totals.sort((a, b) => a - b);

  const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  const min = totals[0] ?? 0;
  const max = totals[totals.length - 1] ?? 0;
  const p05 = quantile(totals, 0.05);
  const p95 = quantile(totals, 0.95);
  const hasSpecLimits = lowerSpecLimit !== null || upperSpecLimit !== null;
  const resolvedPassCount = hasSpecLimits ? passCount : null;
  const resolvedFailCount = hasSpecLimits ? sampleCount - passCount : null;
  const passRate = hasSpecLimits && sampleCount > 0 ? passCount / sampleCount : null;
  const histogram = buildHistogram(totals, 12);

  return {
    sampleCount,
    mean,
    min,
    max,
    p05,
    p95,
    passCount: resolvedPassCount,
    failCount: resolvedFailCount,
    passRate,
    lowerSpecLimit,
    upperSpecLimit,
    histogram,
    seed
  };
}

function sampleDimension(row: ParsedStackRow, rng: () => number): number {
  const effectiveTol = (row.plusTolerance + row.minusTolerance) / 2;
  const sigma = Math.max(effectiveTol / 3, 1e-9);
  const lower = row.nominal - row.minusTolerance;
  const upper = row.nominal + row.plusTolerance;
  const sampled = row.nominal + gaussian(rng) * sigma;

  return clamp(sampled, lower, upper);
}

function gaussian(rng: () => number): number {
  let u1 = 0;
  let u2 = 0;

  while (u1 === 0) {
    u1 = rng();
  }

  while (u2 === 0) {
    u2 = rng();
  }

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function buildHistogram(values: number[], binCount: number): MonteCarloHistogramBin[] {
  const min = values[0] ?? 0;
  const max = values[values.length - 1] ?? 0;

  if (min === max) {
    return [{ min, max, count: values.length }];
  }

  const step = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    min: min + index * step,
    max: index === binCount - 1 ? max : min + (index + 1) * step,
    count: 0
  }));

  for (const value of values) {
    const rawIndex = Math.floor((value - min) / step);
    const index = Math.min(binCount - 1, Math.max(0, rawIndex));
    bins[index].count += 1;
  }

  return bins;
}

function quantile(values: number[], q: number): number {
  if (values.length === 0) {
    return 0;
  }

  const position = (values.length - 1) * q;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return values[lowerIndex] ?? 0;
  }

  const lower = values[lowerIndex] ?? 0;
  const upper = values[upperIndex] ?? 0;
  return lower + (upper - lower) * (position - lowerIndex);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function signedValue(direction: StackDirection, value: number): number {
  return direction === "+" ? value : -value;
}

function isInSpec(total: number, lower: number | null, upper: number | null): boolean {
  if (lower !== null && total < lower) {
    return false;
  }

  if (upper !== null && total > upper) {
    return false;
  }

  return lower !== null || upper !== null;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;

  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
