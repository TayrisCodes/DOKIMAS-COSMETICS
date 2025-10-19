# 🔐 Authentication & User Management Module

## Overview

Complete authentication system for Dokimas Cosmetics e-commerce platform with email verification, password reset, role-based access control, and Google OAuth integration.

## 🎯 Features Implemented

### ✅ User Registration
- Email + Password registration
- Phone number field (recovery purpose)
- Email verification via token
- Password strength validation
- Duplicate email prevention
- Automatic verification email sending

### ✅ Email Verification
- Secure token-based verification
- Beautiful HTML email templates
- Auto-redirect after verification
- Token expiry handling
- Already-verified detection

### ✅ Login System
- Email/Password authentication
- Google OAuth integration
- Email verification requirement
- Role-based dashboard redirects
- Session persistence
- Last login tracking

### ✅ Password Reset
- Email-based password reset
- Secure token generation (1-hour expiry)
- Token replay prevention
- New password validation
- Security notifications

### ✅ Role-Based Access Control (RBAC)
- **Customer**: Shopping, orders, profile
- **Retail Manager**: POS, inventory management
- **Admin**: Full system access

### ✅ Route Protection
- Middleware-based authentication
- Role-based redirects
- Unauthorized access prevention
- Login callback URLs

### ✅ Dashboard Pages
- Customer dashboard
- Admin dashboard
- Retail manager dashboard
- Role-specific features
- Account management

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts          # User registration API
│   │   ├── verify-email/route.ts      # Email verification API
│   │   ├── forgot-password/route.ts   # Password reset request API
│   │   └── reset-password/route.ts    # Password reset API
│   ├── register/page.tsx              # Registration page
│   ├── login/page.tsx                 # Login page
│   ├── verify/page.tsx                # Email verification page
│   ├── forgot-password/page.tsx       # Forgot password page
│   ├── reset-password/page.tsx        # Reset password page
│   └── dashboard/
│       ├── customer/page.tsx          # Customer dashboard
│       ├── admin/page.tsx             # Admin dashboard
│       └── retail/page.tsx            # Retail manager dashboard
├── lib/
│   ├── auth/
│   │   ├── index.ts                   # Auth helper functions
│   │   └── auth.config.ts             # NextAuth configuration
│   └── email/
│       └── index.ts                   # Email utility & templates
├── models/
│   └── User.ts                        # User model with tokens
├── types/
│   └── index.ts                       # TypeScript types
└── middleware.ts                      # Route protection middleware
```

---

## 🔧 Configuration

### 1. Environment Variables

Create `.env.local`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/dokimas_dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@dokimascosmetics.com

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Generate Secret

```bash
openssl rand -base64 32
```

### 3. Gmail App Password

1. Enable 2FA on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use that password in SMTP_PASSWORD

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Seed Test Data

```bash
npm run seed
```

This creates:
- **Admin**: admin@dokimas.com (Password: Test123!)
- **Retail Manager**: retail@dokimas.com (Password: Test123!)
- **Customer**: customer@dokimas.com (Password: Test123!)

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test the System

Visit: http://localhost:3000/login

---

## 📝 API Endpoints

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251911234567",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Registration successful! Please check your email...",
    "email": "john@example.com"
  }
}
```

### Email Verification
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-here"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-here",
  "password": "NewPassword123!"
}
```

---

## 🔐 Security Features

### Password Security
- ✅ bcrypt hashing (10 rounds)
- ✅ Minimum 8 characters required
- ✅ Password confirmation on registration
- ✅ Secure password reset flow

### Token Security
- ✅ Crypto-secure random tokens (32 bytes)
- ✅ One-time use tokens
- ✅ Token expiry (1 hour for reset tokens)
- ✅ Tokens not exposed in API responses

### Session Security
- ✅ HTTP-only cookies
- ✅ JWT with secure secret
- ✅ 30-day session expiry
- ✅ CSRF protection (NextAuth)

### Input Validation
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Password strength checks
- ✅ Duplicate email prevention

### Database Security
- ✅ Password field excluded by default
- ✅ Token fields excluded by default
- ✅ Indexed queries for performance
- ✅ Proper error handling

---

## 🧪 Testing

### Manual Testing

See [AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test Flow

1. **Register**: http://localhost:3000/register
2. **Verify Email**: Click link in email
3. **Login**: http://localhost:3000/login
4. **Access Dashboard**: Redirects based on role
5. **Password Reset**: http://localhost:3000/forgot-password

### Test with Seed Data

```bash
npm run seed
```

Login with pre-created accounts:
- admin@dokimas.com / Test123!
- retail@dokimas.com / Test123!
- customer@dokimas.com / Test123!

---

## 🎨 UI Components

### Registration Page
- Name, Email, Phone, Password fields
- Password confirmation
- Form validation
- Success/error messages
- Link to login page

### Login Page
- Email, Password fields
- "Forgot Password?" link
- Google OAuth button
- Link to registration page
- Role-based redirects

### Email Verification
- Loading state
- Success/error messages
- Redirect to login
- Beautiful UI feedback

### Password Reset Pages
- Email input for forgot password
- New password form for reset
- Confirmation screens
- Security notices

### Dashboard Pages
- Customer: Orders, wishlist, rewards, profile
- Admin: Products, orders, users, analytics
- Retail: POS, inventory, sales reports

---

## 📧 Email Templates

### Verification Email
- Professional design
- Clear call-to-action
- Verification link
- Dokimas branding

### Password Reset Email
- Security-focused design
- Reset link with expiry notice
- Warning about unsolicited requests
- Professional layout

---

## 🔄 User Flow Diagrams

### Registration Flow
```
1. User fills registration form
2. API validates data
3. Hash password with bcrypt
4. Generate verification token
5. Create user in database
6. Send verification email
7. Show success message
8. Redirect to login
```

### Login Flow
```
1. User enters credentials
2. API validates email/password
3. Check email verified
4. Check account active
5. Update last login
6. Create JWT session
7. Redirect based on role:
   - Admin → /dashboard/admin
   - Retail Manager → /dashboard/retail
   - Customer → /dashboard/customer
