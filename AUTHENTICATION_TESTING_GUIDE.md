# 🧪 Authentication & User Management Testing Guide

This guide will help you test the complete authentication system for Dokimas Cosmetics.

## 📋 Prerequisites

Before testing, ensure you have:

1. ✅ MongoDB running (local or Atlas)
2. ✅ Environment variables configured in `.env.local`
3. ✅ SMTP credentials for email testing
4. ✅ Development server running

## ⚙️ Environment Setup

Create `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/dokimas_dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@dokimascosmetics.com

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## 🌱 Seed Test Data

Run the seed script to create test users:

```bash
npm run seed
```

This creates three pre-verified test accounts:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Admin | admin@dokimas.com | Test123! | /dashboard/admin |
| Retail Manager | retail@dokimas.com | Test123! | /dashboard/retail |
| Customer | customer@dokimas.com | Test123! | /dashboard/customer |

## 🚀 Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Test Scenarios

### 1. User Registration Flow

#### Test Case 1.1: Successful Registration

1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Phone: "+251911111111"
   - Password: "Password123!"
   - Confirm Password: "Password123!"
3. Click "Create Account"
4. ✅ **Expected**: Success toast message
5. ✅ **Expected**: Redirect to /login with registration success message
6. ✅ **Expected**: Verification email sent (check inbox)

#### Test Case 1.2: Validation Errors

Test each validation:

- **Empty fields**: Submit with empty fields
  - ✅ **Expected**: "All fields are required" error
  
- **Invalid email**: Enter "invalid-email"
  - ✅ **Expected**: "Invalid email format" error
  
- **Short password**: Enter "short"
  - ✅ **Expected**: "Password must be at least 8 characters long" error
  
- **Password mismatch**: Enter different passwords
  - ✅ **Expected**: "Passwords do not match" error
  
- **Duplicate email**: Try registering with existing email
  - ✅ **Expected**: "An account with this email already exists" error

---

### 2. Email Verification Flow

#### Test Case 2.1: Verify Email

1. After registration, check your email inbox
2. Click the "Verify Email Address" button
3. ✅ **Expected**: Redirect to /verify page
4. ✅ **Expected**: Success message: "Email verified successfully!"
5. ✅ **Expected**: "Continue to Login" button appears

#### Test Case 2.2: Invalid Verification Token

1. Navigate to: http://localhost:3000/verify?token=invalid-token
2. ✅ **Expected**: Error message: "Invalid or expired verification token"

#### Test Case 2.3: Already Verified Email

1. Click verification link again after successful verification
2. ✅ **Expected**: Error message: "Email is already verified"

---

### 3. Login Flow

#### Test Case 3.1: Login with Unverified Email

1. Register a new user but don't verify email
2. Try to login with those credentials
3. ✅ **Expected**: Error: "Please verify your email before logging in..."

#### Test Case 3.2: Successful Login (Pre-Seeded Accounts)

**Test Admin Login:**
1. Navigate to http://localhost:3000/login
2. Email: admin@dokimas.com
3. Password: Test123!
4. Click "Sign In"
5. ✅ **Expected**: Success toast
6. ✅ **Expected**: Redirect to /dashboard/admin
7. ✅ **Expected**: See admin dashboard with admin features

**Test Retail Manager Login:**
1. Login with: retail@dokimas.com / Test123!
2. ✅ **Expected**: Redirect to /dashboard/retail
3. ✅ **Expected**: See POS and inventory features

**Test Customer Login:**
1. Login with: customer@dokimas.com / Test123!
2. ✅ **Expected**: Redirect to /dashboard/customer
3. ✅ **Expected**: See customer dashboard

#### Test Case 3.3: Login with Invalid Credentials

1. Enter incorrect email or password
2. ✅ **Expected**: Error: "Invalid email or password"

#### Test Case 3.4: Google OAuth Login

1. Click "Sign in with Google"
2. Complete Google authentication
3. ✅ **Expected**: Auto-create account if new user
4. ✅ **Expected**: Email auto-verified for OAuth users
5. ✅ **Expected**: Redirect to /dashboard/customer

---

### 4. Forgot Password Flow

#### Test Case 4.1: Request Password Reset

1. Navigate to http://localhost:3000/forgot-password
2. Enter email: customer@dokimas.com
3. Click "Send Reset Link"
4. ✅ **Expected**: Success message displayed
5. ✅ **Expected**: Reset email sent (check inbox)
6. ✅ **Expected**: "Check Your Email" confirmation page

#### Test Case 4.2: Reset Password with Valid Token

1. Open password reset email
2. Click "Reset Password" button
3. Enter new password: "NewPassword123!"
4. Confirm password: "NewPassword123!"
5. Click "Reset Password"
6. ✅ **Expected**: Success message
7. ✅ **Expected**: Redirect to /login after 2 seconds
8. ✅ **Expected**: Can login with new password

#### Test Case 4.3: Reset Password with Invalid Token

1. Navigate to: http://localhost:3000/reset-password?token=invalid
2. Enter new password
3. ✅ **Expected**: Error: "Invalid or expired reset token"

#### Test Case 4.4: Expired Reset Token

1. Request password reset
2. Wait 1 hour (or manually expire token in DB)
3. Try to reset password
4. ✅ **Expected**: Error: "Invalid or expired reset token"

---

### 5. Route Protection & Middleware

#### Test Case 5.1: Access Dashboard Without Login

1. Logout if logged in
2. Navigate to http://localhost:3000/dashboard/customer
3. ✅ **Expected**: Redirect to /login

#### Test Case 5.2: Role-Based Access Control

**Admin trying to access customer dashboard:**
1. Login as admin
2. Navigate to /dashboard/customer
3. ✅ **Expected**: Can access (admins can view all)

**Customer trying to access admin dashboard:**
1. Login as customer
2. Navigate to /dashboard/admin
3. ✅ **Expected**: Redirect to /dashboard/customer

**Customer trying to access retail dashboard:**
1. Login as customer
2. Navigate to /dashboard/retail
3. ✅ **Expected**: Redirect to /dashboard/customer

**Retail Manager trying to access admin dashboard:**
1. Login as retail manager
2. Navigate to /dashboard/admin
3. ✅ **Expected**: Redirect to /dashboard/customer

#### Test Case 5.3: Redirect After Login

1. While logged out, visit: /dashboard/admin
2. ✅ **Expected**: Redirect to /login
3. Login with admin credentials
4. ✅ **Expected**: Redirect to /dashboard/admin (original destination)

---

### 6. Session Management

#### Test Case 6.1: Session Persistence

1. Login as any user
2. Close browser
3. Reopen browser and visit http://localhost:3000/dashboard/customer
4. ✅ **Expected**: Still logged in (session persists)

#### Test Case 6.2: Logout

1. Login as any user
2. Click "Logout" button
3. ✅ **Expected**: Redirect to homepage
4. ✅ **Expected**: Try accessing /dashboard/customer
5. ✅ **Expected**: Redirect to /login (session ended)

#### Test Case 6.3: Session Expiry

1. Login and note the session time (default: 30 days)
2. Session should automatically expire after configured time
3. ✅ **Expected**: Redirect to login when session expires

---

### 7. Email Functionality

#### Test Case 7.1: Verification Email

Check that email contains:
- ✅ Proper subject: "Verify your email - Dokimas Cosmetics"
- ✅ User's name in greeting
- ✅ Verification link with correct token
- ✅ Professional design
- ✅ Dokimas branding

#### Test Case 7.2: Password Reset Email

Check that email contains:
- ✅ Proper subject: "Password Reset Request - Dokimas Cosmetics"
- ✅ Reset link with correct token
- ✅ Warning about expiry (1 hour)
- ✅ Security notice
- ✅ Professional design

---

### 8. Edge Cases & Security

#### Test Case 8.1: SQL Injection Attempts

1. Try entering SQL injection strings in forms:
   - `'; DROP TABLE users; --`
   - `' OR '1'='1`
