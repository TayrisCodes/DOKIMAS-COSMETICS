import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";

/**
 * Health check endpoint
 * Tests database connection and API availability
 */
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await connectDB();

    return successResponse(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        environment: process.env.NODE_ENV || "development",
      },
      "API is running successfully"
    );
  } catch (error: any) {
    return errorResponse(
      `Health check failed: ${error.message}`,
      503
    );
  }
}

