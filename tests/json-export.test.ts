import { describe, expect, it } from "vitest";
import { buildReportJson } from "../lib/json-export";
import { calculateStackup } from "../lib/stackup";
import { runMonteCarloSimulation } from "../lib/monte-carlo";
import { defaultSampleRows } from "../lib/sample-data";
import { validateStackRows } from "../lib/validation";

describe("JSON report export", () => {
  it("serializes the full report payload as formatted JSON", () => {
    const validation = validateStackRows(defaultSampleRows);
    const result = calculateStackup(validation.parsedRows);
    const monteCarloResult = runMonteCarloSimulation(validation.parsedRows, 1000, 42);

    const json = buildReportJson({
      rows: defaultSampleRows,
      validation,
      result,
      monteCarloResult,
      engineeringUnit: "in",
      generatedAt: new Date("2026-04-01T15:30:00Z")
    });

    const parsed = JSON.parse(json) as {
      engineeringUnit: string;
      rowCount: number;
      validationStatus: string;
      monteCarlo: { available: boolean };
      summaryMetrics: Array<{ label: string; value: string }>;
    };

    expect(json.endsWith("\n")).toBe(true);
    expect(parsed.engineeringUnit).toBe("in");
    expect(parsed.rowCount).toBe(3);
    expect(parsed.validationStatus).toBe("Valid");
    expect(parsed.monteCarlo.available).toBe(true);
    expect(parsed.summaryMetrics).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Total nominal", value: "35.0000" })])
    );
  });
});
