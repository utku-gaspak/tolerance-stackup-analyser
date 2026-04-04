export type StackDirection = "+" | "-";

export interface StackRow {
  id: string;
  label: string;
  nominal: string;
  plusTolerance: string;
  minusTolerance: string;
  direction: StackDirection | "";
}

export interface ParsedStackRow {
  id: string;
  label: string;
  nominal: number;
  plusTolerance: number;
  minusTolerance: number;
  direction: StackDirection;
}

export interface StackCalculationResult {
  totalNominal: number;
  worstCaseMin: number;
  worstCaseMax: number;
  rssTolerance: number;
  rssMin: number;
  rssMax: number;
}

export interface SavedStackVariant {
  id: string;
  name: string;
  rowCount: number;
  rows: StackRow[];
  result: StackCalculationResult;
}

export interface RowValidationError {
  id: string;
  field: "label" | "nominal" | "plusTolerance" | "minusTolerance" | "direction";
  message: string;
}
