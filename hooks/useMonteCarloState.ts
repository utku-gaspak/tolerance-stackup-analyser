"use client";

import { useState } from "react";
import type { MonteCarloResult, MonteCarloSpecLimits } from "../lib/monte-carlo";

export function useMonteCarloState() {
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null);
  const [specLimits, setSpecLimits] = useState<MonteCarloSpecLimits>({ lower: null, upper: null });

  return {
    monteCarloResult,
    setMonteCarloResult,
    specLimits,
    setSpecLimits
  };
}
