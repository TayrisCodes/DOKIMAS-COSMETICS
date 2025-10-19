import mongoose, { Schema, Model } from "mongoose";

interface ILoyaltyHistory {
  action: "earn" | "redeem" | "expire" | "bonus";
  points: number;
  date: Date;
  orderId?: mongoose.Types.ObjectId;
  description: string;
}

interface ILoyaltyPoint {
  userId: mongoose.Types.ObjectId;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  lastEarned?: Date;
  history: ILoyaltyHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const LoyaltyHistorySchema = new Schema<ILoyaltyHistory>(
  {
    action: {
      type: String,
      enum: ["earn", "redeem", "expire", "bonus"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const LoyaltyPointSchema = new Schema<ILoyaltyPoint>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastEarned: {
      type: Date,
    },
    history: {
      type: [LoyaltyHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
LoyaltyPointSchema.index({ userId: 1 });
LoyaltyPointSchema.index({ points: -1 });

const LoyaltyPoint: Model<ILoyaltyPoint> =
  mongoose.models.LoyaltyPoint ||
  mongoose.model<ILoyaltyPoint>("LoyaltyPoint", LoyaltyPointSchema);

export default LoyaltyPoint;



