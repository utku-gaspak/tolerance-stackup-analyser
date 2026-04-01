import type { MonteCarloSpecLimits } from "./monte-carlo";
import type { StackCalculationResult } from "./types";

export type SpecCheckStatus = "go" | "no-go" | "not-configured" | "blocked";

export interface SpecCheckResult {
  status: SpecCheckStatus;
  message: string;
}

export function evaluateSpecLimits(
  result: StackCalculationResult | null,
  specLimits: MonteCarloSpecLimits
): SpecCheckResult {
  const hasLower = specLimits.lower !== null && specLimits.lower !== undefined;
  const hasUpper = specLimits.upper !== null && specLimits.upper !== undefined;

  if (!hasLower && !hasUpper) {
    return { status: "not-configured", message: "Spec limits are not configured." };
  }

  if (!result) {
    return { status: "blocked", message: "Deterministic result is unavailable." };
  }

  if (hasLower && hasUpper && (specLimits.lower ?? 0) > (specLimits.upper ?? 0)) {
    return { status: "blocked", message: "Lower spec limit must be less than or equal to upper spec limit." };
  }

  const passesLower = !hasLower || result.worstCaseMin >= (specLimits.lower ?? Number.NEGATIVE_INFINITY);
  const passesUpper = !hasUpper || result.worstCaseMax <= (specLimits.upper ?? Number.POSITIVE_INFINITY);

  if (passesLower && passesUpper) {
    return { status: "go", message: "Worst-case stack stays inside the configured spec limits." };
  }

  if (hasLower && !passesLower) {
    return { status: "no-go", message: `Worst-case minimum ${formatNumber(result.worstCaseMin)} is below the lower spec limit.` };
  }

  return { status: "no-go", message: `Worst-case maximum ${formatNumber(result.worstCaseMax)} exceeds the upper spec limit.` };
}

function formatNumber(value: number): string {
  return value.toFixed(4);
}