2. ✅ **Expected**: Sanitized and rejected

#### Test Case 8.2: XSS Attempts

1. Try entering script tags in name field:
   - `<script>alert('XSS')</script>`
2. ✅ **Expected**: Sanitized and escaped

#### Test Case 8.3: Brute Force Protection

1. Make multiple failed login attempts rapidly
2. ✅ **Expected**: Rate limiting kicks in (if implemented)

#### Test Case 8.4: Token Replay Attacks

1. Use a verification token twice
2. ✅ **Expected**: Second use fails
3. ✅ **Expected**: Token deleted after first use

---

## 📊 Test Checklist

### Registration & Verification
- [ ] User can register with valid data
- [ ] Validation works for all fields
- [ ] Duplicate email is rejected
- [ ] Verification email is sent
- [ ] Email verification works
- [ ] Invalid tokens are rejected
- [ ] Already verified emails show appropriate message

### Login & Authentication
- [ ] Cannot login without email verification
- [ ] Verified users can login
- [ ] Invalid credentials are rejected
- [ ] Google OAuth works
- [ ] Session persists across browser restarts
- [ ] Role-based redirects work correctly

### Password Reset
- [ ] Can request password reset
- [ ] Reset email is sent
- [ ] Can reset password with valid token
- [ ] Invalid/expired tokens are rejected
- [ ] Can login with new password

