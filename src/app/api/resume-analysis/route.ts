import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ResumeAnalysisResult } from "@/types/resume";

const API_URL = "http://23.94.74.248:5000/api/v1/ats-score";

// Remove edge runtime and use Node.js runtime
export const dynamic = 'force-dynamic';
// Configure longer timeout
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Make the API call
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json() as ResumeAnalysisResult;

    if (!data.success) {
      throw new Error("Failed to analyze resume");
    }

    // Store the analysis in the database
    const analysis = await db.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        originalFilename: data.metadata.filename,
        fileUrl: data.file_url || data.metadata.file_url, // Use either file_url location
        totalScore: data.ats_analysis.total_score,
        sectionScores: JSON.parse(JSON.stringify(data.ats_analysis.section_scores)),
        detailedBreakdown: JSON.parse(JSON.stringify(data.ats_analysis.detailed_breakdown)),
        keywordMatchRate: data.ats_analysis.keyword_match_rate,
        missingKeywords: data.ats_analysis.missing_keywords || [],
        improvementSuggestions: JSON.parse(JSON.stringify({
          high_priority: data.improvement_suggestions.high_priority,
          content: data.improvement_suggestions.content,
          format: data.improvement_suggestions.format,
          language: data.improvement_suggestions.language,
          keywords: data.improvement_suggestions.keywords,
        })),
        improvementDetails: JSON.parse(JSON.stringify({
          bullet_points: data.improvement_details.bullet_points,
          achievements: data.improvement_details.achievements,
          skills: data.improvement_details.skills,
        })),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in resume analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await db.resumeAnalysis.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
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

    // Parse JSON fields
    const formattedAnalyses = analyses.map(analysis => ({
      ...analysis,
      sectionScores: analysis.sectionScores as any,
      detailedBreakdown: analysis.detailedBreakdown as any,
      improvementSuggestions: analysis.improvementSuggestions as any,
      improvementDetails: analysis.improvementDetails as any,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    }));

    return NextResponse.json({ 
      success: true, 
      analyses: formattedAnalyses 
    });
  } catch (error) {
    console.error('Error fetching resume analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume analyses' },
      { status: 500 }
    );
  }
} 