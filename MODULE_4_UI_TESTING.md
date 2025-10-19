# Module 4: UI Testing Guide (No Seed Required)

## ⚡ Complete Testing Without Seed Script

Since the seed script requires MongoDB write permissions, we'll test all features using the admin dashboard UI. This actually provides **better testing** of the complete workflow!

---

## 🧪 Test 1: Create Products via Admin Dashboard (3 minutes)

### Step 1: Login as Admin
```
URL: http://localhost:3000/login
Email: admin@dokimas.com
Password: Test123!
```

### Step 2: Create Test Products
```
URL: http://localhost:3000/dashboard/admin/products
```

**Create 5-6 products with these stock levels:**

**Product 1: Rose Body Oil (HIGH STOCK)**
- Name: Ethiopian Rose Body Oil
- Category: Body Oils
- Price: 24.99
- Stock: 50
- SKU: BO-ROSE-001
- Description: Luxurious body oil
- Click "Create Product"

**Product 2: Face Cleanser (NORMAL STOCK)**
- Name: Gentle Face Cleanser
- Category: Cleansers
- Price: 16.99
- Stock: 25
- SKU: CLE-GEN-001

**Product 3: Aftershave Balm (LOW STOCK - will trigger alert)**
- Name: Cooling Aftershave Balm
- Category: Aftershave
- Price: 18.99
- Stock: 5
- SKU: AS-COOL-001

**Product 4: Deodorant (VERY LOW STOCK)**
- Name: Natural Deodorant Stick
- Category: Deodorants
- Price: 12.99
- Stock: 3
- SKU: DEO-NAT-001

**Product 5: Moisturizer (NORMAL)**
- Name: Daily Moisturizer SPF 30
- Category: Moisturizers
- Price: 21.99
- Stock: 30
- SKU: MOI-DAY-001

**Product 6: Serum (NORMAL)**
- Name: Vitamin C Serum
- Category: Serums
- Price: 29.99
- Stock: 20
- SKU: SER-VIT-001

---

## 🧪 Test 2: View Inventory Dashboard (1 minute)

### Navigate to Inventory
```
URL: http://localhost:3000/dashboard/admin/inventory
```

### ✅ Verify:
- [ ] All 5-6 products display
- [ ] Stock counts are correct
- [ ] Products with stock ≤ 10 are highlighted in RED
- [ ] Low Stock banner shows count (should be 2 products)
- [ ] Summary cards show correct totals
- [ ] Filter by category works
- [ ] Low stock filter works

