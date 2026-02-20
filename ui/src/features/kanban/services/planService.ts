import {
  getActivePlan,
  getPlanByStatus,
  createPlan as dalCreatePlan,
  updatePlan as dalUpdatePlan,
  updateLastSyncDate,
  updatePlanStatus,
} from "@/lib/db/plans";
import {
  createManyPlanTemplates,
  deletePlanTemplatesByPlanId,
  getPlanTemplatesByPlanId,
} from "@/lib/db/planTemplates";
import { getTaskTemplateById } from "@/lib/db/taskTemplates";
import {
  createManyTasks,
  deleteIncompleteTasksByTemplateIds,
} from "@/lib/db/tasks";
import { TaskType, TaskStatus, PlanStatus } from "@/generated/prisma/client";
import { getTodayDate, getISOWeekKey } from "../utils/dateUtils";
import type { PlanItem } from "@/lib/db/plans";
import type { z } from "zod";
import type { createPlanSchema, updatePlanSchema } from "../schemas";

type CreatePlanData = z.infer<typeof createPlanSchema>;
type UpdatePlanData = z.infer<typeof updatePlanSchema>;

async function generateTasksForPlan(
  planId: string,
  periodKey: string,
  templateIds: string[],
  today: Date
) {
  const taskData: Parameters<typeof createManyTasks>[0] = [];

  for (const templateId of templateIds) {
    const template = await getTaskTemplateById(templateId);
    if (!template) continue;

    switch (template.type) {
      case TaskType.WEEKLY:
        for (let i = 0; i < template.frequency; i++) {
          taskData.push({
            planId,
            templateId,
            title: template.title,
            description: template.description,
            points: template.points,
            status: TaskStatus.TODO,
            periodKey,
            instanceIndex: i,
          });
        }
        break;
      case TaskType.DAILY:
        for (let i = 0; i < template.frequency; i++) {
          taskData.push({
            planId,
            templateId,
            title: template.title,
            description: template.description,
            points: template.points,
            status: TaskStatus.TODO,
            forDate: today,
            instanceIndex: i,
          });
        }
        break;
    }
  }

  if (taskData.length > 0) {
    await createManyTasks(taskData);
  }
}

export async function createPlan(
  data: CreatePlanData
): Promise<PlanItem | { error: { formErrors: string[]; fieldErrors: Record<string, never> } }> {
  const { periodType, description, templateIds } = data;

  const existing = await getActivePlan();
  if (existing) {
    return { error: { formErrors: ["An active plan already exists"], fieldErrors: {} } };
  }

  const today = getTodayDate();
  const periodKey = getISOWeekKey(today);

  const plan = await dalCreatePlan({ periodType, periodKey, description });

  await createManyPlanTemplates(plan.id, templateIds);

  await generateTasksForPlan(plan.id, plan.periodKey, templateIds, today);

  // Mark sync as done — prevents redundant sync on first page load
  await updateLastSyncDate(plan.id, today);

  // Archive any PENDING_UPDATE plan → COMPLETED
  const pendingPlan = await getPlanByStatus(PlanStatus.PENDING_UPDATE);
  if (pendingPlan) {
    await updatePlanStatus(pendingPlan.id, PlanStatus.COMPLETED);
  }

  return plan;
}

export async function updatePlan(planId: string, data: UpdatePlanData): Promise<void> {
  const { description, templateIds, removeInstances } = data;

  if (description !== undefined) {
    await dalUpdatePlan(planId, { description });
  }

  if (templateIds) {
    if (removeInstances) {
      const oldLinks = await getPlanTemplatesByPlanId(planId);
      const oldTemplateIds = new Set(oldLinks.map((l) => l.templateId));
      const newTemplateIds = new Set(templateIds);
      const removedIds = [...oldTemplateIds].filter((id) => !newTemplateIds.has(id));
      if (removedIds.length > 0) {
        await deleteIncompleteTasksByTemplateIds(planId, removedIds);
      }
    }

    await deletePlanTemplatesByPlanId(planId);
    await createManyPlanTemplates(planId, templateIds);

    const today = getTodayDate();
    const periodKey = getISOWeekKey(today);
    await generateTasksForPlan(planId, periodKey, templateIds, today);

    // Mark sync as done — prevents redundant sync on next page load
    await updateLastSyncDate(planId, today);
  }
}
