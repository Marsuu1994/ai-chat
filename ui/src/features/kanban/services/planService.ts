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
import { Prisma, TaskType, TaskStatus, PlanStatus } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
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
  today: Date,
  tx?: Prisma.TransactionClient
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
    await createManyTasks(taskData, tx);
  }
}

export async function createPlan(
  data: CreatePlanData
): Promise<PlanItem | { error: { formErrors: string[]; fieldErrors: Record<string, never> } }> {
  const { periodType, description, templateIds } = data;

  // Guard reads — before transaction to keep connection hold time short
  const existing = await getActivePlan();
  if (existing) {
    return { error: { formErrors: ["An active plan already exists"], fieldErrors: {} } };
  }
  const pendingPlan = await getPlanByStatus(PlanStatus.PENDING_UPDATE);

  const today = getTodayDate();
  const periodKey = getISOWeekKey(today);

  const plan = await prisma.$transaction(async (tx) => {
    const newPlan = await dalCreatePlan({ periodType, periodKey, description }, tx);
    await createManyPlanTemplates(newPlan.id, templateIds, tx);
    await generateTasksForPlan(newPlan.id, newPlan.periodKey, templateIds, today, tx);
    await updateLastSyncDate(newPlan.id, today, tx);
    if (pendingPlan) {
      await updatePlanStatus(pendingPlan.id, PlanStatus.COMPLETED, tx);
    }
    return newPlan;
  });

  return plan;
}

export async function updatePlan(planId: string, data: UpdatePlanData): Promise<void> {
  const { description, templateIds, removeInstances } = data;

  if (templateIds) {
    // Read before transaction — diff computation doesn't need transactional isolation
    const oldLinks = removeInstances ? await getPlanTemplatesByPlanId(planId) : [];
    const oldTemplateIds = new Set(oldLinks.map((l) => l.templateId));
    const newTemplateIds = new Set(templateIds);
    const removedIds = [...oldTemplateIds].filter((id) => !newTemplateIds.has(id));

    const today = getTodayDate();
    const periodKey = getISOWeekKey(today);

    await prisma.$transaction(async (tx) => {
      if (removedIds.length > 0) {
        await deleteIncompleteTasksByTemplateIds(planId, removedIds, tx);
      }
      await deletePlanTemplatesByPlanId(planId, tx);
      await createManyPlanTemplates(planId, templateIds, tx);
      await generateTasksForPlan(planId, periodKey, templateIds, today, tx);
      await updateLastSyncDate(planId, today, tx);
      if (description !== undefined) {
        await dalUpdatePlan(planId, { description }, tx);
      }
    });
  } else if (description !== undefined) {
    // Description-only update — single write, no transaction overhead needed
    await dalUpdatePlan(planId, { description });
  }
}
