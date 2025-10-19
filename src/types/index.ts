import { Types } from "mongoose";

// User Types
export type UserRole = "customer" | "retail_manager" | "admin";

export interface IAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  emailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  image?: string;
  phone?: string;
  addresses: IAddress[];
  provider?: string;
  providerId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface IProductVariant {
  name: string;
  options: {
    value: string;
    priceModifier: number;
    stock: number;
    sku: string;
  }[];
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: string[];
  variants?: IProductVariant[];
  stock: number;
  sku: string;
  barcode?: string;
  ingredients?: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  restockThreshold: number;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type PaymentMethod = "cbe_birr" | "telebirr" | "stripe" | "cash" | "other";
export type PaymentStatus = "pending" | "under_review" | "approved" | "paid" | "rejected" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  image: string;
  variant?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IPaymentDetails {
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export interface IStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount: number;
  pointsUsed: number;
  pointsDiscount: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  paymentReference?: string;
  paymentDetails: IPaymentDetails;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  adminNotes?: string;
  statusHistory: IStatusHistory[];
  source: "online" | "pos";
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface ICartItem {
  productId: Types.ObjectId;
  variant?: string;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  couponCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Types
export type InventoryChangeType = "add" | "remove" | "sale" | "restock" | "adjustment";

export interface IInventoryLog {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  changeType: InventoryChangeType;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  orderId?: Types.ObjectId;
  reason?: string;
  performedBy: Types.ObjectId;
  location?: string;
  createdAt: Date;
}

// Review Types
export interface IReview {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  reported: boolean;
  isApproved: boolean;
  createdAt: Date;
}

// Coupon Types
export type CouponType = "percentage" | "fixed_amount";

export interface ICoupon {
  _id: Types.ObjectId;
  code: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  validFrom: Date;
  validUntil: Date;
  applicableProducts?: Types.ObjectId[];
  applicableCategories?: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

// Loyalty Types
export type LoyaltyTier = "bronze" | "silver" | "gold";
export type LoyaltyTransactionType = "earned" | "redeemed" | "expired";

export interface ILoyaltyTransaction {
  type: LoyaltyTransactionType;
  points: number;
  orderId?: Types.ObjectId;
  reason: string;
  createdAt: Date;
}

export interface ILoyaltyPoints {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  totalPoints: number;
  availablePoints: number;
  redeemedPoints: number;
  tier: LoyaltyTier;
  transactions: ILoyaltyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

// Blog Types
export type BlogStatus = "draft" | "published" | "scheduled";

export interface IBlogPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  author: Types.ObjectId;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  publishDate: Date;
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  readTime: number;
  relatedProducts?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType = "order_update" | "low_stock" | "new_review" | "promotion" | "system";

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// NextAuth Types Extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}


