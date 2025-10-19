// scripts/seedCms.ts
// Run: npm run seed:cms

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Import models
import CMSPage from "../src/models/CMSPage";
import Banner from "../src/models/Banner";
import Blog from "../src/models/Blog";
import Product from "../src/models/Product";

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not found in environment variables");
  }
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");
}

async function resolveProductIds(slugArray: string[]) {
  const ids: any[] = [];
  if (!slugArray || slugArray.length === 0) return ids;

  for (const slug of slugArray) {
    const product = await Product.findOne({ slug }).lean();
    if (product) {
      ids.push(product._id);
      console.log(`  ✓ Resolved product: ${slug} -> ${product._id}`);
    } else {
      console.warn(`  ⚠ Product slug not found: ${slug}`);
    }
  }
  return ids;
}

async function run(filePath: string, dryRun: boolean = false) {
  console.log("\n🌱 Starting CMS Seed Process\n");

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  await connect();

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n");
    console.log("Would seed the following:");
    console.log(`  - ${data.banners?.length || 0} banners`);
    console.log(`  - ${data.blogs?.length || 0} blog posts`);
    console.log(`  - ${data.homepage?.sections?.length || 0} homepage sections`);
    await mongoose.disconnect();
    return;
  }

  try {
    // Seed Banners (upsert to make idempotent)
    if (data.banners && data.banners.length > 0) {
      console.log(`\n📰 Seeding ${data.banners.length} banners...`);
      for (const banner of data.banners) {
        const existing = await Banner.findOne({ title: banner.title, position: banner.position });
        if (existing) {
          console.log(`  ⚠ Banner already exists: ${banner.title} (${banner.position}) - skipping`);
        } else {
          await Banner.create(banner);
          console.log(`  ✓ Created banner: ${banner.title || "Untitled"}`);
        }
      }
    }

    // Seed Blogs (use upsert on slug to make idempotent)
    if (data.blogs && data.blogs.length > 0) {
      console.log(`\n📝 Seeding ${data.blogs.length} blog posts...`);
      for (const blog of data.blogs) {
        await Blog.findOneAndUpdate(
          { slug: blog.slug },
          {
            ...blog,
            publishedAt: blog.isPublished ? new Date() : undefined,
          },
          { upsert: true, new: true }
        );
        console.log(`  ✓ Created/Updated blog: ${blog.title}`);
      }
    }

    // Seed Homepage
    if (data.homepage) {
      console.log(
        `\n🏠 Seeding homepage with ${data.homepage.sections?.length || 0} sections...`
      );

      // Resolve product slugs in featured_products sections
      for (const section of data.homepage.sections || []) {
        if (
          section.key === "featured_products" &&
          section.productsQuery &&
          section.productsQuery.type === "byIds" &&
          section.productsQuery.ids
        ) {
          console.log(`  Resolving products for section: ${section.key}`);
          const ids = await resolveProductIds(section.productsQuery.ids);
          section.productsQuery.ids = ids;
        }
      }

      await CMSPage.findOneAndUpdate(
        { slug: "home" },
        data.homepage,
        { upsert: true, new: true }
      );
      console.log("  ✓ Homepage created/updated");
    }

    console.log("\n✅ Seed completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB\n");
  }
}

// Parse command line arguments
const fileArg = process.argv[2];
const dryRunFlag = process.argv.includes("--dry-run");

if (!fileArg) {
  console.error(
    "\n❌ Usage: npm run seed:cms [--dry-run]\n"
  );
  console.error(
    "Example: npm run seed:cms:dry\n"
  );
  process.exit(1);
}

run(fileArg, dryRunFlag).catch((err) => {
  console.error("\n❌ Fatal error:", err);
  process.exit(1);
});


