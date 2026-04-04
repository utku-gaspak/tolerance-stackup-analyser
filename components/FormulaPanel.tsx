import type { StackRow } from "../lib/types";

interface FormulaPanelProps {
  rows: StackRow[];
  compact?: boolean;
}

export function FormulaPanel({ rows, compact = false }: FormulaPanelProps) {
  const currentTerms = rows.map((row) => formatTerm(row.nominal, row.direction)).join(" + ");

  if (compact) {
    return (
      <section className="h-full border border-neutral-900 bg-neutral-100 p-2.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Formula reference</p>
            <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">How the stack is calculated</h2>
          </div>
        </div>
        <div className="mt-2.5 grid gap-4 text-[10.5px] leading-[1.1rem] text-neutral-700 xl:grid-cols-3">
          <CompactFormula
            id="F-01"
            title="Total nominal stack"
            formula="Σ(direction_i × n_i)"
            note="Adds + rows, subtracts - rows."
          />
          <CompactFormula
            id="F-02"
            title="Worst-case bounds"
            formula="local_min = n_i - t_minus_i, local_max = n_i + t_plus_i"
            note="+ rows use local bounds directly."
          />
          <CompactFormula
            id="F-03"
            title="RSS approximation"
            formula="RSS_tol = sqrt(Σ(((t_plus_i + t_minus_i)/2)^2))"
            note="Uses average row tolerance and assumes independent contributors."
          />
        </div>

        <article className="mt-4 border border-neutral-900 bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-900 pb-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Assumptions</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">Modeling notes</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] leading-[1.1rem] text-neutral-700">
            <span>1D linear chain only</span>
            <span>RSS assumes independence</span>
            <span>Asymmetric tolerances supported</span>
            <span>Monte Carlo uses bounded normal sampling</span>
          </div>
        </article>

        <article className="mt-4 border border-neutral-900 bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Validation cases</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[10.5px] leading-[1.1rem] text-neutral-700">
            <span className="border border-neutral-900 bg-neutral-100 px-2 py-0.5">V-01 All positive</span>
            <span className="border border-neutral-900 bg-neutral-100 px-2 py-0.5">V-02 Mixed directions</span>
            <span className="border border-neutral-900 bg-neutral-100 px-2 py-0.5">V-03 Asymmetric tolerances</span>
            <span className="border border-neutral-900 bg-neutral-100 px-2 py-0.5">V-04 Zero tolerance</span>
            <span className="border border-neutral-900 bg-neutral-100 px-2 py-0.5">V-05 Invalid input</span>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="border border-neutral-900 bg-white p-4">
      <div className="border-b border-neutral-900 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-700">Formula reference</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">How the stack is calculated</h2>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-800">
        <FormulaBlock
          id="F-01"
          title="Total nominal stack"
          formula="Σ(direction_i × n_i)"
          note="Adds + rows and subtracts - rows to get the baseline stack value."
        />
        <FormulaBlock
          id="F-02"
          title="Worst-case bounds"
          formula="local_min = n_i - t_minus_i, local_max = n_i + t_plus_i"
          note="+ rows use local_min/local_max directly; - rows invert the contribution."
        />
        <FormulaBlock
          id="F-03"
          title="RSS approximation"
          formula="RSS_tol = sqrt(Σ(((t_plus_i + t_minus_i)/2)^2))"
          note="Uses the average of plus/minus tolerance per row, assumes independence, and is not a replacement for worst-case."
        />
      </div>

      <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-xs leading-5 text-neutral-700">
        Monte Carlo uses normal sampling centered on nominal values with sigma approximated from row tolerance and then
        clips samples to each row&apos;s tolerance bounds. Treat yield as an estimate, not a guarantee.
      </div>

      <div className="mt-4 border border-neutral-900 bg-neutral-100 p-3 text-xs leading-5 text-neutral-700">
        <p className="font-semibold uppercase tracking-[0.16em] text-neutral-600">Current stack expression</p>
        <p className="mt-2 font-mono tabular-nums text-neutral-950 break-words">
          {currentTerms || "No rows defined"}
        </p>
      </div>
    </section>
  );
}

function CompactFormula({
  id,
  title,
  formula,
  note
}: {
  id: string;
  title: string;
  formula: string;
  note: string;
}) {
  return (
    <article className="border border-neutral-900 bg-white p-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">{id}</p>
      <h3 className="mt-1 text-xs font-semibold text-neutral-950">{title}</h3>
      <p className="mt-0.5 font-mono text-[10.5px] leading-[1.1rem] text-neutral-950 tabular-nums">{formula}</p>
      <p className="mt-0.5 text-[10.5px] leading-[1.1rem] text-neutral-700">{note}</p>
    </article>
  );
}

function FormulaBlock({
  id,
  title,
  formula,
  note
}: {
  id: string;
  title: string;
  formula: string;
  note: string;
}) {
  return (
    <article className="border border-neutral-900 bg-neutral-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">{id}</p>
          <h3 className="mt-1 font-semibold text-neutral-950">{title}</h3>
        </div>
      </div>
      <p className="mt-2 font-mono text-xs leading-5 text-neutral-950 tabular-nums">{formula}</p>
      <p className="mt-2 text-xs leading-5 text-neutral-700">{note}</p>
    </article>
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
