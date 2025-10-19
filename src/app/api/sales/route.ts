import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Sale from "@/models/Sale";
import { reduceStock } from "@/lib/inventory";

/**
 * GET /api/sales
 * Get all sales with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source"); // online or retail
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = {};

    if (source) {
      query.source = source;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Sale.find(query)
      .populate("items.productId", "name category sku")
      .populate("userId", "name email")
      .populate("orderId", "orderNumber")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    return successResponse({
      sales,
      count: sales.length,
      totalRevenue,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/sales
 * Record a new sale (general purpose)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { items, paymentMethod, source = "retail" } = body;

    if (!items || items.length === 0) {
      return errorResponse("Sale must have at least one item", 400);
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create sale
    const sale = await Sale.create({
      userId: user.id,
      items,
      totalAmount,
      paymentStatus: "approved",
      paymentMethod,
      source,
    });

    // Reduce stock for each item
    for (const item of items) {
      await reduceStock(
        item.productId,
        item.quantity,
        `${source === "retail" ? "Retail" : "Online"} sale`,
        user.id
      );
    }

    return successResponse(sale, "Sale recorded successfully", 201);
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





