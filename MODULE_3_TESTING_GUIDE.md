# 🧪 MODULE 3 - E-COMMERCE TESTING GUIDE

## ⚡ Quick 10-Minute Test

**Server Status:** ✅ Running at http://localhost:3000

---

## 🎯 Complete Test Flow

### STEP 1: Add Product to Cart (2 minutes)

**Prerequisites:**
- At least one product exists in your database
- You're logged in as a customer

**Steps:**
```
1. Go to: http://localhost:3000/shop
2. Find any product
3. Click product to view details
4. Click "Add to Cart" button
5. Verify success toast appears
6. Check cart icon (should show item count)
```

**Expected Result:**
- ✅ Success message: "Item added to cart"
- ✅ Cart icon updates with count
- ✅ Product added to cart

---

### STEP 2: View and Manage Cart (2 minutes)

**Steps:**
```
1. Go to: http://localhost:3000/cart
2. Verify your product is listed
3. Click "+" button to increase quantity
4. Click "-" button to decrease quantity
5. Verify total updates in real-time
6. Try "Remove" button
7. Add product back to cart
```

**Expected Result:**
- ✅ Product displays with image, name, price
- ✅ Quantity controls work
- ✅ Total recalculates automatically
- ✅ Remove button works
- ✅ Free shipping notice shows if subtotal >= $50

---

### STEP 3: Checkout Process (3 minutes)

**Steps:**
```
1. In cart page, click "Proceed to Checkout"
2. Fill shipping form:
   Name: Test Customer
   Phone: +251 911 234 567
   Street: 123 Main Street
   City: Addis Ababa
   State: Addis Ababa
   Zip: 1000
3. Select Payment Method: TeleBirr
4. Add order notes (optional): "Please call before delivery"
5. Click "Continue to Payment"
```

**Expected Result:**
- ✅ Form validates all fields
- ✅ Redirects to payment upload step
- ✅ Order created in database
- ✅ Order confirmation email sent
- ✅ Cart is cleared

---

### STEP 4: Upload Payment Proof (2 minutes)

**Steps:**
```
1. On payment upload screen
2. Read payment instructions
3. Click upload area or drag-and-drop
4. Select any image file (screenshot, photo, etc.)
5. Enter transaction reference: TEST123456789
6. Click "Submit Payment"
```

**Expected Result:**
- ✅ File uploads successfully
- ✅ Success toast appears
- ✅ Redirects to success screen
- ✅ Order payment status → "under_review"
- ✅ Can view order in customer dashboard

**Skip Option:**
- ✅ Can click "Skip for now" to upload later
- ✅ Order still created with "pending" status

---

### STEP 5: View Order Status (1 minute)

**Steps:**
```
1. Go to: http://localhost:3000/dashboard/customer/orders
2. See your recent order
3. Check payment status badge
4. Check order status badge
5. Click "View Details"
```

**Expected Result:**
- ✅ Order appears in list
- ✅ Payment status shows "Under Review"
- ✅ Order status shows "Processing"
- ✅ Order number and date visible
- ✅ Total amount correct

---

### STEP 6: Admin Approve Payment (2 minutes)

**Steps:**
```
1. Logout from customer account
2. Login as admin:
   Email: admin@dokimas.com
   Password: Test123!
3. Go to: http://localhost:3000/dashboard/admin/orders
4. See order in "Under Review" section
5. Click "View Details" (when implemented)
6. View payment proof image
7. Click "Approve" button
8. Check customer email
```

**Expected Result:**
- ✅ Order visible in admin dashboard
- ✅ Payment proof image displays
- ✅ Approve button changes status
- ✅ Payment status → "Approved"
- ✅ Order status → "Processing"
- ✅ Email sent to customer
- ✅ Admin can add notes

---

### STEP 7: Reject Payment (Optional Test)

**Steps:**
```
1. As admin, find an order
2. Click "Reject" button
3. Add rejection reason in notes
4. Confirm rejection
5. Check customer email
```

**Expected Result:**
- ✅ Payment status → "Rejected"
- ✅ Email sent with reason
- ✅ Customer can re-upload proof

---

## 📋 Feature Checklist

### Cart Features
- [ ] Add to cart works
- [ ] Quantity increase works
- [ ] Quantity decrease works
- [ ] Remove item works
- [ ] Cart total calculates correctly
- [ ] Free shipping shows at $50+
- [ ] Empty cart shows empty state
- [ ] Clear cart works

