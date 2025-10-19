import { NextResponse } from "next/server";
import { ApiResponse, PaginatedResponse } from "@/types";

/**
 * Success response
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return NextResponse.json(response, { status });
}

/**
 * Error response
 */
export function errorResponse(error: string, status: number = 400) {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return NextResponse.json(response, { status });
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
) {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Handle async API route errors
 */
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error("API Error:", error);

      // Handle MongoDB errors
      if (error.name === "ValidationError") {
        return errorResponse(error.message, 400);
      }

      if (error.code === 11000) {
        return errorResponse("Duplicate entry found", 409);
      }

      // Handle custom errors
      if (error.message?.includes("Unauthorized")) {
        return errorResponse(error.message, 401);
      }

      if (error.message?.includes("Forbidden")) {
        return errorResponse(error.message, 403);
      }

      // Generic error
      return errorResponse(
        error.message || "Internal server error",
        error.status || 500
      );
    }
  };
}


