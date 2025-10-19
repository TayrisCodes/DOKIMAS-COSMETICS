import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { sendEmail } from "@/lib/email";
import { sendOrderNotification } from "@/lib/notifications";

/**
 * GET /api/orders/[id]
 * Get single order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const order = await Order.findById(params.id)
      .populate("items.productId")
      .populate("userId", "name email phone")
      .lean();

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Check if user owns this order or is admin/retail
    if (
      order.userId._id.toString() !== user.id &&
      user.role !== "admin" &&
      user.role !== "retail_manager"
    ) {
      return errorResponse("You don't have permission to view this order", 403);
    }

    return successResponse(order);
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status (Admin/Retail only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { orderStatus, paymentStatus, trackingNumber, adminNotes } = body;

    const order = await Order.findById(params.id).populate("userId", "name email");
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    const oldPaymentStatus = order.paymentStatus;
    const oldOrderStatus = order.orderStatus;

    // Update fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (adminNotes) order.adminNotes = adminNotes;

    await order.save();

    // Send email notifications for status changes
    const userEmail = (order.userId as any).email;
    const userName = (order.userId as any).name;

    // Payment status changed
    if (paymentStatus && paymentStatus !== oldPaymentStatus) {
      if (paymentStatus === "approved" || paymentStatus === "paid") {
        await sendEmail({
          to: userEmail,
          subject: `Payment Verified - Order ${order.orderNumber}`,
          html: getPaymentApprovedEmail(order.orderNumber, userName),
        });
        
        // Send push notification
        await sendOrderNotification(order.userId, order.orderNumber, "paid", {
          url: `/dashboard/customer/orders`,
        });
      } else if (paymentStatus === "rejected") {
        await sendEmail({
          to: userEmail,
          subject: `Payment Issue - Order ${order.orderNumber}`,
          html: getPaymentRejectedEmail(order.orderNumber, userName),
        });
      }
    }

    // Order status changed
    if (orderStatus && orderStatus !== oldOrderStatus) {
      if (orderStatus === "shipped") {
        await sendEmail({
          to: userEmail,
          subject: `Order Shipped - ${order.orderNumber}`,
          html: getOrderShippedEmail(order.orderNumber, userName, trackingNumber),
        });
        
        // Send push notification
        await sendOrderNotification(order.userId, order.orderNumber, "shipped", {
          trackingNumber,
          url: `/dashboard/customer/orders`,
        });
      } else if (orderStatus === "delivered") {
        await sendEmail({
          to: userEmail,
          subject: `Order Delivered - ${order.orderNumber}`,
          html: getOrderDeliveredEmail(order.orderNumber, userName),
        });
        
        // Send push notification
        await sendOrderNotification(order.userId, order.orderNumber, "delivered", {
          url: `/dashboard/customer/orders`,
        });
      } else if (orderStatus === "processing") {
        // Send push notification for processing status
        await sendOrderNotification(order.userId, order.orderNumber, "processing", {
          url: `/dashboard/customer/orders`,
        });
      }
    }

    return successResponse(order, "Order updated successfully");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

// Email Templates
function getPaymentApprovedEmail(orderNumber: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Verified!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! Your payment for order <strong>${orderNumber}</strong> has been verified and approved.</p>
            <p>Your order is now being processed and will be shipped soon. We'll send you another email with tracking information once it ships.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/customer/orders" class="button">Track Your Order</a>
            </p>
            <p>Thank you for shopping with Dokimas Cosmetics!</p>
            <p>Best regards,<br>The Dokimas Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getPaymentRejectedEmail(orderNumber: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Issue Detected</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We couldn't verify your payment for order <strong>${orderNumber}</strong>.</p>
            
            <div class="warning">
              <strong>What to do next:</strong>
              <ul>
                <li>Check if you uploaded the correct payment screenshot</li>
                <li>Verify the transaction reference number is correct</li>
                <li>Upload a clear, legible payment proof</li>
                <li>Contact support if you need assistance: +251 911 234 567</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/customer/orders" class="button">Upload Payment Proof Again</a>
            </p>
            <p>Best regards,<br>The Dokimas Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getOrderShippedEmail(orderNumber: string, name: string, trackingNumber?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .tracking { background: white; padding: 15px; border-radius: 6px; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Exciting news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.</p>
            ${trackingNumber ? `
              <div class="tracking">
                Tracking Number: ${trackingNumber}
              </div>
            ` : ''}
            <p>Your order should arrive within 3-5 business days.</p>
            <p>Best regards,<br>The Dokimas Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getOrderDeliveredEmail(orderNumber: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Delivered!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your order <strong>${orderNumber}</strong> has been delivered!</p>
            <p>We hope you love your products. If you have any issues, please don't hesitate to contact us.</p>
            <p>We'd love to hear your feedback!</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Continue Shopping</a>
            </p>
            <p>Thank you for choosing Dokimas Cosmetics!</p>
            <p>Best regards,<br>The Dokimas Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}





