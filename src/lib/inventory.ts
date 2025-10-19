import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";
import { sendEmail } from "@/lib/email";

/**
 * Reduce product stock and create inventory log
 */
export async function reduceStock(
  productId: string,
  quantity: number,
  reason: string,
  userId: string,
  orderId?: string
): Promise<void> {
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
  }

  const quantityBefore = product.stock;
  product.stock -= quantity;
  product.soldCount = (product.soldCount || 0) + quantity;
  await product.save();

  // Create inventory log
  await InventoryLog.create({
    productId,
    changeType: "sale",
    quantityBefore,
    quantityChange: -quantity,
    quantityAfter: product.stock,
    orderId,
    reason,
    performedBy: userId,
  });

  // Check for low stock and send alert
  if (product.stock <= product.restockThreshold) {
    await sendLowStockAlert(product);
  }
}

/**
 * Add product stock and create inventory log
 */
export async function addStock(
  productId: string,
  quantity: number,
  reason: string,
  userId: string
): Promise<void> {
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const quantityBefore = product.stock;
  product.stock += quantity;
  await product.save();

  // Create inventory log
  await InventoryLog.create({
    productId,
    changeType: "restock",
    quantityBefore,
    quantityChange: quantity,
    quantityAfter: product.stock,
    reason,
    performedBy: userId,
  });
}

/**
 * Get all low stock products
 */
export async function checkLowStock(): Promise<any[]> {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$restockThreshold"] },
  })
    .select("name slug category stock restockThreshold sku")
    .lean();

  return products;
}

/**
 * Get stock history for a product
 */
export async function getStockHistory(productId: string, limit: number = 50): Promise<any[]> {
  const logs = await InventoryLog.find({ productId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("performedBy", "name email")
    .populate("orderId", "orderNumber")
    .lean();

  return logs;
}

/**
 * Send low stock alert email
 */
async function sendLowStockAlert(product: any): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@dokimascosmetics.com";
    
    await sendEmail({
      to: adminEmail,
      subject: `⚠️ Low Stock Alert: ${product.name}`,
      html: getLowStockEmailTemplate(product),
    });
  } catch (error) {
    console.error("Failed to send low stock alert:", error);
    // Don't throw - this is a non-critical notification
  }
}

/**
 * Email template for low stock alert
 */
function getLowStockEmailTemplate(product: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .product-info { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
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
            <p>A product in your inventory is running low on stock and needs restocking:</p>
            
            <div class="product-info">
              <strong>Product:</strong> ${product.name}<br>
              <strong>Category:</strong> ${product.category}<br>
              <strong>Current Stock:</strong> ${product.stock} units<br>
              <strong>Restock Threshold:</strong> ${product.restockThreshold} units<br>
              <strong>SKU:</strong> ${product.sku}
            </div>
            
            <p>Please restock this product as soon as possible to avoid stockouts.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/inventory" class="button">View Inventory</a>
            </p>
            
            <p>Best regards,<br>Dokimas Cosmetics System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}





