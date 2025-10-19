import mongoose, { Schema, Model } from "mongoose";

interface ICouponUsage {
  userId: mongoose.Types.ObjectId;
  usedAt: Date;
  orderId?: mongoose.Types.ObjectId;
}

interface ICoupon {
  code: string;
  discountType: "percent" | "amount";
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usageCount: number;
  userUsageLimit: number;
  usedBy: ICouponUsage[];
  expiresAt: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponUsageSchema = new Schema<ICouponUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { _id: false }
);

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
      default: "percent",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedBy: {
      type: [CouponUsageSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
CouponSchema.index({ code: 1, isActive: 1 });
CouponSchema.index({ expiresAt: 1 });
CouponSchema.index({ isActive: 1, expiresAt: 1 });

const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
