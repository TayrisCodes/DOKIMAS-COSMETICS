import mongoose, { Document, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Newsletter ||
  mongoose.model<INewsletter>("Newsletter", newsletterSchema);


