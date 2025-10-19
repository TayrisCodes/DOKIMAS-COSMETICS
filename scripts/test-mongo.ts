/**
 * MongoDB Connection Test Script
 * Tests different MongoDB connection strings
 */

import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const testConnections = [
  {
    name: "MongoDB Atlas - SRV Format (Recommended)",
    uri: "mongodb+srv://taredakk:tare5960@cluster0.0gwcnq5.mongodb.net/dokimas_cosmetics?retryWrites=true&w=majority"
  },
  {
    name: "MongoDB Atlas - Standard Format",
    uri: "mongodb+srv://taredakk:tare5960@cluster0.0gwcnq5.mongodb.net/?retryWrites=true&w=majority&authSource=admin"
  },
  {
    name: "MongoDB Local",
    uri: "mongodb://localhost:27017/dokimas_cosmetics"
  }
];

async function testConnection(name: string, uri: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`${"=".repeat(60)}`);
  
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Connect
    console.log("📡 Attempting connection...");
    await mongoose.connect(uri);
    console.log("✅ Connection successful!");

    // Test database operations
    console.log("🧪 Testing database operations...");
    
    // Create a test collection
    const TestSchema = new mongoose.Schema({ test: String });
    const TestModel = mongoose.models.Test || mongoose.model("Test", TestSchema);
    
    // Try to insert
    console.log("📝 Attempting insert...");
    const testDoc = await TestModel.create({ test: "Hello MongoDB!" });
    console.log("✅ Insert successful!");
    
    // Try to read
    console.log("📖 Attempting read...");
    const found = await TestModel.findById(testDoc._id);
    console.log("✅ Read successful!");
    
    // Clean up
    console.log("🧹 Cleaning up test data...");
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log("✅ Cleanup successful!");
    
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log(`✅ This connection works: ${name}`);
    
    return true;
  } catch (error: any) {
    console.log("\n❌ CONNECTION FAILED!");
    console.log(`Error: ${error.message}`);
    
    if (error.code === 13) {
      console.log("\n💡 DIAGNOSIS: Authentication/Authorization Error");
      console.log("   - Check username and password");
      console.log("   - Verify user has 'readWrite' permissions");
      console.log("   - Check MongoDB Atlas Database Access settings");
    } else if (error.code === 8000) {
      console.log("\n💡 DIAGNOSIS: Authentication Failed");
      console.log("   - Username or password is incorrect");
      console.log("   - Or user does not exist");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 DIAGNOSIS: Connection Refused");
      console.log("   - MongoDB service is not running");
      console.log("   - Wrong host or port");
    } else if (error.message.includes("querySrv ENOTFOUND")) {
      console.log("\n💡 DIAGNOSIS: DNS/Cluster Not Found");
      console.log("   - Check cluster name in connection string");
      console.log("   - Verify internet connection");
    }
    
    return false;
  }
}

async function main() {
  console.log("\n🧪 MongoDB Connection Diagnostic Tool");
  console.log("=====================================\n");
  
  for (const test of testConnections) {
    const success = await testConnection(test.name, test.uri);
    
    if (success) {
      console.log(`\n\n✅ WORKING CONNECTION STRING:`);
      console.log(`MONGODB_URI=${test.uri}\n`);
      break;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  await mongoose.connection.close();
  process.exit(0);
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

