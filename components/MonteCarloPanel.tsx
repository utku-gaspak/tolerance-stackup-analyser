"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { runMonteCarloSimulation, type MonteCarloResult } from "../lib/monte-carlo";
import type { ParsedStackRow } from "../lib/types";

interface MonteCarloPanelProps {
  rows: ParsedStackRow[];
  isValid: boolean;
  onResultChange?: (result: MonteCarloResult | null) => void;
}

const DEFAULT_SAMPLE_COUNT = 2000;

export function MonteCarloPanel({ rows, isValid, onResultChange }: MonteCarloPanelProps) {
  const [sampleCount, setSampleCount] = useState(DEFAULT_SAMPLE_COUNT);
  const [seed, setSeed] = useState(1);
  const [lowerSpecLimit, setLowerSpecLimit] = useState("");
  const [upperSpecLimit, setUpperSpecLimit] = useState("");
  const [result, setResult] = useState<MonteCarloResult | null>(() =>
    isValid ? runMonteCarloSimulation(rows, DEFAULT_SAMPLE_COUNT, 1) : null
  );
  const hasMounted = useRef(false);
  const configSignature = useMemo(
    () =>
      [
        rows.map((row) => `${row.id}:${row.nominal}:${row.plusTolerance}:${row.minusTolerance}:${row.direction}`).join("|"),
        sampleCount,
        lowerSpecLimit,
        upperSpecLimit
      ].join("::"),
    [rows, sampleCount, lowerSpecLimit, upperSpecLimit]
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    setResult(null);
  }, [configSignature]);

  useEffect(() => {
    onResultChange?.(result);
  }, [result]);

  const parsedLowerSpecLimit = parseOptionalLimit(lowerSpecLimit);
  const parsedUpperSpecLimit = parseOptionalLimit(upperSpecLimit);
  const specLimitsConfigured = parsedLowerSpecLimit !== null || parsedUpperSpecLimit !== null;

  function runSimulation() {
    if (!isValid || rows.length === 0) {
      setResult(null);
      return;
    }

    try {
      const nextSeed = seed + 1;
      setSeed(nextSeed);
      setResult(
        runMonteCarloSimulation(rows, sampleCount, nextSeed, {
          lower: parsedLowerSpecLimit,
          upper: parsedUpperSpecLimit
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to run Monte Carlo simulation.";
      window.alert(message);
    }
  }

  return (
    <section className="border border-neutral-900 bg-white p-4">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-900 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Monte Carlo</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">Distribution estimate</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isValid ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-900 bg-white text-neutral-900"}`}>
            {isValid ? "Ready" : "Blocked"}
          </span>
          <span className={`border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${specLimitsConfigured ? "border-neutral-900 bg-white text-neutral-900" : "border-neutral-900 bg-neutral-100 text-neutral-700"}`}>
            {specLimitsConfigured ? "Spec limits set" : "No spec limits"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">Samples</span>
          <input
            type="number"
            min={1000}
            step={500}
            value={sampleCount}
            onChange={(event) => setSampleCount(Number(event.target.value) || DEFAULT_SAMPLE_COUNT)}
            className="mt-1 block w-full border border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-950 outline-none tabular-nums"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={runSimulation}
            className="border border-neutral-900 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Run simulation
          </button>
        </div>
      </div>

      <div className="mt-3 border border-neutral-900 bg-neutral-100 p-3 text-xs leading-5 text-neutral-700">
        Set optional lower and upper spec limits to calculate yield. The pass rate is the share of Monte Carlo samples
        that stay inside that band.
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">Lower spec limit</span>
          <input
            type="number"
            step="0.01"
            value={lowerSpecLimit}
            onChange={(event) => setLowerSpecLimit(event.target.value)}
            placeholder="Optional"
            className="mt-1 block w-full border border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-950 outline-none tabular-nums"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">Upper spec limit</span>
          <input
            type="number"
            step="0.01"
            value={upperSpecLimit}
            onChange={(event) => setUpperSpecLimit(event.target.value)}
            placeholder="Optional"
            className="mt-1 block w-full border border-neutral-900 bg-white px-3 py-2 text-sm text-neutral-950 outline-none tabular-nums"
          />
        </label>
      </div>

      <div className="mt-3 text-xs leading-5 text-neutral-600">
        Normal sampling with σ ≈ tolerance / 3, clipped to each row tolerance bounds. Yield is calculated against the optional spec limits.
      </div>

      {!isValid ? (
        <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-sm text-neutral-800">
          Fix validation errors before running Monte Carlo.
        </div>
      ) : result ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatBox label="Mean" value={formatNumber(result.mean)} />
            <StatBox label="Range" value={`${formatNumber(result.min)} to ${formatNumber(result.max)}`} />
            <StatBox label="P05" value={formatNumber(result.p05)} />
            <StatBox label="P95" value={formatNumber(result.p95)} />
            {result.passRate !== null ? (
              <StatBox label="Yield" value={formatPercent(result.passRate)} />
            ) : (
              <StatBox label="Yield" value="Set spec limits" />
            )}
            {result.passCount !== null ? (
              <StatBox label="In spec" value={`${result.passCount}/${result.sampleCount}`} />
            ) : (
              <StatBox label="In spec" value="Not configured" />
            )}
          </div>

          {result.passRate !== null ? (
            <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-sm leading-6 text-neutral-800">
              Yield estimate: {formatPercent(result.passRate)} pass rate across {result.sampleCount} samples.
            </div>
          ) : null}

          <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3">
            <div className="flex items-center justify-between gap-4 border-b border-neutral-900 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Histogram</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">{result.sampleCount} samples</p>
            </div>
            <div className="mt-3 grid gap-2">
              {result.histogram.map((bin) => (
                <div key={`${bin.min}-${bin.max}`} className="grid grid-cols-[5rem_1fr_4rem] items-center gap-2 text-xs text-neutral-700">
                  <span className="font-mono tabular-nums">{formatNumber(bin.min)}</span>
                  <div className="h-3 border border-neutral-900 bg-white">
                    <div
                      className="h-full bg-neutral-900"
                      style={{ width: `${Math.max(4, (bin.count / result.sampleCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-right font-mono tabular-nums">{bin.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-sm text-neutral-800">
          Run the simulation to generate a distribution estimate.
        </div>
      )}
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-neutral-900 bg-neutral-100 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">{label}</p>
      <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-neutral-950">{value}</p>
    </div>
  );
}

function formatNumber(value: number): string {
  return value.toFixed(4);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function parseOptionalLimit(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}
