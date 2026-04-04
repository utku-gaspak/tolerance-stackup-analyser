"use client";

import { useMemo, useState } from "react";
import { applyWhatIfScenario, clampWhatIfPercent, DEFAULT_WHAT_IF_PERCENT, type WhatIfPercents } from "../lib/what-if";
import type { ParsedStackRow } from "../lib/types";

export function useWhatIfScenario(rows: ParsedStackRow[]) {
  const [whatIfGlobalPercent, setWhatIfGlobalPercent] = useState(DEFAULT_WHAT_IF_PERCENT);
  const [whatIfRowPercents, setWhatIfRowPercents] = useState<WhatIfPercents>({});

  const scenarioRows = useMemo(
    () => applyWhatIfScenario(rows, whatIfGlobalPercent, whatIfRowPercents),
    [rows, whatIfGlobalPercent, whatIfRowPercents]
  );

  function updateWhatIfRowPercent(id: string, percent: number) {
    setWhatIfRowPercents((current) => ({ ...current, [id]: clampWhatIfPercent(percent) }));
  }

  function resetWhatIfScenario() {
    setWhatIfGlobalPercent(DEFAULT_WHAT_IF_PERCENT);
    setWhatIfRowPercents({});
  }

  return {
    scenarioRows,
    whatIfGlobalPercent,
    setWhatIfGlobalPercent,
    whatIfRowPercents,
    updateWhatIfRowPercent,
    resetWhatIfScenario
  };
}
