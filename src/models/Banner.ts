import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  active?: boolean;
  position?: "hero" | "mid" | "footer";
}

const bannerSchema = new Schema<IBanner>(
  {
    title: String,
    subtitle: String,
    image: { type: String, required: true },
    link: String,
    active: { type: Boolean, default: true },
    position: {
      type: String,
      enum: ["hero", "mid", "footer"],
      default: "hero",
    },
  },
  { timestamps: true }
);

// Indexes
bannerSchema.index({ active: 1, position: 1 });

export default mongoose.models.Banner ||
  mongoose.model<IBanner>("Banner", bannerSchema);


