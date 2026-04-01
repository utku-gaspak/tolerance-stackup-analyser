import { describe, expect, it } from "vitest";
import { buildPdfReportData } from "../lib/pdf-report-data";
import { calculateStackup } from "../lib/stackup";
import { runMonteCarloSimulation } from "../lib/monte-carlo";
import { defaultSampleRows } from "../lib/sample-data";
import { validateStackRows } from "../lib/validation";

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
      generatedAt: new Date("2026-04-01T15:30:00Z")
    });

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
    expect(report.notes).toContain("Worst-case is deterministic and conservative.");
  });
});
