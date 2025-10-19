# 🚀 Dokimas Cosmetics - Setup Guide

This guide will help you set up the Dokimas Cosmetics platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Environment Setup

#### MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string

#### Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/dokimas_dev
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dokimas_prod

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@dokimascosmetics.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Dokimas Cosmetics
ADMIN_EMAIL=admin@dokimascosmetics.com
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Gmail App Password:**
1. Enable 2-factor authentication on your Gmail
2. Go to Account → Security → App passwords
3. Generate new app password for "Mail"

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- MongoDB & Mongoose
- NextAuth.js
- Cloudinary
- Tailwind CSS
- shadcn/ui components
- And more...

### 4. Database Seeding (Optional)

Create an admin user and sample data:

```bash
# Create seed script (we'll add this)
npm run seed
```

Or manually create an admin user via MongoDB:

```javascript
// Connect to MongoDB
use dokimas_dev

// Insert admin user (password: admin123)
db.users.insertOne({
  name: "Admin User",
  email: "admin@dokimas.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  emailVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## 🧪 Testing the Setup

### Test 1: Homepage
- Navigate to http://localhost:3000
- You should see the beautiful landing page with hero section

### Test 2: Database Connection
Create a test API route to verify MongoDB connection:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

### Test 3: Authentication
1. Go to http://localhost:3000/auth/signin
2. Try registering a new account
3. Check MongoDB for the new user

### Test 4: Image Upload (Cloudinary)
1. Try uploading a product image in admin panel
2. Verify image appears in Cloudinary dashboard

## 📁 Project Structure Overview

```
dokimas-cosmetics/
├── src/
│   ├── app/                 # Next.js pages & API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities (DB, auth, email, etc.)
│   ├── models/              # Mongoose schemas
│   ├── middleware/          # API middleware
│   └── types/               # TypeScript types
├── public/                  # Static files
├── .env.local              # Environment variables (create this)
├── .env.example            # Template
└── package.json            # Dependencies
```

## 🎨 Development Workflow

### Adding New Features

1. **Create Database Model** (if needed)
   ```typescript
   // src/models/YourModel.ts
   import mongoose, { Schema } from "mongoose";
   
   const YourSchema = new Schema({
     // define schema
   });
   
   export default mongoose.models.YourModel || 
     mongoose.model("YourModel", YourSchema);
   ```

2. **Create API Route**
   ```typescript
   // src/app/api/your-endpoint/route.ts
   import { NextRequest } from "next/server";
   import { successResponse, errorResponse } from "@/lib/api-response";
   import connectDB from "@/lib/db/mongodb";
   
   export async function GET(request: NextRequest) {
     try {
       await connectDB();
       // Your logic here
       return successResponse({ message: "Success" });
     } catch (error) {
       return errorResponse(error.message);
     }
   }
   ```

3. **Create UI Components**
   ```typescript
   // src/components/YourComponent.tsx
   import { Button } from "@/components/ui/button";
   
   export function YourComponent() {
     return <Button>Click me</Button>;
   }
   ```

### Running Commands

```bash
# Development
npm run dev           # Start dev server with hot reload
npm run build         # Build for production
npm run start         # Start production server

# Code Quality
npm run lint          # Check for linting errors
npm run format        # Format code with Prettier

# Database
npm run seed          # Seed database with sample data (to be added)
npm run db:reset      # Reset database (to be added)
```

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongoServerError: bad auth`

**Solution:**
- Check your MongoDB URI in `.env.local`
- Verify username and password
- For Atlas: check IP whitelist (add 0.0.0.0/0 for testing)

### Issue 2: NextAuth Session Error
**Error:** `[next-auth][error][JWT_SESSION_ERROR]`

**Solution:**
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Generate new secret: `openssl rand -base64 32`
- Restart dev server

### Issue 3: Cloudinary Upload Failed
**Error:** `Cloudinary upload error`

**Solution:**
- Verify all 3 Cloudinary credentials are correct
- Check Cloud Name (not API Key)
- Test in Cloudinary dashboard first

### Issue 4: Email Not Sending
**Error:** `Error: Invalid login`

**Solution:**
- Use Gmail App Password (not regular password)
- Enable 2FA on Gmail first
- Check SMTP settings match your provider

### Issue 5: Port Already in Use
**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API routes
- [ ] Set up proper CORS policies
- [ ] Configure Content Security Policy (CSP)
- [ ] Enable MongoDB encryption at rest
- [ ] Use Cloudinary signed uploads
- [ ] Set up error monitoring (Sentry)

## 📚 Next Steps

1. ✅ Complete setup and verify all services work
2. 📝 Read the [Technical Specification](../DOKIMAS_COSMETICS_SPECIFICATION.md)
3. 🎨 Explore the UI components in `/src/components/ui`
4. 🔧 Customize the brand colors in `tailwind.config.ts`
5. 📊 Set up the admin dashboard
6. 🛒 Build the shop pages
7. 💳 Integrate payment gateways
8. 🧪 Write tests
9. 🚀 Deploy to Vercel

## 💡 Development Tips

### Hot Tips for Faster Development

1. **Use TypeScript autocomplete** - The types are fully defined in `src/types/index.ts`
2. **shadcn/ui components** - Browse available components: `npx shadcn@latest add`
3. **API response helpers** - Use `successResponse()` and `errorResponse()` for consistent APIs
4. **Auth helpers** - Use `requireAuth()` and `requireRole()` in API routes
5. **Database connection** - Always `await connectDB()` before database operations
6. **Environment variables** - Restart dev server after changing `.env.local`

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens
- Error Lens

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🆘 Getting Help

If you encounter issues:

1. Check this setup guide
2. Review the [Technical Specification](../DOKIMAS_COSMETICS_SPECIFICATION.md)
3. Check the console for error messages
4. Review MongoDB connection logs
5. Test API endpoints with Postman/Insomnia

## 🎉 Setup Complete!

Once everything is running:
- Homepage: http://localhost:3000
- API Health: http://localhost:3000/api/health
- Admin Panel: http://localhost:3000/dashboard/admin (coming soon)

**Happy coding! 🚀**

