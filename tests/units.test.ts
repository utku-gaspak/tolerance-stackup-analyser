import { describe, expect, it } from "vitest";
import type { SavedStackVariant, StackRow } from "../lib/types";
import {
  convertCalculationResult,
  convertLength,
  convertMonteCarloResult,
  convertRows,
  convertSavedVariants,
  convertSpecLimits
} from "../lib/units";

describe("engineering unit conversion", () => {
  it("converts scalar lengths between millimeters and inches", () => {
    expect(convertLength(25.4, "mm", "in")).toBeCloseTo(1, 8);
    expect(convertLength(1, "in", "mm")).toBeCloseTo(25.4, 8);
  });

  it("converts editable stack rows while preserving blank fields", () => {
    const rows: StackRow[] = [
      {
        id: "row-1",
        label: "Spacer",
        nominal: "25.4",
        plusTolerance: "0.254",
        minusTolerance: "0.127",
        direction: "+"
      },
      {
        id: "row-2",
        label: "Gap",
        nominal: "",
        plusTolerance: "",
        minusTolerance: "",
        direction: "-"
      }
    ];

    const converted = convertRows(rows, "mm", "in");

    expect(converted[0]).toMatchObject({
      nominal: "1",
      plusTolerance: "0.01",
      minusTolerance: "0.005"
    });
    expect(converted[1]).toMatchObject({
      nominal: "",
      plusTolerance: "",
      minusTolerance: ""
    });
  });

  it("converts deterministic, Monte Carlo, spec-limit, and saved-variant data together", () => {
    const result = {
      totalNominal: 25.4,
      worstCaseMin: 25.1,
      worstCaseMax: 25.7,
      rssTolerance: 0.2,
      rssMin: 25.2,
      rssMax: 25.6
    };
    const monteCarloResult = {
      sampleCount: 1000,
      mean: 25.4,
      min: 25.15,
      max: 25.65,
      p05: 25.22,
      p95: 25.58,
      passCount: 950,
      failCount: 50,
      passRate: 0.95,
      lowerSpecLimit: 25.2,
      upperSpecLimit: 25.6,
      histogram: [{ min: 25.15, max: 25.2, count: 20 }],
      seed: 7
    };
    const specLimits = { lower: 25.2, upper: 25.6 };
    const variants: SavedStackVariant[] = [
      {
        id: "variant-1",
        name: "Variant 1",
        unit: "mm" as const,
        rowCount: 1,
        rows: [
          {
            id: "row-1",
            label: "Spacer",
            nominal: "25.4",
            plusTolerance: "0.2",
            minusTolerance: "0.2",
            direction: "+"
          }
        ],
        result
      }
    ];

    expect(convertCalculationResult(result, "mm", "in").totalNominal).toBeCloseTo(1, 8);
    expect(convertMonteCarloResult(monteCarloResult, "mm", "in").upperSpecLimit).toBeCloseTo(1.007874, 6);
    expect(convertSpecLimits(specLimits, "mm", "in").lower).toBeCloseTo(0.992126, 6);

    const convertedVariants = convertSavedVariants(variants, "mm", "in");
    expect(convertedVariants[0]?.unit).toBe("in");
    expect(Number(convertedVariants[0]?.rows[0]?.nominal)).toBeCloseTo(1, 4);
    expect(convertedVariants[0]?.result.totalNominal).toBeCloseTo(1, 8);
  });
});
