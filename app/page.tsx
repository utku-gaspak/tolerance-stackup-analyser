"use client";

import { ResultsPanel } from "../components/ResultsPanel";
import { CurrentStackExpressionPanel } from "../components/CurrentStackExpressionPanel";
import { FormulaPanel } from "../components/FormulaPanel";
import { MonteCarloPanel } from "../components/MonteCarloPanel";
import { StackTable } from "../components/StackTable";
import { useCsvImportExport } from "../hooks/useCsvImportExport";
import { useMonteCarloState } from "../hooks/useMonteCarloState";
import { usePdfExport } from "../hooks/usePdfExport";
import { useStackupRows } from "../hooks/useStackupRows";
import { useWhatIfScenario } from "../hooks/useWhatIfScenario";
import { calculateStackup } from "../lib/stackup";
import { validateStackRows } from "../lib/validation";

const PRESET_LABELS = ["V-01", "V-02", "V-03"] as const;

export default function Home() {
  const { monteCarloResult, setMonteCarloResult, specLimits, setSpecLimits } = useMonteCarloState();
  const { rows, updateRow, addRow, deleteRow, replaceRows, loadPreset: loadPresetRows } = useStackupRows();
  const validation = validateStackRows(rows);
  const {
    scenarioRows,
    whatIfGlobalPercent,
    setWhatIfGlobalPercent,
    whatIfRowPercents,
    updateWhatIfRowPercent,
    resetWhatIfScenario
  } = useWhatIfScenario(validation.parsedRows);
  const baseResult = validation.isValid ? calculateStackup(validation.parsedRows) : null;
  const result = validation.isValid ? calculateStackup(scenarioRows) : null;
  const zeroToleranceRows = validation.parsedRows.filter(
    (row) => row.plusTolerance === 0 && row.minusTolerance === 0
  ).length;
  const errorsByRow = validation.errors.reduce<Record<string, Record<string, string>>>((accumulator, error) => {
    accumulator[error.id] ??= {};
    accumulator[error.id][error.field] = error.message;
    return accumulator;
  }, {});
  const { exportRowsCsv, importRowsCsv } = useCsvImportExport({
    rows,
    onRowsImported: replaceRows
  });
  const { exportPdfReport } = usePdfExport({
    rows,
    validation,
    result,
    monteCarloResult
  });

  function loadPreset(preset: (typeof PRESET_LABELS)[number]) {
    loadPresetRows(preset);
    resetWhatIfScenario();
  }

  async function importRows(file: File) {
    const didImport = await importRowsCsv(file);

    if (didImport) {
      resetWhatIfScenario();
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-3 border border-neutral-900 bg-white p-5 lg:p-6">
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
        </div>
      </section>

      <section className="grid items-stretch gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
        <StackTable
          rows={rows}
          onAddRow={addRow}
          onImportRows={importRows}
          onExportRows={exportRowsCsv}
          onDeleteRow={deleteRow}
          onChangeRow={updateRow}
          whatIfGlobalPercent={whatIfGlobalPercent}
          onWhatIfGlobalPercentChange={setWhatIfGlobalPercent}
          whatIfRowPercents={whatIfRowPercents}
          onWhatIfRowPercentChange={updateWhatIfRowPercent}
          errorsByRow={errorsByRow}
          equationTotal={result?.totalNominal ?? null}
          equationIsValid={validation.isValid}
        />

        <MonteCarloPanel
          rows={scenarioRows}
          isValid={validation.isValid}
          onResultChange={setMonteCarloResult}
          onSpecLimitsChange={setSpecLimits}
        />

        <div className="flex h-full flex-col gap-6">
          <ResultsPanel
            result={result}
            baseResult={baseResult}
            rows={validation.parsedRows}
            specLimits={specLimits}
            isValid={validation.isValid}
            errorCount={validation.errors.length}
            errors={validation.errors}
            zeroToleranceRows={zeroToleranceRows}
            onExportPdf={exportPdfReport}
          />
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[1.4fr_1fr]">
        <FormulaPanel rows={rows} compact />

        <div className="grid gap-4 content-start">
          <CurrentStackExpressionPanel rows={rows} />
          <aside className="border border-neutral-900 bg-neutral-100 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700">Status</p>
            <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Core scaffold is live</h2>
            <p className="mt-2 text-[10.5px] leading-[1.1rem] text-neutral-700">
              Validation, results, formula reference, and Monte Carlo are connected.
            </p>
            <div className="mt-2.5 border border-neutral-900 bg-white px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Current rows</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-950 tabular-nums">{rows.length}</p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-neutral-900 pt-4 text-xs text-neutral-700">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-neutral-700">&copy; 2026 Utku Gaspak</p>
          <p className="text-neutral-700">Engineering calculator for 1D stackups</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/utku-gaspak"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-950 underline decoration-neutral-400 decoration-1 underline-offset-2 hover:decoration-neutral-900"
            >
              GitHub
            </a>
            <a
              href="mailto:utkugaspak@gmail.com"
              className="font-medium text-neutral-950 underline decoration-neutral-400 decoration-1 underline-offset-2 hover:decoration-neutral-900"
            >
              utkugaspak@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
