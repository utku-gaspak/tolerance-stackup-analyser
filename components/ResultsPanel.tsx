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
    <section className="flex h-full flex-col border border-neutral-900 bg-white p-4">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Results</h2>
          <p className="mt-1 text-sm text-neutral-700">F-01 total nominal, F-02 worst-case, and F-03 RSS approximation.</p>
        </div>
        <span
          className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
            isValid ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-900 bg-white text-neutral-900"
          }`}
        >
          {isValid ? "Valid" : "Blocked"}
        </span>
      </div>

      {!isValid ? (
        <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-sm text-neutral-800">
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
        <div className="mt-6 grid auto-rows-min items-start content-start gap-4 sm:grid-cols-2">
          <MetricCard label="Total nominal" value={formatNumber(result.totalNominal)} accent="slate" />
          <MetricCard label="Worst-case min" value={formatNumber(result.worstCaseMin)} accent="blue" />
          <MetricCard label="Worst-case max" value={formatNumber(result.worstCaseMax)} accent="blue" />
          <MetricCard label="RSS tolerance" value={formatNumber(result.rssTolerance)} accent="amber" />
          <MetricCard label="RSS min" value={formatNumber(result.rssMin)} accent="amber" />
          <MetricCard label="RSS max" value={formatNumber(result.rssMax)} accent="amber" />
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        <div className="border border-neutral-900 bg-neutral-100 p-3 text-sm leading-6 text-neutral-700">
          RSS is shown as an approximation. Worst-case is deterministic and conservative.
        </div>

        <div className="border border-neutral-900 bg-white p-3 text-xs leading-5 text-neutral-600">
          Output is formatted for engineering review: nominal values are exact, worst-case is conservative, and RSS is a
          statistical estimate.
        </div>

        {isValid && zeroToleranceRows > 0 ? (
          <div className="border border-neutral-900 bg-neutral-100 p-3 text-sm leading-6 text-neutral-800">
            {zeroToleranceRows} row{zeroToleranceRows === 1 ? "" : "s"} use zero tolerance and remain valid.
          </div>
        ) : null}
      </div>
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
    slate: "border-neutral-900 bg-neutral-100",
    blue: "border-neutral-900 bg-white",
    amber: "border-neutral-900 bg-neutral-100"
  }[accent];

  return (
    <div className={`border p-3 ${accentClasses}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950 tabular-nums">{value}</p>
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toFixed(4);
}
