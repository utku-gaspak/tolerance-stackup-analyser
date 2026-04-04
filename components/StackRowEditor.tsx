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
  const zeroToleranceInfo = isZeroToleranceRow(row)
    ? "Zero tolerance keeps this row fixed at nominal in worst-case and Monte Carlo."
    : null;
  const hasInfoRow = hasErrors || zeroToleranceInfo !== null;

  return (
    <Fragment>
      <tr className={`group transition-colors hover:bg-neutral-50 ${zebra}`}>
        <td className="border-b border-r border-neutral-900 px-3 py-3 text-center text-sm font-semibold text-neutral-700 align-middle tabular-nums">{index}</td>
        <td className="border-b border-r border-neutral-900 px-2 py-2 align-middle">
          <FieldInput
            value={row.label}
            onChange={(value) => onChangeRow(row.id, "label", value)}
            placeholder="Label"
            invalid={Boolean(errors.label)}
            align="left"
          />
        </td>
        <td className="border-b border-r border-neutral-900 px-2 py-2 align-middle">
          <FieldInput
            value={row.nominal}
            onChange={(value) => onChangeRow(row.id, "nominal", value)}
            placeholder="0.00"
            invalid={Boolean(errors.nominal)}
            align="right"
          />
        </td>
        <td className="border-b border-r border-neutral-900 px-2 py-2 align-middle">
          <FieldInput
            value={row.plusTolerance}
            onChange={(value) => onChangeRow(row.id, "plusTolerance", value)}
            placeholder="0.00"
            invalid={Boolean(errors.plusTolerance)}
            align="right"
          />
        </td>
        <td className="border-b border-r border-neutral-900 px-2 py-2 align-middle">
          <FieldInput
            value={row.minusTolerance}
            onChange={(value) => onChangeRow(row.id, "minusTolerance", value)}
            placeholder="0.00"
            invalid={Boolean(errors.minusTolerance)}
            align="right"
          />
        </td>
        <td className="border-b border-r border-neutral-900 px-2 py-2 align-middle">
          <DirectionToggle
            value={row.direction}
            onChange={(value) => onChangeRow(row.id, "direction", value)}
            invalid={Boolean(errors.direction)}
          />
        </td>
        <td className="border-b border-r border-neutral-900 px-3 py-3 text-right align-middle font-mono text-sm font-semibold tabular-nums text-neutral-950">
          {contribution}
        </td>
        <td className="border-b border-neutral-900 px-2 py-2 text-center align-middle">
          <button
            type="button"
            onClick={() => onDeleteRow(row.id)}
            className="inline-flex items-center justify-center border border-neutral-900 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            Delete
          </button>
        </td>
      </tr>

      {hasInfoRow ? (
        <tr className="border-b border-neutral-900 bg-neutral-100">
          <td colSpan={8} className="px-3 py-2 text-xs leading-5 text-neutral-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {Object.values(errors).map((message) => (
                <span key={message} className="border border-neutral-900 bg-white px-2 py-1">
                  {message}
                </span>
              ))}
              {zeroToleranceInfo ? (
                <span className="border border-neutral-900 bg-white px-2 py-1">{zeroToleranceInfo}</span>
              ) : null}
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
      className={`block w-full min-w-0 border bg-white px-2.5 py-2 text-sm text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:bg-neutral-50 ${
        align === "right" ? "text-right tabular-nums" : "text-left"
      } ${invalid ? "border-neutral-900 ring-1 ring-inset ring-neutral-900" : "border-neutral-900"}`}
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
  const base = "inline-flex items-center justify-center px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-neutral-400";

  return (
    <div className={`inline-flex w-full items-center gap-1 border bg-white p-1 ${invalid ? "border-neutral-900 ring-1 ring-inset ring-neutral-900" : "border-neutral-900"}`}>
      <button
        type="button"
        onClick={() => onChange("+")}
        className={`${base} w-1/2 ${value === "+" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"}`}
      >
        +
      </button>
      <button
        type="button"
        onClick={() => onChange("-")}
        className={`${base} w-1/2 ${value === "-" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"}`}
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

function isZeroToleranceRow(row: StackRow): boolean {
  const plusTolerance = Number(row.plusTolerance.trim());
  const minusTolerance = Number(row.minusTolerance.trim());

  return Number.isFinite(plusTolerance) && Number.isFinite(minusTolerance) && plusTolerance === 0 && minusTolerance === 0;
}
