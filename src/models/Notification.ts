import mongoose, { Schema, Model } from "mongoose";

export interface INotification {
  _id?: string;
  userId?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  sentAt: Date;
  read: boolean;
  type: "new_product" | "order_update" | "promotion" | "reminder" | "general";
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    icon: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    type: {
      type: String,
      enum: ["new_product", "order_update", "promotion", "reminder", "general"],
      default: "general",
      index: true,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
NotificationSchema.index({ userId: 1, sentAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ type: 1, sentAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

