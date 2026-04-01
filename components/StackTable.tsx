"use client";

import { useRef, type ChangeEvent } from "react";
import type { RowValidationError, StackDirection, StackRow } from "../lib/types";
import { StackRowEditor } from "./StackRowEditor";

interface StackTableProps {
  rows: StackRow[];
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  onImportRows: (file: File) => void;
  onExportRows: () => void;
  errorsByRow: Record<string, Partial<Record<RowValidationError["field"], string>>>;
  equationTotal: number | null;
  equationIsValid: boolean;
}

export function StackTable({
  rows,
  onChangeRow,
  onDeleteRow,
  onAddRow,
  onImportRows,
  onExportRows,
  errorsByRow,
  equationTotal,
  equationIsValid
}: StackTableProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const equationTokens = rows.map((row, index) => ({
    index: index + 1,
    signedNominal: formatSignedNominal(row.nominal, row.direction)
  }));

  function openImportDialog() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onImportRows(file);
    }

    event.target.value = "";
  }

  return (
    <section className="border border-neutral-900 bg-white p-4">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Stack definition</h2>
          <p className="mt-1 text-sm text-neutral-700">Edit rows inline. Calculation output will update from this state.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddRow}
            className="border border-neutral-900 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            Add row
          </button>
          <button
            type="button"
            onClick={openImportDialog}
            className="border border-neutral-900 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={onExportRows}
            className="border border-neutral-900 bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Export CSV
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-700">Stack equation</p>
            <p className="mt-1 text-sm text-neutral-700">Live signed nominal contribution by row.</p>
          </div>
          <div className="border border-neutral-900 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-950 tabular-nums">
            {equationIsValid && equationTotal !== null ? `${equationTotal.toFixed(2)} mm` : "Pending"}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {equationTokens.map((token) => (
            <span
              key={token.index}
              className="inline-flex items-center gap-2 border border-neutral-900 bg-white px-3 py-2 font-medium text-neutral-800"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">{token.index}</span>
              <span className="font-mono tabular-nums">{token.signedNominal}</span>
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-neutral-600">
          Contribution is the signed nominal term used in the equation. Tolerance propagation is shown separately in the
          results panel.
        </p>
      </div>

      <div className="mt-4 overflow-hidden border border-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-10" />
              <col className="w-[12.8%] min-w-[6.4rem]" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-[6.75rem]" />
              <col className="w-[8.1rem]" />
              <col className="w-24" />
            </colgroup>
            <thead className="bg-neutral-200 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">
              <tr>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-center">#</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-left">Label</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-right">Nominal (mm)</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-right">Upper Tol</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-right">Lower Tol</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-left">Direction</th>
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-right">Contribution</th>
                <th className="border-b border-neutral-900 px-3 py-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <StackRowEditor
                  key={row.id}
                  index={index + 1}
                  row={row}
                  onChangeRow={onChangeRow}
                  onDeleteRow={onDeleteRow}
                  errors={errorsByRow[row.id]}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function formatSignedNominal(nominal: string, direction: StackDirection | "") {
  const parsed = Number(nominal);
  if (!Number.isFinite(parsed)) {
    return "—";
  }

  const value = parsed.toFixed(2);
  if (direction === "+") {
    return `+${value}`;
  }
  if (direction === "-") {
    return `-${value}`;
  }
  return value;
}
