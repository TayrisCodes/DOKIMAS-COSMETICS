# 🧴 Dokimas Cosmetics - E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, MongoDB, and TypeScript. Features online shopping, POS system, admin dashboard, and Ethiopian payment integration.

## ✨ Features

### 🛍️ Customer Features
- Browse and search premium cosmetics
- Shopping cart with persistent storage
- Multiple payment options (CBE Birr, TeleBirr, Stripe)
- Order tracking and history
- Loyalty points and rewards system
- Product reviews and ratings
- Wishlist functionality
- **📱 Progressive Web App (PWA)** - Install to home screen, offline browsing
- **🔔 Push Notifications** - Order updates, new products, promotions

### 👨‍💼 Admin Dashboard
- Complete product management (CRUD)
- Order management and tracking
- Real-time inventory monitoring
- Sales analytics and reports
- Customer relationship management (CRM)
- Coupon and promotion management
- Blog/Content management system
- User and role management

### 🏪 Retail POS System
- Point-of-sale interface for physical shop
- Barcode scanning support
- Real-time inventory sync
- Daily sales reports
- Shift management
- Offline mode with sync queue

### 🤖 Automation
- Low stock alerts
- Abandoned cart recovery emails
- Order status notifications (email + push)
- Birthday rewards
- Review request automation
- Loyalty points calculation
- **Push notification digests** (daily/weekly)
- **New product alerts** (category-based targeting)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth.js (Email + Google OAuth)
- **File Storage**: Cloudinary
- **Payments**: CBE Birr, TeleBirr, Stripe
- **PWA**: Service Workers, Web Push API, web-push library
- **Notifications**: Push API, VAPID, Scheduled cron jobs
- **Email**: Nodemailer
- **Animations**: Framer Motion

## 📁 Project Structure

```
dokimas-cosmetics/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product endpoints
│   │   │   ├── orders/        # Order endpoints
│   │   │   ├── cart/          # Cart endpoints
│   │   │   └── ...
│   │   ├── shop/              # Shop pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── shop/              # Shop components
│   │   ├── dashboard/         # Dashboard components
│   │   └── auth/              # Auth components
│   ├── lib/                   # Utility libraries
│   │   ├── db/                # Database connection
│   │   ├── auth/              # Auth configuration
│   │   ├── cloudinary/        # Image upload
│   │   ├── email/             # Email templates
│   │   ├── payment/           # Payment integration
│   │   └── helpers.ts         # Helper functions
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Cart.ts
│   │   └── ...
│   ├── middleware/            # API middleware
│   │   └── auth.ts
│   └── types/                 # TypeScript types
│       └── index.ts
├── public/                    # Static assets
├── .env.example               # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dokimas-cosmetics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/dokimas_dev

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Payment Gateways (optional for development)
   CBE_BIRR_API_KEY=your-cbe-api-key
   TELEBIRR_APP_ID=your-telebirr-app-id
   STRIPE_SECRET_KEY=your-stripe-key

   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 PWA + Push Notifications Setup

The application includes a full Progressive Web App implementation with push notifications.

### Quick Setup (5 minutes)

1. **Generate VAPID keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Add to `.env.local`**:
   ```env
   VAPID_PUBLIC_KEY=your-generated-public-key
   VAPID_PRIVATE_KEY=your-generated-private-key
   VAPID_CONTACT=mailto:admin@dokimas.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-generated-public-key
   CRON_SECRET=any-random-secret
   ```

3. **Verify setup**:
   ```bash
   npm run pwa:verify
   ```

4. **Test**:
   - Visit http://localhost:3000/settings/notifications
   - Click "Enable Notifications"
   - Click "Send Test"

### Features

- ✅ Install to home screen (mobile & desktop)
- ✅ Offline browsing with service worker caching
- ✅ Push notifications for orders, products, promotions
- ✅ Category-based notification targeting
- ✅ User preference management (categories, frequency)
- ✅ Daily/weekly notification digests
- ✅ Notification history and read tracking

### Documentation

- [PWA_QUICK_START.md](./PWA_QUICK_START.md) - Get started in 5 minutes
- [PWA_PUSH_SETUP.md](./PWA_PUSH_SETUP.md) - Complete setup guide
- [PWA_IMPLEMENTATION_SUMMARY.md](./PWA_IMPLEMENTATION_SUMMARY.md) - Technical details
- [PWA_IMPLEMENTATION_COMPLETE.md](./PWA_IMPLEMENTATION_COMPLETE.md) - Overview

## 📊 Database Models

### Core Models
- **User** - Customer, Retail Manager, Admin accounts
- **Product** - Products with variants, images, pricing
- **Order** - Orders with items, payment, shipping
- **Cart** - Shopping cart with items
- **InventoryLog** - Stock movement tracking
- **Review** - Product reviews and ratings
- **Coupon** - Discount codes
- **LoyaltyPoints** - Customer rewards
- **BlogPost** - Content management

### Notification Models (PWA)
- **Subscription** - Push notification subscriptions with preferences
- **Notification** - Notification history and read tracking
- **NotificationPreference** - User notification settings

## 🔐 Authentication

The app uses **NextAuth.js** with:
- **Credentials Provider** (Email + Password)
- **Google OAuth Provider**
- **Role-based access control** (Customer, Retail Manager, Admin)

### Protecting API Routes

```typescript
import { requireRole } from "@/lib/auth";

