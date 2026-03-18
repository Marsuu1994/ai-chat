"use client";

import { useEffect, useRef, useState } from "react";
import { BoltIcon } from "@heroicons/react/24/outline";
import type { TaskTemplateItem } from "@/lib/db/taskTemplates";
import { TaskSize, SIZE_LABELS, SIZE_EFFORT, sizeToPoints } from "@/features/kanban/utils/enums";
import {
  createTaskTemplateAction,
  updateTaskTemplateAction,
} from "@/features/kanban/actions/templateActions";
import { createAdhocTaskAction } from "@/features/kanban/actions/taskActions";
import TaskModalHeader from "./TaskModalHeader";
import TaskModalFooter from "./TaskModalFooter";

type ModalMode = "create" | "edit" | "adhoc";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode?: ModalMode;
  template?: TaskTemplateItem | null;
  initialStatus?: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSaved,
  mode: modeProp,
  template,
  initialStatus,
}: TaskModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mode: ModalMode = modeProp ?? (template ? "edit" : "create");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState<TaskSize>(TaskSize.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or template changes
  useEffect(() => {
    if (isOpen) {
      setTitle(mode === "adhoc" ? "" : (template?.title ?? ""));
      setDescription(mode === "adhoc" ? "" : (template?.description ?? ""));
      setSize(mode === "adhoc" ? TaskSize.EXTRA_SMALL : ((template?.size as TaskSize) ?? TaskSize.MEDIUM));
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, template, mode]);

  // Dialog open/close control
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let result;
    switch (mode) {
      case "create":
        result = await createTaskTemplateAction({ title, description, size });
        break;
      case "edit":
        result = await updateTaskTemplateAction(template!.id, {
          title,
          description,
          size,
        });
        break;
      case "adhoc":
        result = await createAdhocTaskAction({ title, description, size, status: initialStatus });
        break;
    }

    if (result.error) {
      const err = result.error;
      const message =
        "formErrors" in err ? err.formErrors.join(", ") : JSON.stringify(err);
      setError(message);
      setIsSubmitting(false);
      return;
    }

    onSaved();
    onClose();
  }

  const isAdhoc = mode === "adhoc";

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg">
        <TaskModalHeader mode={mode} onClose={onClose} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Ad-hoc info banner */}
          {isAdhoc && (
            <div className="flex items-center gap-2 bg-warning/10 text-warning text-sm px-3.5 py-2.5 rounded-lg">
              <BoltIcon className="size-4.5 shrink-0" />
              Ad-hoc tasks are one-off items — they don&apos;t repeat and never expire.
            </div>
          )}

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-medium">
                Title <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder={isAdhoc ? "e.g. File tax report" : "e.g. Solve 3 LeetCode problems"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-medium">
                Description{" "}
                {!isAdhoc && (
                  <span className="text-base-content/40">(used by AI for task generation)</span>
                )}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder={
                isAdhoc
                  ? "Optional details about this task"
                  : "e.g. Focus on dynamic programming and graph problems"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Size */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-medium">
                Size <span className="text-error">*</span>
              </span>
            </label>
            <div className="flex gap-1.5 w-full">
              {Object.values(TaskSize).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-full border text-xs font-bold transition-colors ${
                    size === s
                      ? "bg-secondary/10 border-secondary text-secondary"
                      : "bg-base-200 border-base-300 text-base-content/50 hover:border-base-content/30"
                  }`}
                >
                  <span>{SIZE_LABELS[s]}</span>
                  <span className={`text-[10px] font-semibold ${size === s ? "opacity-70" : "opacity-50"}`}>
                    {sizeToPoints(s)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-secondary mt-1.5">{SIZE_EFFORT[size]}</p>
            {(size === TaskSize.LARGE || size === TaskSize.EXTRA_LARGE) && (
              <p className="text-xs text-warning mt-0.5">Consider splitting into smaller tasks</p>
            )}
          </div>

          <TaskModalFooter
            mode={mode}
            isSubmitting={isSubmitting}
            error={error}
            onClose={onClose}
          />
        </form>
      </div>
    </dialog>
  );
}
