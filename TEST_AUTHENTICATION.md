# ✅ Authentication Testing - Step by Step

## 🚀 Server Status
✅ **Development server is running at:** http://localhost:3000

---

## 🧪 MANUAL TESTING GUIDE

Since the seed script has MongoDB Atlas permission issues, we'll create users manually through the UI and test everything.

---

## 📝 Test 1: Register a Customer Account

### Step 1: Open Registration Page
```
URL: http://localhost:3000/register
```

### Step 2: Fill in the Form
```
Name: Test Customer
Email: testcustomer@example.com
Phone: +251911234567
Password: Test123456!
Confirm Password: Test123456!
```

### Step 3: Click "Create Account"

**Expected Results:**
- ✅ Success toast appears
- ✅ Message: "Registration successful! Please check your email..."
- ✅ Redirected to login page
- ✅ User created in MongoDB (unverified)

### Step 4: Check MongoDB Atlas
1. Go to: https://cloud.mongodb.com/
2. Browse Collections
3. Database: `dokimas_cosmetics`
4. Collection: `users`
5. You should see the new user with `emailVerified: false`

**Note:** Email won't actually send (SMTP not configured), so we'll verify manually in MongoDB.

---

## 📝 Test 2: Manually Verify the User in MongoDB

Since email isn't configured, let's verify the user directly in MongoDB Atlas:

### Option A: Using MongoDB Atlas UI

1. Go to: https://cloud.mongodb.com/
2. Click on your cluster: **Cluster0**
3. Click **"Browse Collections"**
4. Select database: `dokimas_cosmetics`
5. Select collection: `users`
6. Find your user: `testcustomer@example.com`
7. Click the **"Edit"** button (pencil icon)
8. Change `emailVerified: false` to `emailVerified: true`
9. Delete the `verificationToken` field
10. Click **"Update"**

### Option B: Using mongosh

```bash
mongosh "mongodb+srv://dakimas:Daki_1234@cluster0.0gwcnq5.mongodb.net/dokimas_cosmetics"

# Then run:
db.users.updateOne(
  { email: "testcustomer@example.com" },
  { 
    $set: { emailVerified: true },
    $unset: { verificationToken: "" }
  }
)
```

---

## 📝 Test 3: Login with Customer Account

### Step 1: Go to Login Page
```
URL: http://localhost:3000/login
```

### Step 2: Enter Credentials
```
Email: testcustomer@example.com
Password: Test123456!
```

### Step 3: Click "Sign In"

**Expected Results:**
- ✅ Success toast: "Login successful!"
- ✅ Redirected to: `/dashboard/customer`
- ✅ See customer dashboard with stats
- ✅ See user name displayed
- ✅ Logout button visible

---

## 📝 Test 4: Create Admin User

### Step 1: Register Admin Account
```
URL: http://localhost:3000/register
```

**Fill in:**
```
Name: Admin User
Email: admin@dokimas.com
Phone: +251911111111
Password: Test123456!
Confirm Password: Test123456!
```

### Step 2: Verify in MongoDB Atlas

1. Browse to `users` collection
2. Find: `admin@dokimas.com`
3. **Edit the user:**
   - Set `emailVerified: true`
   - Set `role: "admin"` (change from "customer")
   - Delete `verificationToken`
4. Click **"Update"**

### Step 3: Login as Admin
```
URL: http://localhost:3000/login
Email: admin@dokimas.com
Password: Test123456!
```

**Expected Results:**
- ✅ Redirected to: `/dashboard/admin`
- ✅ See admin dashboard
- ✅ See admin-specific features

---

## 📝 Test 5: Create Retail Manager

### Step 1: Register Retail Account
```
URL: http://localhost:3000/register
```

**Fill in:**
```
Name: Retail Manager
Email: retail@dokimas.com
Phone: +251922222222
Password: Test123456!
Confirm Password: Test123456!
```

### Step 2: Verify and Change Role in MongoDB

