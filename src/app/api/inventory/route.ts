import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { addStock, reduceStock } from "@/lib/inventory";

/**
 * GET /api/inventory
 * Get all products with stock information
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const lowStock = searchParams.get("lowStock") === "true";
    const sort = searchParams.get("sort") || "name";

    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (lowStock) {
      query.$expr = { $lte: ["$stock", "$restockThreshold"] };
    }

    const products = await Product.find(query)
      .select("name slug category stock restockThreshold sku barcode soldCount updatedAt")
      .sort(sort)
      .lean();

    return successResponse({
      products,
      total: products.length,
      lowStockCount: products.filter((p: any) => p.stock <= p.restockThreshold).length,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * PATCH /api/inventory
 * Manual stock adjustment
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { productId, quantity, action, reason } = body;

    if (!productId || !quantity || !action) {
      return errorResponse("Product ID, quantity, and action are required", 400);
    }

    if (!["add", "remove"].includes(action)) {
      return errorResponse("Action must be 'add' or 'remove'", 400);
    }

    if (action === "add") {
      await addStock(productId, quantity, reason || "Manual stock addition", user.id);
    } else {
      await reduceStock(productId, quantity, reason || "Manual stock reduction", user.id);
    }

    // Fetch updated product
    const product = await Product.findById(productId);

    return successResponse(
      product,
      `Stock ${action === "add" ? "added" : "removed"} successfully`
    );
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    if (error.message?.includes("Insufficient stock")) {
      return errorResponse(error.message, 400);
    }
    return errorResponse(error.message, 500);
  }
}






