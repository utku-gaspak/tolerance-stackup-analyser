import { buildPdfReportData, type PdfReportInput } from "./pdf-report-data";

export function buildReportJson(input: PdfReportInput): string {
  return `${JSON.stringify(buildPdfReportData(input), null, 2)}\n`;
}

export function downloadReportJson(input: PdfReportInput): void {
  const json = buildReportJson(input);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "tolerance-stackup-report.json";
  link.click();

  URL.revokeObjectURL(url);
}
