"use client";

import { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { TaskType } from "@/features/kanban/utils/enums";
import type { TaskTemplateItem } from "@/lib/db/taskTemplates";
import {
  createTaskTemplateAction,
  updateTaskTemplateAction,
} from "@/features/kanban/actions/templateActions";
import TaskPreview from "./TaskPreview";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  template?: TaskTemplateItem | null;
}

export default function TemplateModal({
  isOpen,
  onClose,
  onSaved,
  template,
}: TemplateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mode = template ? "edit" : "create";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>(TaskType.DAILY);
  const [points, setPoints] = useState(3);
  const [frequency, setFrequency] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or template changes
  useEffect(() => {
    if (isOpen) {
      setTitle(template?.title ?? "");
      setDescription(template?.description ?? "");
      setType(template?.type ?? TaskType.DAILY);
      setPoints(template?.points ?? 3);
      setFrequency(template?.frequency ?? 1);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, template]);

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

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let result;
    switch (mode) {
      case "create":
        result = await createTaskTemplateAction({
          title,
          description,
          type,
          points,
          frequency,
        });
        break;
      case "edit":
        result = await updateTaskTemplateAction(template!.id, {
          title,
          description,
          points,
          frequency,
        });
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

  const isDaily = type === TaskType.DAILY;
  const periodLabel = isDaily ? "day" : "week";

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={handleBackdropClick}
      onClose={onClose}
    >
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {mode === "create" ? "Create Task Template" : "Edit Task Template"}
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              placeholder="e.g. Solve 3 LeetCode problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-medium">
                Description
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="e.g. Focus on dynamic programming and graph problems"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Type Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs font-medium">
                Type <span className="text-error">*</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => mode === "create" && setType(TaskType.DAILY)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors ${
                  mode === "edit" ? "cursor-default opacity-60" : "cursor-pointer"
                } ${
                  isDaily
                    ? "border-info bg-info/10"
                    : "border-base-content/10 bg-base-200" + (mode === "create" ? " hover:border-base-content/20" : "")
                }`}
              >
                <span className="text-xl">&#x1F504;</span>
                <span
                  className={`text-sm font-semibold ${isDaily ? "text-info" : "text-base-content/50"}`}
                >
                  Daily
                </span>
                <span className="text-[11px] text-base-content/40">
                  Repeats every day
                </span>
              </button>
              <button
                type="button"
                onClick={() => mode === "create" && setType(TaskType.WEEKLY)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors ${
                  mode === "edit" ? "cursor-default opacity-60" : "cursor-pointer"
                } ${
                  !isDaily
                    ? "border-secondary bg-secondary/10"
                    : "border-base-content/10 bg-base-200" + (mode === "create" ? " hover:border-base-content/20" : "")
                }`}
              >
                <span className="text-xl">&#x1F4C5;</span>
                <span
                  className={`text-sm font-semibold ${!isDaily ? "text-secondary" : "text-base-content/50"}`}
                >
                  Weekly
                </span>
                <span className="text-[11px] text-base-content/40">
                  Set times per week
                </span>
              </button>
            </div>
          </div>

          {/* Points + Frequency row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">
                  Points <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input input-bordered w-full pl-9"
                  placeholder="10"
                  value={points || ""}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  min={1}
                  required
                />
                <StarIconSolid className="size-4 text-warning absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              </div>
              <span className="text-[11px] text-base-content/40 mt-1">
                Points earned when completed
              </span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs font-medium">
                  Frequency <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input input-bordered w-full pl-9"
                  placeholder="1"
                  value={frequency || ""}
                  onChange={(e) => setFrequency(Number(e.target.value))}
                  min={1}
                  required
                />
                <span
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold z-10 pointer-events-none ${isDaily ? "text-info" : "text-secondary"}`}
                >
                  &times;
                </span>
              </div>
              <span className="text-[11px] text-base-content/40 mt-1">
                Instances generated per {periodLabel}
              </span>
            </div>
          </div>

          {/* Preview */}
          <TaskPreview
            title={title}
            type={type}
            points={points}
            frequency={frequency}
          />

          {/* Error */}
          {error && (
            <div className="alert alert-error text-sm">{error}</div>
          )}

          {/* Footer */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === "create" ? (
                <PlusIcon className="size-4" />
              ) : (
                <CheckIcon className="size-4" />
              )}
              {mode === "create" ? "Create Template" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
