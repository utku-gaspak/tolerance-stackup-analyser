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

  cursorY = placeSection(doc, cursorY, estimateSectionBlockHeight(1, DEFAULT_TABLE_ROW_HEIGHT), pageHeight);
  cursorY = drawSectionHeading(doc, "Executive Summary", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Metric", "Value"]],
    body:
      report.summaryMetrics.length > 0
        ? report.summaryMetrics.map((metric) => [metric.label, metric.value])
        : [["Status", "No deterministic results available"]],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
  });

  cursorY = lastTableY(doc) ?? cursorY;
  cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateSectionBlockHeight(1, DEFAULT_TABLE_ROW_HEIGHT), pageHeight);
  cursorY = drawSectionHeading(doc, "Validation Summary", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Field", "Value"]],
    body: report.validationSummary.map((item) => [item.label, item.value]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
  });

  cursorY = lastTableY(doc) ?? cursorY;
  if (report.validationErrors.length > 0) {
    cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateSectionBlockHeight(1, 8.5), pageHeight);
    cursorY = drawSectionHeading(doc, "Validation Errors", cursorY, left, pageWidth - right);
    autoTable(doc, {
      startY: cursorY,
      margin: tableMargin,
      theme: "grid",
      head: [["Row", "Field", "Message"]],
      body: report.validationErrors.map((error) => [error.row, error.field, error.message]),
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
      headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" }
    });
    cursorY = lastTableY(doc) ?? cursorY;
  }

  cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateSectionBlockHeight(1, 8.5), pageHeight);
  cursorY = drawSectionHeading(doc, "Stack Definition", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["#", "Label", "Dir", "Nominal", "+Tol", "-Tol", "Contribution"]],
    body: report.rows.map((row) => [row.index, row.label, row.direction, row.nominal, row.plusTolerance, row.minusTolerance, row.contribution]),
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
  });

  cursorY = lastTableY(doc) ?? cursorY;
  cursorY = placeSection(doc, cursorY + TITLE_SPACING, estimateTextBlockHeight(1), pageHeight);
  cursorY = drawSectionHeading(doc, "Equation Summary", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Equation"]],
    body: [[report.equationExpression || "No equation available"]],
    styles: { font: "courier", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2, valign: "top" },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold", font: "helvetica" },
    columnStyles: { 0: { cellWidth: pageWidth - left - right } }
  });

  cursorY = lastTableY(doc) ?? cursorY;
  cursorY = placeSection(doc, cursorY + TITLE_SPACING, estimateSectionBlockHeight(1, DEFAULT_TABLE_ROW_HEIGHT), pageHeight);
  cursorY = drawSectionHeading(doc, "Deterministic Results", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Metric", "Value"]],
    body:
      report.summaryMetrics.length > 0
        ? report.summaryMetrics.map((metric) => [metric.label, metric.value])
        : [["Status", "No deterministic results available"]],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 55, fontStyle: "bold" }, 1: { halign: "right" } }
  });

  cursorY = lastTableY(doc) ?? cursorY;
  cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateSectionBlockHeight(1, DEFAULT_TABLE_ROW_HEIGHT), pageHeight);
  cursorY = drawSectionHeading(doc, "Monte Carlo Summary", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Metric", "Value"]],
    body:
      report.monteCarlo.summary.length > 0
        ? report.monteCarlo.summary.map((metric) => [metric.label, metric.value])
        : [["Status", report.monteCarlo.note]],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2 },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" }, 1: { halign: "right" } }
  });

  if (report.monteCarlo.histogram.length > 0) {
    cursorY = lastTableY(doc) ?? cursorY;
    cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateSectionBlockHeight(report.monteCarlo.histogram.length, DEFAULT_TABLE_ROW_HEIGHT), pageHeight);
    cursorY = drawSectionHeading(doc, "Histogram", cursorY, left, pageWidth - right);
    cursorY = drawHistogram(doc, report.monteCarlo.histogram, report.monteCarlo.sampleCount, cursorY, left, pageWidth - right, pageHeight);
  }

  cursorY = placeSection(doc, cursorY + SECTION_SPACING, estimateTableBlockHeight(report.notes.length, 5), pageHeight);
  cursorY = drawSectionHeading(doc, "Assumptions and Notes", cursorY, left, pageWidth - right);
  autoTable(doc, {
    startY: cursorY,
    margin: tableMargin,
    theme: "grid",
    head: [["Note"]],
    body: report.notes.map((note) => [note]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: 20, lineColor: 0, lineWidth: 0.2, valign: "top" },
    headStyles: { fillColor: [235, 235, 235], textColor: 0, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: pageWidth - left - right } }
  });

  addHeadersAndFooters(doc, report.generatedAtLabel, report.rowCount, pageWidth, pageHeight);
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

function drawHistogram(
  doc: jsPDF,
  bins: Array<{ range: string; bar: string; count: string }>,
  sampleCount: number,
  startY: number,
  left: number,
  rightEdge: number,
  pageHeight: number
): number {
  const rowHeight = 6;
  const labelWidth = 34;
  const countWidth = 14;
  const barGap = 3;
  const barWidth = rightEdge - left - labelWidth - countWidth - barGap * 2;
  let y = startY;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  bins.forEach((bin) => {
    if (ensureSpace(y, rowHeight, pageHeight) === CONTENT_TOP_Y && y !== CONTENT_TOP_Y) {
      y = startNewPage(doc);
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

function addHeadersAndFooters(doc: jsPDF, generatedAtLabel: string, rowCount: number, pageWidth: number, pageHeight: number): void {
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawPageHeader(doc, generatedAtLabel, rowCount, pageWidth, pageHeight, page, totalPages);
  }
}

function drawPageHeader(
  doc: jsPDF,
  generatedAtLabel: string,
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
  doc.text(`Generated ${generatedAtLabel} | Units: mm | Rows: ${rowCount}`, 16, HEADER_META_Y);
  doc.line(16, HEADER_DIVIDER_Y, pageWidth - 16, HEADER_DIVIDER_Y);
  doc.line(16, pageHeight - PAGE_BOTTOM_MARGIN + 2, pageWidth - 16, pageHeight - PAGE_BOTTOM_MARGIN + 2);
  doc.text(`Page ${page} of ${totalPages}`, pageWidth - 16, pageHeight - PAGE_BOTTOM_MARGIN + 6, { align: "right" });
}
