import type { RowValidationError } from "../lib/types";
import type { StackCalculationResult } from "../lib/types";

interface ResultsPanelProps {
  result: StackCalculationResult | null;
  isValid: boolean;
  errorCount: number;
  errors: RowValidationError[];
  zeroToleranceRows: number;
}

export function ResultsPanel({ result, isValid, errorCount, errors, zeroToleranceRows }: ResultsPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Results</h2>
          <p className="mt-1 text-sm text-slate-500">F-01 total nominal, F-02 worst-case, and F-03 RSS approximation.</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            isValid ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}
        >
          {isValid ? "Valid" : "Blocked"}
        </span>
      </div>

      {!isValid ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p>
            Fix the highlighted inputs to calculate results. {errorCount} validation issue{errorCount === 1 ? "" : "s"}{" "}
            are active.
          </p>
          <ul className="mt-3 space-y-1 text-xs leading-5">
            {errors.slice(0, 4).map((error) => (
              <li key={`${error.id}-${error.field}`}>{error.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <MetricCard label="Total nominal" value={formatNumber(result.totalNominal)} accent="slate" />
          <MetricCard label="Worst-case min" value={formatNumber(result.worstCaseMin)} accent="blue" />
          <MetricCard label="Worst-case max" value={formatNumber(result.worstCaseMax)} accent="blue" />
          <MetricCard label="RSS tolerance" value={formatNumber(result.rssTolerance)} accent="amber" />
          <MetricCard label="RSS min" value={formatNumber(result.rssMin)} accent="amber" />
          <MetricCard label="RSS max" value={formatNumber(result.rssMax)} accent="amber" />
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        RSS is shown as an approximation. Worst-case is deterministic and conservative.
      </div>

      {isValid && zeroToleranceRows > 0 ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
          {zeroToleranceRows} row{zeroToleranceRows === 1 ? "" : "s"} use zero tolerance and remain valid.
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: "slate" | "blue" | "amber";
}) {
  const accentClasses = {
    slate: "border-slate-200 bg-slate-50",
    blue: "border-sky-200 bg-sky-50",
    amber: "border-amber-200 bg-amber-50"
  }[accent];

  return (
    <div className={`rounded-2xl border p-4 ${accentClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toFixed(4);
}
