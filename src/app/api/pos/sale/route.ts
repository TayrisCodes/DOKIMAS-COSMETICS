import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import { reduceStock } from "@/lib/inventory";

/**
 * POST /api/pos/sale
 * Record a POS (retail) sale
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { items, paymentMethod = "cash" } = body;

    if (!items || items.length === 0) {
      return errorResponse("Sale must have at least one item", 400);
    }

    // Validate all products exist and have sufficient stock
    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return errorResponse(`Product not found or inactive: ${item.productId}`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          400
        );
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      saleItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // Create sale record
    const sale = await Sale.create({
      userId: user.id,
      items: saleItems,
      totalAmount,
      paymentStatus: "approved", // POS sales are immediately approved
      paymentMethod,
      source: "retail",
    });

    // Reduce stock for each item
    for (const item of saleItems) {
      await reduceStock(
        item.productId.toString(),
        item.quantity,
        `POS sale by ${user.name}`,
        user.id
      );
    }

    return successResponse(
      sale,
      "POS sale recorded successfully",
      201
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





