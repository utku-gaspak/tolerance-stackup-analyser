import { describe, expect, it } from "vitest";
import { applyWhatIfScenario } from "../lib/what-if";
import type { ParsedStackRow } from "../lib/types";

describe("what-if scenario", () => {
  it("scales row tolerances by global and per-row percentages", () => {
    const rows: ParsedStackRow[] = [
      { id: "1", label: "A", nominal: 10, plusTolerance: 0.1, minusTolerance: 0.1, direction: "+" },
      { id: "2", label: "B", nominal: 20, plusTolerance: 0.2, minusTolerance: 0.2, direction: "-" }
    ];

    const scenario = applyWhatIfScenario(rows, 150, { "1": 200 });

    expect(scenario[0]?.plusTolerance).toBeCloseTo(0.3, 6);
    expect(scenario[0]?.minusTolerance).toBeCloseTo(0.3, 6);
    expect(scenario[1]?.plusTolerance).toBeCloseTo(0.3, 6);
    expect(scenario[1]?.minusTolerance).toBeCloseTo(0.3, 6);
  });
});
