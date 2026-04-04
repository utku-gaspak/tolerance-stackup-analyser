"use client";

import { downloadReportJson } from "../lib/json-export";
import { downloadPdfReport } from "../lib/pdf-export";
import type { MonteCarloResult } from "../lib/monte-carlo";
import type { StackCalculationResult, StackRow } from "../lib/types";
import type { ValidationResult } from "../lib/validation";

interface UseReportExportOptions {
  rows: StackRow[];
  validation: ValidationResult;
  result: StackCalculationResult | null;
  monteCarloResult: MonteCarloResult | null;
}

export function useReportExport({ rows, validation, result, monteCarloResult }: UseReportExportOptions) {
  const input = {
    rows,
    validation,
    result,
    monteCarloResult
  };

  function exportPdfReport() {
    downloadPdfReport(input);
  }

  function exportJsonReport() {
    downloadReportJson(input);
  }

  return {
    exportPdfReport,
    exportJsonReport
  };
}