export async function GET() {
  const user = await requireRole("admin");
  // Only admins can access this route
}
```

### Protecting Pages

```typescript
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session || session.user.role !== "admin") {
    redirect("/auth/signin");
  }
  
  return <div>Admin Dashboard</div>;
}
```

## 💳 Payment Integration

### Supported Payment Methods

1. **CBE Birr** (Ethiopia)
   - Local bank payment gateway
   - Webhook integration for payment confirmation

2. **TeleBirr** (Ethiopia)
   - Mobile money payment
   - SDK integration

3. **Stripe** (International)
   - Credit/debit card payments
   - Webhook for payment events

### Payment Flow

```typescript
// Client initiates payment
const { paymentUrl } = await initiatePayment({
  orderId: order._id,
  amount: order.totalAmount,
  method: "cbe_birr"
});

// Redirect to payment gateway
window.location.href = paymentUrl;

// Webhook updates order status
// POST /api/payments/webhook/cbe
```

## 📧 Email Templates

Pre-built email templates for:
- Welcome email (new user registration)
- Order confirmation
- Shipping updates
- Password reset
- Abandoned cart recovery
- Review requests
- Promotional campaigns

## 🎨 UI Components

Built with **shadcn/ui** components:
- Button, Input, Card, Dialog
- Dropdown Menu, Select, Tabs
- Form components with validation
- Table, Badge, Avatar
- Toast notifications (Sonner)
- And more...

## 📈 Analytics & Reports

- Real-time sales dashboard
- Revenue trends (daily, weekly, monthly)
- Product performance metrics
- Customer insights (LTV, retention)
- Inventory reports
- Export to PDF/Excel

## 🔄 Inventory Management

- Real-time stock tracking
- Low stock alerts (configurable threshold)
- Auto-reorder suggestions
- Stock movement history (InventoryLog)
- Multi-location support (future)
- Barcode integration for POS

## 🎁 Loyalty & Rewards

### Tier System
- **Bronze** (0-1000 points): 1x multiplier
- **Silver** (1001-5000 points): 1.5x multiplier
- **Gold** (5001+ points): 2x multiplier

### Point Earning
- 1 point per 10 ETB spent
- Bonus points for reviews
- Birthday rewards
- Referral bonuses

## 🛡️ Security

- Password hashing with bcrypt
- JWT session tokens (HTTP-only cookies)
- CSRF protection
- Rate limiting on sensitive endpoints
- Input sanitization
- XSS prevention
- MongoDB injection protection

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### MongoDB Atlas

1. Create cluster
2. Whitelist Vercel IPs
3. Enable automated backups
4. Configure indexes

### Cloudinary

1. Create account
2. Generate API credentials
3. Configure upload presets

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## 🧪 Testing (Coming Soon)

- Unit tests with Jest
- Integration tests
- E2E tests with Playwright

## 📚 Documentation

- [Technical Specification](../DOKIMAS_COSMETICS_SPECIFICATION.md)
- [API Documentation](./docs/api.md) (coming soon)
- [Deployment Guide](./docs/deployment.md) (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For support, email: support@dokimascosmetics.com

---

**Built with ❤️ for Dokimas Cosmetics**
