import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Product from "@/models/Product";

/**
 * GET /api/products/[id]
 * Get single product by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Try to find by ID first, then by slug
    let product = await Product.findById(params.id);
    
    if (!product) {
      product = await Product.findOne({ slug: params.id, isActive: true });
    }

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    return successResponse(product);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * PUT /api/products/[id]
 * Update product (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    await connectDB();

    const body = await request.json();

    // Check if product exists
    const product = await Product.findById(params.id);

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return successResponse(updatedProduct, "Product updated successfully");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (Admin only) - Soft delete by setting isActive to false
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("admin");
    await connectDB();

    const product = await Product.findById(params.id);

    if (!product) {
      return errorResponse("Product not found", 404);
    }

    // Soft delete - set isActive to false
    product.isActive = false;
    await product.save();

    return successResponse(
      { id: product._id },
      "Product deleted successfully"
    );
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

