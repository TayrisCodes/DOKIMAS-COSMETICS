import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { uploadImage } from "@/lib/cloudinary";

/**
 * POST /api/payments
 * Upload payment proof for an order
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const formData = await request.formData();
    const orderId = formData.get("orderId") as string;
    const paymentReference = formData.get("paymentReference") as string;
    const paymentProof = formData.get("paymentProof") as File;

    if (!orderId || !paymentReference || !paymentProof) {
      return errorResponse("Order ID, payment reference, and payment proof are required", 400);
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Verify user owns this order
    if (order.userId.toString() !== user.id) {
      return errorResponse("You don't have permission to update this order", 403);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(paymentProof.type)) {
      return errorResponse("Invalid file type. Please upload a JPEG, PNG, or WebP image.", 400);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (paymentProof.size > maxSize) {
      return errorResponse("File too large. Maximum size is 5MB.", 400);
    }

    // Convert to buffer
    const bytes = await paymentProof.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(buffer, "dokimas-payment-proofs");

    // Update order with payment proof
    order.paymentProofUrl = uploadResult.url;
    order.paymentReference = paymentReference;
    order.paymentStatus = "under_review";
    await order.save();

    return successResponse(
      order,
      "Payment proof uploaded successfully. We'll verify it within 24 hours."
    );
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    console.error("Payment upload error:", error);
    return errorResponse(error.message || "Failed to upload payment proof", 500);
  }
}





