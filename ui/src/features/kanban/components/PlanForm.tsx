"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline";
import { TaskType, PeriodType } from "@/features/kanban/utils/enums";
import type { TaskTemplateItem } from "@/lib/db/taskTemplates";
import { createPlanAction, updatePlanAction, countRemovedTasksAction } from "@/features/kanban/actions/planActions";
import TemplateItem from "./TemplateItem";
import TemplateModal from "./template-modal/TemplateModal";
import RemoveInstancesModal from "./RemoveInstancesModal";

interface PlanFormProps {
  templates: TaskTemplateItem[];
  mode: "create" | "edit";
  planId?: string;
  initialSelectedIds?: string[];
  initialDescription?: string;
}

export default function PlanForm({
  templates,
  mode,
  planId,
  initialSelectedIds = [],
  initialDescription = "",
}: PlanFormProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds)
  );
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplateItem | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removedTemplates, setRemovedTemplates] = useState<TaskTemplateItem[]>([]);
  const [removeCount, setRemoveCount] = useState(0);

  const dailyTemplates = templates.filter((t) => t.type === TaskType.DAILY);
  const weeklyTemplates = templates.filter((t) => t.type === TaskType.WEEKLY);

  const maxDailyPoints = templates
    .filter((t) => selectedIds.has(t.id))
    .reduce((sum, t) => sum + t.points * t.frequency, 0);

  function toggleTemplate(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const templateIds = Array.from(selectedIds);

    // In edit mode, check if templates were removed
    if (mode === "edit") {
      const removedIds = initialSelectedIds.filter((id) => !selectedIds.has(id));
      if (removedIds.length > 0) {
        const counts = await countRemovedTasksAction(planId!, removedIds);
        if (counts.removeCount > 0) {
          // Show confirmation modal
          setRemovedTemplates(
            templates.filter((t) => removedIds.includes(t.id))
          );
          setRemoveCount(counts.removeCount);
          setIsSubmitting(false);
          setIsRemoveModalOpen(true);
          return;
        }
      }
    }

    await submitPlan(templateIds, false);
  }

  async function handleRemoveConfirm(removeFromBoard: boolean) {
    setIsSubmitting(true);
    await submitPlan(Array.from(selectedIds), removeFromBoard);
  }

  async function submitPlan(templateIds: string[], removeInstances: boolean) {
    let result;
    switch (mode) {
      case "create":
        result = await createPlanAction({
          periodType: PeriodType.WEEKLY,
          description: description.trim() || undefined,
          templateIds,
        });
        break;
      case "edit":
        result = await updatePlanAction(planId!, {
          description: description.trim() || undefined,
          templateIds,
          removeInstances,
        });
        break;
    }

    if (result.error) {
      const err = result.error;
      const message =
        "formErrors" in err
          ? err.formErrors.join(", ")
          : JSON.stringify(err);
      setError(message);
      setIsSubmitting(false);
      setIsRemoveModalOpen(false);
      return;
    }

    router.push("/kanban");
  }

  function renderGroup(label: string, items: TaskTemplateItem[]) {
    if (items.length === 0) return null;
    return (
      <>
        <div className="flex items-center gap-2 mt-4 first:mt-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/40">
            {label}
          </span>
          <div className="flex-1 h-px bg-base-content/10" />
        </div>
        {items.map((t) => (
          <TemplateItem
            key={t.id}
            template={t}
            isSelected={selectedIds.has(t.id)}
            onToggle={() => toggleTemplate(t.id)}
            onEdit={() => {
              setEditingTemplate(t);
              setIsModalOpen(true);
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-1">
        {mode === "create" ? "Create Weekly Plan" : "Update Weekly Plan"}
      </h2>
      {mode === "create" && (
        <p className="text-base-content/50 mb-7">
          Set up your task templates and start a new week.
        </p>
      )}
      {mode === "edit" && <div className="mb-6" />}
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Description */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-base-content/60 text-xs font-medium">
            Description (optional)
          </span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g. Focus on interview prep this week"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Template picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-base-content/60">
            Task Templates
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-xs border border-base-content/15 hover:bg-base-content/5"
            onClick={() => {
              setEditingTemplate(null);
              setIsModalOpen(true);
            }}
          >
            + New Template
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {renderGroup("Daily Tasks", dailyTemplates)}
          {renderGroup("Weekly Tasks", weeklyTemplates)}
        </div>

        {templates.length === 0 && (
          <p className="text-sm text-base-content/50 text-center py-8">
            No templates yet. Create a template to get started.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error text-sm">{error}</div>
      )}

      {/* Summary + Actions */}
      <div className="flex items-center justify-between border-t border-base-content/10 pt-5">
        <div className="text-sm text-base-content/50">
          {selectedIds.size} template{selectedIds.size !== 1 ? "s" : ""} selected
          {selectedIds.size > 0 && (
            <>
              {" "}&middot;{" "}
              <span className="text-success font-semibold">
                Max {maxDailyPoints} pts/day
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/kanban" className="btn btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={selectedIds.size === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            {mode === "create" ? "Start Week" : "Update Plan"}
          </button>
        </div>
      </div>
    </form>
    <TemplateModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSaved={() => router.refresh()}
      template={editingTemplate}
    />
    <RemoveInstancesModal
      isOpen={isRemoveModalOpen}
      onClose={() => {
        setIsRemoveModalOpen(false);
        setIsSubmitting(false);
      }}
      onConfirm={handleRemoveConfirm}
      removedTemplates={removedTemplates}
      removeCount={removeCount}
      isSubmitting={isSubmitting}
    />
    </>
  );
}
