"use client";

import { useEffect, useRef } from "react";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import type { TaskTemplateItem } from "@/lib/db/taskTemplates";
import TaskTypeBadge from "./TaskTypeBadge";

interface RemoveInstancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (removeFromBoard: boolean) => void;
  removedTemplates: TaskTemplateItem[];
  removeCount: number;
  isSubmitting: boolean;
}

export default function RemoveInstancesModal({
  isOpen,
  onClose,
  onConfirm,
  removedTemplates,
  removeCount,
  isSubmitting,
}: RemoveInstancesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Remove tasks from board?</h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-base-content/60 mb-3">
          The following templates were removed from your plan:
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {removedTemplates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-base-200 rounded-lg"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              <span className="text-sm font-medium flex-1">{t.title}</span>
              <span className="flex items-center gap-2 text-xs text-base-content/50">
                <TaskTypeBadge type={t.type} />
                <StarIconSolid className="size-3 text-warning" />
                {t.points}
              </span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div className="flex gap-2 items-start p-3 rounded-lg bg-warning/10 border border-warning/20 mb-4">
          <ExclamationTriangleIcon className="size-4 text-warning shrink-0 mt-0.5" />
          <span className="text-xs leading-relaxed">
            Only incomplete tasks (Todo and In Progress) will be removed.
            Completed tasks are always kept.
          </span>
        </div>

        {/* Summary */}
        <div className="text-sm text-base-content/60">
          <span className="text-error font-semibold">
            {removeCount} task{removeCount !== 1 ? "s" : ""} will be removed
          </span>
        </div>

        {/* Footer */}
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onConfirm(false)}
            disabled={isSubmitting}
          >
            Keep on Board
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => onConfirm(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <TrashIcon className="size-4" />
            )}
            Remove from Board
          </button>
        </div>
      </div>
    </dialog>
  );
}
