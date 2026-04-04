import type { MonteCarloResult } from "./monte-carlo";
import type { StackCalculationResult, StackRow } from "./types";
import type { ValidationResult } from "./validation";
import { evaluateSpecLimits } from "./spec-limits";

export interface PdfReportInput {
  rows: StackRow[];
  validation: ValidationResult;
  result: StackCalculationResult | null;
  monteCarloResult: MonteCarloResult | null;
  generatedAt?: Date;
}

export interface PdfReportData {
  generatedAtLabel: string;
  rowCount: number;
  validationStatus: string;
  validationSummary: Array<{ label: string; value: string }>;
  validationErrors: Array<{ row: string; field: string; message: string }>;
  rows: Array<{
    index: number;
    label: string;
    direction: string;
    nominal: string;
    plusTolerance: string;
    minusTolerance: string;
    contribution: string;
  }>;
  equationExpression: string;
  summaryMetrics: Array<{ label: string; value: string }>;
  monteCarlo: {
    available: boolean;
    sampleCount: number;
    summary: Array<{ label: string; value: string }>;
    histogram: Array<{ range: string; bar: string; count: string }>;
    note: string;
  };
  notes: string[];
}

export function buildPdfReportData({ rows, validation, result, monteCarloResult, generatedAt = new Date() }: PdfReportInput): PdfReportData {
  const summaryMetrics = result
    ? [
        { label: "Total nominal", value: formatNumber(result.totalNominal) },
        { label: "Worst-case min", value: formatNumber(result.worstCaseMin) },
        { label: "Worst-case max", value: formatNumber(result.worstCaseMax) },
        { label: "RSS tolerance", value: formatNumber(result.rssTolerance) },
        { label: "RSS min", value: formatNumber(result.rssMin) },
        { label: "RSS max", value: formatNumber(result.rssMax) },
        ...(monteCarloResult?.lowerSpecLimit !== null || monteCarloResult?.upperSpecLimit !== null
          ? [
              {
                label: "Spec check",
                value: evaluateSpecLimits(result, {
                  lower: monteCarloResult?.lowerSpecLimit ?? null,
                  upper: monteCarloResult?.upperSpecLimit ?? null
                }).status.toUpperCase()
              }
            ]
          : [])
      ]
    : [];

  const validationSummary = [
    { label: "Status", value: validation.isValid ? "Valid" : "Blocked" },
    { label: "Rows", value: String(rows.length) },
    { label: "Errors", value: String(validation.errors.length) },
    {
      label: "Zero tolerance rows",
      value: String(validation.parsedRows.filter((row) => row.plusTolerance === 0 && row.minusTolerance === 0).length)
    }
  ];

  const validationErrors = validation.errors.map((error) => ({
    row: error.id,
    field: error.field,
    message: error.message
  }));

  const monteCarlo = monteCarloResult
    ? {
        available: true,
        sampleCount: monteCarloResult.sampleCount,
        summary: [
          { label: "Samples", value: String(monteCarloResult.sampleCount) },
          { label: "Seed", value: String(monteCarloResult.seed) },
          { label: "Mean", value: formatNumber(monteCarloResult.mean) },
          { label: "Min", value: formatNumber(monteCarloResult.min) },
          { label: "Max", value: formatNumber(monteCarloResult.max) },
          { label: "P05", value: formatNumber(monteCarloResult.p05) },
          { label: "P95", value: formatNumber(monteCarloResult.p95) },
          ...(monteCarloResult.passRate !== null
            ? [
                { label: "Yield", value: `${(monteCarloResult.passRate * 100).toFixed(1)}%` },
                { label: "In spec", value: `${monteCarloResult.passCount}/${monteCarloResult.sampleCount}` }
              ]
            : [])
        ],
        histogram: monteCarloResult.histogram.map((bin) => ({
          range: `${formatNumber(bin.min)} to ${formatNumber(bin.max)}`,
          bar: createHistogramBar(bin.count, monteCarloResult.sampleCount),
          count: String(bin.count)
        })),
        note:
          monteCarloResult.passRate !== null
            ? `Normal sampling with sigma approximated from row tolerance and clipped to bounds. Yield is evaluated against the configured spec limits.`
            : "Normal sampling with sigma approximated from row tolerance and clipped to bounds."
      }
    : {
        available: false,
        sampleCount: 0,
        summary: [],
        histogram: [],
        note: "Monte Carlo was not run for this report."
      };

  return {
    generatedAtLabel: formatTimestamp(generatedAt),
    rowCount: rows.length,
    validationStatus: validation.isValid ? "Valid" : "Blocked",
    validationSummary,
    validationErrors,
    rows: rows.map((row, index) => ({
      index: index + 1,
      label: row.label.trim(),
      direction: row.direction || "",
      nominal: row.nominal.trim(),
      plusTolerance: row.plusTolerance.trim(),
      minusTolerance: row.minusTolerance.trim(),
      contribution: formatContribution(row.nominal, row.direction)
    })),
    equationExpression: rows
      .map((row, index) => `${index + 1}:${formatContribution(row.nominal, row.direction)}`)
      .join("  "),
    summaryMetrics,
    monteCarlo,
    notes: [
      "1D linear chain only.",
      "RSS assumes independent contributors.",
      "Asymmetric tolerances are allowed.",
      "Worst-case is deterministic and conservative.",
      "RSS and Monte Carlo are approximations, not guarantees.",
      "Units must remain consistent across the stack."
    ]
  };
}

function formatNumber(value: number): string {
  return value.toFixed(4);
}

function formatContribution(nominal: string, direction: StackRow["direction"]): string {
  const trimmed = nominal.trim();

  if (!trimmed) {
    return "—";
  }

  const parsed = Number(trimmed);
  const numeric = Number.isFinite(parsed) ? parsed.toFixed(2) : "—";

  if (direction === "+") {
    return `+${numeric}`;
  }

  if (direction === "-") {
    return `-${numeric}`;
  }

  return numeric;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function createHistogramBar(count: number, total: number): string {
  const width = total > 0 ? Math.max(1, Math.round((count / total) * 20)) : 1;
  return "█".repeat(width);
}
