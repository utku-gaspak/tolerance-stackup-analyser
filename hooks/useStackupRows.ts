"use client";

import { useState } from "react";
import { defaultSampleRows, samplePresets } from "../lib/sample-data";
import type { StackRow } from "../lib/types";

interface UseStackupRowsOptions {
  onRowsReplaced?: () => void;
}

export function useStackupRows({ onRowsReplaced }: UseStackupRowsOptions = {}) {
  const [rows, setRows] = useState<StackRow[]>(defaultSampleRows);

  function updateRow(id: string, field: keyof StackRow, value: string) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: `row-${Date.now()}`,
        label: "New element",
        nominal: "0.00",
        plusTolerance: "0.00",
        minusTolerance: "0.00",
        direction: "+"
      }
    ]);
  }

  function deleteRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function replaceRows(nextRows: StackRow[]) {
    setRows(nextRows);
    onRowsReplaced?.();
  }

  function loadPreset(preset: keyof typeof samplePresets) {
    replaceRows(samplePresets[preset].map((row) => ({ ...row })));
  }

  return {
    rows,
    setRows,
    updateRow,
    addRow,
    deleteRow,
    replaceRows,
    loadPreset
  };
}
