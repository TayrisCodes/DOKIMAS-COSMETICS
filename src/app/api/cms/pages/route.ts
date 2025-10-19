import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CMSPage from "@/models/CMSPage";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const CreatePageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().optional(),
  sections: z.array(z.any()).optional(),
  sectionsOrder: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/cms/pages - List all pages (admin only)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const pages = await CMSPage.find({})
      .select("slug title isPublished createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return successResponse(pages);
  } catch (error: any) {
    console.error("CMS Pages GET error:", error);
    return errorResponse(error.message || "Failed to fetch pages", 500);
  }
}

// POST /api/cms/pages - Create new page (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const data = CreatePageSchema.parse(body);

    // Check if slug already exists
    const existing = await CMSPage.findOne({ slug: data.slug });
    if (existing) {
      return errorResponse("Page with this slug already exists", 400);
    }

    const page = await CMSPage.create(data);
    return successResponse(page, "Page created successfully", 201);
  } catch (error: any) {
    console.error("CMS Pages POST error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to create page", 500);
  }
}


