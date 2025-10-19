import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Order from "@/models/Order";
import Sale from "@/models/Sale";
import { sendEmail } from "@/lib/email";
import { reduceStock } from "@/lib/inventory";
import { awardPoints, redeemPoints } from "@/lib/loyalty";
import { updateCustomerActivity } from "@/lib/crm";
import { applyCoupon } from "@/lib/coupons";

/**
 * PATCH /api/payments/[id]/approve
 * Approve or reject payment (Admin/Retail only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { action, adminNotes } = body; // action: "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return errorResponse("Action must be 'approve' or 'reject'", 400);
    }

    // Find order
    const order = await Order.findById(params.id).populate("userId", "name email");
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Check if payment proof was uploaded
    if (!order.paymentProofUrl) {
      return errorResponse("No payment proof uploaded yet", 400);
    }

    // Update payment status
    if (action === "approve") {
      order.paymentStatus = "approved";
      order.orderStatus = "processing";

      // Reduce stock for each item and create Sale record
      try {
        for (const item of order.items) {
          await reduceStock(
            item.productId.toString(),
            item.quantity,
            `Order approved: ${order.orderNumber}`,
            user.id,
            order._id.toString()
          );
        }

        // Create Sale record
        await Sale.create({
          userId: order.userId,
          orderId: order._id,
          items: order.items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
          totalAmount: order.totalAmount,
          paymentStatus: "approved",
          paymentMethod: order.paymentMethod,
          source: "online",
        });
      } catch (stockError: any) {
        return errorResponse(`Failed to process inventory: ${stockError.message}`, 500);
      }

      // Award loyalty points
      try {
        const pointsEarned = Math.floor(order.totalAmount / 10);
        if (pointsEarned > 0) {
          await awardPoints(
            order.userId.toString(),
            pointsEarned,
            order._id.toString(),
            `Earned from order worth ${order.totalAmount} ETB`
          );
        }
      } catch (pointsError: any) {
        console.error("Error awarding points:", pointsError);
        // Don't fail the approval if points award fails
      }

      // Deduct points if used
      if (order.pointsUsed && order.pointsUsed > 0) {
        try {
          await redeemPoints(
            order.userId.toString(),
            order.pointsUsed,
            order._id.toString()
          );
        } catch (redeemError: any) {
          console.error("Error redeeming points:", redeemError);
        }
      }

      // Apply coupon if used
      if (order.couponCode) {
        try {
          await applyCoupon(
            order.couponCode,
            order.userId.toString(),
            order._id.toString()
          );
        } catch (couponError: any) {
          console.error("Error applying coupon:", couponError);
        }
      }

      // Update customer activity
      try {
        await updateCustomerActivity(order.userId.toString(), "order", {
          orderTotal: order.totalAmount,
        });
      } catch (activityError: any) {
        console.error("Error updating customer activity:", activityError);
      }
      
      // Send approval email
      const userEmail = (order.userId as any).email;
      const userName = (order.userId as any).name;
      
      await sendEmail({
        to: userEmail,
        subject: `Payment Approved - Order ${order.orderNumber}`,
        html: getPaymentApprovedEmailTemplate(order.orderNumber, userName),
      });
    } else {
      order.paymentStatus = "rejected";
      
      // Send rejection email
      const userEmail = (order.userId as any).email;
      const userName = (order.userId as any).name;
      
      await sendEmail({
        to: userEmail,
        subject: `Payment Issue - Order ${order.orderNumber}`,
        html: getPaymentRejectedEmailTemplate(order.orderNumber, userName, adminNotes),
      });
    }

    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    await order.save();

    return successResponse(
      order,
      `Payment ${action === "approve" ? "approved" : "rejected"} successfully`
    );
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

// Email Templates
function getPaymentApprovedEmailTemplate(orderNumber: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .success-box { background: #d1fae5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
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
            
            <div class="success-box">
              <strong>✅ Great news!</strong> Your payment has been verified and approved.
            </div>
            
            <p>Your order <strong>${orderNumber}</strong> is now being processed and will be shipped soon.</p>
            <p>You'll receive another email with tracking information once your order ships.</p>
            
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

function getPaymentRejectedEmailTemplate(orderNumber: string, name: string, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Verification Issue</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We couldn't verify your payment for order <strong>${orderNumber}</strong>.</p>
            
            ${reason ? `
              <div class="warning">
                <strong>Reason:</strong><br>
                ${reason}
              </div>
            ` : ''}
            
            <div class="warning">
              <strong>What to do next:</strong>
              <ul>
                <li>Upload a clear screenshot of your payment confirmation</li>
                <li>Ensure the transaction reference number is correct</li>
                <li>Contact support if you need help: +251 911 234 567</li>
                <li>Email: support@dokimascosmetics.com</li>
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

