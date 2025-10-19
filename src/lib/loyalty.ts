import LoyaltyPoint from "@/models/LoyaltyPoint";
import LoyaltyConfig from "@/models/LoyaltyConfig";
import CustomerActivity from "@/models/CustomerActivity";

/**
 * Get or create loyalty configuration
 */
export async function getLoyaltyConfig() {
  let config = await LoyaltyConfig.findOne({ isActive: true });
  
  if (!config) {
    // Create default config if none exists
    config = await LoyaltyConfig.create({
      pointsPerAmount: 10,
      redeemRate: 2,
      minRedeemPoints: 50,
      maxRedeemPercent: 50,
      pointsExpireDays: 0,
      welcomePoints: 100,
      isActive: true,
    });
  }
  
  return config;
}

/**
 * Calculate points earned from order total
 */
export async function calculatePointsEarned(orderTotal: number): Promise<number> {
  const config = await getLoyaltyConfig();
  return Math.floor(orderTotal / config.pointsPerAmount);
}

/**
 * Calculate discount value from points
 */
export async function calculatePointsDiscount(points: number): Promise<number> {
  const config = await getLoyaltyConfig();
  return points / config.redeemRate;
}

/**
 * Validate points redemption
 */
export async function validatePointsRedemption(
  points: number,
  orderTotal: number,
  userPoints: number
): Promise<{ valid: boolean; error?: string; maxPoints?: number }> {
  const config = await getLoyaltyConfig();

  // Check minimum points
  if (points < config.minRedeemPoints) {
    return {
      valid: false,
      error: `Minimum ${config.minRedeemPoints} points required to redeem`,
    };
  }

  // Check user has enough points
  if (points > userPoints) {
    return {
      valid: false,
      error: `Insufficient points. You have ${userPoints} points`,
    };
  }

  // Calculate max points based on maxRedeemPercent
  const maxDiscount = (orderTotal * config.maxRedeemPercent) / 100;
  const maxPoints = Math.floor(maxDiscount * config.redeemRate);

  if (points > maxPoints) {
    return {
      valid: false,
      error: `Maximum ${maxPoints} points can be redeemed for this order`,
      maxPoints,
    };
  }

  return { valid: true };
}

/**
 * Award points to user
 */
export async function awardPoints(
  userId: string,
  points: number,
  orderId: string,
  description: string
): Promise<void> {
  let loyaltyPoint = await LoyaltyPoint.findOne({ userId });

  if (!loyaltyPoint) {
    loyaltyPoint = await LoyaltyPoint.create({
      userId,
      points: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      history: [],
    });
  }

  // Update points
  loyaltyPoint.points += points;
  loyaltyPoint.totalEarned += points;
  loyaltyPoint.lastEarned = new Date();

  // Add to history
  loyaltyPoint.history.push({
    action: "earn",
    points,
    date: new Date(),
    orderId: orderId as any,
    description,
  });

  await loyaltyPoint.save();
}

/**
 * Redeem points from user
 */
export async function redeemPoints(
  userId: string,
  points: number,
  orderId: string
): Promise<void> {
  const loyaltyPoint = await LoyaltyPoint.findOne({ userId });

  if (!loyaltyPoint) {
    throw new Error("Loyalty account not found");
  }

  if (loyaltyPoint.points < points) {
    throw new Error("Insufficient points");
  }

  // Deduct points
  loyaltyPoint.points -= points;
  loyaltyPoint.totalRedeemed += points;

  // Add to history
  loyaltyPoint.history.push({
    action: "redeem",
    points: -points,
    date: new Date(),
    orderId: orderId as any,
    description: `Redeemed ${points} points for order discount`,
  });

  await loyaltyPoint.save();
}

/**
 * Initialize loyalty account for new user
 */
export async function initializeLoyaltyAccount(userId: string): Promise<void> {
  const config = await getLoyaltyConfig();
  const welcomePoints = config.welcomePoints || 0;

  const loyaltyPoint = await LoyaltyPoint.create({
    userId,
    points: welcomePoints,
    totalEarned: welcomePoints,
    totalRedeemed: 0,
    lastEarned: welcomePoints > 0 ? new Date() : undefined,
    history: welcomePoints > 0 ? [{
      action: "bonus" as const,
      points: welcomePoints,
      date: new Date(),
      description: "Welcome bonus points",
    }] : [],
  });

  // Also initialize customer activity
  await CustomerActivity.create({
    userId,
    loginCount: 0,
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    emailEngagement: 0,
    activityStatus: "new",
  });
}



