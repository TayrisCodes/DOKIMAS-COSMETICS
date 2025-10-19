import { NextRequest } from "next/server";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { sendNewProductNotification } from "@/lib/notifications";

/**
 * GET /api/products
 * Get all products with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "-createdAt";

    // Build query
    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return paginatedResponse(products, page, limit, total);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/products
 * Create new product (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    await requireRole("admin");
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const { name, category, description, price, stock, sku } = body;

    if (!name || !category || !description || price === undefined || stock === undefined || !sku) {
      return errorResponse("Missing required fields: name, category, description, price, stock, sku", 400);
    }

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku });
    if (existingSKU) {
      return errorResponse("Product with this SKU already exists", 409);
    }

    // Generate unique slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      // Ensure slug is unique
      let counter = 1;
      let uniqueSlug = slug;
      while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = uniqueSlug;
    }

    // Create product with generated slug
    const productData = {
      ...body,
      slug,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const product = await Product.create(productData);

    // Send new product notification asynchronously
    if (product.isActive) {
      sendNewProductNotification(product._id, {
        name: product.name,
        category: product.category,
        slug: product.slug,
        image: product.images && product.images[0],
      }).catch((error) => {
        console.error('Failed to send new product notification:', error);
      });
    }

    return successResponse(product, "Product created successfully", 201);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    if (error.code === 11000) {
      return errorResponse("Product with this name or SKU already exists", 409);
    }
    return errorResponse(error.message, 500);
  }
}

