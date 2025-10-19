# Module 4: Quick Testing Guide

## ⚡ 5-Minute Quick Test

### Step 1: Seed Products (1 minute)
```bash
npm run seed:products
```

**Expected Output:**
```
✅ Created: Cooling Aftershave Balm (Stock: 45)
✅ Created: Ethiopian Rose Body Oil (Stock: 28)
...
🎉 Seed completed successfully!
Created 20+ products across 8 categories
```

---

### Step 2: Test Admin Analytics (1 minute)

1. **Login as Admin:**
   ```
   Email: admin@dokimas.com
   Password: Test123!
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/dashboard/admin/analytics
   ```

3. **Verify:**
   - [ ] Page loads without errors
   - [ ] KPI cards display (may show 0 if no sales yet)
   - [ ] Charts render (may be empty)
   - [ ] Date range selector works
   - [ ] Refresh button functions

---

### Step 3: Test Inventory Dashboard (1 minute)

1. **Navigate to:**
   ```
   http://localhost:3000/dashboard/admin/inventory
   ```

2. **Verify:**
   - [ ] Products list displays (20+ products)
   - [ ] Stock counts are correct
   - [ ] Low stock items highlighted in red (if any)
   - [ ] Category filter works
   - [ ] Low stock banner appears (if applicable)

3. **Test Stock Adjustment:**
   - Find any product
   - Enter quantity: `5`
   - Click `+` button
   - [ ] Stock increases by 5
   - [ ] Success toast appears
   - [ ] Table updates immediately

---

### Step 4: Test POS System (2 minutes)

1. **Login as Retail Manager:**
   ```
   Email: retail@dokimas.com
   Password: Test123!
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/dashboard/retail/pos
   ```

3. **Complete a Test Sale:**
   - Type in search: `Rose` (or any product name)
   - Click product from dropdown to add to cart
   - [ ] Product appears in cart
   - Adjust quantity using +/- buttons
   - Select payment method: `Cash`
   - Click **Complete Sale**
   - [ ] Success message appears
   - [ ] Receipt print option shows
   - [ ] Today's stats update

4. **Verify Stock Reduced:**
   - Go to: `/dashboard/retail/inventory`
   - Find the product you sold
   - [ ] Stock decreased by quantity sold

---

### Step 5: Test Payment Approval Flow (Advanced - 3 minutes)

1. **As Customer (new tab/incognito):**
   ```
   http://localhost:3000/shop
   ```
   - Add a product to cart
   - Proceed to checkout
   - Fill shipping info
   - Select payment method: `TeleBirr`
   - Upload any image as payment proof
   - Submit order
   - Note the order number

2. **As Admin:**
   ```
   http://localhost:3000/dashboard/admin/orders
   ```
   - Find the new order
   - Click **Approve** button
   - [ ] Payment status → "Approved"
   - [ ] Success message appears

3. **Verify Inventory Reduced:**
   ```
   http://localhost:3000/dashboard/admin/inventory
   ```
   - Find the product from the order
   - [ ] Stock decreased by ordered quantity
   - [ ] If stock is low (≤10), red highlight appears

4. **Check Analytics Updated:**
   ```
   http://localhost:3000/dashboard/admin/analytics
   ```
   - [ ] Today's revenue increased
   - [ ] Today's orders count increased

---

## 🔍 API Endpoint Tests

### Test Inventory API
```bash
# List all products with stock
curl http://localhost:3000/api/inventory

# Get low stock products
curl http://localhost:3000/api/inventory/low-stock

# Adjust stock (requires authentication)
# Use browser's dev tools or Postman
```

### Test Analytics API
```bash
# Get dashboard stats
curl http://localhost:3000/api/analytics

# Get revenue data
curl http://localhost:3000/api/analytics/revenue?days=7

# Get top products
curl http://localhost:3000/api/analytics/products?limit=5
```

### Test Sales API
```bash
# Get sales list
curl http://localhost:3000/api/sales

# Get sales report
curl http://localhost:3000/api/sales/report?startDate=2024-10-01&endDate=2024-10-18
```

---

## 📧 Test Email Reports (Manual Trigger)

### 1. Daily Sales Report
```bash
curl http://localhost:3000/api/cron/daily-report
```

