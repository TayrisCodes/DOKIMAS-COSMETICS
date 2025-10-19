import mongoose, { Schema, Model } from "mongoose";
import { IInventoryLog } from "@/types";

const InventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    changeType: {
      type: String,
      enum: ["add", "remove", "sale", "restock", "adjustment"],
      required: true,
      index: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    reason: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      default: "Main Warehouse",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InventoryLogSchema.index({ productId: 1, createdAt: -1 });
InventoryLogSchema.index({ changeType: 1 });

const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog || mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);

export default InventoryLog;


