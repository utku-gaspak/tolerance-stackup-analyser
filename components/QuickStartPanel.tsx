export function QuickStartPanel() {
  return (
    <aside className="border border-neutral-900 bg-neutral-100 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-700">Quick Start</p>
      <h2 className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">Recommended workflow</h2>
      <p className="mt-2 text-[10.5px] leading-[1.1rem] text-neutral-700">
        Use a reference preset or build your own stack, then review deterministic and statistical results.
      </p>

      <ol className="mt-3 space-y-2 text-[10.5px] leading-[1.1rem] text-neutral-800">
        <li className="flex gap-2">
          <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center border border-neutral-900 bg-white px-1 text-[10px] font-semibold text-neutral-700">
            1
          </span>
          <span>
            Load <WorkflowPill label="V-01" /> <WorkflowPill label="V-02" /> or <WorkflowPill label="V-03" /> to start
            from a reference case.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center border border-neutral-900 bg-white px-1 text-[10px] font-semibold text-neutral-700">
            2
          </span>
          <span>Edit rows in Stack Definition.</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center border border-neutral-900 bg-white px-1 text-[10px] font-semibold text-neutral-700">
            3
          </span>
          <span>Review Worst-case and RSS results.</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center border border-neutral-900 bg-white px-1 text-[10px] font-semibold text-neutral-700">
            4
          </span>
          <span>Run Monte Carlo if you need a distribution estimate.</span>
        </li>
        <li className="flex gap-2">
          <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center border border-neutral-900 bg-white px-1 text-[10px] font-semibold text-neutral-700">
            5
          </span>
          <span>Export PDF or JSON when the analysis is ready.</span>
        </li>
      </ol>

      <div className="mt-3 border border-neutral-900 bg-white px-2.5 py-2 text-[10.5px] leading-[1.1rem] text-neutral-700">
        Worst-case is deterministic. Monte Carlo is optional and approximate.
      </div>
    </aside>
  );
}

function WorkflowPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center border border-neutral-900 bg-neutral-100 px-1.5 py-0.5 font-semibold text-neutral-800">
      {label}
    </span>
  );
}
