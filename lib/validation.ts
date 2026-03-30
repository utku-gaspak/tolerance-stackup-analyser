import type { ParsedStackRow, RowValidationError, StackRow } from "./types";

export interface ValidationResult {
  parsedRows: ParsedStackRow[];
  errors: RowValidationError[];
  isValid: boolean;
}

export function validateStackRows(rows: StackRow[]): ValidationResult {
  const errors: RowValidationError[] = [];
  const parsedRows: ParsedStackRow[] = [];

  for (const row of rows) {
    const label = row.label.trim();
    const nominal = parseRequiredNumber(row.nominal);
    const plusTolerance = parseRequiredNumber(row.plusTolerance);
    const minusTolerance = parseRequiredNumber(row.minusTolerance);
    const direction = row.direction;

    if (!label) {
      errors.push({ id: row.id, field: "label", message: "Label is required." });
    }

    if (nominal === null) {
      errors.push({ id: row.id, field: "nominal", message: "Nominal must be a valid number." });
    }

    if (plusTolerance === null) {
      errors.push({ id: row.id, field: "plusTolerance", message: "Plus tolerance must be a valid number." });
    } else if (plusTolerance < 0) {
      errors.push({ id: row.id, field: "plusTolerance", message: "Plus tolerance cannot be negative." });
    }

    if (minusTolerance === null) {
      errors.push({ id: row.id, field: "minusTolerance", message: "Minus tolerance must be a valid number." });
    } else if (minusTolerance < 0) {
      errors.push({ id: row.id, field: "minusTolerance", message: "Minus tolerance cannot be negative." });
    }

    if (direction !== "+" && direction !== "-") {
      errors.push({ id: row.id, field: "direction", message: "Direction must be + or -." });
    }

    if (label && nominal !== null && plusTolerance !== null && minusTolerance !== null && (direction === "+" || direction === "-")) {
      parsedRows.push({
        id: row.id,
        label,
        nominal,
        plusTolerance,
        minusTolerance,
        direction
      });
    }
  }

  return {
    parsedRows,
    errors,
    isValid: errors.length === 0
  };
}

function parseRequiredNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}
