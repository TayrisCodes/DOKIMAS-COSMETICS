import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  author?: mongoose.Types.ObjectId;
  content?: string;
  excerpt?: string;
  image?: string;
  categories?: string[];
  tags?: string[];
  isPublished?: boolean;
  featureOnHomepage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: String,
    excerpt: String,
    image: String,
    categories: {
      type: [String],
      enum: [
        "product-education",
        "beauty-tips",
        "expert-advice",
        "routines",
        "brand-news",
      ],
      default: [],
    },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    featureOnHomepage: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
    publishedAt: Date,
  },
  { timestamps: true }
);

// Indexes (slug already indexed via unique: true)
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ featureOnHomepage: 1, isPublished: 1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ tags: 1 });

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", blogSchema);


