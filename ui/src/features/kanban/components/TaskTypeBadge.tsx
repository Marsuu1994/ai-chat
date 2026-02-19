import { TaskType } from "@/features/kanban/utils/enums";

interface TaskTypeBadgeProps {
  type: string;
}

export default function TaskTypeBadge({ type }: TaskTypeBadgeProps) {
  const isDaily = type === TaskType.DAILY;

  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
        isDaily ? "bg-info/15 text-info" : "bg-secondary/15 text-secondary"
      }`}
    >
      {isDaily ? "DAILY" : "WEEKLY"}
    </span>
  );
}
