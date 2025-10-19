import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { checkLowStock } from "@/lib/inventory";
import { sendEmail } from "@/lib/email";

/**
 * GET /api/inventory/low-stock
 * Get all low stock products
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const sendEmailAlert = searchParams.get("sendEmail") === "true";

    const lowStockProducts = await checkLowStock();

    // Send email alert if requested
    if (sendEmailAlert && lowStockProducts.length > 0) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@dokimascosmetics.com";
      
      await sendEmail({
        to: adminEmail,
        subject: `⚠️ Low Stock Alert: ${lowStockProducts.length} Products Need Restocking`,
        html: getLowStockSummaryEmail(lowStockProducts),
      });
    }

    return successResponse({
      products: lowStockProducts,
      count: lowStockProducts.length,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}

function getLowStockSummaryEmail(products: any[]): string {
  const productsHTML = products
    .map(
      (p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <strong style="color: #ef4444;">${p.stock}</strong>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.restockThreshold}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <p>Hello Admin,</p>
            <p><strong>${products.length} products</strong> are running low on stock and need immediate attention:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style="text-align: center;">Current Stock</th>
                  <th style="text-align: center;">Threshold</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
            
            <p>Please restock these products as soon as possible to avoid stockouts and lost sales.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/inventory" class="button">View Inventory Dashboard</a>
            </p>
            
            <p>Best regards,<br>Dokimas Cosmetics System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}





