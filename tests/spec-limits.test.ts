import { describe, expect, it } from "vitest";
import { evaluateSpecLimits } from "../lib/spec-limits";
import type { StackCalculationResult } from "../lib/types";

describe("spec limit checks", () => {
  const result: StackCalculationResult = {
    totalNominal: 35,
    worstCaseMin: 34.65,
    worstCaseMax: 35.35,
    rssTolerance: 0.23,
    rssMin: 34.77,
    rssMax: 35.23
  };

  it("returns go when worst-case stays inside limits", () => {
    const check = evaluateSpecLimits(result, { lower: 34.5, upper: 35.5 });

    expect(check.status).toBe("go");
    expect(check.message).toContain("Worst-case stack stays inside");
  });

  it("returns no-go when the worst-case exceeds a limit", () => {
    const check = evaluateSpecLimits(result, { lower: 34.8, upper: 35.2 });

    expect(check.status).toBe("no-go");
    expect(check.message).toContain("below the lower spec limit");
  });

  it("returns no-go when the upper limit is exceeded", () => {
    const check = evaluateSpecLimits(result, { lower: 34.0, upper: 35.2 });

    expect(check.status).toBe("no-go");
    expect(check.message).toContain("exceeds the upper spec limit");
  });

  it("returns not-configured when no limits are set", () => {
    const check = evaluateSpecLimits(result, { lower: null, upper: null });

    expect(check.status).toBe("not-configured");
  });
});
