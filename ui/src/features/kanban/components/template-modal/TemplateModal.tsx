"use client";

import { useEffect, useRef, useState } from "react";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { TaskType } from "@/features/kanban/utils/enums";
import type { TaskTemplateItem } from "@/lib/db/taskTemplates";
import {
  createTaskTemplateAction,
  updateTaskTemplateAction,
} from "@/features/kanban/actions/templateActions";
import TaskPreview from "./TaskPreview";
import TemplateModalHeader from "./TemplateModalHeader";
import TemplateModalFooter from "./TemplateModalFooter";
import TypeSelector from "./TypeSelector";
import IconNumberField from "./IconNumberField";

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
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg">
        <TemplateModalHeader mode={mode} onClose={onClose} />

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
              <span className="label-text text-xs font-medium">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="e.g. Focus on dynamic programming and graph problems"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <TypeSelector type={type} onChange={setType} disabled={mode === "edit"} />

          {/* Points + Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <IconNumberField
              label="Points"
              value={points}
              onChange={setPoints}
              icon={<StarIconSolid className="size-4 text-warning" />}
              placeholder="10"
              helperText="Points earned when completed"
              required
            />
            <IconNumberField
              label="Frequency"
              value={frequency}
              onChange={setFrequency}
              icon={
                <span className={`text-sm font-semibold ${isDaily ? "text-info" : "text-secondary"}`}>
                  &times;
                </span>
              }
              placeholder="1"
              helperText={`Instances generated per ${periodLabel}`}
              required
            />
          </div>

          <TaskPreview title={title} type={type} points={points} frequency={frequency} />

          <TemplateModalFooter
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
