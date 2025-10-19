import mongoose, { Schema, Model } from "mongoose";
import { IOrder } from "@/types";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    variant: { type: String },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: "Ethiopia" },
  },
  { _id: false }
);

const PaymentDetailsSchema = new Schema(
  {
    transactionId: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number, min: 0 },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "returned"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v: any[]) {
          return v.length > 0;
        },
        message: "Order must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pointsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    pointsDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cbe_birr", "telebirr", "stripe", "cash", "other"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "under_review", "approved", "paid", "rejected", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentProofUrl: {
      type: String, // Cloudinary URL of uploaded payment screenshot
    },
    paymentReference: {
      type: String, // Transaction ID or reference number
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      default: {},
    },
    orderStatus: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
      index: true,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: [],
    },
    source: {
      type: String,
      enum: ["online", "pos"],
      default: "online",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// Generate unique order number before saving
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `DKM-${year}-${String(count + 1).padStart(5, "0")}`;
  }

  // Add to status history on status change
  if (this.isModified("orderStatus")) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      updatedBy: this.userId, // In practice, should be the admin/manager who updated it
    });
  }

  next();
});

// Virtual for order age in days
OrderSchema.virtual("orderAge").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;


