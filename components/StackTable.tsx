"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { formatEngineeringValue } from "../lib/units";
import type { EngineeringUnit, RowValidationError, StackDirection, StackRow } from "../lib/types";
import { StackRowEditor } from "./StackRowEditor";

interface StackTableProps {
  rows: StackRow[];
  presetLabels: readonly ["V-01", "V-02", "V-03"];
  onLoadPreset: (preset: "V-01" | "V-02" | "V-03") => void;
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  onImportRows: (file: File) => void;
  onExportRows: () => void;
  whatIfGlobalPercent: number;
  onWhatIfGlobalPercentChange: (value: number) => void;
  whatIfRowPercents: Record<string, number>;
  onWhatIfRowPercentChange: (id: string, value: number) => void;
  errorsByRow: Record<string, Partial<Record<RowValidationError["field"], string>>>;
  equationTotal: number | null;
  equationIsValid: boolean;
  engineeringUnit: EngineeringUnit;
}

export function StackTable({
  rows,
  presetLabels,
  onLoadPreset,
  onChangeRow,
  onDeleteRow,
  onAddRow,
  onImportRows,
  onExportRows,
  whatIfGlobalPercent,
  onWhatIfGlobalPercentChange,
  whatIfRowPercents,
  onWhatIfRowPercentChange,
  errorsByRow,
  equationTotal,
  equationIsValid,
  engineeringUnit
}: StackTableProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isInputGuideOpen, setIsInputGuideOpen] = useState(false);
  const [isWhatIfPreviewOpen, setIsWhatIfPreviewOpen] = useState(false);
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
    <section className="flex h-full flex-col border border-neutral-900 bg-white p-4">
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
            {equationIsValid && equationTotal !== null ? `${formatEngineeringValue(equationTotal)} ${engineeringUnit}` : "Pending"}
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

      <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Reference presets</p>
            <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Load a known validation stack</h3>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">V-01 to V-03</p>
        </div>
        <p className="mt-3 text-xs leading-5 text-neutral-700">
          Load the documented validation cases before editing rows manually.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presetLabels.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onLoadPreset(preset)}
              className="border border-neutral-900 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Load {preset}
            </button>
          ))}
        </div>
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
                <th className="border-b border-r border-neutral-900 px-3 py-2 text-right">Nominal ({engineeringUnit})</th>
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

      <CollapsibleHelperBlock
        title="Input guide"
        subtitle="Validation rules"
        badge="Always active"
        isOpen={isInputGuideOpen}
        onToggle={() => setIsInputGuideOpen((current) => !current)}
        toggleLabelOpen="Hide Input Guide"
        toggleLabelClosed="Show Input Guide"
        summary="Collapsed help covers labels, numeric input, direction, and zero-tolerance rows."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="border border-neutral-900 bg-white p-2">
            Label is required and nominal must be a valid number.
          </div>
          <div className="border border-neutral-900 bg-white p-2">
            Upper and lower tolerances must be non-negative numbers in {engineeringUnit}. `0.00` is allowed.
          </div>
          <div className="border border-neutral-900 bg-white p-2">
            Select `+` to add a row to the stack or `-` to subtract it.
          </div>
          <div className="border border-neutral-900 bg-white p-2">
            Zero-tolerance rows stay fixed at nominal and are still valid.
          </div>
        </div>
      </CollapsibleHelperBlock>

      <CollapsibleHelperBlock
        title="What-if preview"
        subtitle={`Scale tolerances globally or row-by-row without changing the base stack.`}
        badge={`${whatIfGlobalPercent}% global`}
        isOpen={isWhatIfPreviewOpen}
        onToggle={() => setIsWhatIfPreviewOpen((current) => !current)}
        toggleLabelOpen="Hide What-if Preview"
        toggleLabelClosed="Show What-if Preview"
        summary="Scenario controls stay available for global scaling and row-level previews."
      >
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">Global tolerance scale</span>
          <input
            type="range"
            min={50}
            max={200}
            step={5}
            value={whatIfGlobalPercent}
            onChange={(event) => onWhatIfGlobalPercentChange(Number(event.target.value))}
            className="mt-2 w-full accent-neutral-900"
          />
        </label>

        <div className="mt-4 grid gap-2">
          {rows.map((row) => {
            const rowPercent = whatIfRowPercents[row.id] ?? 100;

            return (
              <div key={row.id} className="grid gap-2 rounded border border-neutral-900 bg-neutral-100 p-2 sm:grid-cols-[minmax(0,1fr)_10rem_4rem] sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-700">{row.label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-neutral-600">Local tolerance scale for this row.</p>
                </div>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={5}
                  value={rowPercent}
                  onChange={(event) => onWhatIfRowPercentChange(row.id, Number(event.target.value))}
                  className="w-full accent-neutral-900"
                />
                <div className="justify-self-start border border-neutral-900 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-800 tabular-nums">
                  {rowPercent}%
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleHelperBlock>
    </section>
  );
}

function CollapsibleHelperBlock({
  title,
  subtitle,
  badge,
  isOpen,
  onToggle,
  toggleLabelOpen,
  toggleLabelClosed,
  summary,
  children
}: {
  title: string;
  subtitle: string;
  badge: string;
  isOpen: boolean;
  onToggle: () => void;
  toggleLabelOpen: string;
  toggleLabelClosed: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-xs leading-5 text-neutral-700">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">{title}</p>
          <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">{subtitle}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">{badge}</p>
          <button
            type="button"
            onClick={onToggle}
            className="border border-neutral-900 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-50"
          >
            {isOpen ? toggleLabelOpen : toggleLabelClosed}
          </button>
        </div>
      </div>

      {isOpen ? <div className="mt-3">{children}</div> : <p className="mt-3 text-[11px] leading-5 text-neutral-600">{summary}</p>}
    </div>
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
