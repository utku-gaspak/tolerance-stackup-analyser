"use client";

import { buildStackRowsCsv, parseStackRowsCsv } from "../lib/csv";
import type { StackRow } from "../lib/types";

interface UseCsvImportExportOptions {
  rows: StackRow[];
  onRowsImported: (rows: StackRow[]) => void;
}

export function useCsvImportExport({ rows, onRowsImported }: UseCsvImportExportOptions) {
  function exportRowsCsv() {
    const csv = buildStackRowsCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "tolerance-stackup-rows.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function importRowsCsv(file: File): Promise<boolean> {
    try {
      const csv = await file.text();
      onRowsImported(parseStackRowsCsv(csv));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to import CSV.";
      window.alert(message);
      return false;
    }
  }

  return {
    exportRowsCsv,
    importRowsCsv
  };
}
