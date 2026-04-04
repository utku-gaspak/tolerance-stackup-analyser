import { formatEngineeringValue } from "./units";
import type { EngineeringUnit, SavedStackVariant, StackCalculationResult } from "./types";

export interface VariantComparisonMetric {
  label: string;
  leftValue: string;
  rightValue: string;
  delta: string;
}

export interface VariantComparisonSummary {
  leftName: string;
  rightName: string;
  unit: EngineeringUnit;
  metrics: VariantComparisonMetric[];
}

export function buildVariantComparison(
  left: SavedStackVariant | null,
  right: SavedStackVariant | null
): VariantComparisonSummary | null {
  if (!left || !right) {
    return null;
  }

  return {
    leftName: left.name,
    rightName: right.name,
    unit: left.unit,
    metrics: [
      metric("Total nominal", left.result.totalNominal, right.result.totalNominal),
      metric("Worst-case min", left.result.worstCaseMin, right.result.worstCaseMin),
      metric("Worst-case max", left.result.worstCaseMax, right.result.worstCaseMax),
      metric("Worst-case span", span(left.result), span(right.result)),
      metric("RSS tolerance", left.result.rssTolerance, right.result.rssTolerance)
    ]
  };
}

function metric(label: string, leftValue: number, rightValue: number): VariantComparisonMetric {
  return {
    label,
    leftValue: formatNumber(leftValue),
    rightValue: formatNumber(rightValue),
    delta: formatDelta(rightValue - leftValue)
  };
}

function span(result: StackCalculationResult): number {
  return result.worstCaseMax - result.worstCaseMin;
}

function formatNumber(value: number): string {
  return formatEngineeringValue(value);
}

function formatDelta(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatEngineeringValue(value)}`;
}
