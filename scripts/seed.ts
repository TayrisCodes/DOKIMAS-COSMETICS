/**
 * Seed Script for Dokimas Cosmetics
 * 
 * This script creates test users for all roles:
 * - Admin
 * - Retail Manager
 * - Customer
 * 
 * Usage: npx tsx scripts/seed.ts
 */

import { config } from "dotenv";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dokimas_dev";

// User Schema (inline for seed script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  role: String,
  emailVerified: Boolean,
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date,
  image: String,
  addresses: Array,
  provider: String,
  providerId: String,
  isActive: Boolean,
  lastLogin: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

async function seedUsers() {
  try {
    console.log("🌱 Starting seed process...\n");

    // Clear existing test users (skip if MongoDB requires auth and you don't have it)
    try {
      await User.deleteMany({
        email: {
          $in: [
            "admin@dokimas.com",
            "retail@dokimas.com",
            "customer@dokimas.com"
          ]
        }
      });
      console.log("✅ Cleared existing test users\n");
    } catch (deleteError: any) {
      console.log("⚠️  Could not clear existing users (this is okay for first run)\n");
    }

    // Default password for all test users
    const defaultPassword = "Test123!";
    const hashedPassword = await hash(defaultPassword, 10);

    // Create Admin User
    const admin = await User.create({
      name: "Admin User",
      email: "admin@dokimas.com",
      phone: "+251911234567",
      password: hashedPassword,
      role: "admin",
      emailVerified: true, // Pre-verified for testing
      provider: "credentials",
      isActive: true,
    });
    console.log("✅ Created Admin User:");
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Role: ${admin.role}\n`);

    // Create Retail Manager User
    const retail = await User.create({
      name: "Retail Manager",
      email: "retail@dokimas.com",
      phone: "+251912345678",
      password: hashedPassword,
      role: "retail_manager",
      emailVerified: true, // Pre-verified for testing
      provider: "credentials",
      isActive: true,
    });
    console.log("✅ Created Retail Manager:");
    console.log(`   Email: ${retail.email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Role: ${retail.role}\n`);

    // Create Customer User
    const customer = await User.create({
      name: "John Customer",
      email: "customer@dokimas.com",
      phone: "+251913456789",
      password: hashedPassword,
      role: "customer",
      emailVerified: true, // Pre-verified for testing
      provider: "credentials",
      isActive: true,
      addresses: [
        {
          label: "Home",
          street: "123 Main Street",
          city: "Addis Ababa",
          state: "Addis Ababa",
          zipCode: "1000",
          country: "Ethiopia",
          isDefault: true,
        }
      ],
    });
    console.log("✅ Created Customer User:");
    console.log(`   Email: ${customer.email}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Role: ${customer.role}\n`);

    console.log("=" .repeat(60));
    console.log("🎉 Seed completed successfully!\n");
    console.log("Test Accounts Created:");
    console.log("=" .repeat(60));
    console.log("\n1. ADMIN ACCOUNT");
    console.log("   Email: admin@dokimas.com");
    console.log("   Password: Test123!");
    console.log("   Dashboard: /dashboard/admin\n");
    
    console.log("2. RETAIL MANAGER ACCOUNT");
    console.log("   Email: retail@dokimas.com");
    console.log("   Password: Test123!");
    console.log("   Dashboard: /dashboard/retail\n");
    
    console.log("3. CUSTOMER ACCOUNT");
    console.log("   Email: customer@dokimas.com");
    console.log("   Password: Test123!");
    console.log("   Dashboard: /dashboard/customer\n");
    
    console.log("=" .repeat(60));
    console.log("\nYou can now login with any of these accounts at:");
    console.log("http://localhost:3000/login\n");

  } catch (error) {
    console.error("❌ Seed Error:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await seedUsers();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  }
}

main();

