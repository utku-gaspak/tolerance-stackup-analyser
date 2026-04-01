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

export function parseStackRowsCsv(csv: string): StackRow[] {
  const records = parseCsvRecords(csv);

  if (records.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = records;
  const headerIndex = new Map(headerRow.map((header, index) => [header.trim(), index]));

  for (const requiredHeader of STACK_ROW_HEADERS) {
    if (!headerIndex.has(requiredHeader)) {
      throw new Error(`Missing CSV column: ${requiredHeader}`);
    }
  }

  return dataRows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row, index) => ({
      id: getCell(row, headerIndex, "id") || `row-${index + 1}`,
      label: getCell(row, headerIndex, "label"),
      nominal: getCell(row, headerIndex, "nominal"),
      plusTolerance: getCell(row, headerIndex, "plusTolerance"),
      minusTolerance: getCell(row, headerIndex, "minusTolerance"),
      direction: normalizeDirection(getCell(row, headerIndex, "direction"))
    }));
}

function parseCsvRecords(csv: string): string[][] {
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = false;
        continue;
      }

      currentCell += char;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRecord.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\n") {
      currentRecord.push(currentCell);
      records.push(currentRecord);
      currentRecord = [];
      currentCell = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    currentCell += char;
  }

  if (currentCell.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentCell);
    records.push(currentRecord);
  }

  return records;
}

function getCell(row: string[], headerIndex: Map<string, number>, header: (typeof STACK_ROW_HEADERS)[number]): string {
  return row[headerIndex.get(header) ?? -1]?.trim() ?? "";
}

function normalizeDirection(direction: string): StackRow["direction"] {
  if (direction === "+" || direction === "-") {
    return direction;
  }

  return "";
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);

  if (/[,"\n\r]/.test(text) || /^\s|\s$/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
