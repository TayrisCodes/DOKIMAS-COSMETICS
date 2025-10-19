import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadImage } from "@/lib/cms/uploadToCloudinary";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const UploadSchema = z.object({
  image: z.string().min(1),
});

// POST /api/upload - Upload image to Cloudinary (authenticated users)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { image } = UploadSchema.parse(body);

    const url = await uploadImage(image);
    return successResponse({ url }, "Image uploaded successfully");
  } catch (error: any) {
    console.error("Upload error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid image data", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to upload image", 500);
  }
}
