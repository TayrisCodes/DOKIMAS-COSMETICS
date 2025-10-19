# 🚀 Deployment Guide - Dokimas Cosmetics

This guide will help you deploy the Dokimas Cosmetics application to Vercel and push to GitHub.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup

Before deploying, you need to set up environment variables. These values are NOT included in git for security reasons.

#### Required for Basic Operation:
- `MONGODB_URI` - Your MongoDB connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., https://dokimas.vercel.app)

#### Required for PWA/Push Notifications:
- `VAPID_PUBLIC_KEY` - Generate with `npx web-push generate-vapid-keys`
- `VAPID_PRIVATE_KEY` - From same command above
- `VAPID_CONTACT` - Your admin email (e.g., mailto:admin@dokimas.com)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Same value as `VAPID_PUBLIC_KEY`
- `CRON_SECRET` - Random secret for protecting cron endpoints

#### Optional (for full functionality):
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - For image uploads
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `STRIPE_SECRET_KEY` - For Stripe payments
- `EMAIL_USER`, `EMAIL_PASSWORD` - For sending emails

### 2. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

Save the output - you'll need both keys!

## 📦 GitHub Deployment

### Step 1: Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Dokimas Cosmetics with PWA + Push Notifications"
```

### Step 2: Add Remote and Push

```bash
git remote add origin https://github.com/TayrisCodes/DOKIMAS-COSMETICS.git
git branch -M main
git push -u origin main
```

## 🌐 Vercel Deployment

### Method 1: Automatic (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables (see list above)
5. Click "Deploy"

### Method 2: Manual via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## 🔧 Environment Variables in Vercel

### Setting Environment Variables:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add each variable with these scopes:
   - Production
   - Preview  
   - Development

### Copy-Paste Template for Vercel:

```
MONGODB_URI=mongodb+srv://your-connection-string
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# VAPID Keys (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_CONTACT=mailto:admin@dokimas.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

# Cron Secret
CRON_SECRET=your-random-secret

# Optional
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

STRIPE_SECRET_KEY=sk_test_or_live_key

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## ⚙️ Post-Deployment Configuration

### 1. Verify Cron Jobs

In Vercel Dashboard:
1. Go to your project
2. Settings → Cron Jobs
3. Verify these are scheduled:
   - `/api/cron/notifications-daily` - Daily at 9 AM UTC
   - `/api/cron/notifications-weekly` - Mondays at 9 AM UTC
   - (Other existing cron jobs)

### 2. Test PWA Features

1. Visit your deployed site
2. Open DevTools → Application
3. Check:
   - ✅ Service Worker is registered
   - ✅ Manifest is valid
   - ✅ Install prompt appears (may need to wait a bit)

### 3. Test Push Notifications

1. Go to `/settings/notifications`
2. Enable notifications
3. Send test notification
4. Verify you receive it

### 4. Create Admin User

```bash
# Connect to your MongoDB
mongosh "your-mongodb-uri"

# Update a user to admin
use your_database
db.users.updateOne(
  { email: "admin@dokimas.com" },
  { $set: { role: "admin" } }
)
```

## 🔍 Troubleshooting

### Build Fails with TypeScript Errors

Vercel uses TypeScript's `noEmit` mode, which won't fail on type errors. If build fails:

1. Check the build logs in Vercel
2. Most common issues:
   - Missing environment variables
   - Syntax errors (not type errors)
   - Missing dependencies

### Service Worker Not Working

1. Ensure HTTPS (Vercel provides this automatically)
2. Check that `/sw.js` is accessible at: `https://yourdomain.com/sw.js`
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Push Notifications Not Working

1. Verify VAPID keys are set correctly in Vercel
2. Check that `NEXT_PUBLIC_VAPID_PUBLIC_KEY` matches `VAPID_PUBLIC_KEY`
3. Test in Chrome/Edge (best support)
4. Check browser console for errors

### Cron Jobs Not Running

1. Verify `CRON_SECRET` is set in Vercel
2. Test manually:
   ```bash
   curl -X POST https://yourdomain.com/api/cron/notifications-daily \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. Check function logs in Vercel Dashboard

## 📊 Monitoring

### Check Deployment Status

```bash
vercel logs
```

### Monitor Database

Use MongoDB Atlas dashboard to monitor:
- Connection count
- Database size
- Slow queries

### Check PWA Installation

Google Analytics + Custom Events:
```javascript
// Track PWA install
window.addEventListener('appinstalled', () => {
  // Track this event
});
```

## 🔄 Update Deployment

### Push Updates:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically deploy new commits to `main` branch.

### Rollback if Needed:

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## 📝 Important Notes

### TypeScript Errors

The codebase currently has ~69 TypeScript errors. These are mostly:
- Next.js 15 async params type mismatches (existing code)
- Zod validation types (existing code)

**These do NOT block deployment** - Next.js builds successfully despite type errors.

To fix these in the future:
1. Update route handlers to use `async` params
2. Update Zod error handling

### MongoDB Indexes

After first deployment, create indexes for better performance:

```javascript
// Subscriptions
db.subscriptions.createIndex({ userId: 1 });
db.subscriptions.createIndex({ endpoint: 1 }, { unique: true });

// Notifications
db.notifications.createIndex({ userId: 1, sentAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1 });

// Notification Preferences
db.notificationpreferences.createIndex({ userId: 1 }, { unique: true });
```

### Security

1. Never commit `.env.local` or `.env`
2. Rotate secrets regularly
3. Use different secrets for dev/prod
4. Enable 2FA on Vercel and GitHub
5. Set up MongoDB IP whitelist

### Performance

1. Enable Vercel Analytics
2. Use Vercel Edge Functions for critical APIs
3. Monitor MongoDB slow queries
4. Implement Redis caching for heavy queries (future enhancement)

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] VAPID keys generated and added
- [ ] MongoDB connection string configured
- [ ] Cron jobs verified in Vercel
- [ ] Test deployment on Vercel preview URL
- [ ] Service worker loads correctly
- [ ] Push notifications work
- [ ] Admin user created
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Database indexes created
- [ ] First product added
- [ ] Test order flow end-to-end

## 🎉 Success!

Your Dokimas Cosmetics app is now live with:
- ✅ Progressive Web App
- ✅ Push Notifications
- ✅ E-commerce functionality
- ✅ Admin dashboard
- ✅ Loyalty system
- ✅ And much more!

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)

---

**Need Help?**

Check the documentation files:
- `PWA_QUICK_START.md` - PWA setup
- `PWA_PUSH_SETUP.md` - Detailed PWA guide
- `README.md` - Project overview

Good luck with your deployment! 🚀

