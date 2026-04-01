import type { jsPDF } from "jspdf";

export const PAGE_TOP_MARGIN = 18;
export const PAGE_BOTTOM_MARGIN = 16;
export const HEADER_TITLE_Y = 18;
export const HEADER_SUBTITLE_Y = 24;
export const HEADER_META_Y = 30;
export const HEADER_DIVIDER_Y = 34;
export const CONTENT_TOP_Y = 42;
export const SECTION_SPACING = 8;
export const TITLE_SPACING = 5;
export const TABLE_SPACING = 4;
export const SECTION_TITLE_HEIGHT = 5;
export const DEFAULT_TABLE_ROW_HEIGHT = 7;
export const DEFAULT_TABLE_HEADER_HEIGHT = 8;
export const HISTOGRAM_ROW_HEIGHT = 6;

export function startNewPage(doc: jsPDF): number {
  doc.addPage();
  return CONTENT_TOP_Y;
}

export function ensureSpace(y: number, requiredHeight: number, pageHeight: number): number {
  if (y + requiredHeight > pageHeight - PAGE_BOTTOM_MARGIN) {
    return CONTENT_TOP_Y;
  }

  return y;
}

export function estimateTableBlockHeight(
  rowCount: number,
  rowHeight: number = DEFAULT_TABLE_ROW_HEIGHT,
  headerHeight: number = DEFAULT_TABLE_HEADER_HEIGHT
): number {
  return TABLE_SPACING + headerHeight + rowCount * rowHeight;
}

export function estimateSectionBlockHeight(
  rowCount: number,
  rowHeight: number = DEFAULT_TABLE_ROW_HEIGHT,
  headerHeight: number = DEFAULT_TABLE_HEADER_HEIGHT
): number {
  return TITLE_SPACING + SECTION_TITLE_HEIGHT + estimateTableBlockHeight(rowCount, rowHeight, headerHeight);
}

export function estimateTextBlockHeight(lineCount: number, lineHeight: number = 5): number {
  return TITLE_SPACING + SECTION_TITLE_HEIGHT + lineCount * lineHeight;
}
