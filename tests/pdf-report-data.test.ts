import { describe, expect, it } from "vitest";
import { buildPdfReportData } from "../lib/pdf-report-data";
import { calculateStackup } from "../lib/stackup";
import { runMonteCarloSimulation } from "../lib/monte-carlo";
import { defaultSampleRows } from "../lib/sample-data";
import { validateStackRows } from "../lib/validation";
import type { StackRow } from "../lib/types";

describe("PDF report data", () => {
  it("builds a full report model from the current stack state", () => {
    const validation = validateStackRows(defaultSampleRows);
    const result = calculateStackup(validation.parsedRows);
    const monteCarloResult = runMonteCarloSimulation(validation.parsedRows, 1000, 42);

    const report = buildPdfReportData({
      rows: defaultSampleRows,
      validation,
      result,
      monteCarloResult,
      engineeringUnit: "mm",
      generatedAt: new Date("2026-04-01T15:30:00Z")
    });

    expect(report.engineeringUnit).toBe("mm");
    expect(report.rowCount).toBe(3);
    expect(report.validationStatus).toBe("Valid");
    expect(report.summaryMetrics[0]).toEqual({ label: "Total nominal", value: "35.0000" });
    expect(report.equationExpression).toContain("1:+10.00");
    expect(report.monteCarlo.available).toBe(true);
    expect(report.monteCarlo.summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Samples", value: "1000" }),
        expect.objectContaining({ label: "Seed", value: "42" })
      ])
    );
    expect(report.monteCarlo.note).toContain("estimate, not a guarantee");
    expect(report.notes).toContain("Monte Carlo uses bounded normal sampling centered on nominal values.");
    expect(report.notes).toContain("Worst-case is deterministic and conservative.");
  });

  it("builds a blocked report model when validation fails and Monte Carlo is unavailable", () => {
    const rows: StackRow[] = [
      {
        id: "row-1",
        label: " ",
        nominal: "10.00",
        plusTolerance: "0.10",
        minusTolerance: "0.10",
        direction: "+"
      },
      {
        id: "row-2",
        label: "Cutout",
        nominal: "",
        plusTolerance: "0.20",
        minusTolerance: "0.20",
        direction: ""
      }
    ];
    const validation = validateStackRows(rows);

    const report = buildPdfReportData({
      rows,
      validation,
      result: null,
      monteCarloResult: null,
      engineeringUnit: "mm",
      generatedAt: new Date("2026-04-01T15:30:00Z")
    });

    expect(report.validationStatus).toBe("Blocked");
    expect(report.summaryMetrics).toEqual([]);
    expect(report.validationSummary).toEqual(
      expect.arrayContaining([
        { label: "Status", value: "Blocked" },
        { label: "Rows", value: "2" },
        { label: "Errors", value: String(validation.errors.length) }
      ])
    );
    expect(report.validationErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: "row-1", field: "label" }),
        expect.objectContaining({ row: "row-2", field: "nominal" }),
        expect.objectContaining({ row: "row-2", field: "direction" })
      ])
    );
    expect(report.monteCarlo.available).toBe(false);
    expect(report.monteCarlo.summary).toEqual([]);
    expect(report.monteCarlo.note).toBe("Monte Carlo was not run for this report.");
    expect(report.rows[0]).toMatchObject({ label: "", contribution: "+10.00" });
    expect(report.rows[1]).toMatchObject({ label: "Cutout", contribution: "—" });
  });

  it("includes spec-check and yield fields when Monte Carlo limits are configured", () => {
    const validation = validateStackRows(defaultSampleRows);
    const result = calculateStackup(validation.parsedRows);
    const monteCarloResult = runMonteCarloSimulation(validation.parsedRows, 1000, 42, {
      lower: 34.8,
      upper: 35.2
    });

    const report = buildPdfReportData({
      rows: defaultSampleRows,
      validation,
      result,
      monteCarloResult,
      engineeringUnit: "in",
      generatedAt: new Date("2026-04-01T15:30:00Z")
    });

    expect(report.validationSummary).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Unit", value: "in" })])
    );
    expect(report.summaryMetrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Spec check", value: "NO-GO" })])
    );
    expect(report.monteCarlo.summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Yield" }),
        expect.objectContaining({ label: "In spec", value: `${monteCarloResult.passCount}/${monteCarloResult.sampleCount}` })
      ])
    );
    expect(report.monteCarlo.note).toContain("configured spec limits");
    expect(report.monteCarlo.note).toContain("estimate, not a guarantee");
    expect(report.notes).toContain("Report values are expressed in in.");
  });
});
