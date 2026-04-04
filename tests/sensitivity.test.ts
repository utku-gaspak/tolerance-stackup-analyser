import { describe, expect, it } from "vitest";
import { calculateSensitivityAnalysis, getSensitivityDominanceWarning } from "../lib/sensitivity";
import type { ParsedStackRow } from "../lib/types";

describe("sensitivity analysis", () => {
  it("ranks the largest RSS contributors first", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.1, minusTolerance: 0.1, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.3, minusTolerance: 0.3, direction: "+" },
      { id: "3", label: "C", nominal: 5, plusTolerance: 0.05, minusTolerance: 0.05, direction: "-" }
    ];

    const sensitivity = calculateSensitivityAnalysis(rows);

    expect(sensitivity[0]?.label).toBe("B");
    expect(sensitivity[0]?.rssShare).toBeGreaterThan(sensitivity[1]?.rssShare ?? 0);
    expect(sensitivity[1]?.rssShare).toBeGreaterThan(sensitivity[2]?.rssShare ?? 0);
    expect(sensitivity.reduce((sum, item) => sum + item.rssShare, 0)).toBeCloseTo(1, 6);
  });

  it("handles zero-tolerance rows without breaking ranking", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0, minusTolerance: 0, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.2, minusTolerance: 0.2, direction: "-" }
    ];

    const sensitivity = calculateSensitivityAnalysis(rows);

    expect(sensitivity[0]?.label).toBe("B");
    expect(sensitivity[1]?.rssShare).toBe(0);
  });

  it("flags a single row when it dominates RSS share", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.4, minusTolerance: 0.4, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.1, minusTolerance: 0.1, direction: "+" },
      { id: "3", label: "C", nominal: 5, plusTolerance: 0.05, minusTolerance: 0.05, direction: "-" }
    ];

    const warning = getSensitivityDominanceWarning(calculateSensitivityAnalysis(rows));

    expect(warning?.title).toBe("Single-row dominance");
    expect(warning?.message).toContain("A");
    expect(warning?.message).toContain("RSS contribution");
  });

  it("flags the top two rows when they dominate together but not individually", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.3, minusTolerance: 0.3, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.29, minusTolerance: 0.29, direction: "+" },
      { id: "3", label: "C", nominal: 5, plusTolerance: 0.15, minusTolerance: 0.15, direction: "-" }
    ];

    const warning = getSensitivityDominanceWarning(calculateSensitivityAnalysis(rows));

    expect(warning?.title).toBe("Two-row dominance");
    expect(warning?.message).toContain("A and B");
    expect(warning?.message).toContain("together");
  });

  it("returns no warning when RSS share is broadly distributed", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.2, minusTolerance: 0.2, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.19, minusTolerance: 0.19, direction: "+" },
      { id: "3", label: "C", nominal: 5, plusTolerance: 0.18, minusTolerance: 0.18, direction: "-" }
    ];

    expect(getSensitivityDominanceWarning(calculateSensitivityAnalysis(rows))).toBeNull();
  });
});
