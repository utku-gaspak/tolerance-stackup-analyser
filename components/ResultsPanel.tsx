import type { RowValidationError } from "../lib/types";
import { formatEngineeringValue } from "../lib/units";
import type { EngineeringUnit, ParsedStackRow, SavedStackVariant, StackCalculationResult } from "../lib/types";
import { calculateSensitivityAnalysis, getSensitivityDominanceWarning } from "../lib/sensitivity";
import type { VariantComparisonSummary } from "../lib/variant-comparison";
import type { MonteCarloSpecLimits } from "../lib/monte-carlo";
import { evaluateSpecLimits } from "../lib/spec-limits";

interface ResultsPanelProps {
  result: StackCalculationResult | null;
  baseResult: StackCalculationResult | null;
  isValid: boolean;
  errorCount: number;
  errors: RowValidationError[];
  zeroToleranceRows: number;
  rows: ParsedStackRow[];
  specLimits: MonteCarloSpecLimits;
  onExportPdf: () => void;
  onExportJson: () => void;
  savedVariants: SavedStackVariant[];
  leftVariantId: string;
  rightVariantId: string;
  onLeftVariantChange: (id: string) => void;
  onRightVariantChange: (id: string) => void;
  onSaveVariant: () => void;
  variantComparison: VariantComparisonSummary | null;
  engineeringUnit: EngineeringUnit;
}

