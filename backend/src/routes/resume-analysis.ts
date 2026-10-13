import express, { Router } from "express";

import { env } from "@/config/env.js";
import { db } from "@/config/prisma.js";
import { authMiddleware } from "@/middleware/auth.js";
import type { ResumeAnalysisResult } from "@/shared/types/resume.js";

export const resumeAnalysisRouter = Router();

/** GET /api/resume-analysis — list the user's stored analyses. */
resumeAnalysisRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;

    const analyses = await db.resumeAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        originalFilename: true,
        fileUrl: true,
        totalScore: true,
        sectionScores: true,
        detailedBreakdown: true,
        keywordMatchRate: true,
        missingKeywords: true,
        improvementSuggestions: true,
        improvementDetails: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedAnalyses = analyses.map((analysis) => ({
      ...analysis,
      sectionScores: analysis.sectionScores,
      detailedBreakdown: analysis.detailedBreakdown,
      improvementSuggestions: analysis.improvementSuggestions,
      improvementDetails: analysis.improvementDetails,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    }));

    res.json({ success: true, analyses: formattedAnalyses });
  } catch (error) {
    console.error("Error fetching resume analyses:", error);
    res.status(500).json({ error: "Failed to fetch resume analyses" });
  }
});

/**
 * POST /api/resume-analysis — forward the (multipart) upload to the external
 * ATS service, then persist the returned analysis.
 */
resumeAnalysisRouter.post(
  "/",
  authMiddleware,
  express.raw({ type: "multipart/form-data", limit: "10mb" }),
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const contentType = req.headers["content-type"];

      const response = await fetch(env.ATS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": contentType ?? "multipart/form-data",
        },
        body: req.body as Buffer,
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = (await response.json()) as ResumeAnalysisResult;

      if (!data.success) {
        throw new Error("Failed to analyze resume");
      }

      await db.resumeAnalysis.create({
        data: {
          userId,
          originalFilename: data.metadata.filename,
          fileUrl: data.file_url || data.metadata.file_url,
          totalScore: data.ats_analysis.total_score,
          sectionScores: JSON.parse(
            JSON.stringify(data.ats_analysis.section_scores),
          ),
          detailedBreakdown: JSON.parse(
            JSON.stringify(data.ats_analysis.detailed_breakdown),
          ),
          keywordMatchRate: data.ats_analysis.keyword_match_rate,
          missingKeywords: data.ats_analysis.missing_keywords || [],
          improvementSuggestions: JSON.parse(
            JSON.stringify({
              high_priority: data.improvement_suggestions.high_priority,
              content: data.improvement_suggestions.content,
              format: data.improvement_suggestions.format,
              language: data.improvement_suggestions.language,
              keywords: data.improvement_suggestions.keywords,
            }),
          ),
          improvementDetails: JSON.parse(
            JSON.stringify({
              bullet_points: data.improvement_details.bullet_points,
              achievements: data.improvement_details.achievements,
              skills: data.improvement_details.skills,
            }),
          ),
        },
      });

      res.json(data);
    } catch (error) {
      console.error("Error in resume analysis:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: errorMessage });
    }
  },
);
