import mongoose, { Schema, Model } from "mongoose";
import { ILoyaltyPoints } from "@/types";

const LoyaltyTransactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["earned", "redeemed", "expired"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    reason: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const LoyaltyPointsSchema = new Schema<ILoyaltyPoints>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    availablePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    redeemedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      default: "bronze",
    },
    transactions: {
      type: [LoyaltyTransactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate tier based on total points
LoyaltyPointsSchema.pre("save", function (next) {
  if (this.totalPoints >= 5001) {
    this.tier = "gold";
  } else if (this.totalPoints >= 1001) {
    this.tier = "silver";
  } else {
    this.tier = "bronze";
  }
  next();
});

// Method to get tier multiplier
LoyaltyPointsSchema.methods.getTierMultiplier = function (): number {
  switch (this.tier) {
    case "gold":
      return 2;
    case "silver":
      return 1.5;
    case "bronze":
    default:
      return 1;
  }
};

const LoyaltyPoints: Model<ILoyaltyPoints> =
  mongoose.models.LoyaltyPoints ||
  mongoose.model<ILoyaltyPoints>("LoyaltyPoints", LoyaltyPointsSchema);

export default LoyaltyPoints;