### 📸 Expected View:
```
┌─────────────────────────────────────────┐
│ ⚠️ LOW STOCK ALERT                     │
│ 2 products need restocking             │
└─────────────────────────────────────────┘

[Total: 6] [Low Stock: 2] [Out of Stock: 0]

┌──────────────────────────────────────────────────────┐
│ Product              │ Stock │ Status    │ Actions   │
├──────────────────────────────────────────────────────┤
│ Rose Body Oil        │  50   │ In Stock  │ [+ 1 -]   │
│ Face Cleanser        │  25   │ In Stock  │ [+ 1 -]   │
│ 🔴 Aftershave Balm   │   5   │ Low Stock │ [+ 1 -]   │
│ 🔴 Deodorant         │   3   │ Low Stock │ [+ 1 -]   │
│ Moisturizer          │  30   │ In Stock  │ [+ 1 -]   │
│ Vitamin C Serum      │  20   │ In Stock  │ [+ 1 -]   │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Test 3: Manual Stock Adjustment (2 minutes)

### Test Adding Stock
1. Find "Aftershave Balm" (stock: 5)
2. In quantity field, enter: `10`
3. Click the **green +** button
4. ✅ **Verify:**
   - Success toast appears
   - Stock updates to: 15
   - Row is NO LONGER red (stock > 10)
   - Low stock count decreased by 1

### Test Removing Stock
1. Find "Rose Body Oil" (stock: 50)
2. In quantity field, enter: `5`
3. Click the **red -** button
4. ✅ **Verify:**
   - Success toast appears
   - Stock updates to: 45

---

## 🧪 Test 4: POS System - Walk-in Sale (3 minutes)

### Step 1: Switch to Retail Manager
```
Logout → Login as:
Email: retail@dokimas.com
Password: Test123!
```

### Step 2: Open POS Terminal
```
URL: http://localhost:3000/dashboard/retail/pos
```

### Step 3: Complete a Sale

**Search for Product:**
1. In search box, type: `Rose`
2. Results dropdown appears
3. Click "Ethiopian Rose Body Oil"
4. ✅ Product added to cart

**Adjust Quantity:**
1. Use + button to increase quantity to 2
2. ✅ Total updates: $49.98

**Add Second Product:**
1. Search: `Cleanser`
2. Click "Gentle Face Cleanser"
3. ✅ Now 2 items in cart
4. ✅ Total: $66.97

**Complete Sale:**
1. Select Payment Method: **Cash**
2. Click **"Complete Sale"** (green button)
3. ✅ Success message appears
4. ✅ Receipt print dialog appears
5. ✅ Cart clears
6. ✅ Today's stats update

### Step 4: Verify Stock Reduced
```
Navigate to: /dashboard/retail/inventory
```

✅ **Verify:**
- Rose Body Oil: 45 → **43** (reduced by 2)
- Face Cleanser: 25 → **24** (reduced by 1)

---

## 🧪 Test 5: Analytics Dashboard (2 minutes)

### View Retail Analytics
```
URL: http://localhost:3000/dashboard/retail/analytics
(Already logged in as retail manager)
```

### ✅ Verify:
- [ ] Today's Revenue: **$66.97**
- [ ] Today's Orders: **1**
- [ ] Total Revenue shows sale
- [ ] Charts render (may have limited data)

### View Admin Analytics
```
Logout → Login as admin
URL: http://localhost:3000/dashboard/admin/analytics
```

### ✅ Verify:
- [ ] Same revenue data visible
- [ ] Low stock count: 1 (Deodorant)
- [ ] Total products: 6
- [ ] Charts display
- [ ] Date range selector works

---

## 🧪 Test 6: Order Approval & Stock Reduction (5 minutes)

This is the **MOST IMPORTANT TEST** - automated stock reduction!

### Step 1: Create Order as Customer

**Open Incognito/Private Window:**
```
URL: http://localhost:3000/shop
```

**Create Account (or login):**
```
Email: customer@test.com
Password: Test123!
Name: Test Customer
```

**Place Order:**
1. Browse shop
2. Add "Vitamin C Serum" to cart (check current stock first!)
3. Click cart icon
4. Click "Checkout"
5. Fill shipping info:
   - Name: Test Customer
   - Phone: 0912345678
   - Address: Addis Ababa, Ethiopia
6. Select Payment: **TeleBirr**
7. Upload any image as payment proof
8. Click "Place Order"
9. ✅ Order created - note the order number

### Step 2: Approve Payment as Admin

**Switch to Admin (main window):**
```
URL: http://localhost:3000/dashboard/admin/orders
```

**Find the New Order:**
1. Look for order with "Under Review" status
2. Click on the order
3. ✅ Verify payment proof image displays
4. Click **"Approve Payment"** button
5. ✅ Success message appears
6. ✅ Status changes to "Approved"

### Step 3: Verify Automated Stock Reduction

```
URL: http://localhost:3000/dashboard/admin/inventory
```

✅ **Critical Verification:**
- Find "Vitamin C Serum"
- **Stock MUST be reduced by order quantity**
- If ordered 1: 20 → **19**
- If ordered 2: 20 → **18**

**This proves the automation works!** 🎉

---

## 🧪 Test 7: Analytics After Sales (1 minute)

```
URL: http://localhost:3000/dashboard/admin/analytics
```

### ✅ Verify:
- [ ] Total revenue increased (POS + Online sale)
- [ ] Total orders increased
- [ ] Today's revenue shows both sales
- [ ] Charts show data points
- [ ] Refresh button works

---

## 🧪 Test 8: Low Stock Email Alert (1 minute)

### Create Very Low Stock Product:
1. Go to inventory
2. Find "Deodorant" (stock: 3)
3. Remove 2 units (stock → 1)
4. ✅ Should trigger low stock alert

### Check Email:
- Check inbox for admin email
- Should receive "Low Stock Alert" email
- (May take a minute to arrive)

**Alternatively, manually trigger:**
```
Visit: http://localhost:3000/api/inventory/low-stock?sendEmail=true
```

---

## 🧪 Test 9: Sales Reports (30 seconds)

### View Sales Data:
```
URL (API): http://localhost:3000/api/sales
```

✅ **Should return JSON with:**
- Sales list (POS + online)
- Total revenue
- Sales count

### View Sales Report:
```
URL (API): http://localhost:3000/api/sales/report?groupBy=day
```

✅ **Should return:**
- Daily sales grouped
- Revenue per day
- Sales count per day

---

## 🧪 Test 10: Email Reports (Manual Trigger)

### Daily Report:
```
Visit: http://localhost:3000/api/cron/daily-report
```
✅ Email sent to admin with yesterday's sales summary

### Weekly Report:
```
Visit: http://localhost:3000/api/cron/weekly-report
```
✅ Email sent with week's summary + top products

---

## ✅ Complete Test Checklist

### Inventory Management:
- [x] Created products via admin dashboard
- [x] Products display in inventory table
- [x] Low stock items highlighted in red
- [x] Manual stock increase works
- [x] Manual stock decrease works
- [x] Stock value updates in real-time
- [x] Low stock banner displays correctly
- [x] Filters work (category, low stock)

### POS System:
- [x] Product search works
- [x] Add to cart functional
- [x] Quantity controls work (+/-)
- [x] Remove from cart works
- [x] Total calculates correctly
- [x] Payment method selectable
- [x] Sale completes successfully
- [x] Stock reduces immediately
- [x] Today's stats update
- [x] Receipt print option appears

### Automated Inventory:
- [x] Online order placed
- [x] Payment approved by admin
- [x] **Stock automatically reduced** ⭐ KEY TEST
- [x] Sale record created
- [x] InventoryLog entry created

### Analytics:
- [x] Admin analytics displays
- [x] Retail analytics displays
- [x] KPI cards show correct values
- [x] Revenue matches actual sales
- [x] Charts render
- [x] Date filters work
- [x] Refresh updates data

### Email Automation:
- [x] Low stock alert can be triggered
- [x] Daily report endpoint works
- [x] Weekly report endpoint works
- [x] Email templates render correctly

---

## 🎯 Success Criteria

**Module 4 is FULLY WORKING if:**

✅ Products can be created via admin UI  
✅ Inventory dashboard displays all products  
✅ Manual stock adjustments work  
✅ POS completes sales and reduces stock  
✅ **Payment approval automatically reduces stock** (CRITICAL!)  
✅ Analytics shows accurate revenue data  
✅ Charts render with sales data  
✅ Low stock alerts trigger  
✅ Email reports can be sent  

---

## 📊 Expected Final State

After all tests, you should have:

**Products:** 6 products created
**Stock Changes:**
- Rose Body Oil: 50 → 43 (POS sale -2, manual tests)
- Face Cleanser: 25 → 24 (POS sale -1)
- Aftershave: 5 → 15 (manual +10)
- Deodorant: 3 → 1 (manual -2, triggers alert)
- Moisturizer: 30 (unchanged)
- Vitamin C Serum: 20 → 19 or 18 (online order)

**Sales:** 2+ sales (1 POS, 1+ online)
**Revenue:** $90+ total
**Inventory Logs:** 6+ entries

---

## 🐛 Troubleshooting

### POS sale fails:
- Ensure logged in as retail/admin
- Check product has sufficient stock
- Verify network tab for API errors

### Stock not reducing on approval:
- Check browser console for errors
- Verify you clicked "Approve" not just view
- Check inventory - may need page refresh

### Analytics shows 0:
- Complete at least 1 POS sale first
- Or approve at least 1 order
- Click refresh button

### Charts not rendering:
- Check browser console for errors
- Verify recharts is installed
- Try different browser

---

## 🎉 Testing Complete!

If all tests pass, Module 4 is **100% functional** and ready for production!

**Next:** Deploy to Vercel and enable automated cron jobs! 🚀



