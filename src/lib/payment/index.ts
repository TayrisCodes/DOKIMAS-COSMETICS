/**
 * Payment Gateway Utilities
 */

export interface PaymentData {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
}

/**
 * CBE Birr Payment Integration
 */
export async function initiateCBEPayment(data: PaymentData) {
  try {
    const response = await fetch(process.env.CBE_BIRR_API_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CBE_BIRR_API_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: process.env.CBE_BIRR_MERCHANT_ID,
        amount: data.amount,
        currency: data.currency || "ETB",
        order_id: data.orderNumber,
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook/cbe`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "CBE Birr payment initiation failed");
    }

    return {
      success: true,
      paymentUrl: result.payment_url,
      transactionId: result.transaction_id,
    };
  } catch (error: any) {
    console.error("CBE Birr Error:", error);
    return {
      success: false,
      error: error.message || "Payment initiation failed",
    };
  }
}

/**
 * TeleBirr Payment Integration (Placeholder - requires SDK)
 */
export async function initiateTeleBirrPayment(data: PaymentData) {
  try {
    // Note: Actual implementation requires TeleBirr SDK
    // This is a placeholder structure
    const payload = {
      appId: process.env.TELEBIRR_APP_ID,
      appKey: process.env.TELEBIRR_APP_KEY,
      merchantId: process.env.TELEBIRR_MERCHANT_ID,
      outTradeNo: data.orderNumber,
      subject: `Dokimas Order #${data.orderNumber}`,
      totalAmount: data.amount,
      notifyUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook/telebirr`,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
    };

    // TODO: Implement actual TeleBirr SDK call
    console.log("TeleBirr Payment Payload:", payload);

    return {
      success: true,
      paymentUrl: "#", // Replace with actual payment URL from SDK
      transactionId: `TB-${Date.now()}`,
    };
  } catch (error: any) {
    console.error("TeleBirr Error:", error);
    return {
      success: false,
      error: error.message || "Payment initiation failed",
    };
  }
}

/**
 * Stripe Payment Integration
 */
export async function initiateStripePayment(data: PaymentData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/stripe/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Stripe payment initiation failed");
    }

    return {
      success: true,
      paymentUrl: result.url,
      sessionId: result.sessionId,
    };
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return {
      success: false,
      error: error.message || "Payment initiation failed",
    };
  }
}

/**
 * Verify payment signature (for webhooks)
 */
export function verifyPaymentSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}


