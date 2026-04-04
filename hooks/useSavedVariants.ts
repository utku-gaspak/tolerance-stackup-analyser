"use client";

import { useMemo, useState } from "react";
import { buildVariantComparison } from "../lib/variant-comparison";
import { convertSavedVariants } from "../lib/units";
import type { EngineeringUnit, SavedStackVariant, StackCalculationResult, StackRow } from "../lib/types";

export function useSavedVariants() {
  const [savedVariants, setSavedVariants] = useState<SavedStackVariant[]>([]);
  const [leftVariantId, setLeftVariantId] = useState<string>("");
  const [rightVariantId, setRightVariantId] = useState<string>("");

  const leftVariant = savedVariants.find((variant) => variant.id === leftVariantId) ?? null;
  const rightVariant = savedVariants.find((variant) => variant.id === rightVariantId) ?? null;
  const variantComparison = useMemo(
    () => buildVariantComparison(leftVariant, rightVariant),
    [leftVariant, rightVariant]
  );

  function saveCurrentVariant(rows: StackRow[], result: StackCalculationResult, unit: EngineeringUnit) {
    setSavedVariants((current) => {
      const nextIndex = current.length + 1;
      const nextVariant: SavedStackVariant = {
        id: `variant-${Date.now()}-${nextIndex}`,
        name: `Variant ${nextIndex}`,
        unit,
        rowCount: rows.length,
        rows: rows.map((row) => ({ ...row })),
        result: { ...result }
      };
      const nextVariants = [...current, nextVariant];

      setLeftVariantId((leftCurrent) => leftCurrent || nextVariant.id);
      setRightVariantId((rightCurrent) => {
        if (rightCurrent) {
          return rightCurrent;
        }

        return nextVariants.length >= 2 ? nextVariant.id : "";
      });

      return nextVariants;
    });
  }

  function convertVariantUnits(from: EngineeringUnit, to: EngineeringUnit) {
    setSavedVariants((current) => convertSavedVariants(current, from, to));
  }

  return {
    savedVariants,
    leftVariantId,
    rightVariantId,
    setLeftVariantId,
    setRightVariantId,
    saveCurrentVariant,
    convertVariantUnits,
    variantComparison
  };
}
