import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { buildPdfReportData, type PdfReportInput } from "./pdf-report-data";
import {
  CONTENT_TOP_Y,
  DEFAULT_TABLE_ROW_HEIGHT,
  HEADER_META_Y,
  HEADER_DIVIDER_Y,
  HEADER_SUBTITLE_Y,
  HEADER_TITLE_Y,
  PAGE_BOTTOM_MARGIN,
  SECTION_SPACING,
  TITLE_SPACING,
  ensureSpace,
  HISTOGRAM_HEADER_HEIGHT,
  HISTOGRAM_ROW_HEIGHT,
  estimateHistogramBlockHeight,
  estimateSectionBlockHeight,
  estimateTableBlockHeight,
  estimateTextBlockHeight,
  startNewPage
} from "./pdf-layout";

export function downloadPdfReport(input: PdfReportInput): void {
  const report = buildPdfReportData(input);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;
  const right = 16;
  const tableMargin = { left, right, top: CONTENT_TOP_Y, bottom: PAGE_BOTTOM_MARGIN };
  let cursorY = CONTENT_TOP_Y;

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);

  const executiveSummaryBody =
    report.summaryMetrics.length > 0
      ? report.summaryMetrics.map((metric) => [metric.label, metric.value])
      : [["Status", "No deterministic results available"]];
  const validationSummaryBody = report.validationSummary.map((item) => [item.label, item.value]);
  const validationErrorsBody = report.validationErrors.map((error) => [error.row, error.field, error.message]);
  const stackDefinitionBody = report.rows.map((row) => [
    row.index,
    row.label,
    row.direction,
    row.nominal,
    row.plusTolerance,
    row.minusTolerance,
    row.contribution
  ]);
  const deterministicResultsBody =
    report.summaryMetrics.length > 0
      ? report.summaryMetrics.map((metric) => [metric.label, metric.value])
      : [["Status", "No deterministic results available"]];
  const monteCarloSummaryBody =
    report.monteCarlo.summary.length > 0
      ? report.monteCarlo.summary.map((metric) => [metric.label, metric.value])
      : [["Status", report.monteCarlo.note]];
  const notesBody = report.notes.map((note) => [note]);

  cursorY = renderTableSection(doc, {
    title: "Executive Summary",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: executiveSummaryBody,
    head: [["Metric", "Value"]],
    requiredHeight: estimateSectionBlockHeight(executiveSummaryBody.length, DEFAULT_TABLE_ROW_HEIGHT),
    options: {
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
    }
  });
  cursorY = renderTableSection(doc, {
    title: "Validation Summary",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: validationSummaryBody,
    head: [["Field", "Value"]],
    requiredHeight: estimateSectionBlockHeight(validationSummaryBody.length, DEFAULT_TABLE_ROW_HEIGHT),
    options: {
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
    }
  });

  if (validationErrorsBody.length > 0) {
    cursorY = renderTableSection(doc, {
      title: "Validation Errors",
      cursorY,
      left,
      right: pageWidth - right,
      pageHeight,
      margin: tableMargin,
      body: validationErrorsBody,
      head: [["Row", "Field", "Message"]],
      requiredHeight: estimateSectionBlockHeight(validationErrorsBody.length, 8.5),
      options: {
        styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
        headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" }
      }
    });
  }

  cursorY = renderTableSection(doc, {
    title: "Stack Definition",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: stackDefinitionBody,
    head: [["#", "Label", "Dir", "Nominal", "+Tol", "-Tol", "Contribution"]],
    requiredHeight: estimateSectionBlockHeight(stackDefinitionBody.length, 8.5),
    options: {
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 1.9, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        2: { cellWidth: 12, halign: "center" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" }
      }
    }
  });
  cursorY = renderTableSection(doc, {
    title: "Equation Summary",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: [[report.equationExpression || "No equation available"]],
    head: [["Equation"]],
    requiredHeight: estimateTextBlockHeight(1),
    spacing: TITLE_SPACING,
    options: {
      styles: { font: "courier", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2, valign: "top" },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold", font: "helvetica" },
      columnStyles: { 0: { cellWidth: pageWidth - left - right } }
    }
  });
  cursorY = renderTableSection(doc, {
    title: "Deterministic Results",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: deterministicResultsBody,
    head: [["Metric", "Value"]],
    requiredHeight: estimateSectionBlockHeight(deterministicResultsBody.length, DEFAULT_TABLE_ROW_HEIGHT),
    spacing: TITLE_SPACING,
    options: {
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
    }
  });
  cursorY = renderTableSection(doc, {
    title: "Monte Carlo Summary",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: monteCarloSummaryBody,
    head: [["Metric", "Value"]],
    requiredHeight: estimateSectionBlockHeight(monteCarloSummaryBody.length, DEFAULT_TABLE_ROW_HEIGHT),
    options: {
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" }, 1: { halign: "right" } }
    }
  });

  if (report.monteCarlo.histogram.length > 0) {
    cursorY = renderHistogramSection(
      doc,
      report.monteCarlo.histogram,
      report.monteCarlo.sampleCount,
      cursorY,
      left,
      pageWidth - right,
      pageHeight
    );
  }

  renderTableSection(doc, {
    title: "Assumptions and Notes",
    cursorY,
    left,
    right: pageWidth - right,
    pageHeight,
    margin: tableMargin,
    body: notesBody,
    head: [["Note"]],
    requiredHeight: estimateTableBlockHeight(notesBody.length, 6.5),
    options: {
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2, valign: "top" },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: pageWidth - left - right } }
    }
  });

  addHeadersAndFooters(doc, report.generatedAtLabel, report.engineeringUnit, report.rowCount, pageWidth, pageHeight);
  doc.save("tolerance-stackup-report.pdf");
}

