"use client";

// Draggable makes an element draggable within a DragDropContext.
// Like Droppable, it uses the "render props" pattern:
// - `provided.innerRef`: attach to the DOM element being dragged
// - `provided.draggableProps`: spread onto the element (positioning styles)
// - `provided.dragHandleProps`: spread onto the drag handle (the part you grab)
//   — here we make the entire card the handle
// - `snapshot.isDragging`: true while this card is actively being dragged
import { Draggable } from "@hello-pangea/dnd";
import { StarIcon } from "@heroicons/react/24/solid";
import type { TaskItem } from "@/lib/db/tasks";
import { TaskStatus, TaskType } from "../utils/enums";

type TaskCardProps = {
  task: TaskItem;
  taskType: string;
  /** Position index within the column — required by Draggable */
  index: number;
};

export default function TaskCard({ task, taskType, index }: TaskCardProps) {
  const isDone = task.status === TaskStatus.DONE;
  const isDaily = taskType === TaskType.DAILY;

  return (
    // `draggableId` must be unique across the entire board.
    // `index` tells the library the card's position within its Droppable column.
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          // dragHandleProps makes the entire card the grab handle.
          // You could apply this to a smaller element (e.g. a grip icon)
          // to restrict where the user can grab.
          {...provided.dragHandleProps}
          className={`card bg-base-100/70 shadow-sm border border-base-content/10 cursor-grab transition-[box-shadow,border-color,opacity] duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-base-content/25 ${
            isDone ? "opacity-50" : ""
          } ${
            snapshot.isDragging
              ? "shadow-lg ring-2 ring-primary/30 scale-[1.02] z-50"
              : ""
          }`}
        >
          <div className="card-body p-3 gap-1">
            <h3
              className={`card-title text-sm font-medium ${
                isDone ? "line-through text-base-content/50" : ""
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-base-content/60">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`badge badge-xs font-bold uppercase ${
                  isDaily ? "badge-info" : "badge-secondary"
                }`}
              >
                {isDaily ? "DAILY" : "WEEKLY"}
              </span>

              <span className="flex gap-0.5 text-xs ml-auto">
                <StarIcon className="size-4 text-warning" />
                <span className="text-base-content/70 font-bold">{`${task.points} ${task.points === 1 ? "pt" : "pts"}`}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
