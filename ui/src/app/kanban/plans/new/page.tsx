import { getTaskTemplates } from "@/lib/db/taskTemplates";
import { getPlanByStatus, getPlanWithTemplates } from "@/lib/db/plans";
import { PlanStatus } from "@/generated/prisma/client";
import PlanForm from "@/features/kanban/components/PlanForm";

export default async function NewPlanPage() {
  const [templates, pendingPlan] = await Promise.all([
    getTaskTemplates(),
    getPlanByStatus(PlanStatus.PENDING_UPDATE),
  ]);

  let initialSelectedIds: string[] = [];
  if (pendingPlan) {
    const withTemplates = await getPlanWithTemplates(pendingPlan.id);
    initialSelectedIds =
      withTemplates?.planTemplates.map((pt) => pt.templateId) ?? [];
  }

  return (
    <PlanForm
      templates={templates}
      mode="create"
      initialSelectedIds={initialSelectedIds}
    />
  );
}
