/*
  Warnings:

  - You are about to drop the `Volunteer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Volunteer" DROP CONSTRAINT "Volunteer_resumeId_fkey";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "atsAnalysis" JSONB,
ADD COLUMN     "atsScore" INTEGER;

-- DropTable
DROP TABLE "Volunteer";

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "Resume"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_updatedAt_idx" ON "Resume"("updatedAt");
