# Module 5: Quick Start Testing Guide

## ⚡ 10-Minute Complete Test

### Prerequisites
- ✅ Dev server running: `npm run dev`
- ✅ MongoDB connected
- ✅ Products seeded (Module 4)

---

## Test 1: Register & Get Welcome Points (2 minutes)

### Steps:
```
1. Open: http://localhost:3000/register
2. Register new account:
   - Name: Loyalty Tester
   - Email: loyalty@test.com
   - Phone: 0911223344
   - Password: Test123!
3. Submit registration
4. Check email inbox (2 emails):
   - Verification email
   - Welcome email with 100 bonus points
5. Verify email by clicking link
6. Login with new credentials
7. Go to: /dashboard/customer/loyalty
```

### ✅ Expected Results:
- Loyalty dashboard loads successfully
- Points balance displays: **100 points**
- Total earned shows: 100
- History shows: "Welcome bonus points"
- Beautiful gradient purple/pink card
- "How It Works" section explains earning/redeeming

---

## Test 2: Create Admin Coupon (2 minutes)

### Steps:
```
1. Logout → Login as admin (admin@dokimas.com / Test123!)
2. Navigate to: /dashboard/admin/coupons
3. Click "Create Coupon" button
4. Fill form:
   - Code: SAVE20 (or leave empty)
   - Discount Type: Percentage
   - Discount Value: 20
   - Min Purchase: 100
   - Usage Limit: 10
   - Per-User Limit: 1
   - Expires: 7 days from now
5. Click "Create Coupon"
6. Click "Copy" button on coupon card
```

### ✅ Expected Results:
- Coupon created successfully
- Appears in "Active" tab
- Shows 20% badge
- Usage: 0/10
- Expiry date correct
- Copy button copies code to clipboard
- Green "Active" badge displayed

---

## Test 3: Use Coupon at Checkout (3 minutes)

### Steps:
```
1. Logout → Login as customer (loyalty@test.com)
2. Browse shop: /shop
3. Add product worth 150+ ETB to cart
4. Click cart icon → "Checkout"
5. In coupon section:
   - Enter code: SAVE20
   - Click "Apply"
6. Watch order summary update
7. Note the discount amount
```

### ✅ Expected Results:
- Coupon validates successfully
- Green checkmark appears: "Coupon Applied: SAVE20"
- Discount shows in summary: -30 ETB (if 150 ETB order)
- Total updates: 150 → 120 ETB
- Savings banner: "You're saving 30 ETB! 🎉"
- Can remove coupon with X button

---

## Test 4: Redeem Points at Checkout (3 minutes)

### Steps:
```
1. (Continue from Test 3, or start fresh checkout)
2. Ensure loyalty@test.com has 100 points
3. At checkout page, find "Use Loyalty Points" section
4. Check the checkbox to enable points
5. Section expands showing:
   - Available points: 100
   - Slider to select points
6. Move slider to 100 points
7. Watch discount calculate
8. Total updates in order summary
9. Complete shipping form
10. Select payment method: Cash on Delivery
11. Click "Continue to Payment"
12. Skip payment upload (for cash)
```

### ✅ Expected Results:
- Points section shows available balance
- Slider allows 0 to max points
- 100 points = 50 ETB discount shown
- Purple discount line in order summary
- Total reduces by 50 ETB
- Savings banner updates
- Info box explains: "100 points = 50 ETB"
- Remaining points shown: 0

---

## Test 5: Earn Points from Order (4 minutes)

### Steps:
```
1. Create order as customer (200 ETB)
2. Upload payment proof (if not cash)
3. Logout → Login as admin
4. Go to: /dashboard/admin/orders
5. Find the new order
6. Click "Approve Payment"
7. Wait for success message
8. Logout → Login as customer
9. Go to: /dashboard/customer/loyalty
10. Click refresh
```

### ✅ Expected Results:
- Points balance increases by 20 (200 ÷ 10)
- Total earned shows: 120 (100 welcome + 20 earned)
- If 100 points were used: Balance = 20
- If no points used: Balance = 120
- History shows new entry:
  - Action: "Earn"
  - Points: +20
  - Description: "Earned from order worth 200 ETB"
- Date/time stamp correct

---

## Test 6: CRM Dashboard (3 minutes)

### Steps:
```
1. Login as admin
2. Navigate to: /dashboard/admin/crm
3. View stats cards at top
4. Scroll to customer table
5. Note metrics for each customer
6. Filter by "Active"
7. Select "loyalty@test.com" (checkbox)
8. Click "Send Email" button
9. Modal opens:
   - Email Type: Promotional
   - Custom Message: "Thank you for testing!"
10. Click "Send Email"
11. Check email inbox
```

### ✅ Expected Results:
- CRM dashboard loads
- Stats cards show:
  - Total Customers (count)
  - Active Customers
  - Points Issued
  - Avg Order Value
- Customer table displays all users
- Shows: name, email, orders, spent, points, status
- Activity badges (Active/Inactive/New)
- Can select multiple customers
- Email modal opens
- Email sent successfully
- Toast confirmation
- Email received in inbox

---

## Test 7: Loyalty Configuration (2 minutes)

