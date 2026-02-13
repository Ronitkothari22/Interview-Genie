/*
  Warnings:

  - You are about to drop the column `atsScore` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `parsedData` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `ageGroup` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `aspiration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `branchName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cgpa` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `collegeName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cookieConsent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hardSkills` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isProfileComplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jobPreference` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passoutYear` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pinCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredIndustries` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredJobLocations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredRoles` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileProgress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xpPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CareerDomain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewScenario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobDescription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaRecording` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MockInterview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OTPVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecordingAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecordingSegment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeCertification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeEducation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeExperience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumePersonalInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeReference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeVolunteering` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserEducation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "CareerDomain" DROP CONSTRAINT "CareerDomain_createdById_fkey";

-- DropForeignKey
ALTER TABLE "InterviewHistory" DROP CONSTRAINT "InterviewHistory_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewHistory" DROP CONSTRAINT "InterviewHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewNote" DROP CONSTRAINT "InterviewNote_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewNote" DROP CONSTRAINT "InterviewNote_userId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewScenario" DROP CONSTRAINT "InterviewScenario_createdById_fkey";

-- DropForeignKey
ALTER TABLE "InterviewScenario" DROP CONSTRAINT "InterviewScenario_domainId_fkey";

-- DropForeignKey
ALTER TABLE "JobDescription" DROP CONSTRAINT "JobDescription_createdById_fkey";

-- DropForeignKey
ALTER TABLE "JobDescription" DROP CONSTRAINT "JobDescription_roleId_fkey";

-- DropForeignKey
ALTER TABLE "JobRole" DROP CONSTRAINT "JobRole_createdById_fkey";

-- DropForeignKey
ALTER TABLE "JobRole" DROP CONSTRAINT "JobRole_domainId_fkey";

-- DropForeignKey
ALTER TABLE "MediaRecording" DROP CONSTRAINT "MediaRecording_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "MockInterview" DROP CONSTRAINT "MockInterview_jobId_fkey";

-- DropForeignKey
ALTER TABLE "MockInterview" DROP CONSTRAINT "MockInterview_roleId_fkey";

-- DropForeignKey
ALTER TABLE "MockInterview" DROP CONSTRAINT "MockInterview_scenarioId_fkey";

-- DropForeignKey
ALTER TABLE "MockInterview" DROP CONSTRAINT "MockInterview_userId_fkey";

-- DropForeignKey
ALTER TABLE "OTPVerification" DROP CONSTRAINT "OTPVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecordingAnalysis" DROP CONSTRAINT "RecordingAnalysis_recordingId_fkey";

-- DropForeignKey
ALTER TABLE "RecordingSegment" DROP CONSTRAINT "RecordingSegment_recordingId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeAchievement" DROP CONSTRAINT "ResumeAchievement_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeCertification" DROP CONSTRAINT "ResumeCertification_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeEducation" DROP CONSTRAINT "ResumeEducation_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeExperience" DROP CONSTRAINT "ResumeExperience_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumePersonalInfo" DROP CONSTRAINT "ResumePersonalInfo_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeProject" DROP CONSTRAINT "ResumeProject_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeReference" DROP CONSTRAINT "ResumeReference_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeSkill" DROP CONSTRAINT "ResumeSkill_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeSummary" DROP CONSTRAINT "ResumeSummary_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeVolunteering" DROP CONSTRAINT "ResumeVolunteering_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserEducation" DROP CONSTRAINT "UserEducation_userId_fkey";

-- DropIndex
DROP INDEX "Resume_createdAt_idx";

-- DropIndex
DROP INDEX "Resume_updatedAt_idx";

-- DropIndex
DROP INDEX "User_createdAt_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_experience_education_idx";

-- DropIndex
DROP INDEX "User_isProfileComplete_profileProgress_idx";

-- DropIndex
DROP INDEX "User_isVerified_email_idx";

-- DropIndex
DROP INDEX "User_jobPreference_isVerified_idx";

-- DropIndex
DROP INDEX "User_lastLogin_idx";

-- DropIndex
DROP INDEX "User_level_xpPoints_idx";

-- DropIndex
DROP INDEX "User_subscriptionStatus_idx";

-- DropIndex
DROP INDEX "User_updatedAt_idx";

-- DropIndex
DROP INDEX "User_workStatus_industry_idx";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "atsScore",
DROP COLUMN "fileType",
DROP COLUMN "isDefault",
DROP COLUMN "parsedData",
DROP COLUMN "resumeUrl",
ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ageGroup",
DROP COLUMN "aspiration",
DROP COLUMN "bio",
DROP COLUMN "branchName",
DROP COLUMN "cgpa",
DROP COLUMN "city",
DROP COLUMN "collegeName",
DROP COLUMN "companyName",
DROP COLUMN "cookieConsent",
DROP COLUMN "country",
DROP COLUMN "credits",
DROP COLUMN "education",
DROP COLUMN "emailVerified",
DROP COLUMN "experience",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "hardSkills",
DROP COLUMN "hashedPassword",
DROP COLUMN "industry",
DROP COLUMN "isProfileComplete",
DROP COLUMN "isVerified",
DROP COLUMN "jobPreference",
DROP COLUMN "lastLogin",
DROP COLUMN "lastName",
DROP COLUMN "level",
DROP COLUMN "passoutYear",
DROP COLUMN "phoneNumber",
DROP COLUMN "pinCode",
DROP COLUMN "preferredIndustries",
DROP COLUMN "preferredJobLocations",
DROP COLUMN "preferredRoles",
DROP COLUMN "profileProgress",
DROP COLUMN "resumeUrl",
DROP COLUMN "socialLinks",
DROP COLUMN "state",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "workStatus",
DROP COLUMN "xpPoints";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "CareerDomain";

-- DropTable
DROP TABLE "InterviewHistory";

-- DropTable
DROP TABLE "InterviewNote";

-- DropTable
DROP TABLE "InterviewScenario";

-- DropTable
DROP TABLE "JobDescription";

-- DropTable
DROP TABLE "JobRole";

-- DropTable
DROP TABLE "MediaRecording";

-- DropTable
DROP TABLE "MockInterview";

-- DropTable
DROP TABLE "OTPVerification";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "RecordingAnalysis";

-- DropTable
DROP TABLE "RecordingSegment";

-- DropTable
DROP TABLE "ResumeAchievement";

-- DropTable
DROP TABLE "ResumeCertification";

-- DropTable
DROP TABLE "ResumeEducation";

-- DropTable
DROP TABLE "ResumeExperience";

-- DropTable
DROP TABLE "ResumePersonalInfo";

-- DropTable
DROP TABLE "ResumeProject";

-- DropTable
DROP TABLE "ResumeReference";

-- DropTable
DROP TABLE "ResumeSkill";

-- DropTable
DROP TABLE "ResumeSummary";

-- DropTable
DROP TABLE "ResumeVolunteering";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "UserEducation";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "linkedIn" TEXT,
    "portfolio" TEXT,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT[],

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT,
    "technologies" TEXT[],
    "startDate" TEXT,
    "endDate" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "gpa" TEXT,
    "achievements" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrg" TEXT NOT NULL,
    "issueDate" TEXT NOT NULL,
    "expiryDate" TEXT,
    "credentialId" TEXT,
    "credentialUrl" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT,
    "date" TEXT,
    "description" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "organization" TEXT,
    "role" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "description" TEXT,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "technical" TEXT[],
    "soft" TEXT[],
    "tools" TEXT[],

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_resumeId_key" ON "PersonalInfo"("resumeId");

-- CreateIndex
CREATE INDEX "Experience_resumeId_idx" ON "Experience"("resumeId");

-- CreateIndex
CREATE INDEX "Project_resumeId_idx" ON "Project"("resumeId");

-- CreateIndex
CREATE INDEX "Education_resumeId_idx" ON "Education"("resumeId");

-- CreateIndex
CREATE INDEX "Certification_resumeId_idx" ON "Certification"("resumeId");

-- CreateIndex
CREATE INDEX "Achievement_resumeId_idx" ON "Achievement"("resumeId");

-- CreateIndex
CREATE INDEX "Volunteer_resumeId_idx" ON "Volunteer"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Skills_resumeId_key" ON "Skills"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_resumeId_key" ON "Summary"("resumeId");

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Volunteer" ADD CONSTRAINT "Volunteer_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skills" ADD CONSTRAINT "Skills_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
