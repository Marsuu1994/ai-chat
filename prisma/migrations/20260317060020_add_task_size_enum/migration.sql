-- CreateEnum
CREATE TYPE "TaskSize" AS ENUM ('EXTRA_SMALL', 'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');

-- Add nullable size columns
ALTER TABLE "task_templates" ADD COLUMN "size" "TaskSize";
ALTER TABLE "tasks" ADD COLUMN "size" "TaskSize";

-- Backfill task_templates: reverse map points → size
UPDATE "task_templates" SET "size" = CASE
  WHEN points = 1 THEN 'EXTRA_SMALL'::"TaskSize"
  WHEN points = 2 THEN 'SMALL'::"TaskSize"
  WHEN points = 3 THEN 'MEDIUM'::"TaskSize"
  WHEN points = 5 THEN 'LARGE'::"TaskSize"
  WHEN points = 8 THEN 'EXTRA_LARGE'::"TaskSize"
  WHEN points <= 1 THEN 'EXTRA_SMALL'::"TaskSize"
  WHEN points <= 3 THEN 'SMALL'::"TaskSize"
  WHEN points <= 5 THEN 'MEDIUM'::"TaskSize"
  WHEN points <= 8 THEN 'LARGE'::"TaskSize"
  ELSE 'EXTRA_LARGE'::"TaskSize"
END;

-- Backfill tasks: same reverse mapping
UPDATE "tasks" SET "size" = CASE
  WHEN points = 1 THEN 'EXTRA_SMALL'::"TaskSize"
  WHEN points = 2 THEN 'SMALL'::"TaskSize"
  WHEN points = 3 THEN 'MEDIUM'::"TaskSize"
  WHEN points = 5 THEN 'LARGE'::"TaskSize"
  WHEN points = 8 THEN 'EXTRA_LARGE'::"TaskSize"
  WHEN points <= 1 THEN 'EXTRA_SMALL'::"TaskSize"
  WHEN points <= 3 THEN 'SMALL'::"TaskSize"
  WHEN points <= 5 THEN 'MEDIUM'::"TaskSize"
  WHEN points <= 8 THEN 'LARGE'::"TaskSize"
  ELSE 'EXTRA_LARGE'::"TaskSize"
END;

-- Make size NOT NULL
ALTER TABLE "task_templates" ALTER COLUMN "size" SET NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "size" SET NOT NULL;

-- Drop points from task_templates only (tasks keeps it for aggregation)
ALTER TABLE "task_templates" DROP COLUMN "points";
