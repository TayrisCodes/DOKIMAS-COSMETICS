import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { sendEmail } from "@/lib/email";

/**
 * GET /api/orders
 * Get user's orders
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const orders = await Order.find({ userId: user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(orders);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/orders
 * Create new order from cart
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();
    const { shippingAddress, paymentMethod, notes } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return errorResponse("Shipping address and payment method are required", 400);
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return errorResponse("Cart is empty", 400);
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return errorResponse(`Product not found: ${item.productId}`, 404);
      }
      if (!product.isActive) {
        return errorResponse(`Product is no longer available: ${product.name}`, 400);
      }
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for ${product.name}. Only ${product.stock} available.`, 400);
      }
    }

    // Prepare order items
    const orderItems = cart.items.map((item: any) => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.images?.[0] || "",
      variant: item.variant || "",
      quantity: item.quantity,
      price: item.productId.price,
      subtotal: item.productId.price * item.quantity,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingCost = subtotal >= 50 ? 0 : 5; // Free shipping over $50
    const tax = 0; // Can be calculated if needed
    const totalAmount = subtotal + shippingCost + tax - cart.discount;

    // Create order
    const order = await Order.create({
      userId: user.id,
      items: orderItems,
      subtotal,
      discount: cart.discount || 0,
      couponCode: cart.couponCode,
      shippingCost,
      tax,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      notes,
      source: "online",
    });

    // Clear cart after order creation
    cart.items = [];
    cart.subtotal = 0;
    cart.discount = 0;
    cart.total = 0;
    cart.couponCode = undefined;
    await cart.save();

    // Send order confirmation email
    try {
      await sendEmail({
        to: user.email as string,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: getOrderConfirmationEmail(order.orderNumber, user.name as string, totalAmount),
      });
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    return successResponse(order, "Order created successfully", 201);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}

// Email template for order confirmation
function getOrderConfirmationEmail(orderNumber: string, name: string, total: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .order-number { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .note { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for your order at Dokimas Cosmetics!</p>
            <p>Order Number: <span class="order-number">${orderNumber}</span></p>
            <p>Total Amount: <strong>$${total.toFixed(2)}</strong></p>
            
            <div class="note">
              <strong>⏳ Next Steps:</strong>
              <ol>
                <li>Complete your payment via TeleBirr or CBE Birr</li>
                <li>Upload your payment screenshot in the checkout page</li>
                <li>We'll verify your payment within 24 hours</li>
                <li>You'll receive an email once approved</li>
              </ol>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/customer/orders" class="button">View Order Status</a>
            </p>
            
            <p>Best regards,<br>The Dokimas Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}