### Route Protection
- [ ] Dashboard requires authentication
- [ ] Admins can access all dashboards
- [ ] Retail managers can only access retail dashboard
- [ ] Customers can only access customer dashboard
- [ ] Unauthorized redirects work correctly

### Security
- [ ] Passwords are hashed
- [ ] Tokens are secure and unique
- [ ] Sensitive data not exposed in responses
- [ ] Input sanitization works
- [ ] CSRF protection is active

---

## 🐛 Common Issues & Solutions

### Issue 1: Email Not Sending

**Problem**: Verification/reset emails not being sent

**Solutions**:
- Check SMTP credentials in `.env.local`
- Verify Gmail App Password is correct (not regular password)
- Check email spam folder
- Enable "Less secure app access" for Gmail (if using regular Gmail)
- Try using a service like Mailtrap for testing

### Issue 2: MongoDB Connection Error

**Problem**: Cannot connect to database

**Solutions**:
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check MONGODB_URI in `.env.local`
- For Atlas: Check IP whitelist
- Verify network connectivity

### Issue 3: NextAuth Error

**Problem**: JWT_SESSION_ERROR or similar

**Solutions**:
- Ensure NEXTAUTH_SECRET is set
- Regenerate secret: `openssl rand -base64 32`
- Clear browser cookies
- Restart dev server

### Issue 4: Verification Link Not Working

**Problem**: Clicking email link shows error

**Solutions**:
- Check NEXT_PUBLIC_SITE_URL matches your dev server
- Ensure token exists in database
- Check token hasn't expired
- Verify URL format is correct

### Issue 5: Middleware Not Working

**Problem**: Route protection not functioning

**Solutions**:
- Check middleware.ts is in src/ directory
- Verify matcher configuration
- Restart dev server
- Check session is valid

---

## 🧰 Debugging Tools

### 1. Check Database

```bash
# Connect to MongoDB
mongosh

# Use database
use dokimas_dev

# Check users
db.users.find().pretty()

# Check specific user
db.users.findOne({ email: "customer@dokimas.com" })

# Check verification tokens
db.users.find({ verificationToken: { $exists: true } })
```

### 2. Check Session

Add this to any server component:

```typescript
import { getSession } from "@/lib/auth";

export default async function Page() {
  const session = await getSession();
  console.log("Session:", session);
  // ...
}
```

### 3. API Testing with cURL

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"+251911111111","password":"Test123!"}'

# Test email verification
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"your-token-here"}'

# Test forgot password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

---

## ✅ Success Criteria

The authentication system is working correctly if:

1. ✅ Users can register and receive verification emails
2. ✅ Email verification activates accounts
3. ✅ Only verified users can login
4. ✅ Role-based dashboards work correctly
5. ✅ Password reset flow works end-to-end
6. ✅ Route protection prevents unauthorized access
7. ✅ Sessions persist across browser restarts
8. ✅ Logout clears sessions properly
9. ✅ All validation works correctly
10. ✅ Security measures are in place

---

## 📚 Next Steps

After completing authentication testing:

1. Implement product catalog pages
2. Build shopping cart functionality
3. Create checkout flow
4. Add payment integration
5. Build admin product management
6. Implement order management system

---

## 💡 Tips

- Use different browsers for testing multiple accounts simultaneously
- Keep MongoDB Compass open to inspect database changes in real-time
- Use browser DevTools Network tab to debug API calls
- Check terminal logs for server-side errors
- Use Postman or Insomnia for API testing
- Test on mobile devices for responsive design

---

**Happy Testing! 🎉**

If you encounter any issues not covered in this guide, check the main documentation or contact support.







