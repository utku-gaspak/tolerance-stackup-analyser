import { describe, expect, it } from "vitest";
import { calculateStackup } from "../lib/stackup";
import { validateStackRows } from "../lib/validation";
import type { StackRow } from "../lib/types";

describe("stackup calculations", () => {
  it("matches V-01 all positive contributors", () => {
    const rows = [
      row("1", "+", "10.00", "0.10", "0.10"),
      row("2", "+", "20.00", "0.20", "0.20"),
      row("3", "+", "5.00", "0.05", "0.05")
    ];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(35, 6);
    expect(result.worstCaseMin).toBeCloseTo(34.65, 6);
    expect(result.worstCaseMax).toBeCloseTo(35.35, 6);
    expect(result.rssTolerance).toBeCloseTo(0.2291287847, 6);
    expect(result.rssMin).toBeCloseTo(34.7708712153, 6);
    expect(result.rssMax).toBeCloseTo(35.2291287847, 6);
  });

  it("matches V-02 mixed directions", () => {
    const rows = [
      row("1", "+", "50.00", "0.10", "0.10"),
      row("2", "-", "20.00", "0.20", "0.20"),
      row("3", "+", "5.00", "0.05", "0.05")
    ];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(35, 6);
    expect(result.worstCaseMin).toBeCloseTo(34.65, 6);
    expect(result.worstCaseMax).toBeCloseTo(35.35, 6);
  });

  it("matches V-03 asymmetric tolerances", () => {
    const rows = [
      row("1", "+", "100.00", "0.30", "0.10"),
      row("2", "-", "40.00", "0.20", "0.40")
    ];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(60, 6);
    expect(result.worstCaseMin).toBeCloseTo(59.7, 6);
    expect(result.worstCaseMax).toBeCloseTo(60.7, 6);
    expect(result.rssTolerance).toBeCloseTo(0.3605551275, 6);
  });

  it("allows zero tolerance rows for V-04", () => {
    const rows = [row("1", "+", "10.00", "0.00", "0.00"), row("2", "+", "2.00", "0.10", "0.10")];

    const validation = validateStackRows(rows);
    const result = calculateStackup(validation.parsedRows);

    expect(validation.isValid).toBe(true);
    expect(result.totalNominal).toBeCloseTo(12, 6);
    expect(result.worstCaseMin).toBeCloseTo(11.9, 6);
    expect(result.worstCaseMax).toBeCloseTo(12.1, 6);
    expect(result.rssTolerance).toBeCloseTo(0.1, 6);
  });

  it("handles mixed directions with asymmetric tolerances", () => {
    const rows = [
      row("1", "+", "100.00", "0.30", "0.10"),
      row("2", "-", "40.00", "0.20", "0.40"),
      row("3", "-", "10.00", "0.05", "0.15")
    ];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(50, 6);
    expect(result.worstCaseMin).toBeCloseTo(49.65, 6);
    expect(result.worstCaseMax).toBeCloseTo(50.85, 6);
    expect(result.rssTolerance).toBeCloseTo(0.3741657387, 6);
    expect(result.rssMin).toBeCloseTo(49.6258342613, 6);
    expect(result.rssMax).toBeCloseTo(50.3741657387, 6);
  });

  it("handles a single subtractive contributor", () => {
    const rows = [row("1", "-", "10.00", "0.20", "0.10")];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(-10, 6);
    expect(result.worstCaseMin).toBeCloseTo(-10.2, 6);
    expect(result.worstCaseMax).toBeCloseTo(-9.9, 6);
    expect(result.rssTolerance).toBeCloseTo(0.15, 6);
    expect(result.rssMin).toBeCloseTo(-10.15, 6);
    expect(result.rssMax).toBeCloseTo(-9.85, 6);
  });

  it("keeps precision across large and tiny tolerance contributors", () => {
    const rows = [
      row("1", "+", "1000.00", "5.00", "5.00"),
      row("2", "+", "1.00", "0.0001", "0.0001")
    ];

    const result = calculateStackup(validateStackRows(rows).parsedRows);

    expect(result.totalNominal).toBeCloseTo(1001, 6);
    expect(result.worstCaseMin).toBeCloseTo(995.9999, 6);
    expect(result.worstCaseMax).toBeCloseTo(1006.0001, 6);
    expect(result.rssTolerance).toBeCloseTo(5.000000001, 6);
  });
});

describe("validation", () => {
  it("rejects invalid input states for V-05", () => {
    const validation = validateStackRows([
      row("1", "+", "", "0.10", "0.10"),
      row("2", "+", "abc", "0.10", "0.10"),
      row("3", "+", "10.00", "-0.10", "0.10"),
      row("4", "+", "10.00", "0.10", "-0.10"),
      row("5", "", "10.00", "0.10", "0.10")
    ]);

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1", field: "nominal" }),
        expect.objectContaining({ id: "2", field: "nominal" }),
        expect.objectContaining({ id: "3", field: "plusTolerance" }),
        expect.objectContaining({ id: "4", field: "minusTolerance" }),
        expect.objectContaining({ id: "5", field: "direction" })
      ])
    );
  });
});

function row(
  id: string,
  direction: StackRow["direction"],
  nominal: string,
  plusTolerance: string,
  minusTolerance: string
): StackRow {
  return {
    id,
    label: `Row ${id}`,
    nominal,
    plusTolerance,
    minusTolerance,
    direction
  };
}
