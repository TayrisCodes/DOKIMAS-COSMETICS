# 🚀 QUICK START - Testing Guide

**Status:** ✅ All Systems Operational  
**Server:** Running on http://localhost:3000  
**Database:** Connected to MongoDB Atlas

---

## ✅ WHAT'S READY NOW

### 🔐 Test Accounts Created
```
Admin Account:
  Email: admin@dokimas.com
  Password: Test123!
  Access: Full admin dashboard

Retail Manager:
  Email: retail@dokimas.com
  Password: Test123!
  Access: Retail dashboard

Customer:
  Email: customer@dokimas.com
  Password: Test123!
  Access: Customer dashboard
```

### 📦 Sample Products Added
```
✅ 8 Products seeded
   - 5 Skincare products
   - 3 Makeup products
   - All with images and descriptions
   - Prices range from ETB 499 - ETB 1,499
```

---

## 🧪 TESTING SCENARIOS

### Scenario 1: Browse as Guest (5 minutes)
```bash
1. Open: http://localhost:3000
   ✅ See beautiful landing page
   ✅ Hero section with animations
   ✅ About section
   ✅ Categories
   ✅ Featured products

2. Click "Shop Now" or visit: http://localhost:3000/shop
   ✅ See 8 products
   ✅ Try filters (category, price range)
   ✅ Try search
   ✅ Try sorting

3. Click any product
   ✅ See product details
   ✅ See images
   ✅ See price and description
   ✅ See "Add to Cart" button (requires login)
```

### Scenario 2: Test as Customer (10 minutes)
```bash
1. Login at: http://localhost:3000/login
   Email: customer@dokimas.com
   Password: Test123!
   
2. Visit Shop: http://localhost:3000/shop
   ✅ Browse products
   ✅ Add items to cart
   
3. View Cart: http://localhost:3000/cart
   ✅ Update quantities
   ✅ Remove items
   ✅ See totals
   
4. Checkout: http://localhost:3000/checkout
   ✅ Fill shipping information
   ✅ Select payment method
   ✅ Upload payment screenshot (any image file)
   ✅ Enter transaction reference
   ✅ Submit order
   
5. View Orders: http://localhost:3000/dashboard/customer/orders
   ✅ See order status
   ✅ Track order
```

### Scenario 3: Test as Admin (15 minutes)
```bash
1. Logout and login as admin:
   Email: admin@dokimas.com
   Password: Test123!
   
2. View Dashboard: http://localhost:3000/dashboard/admin
   ✅ See statistics
   ✅ See recent orders
   ✅ See product count
   
3. Add Product: http://localhost:3000/dashboard/admin/products/add
   ✅ Fill product form
   ✅ Upload images (up to 5)
   ✅ Set price and stock
   ✅ Submit
   ✅ Product appears in shop
   
4. Edit Product: http://localhost:3000/dashboard/admin/products
   ✅ Click edit on any product
   ✅ Update details
   ✅ Save changes
   
5. Manage Orders: http://localhost:3000/dashboard/admin/orders
   ✅ View all orders
   ✅ See payment screenshots
   ✅ Approve/reject payments
   ✅ Update order status
   ✅ Add tracking numbers
```

---

## 🎯 QUICK TESTS (30 seconds each)

### Test 1: Homepage ✅
```
URL: http://localhost:3000
Expected: Beautiful landing page with animations
```

### Test 2: Shop Page ✅
```
URL: http://localhost:3000/shop
Expected: 8 products displayed
```

### Test 3: Product Detail ✅
```
URL: http://localhost:3000/product/radiant-glow-face-serum
Expected: Product details with images and price
```

### Test 4: Login ✅
```
URL: http://localhost:3000/login
Credentials: admin@dokimas.com / Test123!
Expected: Redirect to /dashboard/admin
```

### Test 5: API Health ✅
```
URL: http://localhost:3000/api/health
Expected: JSON response with "status": "healthy"
```

---

## 📊 WHAT TO VERIFY

### ✅ Features Working
- [x] User authentication (login/logout)
- [x] Product browsing and search
- [x] Product detail pages
- [x] Shopping cart (add/update/remove)
- [x] Checkout process
- [x] Payment proof upload
- [x] Order tracking
- [x] Admin product management
- [x] Admin order management
- [x] Role-based access control