export function ResultsPanel({
  result,
  baseResult,
  rows,
  specLimits,
  isValid,
  errorCount,
  errors,
  zeroToleranceRows,
  onExportPdf,
  onExportJson,
  savedVariants,
  leftVariantId,
  rightVariantId,
  onLeftVariantChange,
  onRightVariantChange,
  onSaveVariant,
  variantComparison,
  engineeringUnit
}: ResultsPanelProps) {
  const sensitivityItems = isValid ? calculateSensitivityAnalysis(rows).slice(0, 5) : [];
  const sensitivityWarning = getSensitivityDominanceWarning(sensitivityItems);
  const specCheck = evaluateSpecLimits(result, specLimits);
  const comparisonCards = result && baseResult && (result.rssTolerance !== baseResult.rssTolerance || result.worstCaseMin !== baseResult.worstCaseMin || result.worstCaseMax !== baseResult.worstCaseMax)
    ? [
        {
          label: "RSS delta",
          value: formatDelta(result.rssTolerance - baseResult.rssTolerance)
        },
        {
          label: "Worst-case span delta",
          value: formatDelta((result.worstCaseMax - result.worstCaseMin) - (baseResult.worstCaseMax - baseResult.worstCaseMin))
        }
      ]
    : [];

  return (
    <section className="flex h-full flex-col border border-neutral-900 bg-white p-4">
      <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">Results</h2>
          <p className="mt-1 text-sm text-neutral-700">Deterministic totals and RSS approximation.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isValid ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-900 bg-white text-neutral-900"
            }`}
          >
            {isValid ? "Valid" : "Blocked"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onSaveVariant}
              disabled={!result}
              className="col-span-2 border border-neutral-900 bg-neutral-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
            >
              Save Variant
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="border border-neutral-900 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 transition hover:bg-neutral-100"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-neutral-800"
            >
              Export PDF
            </button>
          </div>
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
          <MetricCard label="Total nominal" value={formatNumber(result.totalNominal)} unit={engineeringUnit} accent="slate" />
          <MetricCard label="Worst-case min" value={formatNumber(result.worstCaseMin)} unit={engineeringUnit} accent="blue" />
          <MetricCard label="Worst-case max" value={formatNumber(result.worstCaseMax)} unit={engineeringUnit} accent="blue" />
          <MetricCard label="RSS tolerance" value={formatNumber(result.rssTolerance)} unit={engineeringUnit} accent="amber" />
          <MetricCard label="RSS min" value={formatNumber(result.rssMin)} unit={engineeringUnit} accent="amber" />
          <MetricCard label="RSS max" value={formatNumber(result.rssMax)} unit={engineeringUnit} accent="amber" />
        </div>
      ) : null}

      {comparisonCards.length > 0 ? (
        <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">What-if result</p>
              <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Scenario vs base</h3>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Delta</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {comparisonCards.map((card) => (
              <div key={card.label} className="border border-neutral-900 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">{card.label}</p>
                <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-neutral-950">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 border border-neutral-900 bg-white p-3">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Saved variants</p>
            <h3 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Compare snapshots</h3>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">{savedVariants.length} saved</p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-neutral-700">
            <span className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Variant A</span>
            <select
              value={leftVariantId}
              onChange={(event) => onLeftVariantChange(event.target.value)}
              className="mt-1 block w-full border border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-950 outline-none"
            >
              <option value="">Select variant</option>
              {savedVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} ({variant.rowCount} rows)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-neutral-700">
            <span className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Variant B</span>
            <select
              value={rightVariantId}
              onChange={(event) => onRightVariantChange(event.target.value)}
              className="mt-1 block w-full border border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-950 outline-none"
            >
              <option value="">Select variant</option>
              {savedVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} ({variant.rowCount} rows)
                </option>
              ))}
            </select>
          </label>
        </div>

        {variantComparison ? (
          <div className="mt-4">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_6rem] text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
              <span>Metric</span>
              <span>{variantComparison.leftName}</span>
              <span>{variantComparison.rightName}</span>
              <span className="text-right">Delta ({variantComparison.unit})</span>
            </div>
            <div className="mt-2 grid gap-2">
              {variantComparison.metrics.map((metric) => (
                <div key={metric.label} className="grid gap-2 border border-neutral-900 bg-neutral-100 p-2 text-xs text-neutral-800 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_6rem] sm:items-center">
                  <span className="font-semibold text-neutral-950">{metric.label}</span>
                  <span className="font-mono tabular-nums">{metric.leftValue}</span>
                  <span className="font-mono tabular-nums">{metric.rightValue}</span>
                  <span className="text-right font-mono tabular-nums text-neutral-950">{metric.delta}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-neutral-600">
            Save at least two valid snapshots, then select Variant A and Variant B to compare nominal, worst-case, and RSS deltas.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-4">
        <div className="border border-neutral-900 bg-neutral-100 p-3 text-sm leading-6 text-neutral-700">
          Worst-case is deterministic and conservative. RSS is an estimate built from each row&apos;s average tolerance
          width and independent contributors.
        </div>

        <div className="border border-neutral-900 bg-white p-3 text-xs leading-5 text-neutral-600">
          Output is formatted for engineering review: nominal values are exact, worst-case is a stack boundary, and RSS
          is a statistical estimate rather than a pass/fail guarantee.
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
              <p className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Lower ({engineeringUnit})</p>
              <p className="mt-1 font-mono tabular-nums">{specLimits.lower !== null ? formatNumber(specLimits.lower) : "Not set"}</p>
            </div>
            <div className="border border-neutral-900 bg-neutral-100 p-2">
              <p className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Upper ({engineeringUnit})</p>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">RSS share / {engineeringUnit}</p>
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
            {sensitivityWarning ? (
              <div className="mt-3 border border-neutral-900 bg-neutral-100 p-2.5 text-xs leading-5 text-neutral-800">
                <p className="font-semibold uppercase tracking-[0.16em] text-neutral-700">{sensitivityWarning.title}</p>
                <p className="mt-1">{sensitivityWarning.message}</p>
              </div>
            ) : null}
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
  unit,
  accent
}: {
  label: string;
  value: string;
  unit: EngineeringUnit;
  accent: "slate" | "blue" | "amber";
}) {
  const accentClasses = {
    slate: "border-neutral-900 bg-neutral-100",
    blue: "border-neutral-900 bg-white",
    amber: "border-neutral-900 bg-neutral-100"
  }[accent];

  return (
    <div className={`border p-3 ${accentClasses}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">{label} ({unit})</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-950 tabular-nums">{value}</p>
    </div>
  );
}

function formatNumber(value: number): string {
  return formatEngineeringValue(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(4)}`;
}
