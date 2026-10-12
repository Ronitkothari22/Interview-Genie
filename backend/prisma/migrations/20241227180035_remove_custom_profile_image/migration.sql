/*
  Warnings:

  - You are about to drop the column `profileImage` on the `User` table. All the data in the column will be lost.
  - Made the column `subscriptionStatus` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileImage",
ADD COLUMN     "ageGroup" TEXT,
ADD COLUMN     "aspiration" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "cookieConsent" BOOLEAN,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "hardSkills" JSONB,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobPreference" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pinCode" TEXT,
ADD COLUMN     "preferredIndustries" JSONB,
ADD COLUMN     "preferredJobLocations" JSONB,
ADD COLUMN     "preferredRoles" JSONB,
ADD COLUMN     "profileProgress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "workStatus" TEXT,
ADD COLUMN     "xpPoints" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "subscriptionStatus" SET NOT NULL;

-- CreateTable
CREATE TABLE "UserEducation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "course" TEXT,
    "result" TEXT,
    "passoutYear" TEXT,
    "collegeName" TEXT,
    "branchName" TEXT,
    "cgpa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEducation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEducation_userId_key" ON "UserEducation"("userId");

-- AddForeignKey
ALTER TABLE "UserEducation" ADD CONSTRAINT "UserEducation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
