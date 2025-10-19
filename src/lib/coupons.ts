import Coupon from "@/models/Coupon";

/**
 * Validate coupon code
 */
export async function validateCoupon(
  code: string,
  userId: string,
  orderTotal: number
): Promise<{ valid: boolean; coupon?: any; error?: string }> {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  // Check expiry
  if (new Date() > coupon.expiresAt) {
    return { valid: false, error: "Coupon has expired" };
  }

  // Check usage limit
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: "Coupon usage limit reached" };
  }

  // Check minimum purchase
  if (orderTotal < coupon.minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase of ${coupon.minPurchase} ETB required`,
    };
  }

  // Check per-user usage limit
  const userUsageCount = coupon.usedBy.filter(
    (usage) => usage.userId.toString() === userId
  ).length;

  if (userUsageCount >= coupon.userUsageLimit) {
    return {
      valid: false,
      error: `You have already used this coupon ${coupon.userUsageLimit} time(s)`,
    };
  }

  return { valid: true, coupon };
}

/**
 * Calculate discount amount from coupon
 */
export function calculateCouponDiscount(
  coupon: any,
  orderTotal: number
): number {
  let discount = 0;

  if (coupon.discountType === "percent") {
    discount = (orderTotal * coupon.discountValue) / 100;
    
    // Apply max discount cap if set
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    // Fixed amount discount
    discount = coupon.discountValue;
    
    // Don't exceed order total
    if (discount > orderTotal) {
      discount = orderTotal;
    }
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimals
}

/**
 * Apply coupon and increment usage
 */
export async function applyCoupon(
  code: string,
  userId: string,
  orderId?: string
): Promise<void> {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Coupon not found");
  }

  // Increment usage count
  coupon.usageCount += 1;

  // Add to usedBy array
  coupon.usedBy.push({
    userId: userId as any,
    usedAt: new Date(),
    orderId: orderId as any,
  });

  await coupon.save();
}

/**
 * Generate random unique coupon code
 */
export async function generateCouponCode(prefix: string = ""): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix.toUpperCase();
  const length = 8 - prefix.length;

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Check if code exists
  const existing = await Coupon.findOne({ code });
  
  if (existing) {
    // Recursive call to generate new code
    return generateCouponCode(prefix);
  }

  return code;
}

/**
 * Check if user can use coupon
 */
export async function canUserUseCoupon(
  code: string,
  userId: string
): Promise<boolean> {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) return false;

  const userUsageCount = coupon.usedBy.filter(
    (usage) => usage.userId.toString() === userId
  ).length;

  return userUsageCount < coupon.userUsageLimit;
}

/**
 * Get active coupons for user
 */
export async function getActiveCouponsForUser(userId: string): Promise<any[]> {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: now },
    $or: [
      { usageLimit: 0 }, // Unlimited
      { $expr: { $lt: ["$usageCount", "$usageLimit"] } }, // Has remaining uses
    ],
  }).sort({ expiresAt: 1 });

  // Filter by user usage limit
  const availableCoupons = coupons.filter((coupon) => {
    const userUsageCount = coupon.usedBy.filter(
      (usage: any) => usage.userId.toString() === userId
    ).length;
    return userUsageCount < coupon.userUsageLimit;
  });

  return availableCoupons;
}



