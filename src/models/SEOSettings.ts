import mongoose, { Document, Schema } from "mongoose";

export interface ISEOSettings extends Document {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  socialPreviewImage?: string;
}

const seoSettingsSchema = new Schema<ISEOSettings>(
  {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    socialPreviewImage: String,
  },
  { timestamps: true }
);

export default mongoose.models.SEOSettings ||
  mongoose.model<ISEOSettings>("SEOSettings", seoSettingsSchema);


