"use client";

import { downloadReportJson } from "../lib/json-export";
import { downloadPdfReport } from "../lib/pdf-export";
import type { MonteCarloResult } from "../lib/monte-carlo";
import type { EngineeringUnit, StackCalculationResult, StackRow } from "../lib/types";
import type { ValidationResult } from "../lib/validation";

interface UseReportExportOptions {
  rows: StackRow[];
  validation: ValidationResult;
  result: StackCalculationResult | null;
  monteCarloResult: MonteCarloResult | null;
  engineeringUnit: EngineeringUnit;
}

export function useReportExport({
  rows,
  validation,
  result,
  monteCarloResult,
  engineeringUnit
}: UseReportExportOptions) {
  const input = {
    rows,
    validation,
    result,
    monteCarloResult,
    engineeringUnit
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