1. Find: `retail@dokimas.com`
2. **Edit:**
   - Set `emailVerified: true`
   - Set `role: "retail_manager"`
   - Delete `verificationToken`
3. Save

### Step 3: Login as Retail Manager
```
Email: retail@dokimas.com
Password: Test123456!
```

**Expected Results:**
- ✅ Redirected to: `/dashboard/retail`
- ✅ See POS features
- ✅ See inventory management

---

## 📝 Test 6: Role-Based Access Control

### Test 6.1: Customer Accessing Admin Dashboard

1. Login as customer
2. Try to access: http://localhost:3000/dashboard/admin
3. **Expected:** Redirected to `/dashboard/customer`

### Test 6.2: Customer Accessing Retail Dashboard

1. Still logged in as customer
2. Try to access: http://localhost:3000/dashboard/retail
3. **Expected:** Redirected to `/dashboard/customer`

### Test 6.3: Retail Manager Accessing Admin Dashboard

1. Logout, then login as retail manager
2. Try to access: http://localhost:3000/dashboard/admin
3. **Expected:** Redirected to `/dashboard/customer`

### Test 6.4: Admin Accessing All Dashboards

1. Logout, then login as admin
2. Try to access:
   - `/dashboard/customer` - ✅ Should work
   - `/dashboard/retail` - ✅ Should work
   - `/dashboard/admin` - ✅ Should work

---

## 📝 Test 7: Password Reset Flow

### Step 7.1: Request Password Reset

1. Logout
2. Go to: http://localhost:3000/forgot-password
3. Enter email: `testcustomer@example.com`
4. Click "Send Reset Link"
5. **Expected:** Success message displayed

### Step 7.2: Get Reset Token from MongoDB

Since email isn't configured:

1. Go to MongoDB Atlas
2. Find user: `testcustomer@example.com`
3. Copy the `resetToken` value
4. It looks like: `a1b2c3d4e5f6...`

### Step 7.3: Reset Password

1. Go to: http://localhost:3000/reset-password?token=PASTE_TOKEN_HERE
2. Enter new password: `NewPassword123!`
3. Confirm: `NewPassword123!`
4. Click "Reset Password"
5. **Expected:** Success message, redirect to login

### Step 7.4: Login with New Password

1. Go to login page
2. Email: `testcustomer@example.com`
3. Password: `NewPassword123!`
4. **Expected:** Login successful

---

## 📝 Test 8: Validation Tests

### Test 8.1: Registration Validation

Try registering with invalid data:

**Empty fields:**
- Leave fields empty → Error: "All fields are required"

**Invalid email:**
- Email: `invalid-email` → Error: "Invalid email format"

**Short password:**
- Password: `short` → Error: "Password must be at least 8 characters long"

**Password mismatch:**
- Password: `Test123456!`
- Confirm: `Different123!` → Error: "Passwords do not match"

**Duplicate email:**
- Try registering with existing email → Error: "An account with this email already exists"

### Test 8.2: Login Validation

**Unverified email:**
1. Register new user
2. Don't verify in MongoDB
3. Try to login → Error: "Please verify your email..."

**Invalid credentials:**
- Wrong password → Error: "Invalid email or password"
- Wrong email → Error: "Invalid email or password"

---

## 📝 Test 9: Session Management

### Test 9.1: Session Persistence

1. Login to any account
2. Close browser completely
3. Reopen browser
4. Go to: http://localhost:3000/dashboard/customer
5. **Expected:** Still logged in (no redirect)

### Test 9.2: Logout

1. Click "Logout" button
2. **Expected:** Redirected to homepage
3. Try accessing: http://localhost:3000/dashboard/customer
4. **Expected:** Redirected to login page

---

## 📝 Test 10: Protected Routes

### Without Login:

Try accessing these URLs without logging in:
- http://localhost:3000/dashboard/customer → Redirected to `/login`
- http://localhost:3000/dashboard/admin → Redirected to `/login`
- http://localhost:3000/dashboard/retail → Redirected to `/login`

