import mongoose, { Schema, Model } from "mongoose";

export interface ISubscription {
  _id?: string;
  userId?: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  prefs: {
    categories: string[];
    frequency: "immediate" | "daily" | "weekly";
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    prefs: {
      categories: {
        type: [String],
        default: [],
      },
      frequency: {
        type: String,
        enum: ["immediate", "daily", "weekly"],
        default: "immediate",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ endpoint: 1 });
SubscriptionSchema.index({ "prefs.categories": 1 });

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;

