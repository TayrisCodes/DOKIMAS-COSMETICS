import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CMSPage from "@/models/CMSPage";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema for updates
const UpdatePageSchema = z.object({
  title: z.string().optional(),
  sections: z.array(z.any()).optional(),
  sectionsOrder: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/cms/pages/[slug] - Fetch page by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const { slug } = params;

    const page = await CMSPage.findOne({ slug }).lean();
    if (!page) {
      return errorResponse("Page not found", 404);
    }

    // Resolve sections in order
    const orderedSections = (
      page.sectionsOrder?.length > 0
        ? page.sectionsOrder
        : page.sections.map((s: any) => s.key)
    )
      .map((key: string) => page.sections.find((s: any) => s.key === key))
      .filter(Boolean);

    // For each section, resolve featured products if applicable
    const resolved = await Promise.all(
      orderedSections.map(async (section: any) => {
        if (!section) return null;

        if (section.key === "featured_products" && section.productsQuery) {
          const query = section.productsQuery;

          if (query.type === "byIds" && query.ids?.length > 0) {
            const products = await Product.find({
              _id: { $in: query.ids },
              isActive: true,
            })
              .select("name price images slug stock shortDescription")
              .lean();

            return { ...section, products };
          }

          if (query.type === "byQuery" && query.query) {
            const products = await Product.find({
              ...query.query,
              isActive: true,
            })
              .limit(section.settings?.limit || 8)
              .select("name price images slug stock shortDescription")
              .lean();

            return { ...section, products };
          }
        }

        return section;
      })
    );

    return successResponse({ ...page, sections: resolved });
  } catch (error: any) {
    console.error("CMS Page GET error:", error);
    return errorResponse(error.message || "Failed to fetch page", 500);
  }
}

// PUT /api/cms/pages/[slug] - Update page (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { slug } = params;
    const body = await request.json();
    const data = UpdatePageSchema.parse(body);

    const page = await CMSPage.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true, upsert: true }
    );

    return successResponse(page, "Page updated successfully");
  } catch (error: any) {
    console.error("CMS Page PUT error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to update page", 500);
  }
}

// DELETE /api/cms/pages/[slug] - Delete page (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { slug } = params;

    // Prevent deleting the home page
    if (slug === "home") {
      return errorResponse("Cannot delete the home page", 400);
    }

    const page = await CMSPage.findOneAndDelete({ slug });
    if (!page) {
      return errorResponse("Page not found", 404);
    }

    return successResponse(null, "Page deleted successfully");
  } catch (error: any) {
    console.error("CMS Page DELETE error:", error);
    return errorResponse(error.message || "Failed to delete page", 500);
  }
}


