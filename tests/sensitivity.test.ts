import { describe, expect, it } from "vitest";
import { calculateSensitivityAnalysis } from "../lib/sensitivity";
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
});