function drawSectionHeading(doc: jsPDF, title: string, y: number, left: number, rightEdge: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, left, y);
  doc.setLineWidth(0.25);
  doc.line(left, y + 1.8, rightEdge, y + 1.8);
  return y + 5;
}

function lastTableY(doc: jsPDF): number | undefined {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
}

function placeSection(doc: jsPDF, y: number, requiredHeight: number, pageHeight: number): number {
  if (ensureSpace(y, requiredHeight, pageHeight) === CONTENT_TOP_Y && y !== CONTENT_TOP_Y) {
    return startNewPage(doc);
  }

  return y;
}

function prepareSectionStart(
  doc: jsPDF,
  cursorY: number,
  spacing: number,
  requiredHeight: number,
  pageHeight: number
): number {
  const startY = placeSection(doc, cursorY + spacing, requiredHeight, pageHeight);
  return startY;
}

function renderTableSection(
  doc: jsPDF,
  {
    title,
    cursorY,
    left,
    right,
    pageHeight,
    margin,
    head,
    body,
    requiredHeight,
    spacing = SECTION_SPACING,
    options
  }: {
    title: string;
    cursorY: number;
    left: number;
    right: number;
    pageHeight: number;
    margin: { left: number; right: number; top: number; bottom: number };
    head: string[][];
    body: Array<Array<string | number>>;
    requiredHeight: number;
    spacing?: number;
    options: Parameters<typeof autoTable>[1];
  }
): number {
  const startY = prepareSectionStart(doc, cursorY, spacing, requiredHeight, pageHeight);
  const tableY = drawSectionHeading(doc, title, startY, left, right);

  autoTable(doc, {
    ...options,
    startY: tableY,
    margin,
    pageBreak: "avoid",
    rowPageBreak: "avoid",
    theme: "grid",
    head,
    body
  });

  return lastTableY(doc) ?? tableY;
}

function renderHistogramSection(
  doc: jsPDF,
  bins: Array<{ range: string; bar: string; count: string }>,
  sampleCount: number,
  cursorY: number,
  left: number,
  rightEdge: number,
  pageHeight: number
): number {
  let y = prepareSectionStart(
    doc,
    cursorY,
    SECTION_SPACING,
    estimateHistogramBlockHeight(1, HISTOGRAM_ROW_HEIGHT),
    pageHeight
  );
  y = drawSectionHeading(doc, "Histogram", y, left, rightEdge);

  return drawHistogram(doc, bins, sampleCount, y, left, rightEdge, pageHeight);
}

function drawHistogram(
  doc: jsPDF,
  bins: Array<{ range: string; bar: string; count: string }>,
  sampleCount: number,
  startY: number,
  left: number,
  rightEdge: number,
  pageHeight: number
): number {
  const rowHeight = HISTOGRAM_ROW_HEIGHT;
  const labelWidth = 34;
  const countWidth = 14;
  const barGap = 3;
  const barWidth = rightEdge - left - labelWidth - countWidth - barGap * 2;
  let y = startY;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  bins.forEach((bin) => {
    if (
      ensureSpace(y, HISTOGRAM_HEADER_HEIGHT + rowHeight, pageHeight) === CONTENT_TOP_Y &&
      y !== CONTENT_TOP_Y
    ) {
      y = startNewPage(doc);
      y = drawSectionHeading(doc, "Histogram", y, left, rightEdge);
    }

    const count = Number(bin.count);
    const ratio = sampleCount > 0 ? count / sampleCount : 0;
    const fillWidth = Math.max(1.5, barWidth * ratio);

    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(left, y, labelWidth, rowHeight, "S");
    doc.rect(left + labelWidth + barGap, y, barWidth, rowHeight, "S");
    doc.rect(rightEdge - countWidth, y, countWidth, rowHeight, "S");

    doc.text(bin.range, left + 1.5, y + 4.1);
    doc.setFillColor(26, 26, 26);
    doc.rect(left + labelWidth + barGap, y, fillWidth, rowHeight, "F");
    doc.text(bin.count, rightEdge - 2.2, y + 4.1, { align: "right" });

    y += rowHeight;
  });

  return y;
}

function addHeadersAndFooters(
  doc: jsPDF,
  generatedAtLabel: string,
  engineeringUnit: string,
  rowCount: number,
  pageWidth: number,
  pageHeight: number
): void {
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPageHeader(doc, generatedAtLabel, engineeringUnit, rowCount, pageWidth, pageHeight, page, totalPages);
  }
}

function drawPageHeader(
  doc: jsPDF,
  generatedAtLabel: string,
  engineeringUnit: string,
  rowCount: number,
  pageWidth: number,
  pageHeight: number,
  page: number,
  totalPages: number
): void {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Tolerance Stackup Analysis", 16, HEADER_TITLE_Y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Full Stackup Report", 16, HEADER_SUBTITLE_Y);
  doc.setFontSize(8);
  doc.text(`Generated ${generatedAtLabel} | Units: ${engineeringUnit} | Rows: ${rowCount}`, 16, HEADER_META_Y);
  doc.line(16, HEADER_DIVIDER_Y, pageWidth - 16, HEADER_DIVIDER_Y);
  doc.line(16, pageHeight - PAGE_BOTTOM_MARGIN + 2, pageWidth - 16, pageHeight - PAGE_BOTTOM_MARGIN + 2);
  doc.text(`Page ${page} of ${totalPages}`, pageWidth - 16, pageHeight - PAGE_BOTTOM_MARGIN + 6, { align: "right" });
}
