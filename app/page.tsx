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
    <main className="mx-auto flex min-h-screen w-full max-w-8xl flex-col gap-6 px-3 py-4 sm:px-5 lg:px-6">
      <section className="flex flex-col gap-3 border border-neutral-900 bg-white p-5">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-700">Engineering calculator</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Tolerance Stackup Analysis
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-neutral-700 sm:text-base">
            Define a 1D stack, edit tolerances inline, and validate worst-case and RSS behavior against engineering
            reference cases.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
          <span className="border border-neutral-900 bg-neutral-100 px-3 py-1.5">F-01 / F-02 / F-03</span>
          <span className="border border-neutral-900 bg-neutral-100 px-3 py-1.5">V-01 to V-05</span>
          <span className="border border-neutral-900 bg-neutral-100 px-3 py-1.5">Units: mm</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {PRESET_LABELS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => loadPreset(preset)}
              className="border border-neutral-900 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
            >
              Load {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Add row
          </button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
        <StackTable
          rows={rows}
          onAddRow={addRow}
          onDeleteRow={deleteRow}
          onChangeRow={updateRow}
          errorsByRow={errorsByRow}
          equationTotal={result?.totalNominal ?? null}
          equationIsValid={validation.isValid}
        />

        <div className="flex flex-col gap-6">
          <ResultsPanel
            result={result}
            isValid={validation.isValid}
            errorCount={validation.errors.length}
            errors={validation.errors}
            zeroToleranceRows={zeroToleranceRows}
          />

          <aside className="flex h-full flex-col gap-3 border border-neutral-900 bg-white p-5 text-neutral-900">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700">Status</p>
            <h2 className="text-xl font-semibold text-neutral-950">Core scaffold is live</h2>
            <p className="text-sm leading-6 text-neutral-700">
              The app shell, sample presets, editable rows, and calculation results are wired together. Validation now
              blocks incorrect input.
            </p>

            <div className="mt-1 border border-neutral-900 bg-neutral-100 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-700">Current rows</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950 tabular-nums">{rows.length}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
