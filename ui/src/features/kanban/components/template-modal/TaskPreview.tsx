import { StarIcon } from "@heroicons/react/24/solid";
import { TaskType } from "@/features/kanban/utils/enums";
import TaskTypeBadge from "../TaskTypeBadge";

interface TaskPreviewProps {
  title: string;
  type: string;
  points: number;
  frequency: number;
}

export default function TaskPreview({
  title,
  type,
  points,
  frequency,
}: TaskPreviewProps) {
  const previewTitle = title || "Untitled task";
  const isDaily = type === TaskType.DAILY;
  const tasksPerWeek = isDaily ? frequency * 7 : frequency;
  const ptsPerWeek = points * tasksPerWeek;

  const summaryText = isDaily
    ? `Generates ${frequency} task${frequency !== 1 ? "s" : ""} per day \u00B7 ${tasksPerWeek} per week \u00B7 ${ptsPerWeek} pts/week potential`
    : `Generates ${frequency} task${frequency !== 1 ? "s" : ""} per week \u00B7 ${ptsPerWeek} pts/week potential`;

  return (
    <div className="border border-dashed border-base-content/10 rounded-lg p-3.5 bg-base-300/50 mt-1">
      <div className="text-[11px] text-base-content/40 uppercase tracking-wider font-semibold mb-2">
        Preview
      </div>
      <div className="flex items-center gap-2">
        <TaskTypeBadge type={type} />
        <span className="text-sm font-medium truncate">
          {previewTitle}
        </span>
        <span className="flex items-center gap-1 text-xs text-base-content/50 ml-auto shrink-0">
          <StarIcon className="size-3 text-warning" />
          {points} pts
        </span>
      </div>
      <div className="text-[11px] text-base-content/40 mt-1.5">
        {summaryText}
      </div>
    </div>
  );
}
