import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Banner from "@/models/Banner";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const BannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1),
  link: z.string().optional(),
  position: z.enum(["hero", "mid", "footer"]).optional(),
  active: z.boolean().optional(),
});

// GET /api/banners - List active banners (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const filter: any = includeInactive ? {} : { active: true };
    if (position) filter.position = position;

    const banners = await Banner.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(banners);
  } catch (error: any) {
    console.error("Banners GET error:", error);
    return errorResponse(error.message || "Failed to fetch banners", 500);
  }
}

// POST /api/banners - Create banner (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const data = BannerSchema.parse(body);

    const banner = await Banner.create(data);
    return successResponse(banner, "Banner created successfully", 201);
  } catch (error: any) {
    console.error("Banners POST error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to create banner", 500);
  }
}



