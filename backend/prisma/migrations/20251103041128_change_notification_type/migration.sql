/*
  Warnings:

  - The values [BUDGET_WARNING_90] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('BUDGET_WARNING_50', 'BUDGET_WARNING_75', 'BUDGET_EXCEEDED', 'DEADLINE_WARNING', 'MILESTONE_DELAYED', 'PROJECT_COMPLETED', 'ACCOUNT_CREATED', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'PROFILE_UPDATED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'ROLE_CHANGED', 'SYSTEM_MAINTENANCE', 'FEATURE_RELEASED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;
