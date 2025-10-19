import mongoose, { Schema, Model } from "mongoose";

export interface INotificationPreference {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  enabled: boolean;
  categories: string[];
  frequency: "immediate" | "daily" | "weekly";
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  channels: {
    push: boolean;
    email: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    categories: {
      type: [String],
      default: ["Aftershave", "Oils", "Deodorants", "Cleansers", "Promotions"],
    },
    frequency: {
      type: String,
      enum: ["immediate", "daily", "weekly"],
      default: "immediate",
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "07:00" },
    },
    channels: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Index
NotificationPreferenceSchema.index({ userId: 1 });

const NotificationPreference: Model<INotificationPreference> =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>("NotificationPreference", NotificationPreferenceSchema);

export default NotificationPreference;

