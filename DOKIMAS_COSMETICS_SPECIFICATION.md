# 🧴 DOKIMAS COSMETICS — Complete Technical Specification

> **Full-Stack E-Commerce Platform for Cosmetics Retail & Online Sales**  
> Next.js 15 + MongoDB + NextAuth + Cloudinary + Ethiopian Payment Integration

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [User Roles & Permissions](#user-roles--permissions)
4. [User Flows & Journeys](#user-flows--journeys)
5. [Feature Specifications](#feature-specifications)
6. [Database Schema](#database-schema)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [System Architecture](#system-architecture)
9. [Security & Authentication](#security--authentication)
10. [Automation & Smart Features](#automation--smart-features)
11. [Payment Integration](#payment-integration)
12. [Development Roadmap](#development-roadmap)
13. [Deployment Strategy](#deployment-strategy)

---

## 🎯 PROJECT OVERVIEW

### **What is Dokimas Cosmetics?**

A comprehensive e-commerce platform that unifies:
- **Online Store** — Customer-facing website for browsing and purchasing cosmetics
- **Admin Dashboard** — Complete business management (products, orders, inventory, analytics)
- **POS System** — Point-of-sale interface for physical retail shop operations
- **CRM & Automation** — Marketing tools, loyalty rewards, and customer engagement

### **Business Objectives**

1. ✅ Enable online sales 24/7 with automated order processing
2. ✅ Synchronize physical shop inventory with online stock in real-time
3. ✅ Provide data-driven insights through analytics dashboard
4. ✅ Automate marketing (abandoned carts, promotions, loyalty rewards)
5. ✅ Support local Ethiopian payment methods (CBE Birr, TeleBirr)
6. ✅ Scale to multiple retail locations in the future

### **Product Categories**

- Aftershave
- Body Oils
- Deodorants
- Facial Cleansers
- Moisturizers
- Serums & Treatments
- Gift Sets

---

## 🔧 TECHNOLOGY STACK

| Layer                  | Technology                                    | Purpose                                             |
|------------------------|-----------------------------------------------|-----------------------------------------------------|
| **Frontend**           | Next.js 15 (App Router)                       | UI, routing, SSR/ISR for SEO                        |
| **Backend**            | Next.js API Routes                            | RESTful APIs, business logic                        |
| **Database**           | MongoDB + Mongoose                            | NoSQL database for flexible schema                  |
| **Authentication**     | NextAuth.js (Credentials + Google OAuth)      | Secure session management with JWT                  |
| **UI Framework**       | Tailwind CSS + Shadcn/UI                      | Responsive, accessible component library            |
| **Animations**         | Framer Motion                                 | Smooth transitions and interactions                 |
| **File Storage**       | Cloudinary                                    | Image CDN with optimization                         |
| **Payment Gateways**   | CBE Birr, TeleBirr, Stripe                    | Local (Ethiopia) + International payments           |
| **Email Service**      | Nodemailer + Resend API                       | Transactional emails (orders, notifications)        |
| **Deployment**         | Vercel (Frontend/API) + MongoDB Atlas (DB)    | Cloud hosting with edge functions                   |
| **Monitoring**         | Vercel Analytics + Sentry                     | Performance tracking and error logging              |

### **Why This Stack?**

- **Next.js 15**: Latest features (Server Actions, React Server Components) + SEO optimization
- **MongoDB**: Flexible schema evolution as business grows (multi-location, B2B portal)
- **Cloudinary**: Automatic image optimization (WebP conversion, lazy loading)
- **Ethiopian Payments**: Critical for local market adoption (70% mobile money usage)

---

## 👥 USER ROLES & PERMISSIONS

### **Role Hierarchy**

```
Admin (Full Control)
    ↓
Retail Manager (POS + Limited Inventory)
    ↓
Customer (Shopping + Orders)
    ↓
Visitor (Browse Only)
```

### **Permission Matrix**

| Feature                      | Visitor | Customer | Retail Manager | Admin |
|------------------------------|---------|----------|----------------|-------|
| View Products                | ✅      | ✅       | ✅             | ✅    |
| Add to Cart                  | ❌      | ✅       | ✅             | ✅    |
| Checkout & Pay               | ❌      | ✅       | ✅             | ✅    |
| View Order History           | ❌      | ✅ (Own) | ✅ (All)       | ✅    |
| Manage Products              | ❌      | ❌       | ❌             | ✅    |
| Update Stock                 | ❌      | ❌       | ✅ (Limited)   | ✅    |
| POS Sales Entry              | ❌      | ❌       | ✅             | ✅    |
| View Analytics               | ❌      | ❌       | ✅ (Limited)   | ✅    |
| Manage Users & Roles         | ❌      | ❌       | ❌             | ✅    |
| CMS (Blog, Banners)          | ❌      | ❌       | ❌             | ✅    |
| Site Configuration           | ❌      | ❌       | ❌             | ✅    |

---

## 🧭 USER FLOWS & JOURNEYS

### **1. VISITOR (Guest) Flow**

**Goal:** Browse products, learn about brand, convert to registered customer

#### **Step-by-Step Journey**

```mermaid
graph TD
    A[Land on Homepage] --> B[View Hero Banner + Featured Products]
    B --> C{Action?}
    C -->|Browse| D[Go to /shop]
    C -->|Learn| E[Read Blog Articles]
    C -->|Search| F[Use Search Bar]
    D --> G[Filter by Category/Price]
    G --> H[Click Product]
    H --> I[View Product Details]
    I --> J{Add to Cart?}
    J -->|Yes| K[Prompted to Login/Register]
    J -->|No| L[Continue Browsing]
    K --> M[Create Account]
    M --> N[Cart Saved & Synced]
```

#### **Key Features**
- ✨ Dynamic hero slider with promotional banners
- 🔍 Real-time search with autocomplete
- 🏷️ Filter by: Category, Price Range, Brand, Rating
- 📱 Mobile-optimized product cards with quick view
- 🌐 SEO-optimized URLs (`/product/luxury-shea-body-oil`)
- 💬 Social proof (reviews, ratings visible)

#### **Conversion Triggers**
- **Exit Intent Popup**: "Get 10% off your first order — Sign up now!"
- **Cart Persistence Message**: "Create account to save your cart across devices"
- **Email Capture**: Newsletter signup at footer for exclusive deals

---

### **2. CUSTOMER Flow**

**Goal:** Shop seamlessly, track orders, earn rewards, manage profile

#### **Step-by-Step Journey**

```mermaid
graph TD
    A[Register/Login] --> B[Email Verification]
    B --> C[Access Dashboard /dashboard/customer]
    C --> D[View: Orders, Rewards, Favorites]
    D --> E[Browse Shop]
    E --> F[Add Items to Cart]
    F --> G{Ready to Checkout?}
    G -->|No| E
    G -->|Yes| H[Go to /checkout]
    H --> I[Enter Shipping Address]
    I --> J[Select Payment Method]
    J --> K{Payment Type?}
    K -->|CBE Birr| L[CBE Payment Gateway]
    K -->|TeleBirr| M[TeleBirr SDK]
    K -->|Stripe| N[Card Payment]
    L --> O[Payment Confirmation]
    M --> O
    N --> O
    O --> P[Order Created in DB]
    P --> Q[Confirmation Email Sent]
    Q --> R[Loyalty Points Added]
    R --> S[Track Order Status]
    S --> T{Order Delivered?}
    T -->|Yes| U[Leave Review]
    T -->|No| S
```

#### **Dashboard Components**

**Customer Dashboard (`/dashboard/customer`)**
```
┌─────────────────────────────────────────┐
│  Welcome back, [Customer Name]!         │
├─────────────────────────────────────────┤
│  📦 Total Orders: 12                    │
│  🎁 Reward Points: 450 (Next reward: 50)│
│  ❤️  Wishlist Items: 3                   │
├─────────────────────────────────────────┤
│  Recent Orders                          │
│  ┌─────────────────────────────────┐   │
│  │ #12345 - Delivered - $45.00     │   │
│  │ [View Invoice] [Reorder]        │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  Favorite Products                      │
│  [Product Card] [Product Card]          │
└─────────────────────────────────────────┘
```

#### **Key Features**

| Category           | Feature                          | Description                                      |
|--------------------|----------------------------------|--------------------------------------------------|
| **Authentication** | Email + Google OAuth             | NextAuth.js with email verification              |
| **Cart**           | Persistent across devices        | localStorage + DB sync                           |
| **Checkout**       | Multi-step form                  | Address → Payment → Confirmation                 |
| **Payment**        | 3 Gateway Options                | CBE Birr, TeleBirr, Stripe (auto-detect region)  |
| **Orders**         | Real-time tracking               | Status: Pending → Processing → Shipped → Delivered |
| **Rewards**        | Loyalty Points System            | Earn 1 point per 10 ETB spent                    |
| **Wishlist**       | Save favorites                   | Quick add to cart from wishlist                  |
| **Notifications**  | Email + In-app alerts            | Order updates, promotions, low stock alerts      |
| **Profile**        | Account management               | Edit info, change password, saved addresses      |

#### **Cart Logic Flow**

```javascript
// Cart State Management
Guest User:
  - Add to cart → Stored in localStorage
  - Register/Login → Migrate cart to DB via API call
  
Registered User:
  - Add to cart → Immediate DB sync
  - Cart persists across: Web, Mobile, Multiple browsers
  
Cart Operations:
  - Add item → Check stock availability first
  - Update quantity → Re-validate stock
  - Remove item → Update total price
  - Apply coupon → Validate code & calculate discount
```

---

### **3. RETAIL MANAGER Flow**

**Goal:** Process in-store sales via POS, manage shop inventory, generate reports

#### **Step-by-Step Journey**

```mermaid
graph TD
    A[Login to /dashboard/retail] --> B[POS Dashboard Loads]
    B --> C{Customer at Counter?}
    C -->|Yes| D[Search Product by Name/Barcode]
    D --> E[Add to POS Cart]
    E --> F[Customer Adds More Items?]
    F -->|Yes| D
    F -->|No| G[Calculate Total]
    G --> H[Customer Pays Cash/Card]
    H --> I[Record Sale in System]
    I --> J[Update Stock Automatically]
    J --> K[Print Receipt Option]
    K --> L[Sale Complete]
    L --> M{End of Day?}
    M -->|No| C
    M -->|Yes| N[Generate Daily Sales Report]
    N --> O[View Dashboard Analytics]
    O --> P[Check Low Stock Alerts]
    P --> Q[Request Restock from Admin]
```

#### **POS Interface Design**

**Retail Manager Dashboard (`/dashboard/retail`)**
```
┌────────────────────────────────────────────────────┐
│  🏪 POS TERMINAL                    [Date: Oct 15] │
├────────────────────────────────────────────────────┤
│  🔍 Search Product: [____________] [Scan Barcode]  │
├────────────────────────────────────────────────────┤
│  CURRENT SALE                                      │
│  ┌──────────────────────────────────────────────┐ │
│  │ Shea Body Oil    x2    $20.00    🗑️         │ │
│  │ Facial Cleanser  x1    $15.00    🗑️         │ │
│  │                                               │ │
│  │ TOTAL: $35.00                                 │ │
│  └──────────────────────────────────────────────┘ │
│  [💳 Complete Sale] [🔄 Clear Cart]               │
├────────────────────────────────────────────────────┤
│  TODAY'S STATS                                     │
│  💰 Sales: $450  |  📦 Items Sold: 34  |  🧾 Orders: 12 │
├────────────────────────────────────────────────────┤
│  ⚠️  LOW STOCK ALERTS                              │
│  • Aftershave Lotion (5 left)                      │
│  • Deodorant Stick (3 left)                        │
└────────────────────────────────────────────────────┘
```

#### **Key Features**

| Category            | Feature                        | Description                                  |
|---------------------|--------------------------------|----------------------------------------------|
| **POS Interface**   | Quick sale entry               | Barcode scanner + manual search              |
| **Inventory Sync**  | Real-time stock updates        | Every sale instantly decrements stock        |
| **Offline Mode**    | Queue sales locally            | Sync when internet restored                  |
| **Daily Reports**   | Auto-generated summaries       | Sales by hour, top products, payment methods |
| **Stock Alerts**    | Low inventory notifications    | Visual alerts + email to admin               |
| **Multi-Staff**     | Shift tracking                 | Each manager has unique login                |
| **Receipt Print**   | Thermal printer support        | HTML template → Print API                    |

#### **Inventory Management Access**

- ✅ **View Stock Levels**: Real-time for all products
- ✅ **Update Stock**: Limited to adding received shipments
- ✅ **Request Restock**: Sends notification to admin for approval
- ❌ **Delete Products**: Admin-only permission
- ❌ **Change Prices**: Admin-only permission

---

### **4. ADMIN Flow**

**Goal:** Full platform control — products, orders, users, analytics, content

#### **Step-by-Step Journey**

```mermaid
graph TD
    A[Login to /dashboard/admin] --> B[View Analytics Dashboard]
    B --> C{What to Manage?}
    C -->|Products| D[Go to Product Management]
    C -->|Orders| E[Go to Order Management]
    C -->|Users| F[Go to User Management]
    C -->|Content| G[Go to CMS]
    C -->|Settings| H[Go to Configuration]
    
    D --> D1[Add New Product]
    D1 --> D2[Upload Images to Cloudinary]
    D2 --> D3[Set Price, Category, Stock]
    D3 --> D4[Publish Product]
    
    E --> E1[View All Orders]
    E1 --> E2[Filter by Status/Date]
    E2 --> E3[Update Order Status]
    E3 --> E4[Send Notification to Customer]
    
    F --> F1[View All Users]
    F1 --> F2[Change User Role]
    F2 --> F3[Deactivate/Delete User]
    
    G --> G1[Create Blog Post]
    G1 --> G2[Update Homepage Banners]
    G2 --> G3[Manage Promotions]
    
    H --> H1[Configure Payment Keys]
    H1 --> H2[Update SMTP Settings]
    H2 --> H3[Manage API Integrations]
```

#### **Admin Dashboard Components**

**Main Dashboard (`/dashboard/admin`)**
```
┌─────────────────────────────────────────────────────────┐
│  📊 DOKIMAS COSMETICS — Admin Dashboard                 │
├─────────────────────────────────────────────────────────┤
│  TODAY'S OVERVIEW                                       │
│  💰 Revenue: $1,234  📦 Orders: 45  👥 New Users: 12    │
├─────────────────────────────────────────────────────────┤
│  SALES TREND (Last 7 Days)                              │
│  [📈 Line Chart: Revenue by Day]                        │
├─────────────────────────────────────────────────────────┤
│  TOP PRODUCTS                    |  LOW STOCK ALERTS    │
│  1. Shea Body Oil ($890)         |  ⚠️ Aftershave (2)   │
│  2. Facial Cleanser ($670)       |  ⚠️ Deodorant (5)    │
│  3. Moisturizer ($540)           |  ⚠️ Face Serum (3)   │
├─────────────────────────────────────────────────────────┤
│  RECENT ORDERS                                          │
│  #12345 - John Doe - $45 - [Mark as Shipped]            │
│  #12344 - Jane Smith - $78 - [View Details]             │
└─────────────────────────────────────────────────────────┘
```

#### **Module Access**

**1. Product Management** (`/dashboard/admin/products`)
- ➕ **Add Product**: Multi-step form with image upload
- ✏️ **Edit Product**: Update details, pricing, inventory
- 🗑️ **Delete Product**: Soft delete (mark as inactive)
- 📸 **Media Management**: Cloudinary integration
- 🏷️ **Category Management**: Create, edit, delete categories
- 🔄 **Bulk Actions**: Import/export via CSV

**2. Order Management** (`/dashboard/admin/orders`)
- 📋 **View All Orders**: Sortable table with filters
- 🔍 **Order Details**: Customer info, items, payment status
- 🚚 **Update Status**: Dropdown to change order stage
- 💸 **Refund Processing**: Partial or full refunds
- 📧 **Customer Communication**: Send status update emails
- 📊 **Export Orders**: Download as Excel/PDF

**3. Inventory Control** (`/dashboard/admin/inventory`)
- 📦 **Stock Levels**: Real-time view of all products
- ⚠️ **Low Stock Alerts**: Configurable threshold alerts
- 📈 **Stock History**: InventoryLog timeline
- 🔄 **Restock Orders**: Create purchase orders
- 📍 **Multi-Location** (Future): Manage stock by branch

**4. User & Role Management** (`/dashboard/admin/users`)
- 👥 **All Users Table**: Filter by role, status, join date
- 🔐 **Role Assignment**: Promote to Retail Manager/Admin
- 🚫 **Deactivate Users**: Suspend accounts
- 📊 **User Activity**: Login history, order count
- 🔑 **Password Reset**: Admin-initiated reset

**5. CRM & Marketing** (`/dashboard/admin/marketing`)
- 🎁 **Coupon Manager**: Create discount codes with rules
- 💌 **Email Campaigns**: Send promotional emails
- 🏆 **Loyalty Settings**: Configure point earning rates
- 🛒 **Abandoned Carts**: View and recover lost sales
- 📊 **Customer Insights**: Purchase patterns, LTV

**6. CMS (Content Management)** (`/dashboard/admin/cms`)
- ✍️ **Blog Editor**: Rich text editor for articles
- 🎨 **Homepage Banners**: Upload hero images
- 🏷️ **Promotions**: Featured products, sale badges
- 🔍 **SEO Manager**: Meta tags, Open Graph settings

**7. Analytics & Reports** (`/dashboard/admin/analytics`)
- 📊 **Sales Dashboard**: Revenue trends, comparisons
- 🏆 **Product Performance**: Best/worst sellers
- 👥 **Customer Analytics**: Retention, acquisition
- 📈 **Growth Metrics**: MoM growth, conversion rates
- 📥 **Export Reports**: Automated weekly/monthly PDFs

**8. Configuration** (`/dashboard/admin/settings`)
- 🌐 **Site Settings**: Name, logo, contact info
- 💳 **Payment Gateways**: API keys for CBE/TeleBirr/Stripe
- 📧 **SMTP Configuration**: Email sending credentials
- 🔒 **Security**: JWT secret, session duration
- 🔔 **Notifications**: Configure alert triggers

---

## 📦 FEATURE SPECIFICATIONS

### **Core Features by Module**

#### **1. Authentication System**

**Features:**
- ✅ Email/Password registration with validation
- ✅ Google OAuth integration (NextAuth provider)
- ✅ Email verification (6-digit code sent via Nodemailer)
- ✅ Password reset flow (time-limited token)
- ✅ Session management (JWT stored in HTTP-only cookies)
- ✅ Role-based access control middleware
- ✅ Account deactivation/deletion

**Security:**
- Passwords hashed with bcrypt (10 salt rounds)
- Rate limiting: 5 login attempts per 15 minutes
- CSRF protection via NextAuth
- XSS prevention with input sanitization

---

#### **2. Product Catalog**

**Features:**
- ✅ Multi-image upload (max 5 per product)
- ✅ Product variants (size, scent) support
- ✅ Category & tag taxonomy
- ✅ Inventory tracking per variant
- ✅ SEO-friendly slugs (auto-generated)
- ✅ Product reviews & ratings
- ✅ Related products algorithm
- ✅ Recently viewed products

**Technical Details:**
```javascript
// Product Data Structure
{
  _id: ObjectId,
  name: "Luxury Shea Body Oil",
  slug: "luxury-shea-body-oil",
  category: "Body Oils",
  description: "Rich moisturizing oil...",
  price: 450, // ETB
  compareAtPrice: 600, // Show discount
  images: [
    "https://res.cloudinary.com/dokimas/image/upload/v1/products/abc123.jpg"
  ],
  variants: [
    { size: "50ml", stock: 20 },
    { size: "100ml", stock: 15 }
  ],
  ingredients: ["Shea Butter", "Vitamin E"],
  isActive: true,
  seoTitle: "Luxury Shea Body Oil | Dokimas Cosmetics",
  seoDescription: "Nourish your skin...",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

#### **3. Shopping Cart**

**Features:**
- ✅ Persistent cart (localStorage + DB)
- ✅ Guest cart migration on login
- ✅ Quantity adjustment with stock validation
- ✅ Auto-remove out-of-stock items
- ✅ Coupon code application
- ✅ Shipping cost calculation
- ✅ Cart abandonment tracking

**Cart Sync Logic:**
```
User Action → Update localStorage → Debounced API call → Update MongoDB
│
├─ If offline: Queue for sync
└─ On login: Merge guest cart with user cart
```

---

#### **4. Checkout & Payment**

**Features:**
- ✅ Multi-step checkout form (Address → Payment → Review)
- ✅ Saved addresses for returning customers
- ✅ Payment method selection (CBE Birr, TeleBirr, Stripe)
- ✅ Order summary with final price
- ✅ Terms & conditions acceptance
- ✅ Payment webhook handling
- ✅ Order confirmation email

**Payment Flow:**
```mermaid
graph LR
    A[Customer Clicks Pay] --> B{Payment Method?}
    B -->|CBE Birr| C[Redirect to CBE Gateway]
    B -->|TeleBirr| D[TeleBirr SDK Modal]
    B -->|Stripe| E[Stripe Checkout]
    C --> F[Payment Webhook]
    D --> F
    E --> F
    F --> G[Update Order Status]
    G --> H[Send Confirmation Email]
    H --> I[Award Loyalty Points]
    I --> J[Update Inventory]
```

**Supported Payment Methods:**

| Method       | Region        | Currency | Integration Type |
|--------------|---------------|----------|------------------|
| CBE Birr     | Ethiopia      | ETB      | API Redirect     |
| TeleBirr     | Ethiopia      | ETB      | SDK (Modal)      |
| Stripe       | International | USD, EUR | Checkout Session |

---

#### **5. Order Management**

**Features:**
- ✅ Order status pipeline (6 stages)
- ✅ Customer order tracking page
- ✅ Admin order status updates
- ✅ Automated status emails
- ✅ Invoice generation (PDF)
- ✅ Refund processing
- ✅ Order cancellation (within 24hrs)

**Order Status Flow:**
```
Pending (Payment awaited)
    ↓
Paid (Payment confirmed)
    ↓
Processing (Admin preparing)
    ↓
Shipped (In transit)
    ↓
Delivered (Customer received)
    ↓
Completed (Review requested)
    ↓
[Optional: Returned/Refunded]
```

---

#### **6. Inventory Management**

**Features:**
- ✅ Real-time stock tracking
- ✅ Low stock alerts (configurable threshold)
- ✅ Stock history logs (InventoryLog collection)
- ✅ Auto-reorder suggestions
- ✅ Batch stock updates (CSV import)
- ✅ Multi-location support (future)
- ✅ Stock reservation during checkout (15min hold)

**Inventory Logic:**
```javascript
// When order is placed
1. Check stock availability
2. If available: Reserve stock (order.status = 'pending')
3. If payment successful within 15min: Deduct stock permanently
4. If payment fails/timeout: Release reservation
5. Log all changes in InventoryLog collection
```

---

#### **7. POS (Point of Sale) System**

**Features:**
- ✅ Barcode scanner integration
- ✅ Quick product search
- ✅ Cash/card payment recording
- ✅ Receipt printing (HTML template)
- ✅ Daily sales reconciliation
- ✅ Shift management
- ✅ Offline mode with sync queue

**POS Workflow:**
```
Retail Manager Login
    ↓
Start Shift (records start time)
    ↓
Process Sales (scan/search products)
    ↓
Record Payment (cash/card)
    ↓
Update Stock (auto-sync)
    ↓
End Shift (generates shift report)
```

---

#### **8. Loyalty & Rewards**

**Features:**
- ✅ Points earning (1 point per 10 ETB)
- ✅ Tier system (Bronze → Silver → Gold)
- ✅ Points redemption (100 points = 10 ETB discount)
- ✅ Birthday rewards (auto-email)
- ✅ Referral program (share link → earn points)
- ✅ Rewards dashboard

**Loyalty Tiers:**

| Tier     | Requirement     | Benefits                          |
|----------|-----------------|-----------------------------------|
| Bronze   | 0-1000 points   | 1x points, standard shipping      |
| Silver   | 1001-5000       | 1.5x points, free shipping        |
| Gold     | 5001+           | 2x points, exclusive early access |

---

#### **9. CRM & Marketing Automation**

**Features:**
- ✅ Customer segmentation (new, active, at-risk, VIP)
- ✅ Automated email campaigns:
  - Welcome series (new customers)
  - Abandoned cart recovery (24hrs after abandon)
  - Post-purchase follow-up (5 days after delivery)
  - Re-engagement (60 days inactive)
- ✅ Coupon management (time-limited, usage-limited)
- ✅ Customer activity timeline
- ✅ RFM analysis (Recency, Frequency, Monetary)

**Email Templates:**
```
📧 Welcome Email → Sent immediately after registration
📧 Order Confirmation → Sent after successful payment
📧 Shipping Update → Sent when order status = 'shipped'
📧 Delivery Confirmation → Sent when status = 'delivered'
📧 Review Request → Sent 3 days after delivery
📧 Abandoned Cart → Sent 24hrs after cart created
📧 Win-back Campaign → Sent to inactive users (60+ days)
```

---

#### **10. Analytics Dashboard**

**Features:**
- ✅ Real-time sales metrics
- ✅ Revenue charts (daily, weekly, monthly)
- ✅ Product performance analysis
- ✅ Customer lifetime value (LTV)
- ✅ Conversion funnel tracking
- ✅ Geographic sales distribution
- ✅ Export to Excel/PDF

**Key Metrics Tracked:**

| Metric                  | Description                              | Calculation                          |
|-------------------------|------------------------------------------|--------------------------------------|
| Total Revenue           | Sum of all completed orders              | `SUM(orders.totalAmount)`            |
| Average Order Value     | Revenue per order                        | `Total Revenue / Order Count`        |
| Conversion Rate         | Visitors who purchase                    | `Orders / Unique Visitors * 100`     |
| Customer Acquisition    | Cost to acquire new customer             | `Marketing Spend / New Customers`    |
| Repeat Customer Rate    | % of customers with 2+ orders            | `Repeat Customers / Total * 100`     |
| Product Sell-Through    | % of stock sold                          | `Units Sold / Initial Stock * 100`   |
| Cart Abandonment Rate   | % of carts not converted                 | `Abandoned Carts / Total Carts`      |

---

#### **11. CMS (Content Management)**

**Features:**
- ✅ Blog post creation (Markdown + Rich Text Editor)
- ✅ Image upload via Cloudinary
- ✅ SEO optimization (meta tags, slugs)
- ✅ Category management
- ✅ Draft/Publish workflow
- ✅ Scheduled publishing
- ✅ Homepage banner management
- ✅ Featured products carousel

**Blog Post Structure:**
```javascript
{
  _id: ObjectId,
  title: "10 Benefits of Shea Butter for Skin",
  slug: "benefits-of-shea-butter",
  author: ObjectId (User),
  content: "Markdown content...",
  excerpt: "Discover the amazing...",
  featuredImage: "cloudinary_url",
  category: "Skincare Tips",
  tags: ["shea butter", "skincare", "natural"],
  seoTitle: "10 Proven Benefits of Shea Butter | Dokimas",
  seoDescription: "Learn how shea butter...",
  status: "published", // draft, published, scheduled
  publishDate: ISODate,
  views: 1245,
  readTime: 5 // minutes
}
```

---

## 🗄️ DATABASE SCHEMA

### **Collections & Relationships**

#### **1. Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  role: Enum ['customer', 'retail_manager', 'admin'],
  emailVerified: Boolean,
  image: String, // Avatar URL
  phone: String,
  addresses: [
    {
      label: String, // "Home", "Work"
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: Boolean
    }
  ],
  provider: String, // "credentials", "google"
  providerId: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })
```

---

#### **2. Products Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique, indexed),
  category: String,
  subCategory: String,
  description: String,
  price: Number,
  compareAtPrice: Number, // Original price for discount display
  costPrice: Number, // For profit margin calculation
  images: [String], // Cloudinary URLs
  variants: [
    {
      name: String, // "Size", "Scent"
      options: [
        {
          value: String, // "50ml", "Lavender"
          priceModifier: Number, // +50 ETB for 100ml
          stock: Number,
          sku: String
        }
      ]
    }
  ],
  stock: Number, // Total stock if no variants
  sku: String,
  barcode: String,
  ingredients: [String],
  tags: [String],
  isActive: Boolean,
  isFeatured: Boolean,
  seoTitle: String,
  seoDescription: String,
  metaKeywords: [String],
  averageRating: Number,
  reviewCount: Number,
  soldCount: Number,
  viewCount: Number,
  restockThreshold: Number, // Alert when stock < this
  supplier: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.products.createIndex({ slug: 1 })
db.products.createIndex({ category: 1, isActive: 1 })
db.products.createIndex({ name: "text", description: "text" }) // Full-text search
```

---

#### **3. Orders Collection**
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, e.g., "DKM-2024-00001"),
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId (ref: Product),
      name: String, // Snapshot at time of purchase
      image: String,
      variant: String, // "50ml - Lavender"
      quantity: Number,
      price: Number, // Price at time of purchase
      subtotal: Number
    }
  ],
  subtotal: Number,
  discount: Number,
  couponCode: String,
  shippingCost: Number,
  tax: Number,
  totalAmount: Number,
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: Enum ['cbe_birr', 'telebirr', 'stripe'],
  paymentStatus: Enum ['pending', 'paid', 'failed', 'refunded'],
  paymentDetails: {
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  orderStatus: Enum [
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
  ],
  trackingNumber: String,
  notes: String, // Customer notes
  adminNotes: String, // Internal notes
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      updatedBy: ObjectId (ref: User)
    }
  ],
  source: Enum ['online', 'pos'], // Online store or physical shop
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ orderNumber: 1 })
db.orders.createIndex({ orderStatus: 1 })
db.orders.createIndex({ paymentStatus: 1 })
```

---

#### **4. InventoryLog Collection**
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  changeType: Enum ['add', 'remove', 'sale', 'restock', 'adjustment'],
  quantityBefore: Number,
  quantityChange: Number,
  quantityAfter: Number,
  orderId: ObjectId (ref: Order), // If related to sale
  reason: String,
  performedBy: ObjectId (ref: User),
  location: String, // "Warehouse", "Store A" (future multi-location)
  createdAt: Date
}

// Indexes
db.inventoryLog.createIndex({ productId: 1, createdAt: -1 })
db.inventoryLog.createIndex({ changeType: 1 })
```

---

#### **5. Reviews Collection**
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  orderId: ObjectId (ref: Order), // Verified purchase
  rating: Number (1-5),
  title: String,
  comment: String,
  images: [String], // Customer uploaded images
  isVerifiedPurchase: Boolean,
  helpful: Number, // Upvote count
  reported: Boolean,
  isApproved: Boolean, // Admin moderation
  createdAt: Date
}

// Indexes
db.reviews.createIndex({ productId: 1, isApproved: 1 })
db.reviews.createIndex({ userId: 1 })
```

---

#### **6. Carts Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User), // null for guest carts
  sessionId: String, // For guest cart tracking
  items: [
    {
      productId: ObjectId (ref: Product),
      variant: String,
      quantity: Number,
      price: Number // Snapshot of current price
    }
  ],
  couponCode: String,
  subtotal: Number,
  discount: Number,
  total: Number,
  expiresAt: Date, // Auto-delete abandoned carts after 30 days
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.carts.createIndex({ userId: 1 })
db.carts.createIndex({ sessionId: 1 })
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index
```

---

#### **7. Coupons Collection**
```javascript
{
  _id: ObjectId,
  code: String (unique, uppercase),
  type: Enum ['percentage', 'fixed_amount'],
  value: Number, // 10 (for 10%) or 50 (for 50 ETB off)
  minPurchase: Number,
  maxDiscount: Number, // Cap for percentage discounts
  usageLimit: Number, // Total uses allowed
  usageCount: Number, // Current usage count
  perUserLimit: Number,
  validFrom: Date,
  validUntil: Date,
  applicableProducts: [ObjectId], // Specific products (empty = all)
  applicableCategories: [String], // Specific categories
  isActive: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}

// Indexes
db.coupons.createIndex({ code: 1 })
```

---

#### **8. LoyaltyPoints Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  totalPoints: Number,
  availablePoints: Number, // Total - redeemed
  redeemedPoints: Number,
  tier: Enum ['bronze', 'silver', 'gold'],
  transactions: [
    {
      type: Enum ['earned', 'redeemed', 'expired'],
      points: Number,
      orderId: ObjectId (ref: Order),
      reason: String,
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.loyaltyPoints.createIndex({ userId: 1 })
```

---

#### **9. BlogPosts Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  author: ObjectId (ref: User),
  content: String, // Markdown or HTML
  excerpt: String,
  featuredImage: String,
  category: String,
  tags: [String],
  status: Enum ['draft', 'published', 'scheduled'],
  publishDate: Date,
  seoTitle: String,
  seoDescription: String,
  views: Number,
  readTime: Number, // Minutes
  relatedProducts: [ObjectId (ref: Product)],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.blogPosts.createIndex({ slug: 1 })
db.blogPosts.createIndex({ status: 1, publishDate: -1 })
db.blogPosts.createIndex({ title: "text", content: "text" })
```

---

#### **10. Notifications Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: Enum [
    'order_update',
    'low_stock',
    'new_review',
    'promotion',
    'system'
  ],
  title: String,
  message: String,
  link: String, // URL to relevant page
  isRead: Boolean,
  createdAt: Date
}

// Indexes
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
```

---

### **Entity Relationship Diagram**

```
User (1) ───< (many) Order
User (1) ───< (many) Review
User (1) ───< (1) Cart
User (1) ───< (1) LoyaltyPoints
User (1) ───< (many) BlogPost (as author)
User (1) ───< (many) Notification

Product (1) ───< (many) OrderItem (embedded in Order)
Product (1) ───< (many) Review
Product (1) ───< (many) InventoryLog
Product (1) ───< (many) CartItem (embedded in Cart)

Order (1) ───> (many) InventoryLog (via orderId)
Order (1) ───< (many) Review (verified purchases)
```

---

## 🔌 API ENDPOINTS REFERENCE

### **Authentication Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/auth/register`          | User registration            | No            | Public    |
| POST   | `/api/auth/login`             | User login                   | No            | Public    |
| POST   | `/api/auth/verify-email`      | Email verification           | No            | Public    |
| POST   | `/api/auth/forgot-password`   | Password reset request       | No            | Public    |
| POST   | `/api/auth/reset-password`    | Reset password with token    | No            | Public    |
| GET    | `/api/auth/session`           | Get current session          | Yes           | All       |
| POST   | `/api/auth/logout`            | Logout user                  | Yes           | All       |

---

### **User Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/users/me`               | Get current user profile     | Yes           | All       |
| PUT    | `/api/users/me`               | Update profile               | Yes           | All       |
| POST   | `/api/users/me/avatar`        | Upload avatar                | Yes           | All       |
| GET    | `/api/users/me/addresses`     | Get saved addresses          | Yes           | Customer  |
| POST   | `/api/users/me/addresses`     | Add new address              | Yes           | Customer  |
| PUT    | `/api/users/me/addresses/:id` | Update address               | Yes           | Customer  |
| DELETE | `/api/users/me/addresses/:id` | Delete address               | Yes           | Customer  |
| GET    | `/api/users`                  | Get all users (admin)        | Yes           | Admin     |
| PUT    | `/api/users/:id/role`         | Change user role             | Yes           | Admin     |
| DELETE | `/api/users/:id`              | Deactivate user              | Yes           | Admin     |

---

### **Product Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/products`               | Get all products (with filters) | No         | Public    |
| GET    | `/api/products/:slug`         | Get product by slug          | No            | Public    |
| GET    | `/api/products/:id/reviews`   | Get product reviews          | No            | Public    |
| POST   | `/api/products`               | Create product               | Yes           | Admin     |
| PUT    | `/api/products/:id`           | Update product               | Yes           | Admin     |
| DELETE | `/api/products/:id`           | Delete product               | Yes           | Admin     |
| POST   | `/api/products/:id/images`    | Upload product images        | Yes           | Admin     |
| GET    | `/api/products/category/:cat` | Get products by category     | No            | Public    |
| GET    | `/api/products/search`        | Search products              | No            | Public    |

---

### **Cart Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/cart`                   | Get user cart                | Yes           | Customer  |
| POST   | `/api/cart/add`               | Add item to cart             | Yes           | Customer  |
| PUT    | `/api/cart/update/:itemId`    | Update cart item quantity    | Yes           | Customer  |
| DELETE | `/api/cart/remove/:itemId`    | Remove item from cart        | Yes           | Customer  |
| POST   | `/api/cart/apply-coupon`      | Apply coupon code            | Yes           | Customer  |
| DELETE | `/api/cart/clear`             | Clear entire cart            | Yes           | Customer  |
| POST   | `/api/cart/migrate`           | Migrate guest cart to user   | Yes           | Customer  |

---

### **Order Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/orders`                 | Create order (checkout)      | Yes           | Customer  |
| GET    | `/api/orders`                 | Get user orders              | Yes           | Customer  |
| GET    | `/api/orders/:id`             | Get order details            | Yes           | Customer  |
| GET    | `/api/orders/:id/invoice`     | Download invoice PDF         | Yes           | Customer  |
| POST   | `/api/orders/:id/cancel`      | Cancel order                 | Yes           | Customer  |
| GET    | `/api/admin/orders`           | Get all orders (admin)       | Yes           | Admin/Mgr |
| PUT    | `/api/admin/orders/:id/status`| Update order status          | Yes           | Admin/Mgr |
| POST   | `/api/admin/orders/:id/refund`| Process refund               | Yes           | Admin     |

---

### **Payment Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/payments/initiate`      | Initiate payment             | Yes           | Customer  |
| POST   | `/api/payments/webhook/cbe`   | CBE Birr webhook             | No            | System    |
| POST   | `/api/payments/webhook/telebirr` | TeleBirr webhook          | No            | System    |
| POST   | `/api/payments/webhook/stripe`| Stripe webhook               | No            | System    |
| GET    | `/api/payments/:id/status`    | Check payment status         | Yes           | Customer  |

---

### **Inventory Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/inventory`              | Get all inventory            | Yes           | Admin/Mgr |
| GET    | `/api/inventory/low-stock`    | Get low stock alerts         | Yes           | Admin/Mgr |
| POST   | `/api/inventory/update`       | Update stock manually        | Yes           | Admin     |
| GET    | `/api/inventory/:id/history`  | Get stock history            | Yes           | Admin/Mgr |
| POST   | `/api/inventory/restock`      | Create restock request       | Yes           | Mgr       |

---

### **POS Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/pos/sale`               | Record POS sale              | Yes           | Mgr       |
| GET    | `/api/pos/daily-report`       | Get daily sales report       | Yes           | Mgr       |
| POST   | `/api/pos/shift/start`        | Start work shift             | Yes           | Mgr       |
| POST   | `/api/pos/shift/end`          | End work shift               | Yes           | Mgr       |
| GET    | `/api/pos/products/search`    | Quick product search         | Yes           | Mgr       |

---

### **Review Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/reviews`                | Create review                | Yes           | Customer  |
| GET    | `/api/reviews/product/:id`    | Get product reviews          | No            | Public    |
| PUT    | `/api/reviews/:id`            | Update review                | Yes           | Customer  |
| DELETE | `/api/reviews/:id`            | Delete review                | Yes           | Customer  |
| POST   | `/api/reviews/:id/helpful`    | Mark review helpful          | Yes           | Customer  |
| PUT    | `/api/admin/reviews/:id/approve` | Approve review            | Yes           | Admin     |

---

### **Loyalty & Rewards Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/loyalty/points`         | Get user points              | Yes           | Customer  |
| POST   | `/api/loyalty/redeem`         | Redeem points for coupon     | Yes           | Customer  |
| GET    | `/api/loyalty/history`        | Get points history           | Yes           | Customer  |
| GET    | `/api/loyalty/tier`           | Get current tier info        | Yes           | Customer  |

---

### **Coupon Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| POST   | `/api/coupons/validate`       | Validate coupon code         | Yes           | Customer  |
| GET    | `/api/admin/coupons`          | Get all coupons              | Yes           | Admin     |
| POST   | `/api/admin/coupons`          | Create coupon                | Yes           | Admin     |
| PUT    | `/api/admin/coupons/:id`      | Update coupon                | Yes           | Admin     |
| DELETE | `/api/admin/coupons/:id`      | Delete coupon                | Yes           | Admin     |

---

### **Analytics Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/analytics/dashboard`    | Get dashboard stats          | Yes           | Admin     |
| GET    | `/api/analytics/sales`        | Get sales analytics          | Yes           | Admin     |
| GET    | `/api/analytics/products`     | Get product performance      | Yes           | Admin     |
| GET    | `/api/analytics/customers`    | Get customer insights        | Yes           | Admin     |
| GET    | `/api/analytics/revenue`      | Get revenue trends           | Yes           | Admin     |
| POST   | `/api/analytics/export`       | Export report (PDF/Excel)    | Yes           | Admin     |

---

### **Blog/CMS Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/blog/posts`             | Get all blog posts           | No            | Public    |
| GET    | `/api/blog/posts/:slug`       | Get post by slug             | No            | Public    |
| POST   | `/api/blog/posts`             | Create blog post             | Yes           | Admin     |
| PUT    | `/api/blog/posts/:id`         | Update blog post             | Yes           | Admin     |
| DELETE | `/api/blog/posts/:id`         | Delete blog post             | Yes           | Admin     |
| POST   | `/api/blog/posts/:id/publish` | Publish draft post           | Yes           | Admin     |

---

### **Notification Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/notifications`          | Get user notifications       | Yes           | All       |
| PUT    | `/api/notifications/:id/read` | Mark as read                 | Yes           | All       |
| PUT    | `/api/notifications/read-all` | Mark all as read             | Yes           | All       |
| DELETE | `/api/notifications/:id`      | Delete notification          | Yes           | All       |

---

### **Settings Endpoints**

| Method | Endpoint                      | Description                  | Auth Required | Role      |
|--------|-------------------------------|------------------------------|---------------|-----------|
| GET    | `/api/settings`               | Get site settings            | Yes           | Admin     |
| PUT    | `/api/settings`               | Update site settings         | Yes           | Admin     |
| GET    | `/api/settings/payment-config`| Get payment gateway config   | Yes           | Admin     |
| PUT    | `/api/settings/payment-config`| Update payment config        | Yes           | Admin     |

---

## 🏗️ SYSTEM ARCHITECTURE

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Browser   │  │   Mobile    │  │     POS     │     │
│  │  (Next.js)  │  │ (Responsive)│  │  Terminal   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 NEXT.JS APP ROUTER (Vercel)             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Server Components (SSR/ISR)                     │   │
│  │  • Product pages                                 │   │
│  │  • Blog posts                                    │   │
│  │  • SEO-optimized pages                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes (Backend Logic)                      │   │
│  │  • Authentication (NextAuth)                     │   │
│  │  • Business Logic                                │   │
│  │  • Data Validation                               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Client Components (Interactive UI)              │   │
│  │  • Cart management                               │   │
│  │  • Forms & Modals                                │   │
│  │  • Real-time updates                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES LAYER                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ MongoDB  │ │Cloudinary│ │ Payment  │ │  Email   │   │
│  │  Atlas   │ │  (CDN)   │ │ Gateways │ │  (SMTP)  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Request Flow Examples**

#### **1. Product Page Load (SSR)**
```
User visits /product/shea-body-oil
    ↓
Next.js Server Component fetches data from MongoDB
    ↓
Pre-renders HTML with product data
    ↓
Sends optimized HTML to client
    ↓
Hydrates interactive components (Add to Cart button)
    ↓
Images lazy-loaded from Cloudinary CDN
```

#### **2. Checkout Flow**
```
User clicks "Proceed to Checkout"
    ↓
Client validates cart items (stock availability)
    ↓
POST /api/orders with cart data
    ↓
Server validates & creates order (status: pending)
    ↓
Redirects to payment gateway (CBE/TeleBirr/Stripe)
    ↓
Payment gateway processes payment
    ↓
Webhook hits /api/payments/webhook
    ↓
Updates order status to "paid"
    ↓
Triggers: Email, Inventory update, Loyalty points
    ↓
Redirects user to order confirmation page
```

#### **3. POS Sale**
```
Retail Manager scans barcode
    ↓
POST /api/pos/products/search with barcode
    ↓
Returns product data
    ↓
Adds to POS cart (client state)
    ↓
Manager clicks "Complete Sale"
    ↓
POST /api/pos/sale
    ↓
Creates order (source: 'pos', status: 'paid')
    ↓
Updates inventory (decrements stock)
    ↓
Logs in InventoryLog collection
    ↓
Generates receipt (HTML → Print)
```

---

### **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────┐
│                  USER ACTIONS                       │
│  Browse → Add to Cart → Checkout → Payment → Order │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES                     │
│  • Validate request                                 │
│  • Check authentication (NextAuth session)          │
│  • Authorize based on role                          │
│  • Execute business logic                           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              MONGOOSE MODELS                        │
│  • Schema validation                                │
│  • Pre/post hooks (e.g., hash password)             │
│  • Virtual fields (e.g., fullName)                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              MONGODB ATLAS                          │
│  • Indexed queries (fast retrieval)                 │
│  • Aggregation pipelines (analytics)                │
│  • Transactions (atomic operations)                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│           SIDE EFFECTS / INTEGRATIONS               │
│  • Send email (Nodemailer)                          │
│  • Update Cloudinary (image uploads)                │
│  • Log to InventoryLog                              │
│  • Award loyalty points                             │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 SECURITY & AUTHENTICATION

### **Authentication Strategy**

**NextAuth.js Configuration:**
```javascript
// /app/api/auth/[...nextauth]/route.js
{
  providers: [
    CredentialsProvider({
      // Email/password login
      authorize: async (credentials) => {
        // Verify credentials against MongoDB
        // Return user object if valid
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.id = user._id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  }
}
```

### **Role-Based Access Control (RBAC)**

**Middleware Pattern:**
```javascript
// /middleware/auth.js
export const requireAuth = (roles = []) => {
  return async (req, res, next) => {
    const session = await getSession(req);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (roles.length && !roles.includes(session.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    req.user = session.user;
    next();
  };
};

// Usage in API route
app.post('/api/products', 
  requireAuth(['admin']), 
  async (req, res) => {
    // Only admins can create products
  }
);
```

### **Security Measures**

| Vulnerability       | Prevention Strategy                              |
|---------------------|--------------------------------------------------|
| **XSS**             | Input sanitization with DOMPurify, CSP headers   |
| **SQL Injection**   | Mongoose parameterized queries (not SQL, but NoSQL injection prevention) |
| **CSRF**            | NextAuth CSRF tokens on all mutations            |
| **Brute Force**     | Rate limiting (5 attempts per 15min)             |
| **Session Hijacking** | HTTP-only cookies, secure flag, SameSite=Strict |
| **Man-in-the-Middle** | HTTPS enforced (Vercel auto-SSL)               |
| **Data Exposure**   | Role-based API responses (hide sensitive fields) |
| **File Upload**     | Cloudinary signed uploads, file type validation  |

### **Data Protection**

**Sensitive Data Handling:**
```javascript
// Password hashing (registration)
const hashedPassword = await bcrypt.hash(password, 10);

// Password comparison (login)
const isValid = await bcrypt.compare(password, user.password);

// Never expose hashed passwords in API responses
const userResponse = {
  ...user.toObject(),
  password: undefined // Exclude from response
};

// Encrypt payment details before storing
const encryptedCardData = encrypt(cardDetails, process.env.ENCRYPTION_KEY);
```

---

## ⚙️ AUTOMATION & SMART FEATURES

### **1. Automated Stock Management**

**Low Stock Alerts:**
```javascript
// Cron job runs daily at 9 AM
cron.schedule('0 9 * * *', async () => {
  const lowStockProducts = await Product.find({
    stock: { $lte: '$restockThreshold' },
    isActive: true
  });
  
  if (lowStockProducts.length > 0) {
    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️ ${lowStockProducts.length} Products Low on Stock`,
      template: 'low-stock-alert',
      data: { products: lowStockProducts }
    });
    
    // Create in-app notifications
    await Notification.create({
      userId: adminId,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${lowStockProducts.length} products need restocking`
    });
  }
});
```

**Auto Stock Deduction:**
```javascript
// When order status changes to 'paid'
Order.post('save', async function(doc) {
  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid') {
    // Deduct stock for each item
    for (const item of doc.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
      
      // Log inventory change
      await InventoryLog.create({
        productId: item.productId,
        changeType: 'sale',
        quantityChange: -item.quantity,
        orderId: doc._id,
        performedBy: doc.userId
      });
    }
  }
});
```

---

### **2. Abandoned Cart Recovery**

**Email Automation:**
```javascript
// Cron job runs every hour
cron.schedule('0 * * * *', async () => {
  const abandonedCarts = await Cart.find({
    updatedAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24hrs ago
    items: { $exists: true, $ne: [] }
  }).populate('userId items.productId');
  
  for (const cart of abandonedCarts) {
    if (cart.userId && cart.userId.email) {
      await sendEmail({
        to: cart.userId.email,
        subject: '🛒 You left items in your cart!',
        template: 'abandoned-cart',
        data: {
          userName: cart.userId.name,
          cartItems: cart.items,
          cartLink: `${process.env.SITE_URL}/cart`,
          couponCode: 'COMEBACK10' // 10% discount incentive
        }
      });
    }
  }
});
```

---

### **3. Loyalty Points Automation**

**Auto-Award Points:**
```javascript
// When order status changes to 'delivered'
Order.post('save', async function(doc) {
  if (this.isModified('orderStatus') && this.orderStatus === 'delivered') {
    const pointsEarned = Math.floor(doc.totalAmount / 10); // 1 point per 10 ETB
    
    await LoyaltyPoints.findOneAndUpdate(
      { userId: doc.userId },
      {
        $inc: { totalPoints: pointsEarned, availablePoints: pointsEarned },
        $push: {
          transactions: {
            type: 'earned',
            points: pointsEarned,
            orderId: doc._id,
            reason: `Purchase reward for order #${doc.orderNumber}`,
            createdAt: new Date()
          }
        }
      },
      { upsert: true }
    );
    
    // Check tier upgrade
    const loyalty = await LoyaltyPoints.findOne({ userId: doc.userId });
    const newTier = calculateTier(loyalty.totalPoints);
    
    if (newTier !== loyalty.tier) {
      loyalty.tier = newTier;
      await loyalty.save();
      
      // Send tier upgrade notification
      await sendEmail({
        to: doc.userId.email,
        subject: `🎉 You've been upgraded to ${newTier.toUpperCase()} tier!`,
        template: 'tier-upgrade'
      });
    }
  }
});
```

---

### **4. Order Status Notifications**

**Auto-Email on Status Change:**
```javascript
Order.pre('save', async function(next) {
  if (this.isModified('orderStatus')) {
    const user = await User.findById(this.userId);
    const statusMessages = {
      paid: 'Your payment has been confirmed!',
      processing: 'We\'re preparing your order',
      shipped: `Your order has been shipped. Tracking: ${this.trackingNumber}`,
      delivered: 'Your order has been delivered. Enjoy!'
    };
    
    await sendEmail({
      to: user.email,
      subject: `Order #${this.orderNumber} Update`,
      template: 'order-status',
      data: {
        orderNumber: this.orderNumber,
        status: this.orderStatus,
        message: statusMessages[this.orderStatus],
        trackingLink: this.trackingNumber ? 
          `https://track.example.com/${this.trackingNumber}` : null
      }
    });
  }
  next();
});
```

---

### **5. Review Request Automation**

**Post-Delivery Review Request:**
```javascript
// Cron job runs daily
cron.schedule('0 10 * * *', async () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  
  const deliveredOrders = await Order.find({
    orderStatus: 'delivered',
    updatedAt: { $gte: threeDaysAgo, $lte: threeDaysAgo },
    reviewRequested: { $ne: true }
  }).populate('userId items.productId');
  
  for (const order of deliveredOrders) {
    await sendEmail({
      to: order.userId.email,
      subject: 'How was your purchase? Leave a review!',
      template: 'review-request',
      data: {
        orderNumber: order.orderNumber,
        products: order.items,
        reviewLink: `${process.env.SITE_URL}/orders/${order._id}/review`,
        incentive: 'Get 50 bonus points for each review!'
      }
    });
    
    order.reviewRequested = true;
    await order.save();
  }
});
```

---

### **6. Birthday Rewards**

**Auto-Send Birthday Discount:**
```javascript
// Runs daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const users = await User.find({
    $expr: {
      $and: [
        { $eq: [{ $dayOfMonth: '$birthdate' }, today.getDate()] },
        { $eq: [{ $month: '$birthdate' }, today.getMonth() + 1] }
      ]
    }
  });
  
  for (const user of users) {
    // Create birthday coupon
    const coupon = await Coupon.create({
      code: `BIRTHDAY${user._id.toString().slice(-6).toUpperCase()}`,
      type: 'percentage',
      value: 20, // 20% off
      usageLimit: 1,
      perUserLimit: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
      isActive: true
    });
    
    await sendEmail({
      to: user.email,
      subject: `🎂 Happy Birthday ${user.name}! Here's 20% OFF`,
      template: 'birthday-reward',
      data: {
        userName: user.name,
        couponCode: coupon.code,
        expiryDate: coupon.validUntil
      }
    });
  }
});
```

---

## 💳 PAYMENT INTEGRATION

### **Payment Gateway Configuration**

#### **1. CBE Birr (Ethiopia)**
```javascript
// /lib/payment/cbe-birr.js
export const initiateCBEPayment = async (orderData) => {
  const response = await fetch(process.env.CBE_BIRR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CBE_BIRR_API_KEY}`
    },
    body: JSON.stringify({
      merchant_id: process.env.CBE_BIRR_MERCHANT_ID,
      amount: orderData.totalAmount,
      currency: 'ETB',
      order_id: orderData.orderNumber,
      return_url: `${process.env.SITE_URL}/payment/success`,
      cancel_url: `${process.env.SITE_URL}/payment/cancel`,
      webhook_url: `${process.env.SITE_URL}/api/payments/webhook/cbe`
    })
  });
  
  const data = await response.json();
  return data.payment_url; // Redirect user to this URL
};
```

#### **2. TeleBirr (Ethiopia)**
```javascript
// /lib/payment/telebirr.js
export const initiateTeleBirrPayment = async (orderData) => {
  const telebirr = new TeleBirrSDK({
    appId: process.env.TELEBIRR_APP_ID,
    appKey: process.env.TELEBIRR_APP_KEY,
    merchantId: process.env.TELEBIRR_MERCHANT_ID,
    publicKey: process.env.TELEBIRR_PUBLIC_KEY
  });
  
  const payment = await telebirr.createPayment({
    outTradeNo: orderData.orderNumber,
    subject: `Dokimas Order #${orderData.orderNumber}`,
    totalAmount: orderData.totalAmount,
    notifyUrl: `${process.env.SITE_URL}/api/payments/webhook/telebirr`,
    returnUrl: `${process.env.SITE_URL}/payment/success`
  });
  
  return payment.payUrl;
};
```

#### **3. Stripe (International)**
```javascript
// /lib/payment/stripe.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripeCheckout = async (orderData) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: orderData.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.image]
        },
        unit_amount: item.price * 100 // Convert to cents
      },
      quantity: item.quantity
    })),
    mode: 'payment',
    success_url: `${process.env.SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/payment/cancel`,
    metadata: {
      orderId: orderData._id.toString()
    }
  });
  
  return session.url;
};
```

### **Webhook Handlers**

**Unified Webhook Processing:**
```javascript
// /app/api/payments/webhook/[provider]/route.js
export async function POST(req, { params }) {
  const { provider } = params;
  const body = await req.json();
  
  let orderId, paymentStatus;
  
  switch(provider) {
    case 'cbe':
      orderId = body.order_id;
      paymentStatus = body.status === 'SUCCESS' ? 'paid' : 'failed';
      break;
      
    case 'telebirr':
      orderId = body.outTradeNo;
      paymentStatus = body.tradeStatus === 'TRADE_SUCCESS' ? 'paid' : 'failed';
      break;
      
    case 'stripe':
      const signature = req.headers.get('stripe-signature');
      const event = stripe.webhooks.constructEvent(
        await req.text(),
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      orderId = event.data.object.metadata.orderId;
      paymentStatus = event.type === 'checkout.session.completed' ? 'paid' : 'failed';
      break;
  }
  
  // Update order
  const order = await Order.findOneAndUpdate(
    { orderNumber: orderId },
    {
      paymentStatus,
      'paymentDetails.transactionId': body.transaction_id || body.tradeNo,
      'paymentDetails.paidAt': new Date()
    },
    { new: true }
  );
  
  if (paymentStatus === 'paid') {
    // Trigger post-payment actions
    await sendOrderConfirmationEmail(order);
    await updateInventory(order);
    await awardLoyaltyPoints(order);
  }
  
  return Response.json({ received: true });
}
```

---

## 📅 DEVELOPMENT ROADMAP

### **Week 1: Foundation & Setup**
- [x] Initialize Next.js 15 project with App Router
- [x] Configure Tailwind CSS + Shadcn/UI
- [x] Setup MongoDB Atlas cluster
- [x] Configure Mongoose models
- [x] Setup NextAuth.js with Google OAuth
- [x] Create environment variables structure
- [x] Setup Cloudinary account
- [x] Configure ESLint + Prettier
- [x] Create project documentation

**Deliverables:** Working dev environment, database connection, auth system

---

### **Week 2: Authentication & User Management**
- [ ] Build registration/login pages
- [ ] Implement email verification flow
- [ ] Create password reset functionality
- [ ] Build user profile page
- [ ] Implement role-based middleware
- [ ] Create admin user management interface
- [ ] Add address management for customers

**Deliverables:** Complete auth system with role-based access

---

### **Week 3: Product Catalog**
- [ ] Create Product model with variants
- [ ] Build admin product creation form
- [ ] Implement Cloudinary image upload
- [ ] Create product listing page (`/shop`)
- [ ] Add filtering & search functionality
- [ ] Build product detail pages
- [ ] Implement SEO optimization (meta tags, slugs)

**Deliverables:** Full product management system

---

### **Week 4: Shopping Cart & Checkout**
- [ ] Build cart UI components
- [ ] Implement cart state management
- [ ] Create guest cart migration logic
- [ ] Build checkout flow (multi-step form)
- [ ] Add coupon validation
- [ ] Implement shipping cost calculation
- [ ] Create order summary component

**Deliverables:** Complete shopping cart and checkout UI

---

### **Week 5: Payment Integration**
- [ ] Integrate CBE Birr API
- [ ] Integrate TeleBirr SDK
- [ ] Setup Stripe checkout
- [ ] Build webhook handlers
- [ ] Implement payment status tracking
- [ ] Create payment success/failure pages
- [ ] Add invoice generation (PDF)

**Deliverables:** Working payment system with 3 gateways

---

### **Week 6: Order Management**
- [ ] Build customer order history page
- [ ] Create order tracking interface
- [ ] Implement admin order management
- [ ] Add order status update functionality
- [ ] Build email notification system
- [ ] Create refund processing logic
- [ ] Add order cancellation feature

**Deliverables:** Complete order management system

---

### **Week 7: Inventory & POS**
- [ ] Build inventory dashboard
- [ ] Implement stock tracking logic
- [ ] Create low-stock alert system
- [ ] Build POS interface for retail managers
- [ ] Add barcode scanner integration
- [ ] Implement shift management
- [ ] Create daily sales reports

**Deliverables:** Inventory management + POS system

---

### **Week 8: Analytics & Reporting**
- [ ] Build admin analytics dashboard
- [ ] Implement sales charts (Chart.js/Recharts)
- [ ] Create product performance reports
- [ ] Add customer insights analytics
- [ ] Build export functionality (PDF/Excel)
- [ ] Implement automated weekly reports
- [ ] Add real-time dashboard updates

**Deliverables:** Complete analytics system

---

### **Week 9: CRM & Automation**
- [ ] Build loyalty points system
- [ ] Implement coupon management
- [ ] Create email campaign templates
- [ ] Setup abandoned cart automation
- [ ] Add review request automation
- [ ] Implement birthday rewards
- [ ] Build customer segmentation

**Deliverables:** CRM and marketing automation

---

### **Week 10: CMS & Content**
- [ ] Build blog post editor
- [ ] Create blog listing page
- [ ] Implement category management
- [ ] Add homepage banner management
- [ ] Build promotions system
- [ ] Implement SEO manager
- [ ] Create sitemap generation

**Deliverables:** Complete CMS system

---

### **Week 11: Testing & Optimization**
- [ ] Write unit tests (Jest)
- [ ] Write integration tests
- [ ] Perform security audit
- [ ] Optimize database queries
- [ ] Implement caching strategy
- [ ] Add error logging (Sentry)
- [ ] Performance testing (Lighthouse)

**Deliverables:** Tested and optimized application

---

### **Week 12: Deployment & Launch**
- [ ] Deploy to Vercel production
- [ ] Configure custom domain
- [ ] Setup SSL certificates
- [ ] Configure MongoDB Atlas production cluster
- [ ] Setup backup automation
- [ ] Create admin training documentation
- [ ] Perform UAT (User Acceptance Testing)
- [ ] Launch marketing campaign

**Deliverables:** Live production website

---

### **Post-Launch (Ongoing)**
- [ ] Monitor error logs and fix bugs
- [ ] Gather user feedback
- [ ] Implement feature requests
- [ ] Scale infrastructure as needed
- [ ] Regular security updates
- [ ] Monthly performance optimization
- [ ] Quarterly feature releases

---

## 🚀 DEPLOYMENT STRATEGY

### **Environment Setup**

#### **Development**
```bash
# .env.local
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dokimas_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### **Production**
```bash
# Vercel Environment Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dokimas_prod
NEXTAUTH_URL=https://dokimascosmetics.com
NEXTAUTH_SECRET=super_secure_production_secret
CLOUDINARY_CLOUD_NAME=dokimas_prod
CBE_BIRR_API_KEY=live_api_key
TELEBIRR_MERCHANT_ID=live_merchant_id
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

### **Vercel Deployment**

**Step-by-Step:**
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy to production
6. Configure custom domain (dokimascosmetics.com)
7. Enable automatic deployments on `main` branch push

**Vercel Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"], // US East (or closest to Ethiopia)
  "env": {
    "NEXT_PUBLIC_API_URL": "https://dokimascosmetics.com/api"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=1, stale-while-revalidate" }
      ]
    }
  ]
}
```

---

### **MongoDB Atlas Setup**

1. Create production cluster (M10 tier minimum for production)
2. Configure IP whitelist (Vercel IPs)
3. Enable automated backups (daily snapshots)
4. Setup monitoring alerts
5. Create database indexes for performance
6. Enable point-in-time recovery

**Recommended Indexes:**
```javascript
// Products collection
db.products.createIndex({ slug: 1 });
db.products.createIndex({ category: 1, isActive: 1 });
db.products.createIndex({ name: "text", description: "text" });

// Orders collection
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ orderNumber: 1 });
db.orders.createIndex({ orderStatus: 1, paymentStatus: 1 });

// Users collection
db.users.createIndex({ email: 1 }, { unique: true });
```

---

### **Performance Optimization**

#### **Next.js ISR Strategy**
```javascript
// /app/product/[slug]/page.js
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const products = await Product.find({ isActive: true }).select('slug');
  return products.map(p => ({ slug: p.slug }));
}
```

#### **Image Optimization**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};
```

---

### **Monitoring & Maintenance**

**Tools:**
- **Vercel Analytics**: Track page views, performance
- **Sentry**: Error logging and tracking
- **MongoDB Atlas Monitoring**: Query performance, slow queries
- **Uptime Robot**: 24/7 uptime monitoring
- **Google Analytics**: User behavior tracking

**Backup Strategy:**
- Automated daily MongoDB backups (Atlas)
- Weekly full database exports to S3
- Cloudinary auto-backup enabled
- Code versioned in Git (GitHub)

---

## 📚 APPENDIX

### **Key Technologies Documentation**

| Technology    | Official Docs                                |
|---------------|----------------------------------------------|
| Next.js       | https://nextjs.org/docs                      |
| MongoDB       | https://www.mongodb.com/docs/                |
| Mongoose      | https://mongoosejs.com/docs/                 |
| NextAuth      | https://next-auth.js.org/                    |
| Tailwind CSS  | https://tailwindcss.com/docs                 |
| Shadcn/UI     | https://ui.shadcn.com/                       |
| Cloudinary    | https://cloudinary.com/documentation         |
| Stripe        | https://stripe.com/docs                      |

---

### **Useful Commands**

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint

# Database
npm run db:seed            # Seed database with sample data
npm run db:migrate         # Run database migrations
npm run db:backup          # Backup database

# Testing
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

---

### **Contact & Support**

**Development Team:**
- Project Manager: [Name]
- Lead Developer: [Name]
- UI/UX Designer: [Name]

**Business Contacts:**
- Dokimas Cosmetics Owner: [Email]
- Technical Support: support@dokimascosmetics.com

---

## 🎉 CONCLUSION

This specification document serves as the **complete technical blueprint** for the Dokimas Cosmetics platform. It covers:

✅ All user roles and their complete workflows
✅ Detailed feature specifications for each module
✅ Complete database schema with relationships
✅ Comprehensive API endpoint reference
✅ Security and authentication architecture
✅ Payment integration for Ethiopian and international markets
✅ Automation and smart features for efficiency
✅ Development roadmap with weekly milestones
✅ Deployment strategy and monitoring plan

**Next Steps:**
1. Review and approve this specification
2. Begin Week 1 development (Foundation & Setup)
3. Schedule weekly progress reviews
4. Prepare content (product images, descriptions, blog posts)
5. Setup payment gateway accounts (CBE Birr, TeleBirr, Stripe)

---

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Status:** Ready for Implementation 🚀