### ⏳ Features to Configure
- [ ] Email notifications (requires SMTP setup)
- [ ] Google OAuth (requires credentials)
- [ ] Cloudinary custom uploads (uses placeholder URLs now)

---

## 🐛 WHAT TO WATCH FOR

### Expected Behaviors
```
✅ Products load quickly
✅ Images display properly
✅ Cart updates in real-time
✅ Login redirects to correct dashboard
✅ Only admins can access admin pages
✅ Payment uploads save correctly
✅ Order status updates properly
```

### Known Limitations
```
⚠️ Email notifications disabled (SMTP not configured)
⚠️ Product images use Unsplash placeholders
⚠️ Google OAuth not configured
ℹ️ These are configuration items, not bugs
```

---

## 💡 PRO TIPS

### Tip 1: Use Multiple Browsers
```
Browser 1: Login as admin
Browser 2: Login as customer
Browser 3: Stay logged out (guest browsing)
```

### Tip 2: Check Browser Console
```
Press F12 to open Developer Tools
Check Console tab for any errors
Check Network tab to see API calls
```

### Tip 3: Monitor MongoDB
```
Go to: https://cloud.mongodb.com/
Browse Collections to see real-time data changes
Watch as orders, carts, products are created
```

### Tip 4: Test on Mobile
```
Use browser responsive mode (Ctrl+Shift+M in Chrome)
Test on actual mobile device
All pages are mobile-responsive
```

---

## 🔄 RESET DATA (If Needed)

### Reset Users
```bash
npm run seed
# Creates fresh admin, retail, customer accounts
```

### Reset Products
```bash
npm run seed:products
# Recreates 8 sample products
```

### Clear Everything
```bash
# In MongoDB Atlas:
1. Go to Collections
2. Select database: dokimas_cosmetics
3. Drop collections you want to reset
4. Run seed scripts again
```

---

## 📈 SUCCESS METRICS

### You'll know it works when:
```
✅ Can register and login
✅ Can browse products
✅ Can add to cart
✅ Can complete checkout
✅ Can upload payment proof
✅ Admin can approve payments
✅ Customer sees order updates
✅ All dashboards load correctly
✅ Role-based access works
✅ No console errors
```

---

## 🎉 COMPLETE FLOW TEST (20 minutes)

**Do this to test everything end-to-end:**

### Part 1: Customer Journey
1. Open incognito window
2. Go to http://localhost:3000
3. Browse homepage → Click Shop
4. Search for "serum" → Find product
5. Click product → View details
6. Try to add to cart → Prompted to login
7. Click Register → Create account (use your real email if you want)
8. Login with new account
9. Browse shop → Add 3 products
10. Go to cart → Update quantities
11. Proceed to checkout
12. Fill shipping form
13. Upload payment screenshot (any image)
14. Submit order → See confirmation
15. Go to dashboard → See order

### Part 2: Admin Journey
1. Open new browser window
2. Login as admin@dokimas.com
3. Go to admin dashboard
4. Go to Orders
5. Find the order from Part 1
6. View payment screenshot
7. Approve payment
8. Add tracking number
9. Update status to "Processing"

### Part 3: Customer Follow-up
1. Go back to customer window
2. Refresh orders page
3. See status changed to "Processing"
4. See tracking number

**If all this works → System is 100% operational! 🎊**

---

## 📞 NEED HELP?

### Check These First:
1. **Server running?** Check terminal for errors
2. **Database connected?** Visit http://localhost:3000/api/health
3. **Logged in?** Check if "Logout" button appears
4. **Clear cache** Try Ctrl+Shift+R to hard refresh

### Common Issues:
```
Issue: Can't login
Fix: Check password (case-sensitive), verify email in database

Issue: No products showing
Fix: Run: npm run seed:products

Issue: Cart not working
Fix: Make sure you're logged in

Issue: Can't access admin page
Fix: Make sure you logged in as admin@dokimas.com
```

---

## 🚀 READY TO START?

### Quick Start Command:
```bash
# Make sure server is running
npm run dev

# Open in browser
http://localhost:3000

# Login as admin
Email: admin@dokimas.com
Password: Test123!

# Start testing! 🎉
```

---

**Happy Testing! 🧪**

Everything is ready and waiting for you to explore!