**Expected:**
- Email sent to admin email
- Check inbox for "Daily Sales Report"

### 2. Weekly Sales Report
```bash
curl http://localhost:3000/api/cron/weekly-report
```

**Expected:**
- Email sent with week's summary
- Includes top 5 products table

### 3. Low Stock Check
```bash
curl http://localhost:3000/api/cron/low-stock-check
```

**Expected:**
- If low stock products exist: Email sent
- If none: No email (check server logs)

---

## ✅ Verification Checklist

### Inventory Management
- [ ] Products display with correct stock levels
- [ ] Manual stock adjustment works (+/-)
- [ ] Low stock items highlighted
- [ ] Stock history accessible
- [ ] Low stock email sent (if threshold reached)

### POS System
- [ ] Product search works (name/SKU)
- [ ] Add to cart functional
- [ ] Quantity controls work
- [ ] Payment methods selectable
- [ ] Sale completes successfully
- [ ] Stock reduces immediately
- [ ] Receipt can be printed
- [ ] Today's stats update

### Sales Tracking
- [ ] Sales created for POS transactions
- [ ] Sales created for approved orders
- [ ] Source correctly marked (online/retail)
- [ ] Revenue calculations accurate
- [ ] Sales reports generated

### Analytics Dashboard
- [ ] KPI cards display correct values
- [ ] Revenue chart renders
- [ ] Top products chart shows data
- [ ] Category breakdown accurate
- [ ] Date filters work (7/30/90/365 days)
- [ ] Growth percentages calculate
- [ ] Refresh updates data

### Email Automation
- [ ] Daily report email template correct
- [ ] Weekly report includes top products
- [ ] Low stock alert lists products
- [ ] Manual triggers work
- [ ] Scheduled cron configuration valid

---

## 🐛 Common Issues & Solutions

### Issue: Charts not rendering
**Solution:** 
```bash
npm install recharts
npm run dev
```

### Issue: No products in inventory
**Solution:** 
```bash
npm run seed:products
```

### Issue: Analytics showing 0
**Solution:** 
- Create some sales via POS
- Or approve some customer orders
- Then refresh analytics

### Issue: Email not sending
**Solution:** 
- Check `.env.local` has SMTP settings
- Verify `ADMIN_EMAIL` is set
- Check server logs for errors

### Issue: Stock not reducing on approval
**Solution:** 
- Check browser console for errors
- Verify API route `/api/payments/[id]/approve` is working
- Check server logs

### Issue: POS sale fails
**Solution:** 
- Ensure product has sufficient stock
- Check that you're logged in as retail/admin
- Verify API route `/api/pos/sale` is accessible

---

## 📊 Expected Results

### After Seeding Products:
- 20+ products created
- Various stock levels (3-60 units)
- 5 featured products
- 8 categories

### After First POS Sale:
- Product stock decreased
- Sale record in database
- InventoryLog entry created
- Analytics updated
- Today's stats show sale

### After Payment Approval:
- Order status: "Approved"
- Product stock reduced
- Sale record created (online source)
- Customer email sent
- If stock low: Admin email sent
- Analytics updated

---

## 🎯 Success Criteria

All tests pass when:
- ✅ All 20+ products display in inventory
- ✅ Stock adjustments work in both directions
- ✅ POS completes sales successfully
- ✅ Payment approvals reduce stock
- ✅ Analytics show accurate data
- ✅ Charts render with data
- ✅ Email reports can be triggered
- ✅ Low stock alerts function
- ✅ No console errors
- ✅ All dashboards load quickly

---

## 🚀 Next Steps After Testing

1. **Customize Email Templates** (`src/lib/email-reports.ts`)
2. **Adjust Stock Thresholds** (Product model `restockThreshold`)
3. **Configure Cron Schedule** (`vercel.json`)
4. **Add More Products** (via admin dashboard or seed script)
5. **Deploy to Production** (Vercel deployment)

---

## 📚 Related Documentation

- `MODULE_4_COMPLETE.md` - Full feature documentation
- `DOKIMAS_COSMETICS_SPECIFICATION.md` - Original spec
- `PROJECT_STATUS.md` - Overall project status

---

**Testing Time: ~5-10 minutes**
**All features should work on first try! 🎉**



