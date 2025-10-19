/**
 * Seed Products Script for Dokimas Cosmetics
 * 
 * Creates 20+ sample products across all categories
 * with varying stock levels for testing analytics and inventory management
 * 
 * Usage: npx tsx scripts/seed-products.ts
 */

import mongoose from "mongoose";

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dokimas_dev";

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  category: String,
  description: String,
  price: Number,
  compareAtPrice: Number,
  stock: Number,
  sku: String,
  isActive: Boolean,
  isFeatured: Boolean,
  restockThreshold: Number,
  ingredients: [String],
  tags: [String],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

const sampleProducts = [
  // Aftershave
  {
    name: "Cooling Aftershave Balm",
    category: "Aftershave",
    description: "Soothing aftershave balm with menthol and aloe vera for post-shave comfort",
    price: 18.99,
    compareAtPrice: 24.99,
    stock: 45,
    sku: "AS-COOL-001",
    isFeatured: true,
    ingredients: ["Aloe Vera", "Menthol", "Vitamin E", "Shea Butter"],
    tags: ["cooling", "soothing", "post-shave"],
  },
  {
    name: "Traditional Aftershave Lotion",
    category: "Aftershave",
    description: "Classic aftershave lotion with natural Ethiopian herbs",
    price: 16.99,
    stock: 3,
    sku: "AS-TRAD-002",
    ingredients: ["Witch Hazel", "Lavender", "Tea Tree"],
    tags: ["traditional", "herbal"],
  },
  
  // Body Oils
  {
    name: "Ethiopian Rose Body Oil",
    category: "Body Oils",
    description: "Luxurious body oil infused with authentic Ethiopian rose extract",
    price: 24.99,
    compareAtPrice: 29.99,
    stock: 28,
    sku: "BO-ROSE-001",
    isFeatured: true,
    ingredients: ["Ethiopian Rose", "Jojoba Oil", "Vitamin E", "Argan Oil"],
    tags: ["rose", "luxurious", "moisturizing"],
  },
  {
    name: "Shea Butter Body Oil",
    category: "Body Oils",
    description: "Deep moisturizing oil with pure Ethiopian shea butter",
    price: 22.99,
    stock: 15,
    sku: "BO-SHEA-002",
    ingredients: ["Shea Butter", "Coconut Oil", "Sweet Almond Oil"],
    tags: ["shea", "moisturizing", "nourishing"],
  },
  {
    name: "Lavender Relaxing Oil",
    category: "Body Oils",
    description: "Calming body oil with lavender for relaxation",
    price: 19.99,
    stock: 2,
    sku: "BO-LAV-003",
    ingredients: ["Lavender", "Chamomile", "Jojoba Oil"],
    tags: ["lavender", "relaxing", "aromatherapy"],
  },

  // Deodorants
  {
    name: "Natural Deodorant Stick",
    category: "Deodorants",
    description: "Chemical-free deodorant with natural odor protection",
    price: 12.99,
    stock: 60,
    sku: "DEO-NAT-001",
    isFeatured: true,
    ingredients: ["Baking Soda", "Coconut Oil", "Essential Oils"],
    tags: ["natural", "aluminum-free", "long-lasting"],
  },
  {
    name: "Charcoal Deodorant",
    category: "Deodorants",
    description: "Activated charcoal deodorant for maximum freshness",
    price: 14.99,
    stock: 35,
    sku: "DEO-CHAR-002",
    ingredients: ["Activated Charcoal", "Shea Butter", "Mint"],
    tags: ["charcoal", "detoxifying"],
  },
  {
    name: "Citrus Fresh Deodorant",
    category: "Deodorants",
    description: "Refreshing citrus scented natural deodorant",
    price: 13.99,
    stock: 4,
    sku: "DEO-CIT-003",
    ingredients: ["Lemon Extract", "Orange Oil", "Tea Tree"],
    tags: ["citrus", "fresh", "energizing"],
  },

  // Cleansers
  {
    name: "Gentle Face Cleanser",
    category: "Cleansers",
    description: "Mild cleanser for all skin types",
    price: 16.99,
    stock: 50,
    sku: "CLE-GEN-001",
    isFeatured: true,
    ingredients: ["Aloe Vera", "Green Tea", "Chamomile"],
    tags: ["gentle", "daily-use", "sensitive-skin"],
  },
  {
    name: "Charcoal Deep Cleanse",
    category: "Cleansers",
    description: "Deep cleansing formula with activated charcoal",
    price: 18.99,
    compareAtPrice: 22.99,
    stock: 32,
    sku: "CLE-CHAR-002",
    ingredients: ["Activated Charcoal", "Clay", "Tea Tree"],
    tags: ["deep-cleanse", "purifying", "charcoal"],
  },
  {
    name: "Hydrating Gel Cleanser",
    category: "Cleansers",
    description: "Hydrating cleanser for dry and sensitive skin",
    price: 17.99,
    stock: 8,
    sku: "CLE-HYD-003",
    ingredients: ["Hyaluronic Acid", "Glycerin", "Aloe"],
    tags: ["hydrating", "gel", "dry-skin"],
  },

  // Moisturizers
  {
    name: "Daily Moisturizer SPF 30",
    category: "Moisturizers",
    description: "Light daily moisturizer with sun protection",
    price: 21.99,
    stock: 40,
    sku: "MOI-DAY-001",
    isFeatured: true,
    ingredients: ["SPF 30", "Vitamin C", "Hyaluronic Acid"],
    tags: ["spf", "daily", "sun-protection"],
  },
  {
    name: "Night Repair Cream",
    category: "Moisturizers",
    description: "Rich night cream for skin regeneration",
    price: 25.99,
    compareAtPrice: 32.99,
    stock: 25,
    sku: "MOI-NIGHT-002",
    ingredients: ["Retinol", "Peptides", "Shea Butter"],
    tags: ["night-cream", "anti-aging", "repair"],
  },
  {
    name: "Intensive Hydration Cream",
    category: "Moisturizers",
    description: "Extra hydration for very dry skin",
    price: 23.99,
    stock: 5,
    sku: "MOI-INT-003",
    ingredients: ["Shea Butter", "Ceramides", "Hyaluronic Acid"],
    tags: ["intense", "dry-skin", "hydrating"],
  },

  // Serums
  {
    name: "Vitamin C Brightening Serum",
    category: "Serums",
    description: "Brightening serum with pure vitamin C",
    price: 29.99,
    stock: 30,
    sku: "SER-VIT-001",
    isFeatured: true,
    ingredients: ["Vitamin C", "Ferulic Acid", "Vitamin E"],
    tags: ["vitamin-c", "brightening", "antioxidant"],
  },
  {
    name: "Hyaluronic Acid Serum",
    category: "Serums",
    description: "Intense hydration with hyaluronic acid",
    price: 27.99,
    stock: 20,
    sku: "SER-HYA-002",
    ingredients: ["Hyaluronic Acid", "Glycerin", "Aloe"],
    tags: ["hydration", "plumping"],
  },
  {
    name: "Retinol Anti-Aging Serum",
    category: "Serums",
    description: "Advanced anti-aging serum with retinol",
    price: 34.99,
    compareAtPrice: 39.99,
    stock: 3,
    sku: "SER-RET-003",
    ingredients: ["Retinol", "Peptides", "Vitamin E"],
    tags: ["retinol", "anti-aging", "wrinkles"],
  },

  // Masks
  {
    name: "Purifying Clay Mask",
    category: "Masks",
    description: "Deep cleansing clay mask for oily skin",
    price: 19.99,
    stock: 25,
    sku: "MASK-CLAY-001",
    ingredients: ["Bentonite Clay", "Charcoal", "Tea Tree"],
    tags: ["clay", "purifying", "oily-skin"],
  },
  {
    name: "Hydrating Sheet Mask",
    category: "Masks",
    description: "Intensive hydration sheet mask",
    price: 14.99,
    stock: 50,
    sku: "MASK-SHEET-002",
    ingredients: ["Hyaluronic Acid", "Aloe", "Vitamin E"],
    tags: ["sheet-mask", "hydrating"],
  },

  // Toners
  {
    name: "Rose Water Toner",
    category: "Toners",
    description: "Refreshing toner with natural rose water",
    price: 15.99,
    stock: 35,
    sku: "TON-ROSE-001",
    ingredients: ["Rose Water", "Witch Hazel", "Glycerin"],
    tags: ["rose", "refreshing", "balancing"],
  },
  {
    name: "Exfoliating Toner AHA/BHA",
    category: "Toners",
    description: "Gentle exfoliating toner with acids",
    price: 18.99,
    stock: 6,
    sku: "TON-EXF-002",
    ingredients: ["AHA", "BHA", "Niacinamide"],
    tags: ["exfoliating", "aha", "bha"],
  },

  // Sunscreen
  {
    name: "Mineral Sunscreen SPF 50",
    category: "Sunscreen",
    description: "Broad spectrum mineral sunscreen",
    price: 22.99,
    stock: 40,
    sku: "SUN-MIN-001",
    isFeatured: true,
    ingredients: ["Zinc Oxide", "Titanium Dioxide", "Vitamin E"],
    tags: ["spf50", "mineral", "broad-spectrum"],
  },
  {
    name: "Lightweight Sun Fluid SPF 30",
    category: "Sunscreen",
    description: "Lightweight daily sunscreen",
    price: 19.99,
    stock: 2,
    sku: "SUN-LIGHT-002",
    ingredients: ["SPF 30", "Vitamin C", "Niacinamide"],
    tags: ["spf30", "lightweight", "daily"],
  },
];

