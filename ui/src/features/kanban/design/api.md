# Actions & Data Layer

## Principles

- Before adding a new action or endpoint, check if an existing one can be extended to cover the case.
- Keep handlers thin — validate input, call service, return result. No business logic inside handlers.
- One handler per logical operation, not per UI interaction. A single handler can cover multiple related mutations.
- If two flows share the same mutation, they share the same handler. Never duplicate handler logic.
- Use Server Actions for mutations triggered from Server or Client Components. Use API routes when you need webhooks, streaming, or third-party callbacks.

## Data Fetching

### `fetchBoard(): BoardData | null`

Called directly from the `/kanban` Server Component.

```
BoardData {
  plan:               PlanWithTemplates
  tasks:              TaskItem[]          // Non-expired tasks only (TODO, DOING, DONE)
  todayDoneCount:     number
  todayTotalCount:    number
  todayDonePoints:    number
  todayTotalPoints:   number
  weekDoneCount:      number
  weekProjectedCount: number
  weekDonePoints:     number
  weekProjectedPoints:number
  daysElapsed:        number              // 1–7, Mon=1
}
```

**Pseudocode:**

```
today      = getTodayDate()
allTasks   = getTasksByPlanId(planId)
boardTasks = allTasks.filter(t => t.status !== EXPIRED)

// Today Ring
todayDoneCount  = boardTasks.filter(t => t.status == DONE && sameDay(t.doneAt, today)).length
todayTotalCount = boardTasks.length

// Today Points
todayDonePoints  = boardTasks.filter(t => t.status == DONE && sameDay(t.doneAt, today)).sum(points)
todayTotalPoints = boardTasks.sum(points)

// Week Projected (past daily instances + future daily projection + weekly instances)
dailyPastTasks    = allTasks.filter(t => t.template.type == DAILY && t.forDate < today)
dailyPastPoints   = dailyPastTasks.sum(points)
dailyPastCount    = dailyPastTasks.length

weekEnd           = getSundayFromPeriodKey(plan.periodKey)
remainingDays     = daysBetween(today, weekEnd) + 1   // today through Sunday inclusive

currentDailyTemplates = plan.planTemplates.filter(pt => pt.template.type == DAILY)
dailyFuturePoints = currentDailyTemplates.sum(t => t.points * t.frequency) * remainingDays
dailyFutureCount  = currentDailyTemplates.sum(t => t.frequency) * remainingDays

weeklyTasks       = allTasks.filter(t => t.template.type == WEEKLY)
weeklyPoints      = weeklyTasks.sum(points)
weeklyCount       = weeklyTasks.length

weekProjectedPoints = dailyPastPoints + dailyFuturePoints + weeklyPoints
weekProjectedCount  = dailyPastCount  + dailyFutureCount  + weeklyCount

weekDoneCount   = allTasks.filter(t => t.status == DONE).length
weekDonePoints  = allTasks.filter(t => t.status == DONE).sum(points)

// Days Elapsed
weekStart   = getMondayFromPeriodKey(plan.periodKey)
daysElapsed = clamp(daysBetween(weekStart, today) + 1, 1, 7)
```

---

## Server Actions

All actions follow the pattern: **validate with Zod → call service → `revalidatePath('/kanban')`**

---

### `createPlanAction(input)`

```
Input {
  periodType:   PeriodType     // "WEEKLY"
  description?: string
  templateIds:  string[]       // min 1
}

Steps:
1. Validate input with Zod
2. Assert no existing ACTIVE plan for user
3. Create Plan record
4. Create PlanTemplate links for each templateId
5. Generate weekly task instances immediately (all at once)
6. Generate daily task instances for today only
7. Set lastSyncDate = today
8. Archive existing PENDING_UPDATE plan → COMPLETED
9. revalidatePath('/kanban')
```

---

### `updatePlanAction(planId, input)`

```
Input {
  description?:  string
  templateIds?:  string[]
}

Steps:
1. Validate input with Zod
2. If templateIds provided:
   a. Diff against current PlanTemplate links → find added / removed template sets
   b. For removed templates: delete Task instances where templateId in removed set AND status IN (TODO, DOING)
   c. Delete removed PlanTemplate links
   d. Create new PlanTemplate links for added templates
   e. For added daily templates: generate instances for today only
   f. For added weekly templates: generate all instances immediately
   g. Set lastSyncDate = today
3. If description provided: update Plan.description
4. revalidatePath('/kanban')
```

---

### `createTaskTemplateAction(input)`

```
Input {
  title:       string
  description: string
  points:      number    // positive integer
  type:        TaskType  // DAILY | WEEKLY
  frequency:   number    // positive integer
}

Steps:
1. Validate input with Zod
2. Create TaskTemplate record for current user
```

---

### `updateTaskTemplateAction(id, input)`

```
Input {
  title?:       string
  description?: string
  points?:      number
  frequency?:   number
}

Steps:
1. Validate input with Zod (at least one field required)
2. Assert template belongs to current user
3. Update TaskTemplate record
```

---

### `updateTaskStatusAction(taskId, input)`

```
Input {
  status: TaskStatus    // TODO | DOING | DONE
}

Steps:
1. Validate input with Zod
2. Assert task belongs to user's active plan
3. Update Task.status
4. If status == DONE: set doneAt = now()
5. If status != DONE: clear doneAt
6. revalidatePath('/kanban')
```

---

## DAL Functions (Data Access Layer)

All Prisma queries live in `src/lib/db/`. Never import Prisma directly in actions or components.

```
planQueries.ts
  getActivePlan(userId)
  getPendingUpdatePlan(userId)
  createPlan(data)
  updatePlanStatus(planId, status)
  updateLastSyncDate(planId, date)

planTemplateQueries.ts
  getPlanTemplates(planId)
  createPlanTemplates(planId, templateIds[])
  deletePlanTemplates(planId, templateIds[])

taskTemplateQueries.ts
  getTaskTemplatesByUser(userId)
  createTaskTemplate(data)
  updateTaskTemplate(id, data)

taskQueries.ts
  getTasksByPlanId(planId)             // returns ALL statuses for computation
  createTask(data)
  createTasks(data[])                  // batch
  updateTaskStatus(taskId, status, doneAt?)
  expireTasks(taskIds[])               // batch status → EXPIRED
```