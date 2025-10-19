import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { addBlogNotificationJob } from "@/lib/queue/emailQueue";
import { z } from "zod";

// Validation schema
const UpdateBlogSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  featureOnHomepage: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  publishedAt: z.string().optional(),
  notifySubscribers: z.boolean().optional(),
});

// GET /api/blogs/[slug] - Fetch single blog (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    const blog = await Blog.findOne({ slug, isPublished: true })
      .populate("author", "name email")
      .lean();

    if (!blog) {
      return errorResponse("Blog not found", 404);
    }

    return successResponse(blog);
  } catch (error: any) {
    console.error("Blog GET error:", error);
    return errorResponse(error.message || "Failed to fetch blog", 500);
  }
}

// PUT /api/blogs/[slug] - Update blog (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { slug } = params;
    const body = await request.json();
    const data = UpdateBlogSchema.parse(body);

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return errorResponse("Blog not found", 404);
    }

    // If publishing for the first time, set publishedAt
    const wasPublished = blog.isPublished;
    if (!wasPublished && data.isPublished) {
      data.publishedAt = data.publishedAt || new Date().toISOString();
    }

    // Update blog
    Object.assign(blog, {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : blog.publishedAt,
    });
    await blog.save();

    // If newly published and notify, enqueue email
    if (!wasPublished && data.isPublished && data.notifySubscribers) {
      try {
        await addBlogNotificationJob({
          blogId: blog._id.toString(),
          title: blog.title,
          excerpt: blog.excerpt || "",
          url: `/blog/${blog.slug}`,
        });
      } catch (emailError) {
        console.error("Failed to enqueue blog notification:", emailError);
      }
    }

    return successResponse(blog, "Blog updated successfully");
  } catch (error: any) {
    console.error("Blog PUT error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to update blog", 500);
  }
}

// DELETE /api/blogs/[slug] - Soft delete blog (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { slug } = params;

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $set: { isPublished: false, featureOnHomepage: false } },
      { new: true }
    );

    if (!blog) {
      return errorResponse("Blog not found", 404);
    }

    return successResponse(null, "Blog deleted successfully");
  } catch (error: any) {
    console.error("Blog DELETE error:", error);
    return errorResponse(error.message || "Failed to delete blog", 500);
  }
}


