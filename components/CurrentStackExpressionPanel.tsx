import type { StackRow } from "../lib/types";

interface CurrentStackExpressionPanelProps {
  rows: StackRow[];
}

export function CurrentStackExpressionPanel({ rows }: CurrentStackExpressionPanelProps) {
  const expression = rows.map((row) => formatTerm(row.nominal, row.direction)).join(" + ");

  return (
    <section className="h-full border border-neutral-900 bg-neutral-100 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Current stack expression</p>
      <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Live signed nominal terms</h2>
      <div className="mt-2.5 border border-neutral-900 bg-white p-2.5 text-xs leading-[1.1rem] text-neutral-700">
        <p className="font-mono tabular-nums text-neutral-950 break-words">{expression || "No rows defined"}</p>
      </div>
      <p className="mt-2.5 text-[10.5px] leading-[1.1rem] text-neutral-700">
        Same signed nominal expression used by the calculator.
      </p>
    </section>
  );
}

function formatTerm(nominal: string, direction: StackRow["direction"]): string {
  const value = Number(nominal);

  if (!Number.isFinite(value)) {
    return "—";
  }

  const formatted = value.toFixed(2);
  return direction === "-" ? `-${formatted}` : `+${formatted}`;
}
