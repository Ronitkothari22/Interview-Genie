/*
  Warnings:

  - You are about to drop the column `isCurrent` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- AlterTable
ALTER TABLE "OTPVerification" ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "isCurrent",
DROP COLUMN "roleId",
DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Resume',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "resumeUrl" DROP NOT NULL,
ALTER COLUMN "fileType" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "preferences",
ADD COLUMN     "branchName" TEXT,
ADD COLUMN     "cgpa" TEXT,
ADD COLUMN     "collegeName" TEXT,
ADD COLUMN     "passoutYear" TEXT;

-- CreateTable
CREATE TABLE "ResumePersonalInfo" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "linkedIn" TEXT,
    "portfolio" TEXT,
    "github" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumePersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeExperience" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "achievements" TEXT[],
    "technologies" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProject" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeEducation" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "gpa" DOUBLE PRECISION,
    "achievements" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeCertification" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrg" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeReference" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeSummary" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeAchievement" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeVolunteering" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeVolunteering_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumePersonalInfo_resumeId_key" ON "ResumePersonalInfo"("resumeId");

-- CreateIndex
CREATE INDEX "ResumePersonalInfo_resumeId_idx" ON "ResumePersonalInfo"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeExperience_resumeId_idx" ON "ResumeExperience"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeProject_resumeId_idx" ON "ResumeProject"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeEducation_resumeId_idx" ON "ResumeEducation"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeCertification_resumeId_idx" ON "ResumeCertification"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeSkill_resumeId_idx" ON "ResumeSkill"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeReference_resumeId_idx" ON "ResumeReference"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeSummary_resumeId_key" ON "ResumeSummary"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeSummary_resumeId_idx" ON "ResumeSummary"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeAchievement_resumeId_idx" ON "ResumeAchievement"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeVolunteering_resumeId_idx" ON "ResumeVolunteering"("resumeId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Account_provider_idx" ON "Account"("provider");

-- CreateIndex
CREATE INDEX "InterviewHistory_createdAt_idx" ON "InterviewHistory"("createdAt");

-- CreateIndex
CREATE INDEX "InterviewHistory_userId_createdAt_idx" ON "InterviewHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewHistory_userId_idx" ON "InterviewHistory"("userId");

-- CreateIndex
CREATE INDEX "InterviewHistory_interviewId_idx" ON "InterviewHistory"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewNote_userId_idx" ON "InterviewNote"("userId");

-- CreateIndex
CREATE INDEX "InterviewNote_interviewId_idx" ON "InterviewNote"("interviewId");

-- CreateIndex
CREATE INDEX "JobDescription_roleId_idx" ON "JobDescription"("roleId");

-- CreateIndex
CREATE INDEX "JobDescription_industry_idx" ON "JobDescription"("industry");

-- CreateIndex
CREATE INDEX "JobDescription_experienceLevel_idx" ON "JobDescription"("experienceLevel");

-- CreateIndex
CREATE INDEX "JobDescription_isActive_idx" ON "JobDescription"("isActive");

-- CreateIndex
CREATE INDEX "JobDescription_roleId_isActive_idx" ON "JobDescription"("roleId", "isActive");

-- CreateIndex
CREATE INDEX "JobDescription_industry_experienceLevel_isActive_idx" ON "JobDescription"("industry", "experienceLevel", "isActive");

-- CreateIndex
CREATE INDEX "JobRole_domainId_idx" ON "JobRole"("domainId");

-- CreateIndex
CREATE INDEX "JobRole_isActive_idx" ON "JobRole"("isActive");

-- CreateIndex
CREATE INDEX "JobRole_experienceYears_idx" ON "JobRole"("experienceYears");

-- CreateIndex
CREATE INDEX "JobRole_domainId_isActive_idx" ON "JobRole"("domainId", "isActive");

-- CreateIndex
CREATE INDEX "JobRole_experienceYears_isActive_idx" ON "JobRole"("experienceYears", "isActive");

-- CreateIndex
CREATE INDEX "MediaRecording_status_idx" ON "MediaRecording"("status");

-- CreateIndex
CREATE INDEX "MediaRecording_createdAt_idx" ON "MediaRecording"("createdAt");

-- CreateIndex
CREATE INDEX "MediaRecording_interviewId_status_idx" ON "MediaRecording"("interviewId", "status");

-- CreateIndex
CREATE INDEX "MediaRecording_interviewId_idx" ON "MediaRecording"("interviewId");

-- CreateIndex
CREATE INDEX "MockInterview_userId_idx" ON "MockInterview"("userId");

-- CreateIndex
CREATE INDEX "MockInterview_status_idx" ON "MockInterview"("status");

-- CreateIndex
CREATE INDEX "MockInterview_startTime_idx" ON "MockInterview"("startTime");

-- CreateIndex
CREATE INDEX "MockInterview_interviewType_idx" ON "MockInterview"("interviewType");

-- CreateIndex
CREATE INDEX "MockInterview_userId_status_idx" ON "MockInterview"("userId", "status");

-- CreateIndex
CREATE INDEX "MockInterview_userId_startTime_idx" ON "MockInterview"("userId", "startTime");

-- CreateIndex
CREATE INDEX "MockInterview_technicalScore_behavioralScore_communicationS_idx" ON "MockInterview"("technicalScore", "behavioralScore", "communicationScore");

-- CreateIndex
CREATE INDEX "OTPVerification_expires_idx" ON "OTPVerification"("expires");

-- CreateIndex
CREATE INDEX "OTPVerification_userId_expires_idx" ON "OTPVerification"("userId", "expires");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "RecordingAnalysis_recordingId_idx" ON "RecordingAnalysis"("recordingId");

-- CreateIndex
CREATE INDEX "RecordingSegment_recordingId_idx" ON "RecordingSegment"("recordingId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "Resume"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_updatedAt_idx" ON "Resume"("updatedAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isProfileComplete_profileProgress_idx" ON "User"("isProfileComplete", "profileProgress");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_lastLogin_idx" ON "User"("lastLogin");

-- CreateIndex
CREATE INDEX "User_workStatus_industry_idx" ON "User"("workStatus", "industry");

-- CreateIndex
CREATE INDEX "User_experience_education_idx" ON "User"("experience", "education");

-- CreateIndex
CREATE INDEX "User_jobPreference_isVerified_idx" ON "User"("jobPreference", "isVerified");

-- CreateIndex
CREATE INDEX "User_level_xpPoints_idx" ON "User"("level", "xpPoints");

-- CreateIndex
CREATE INDEX "User_isVerified_email_idx" ON "User"("isVerified", "email");

-- CreateIndex
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");

-- CreateIndex
CREATE INDEX "UserEducation_userId_idx" ON "UserEducation"("userId");

-- CreateIndex
CREATE INDEX "UserEducation_passoutYear_idx" ON "UserEducation"("passoutYear");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumePersonalInfo" ADD CONSTRAINT "ResumePersonalInfo_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExperience" ADD CONSTRAINT "ResumeExperience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeEducation" ADD CONSTRAINT "ResumeEducation_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeCertification" ADD CONSTRAINT "ResumeCertification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeReference" ADD CONSTRAINT "ResumeReference_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSummary" ADD CONSTRAINT "ResumeSummary_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeAchievement" ADD CONSTRAINT "ResumeAchievement_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVolunteering" ADD CONSTRAINT "ResumeVolunteering_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
