import mongoose, { Schema, Model } from "mongoose";

interface ILoyaltyConfig {
  pointsPerAmount: number; // e.g., 10 = 1 point per 10 ETB
  redeemRate: number; // e.g., 2 = 100 points = 50 ETB (divide by 2)
  minRedeemPoints: number; // minimum points to redeem
  maxRedeemPercent: number; // max % of order total that can be covered
  pointsExpireDays: number; // 0 = no expiry
  welcomePoints: number; // bonus points on registration
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyConfigSchema = new Schema<ILoyaltyConfig>(
  {
    pointsPerAmount: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
    redeemRate: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
    },
    minRedeemPoints: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    maxRedeemPercent: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
      max: 100,
    },
    pointsExpireDays: {
      type: Number,
      default: 0, // 0 = no expiry
      min: 0,
    },
    welcomePoints: {
      type: Number,
      default: 100,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const LoyaltyConfig: Model<ILoyaltyConfig> =
  mongoose.models.LoyaltyConfig ||
  mongoose.model<ILoyaltyConfig>("LoyaltyConfig", LoyaltyConfigSchema);

export default LoyaltyConfig;



