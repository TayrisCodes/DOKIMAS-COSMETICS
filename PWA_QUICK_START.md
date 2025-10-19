# PWA + Push Notifications - Quick Start

Quick reference guide to get PWA and Push Notifications working in under 5 minutes.

## ⚡ Setup (3 steps)

### 1. Install Package

```bash
npm install web-push @types/web-push
```

### 2. Generate & Set VAPID Keys

```bash
# Generate keys
npx web-push generate-vapid-keys

# Copy output to .env.local:
VAPID_PUBLIC_KEY=BFzKCMn5esQs0vo7q5Hc4QRT6r4X6gtbqyMADcT7SZtGaE...
VAPID_PRIVATE_KEY=YMjKGqzzzdlLawMh_iRBooXgn7G78bcKD4D4nKocHP4
VAPID_CONTACT=mailto:admin@dokimas.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFzKCMn5esQs0vo7q5Hc4QRT6r4X6gtbqyMADcT7SZtGaE...
CRON_SECRET=your-random-secret
```

### 3. Start Server

```bash
npm run dev
```

---

## 🧪 Test (2 minutes)

### Test PWA

1. Open http://localhost:3000
2. Look for install banner (or check DevTools > Application > Manifest)
3. Install to home screen

### Test Push Notifications

1. Go to http://localhost:3000/settings/notifications
2. Click "Enable Notifications" → Grant permission
3. Click "Send Test" → Receive notification ✅

### Test Order Notifications

1. Create order as customer
2. Update order status as admin
3. Customer receives notification ✅

### Test New Product Notifications

1. Create product as admin
2. Users subscribed to category receive notification ✅

---

## 📍 Key URLs

| URL | Description |
|-----|-------------|
| `/settings/notifications` | User notification settings |
| `/api/push/test` | Send test notification (POST) |
| `/api/push/send` | Admin send custom notification (POST) |
| `/api/notifications` | Get user notifications (GET) |
| `/manifest.json` | PWA manifest |
| `/sw.js` | Service worker |

---

## 🔧 Admin: Send Custom Notification

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "title": "Flash Sale!",
    "body": "20% off all products today only",
    "url": "/shop",
    "targetSegment": "all",
    "type": "promotion"
  }'
```

---

## 🚀 Deploy to Vercel

1. Add environment variables in Vercel Dashboard
2. Push to main branch
3. Verify cron jobs in Vercel Dashboard > Cron Jobs

---

## 📊 Monitor

Check subscriptions:
```javascript
// In MongoDB shell
db.subscriptions.countDocuments({})
db.notifications.find({}).sort({sentAt: -1}).limit(10)
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Notification permission denied | Clear site data, try again |
| Service worker not registering | Check HTTPS, hard refresh (Ctrl+Shift+R) |
| Test notification not received | Check DevTools console for errors |
| Can't install PWA | Requires HTTPS, check manifest |

---

## 📚 Full Documentation

- [PWA_PUSH_SETUP.md](./PWA_PUSH_SETUP.md) - Complete setup guide
- [PWA_IMPLEMENTATION_SUMMARY.md](./PWA_IMPLEMENTATION_SUMMARY.md) - Implementation details

---

**That's it!** Your PWA with push notifications is ready. 🎉

