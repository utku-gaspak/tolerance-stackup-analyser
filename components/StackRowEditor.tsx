import type { RowValidationError, StackRow } from "../lib/types";

interface StackRowEditorProps {
  row: StackRow;
  onChangeRow: (id: string, field: keyof StackRow, value: string) => void;
  onDeleteRow: (id: string) => void;
  errors?: Partial<Record<RowValidationError["field"], string>>;
}

export function StackRowEditor({ row, onChangeRow, onDeleteRow, errors = {} }: StackRowEditorProps) {
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="bg-slate-200">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_0.7fr_auto] gap-px">
        <FieldInput
          value={row.label}
          onChange={(value) => onChangeRow(row.id, "label", value)}
          placeholder="Label"
          invalid={Boolean(errors.label)}
        />
        <FieldInput
          value={row.nominal}
          onChange={(value) => onChangeRow(row.id, "nominal", value)}
          placeholder="0.00"
          invalid={Boolean(errors.nominal)}
        />
        <FieldInput
          value={row.plusTolerance}
          onChange={(value) => onChangeRow(row.id, "plusTolerance", value)}
          placeholder="0.00"
          invalid={Boolean(errors.plusTolerance)}
        />
        <FieldInput
          value={row.minusTolerance}
          onChange={(value) => onChangeRow(row.id, "minusTolerance", value)}
          placeholder="0.00"
          invalid={Boolean(errors.minusTolerance)}
        />
        <select
          value={row.direction}
          onChange={(event) => onChangeRow(row.id, "direction", event.target.value)}
          className={`bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:bg-slate-50 ${
            errors.direction ? "ring-1 ring-inset ring-rose-300" : ""
          }`}
        >
          <option value="">Select</option>
          <option value="+">+</option>
          <option value="-">-</option>
        </select>
        <div className="bg-white px-3 py-2 text-right">
          <button
            type="button"
            onClick={() => onDeleteRow(row.id)}
            className="rounded-full border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>

      {hasErrors ? (
        <div className="bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">
          {Object.values(errors).map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({
  value,
  onChange,
  placeholder,
  invalid
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-slate-50 ${
        invalid ? "ring-1 ring-inset ring-rose-300" : ""
      }`}
    />
  );
}
