"use client";

import { downloadPdfReport } from "../lib/pdf-export";
import type { MonteCarloResult } from "../lib/monte-carlo";
import type { StackCalculationResult, StackRow } from "../lib/types";
import type { ValidationResult } from "../lib/validation";

interface UsePdfExportOptions {
  rows: StackRow[];
  validation: ValidationResult;
  result: StackCalculationResult | null;
  monteCarloResult: MonteCarloResult | null;
}

export function usePdfExport({ rows, validation, result, monteCarloResult }: UsePdfExportOptions) {
  function exportPdfReport() {
    downloadPdfReport({
      rows,
      validation,
      result,
      monteCarloResult
    });
  }

  return { exportPdfReport };
}
