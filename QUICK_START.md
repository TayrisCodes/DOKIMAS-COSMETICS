# ⚡ Quick Start Guide - Dokimas Cosmetics

Get up and running in 5 minutes!

## 🚀 Quick Setup

```bash
# 1. Navigate to project
cd dokimas-cosmetics

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and other credentials

# 4. Start development server
npm run dev
```

Visit: **http://localhost:3000** 🎉

## 📝 Minimum Required Environment Variables

Edit `.env.local`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/dokimas_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-secret-here

# Optional (for full functionality)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Generate secret:
```bash
openssl rand -base64 32
```

## 🧪 Quick Test

```bash
# Test API health
curl http://localhost:3000/api/health

# Expected response
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

## 📦 What's Included

✅ Next.js 15 with App Router  
✅ TypeScript configured  
✅ Tailwind CSS + shadcn/ui components  
✅ MongoDB + Mongoose models  
✅ NextAuth.js authentication  
✅ Cloudinary image uploads  
✅ Email templates  
✅ Payment gateway setup  
✅ Beautiful homepage  

## 🎯 Next Steps

1. **Read the docs**: [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup
2. **Check the spec**: [DOKIMAS_COSMETICS_SPECIFICATION.md](../DOKIMAS_COSMETICS_SPECIFICATION.md)
3. **Explore the code**: Start with `src/app/page.tsx`
4. **Add products**: Use the API at `/api/products`
5. **Build features**: Follow the development roadmap

## 🛠️ Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Run linter
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

## 📂 Project Structure

```
src/
├── app/            # Pages & API routes
│   ├── api/        # REST API endpoints
│   └── page.tsx    # Homepage
├── components/     # React components
│   └── ui/         # shadcn/ui components
├── lib/            # Utilities
│   ├── db/         # MongoDB connection
│   ├── auth/       # Authentication
│   └── helpers.ts  # Helper functions
├── models/         # Mongoose schemas
└── types/          # TypeScript types
```

## 🔗 Important Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | Homepage |
| `/api/health` | Health check |
| `/api/products` | Products API |
| `/api/auth/[...nextauth]` | Authentication |

## 🆘 Common Issues

**MongoDB connection failed?**
```bash
# Check if MongoDB is running
sudo systemctl status mongodb

# Or use MongoDB Atlas
# Update MONGODB_URI in .env.local
```

**Port 3000 in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

**Environment variables not loading?**
```bash
# Restart the dev server after changing .env.local
# Press Ctrl+C and run npm run dev again
```

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [README](./README.md) - Full documentation
- [Technical Spec](../DOKIMAS_COSMETICS_SPECIFICATION.md) - Complete spec

## 💡 Pro Tips

- Use `console.log()` to debug
- Check browser DevTools console for errors
- MongoDB Compass is great for viewing data
- Use Postman/Insomnia to test APIs

---

**Ready to build something amazing! 🚀**

