import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Blog from "@/models/Blog";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { slugify } from "@/lib/slugify";
import { addBlogNotificationJob } from "@/lib/queue/emailQueue";
import { z } from "zod";

// Validation schema
const CreateBlogSchema = z.object({
  title: z.string().min(1),
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

// GET /api/blogs - List published blogs with pagination (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("search");

    const filter: any = { isPublished: true };
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    if (featured) filter.featureOnHomepage = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Blog.countDocuments(filter);
    const posts = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .select("title slug excerpt image categories tags publishedAt featureOnHomepage")
      .populate("author", "name")
      .lean();

    return successResponse({
      posts,
      meta: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error: any) {
    console.error("Blogs GET error:", error);
    return errorResponse(error.message || "Failed to fetch blogs", 500);
  }
}

// POST /api/blogs - Create blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    await connectDB();

    const body = await request.json();
    const data = CreateBlogSchema.parse(body);

    // Auto-generate slug from title
    const slug = slugify(data.title);

    // Check if slug already exists
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return errorResponse("Blog with similar title already exists", 400);
    }

    // Set publishedAt if publishing
    const publishedAt =
      data.publishedAt
        ? new Date(data.publishedAt)
        : data.isPublished
          ? new Date()
          : undefined;

    const blog = await Blog.create({
      ...data,
      slug,
      author: user.id,
      publishedAt,
    });

    // If notifySubscribers and published, enqueue email job
    if (data.notifySubscribers && data.isPublished) {
      try {
        await addBlogNotificationJob({
          blogId: blog._id.toString(),
          title: blog.title,
          excerpt: blog.excerpt || "",
          url: `/blog/${blog.slug}`,
        });
      } catch (emailError) {
        console.error("Failed to enqueue blog notification:", emailError);
        // Don't fail the blog creation if email queue fails
      }
    }

    return successResponse(blog, "Blog created successfully", 201);
  } catch (error: any) {
    console.error("Blogs POST error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to create blog", 500);
  }
}


