import { describe, expect, it } from "vitest";
import { buildVariantComparison } from "../lib/variant-comparison";
import type { SavedStackVariant } from "../lib/types";

describe("variant comparison", () => {
  it("builds comparison metrics between two saved variants", () => {
    const left: SavedStackVariant = {
      id: "a",
      name: "Variant 1",
      unit: "mm",
      rowCount: 3,
      rows: [],
      result: {
        totalNominal: 35,
        worstCaseMin: 34.65,
        worstCaseMax: 35.35,
        rssTolerance: 0.23,
        rssMin: 34.77,
        rssMax: 35.23
      }
    };
    const right: SavedStackVariant = {
      id: "b",
      name: "Variant 2",
      unit: "mm",
      rowCount: 3,
      rows: [],
      result: {
        totalNominal: 35.5,
        worstCaseMin: 35.1,
        worstCaseMax: 35.9,
        rssTolerance: 0.2,
        rssMin: 35.3,
        rssMax: 35.7
      }
    };

    const comparison = buildVariantComparison(left, right);

    expect(comparison?.leftName).toBe("Variant 1");
    expect(comparison?.rightName).toBe("Variant 2");
    expect(comparison?.unit).toBe("mm");
    expect(comparison?.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Total nominal", leftValue: "35.0000", rightValue: "35.5000", delta: "+0.5000" }),
        expect.objectContaining({ label: "Worst-case span", leftValue: "0.7000", rightValue: "0.8000", delta: "+0.1000" }),
        expect.objectContaining({ label: "RSS tolerance", leftValue: "0.2300", rightValue: "0.2000", delta: "-0.0300" })
      ])
    );
  });

  it("returns null until both variants are selected", () => {
    const variant: SavedStackVariant = {
      id: "a",
      name: "Variant 1",
      unit: "in",
      rowCount: 1,
      rows: [],
      result: {
        totalNominal: 1,
        worstCaseMin: 0.9,
        worstCaseMax: 1.1,
        rssTolerance: 0.1,
        rssMin: 0.9,
        rssMax: 1.1
      }
    };

    expect(buildVariantComparison(variant, null)).toBeNull();
    expect(buildVariantComparison(null, variant)).toBeNull();
  });
});
