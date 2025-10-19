# 🗄️ MongoDB Atlas Setup Guide

## ⚠️ Current Issue

You're getting an authentication error because the database user needs proper permissions.

---

## 🔧 Step-by-Step Fix

### 1. Go to MongoDB Atlas Dashboard

Visit: https://cloud.mongodb.com/

### 2. Check Database User Permissions

1. Click on your cluster: **Cluster0**
2. Click on **"Database Access"** in the left sidebar
3. Find your user: **dakimas**
4. Click **"Edit"** on the user

### 3. Set Proper Permissions

**Option A: Admin Access (Recommended for Development)**
- Under "Database User Privileges"
- Select: **"Atlas admin"**
- Click **"Update User"**

**Option B: Read and Write (More Restrictive)**
- Under "Built-in Role"
- Select: **"Read and write to any database"**
- Click **"Update User"**

### 4. Verify Password

Make sure the password is exactly: `Daki_1234`

If you're unsure:
1. Click **"Edit"** on the user
2. Click **"Edit Password"**
3. Set new password: `Daki_1234`
4. Click **"Update User"**

### 5. Check IP Whitelist

1. Click **"Network Access"** in the left sidebar
2. Make sure you have one of these:
   - **0.0.0.0/0** (Allow access from anywhere - for development)
   - Your current IP address

To add:
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"**
3. Click **"Confirm"**

---

## 🔗 Connection String Format

Your connection string should look like this:

```
mongodb+srv://USERNAME:PASSWORD@cluster0.0gwcnq5.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority&appName=Cluster0
```

Where:
- **USERNAME**: dakimas
- **PASSWORD**: Daki_1234 (URL encoded if special characters)
- **DATABASE_NAME**: dokimas_cosmetics

---

## 🧪 Test Connection

### Option 1: Using Seed Script

```bash
npm run seed
```

### Option 2: Using MongoDB Compass

1. Download: https://www.mongodb.com/products/compass
2. Paste your connection string
3. Click "Connect"
4. You should see your cluster

### Option 3: Using mongosh (MongoDB Shell)

```bash
mongosh "mongodb+srv://dakimas:Daki_1234@cluster0.0gwcnq5.mongodb.net/dokimas_cosmetics"
```

---

## 🔐 Password Special Characters

If your password has special characters, you need to URL encode them:

| Character | URL Encoded |
|-----------|-------------|
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| [ | %5B |
| ] | %5D |
| % | %25 |

Example: If password is `Pass@123!`, use `Pass%40123!`

Your current password `Daki_1234` doesn't have special characters, so it's fine.

---

## ✅ After Fixing Permissions

Once you've updated the user permissions in Atlas:

### 1. Update .env.local (Already Done)

The file is already created with your connection string.

### 2. Run Seed Script

```bash
npm run seed
```

Expected output:
```
✅ MongoDB Connected
🌱 Starting seed process...
✅ Created Admin User
✅ Created Retail Manager
✅ Created Customer User
🎉 Seed completed successfully!
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test Login

Visit: http://localhost:3000/login

Use these test accounts:
- **Admin**: admin@dokimas.com / Test123!
- **Retail Manager**: retail@dokimas.com / Test123!
- **Customer**: customer@dokimas.com / Test123!

---

## 🐛 Still Having Issues?

### Check Database Name

Make sure the database exists in Atlas:
1. Go to your cluster
2. Click **"Collections"**
3. You should see **"dokimas_cosmetics"** database
4. If not, it will be created automatically when seed script runs successfully

### Check Connection String

Verify your connection string in `.env.local`:

```bash
cat .env.local | grep MONGODB_URI
```

Should show:
```
MONGODB_URI=mongodb+srv://dakimas:Daki_1234@cluster0.0gwcnq5.mongodb.net/dokimas_cosmetics?retryWrites=true&w=majority&appName=Cluster0&authSource=admin
```

### Try Creating New User

If the current user has issues:

1. In Atlas, go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `dokimas_admin`
4. Password: `Test123456!`
5. Database User Privileges: **"Atlas admin"**
6. Click **"Add User"**

Then update `.env.local`:
```env
MONGODB_URI=mongodb+srv://dokimas_admin:Test123456!@cluster0.0gwcnq5.mongodb.net/dokimas_cosmetics?retryWrites=true&w=majority&appName=Cluster0
```

---

## 📊 Verify Data in Atlas

After successful seed:

1. Go to your cluster in Atlas
2. Click **"Browse Collections"**
3. Select database: **dokimas_cosmetics**
4. Select collection: **users**
5. You should see 3 users:
   - admin@dokimas.com
   - retail@dokimas.com
   - customer@dokimas.com

---

## 🚀 Quick Fix Summary

**Most Common Solution:**

1. Go to: https://cloud.mongodb.com/
2. Database Access → dakimas → Edit
3. Set privileges to: **"Atlas admin"**
4. Save
5. Run: `npm run seed`

---

## 💡 Alternative: Use MongoDB Locally

If Atlas continues to have issues, you can use local MongoDB:

```bash
# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/dokimas_cosmetics
```

---

## 📞 Need More Help?

1. Check MongoDB Atlas logs
2. Verify network connectivity
3. Try connection from MongoDB Compass
4. Check firewall settings

---

**Next Step:** Go to MongoDB Atlas and update user permissions, then run `npm run seed` again.







