import type { StackRow } from "./types";

const STACK_ROW_HEADERS = ["id", "label", "direction", "nominal", "plusTolerance", "minusTolerance"] as const;

export function buildStackRowsCsv(rows: StackRow[]): string {
  const lines = [STACK_ROW_HEADERS.join(",")];

  for (const row of rows) {
    lines.push(
      [row.id, row.label, row.direction, row.nominal, row.plusTolerance, row.minusTolerance]
        .map(escapeCsvCell)
        .join(",")
    );
  }

  return lines.join("\n");
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (/[,"\n\r]/.test(text) || /^\s|\s$/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
