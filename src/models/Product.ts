import mongoose, { Schema, Model } from "mongoose";
import { IProduct } from "@/types";

const VariantOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Size", "Scent"
    options: [VariantOptionSchema],
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    subCategory: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 5;
        },
        message: "Maximum 5 images allowed",
      },
    },
    variants: [VariantSchema],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    barcode: {
      type: String,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    seoTitle: {
      type: String,
    },
    seoDescription: {
      type: String,
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    restockThreshold: {
      type: Number,
      default: 10,
    },
    supplier: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (slug already indexed via unique: true)
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ name: "text", description: "text" }); // Full-text search
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ stock: 1 }); // For low stock alerts

// Auto-generate slug from name if not provided
ProductSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Auto-set SEO title if not provided
  if (!this.seoTitle) {
    this.seoTitle = `${this.name} | Dokimas Cosmetics`;
  }

  next();
});

// Virtual for discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for profit margin
ProductSchema.virtual("profitMargin").get(function () {
  if (this.costPrice) {
    return this.price - this.costPrice;
  }
  return 0;
});

// Method to check if product is low on stock
ProductSchema.methods.isLowStock = function (): boolean {
  return this.stock <= this.restockThreshold;
};

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;


