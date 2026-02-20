# Key Flows

### Landing Flow

**Trigger:** User navigates to `/kanban`

**Steps:**
1. Fetch active plan. If none exists, show "Create Plan" prompt → stop.
2. If current ISO week key differs from `plan.periodKey`, run End of Period Sync → return empty board with "Create Plan" prompt → stop.
3. If `plan.lastSyncDate` is earlier than today, run Daily Sync.
4. Return board data and render the kanban.

---

### Daily Sync Flow

**Trigger:** If `lastSyncDate` is earlier than today

**Steps:**
1. Set `lastSyncDate = today` first to prevent concurrent re-runs.
2. Expire all daily tasks where `forDate` is earlier than today and status is not DONE.
3. Generate new daily task instances for today.

**Rules:**
- Idempotent — safe to re-run multiple times.
- Plan creation and template updates also set `lastSyncDate` to avoid redundant sync on next page load.

---

### End of Period Sync Flow

**Trigger:** If current ISO week key differs from `plan.periodKey`

**Steps:**
1. Expire all remaining non-DONE tasks (daily and weekly).
2. Set plan status: `ACTIVE` → `PENDING_UPDATE`.
3. Return null → board renders "Create Plan" prompt.

---

### Create Plan Flow

**Trigger:** User clicks "Create Plan" on empty board → navigates to `/kanban/plans/new`

**Steps:**
1. Page preloads templates from the `PENDING_UPDATE` plan if one exists (returning user).
2. User adds, removes, or edits templates. First-time users create templates from scratch.
3. User submits.
4. Create plan and link selected templates.
5. Generate task instances: weekly tasks immediately, daily tasks for today only.
6. Set `lastSyncDate = today`.
7. Archive any existing `PENDING_UPDATE` plan → `COMPLETED`.
8. Revalidate `/kanban` to render board.

---

### Update Plan Flow

**Trigger:** User clicks "Edit Plan" on board header → navigates to `/kanban/plans/[id]`

**Steps:**
1. User edits template selection (add / remove / modify).
2. On submit, show confirmation modal if any templates were removed.
3. User chooses **Remove from board** or **Keep on board**.
4. Apply template changes and regenerate tasks accordingly.
5. Revalidate `/kanban` to render updated board.

**Rules:**
- **Remove from board** — delete matching task instances where status is TODO or DOING only.
- **Keep on board** — no instance deletion; removed templates simply stop generating future tasks.
- EXPIRED tasks are never touched by either choice (past history).
- DONE tasks are always preserved regardless of choice (completed effort is never erased).
- New daily templates: generate instances for today only (daily sync handles future days).
- New weekly templates: generate all instances immediately.

---

### Drag and Drop Flow

**Trigger:** User drags a task card to a different column

**Steps:**
1. UI updates optimistically.
2. Server Action persists new status to DB.
3. On failure, UI rolls back to previous state.

**Rules:**
- Allowed transitions: TODO → DOING → DONE only (no backwards movement).

---

### Progress Tracking Flow

**Trigger:** Computed server-side on every board page load, derived from a single DB query — no additional queries needed

**Steps:**
1. Fetch all tasks for the active plan.
2. Derive all metrics in-memory and return as part of `BoardData`.

**Metrics:**

**Today Ring** — circular progress showing how many tasks are done today
- Done count: tasks with status DONE and completed today
- Total count: all non-expired board tasks (TODO + DOING + DONE)

**Today Points** — points earned today vs available today
- Done points: sum of points from tasks completed today
- Total points: sum of points from all non-expired board tasks

**Week Points** — points earned this week vs projected total
- Done points: sum of points from all DONE tasks in the plan
- Projected total: past daily task points + future daily projection from current templates + all weekly task points

**Daily Avg** — average points earned per day since the plan started
- weekDonePoints / number of days elapsed since Monday (1–7)

**Week Progress Bar** — percentage of projected tasks completed this week
- Done count: all DONE tasks in the plan
- Projected total: past daily task count + future daily projection from current templates + all weekly task count

**Rules:**
- Done points and done count are append-only — never decrease due to plan changes.
- Past effort is preserved regardless of template edits.
- Future projection always reflects the current plan's template snapshot.
- Today is counted in the future projection only — never double-counted.