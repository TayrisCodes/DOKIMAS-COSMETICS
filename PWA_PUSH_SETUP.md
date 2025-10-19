# PWA + Push Notifications Setup Guide

This guide explains how to set up and test the Progressive Web App (PWA) and Push Notification features for Dokimas Cosmetics.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [VAPID Keys Generation](#vapid-keys-generation)
3. [Testing Locally](#testing-locally)
4. [Production Deployment](#production-deployment)
5. [Testing Push Notifications](#testing-push-notifications)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Environment Setup

### Required Environment Variables

Add these variables to your `.env.local` (development) and Vercel environment variables (production):

```bash
# VAPID Keys for Web Push Notifications
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_CONTACT=mailto:your-email@domain.com

# Public VAPID key (exposed to client)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here

# Cron Secret (for protecting cron endpoints)
CRON_SECRET=your-random-secret-here

# Site URL (for email links and notifications)
NEXTAUTH_URL=https://your-domain.com
```

---

## 🔑 VAPID Keys Generation

### What are VAPID Keys?

VAPID (Voluntary Application Server Identification) keys are used to identify your application server to push services. They consist of a public/private key pair.

### Generate VAPID Keys

1. **Using web-push CLI** (recommended):

   ```bash
   npx web-push generate-vapid-keys
   ```

   This will output:
   ```
   Public Key: BFzKCMn5esQs0vo7q5Hc4QRT6r4X6gtbqyMADcT7SZtGaE...
   Private Key: YMjKGqzzzdlLawMh_iRBooXgn7G78bcKD4D4nKocHP4
   ```

2. **Copy the keys** to your `.env.local`:

   ```bash
   VAPID_PUBLIC_KEY=BFzKCMn5esQs0vo7q5Hc4QRT6r4X6gtbqyMADcT7SZtGaE...
   VAPID_PRIVATE_KEY=YMjKGqzzzdlLawMh_iRBooXgn7G78bcKD4D4nKocHP4
   VAPID_CONTACT=mailto:admin@dokimas.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFzKCMn5esQs0vo7q5Hc4QRT6r4X6gtbqyMADcT7SZtGaE...
   ```

⚠️ **IMPORTANT**: Keep your private key secret! Never commit it to version control or expose it to the client.

---

## 🧪 Testing Locally

### 1. Start Development Server

```bash
npm run dev
```

### 2. Access via HTTPS or localhost

Service Workers and Push Notifications require HTTPS or localhost. For local testing:

- ✅ `http://localhost:3000` - Works
- ✅ `https://your-domain.com` - Works
- ❌ `http://192.168.x.x:3000` - Doesn't work (use ngrok or similar)

### 3. Test PWA Installation

1. Open your app in Chrome/Edge
2. Look for the install prompt banner
3. Alternatively, check Chrome DevTools > Application > Manifest
4. Click "Install" to add the app to your home screen

### 4. Test Service Worker

1. Open Chrome DevTools > Application > Service Workers
2. Verify service worker is registered and running
3. Go offline (DevTools > Network > Offline)
4. Navigate to previously visited pages - they should load from cache

### 5. Test Push Notifications

**Step 1: Enable Notifications**

1. Navigate to `/settings/notifications`
2. Click "Enable Notifications"
3. Grant permission when prompted

**Step 2: Send Test Notification**

1. In notification settings, click "Send Test" button
2. You should receive a test notification

**Step 3: Test Order Notifications**

1. Create a test order (as customer)
2. Update order status (as admin) in `/dashboard/admin/orders`
3. Check that notification is received

**Step 4: Test New Product Notifications**

1. Create a new product (as admin) in `/dashboard/admin/products`
2. Users subscribed to that category should receive notification

---

## 🚀 Production Deployment

### Vercel Deployment

1. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables (see [Environment Setup](#environment-setup))

2. **Deploy**:
   ```bash
   git push origin main
   ```

3. **Verify Cron Jobs**:
   - Go to Vercel Dashboard > Deployments > Cron Jobs
   - Verify that `notifications-daily` and `notifications-weekly` are scheduled

### Vercel Cron Configuration

The cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications-daily",
      "schedule": "0 9 * * *"  // Daily at 9 AM UTC
    },
    {
      "path": "/api/cron/notifications-weekly",
      "schedule": "0 9 * * 1"  // Mondays at 9 AM UTC
    }
  ]
}
```

**Schedule Format**: `minute hour day month weekday` (cron syntax)

### Testing Cron Jobs in Production

You can manually trigger cron jobs using:

```bash
curl -X POST https://your-domain.com/api/cron/notifications-daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🧪 Testing Push Notifications

### Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Safari | ✅ (16.4+) | ✅ (16.4+) |
| Opera | ✅ | ✅ |

### Testing on Different Devices

**Desktop (Chrome/Edge)**:
1. Visit your site
2. Enable notifications
3. Minimize browser
4. Trigger a notification
5. Notification should appear in system tray

**Mobile (Android)**:
1. Visit your site in Chrome
2. Install PWA (Add to Home Screen)
3. Enable notifications
4. Close app
5. Trigger notification
6. Should appear in notification shade

**Mobile (iOS 16.4+)**:
1. Visit your site in Safari
2. Install PWA (Share > Add to Home Screen)
3. Enable notifications
4. Close app
5. Trigger notification
6. Should appear in notification center

### Admin Testing Tools

**Send Custom Notification** (Admin only):

POST `/api/push/send`:
```json
{
  "title": "New Summer Collection",
  "body": "Check out our new arrivals!",
  "url": "/shop",
  "targetSegment": "all",
  "type": "promotion"
}
```

**Target Specific Categories**:
```json
{
  "title": "New Aftershave",
  "body": "Premium aftershave now available",
  "categories": ["Aftershave"],
  "type": "new_product"
}
```

---

## 🔍 Troubleshooting

### Push Notifications Not Working

**1. Check Browser Support**
- Ensure browser supports Push API
- Check browser console for errors

**2. Verify VAPID Keys**
- Ensure keys are set in environment variables
- Verify public key matches on client and server
- Check for typos or missing characters

**3. Check Permissions**
- Notification permission must be "granted"
- Check browser settings if denied
- Clear site data and try again

**4. Debug Service Worker**
- Open DevTools > Application > Service Workers
- Check for registration errors
- Verify push event listener is registered

**5. Check Database**
- Verify subscription is saved: `db.subscriptions.find({})`
- Check notification history: `db.notifications.find({})`

### Service Worker Not Registering

**1. HTTPS Required**
- Service workers only work on HTTPS or localhost
- Use ngrok for local network testing

**2. Scope Issues**
- Service worker must be at root (`/sw.js`)
- Check `Service-Worker-Allowed` header

**3. Cache Issues**
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Unregister old service worker
- Clear browser cache

### PWA Not Installable

**1. Manifest Issues**
- Verify `/manifest.json` is accessible
- Check manifest in DevTools > Application > Manifest
- Ensure all required fields are present

**2. HTTPS Required**
- PWA installation requires HTTPS

**3. Service Worker Required**
- Service worker must be registered

### Cron Jobs Not Running

**1. Verify Schedule**
- Check `vercel.json` syntax
- Use https://crontab.guru to verify cron expressions

**2. Check Logs**
- Go to Vercel Dashboard > Deployments > Functions
- View logs for cron function executions

**3. Test Manually**
- Trigger cron endpoint manually with cron secret

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Subscription Rates**
   - Total subscriptions
   - Subscriptions per category
   - Daily/weekly growth

2. **Notification Performance**
   - Delivery success rate
   - Click-through rate
   - Unsubscribe rate

3. **PWA Installation**
   - Install rate
   - Standalone usage
   - Return visit rate

### Database Queries

**Count Active Subscriptions**:
```javascript
db.subscriptions.countDocuments({})
```

**Notification Stats**:
```javascript
db.notifications.aggregate([
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
      readCount: {
        $sum: { $cond: ["$read", 1, 0] }
      }
    }
  }
])
```

---

## 🔐 Security Best Practices

1. **VAPID Keys**
   - Never expose private key to client
   - Rotate keys if compromised
   - Store securely in environment variables

2. **Cron Secret**
   - Use strong random secret
   - Verify on every cron request
   - Different secret per environment

3. **User Permissions**
   - Respect user notification preferences
   - Provide easy unsubscribe
   - Don't spam users

4. **Rate Limiting**
   - Implement rate limits on notification endpoints
   - Throttle subscription requests
   - Monitor for abuse

---

## 🎯 Best Practices

1. **Notification Timing**
   - Respect quiet hours (10 PM - 7 AM)
   - Consider user timezone
   - Don't send too frequently

2. **Content**
   - Keep titles short (< 50 chars)
   - Clear, actionable body text
   - Include relevant deep link

3. **Segmentation**
   - Target by category preference
   - Respect frequency settings
   - Personalize when possible

4. **Testing**
   - Test on multiple devices
   - Verify links work
   - Check notification appearance

---

## 📚 Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN: Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## 🆘 Support

For issues or questions:
1. Check console logs (browser and server)
2. Review this documentation
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: October 2025

