/**
 * Cloudinary Test Script
 * Tests image upload to Cloudinary
 */

import { config } from "dotenv";
import { resolve } from "path";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log("\n🧪 CLOUDINARY CONFIGURATION TEST\n");
  console.log("=".repeat(60));
  
  // Check configuration
  console.log("\n📋 Configuration Check:");
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key: ${process.env.CLOUDINARY_API_KEY}`);
  console.log(`API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set (hidden)' : '❌ Not set'}`);
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log("\n❌ ERROR: Cloudinary credentials not configured properly");
    process.exit(1);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\n🔍 Testing Cloudinary Connection...\n");
  
  try {
    // Test 1: Upload a test image from URL
    console.log("Test 1: Upload image from URL");
    console.log("Uploading test image...");
    
    const testImageUrl = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500";
    
    const uploadResult = await cloudinary.uploader.upload(testImageUrl, {
      folder: "dokimas_test",
      public_id: "test_upload_" + Date.now(),
      overwrite: true,
    });
    
    console.log("✅ Upload successful!");
    console.log("\nUpload Details:");
    console.log(`  Public ID: ${uploadResult.public_id}`);
    console.log(`  URL: ${uploadResult.secure_url}`);
    console.log(`  Format: ${uploadResult.format}`);
    console.log(`  Size: ${Math.round(uploadResult.bytes / 1024)} KB`);
    console.log(`  Width: ${uploadResult.width}px`);
    console.log(`  Height: ${uploadResult.height}px`);
    
    // Test 2: Get image info
    console.log("\n" + "-".repeat(60));
    console.log("\nTest 2: Retrieve uploaded image");
    
    const imageInfo = await cloudinary.api.resource(uploadResult.public_id);
    console.log("✅ Image retrieved successfully!");
    console.log(`  Created: ${new Date(imageInfo.created_at).toLocaleString()}`);
    console.log(`  Resource Type: ${imageInfo.resource_type}`);
    
    // Test 3: Delete test image (cleanup)
    console.log("\n" + "-".repeat(60));
    console.log("\nTest 3: Delete test image (cleanup)");
    
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log("✅ Image deleted successfully!");
    console.log(`  Result: ${deleteResult.result}`);
    
    // Test 4: Get account usage stats
    console.log("\n" + "-".repeat(60));
    console.log("\nTest 4: Check account usage");
    
    try {
      const usage = await cloudinary.api.usage();
      console.log("✅ Account info retrieved!");
      console.log(`  Plan: ${usage.plan || 'Free'}`);
      console.log(`  Credits used: ${usage.credits?.usage || 0}`);
      console.log(`  Storage: ${Math.round((usage.storage?.usage || 0) / 1024 / 1024)} MB`);
      console.log(`  Bandwidth: ${Math.round((usage.bandwidth?.usage || 0) / 1024 / 1024)} MB`);
      console.log(`  Resources: ${usage.resources || 0} items`);
    } catch (usageError: any) {
      console.log("⚠️  Could not retrieve usage stats (this is okay)");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n✅ Cloudinary is configured correctly and working!");
    console.log("\nYou can now:");
    console.log("  1. Upload product images via admin dashboard");
    console.log("  2. Upload payment proofs in checkout");
    console.log("  3. Use image upload in any part of the app");
    
    console.log("\n📸 Test image was uploaded and deleted successfully.");
    console.log("Your Cloudinary account is ready to use!\n");
    
  } catch (error: any) {
    console.log("\n" + "=".repeat(60));
    console.log("\n❌ CLOUDINARY TEST FAILED!");
    console.log(`\nError: ${error.message}`);
    
    if (error.http_code === 401) {
      console.log("\n💡 DIAGNOSIS: Authentication Error");
      console.log("   - Check your API Key and API Secret");
      console.log("   - Make sure they match your Cloudinary dashboard");
      console.log("   - Verify there are no extra spaces");
    } else if (error.http_code === 404) {
      console.log("\n💡 DIAGNOSIS: Cloud Name Not Found");
      console.log("   - Check your Cloud Name is correct");
      console.log("   - It should be: dahkt60ti");
    } else {
      console.log("\n💡 Full error details:");
      console.log(error);
    }
    
    console.log("\n🔧 To fix:");
    console.log("   1. Go to: https://console.cloudinary.com/");
    console.log("   2. Copy your credentials from the dashboard");
    console.log("   3. Update .env.local with correct values");
    console.log("   4. Run this test again: npm run test:cloudinary\n");
    
    process.exit(1);
  }
}

// Run the test
testCloudinary()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });



