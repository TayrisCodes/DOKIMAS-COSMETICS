import mongoose, { Document, Schema } from "mongoose";

export interface IProductsQuery {
  type: "byIds" | "byQuery";
  ids?: mongoose.Types.ObjectId[];
  query?: Record<string, any>;
}

export interface ISection {
  key: string; // 'hero', 'about', 'featured_products', etc.
  title?: string;
  subtitle?: string;
  content?: string; // HTML/Markdown
  image?: string;
  ctaText?: string;
  ctaUrl?: string;
  productsQuery?: IProductsQuery;
  settings?: Record<string, any>;
  active?: boolean;
  meta?: Record<string, any>;
}

export interface ICMSPage extends Document {
  slug: string;
  title?: string;
  sections: ISection[];
  sectionsOrder: string[]; // ordered keys
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

const productsQuerySchema = new Schema(
  {
    type: { type: String, enum: ["byIds", "byQuery"], default: "byIds" },
    ids: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    query: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    key: { type: String, required: true },
    title: String,
    subtitle: String,
    content: String,
    image: String,
    ctaText: String,
    ctaUrl: String,
    productsQuery: productsQuerySchema,
    settings: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true, _id: true }
);

const cmsPageSchema = new Schema<ICMSPage>(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    sections: [sectionSchema],
    sectionsOrder: [String],
    isPublished: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

// Ensure sectionsOrder includes all section keys
cmsPageSchema.pre("save", function (next) {
  if (this.sections && this.sections.length > 0) {
    const sectionKeys = this.sections.map((s) => s.key);
    if (!this.sectionsOrder || this.sectionsOrder.length === 0) {
      this.sectionsOrder = sectionKeys;
    }
  }
  next();
});

export default mongoose.models.CMSPage ||
  mongoose.model<ICMSPage>("CMSPage", cmsPageSchema);


