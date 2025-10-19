import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CMSPage from "@/models/CMSPage";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const ReorderSchema = z.object({
  sectionsOrder: z.array(z.string()),
});

// PATCH /api/cms/pages/[slug]/reorder - Reorder sections (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { slug } = await params;
    const body = await request.json();
    const { sectionsOrder } = ReorderSchema.parse(body);

    const page = await CMSPage.findOneAndUpdate(
      { slug },
      { $set: { sectionsOrder } },
      { new: true }
    );

    if (!page) {
      return errorResponse("Page not found", 404);
    }

    return successResponse(page, "Sections reordered successfully");
  } catch (error: any) {
    console.error("CMS Page reorder error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to reorder sections", 500);
  }
}



