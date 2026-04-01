import { describe, expect, it } from "vitest";
import { buildStackRowsCsv } from "../lib/csv";
import type { StackRow } from "../lib/types";

describe("CSV export", () => {
  it("exports stack rows with escaping", () => {
    const rows: StackRow[] = [
      {
        id: "1",
        label: 'Bracket, top "A"',
        nominal: "10.00",
        plusTolerance: "0.10",
        minusTolerance: "0.10",
        direction: "+"
      },
      {
        id: "2",
        label: "Spacer",
        nominal: "5.00",
        plusTolerance: "0.05",
        minusTolerance: "0.05",
        direction: "-"
      }
    ];

    expect(buildStackRowsCsv(rows)).toBe(
      [
        "id,label,direction,nominal,plusTolerance,minusTolerance",
        '1,"Bracket, top ""A""",+,10.00,0.10,0.10',
        "2,Spacer,-,5.00,0.05,0.05"
      ].join("\n")
    );
  });
});
