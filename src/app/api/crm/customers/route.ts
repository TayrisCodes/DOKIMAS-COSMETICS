import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { getCustomersByStatus } from "@/lib/crm";

/**
 * GET /api/crm/customers
 * List customers with activity metrics
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "active"
      | "inactive"
      | "new"
      | null;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    let result;

    if (status) {
      result = await getCustomersByStatus(status, limit, skip);
    } else {
      // Get all customers
      result = await getCustomersByStatus("active", 1000, 0);
      const inactive = await getCustomersByStatus("inactive", 1000, 0);
      const newCustomers = await getCustomersByStatus("new", 1000, 0);

      result = {
        customers: [
          ...result.customers,
          ...inactive.customers,
          ...newCustomers.customers,
        ].slice(skip, skip + limit),
        total:
          result.total +
          inactive.total +
          newCustomers.total,
      };
    }

    return successResponse({
      customers: result.customers,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  } catch (error: any) {
    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("Forbidden")
    ) {
      return errorResponse(
        error.message,
        error.message.includes("Unauthorized") ? 401 : 403
      );
    }
    return errorResponse(error.message, 500);
  }
}




