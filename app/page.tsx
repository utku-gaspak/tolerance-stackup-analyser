"use client";

import { useState } from "react";
import { ResultsPanel } from "../components/ResultsPanel";
import { StackTable } from "../components/StackTable";
import { defaultSampleRows, samplePresets } from "../lib/sample-data";
import { calculateStackup } from "../lib/stackup";
import type { StackRow } from "../lib/types";
import { validateStackRows } from "../lib/validation";

const PRESET_LABELS = ["V-01", "V-02", "V-03"] as const;

export default function Home() {
  const [rows, setRows] = useState<StackRow[]>(defaultSampleRows);
  const validation = validateStackRows(rows);
  const result = validation.isValid ? calculateStackup(validation.parsedRows) : null;
  const zeroToleranceRows = validation.parsedRows.filter(
    (row) => row.plusTolerance === 0 && row.minusTolerance === 0
  ).length;
  const errorsByRow = validation.errors.reduce<Record<string, Record<string, string>>>((accumulator, error) => {
    accumulator[error.id] ??= {};
    accumulator[error.id][error.field] = error.message;
    return accumulator;
  }, {});

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

  function loadPreset(preset: keyof typeof samplePresets) {
    setRows(samplePresets[preset].map((row) => ({ ...row })));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Engineering calculator</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Tolerance Stackup Analysis
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Define a 1D stack, edit tolerances inline, and validate worst-case and RSS behavior against engineering
            reference cases.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {PRESET_LABELS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => loadPreset(preset)}
              className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Load {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Add row
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <StackTable
          rows={rows}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          onChangeRow={updateRow}
          errorsByRow={errorsByRow}
        />

        <div className="flex flex-col gap-6">
          <ResultsPanel
            result={result}
            isValid={validation.isValid}
            errorCount={validation.errors.length}
            errors={validation.errors}
            zeroToleranceRows={zeroToleranceRows}
          />

          <aside className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Status</p>
            <h2 className="text-2xl font-semibold text-white">Core scaffold is live</h2>
            <p className="text-sm leading-6 text-slate-300">
              The app shell, sample presets, editable rows, and calculation results are wired together. Validation now
              blocks incorrect input.
            </p>

            <div className="mt-2 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current rows</p>
              <p className="mt-2 text-3xl font-semibold text-white">{rows.length}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
