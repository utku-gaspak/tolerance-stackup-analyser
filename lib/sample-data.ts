import type { StackRow } from "./types";

export const defaultSampleRows: StackRow[] = [
  {
    id: "row-1",
    label: "Bracket A",
    nominal: "10.00",
    plusTolerance: "0.10",
    minusTolerance: "0.10",
    direction: "+"
  },
  {
    id: "row-2",
    label: "Spacer B",
    nominal: "20.00",
    plusTolerance: "0.20",
    minusTolerance: "0.20",
    direction: "+"
  },
  {
    id: "row-3",
    label: "Shim C",
    nominal: "5.00",
    plusTolerance: "0.05",
    minusTolerance: "0.05",
    direction: "+"
  }
];

export const samplePresets = {
  "V-01": defaultSampleRows,
  "V-02": [
    {
      id: "row-1",
      label: "Base",
      nominal: "50.00",
      plusTolerance: "0.10",
      minusTolerance: "0.10",
      direction: "+"
    },
    {
      id: "row-2",
      label: "Cutout",
      nominal: "20.00",
      plusTolerance: "0.20",
      minusTolerance: "0.20",
      direction: "-"
    },
    {
      id: "row-3",
      label: "Shim",
      nominal: "5.00",
      plusTolerance: "0.05",
      minusTolerance: "0.05",
      direction: "+"
    }
  ] satisfies StackRow[],
  "V-03": [
    {
      id: "row-1",
      label: "Block",
      nominal: "100.00",
      plusTolerance: "0.30",
      minusTolerance: "0.10",
      direction: "+"
    },
    {
      id: "row-2",
      label: "Pocket",
      nominal: "40.00",
      plusTolerance: "0.20",
      minusTolerance: "0.40",
      direction: "-"
    }
  ] satisfies StackRow[]
};