### Checkout Features
- [ ] Shipping form validates all fields
- [ ] Payment method selection works
- [ ] Order notes optional
- [ ] Order creates successfully
- [ ] Cart clears after order
- [ ] Redirects to payment upload

### Payment Upload
- [ ] File upload works
- [ ] File type validation works
- [ ] File size validation works
- [ ] Reference number required
- [ ] Success screen displays
- [ ] Skip option works
- [ ] Payment proof saves to order

### Admin Dashboard
- [ ] Statistics display correctly
- [ ] Orders list loads
- [ ] Payment status badges show
- [ ] Order status badges show
- [ ] Approve button works
- [ ] Reject button works
- [ ] Status updates save
- [ ] Emails trigger correctly

### Customer Dashboard
- [ ] Orders list displays
- [ ] Status badges accurate
- [ ] Upload prompt shows if needed
- [ ] View details works
- [ ] Re-upload option available if rejected

---

## 🔍 Edge Cases to Test

### 1. Out of Stock Product
```
Test: Try adding product with stock = 0
Expected: Error message, can't add to cart
```

### 2. Stock Limit
```
Test: Try adding more than available stock
Expected: Error message, quantity limited to stock
```

### 3. Empty Cart Checkout
```
Test: Try accessing /checkout with empty cart
Expected: Redirect to /shop
```

### 4. Unauthenticated Access
```
Test: Try /cart without login
Expected: Redirect to /login
```

### 5. Role Permission
```
Test: Customer trying to access /dashboard/admin/orders
Expected: Redirect to customer dashboard
```

### 6. Large File Upload
```
Test: Upload payment proof > 5MB
Expected: Error message, upload rejected
```

### 7. Wrong File Type
```
Test: Upload PDF or document as payment proof
Expected: Error message, only images allowed
```

---

## 📧 Email Testing

### Verify Emails Sent:
```
1. Order Confirmation
   - When: Order created
   - To: Customer
   - Check: Gmail inbox

2. Payment Approved
   - When: Admin approves
   - To: Customer
   - Check: Gmail inbox

3. Payment Rejected
   - When: Admin rejects
   - To: Customer
   - Check: Gmail inbox

4. Order Shipped
   - When: Status → Shipped
   - To: Customer
   - Check: Gmail inbox

5. Order Delivered
   - When: Status → Delivered
   - To: Customer
   - Check: Gmail inbox
```

---

## 🐛 Common Issues & Fixes

### Cart Items Not Showing
**Causes:**
- Not logged in
- Database connection issue
- Products deleted

**Fix:**
- Login as customer
- Check MongoDB connection
- Verify products exist with isActive: true

### Payment Upload Fails
**Causes:**
- Cloudinary not configured
- File too large
- Wrong file type

**Fix:**
- Set Cloudinary credentials in `.env.local`
- Use file < 5MB
- Use JPEG/PNG/WebP only

### Emails Not Sending
**Causes:**
- SMTP not configured
- Wrong credentials
- Gmail security blocking

**Fix:**
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail first
- Check SMTP settings

### Orders Not Appearing
**Causes:**
- Order creation failed
- Database issue
- Permission error

**Fix:**
- Check terminal for errors
- Verify MongoDB connection
- Check user authentication

---

## ✅ Success Criteria

Module 3 is working if:

1. ✅ Can add products to cart
2. ✅ Cart updates and displays correctly
3. ✅ Checkout creates order
4. ✅ Payment proof uploads
5. ✅ Admin can approve/reject
6. ✅ Emails are sent correctly
7. ✅ Statuses update properly
8. ✅ All roles have correct permissions

---

## 🎊 What's Next?

After testing Module 3:

### Immediate Improvements
- Add "Add to Cart" button on shop page product cards
- Add cart icon in header/navbar
- Add quick view modal for products
- Add wishlist functionality

### Module 4: Advanced Features
- Product reviews & ratings
- Order cancellation
- Refund processing
- Invoice generation
- Advanced analytics

### Module 5: CRM & Marketing
- Loyalty points
- Coupon system
- Email campaigns
- Abandoned cart recovery
- Customer segmentation

---

## 📞 Need Help?

If something doesn't work:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify environment variables
4. Check MongoDB connection
5. Verify user authentication
6. Review API responses in Network tab

---

## 🎉 Testing Complete!

Once all tests pass, your e-commerce system is **fully operational** and ready for real customers!

**Congratulations on building a complete e-commerce platform!** 🎊

---

**Next:** Test everything, then move to Module 4 for advanced features!




