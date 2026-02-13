import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateTemplatePreview } from "@/lib/templates/preview-generator";

export async function POST(req: NextRequest) {
  try {
    const { template } = await req.json();

    if (!template || !["modern", "classic", "minimalist"].includes(template)) {
      return NextResponse.json(
        { error: "Invalid template type" },
        { status: 400 },
      );
    }

    const previewData = await generateTemplatePreview(template);
    if (!previewData) {
      return NextResponse.json(
        { error: "Failed to generate preview" },
        { status: 500 },
      );
    }

    // Return the preview data as JSON
    return NextResponse.json({
      success: true,
      data: previewData,
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 },
    );
  }
}