```

### Password Reset Flow
```
1. User requests reset
2. API finds user by email
3. Generate reset token (1-hour expiry)
4. Send reset email
5. User clicks link
6. Verify token validity
7. User enters new password
8. Hash and update password
9. Clear reset token
10. Redirect to login
```

---

## 🛡️ Middleware Protection

### Route Matching
```typescript
matcher: [
  "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"
]
```

### Protected Routes
- All `/dashboard/*` routes require authentication
- Role-based access to specific dashboards
- Auto-redirect to login if not authenticated
- Callback URL preservation

### Public Routes
- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/verify` - Email verification
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/shop` - Product catalog
- `/about` - About page
- `/contact` - Contact page

---

## 📊 Database Schema

### User Model
```typescript
{
  name: string
  email: string (unique, indexed)
  phone: string
  password: string (hashed, excluded by default)
  role: 'customer' | 'retail_manager' | 'admin'
  emailVerified: boolean
  verificationToken: string (excluded by default)
  resetToken: string (excluded by default)
  resetTokenExpiry: Date (excluded by default)
  image: string
  addresses: Address[]
  provider: 'credentials' | 'google'
  providerId: string
  isActive: boolean
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Email Not Sending
- Check SMTP credentials
- Verify Gmail app password (not regular password)
- Check spam folder
- Enable "Less secure app access" for Gmail

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI
- Verify network connectivity
- For Atlas: Check IP whitelist

### NextAuth Errors
- Ensure NEXTAUTH_SECRET is set
- Regenerate secret if needed
- Clear browser cookies
- Restart dev server

### Verification Link Not Working
- Check NEXT_PUBLIC_SITE_URL
- Ensure token exists in database
- Verify token hasn't expired
- Check URL format

---

## 🚀 Next Steps

After authentication is working:

1. ✅ **Product Catalog** - Build shop pages
2. ✅ **Shopping Cart** - Implement cart system
3. ✅ **Checkout** - Create checkout flow
4. ✅ **Payment Integration** - Add payment gateways
5. ✅ **Order Management** - Build order system
6. ✅ **Admin Tools** - Product/user management

---

## 📚 Documentation

- [Main README](./README.md)
- [Testing Guide](./AUTHENTICATION_TESTING_GUIDE.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Technical Specification](./DOKIMAS_COSMETICS_SPECIFICATION.md)

---

## 💡 Tips

- Use different browsers for multi-account testing
- Keep MongoDB Compass open to inspect data
- Use browser DevTools Network tab for debugging
- Check terminal logs for errors
- Use Postman/Insomnia for API testing

---

## ✨ Features Highlight

### What Makes This Implementation Special

1. **Security First**: Proper hashing, token management, CSRF protection
2. **Professional UI**: Beautiful, responsive pages with proper UX
3. **Email Integration**: Real email sending with templates
4. **Role-Based Access**: Proper RBAC implementation
5. **Error Handling**: Comprehensive error messages and validation
6. **Type Safety**: Full TypeScript coverage
7. **Session Management**: Persistent sessions with JWT
8. **Middleware Protection**: Automatic route protection
9. **Testing Ready**: Seed script and test accounts
10. **Production Ready**: Follows best practices

---

## 📞 Support

If you encounter any issues:
1. Check [AUTHENTICATION_TESTING_GUIDE.md](./AUTHENTICATION_TESTING_GUIDE.md)
2. Review error messages in terminal
3. Inspect database with MongoDB Compass
4. Check browser console for client errors
5. Verify environment variables

---

**Authentication Module Complete! ✅**

Ready to move to the next phase of development.







