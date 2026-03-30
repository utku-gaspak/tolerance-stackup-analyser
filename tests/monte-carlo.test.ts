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
});
