import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

/**
 * GET /api/cart
 * Get user's cart with populated product details
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    let cart = await Cart.findOne({ userId: user.id })
      .populate("items.productId")
      .lean();

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        userId: user.id,
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
      });
    }

    return successResponse(cart);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/cart
 * Add item to cart or update quantity
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();
    const { productId, quantity = 1, action = "add" } = body;

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    // Validate product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return errorResponse("Product not found or unavailable", 404);
    }

    // Check stock availability
    if (action !== "remove" && quantity > product.stock) {
      return errorResponse(`Only ${product.stock} items available in stock`, 400);
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      cart = new Cart({
        userId: user.id,
        items: [],
      });
    }

    // Find existing item in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (action === "remove") {
      // Remove item from cart
      if (existingItemIndex > -1) {
        cart.items.splice(existingItemIndex, 1);
      }
    } else if (action === "update") {
      // Update quantity
      if (existingItemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(existingItemIndex, 1);
        } else {
          cart.items[existingItemIndex].quantity = quantity;
          cart.items[existingItemIndex].price = product.price;
        }
      } else {
        return errorResponse("Item not found in cart", 404);
      }
    } else {
      // Add or increment
      if (existingItemIndex > -1) {
        // Item exists, increment quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stock) {
          return errorResponse(`Only ${product.stock} items available`, 400);
        }
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = product.price;
      } else {
        // Add new item
        cart.items.push({
          productId: product._id,
          quantity,
          price: product.price,
        });
      }
    }

    await cart.save();

    // Populate product details before returning
    await cart.populate("items.productId");

    return successResponse(cart, `Cart ${action === "remove" ? "updated" : "item added"} successfully`);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;
    await cart.save();

    return successResponse(cart, "Cart cleared successfully");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}





