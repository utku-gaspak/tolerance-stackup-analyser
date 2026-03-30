import type { RowValidationError, StackDirection, StackRow } from "../lib/types";
import { StackRowEditor } from "./StackRowEditor";

interface StackTableProps {
  rows: StackRow[];
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  onAddRow: () => void;
  errorsByRow: Record<string, Partial<Record<RowValidationError["field"], string>>>;
  equationTotal: number | null;
  equationIsValid: boolean;
}

export function StackTable({
  rows,
  onChangeRow,
  onDeleteRow,
  onAddRow,
  errorsByRow,
  equationTotal,
  equationIsValid
}: StackTableProps) {
  const equationTokens = rows.map((row, index) => ({
    index: index + 1,
    signedNominal: formatSignedNominal(row.nominal, row.direction)
  }));

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

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Stack equation</p>
            <p className="mt-1 text-sm text-slate-600">Live signed nominal contribution by row.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900">
            {equationIsValid && equationTotal !== null ? `${equationTotal.toFixed(2)} mm` : "Pending"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {equationTokens.map((token) => (
            <span
              key={token.index}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{token.index}</span>
              <span className="font-mono tabular-nums">{token.signedNominal}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-12" />
              <col className="w-[16%] min-w-[9rem]" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-28" />
              <col className="w-40" />
              <col className="w-36" />
              <col className="w-24" />
            </colgroup>
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-3 text-center">#</th>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-right">Nominal (mm)</th>
                <th className="px-4 py-3 text-right">Upper Tol</th>
                <th className="px-4 py-3 text-right">Lower Tol</th>
                <th className="px-4 py-3 text-left">Direction</th>
                <th className="px-4 py-3 text-right">Contribution</th>
                <th className="px-4 py-3 text-center">Delete</th>
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
