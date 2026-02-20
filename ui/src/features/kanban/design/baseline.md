# Baseline Design

## Goal

A tool to plan and track tasks within defined periods (e.g., weekly). It visualizes task progress on a drag-and-drop kanban board, helping users understand what's done, what's in progress, and what's been missed.

## Features

### MVP

1. **Kanban board** — Three columns (Todo, Doing, Done) displaying task instances for the active plan. Tasks are ordered by type (daily first, then weekly) and creation time within each column.
2. **Drag and drop** — User can move tasks between columns: Todo -> Doing -> Done. Optimistic UI update + backend persistence.
3. **Plan creation** — User creates a weekly plan by selecting task templates. First-time users create new templates; returning users can load templates from their last plan.
4. **Task templates** — Reusable templates with title, description, points, type (daily/weekly), and frequency. CRUD operations available during planning.
5. **Auto-generation** — After plan creation, generate all necessary task instances. Daily tasks are regenerated each day.
6. **Daily status recompute** — On first load each day, expire unfinished daily tasks from previous days and generate today's daily tasks. Idempotent.
7. **Points tracking** — Each task carries a point value. Today's total points are displayed on the board.

### Future

- Task overlap visualization (stacked cards for multiple instances)
- Rollover badge for daily tasks carried from previous days
- Risk indicators (red/yellow) for tasks at risk of not being completed
- Phone notifications for unfinished tasks
- LLM-generated motivational messages
- End-of-period summary before starting a new plan
- Weekly task rollover across periods
- Biweekly and custom period types

## Entities

- **Plan** — A time-boxed container (e.g., one week) that groups task templates and their generated task instances. Only one plan can be active at a time. After the period ends, it becomes `PENDING_UPDATE` and serves as a template for the next plan.
- **TaskTemplate** — A reusable blueprint defining what kind of task to generate (title, points, type, frequency). Shared across plans. Editing a template does not affect already-generated Task instances.
- **PlanTemplate** — Join table linking a plan to its selected task templates.
- **Task** — A concrete instance generated from a template. This is what appears on the board and gets dragged between columns.
  - Daily task: has `forDate`, generated each day by daily sync
  - Weekly task: has `periodKey`, generated once at plan creation

## Schema

### Plan

```prisma
model Plan {
  id           String         @id @default(uuid())
  userId       String
  periodType   PeriodType
  periodKey    String         // ISO week key, e.g. "2026-W06"
  description  String?
  status       PlanStatus
  lastSyncDate DateTime?      // Date-only. Tracks last daily sync to skip redundant runs.
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

enum PeriodType {
  WEEKLY     // Only supported type for MVP
}

enum PlanStatus {
  ACTIVE          // Current plan
  PENDING_UPDATE  // Period ended, available as template for next plan
  COMPLETED       // Archived after new plan is created
}

// Constraints:
// - userId references User (not implemented yet)
// - At most one ACTIVE or PENDING_UPDATE plan per user
```

### TaskTemplate

```prisma
model TaskTemplate {
  id          String       @id @default(uuid())
  userId      String
  title       String
  description String
  points      Int
  type        TaskType
  frequency   Int          // Number of instances per period
  isArchived  Boolean      @default(false)  // Future: soft-delete
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

enum TaskType {
  DAILY
  WEEKLY
}

// Constraints:
// - userId references User (not implemented yet)
```

### PlanTemplate (join table)

```prisma
model PlanTemplate {
  id         String   @id @default(uuid())
  planId     String
  templateId String
  createdAt  DateTime @default(now())

  plan     Plan         @relation(fields: [planId], references: [id])
  template TaskTemplate @relation(fields: [templateId], references: [id])
}

// Constraints:
// - UNIQUE(planId, templateId)
```

### Task

```prisma
model Task {
  id            String       @id @default(uuid())
  planId        String
  templateId    String
  title         String
  description   String?
  points        Int
  status        TaskStatus
  forDate       DateTime?    // Set for daily tasks (the date this task is for)
  periodKey     String?      // Set for weekly tasks (e.g. "2026-W06")
  instanceIndex Int          // 1..frequency
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  doneAt        DateTime?

  plan     Plan         @relation(fields: [planId], references: [id])
  template TaskTemplate @relation(fields: [templateId], references: [id])
}

enum TaskStatus {
  TODO
  DOING
  DONE
  EXPIRED
}

// Constraints:
// - Exactly one of forDate or periodKey must be set (daily vs weekly)
// - UNIQUE(planId, templateId, forDate, instanceIndex)   — daily tasks
// - UNIQUE(planId, templateId, periodKey, instanceIndex)  — weekly tasks
```

## Architecture Decision

Uses **Server Actions** for mutations and **direct DAL calls from Server Components** for data fetching. No REST API routes. Inputs are validated at the boundary with **Zod** schemas.