### Steps:
```
1. As admin: /dashboard/admin/loyalty-config
2. View current settings
3. Change "Points Per Amount" to 5
4. Check preview calculator
5. Click "Save Configuration"
6. Note new earning rate
```

###✅ Expected Results:
- Config page loads
- All settings editable
- Preview calculator shows examples
- Save button works
- Toast confirmation
- Calculator updates with new values
- Now customers earn: 1 point per 5 ETB (instead of 10)

---

## API Testing (Advanced - Optional)

### Test Points Balance API
```bash
# Must be authenticated - use browser or Postman
GET http://localhost:3000/api/loyalty
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "points": 100,
    "totalEarned": 100,
    "totalRedeemed": 0,
    "recentHistory": [...]
  }
}
```

### Test Coupon Validation API
```bash
GET http://localhost:3000/api/coupons/SAVE20?orderTotal=200
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "coupon": {...}
  }
}
```

### Test CRM Stats API
```bash
GET http://localhost:3000/api/crm/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 5,
    "activeCustomers": 2,
    ...
  }
}
```

---

## Verification Checklist

### Loyalty Points
- [ ] Registration gives 100 welcome points
- [ ] Points balance displays correctly
- [ ] Order approval awards points
- [ ] Points calculation accurate (orderTotal ÷ 10)
- [ ] Points history shows transactions
- [ ] Redemption validates minimum (50 pts)
- [ ] Discount calculates correctly (100 pts = 50 ETB)
- [ ] Points deducted after redemption

### Coupons
- [ ] Can create coupon as admin
- [ ] Code auto-generated if not provided
- [ ] Coupon validates at checkout
- [ ] Discount applies correctly (percent/amount)
- [ ] Usage limits enforced
- [ ] Per-user limits enforced
- [ ] Min purchase validated
- [ ] Expired coupons rejected
- [ ] Can deactivate coupon

### CRM
- [ ] All customers visible in table
- [ ] Activity status badges correct
- [ ] Metrics accurate (orders, spent)
- [ ] Can filter by status
- [ ] Can send emails to customers
- [ ] Email delivery works
- [ ] Stats cards show correct data

### Checkout Integration
- [ ] Coupon input appears
- [ ] Points section appears (if points available)
- [ ] Can apply both coupon and points
- [ ] Order total updates in real-time
- [ ] Savings banner displays
- [ ] Discount details in summary
- [ ] Order created with discount data

### Email Automation
- [ ] Welcome email sent on registration
- [ ] Can manually trigger daily cron
- [ ] Can manually trigger weekly cron
- [ ] Can manually trigger monthly cron
- [ ] Emails have proper formatting
- [ ] Coupons included in inactivity emails

---

## Common Issues & Solutions

### Issue: No welcome points after registration
**Solution:**
```javascript
// Check if LoyaltyConfig exists
GET /api/loyalty/config

// If empty, config will auto-create on first request
// Default welcomePoints = 100
```

### Issue: Coupon not validating
**Checks:**
1. Is coupon active? (not deactivated)
2. Has it expired? (check expiresAt date)
3. Usage limit reached? (usageCount < usageLimit)
4. Order meets minimum? (orderTotal >= minPurchase)
5. User already used it? (check userUsageLimit)

### Issue: Points not awarded
**Debug Steps:**
1. Check server logs for errors
2. Verify payment status = "approved"
3. Check LoyaltyConfig exists
4. Test API directly: POST /api/loyalty/earn

### Issue: Discount not showing in summary
**Solution:**
- Check React state (appliedCoupon, appliedPoints)
- Verify order total calculation
- Clear browser cache
- Check console for errors

---

## Success Criteria

Module 5 is **fully working** if:

✅ New users get 100 welcome points  
✅ Points awarded automatically on order approval  
✅ Coupons can be created and used  
✅ Checkout shows discount sections  
✅ Both discounts can be applied together  
✅ Order total updates correctly  
✅ CRM dashboard shows all customers  
✅ Email campaigns can be sent  
✅ Loyalty config can be adjusted  
✅ All automated emails work  

---

## Quick Commands

### Start Development
```bash
npm run dev
```

### Trigger Cron Jobs Manually
```bash
# Daily points emails
curl http://localhost:3000/api/cron/loyalty-daily

# Weekly inactivity + comeback coupons
curl http://localhost:3000/api/cron/loyalty-weekly

# Monthly VIP appreciation
curl http://localhost:3000/api/cron/loyalty-monthly
```

### Check Logs
```bash
# View server logs for errors
# Check terminal where npm run dev is running
```

---

## What's Next?

1. **Customize Email Templates:**
   - Edit `src/lib/emails/loyalty-emails.ts`
   - Add your branding
   - Customize messages

2. **Adjust Loyalty Rates:**
   - Use /dashboard/admin/loyalty-config
   - Test different point values
   - Find optimal rates

3. **Create Promotional Coupons:**
   - Seasonal sales (SUMMER2025)
   - First-time buyer (FIRST10)
   - Bulk discounts (BUY3GET20)

4. **Deploy to Production:**
   - Push to GitHub
   - Deploy to Vercel
   - Enable cron jobs
   - Start marketing!

---

**Testing Time:** ~10-15 minutes  
**All features should work perfectly on first try!** 🎉

**Questions?** Check `MODULE_5_COMPLETE_DOCUMENTATION.md` for detailed docs.