async function seedProducts() {
  try {
    console.log("🌱 Starting product seed process...\n");

    // Clear existing products (optional - comment out if you want to keep existing)
    try {
      const deleteResult = await Product.deleteMany({});
      console.log(`✅ Cleared ${deleteResult.deletedCount} existing products\n`);
    } catch (deleteError) {
      console.log("⚠️  Could not clear existing products (this is okay)\n");
    }

    // Create products
    let created = 0;
    for (const productData of sampleProducts) {
      const product = await Product.create({
        ...productData,
        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        isActive: true,
        restockThreshold: 10,
        averageRating: Math.random() * 2 + 3, // Random rating between 3-5
        reviewCount: Math.floor(Math.random() * 50),
        soldCount: Math.floor(Math.random() * 100),
      });
      
      created++;
      console.log(`✅ Created: ${product.name} (Stock: ${product.stock})`);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("🎉 Seed completed successfully!\n");
    console.log(`Created ${created} products across ${new Set(sampleProducts.map(p => p.category)).size} categories\n`);
    
    console.log("Stock Summary:");
    console.log(`- In Stock (>10): ${sampleProducts.filter(p => p.stock > 10).length} products`);
    console.log(`- Low Stock (≤10): ${sampleProducts.filter(p => p.stock <= 10).length} products`);
    console.log(`- Featured: ${sampleProducts.filter(p => p.isFeatured).length} products`);
    console.log(`- On Sale: ${sampleProducts.filter(p => p.compareAtPrice).length} products\n`);
    
    console.log("=".repeat(60));
    console.log("\nYou can now:");
    console.log("1. Browse products at: http://localhost:3000/shop");
    console.log("2. View inventory at: http://localhost:3000/dashboard/admin/inventory");
    console.log("3. Check analytics at: http://localhost:3000/dashboard/admin/analytics");
    console.log("4. Test POS at: http://localhost:3000/dashboard/retail/pos\n");

  } catch (error) {
    console.error("❌ Seed Error:", error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await seedProducts();
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
