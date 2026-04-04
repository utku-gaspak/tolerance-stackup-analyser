import { describe, expect, it } from "vitest";
import {
  CONTENT_TOP_Y,
  HISTOGRAM_ROW_HEIGHT,
  PAGE_BOTTOM_MARGIN,
  ensureSpace,
  estimateHistogramBlockHeight,
  estimateSectionBlockHeight,
  estimateTableBlockHeight
} from "../lib/pdf-layout";

describe("PDF layout helpers", () => {
  it("reserves the top header band for body content", () => {
    const pageHeight = 297;
    const y = ensureSpace(270, 20, pageHeight);

    expect(y).toBe(CONTENT_TOP_Y);
  });

  it("keeps small blocks on the current page when space remains", () => {
    const pageHeight = 297;
    const y = ensureSpace(100, 12, pageHeight);

    expect(y).toBe(100);
  });

  it("estimates section blocks larger than plain tables", () => {
    expect(estimateSectionBlockHeight(1)).toBeGreaterThan(estimateTableBlockHeight(1));
    expect(PAGE_BOTTOM_MARGIN).toBeGreaterThan(0);
  });

  it("estimates histogram blocks with heading overhead", () => {
    expect(estimateHistogramBlockHeight(1, HISTOGRAM_ROW_HEIGHT)).toBeGreaterThan(HISTOGRAM_ROW_HEIGHT);
    expect(estimateHistogramBlockHeight(3, HISTOGRAM_ROW_HEIGHT)).toBeGreaterThan(
      estimateHistogramBlockHeight(1, HISTOGRAM_ROW_HEIGHT)
    );
  });
});
