"use client";

import { useState } from "react";
import { ResultsPanel } from "../components/ResultsPanel";
import { CurrentStackExpressionPanel } from "../components/CurrentStackExpressionPanel";
import { FormulaPanel } from "../components/FormulaPanel";
import { MonteCarloPanel } from "../components/MonteCarloPanel";
import { QuickStartPanel } from "../components/QuickStartPanel";
import { StackTable } from "../components/StackTable";
import { useConsent } from "../components/ConsentProvider";
import Link from "next/link";
import { useCsvImportExport } from "../hooks/useCsvImportExport";
import { useMonteCarloState } from "../hooks/useMonteCarloState";
import { useReportExport } from "../hooks/useReportExport";
import { useSavedVariants } from "../hooks/useSavedVariants";
import { useStackupRows } from "../hooks/useStackupRows";
import { useWhatIfScenario } from "../hooks/useWhatIfScenario";
import { samplePresets } from "../lib/sample-data";
import { calculateStackup } from "../lib/stackup";
import type { EngineeringUnit } from "../lib/types";
import { convertMonteCarloResult, convertRows, convertSpecLimits } from "../lib/units";
import { validateStackRows } from "../lib/validation";

const PRESET_LABELS = ["V-01", "V-02", "V-03"] as const;

export default function Home() {
  const { openConsentBanner } = useConsent();
  const [engineeringUnit, setEngineeringUnit] = useState<EngineeringUnit>("mm");
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [isAdvancedPanelsOpen, setIsAdvancedPanelsOpen] = useState(false);
  const { monteCarloResult, setMonteCarloResult, specLimits, setSpecLimits } = useMonteCarloState();
  const {
    savedVariants,
    leftVariantId,
    rightVariantId,
    setLeftVariantId,
    setRightVariantId,
    saveCurrentVariant,
    convertVariantUnits,
    variantComparison
  } = useSavedVariants();
  const { rows, setRows, updateRow, addRow, deleteRow, replaceRows } = useStackupRows();
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
  const { exportPdfReport, exportJsonReport } = useReportExport({
    rows,
    validation,
    result,
    monteCarloResult,
    engineeringUnit
  });

  function changeEngineeringUnit(nextUnit: EngineeringUnit) {
    if (nextUnit === engineeringUnit) {
      return;
    }

    const previousUnit = engineeringUnit;
    setRows((current) => convertRows(current, previousUnit, nextUnit));
    setSpecLimits((current) => convertSpecLimits(current, previousUnit, nextUnit));
    setMonteCarloResult((current) => (current ? convertMonteCarloResult(current, previousUnit, nextUnit) : null));
    convertVariantUnits(previousUnit, nextUnit);
    setEngineeringUnit(nextUnit);
  }

  function loadPreset(preset: (typeof PRESET_LABELS)[number]) {
    const presetRows = samplePresets[preset].map((row) => ({ ...row }));
    replaceRows(engineeringUnit === "mm" ? presetRows : convertRows(presetRows, "mm", engineeringUnit));
    resetWhatIfScenario();
  }

  async function importRows(file: File) {
    const didImport = await importRowsCsv(file);

    if (didImport) {
      resetWhatIfScenario();
    }
  }

  function handleSaveVariant() {
    if (!result) {
      return;
    }

    saveCurrentVariant(rows, result, engineeringUnit);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
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
          <div className="flex overflow-hidden border border-neutral-900">
            <button
              type="button"
              onClick={() => changeEngineeringUnit("mm")}
              className={`px-3 py-1.5 transition ${engineeringUnit === "mm" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-white"}`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => changeEngineeringUnit("in")}
              className={`border-l border-neutral-900 px-3 py-1.5 transition ${engineeringUnit === "in" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-white"}`}
            >
              in
            </button>
          </div>
        </div>
      </section>

      <section className="border border-neutral-900 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-700">Workspace toolbar</p>
            <p className="text-[10.5px] leading-[1.1rem] text-neutral-700">
              Show or hide Quick Start and advanced reference panels without affecting the main workflow below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsQuickStartOpen((current) => !current)}
              aria-pressed={isQuickStartOpen}
              className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isQuickStartOpen
                  ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {isQuickStartOpen ? "Hide Quick Start" : "Show Quick Start"}
            </button>
            <button
              type="button"
              onClick={() => setIsAdvancedPanelsOpen((current) => !current)}
              aria-pressed={isAdvancedPanelsOpen}
              className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isAdvancedPanelsOpen
                  ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                  : "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {isAdvancedPanelsOpen ? "Hide Advanced Panels" : "Show Advanced Panels"}
            </button>
          </div>
        </div>
      </section>

      {isQuickStartOpen ? <QuickStartPanel /> : null}

      <section className="grid items-stretch gap-5 2xl:grid-cols-[minmax(0,2fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]">
        <StackTable
          rows={rows}
          presetLabels={PRESET_LABELS}
          onLoadPreset={loadPreset}
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
          engineeringUnit={engineeringUnit}
        />

        <MonteCarloPanel
          rows={scenarioRows}
          isValid={validation.isValid}
          engineeringUnit={engineeringUnit}
          onResultChange={setMonteCarloResult}
          onSpecLimitsChange={setSpecLimits}
        />

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
          onExportJson={exportJsonReport}
          savedVariants={savedVariants}
          leftVariantId={leftVariantId}
          rightVariantId={rightVariantId}
          onLeftVariantChange={setLeftVariantId}
          onRightVariantChange={setRightVariantId}
          onSaveVariant={handleSaveVariant}
          variantComparison={variantComparison}
          engineeringUnit={engineeringUnit}
        />
      </section>

      {isAdvancedPanelsOpen ? (
        <section className="border border-neutral-900 bg-neutral-50 p-4">
          <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-700">Reference panels</p>
              <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Formula Reference and current expression</h2>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Shown with Advanced Panels</p>
          </div>

          <div className="mt-4 grid gap-4 2xl:grid-cols-[1.4fr_1fr]">
            <FormulaPanel rows={rows} compact />

            <div className="grid gap-4 content-start">
              <CurrentStackExpressionPanel rows={rows} />
            </div>
          </div>
        </section>
      ) : null}

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
            <button
              type="button"
              onClick={openConsentBanner}
              className="font-medium text-neutral-950 underline decoration-neutral-400 decoration-1 underline-offset-2 hover:decoration-neutral-900"
            >
              Privacy settings
            </button>
            <Link
              href="/privacy"
              className="font-medium text-neutral-950 underline decoration-neutral-400 decoration-1 underline-offset-2 hover:decoration-neutral-900"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