### Public Routes (Should Work):

- http://localhost:3000/ → Homepage ✅
- http://localhost:3000/login → Login page ✅
- http://localhost:3000/register → Registration page ✅
- http://localhost:3000/forgot-password → Forgot password ✅

---

## 📝 Test 11: Google OAuth (Optional)

If you've configured Google OAuth:

1. Go to login page
2. Click "Sign in with Google"
3. Select Google account
4. **Expected:**
   - User auto-created in database
   - Email auto-verified
   - Redirected to customer dashboard

---

## ✅ TESTING CHECKLIST

### Registration ✅
- [ ] Can register with valid data
- [ ] Validation works (email, password, etc.)
- [ ] Duplicate email rejected
- [ ] User created in MongoDB
- [ ] Redirects to login page

### Email Verification ✅
- [ ] Can manually verify in MongoDB
- [ ] Unverified users can't login

### Login ✅
- [ ] Verified users can login
- [ ] Invalid credentials rejected
- [ ] Role-based redirects work
- [ ] Session persists

### Dashboards ✅
- [ ] Customer dashboard accessible
- [ ] Admin dashboard accessible
- [ ] Retail dashboard accessible
- [ ] Each shows correct content

### Role-Based Access ✅
- [ ] Customers can't access admin/retail dashboards
- [ ] Retail managers can't access admin dashboard
- [ ] Admins can access all dashboards

### Password Reset ✅
- [ ] Can request reset
- [ ] Token generated in MongoDB
- [ ] Can reset with valid token
- [ ] Can login with new password

### Security ✅
- [ ] Passwords are hashed
- [ ] Tokens are secure
- [ ] Protected routes work
- [ ] Unauthorized redirects work

---

## 🐛 TROUBLESHOOTING

### Issue: Can't Register Users

**Problem:** "Command insert requires authentication"

**Solution:** Fix MongoDB Atlas permissions:
1. Go to Database Access
2. Edit user `dakimas`
3. Set to "Atlas admin"
4. Save and wait 1-2 minutes

### Issue: Can't Login

**Check:**
1. Is email verified in MongoDB? (should be `true`)
2. Is password correct?
3. Is user active? (`isActive: true`)

### Issue: Wrong Dashboard

**Check:** User role in MongoDB:
- `role: "customer"` → `/dashboard/customer`
- `role: "retail_manager"` → `/dashboard/retail`
- `role: "admin"` → `/dashboard/admin`

### Issue: Session Not Persisting

**Solution:**
1. Clear browser cookies
2. Check NEXTAUTH_SECRET in `.env.local`
3. Restart dev server

---

## 🎯 SUCCESS CRITERIA

Authentication is working if:

1. ✅ Users can register
2. ✅ Users can be verified (manually or via email)
3. ✅ Verified users can login
4. ✅ Role-based redirects work
5. ✅ Protected routes require authentication
6. ✅ Password reset works
7. ✅ Sessions persist
8. ✅ Logout works

---

## 📊 QUICK REFERENCE

### Test Accounts to Create:

| Role | Email | Password | Phone |
|------|-------|----------|-------|
| Customer | testcustomer@example.com | Test123456! | +251911234567 |
| Admin | admin@dokimas.com | Test123456! | +251911111111 |
| Retail | retail@dokimas.com | Test123456! | +251922222222 |

### MongoDB Quick Update:

```javascript
// Verify and change role
db.users.updateOne(
  { email: "admin@dokimas.com" },
  { 
    $set: { 
      emailVerified: true,
      role: "admin"
    },
    $unset: { verificationToken: "" }
  }
)
```

---

## 🎉 CONCLUSION

Once you've completed these tests, your authentication system is fully functional!

**Next Steps:**
1. Configure SMTP for real email sending
2. Build product catalog pages
3. Implement shopping cart
4. Add payment integration

---

**Ready to test!** Start with Test 1 above. 🚀







