import mongoose, { Schema, Model } from "mongoose";

interface ICustomerActivity {
  userId: mongoose.Types.ObjectId;
  lastLogin?: Date;
  loginCount: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  averageOrderValue: number;
  emailEngagement: number;
  lastEmailSent?: Date;
  activityStatus: "active" | "inactive" | "new";
  createdAt: Date;
  updatedAt: Date;
}

const CustomerActivitySchema = new Schema<ICustomerActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    emailEngagement: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastEmailSent: {
      type: Date,
    },
    activityStatus: {
      type: String,
      enum: ["active", "inactive", "new"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for CRM queries
CustomerActivitySchema.index({ activityStatus: 1 });
CustomerActivitySchema.index({ totalSpent: -1 });
CustomerActivitySchema.index({ lastOrderDate: -1 });
CustomerActivitySchema.index({ lastLogin: -1 });

const CustomerActivity: Model<ICustomerActivity> =
  mongoose.models.CustomerActivity ||
  mongoose.model<ICustomerActivity>("CustomerActivity", CustomerActivitySchema);

export default CustomerActivity;



