import { TaskType } from "@/features/kanban/utils/enums";

interface TypeSelectorProps {
  type: string;
  onChange: (type: string) => void;
  disabled: boolean;
}

export default function TypeSelector({ type, onChange, disabled }: TypeSelectorProps) {
  const isDaily = type === TaskType.DAILY;

  const options = [
    { value: TaskType.DAILY, emoji: "\u{1F504}", label: "Daily", sub: "Repeats every day", active: isDaily, color: "info" },
    { value: TaskType.WEEKLY, emoji: "\u{1F4C5}", label: "Weekly", sub: "Set times per week", active: !isDaily, color: "secondary" },
  ] as const;

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-xs font-medium">
          Type <span className="text-error">*</span>
        </span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => !disabled && onChange(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors ${
              disabled ? "cursor-default opacity-60" : "cursor-pointer"
            } ${
              opt.active
                ? `border-${opt.color} bg-${opt.color}/10`
                : `border-base-content/10 bg-base-200${!disabled ? " hover:border-base-content/20" : ""}`
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span
              className={`text-sm font-semibold ${opt.active ? `text-${opt.color}` : "text-base-content/50"}`}
            >
              {opt.label}
            </span>
            <span className="text-[11px] text-base-content/40">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
