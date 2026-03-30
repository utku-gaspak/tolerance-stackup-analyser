import { Fragment } from "react";
import type { RowValidationError, StackRow } from "../lib/types";

interface StackRowEditorProps {
  index: number;
  row: StackRow;
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  errors?: Partial<Record<RowValidationError["field"], string>>;
}

export function StackRowEditor({ index, row, onChangeRow, onDeleteRow, errors = {} }: StackRowEditorProps) {
  const hasErrors = Object.keys(errors).length > 0;
  const zebra = index % 2 === 0 ? "bg-white" : "bg-slate-50";
  const contribution = formatSignedContribution(row.nominal, row.direction);

  return (
    <Fragment>
      <tr className={`group border-b border-slate-200 transition-colors hover:bg-slate-100 ${zebra}`}>
        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-500 align-middle">{index}</td>
        <td className="px-4 py-4 align-middle">
          <FieldInput
            value={row.label}
            onChange={(value) => onChangeRow(row.id, "label", value)}
            placeholder="Label"
            invalid={Boolean(errors.label)}
            align="left"
          />
        </td>
        <td className="px-4 py-4 align-middle">
          <FieldInput
            value={row.nominal}
            onChange={(value) => onChangeRow(row.id, "nominal", value)}
            placeholder="0.00"
            invalid={Boolean(errors.nominal)}
            align="right"
          />
        </td>
        <td className="px-4 py-4 align-middle">
          <FieldInput
            value={row.plusTolerance}
            onChange={(value) => onChangeRow(row.id, "plusTolerance", value)}
            placeholder="0.00"
            invalid={Boolean(errors.plusTolerance)}
            align="right"
          />
        </td>
        <td className="px-4 py-4 align-middle">
          <FieldInput
            value={row.minusTolerance}
            onChange={(value) => onChangeRow(row.id, "minusTolerance", value)}
            placeholder="0.00"
            invalid={Boolean(errors.minusTolerance)}
            align="right"
          />
        </td>
        <td className="px-4 py-4 align-middle">
          <DirectionToggle
            value={row.direction}
            onChange={(value) => onChangeRow(row.id, "direction", value)}
            invalid={Boolean(errors.direction)}
          />
        </td>
        <td className="px-4 py-4 text-right align-middle font-mono text-sm font-semibold tabular-nums text-slate-700">
          {contribution}
        </td>
        <td className="px-4 py-4 text-center align-middle">
          <button
            type="button"
            onClick={() => onDeleteRow(row.id)}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            Delete
          </button>
        </td>
      </tr>

      {hasErrors ? (
        <tr className="border-b border-slate-200 bg-rose-50/70">
          <td colSpan={8} className="px-4 py-3 text-xs leading-5 text-rose-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.values(errors).map((message) => (
                <span key={message} className="rounded-full border border-rose-200 bg-white px-2.5 py-1">
                  {message}
                </span>
              ))}
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  invalid,
  align
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
  align: "left" | "right";
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`block w-full min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:bg-slate-50 focus:ring-2 focus:ring-slate-200 ${
        align === "right" ? "text-right tabular-nums" : "text-left"
      } ${invalid ? "border-rose-300 ring-1 ring-inset ring-rose-300" : "border-slate-200"}`}
    />
  );
}

function DirectionToggle({
  value,
  onChange,
  invalid
}: {
  value: StackRow["direction"];
  onChange: (value: StackRow["direction"]) => void;
  invalid?: boolean;
}) {
  const base = "inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <div className={`inline-flex w-full items-center gap-2 rounded-full border bg-white p-1 shadow-sm ${invalid ? "border-rose-300 ring-1 ring-inset ring-rose-300" : "border-slate-200"}`}>
      <button
        type="button"
        onClick={() => onChange("+")}
        className={`${base} w-1/2 ${value === "+" ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
      >
        +
      </button>
      <button
        type="button"
        onClick={() => onChange("-")}
        className={`${base} w-1/2 ${value === "-" ? "bg-rose-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
      >
        -
      </button>
    </div>
  );
}

function formatSignedContribution(nominal: string, direction: StackRow["direction"]): string {
  const parsed = Number(nominal);
  const numeric = Number.isFinite(parsed) ? parsed.toFixed(2) : "—";

  if (direction === "+") {
    return `+${numeric}`;
  }

  if (direction === "-") {
    return `-${numeric}`;
  }

  return numeric;
}
