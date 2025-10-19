import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "@/types";

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
    },
    comment: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ productId: 1, isApproved: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: -1 });

// Update product rating after review is saved
ReviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const reviews = await mongoose.model("Review").find({
    productId: this.productId,
    isApproved: true,
  });

  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(this.productId, {
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });
  }
});

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;


