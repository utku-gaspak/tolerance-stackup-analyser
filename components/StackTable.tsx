import type { RowValidationError, StackRow } from "../lib/types";
import { StackRowEditor } from "./StackRowEditor";

interface StackTableProps {
  rows: StackRow[];
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  errorsByRow: Record<string, Partial<Record<RowValidationError["field"], string>>>;
}

export function StackTable({ rows, onChangeRow, onDeleteRow, onAddRow, errorsByRow }: StackTableProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Stack definition</h2>
          <p className="mt-1 text-sm text-slate-500">Edit rows inline. Calculation output will update from this state.</p>
        </div>
        <button
          type="button"
          onClick={onAddRow}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Add row
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr_auto] gap-px bg-slate-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <div className="bg-slate-50 px-4 py-3">Label</div>
          <div className="bg-slate-50 px-4 py-3">Nominal</div>
          <div className="bg-slate-50 px-4 py-3">+Tol</div>
          <div className="bg-slate-50 px-4 py-3">-Tol</div>
          <div className="bg-slate-50 px-4 py-3">Dir</div>
          <div className="bg-slate-50 px-4 py-3 text-right">Action</div>
        </div>

        <div className="divide-y divide-slate-200 bg-white">
          {rows.map((row) => (
            <StackRowEditor
              key={row.id}
              row={row}
              onChangeRow={onChangeRow}
              onDeleteRow={onDeleteRow}
              errors={errorsByRow[row.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
