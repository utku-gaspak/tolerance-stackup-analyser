import { describe, expect, it } from "vitest";
import { runMonteCarloSimulation } from "../lib/monte-carlo";
import type { ParsedStackRow } from "../lib/types";

describe("Monte Carlo simulation", () => {
  it("returns a deterministic result for a fixed seed", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.1, minusTolerance: 0.1, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.2, minusTolerance: 0.2, direction: "+" }
    ];

    const result = runMonteCarloSimulation(rows, 1000, 42);

    expect(result.sampleCount).toBe(1000);
    expect(result.min).toBeLessThanOrEqual(result.mean);
    expect(result.max).toBeGreaterThanOrEqual(result.mean);
    expect(result.histogram.length).toBeGreaterThan(0);
  });

  it("keeps zero-tolerance rows fixed in the sampled distribution", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 12, plusTolerance: 0, minusTolerance: 0, direction: "+" },
      { id: "2", label: "B", nominal: 3, plusTolerance: 0, minusTolerance: 0, direction: "-" }
    ];

    const result = runMonteCarloSimulation(rows, 250, 7);

    expect(result.min).toBeCloseTo(9, 6);
    expect(result.max).toBeCloseTo(9, 6);
    expect(result.mean).toBeCloseTo(9, 6);
    expect(result.p05).toBeCloseTo(9, 6);
    expect(result.p95).toBeCloseTo(9, 6);
    expect(result.histogram).toEqual([{ min: 9, max: 9, count: 250 }]);
  });

  it("reports 100 percent yield when all samples are in spec", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 12, plusTolerance: 0, minusTolerance: 0, direction: "+" },
      { id: "2", label: "B", nominal: 3, plusTolerance: 0, minusTolerance: 0, direction: "-" }
    ];

    const result = runMonteCarloSimulation(rows, 100, 7, { lower: 9, upper: 9 });

    expect(result.passRate).toBe(1);
    expect(result.passCount).toBe(100);
    expect(result.failCount).toBe(0);
    expect(result.lowerSpecLimit).toBe(9);
    expect(result.upperSpecLimit).toBe(9);
  });

  it("supports a lower-only spec limit", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 12, plusTolerance: 0, minusTolerance: 0, direction: "+" },
      { id: "2", label: "B", nominal: 3, plusTolerance: 0, minusTolerance: 0, direction: "-" }
    ];

    const result = runMonteCarloSimulation(rows, 50, 11, { lower: 9, upper: null });

    expect(result.passRate).toBe(1);
    expect(result.passCount).toBe(50);
    expect(result.failCount).toBe(0);
    expect(result.lowerSpecLimit).toBe(9);
    expect(result.upperSpecLimit).toBeNull();
  });

  it("supports an upper-only spec limit", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 12, plusTolerance: 0, minusTolerance: 0, direction: "+" },
      { id: "2", label: "B", nominal: 3, plusTolerance: 0, minusTolerance: 0, direction: "-" }
    ];

    const result = runMonteCarloSimulation(rows, 50, 11, { lower: null, upper: 8.5 });

    expect(result.passRate).toBe(0);
    expect(result.passCount).toBe(0);
    expect(result.failCount).toBe(50);
    expect(result.lowerSpecLimit).toBeNull();
    expect(result.upperSpecLimit).toBe(8.5);
  });

  it("handles asymmetric mixed-direction rows with spec limits", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "Base", nominal: 100, plusTolerance: 0.3, minusTolerance: 0.1, direction: "+" },
      { id: "2", label: "Pocket", nominal: 40, plusTolerance: 0.2, minusTolerance: 0.4, direction: "-" },
      { id: "3", label: "Shim", nominal: 10, plusTolerance: 0.05, minusTolerance: 0.15, direction: "-" }
    ];

    const result = runMonteCarloSimulation(rows, 500, 21, { lower: 49.8, upper: 50.2 });

    expect(result.lowerSpecLimit).toBe(49.8);
    expect(result.upperSpecLimit).toBe(50.2);
    expect(result.passCount).not.toBeNull();
    expect(result.failCount).not.toBeNull();
    expect((result.passCount ?? 0) + (result.failCount ?? 0)).toBe(500);
    expect(result.passRate).toBeGreaterThan(0);
    expect(result.passRate).toBeLessThan(1);
    expect(result.p05).toBeLessThanOrEqual(result.p95);
    expect(result.min).toBeLessThanOrEqual(result.mean);
    expect(result.max).toBeGreaterThanOrEqual(result.mean);
  });

  it("rejects non-positive sample counts", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.1, minusTolerance: 0.1, direction: "+" }
    ];

    expect(() => runMonteCarloSimulation(rows, 0, 1)).toThrow("Sample count must be a positive integer.");
    expect(() => runMonteCarloSimulation(rows, -5, 1)).toThrow("Sample count must be a positive integer.");
  });
});
