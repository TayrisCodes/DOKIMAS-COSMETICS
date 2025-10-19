import mongoose, { Schema, Model } from "mongoose";

interface ISale {
  userId?: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  totalAmount: number;
  paymentStatus: "pending" | "approved" | "paid";
  paymentMethod?: string;
  source: "online" | "retail";
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    items: {
      type: [SaleItemSchema],
      required: true,
      validate: {
        validator: function (v: any[]) {
          return v.length > 0;
        },
        message: "Sale must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "approved", "paid"],
      default: "approved",
      index: true,
    },
    paymentMethod: {
      type: String,
    },
    source: {
      type: String,
      enum: ["online", "retail"],
      required: true,
      default: "online",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ source: 1, createdAt: -1 });
SaleSchema.index({ paymentStatus: 1, createdAt: -1 });

const Sale: Model<ISale> =
  mongoose.models.Sale || mongoose.model<ISale>("Sale", SaleSchema);

export default Sale;





