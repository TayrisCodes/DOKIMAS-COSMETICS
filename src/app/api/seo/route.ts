import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SEOSettings from "@/models/SEOSettings";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const UpdateSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  socialPreviewImage: z.string().optional(),
});

// GET /api/seo - Fetch global SEO settings (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const seo = await SEOSettings.findOne({}).lean();
    return successResponse(seo || null);
  } catch (error: any) {
    console.error("SEO GET error:", error);
    return errorResponse(error.message || "Failed to fetch SEO settings", 500);
  }
}

// PUT /api/seo - Update SEO settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const data = UpdateSchema.parse(body);

    const seo = await SEOSettings.findOneAndUpdate(
      {},
      { $set: data },
      { upsert: true, new: true }
    );

    return successResponse(seo, "SEO settings updated successfully");
  } catch (error: any) {
    console.error("SEO PUT error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to update SEO settings", 500);
  }
}


