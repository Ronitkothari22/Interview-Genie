import { type NextRequest, NextResponse } from "next/server";
import { generateTemplatePreview } from "@/lib/templates/preview-generator";
import { type TemplateType } from "@/lib/types/resume";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const template = searchParams.get("template") as TemplateType;

    if (!template || !["modern", "classic", "minimalist"].includes(template)) {
      return NextResponse.json(
        { error: "Invalid template type" },
        { status: 400 },
      );
    }

    const pdfBuffer = await generateTemplatePreview(template);

    // Return PDF with appropriate headers
    return new NextResponse(Buffer.from(JSON.stringify(pdfBuffer)), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${template}-preview.pdf"`,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error generating template preview:", error);

    // Check if the error is related to missing pdflatex
    if (
      error instanceof Error &&
      error.message.includes("pdflatex: command not found")
    ) {
      return NextResponse.json(
        {
          error:
            "LaTeX is not installed on the system. Please install TeX Live using your package manager.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate preview",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
