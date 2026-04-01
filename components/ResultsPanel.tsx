import type { RowValidationError } from "../lib/types";
import type { ParsedStackRow, StackCalculationResult } from "../lib/types";
import { calculateSensitivityAnalysis } from "../lib/sensitivity";
import type { MonteCarloSpecLimits } from "../lib/monte-carlo";
import { evaluateSpecLimits } from "../lib/spec-limits";

interface ResultsPanelProps {
  result: StackCalculationResult | null;
  isValid: boolean;
  errorCount: number;
  errors: RowValidationError[];
  zeroToleranceRows: number;
  rows: ParsedStackRow[];
  specLimits: MonteCarloSpecLimits;
  onExportPdf: () => void;
}

export function ResultsPanel({ result, rows, specLimits, isValid, errorCount, errors, zeroToleranceRows, onExportPdf }: ResultsPanelProps) {
  const sensitivityItems = isValid ? calculateSensitivityAnalysis(rows).slice(0, 5) : [];
  const specCheck = evaluateSpecLimits(result, specLimits);

  return (
    <section className="flex h-full flex-col border border-neutral-900 bg-white p-4">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Results</h2>
          <p className="mt-1 text-sm text-neutral-700">F-01 total nominal, F-02 worst-case, and F-03 RSS approximation.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isValid ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-900 bg-white text-neutral-900"
            }`}
          >
            {isValid ? "Valid" : "Blocked"}
          </span>
          <button
            type="button"
            onClick={onExportPdf}
            className="border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
          >
            Export PDF
          </button>
        </div>
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

        <div className="border border-neutral-900 bg-white p-3">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Spec Check</p>
              <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Go / No-Go</h3>
            </div>
            <span
              className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                specCheck.status === "go"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : specCheck.status === "no-go"
                    ? "border-neutral-900 bg-neutral-100 text-neutral-900"
                    : "border-neutral-900 bg-white text-neutral-700"
              }`}
            >
              {specCheck.status === "go" ? "Go" : specCheck.status === "no-go" ? "No-Go" : specCheck.status === "blocked" ? "Blocked" : "Unset"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-neutral-700">{specCheck.message}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs text-neutral-700">
            <div className="border border-neutral-900 bg-neutral-100 p-2">
              <p className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Lower</p>
              <p className="mt-1 font-mono tabular-nums">{specLimits.lower !== null ? formatNumber(specLimits.lower) : "Not set"}</p>
            </div>
            <div className="border border-neutral-900 bg-neutral-100 p-2">
              <p className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Upper</p>
              <p className="mt-1 font-mono tabular-nums">{specLimits.upper !== null ? formatNumber(specLimits.upper) : "Not set"}</p>
            </div>
          </div>
        </div>

        {sensitivityItems.length > 0 ? (
          <div className="border border-neutral-900 bg-white p-3">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Sensitivity</p>
                <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Dominant contributors</h3>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">RSS share</p>
            </div>
            <div className="mt-3 grid gap-2">
              {sensitivityItems.map((item, index) => (
                <div key={item.id} className="grid grid-cols-[1.25rem_minmax(0,1fr)_5rem_4rem] items-center gap-2 text-xs">
                  <span className="font-semibold text-neutral-700">{index + 1}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-950">{item.label}</span>
                      <span className="border border-neutral-900 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-700">{item.direction}</span>
                    </div>
                    <div className="mt-1 h-2 border border-neutral-900 bg-white">
                      <div className="h-full bg-neutral-900" style={{ width: `${Math.max(4, item.rssShare * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-mono tabular-nums text-right text-neutral-700">{formatPercent(item.rssShare)}</span>
                  <span className="font-mono tabular-nums text-right text-neutral-700">{formatNumber(item.effectiveTolerance)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-neutral-600">
              Ranked by RSS contribution share. Rows with the largest share are the best candidates for tightening.
            </p>
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

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
