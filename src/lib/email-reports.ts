import { sendEmail } from "@/lib/email";
import Sale from "@/models/Sale";
import { checkLowStock } from "@/lib/inventory";

/**
 * Send daily sales report to admin and retail managers
 */
export async function sendDailySalesReport(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch yesterday's sales
    const sales = await Sale.find({
      createdAt: { $gte: yesterday, $lt: today },
      paymentStatus: { $in: ["approved", "paid"] },
    }).populate("items.productId", "name category");

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSales = sales.length;
    const onlineSales = sales.filter(s => s.source === "online").length;
    const retailSales = sales.filter(s => s.source === "retail").length;

    const adminEmail = process.env.ADMIN_EMAIL || "admin@dokimascosmetics.com";

    await sendEmail({
      to: adminEmail,
      subject: `📊 Daily Sales Report - ${yesterday.toLocaleDateString()}`,
      html: getDailySalesReportTemplate(yesterday, totalRevenue, totalSales, onlineSales, retailSales),
    });
  } catch (error) {
    console.error("Failed to send daily sales report:", error);
    throw error;
  }
}

/**
 * Send weekly sales report
 */
export async function sendWeeklySalesReport(): Promise<void> {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    // Fetch week's sales
    const sales = await Sale.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: { $in: ["approved", "paid"] },
    }).populate("items.productId", "name");

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSales = sales.length;

    // Get top 5 products
    const productSales: any = {};
    sales.forEach(sale => {
      sale.items.forEach((item: any) => {
        const id = item.productId._id.toString();
        if (!productSales[id]) {
          productSales[id] = {
            name: item.productId.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[id].quantity += item.quantity;
        productSales[id].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@dokimascosmetics.com";

    await sendEmail({
      to: adminEmail,
      subject: `📈 Weekly Sales Report - Week of ${startDate.toLocaleDateString()}`,
      html: getWeeklySalesReportTemplate(startDate, endDate, totalRevenue, totalSales, topProducts),
    });
  } catch (error) {
    console.error("Failed to send weekly sales report:", error);
    throw error;
  }
}

/**
 * Send low stock alert to admin
 */
export async function sendLowStockReport(): Promise<void> {
  try {
    const lowStockProducts = await checkLowStock();

    if (lowStockProducts.length === 0) {
      return; // No low stock products, skip email
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@dokimascosmetics.com";

    await sendEmail({
      to: adminEmail,
      subject: `⚠️ Low Stock Alert: ${lowStockProducts.length} Products Need Restocking`,
      html: getLowStockReportTemplate(lowStockProducts),
    });
  } catch (error) {
    console.error("Failed to send low stock report:", error);
    throw error;
  }
}

// Email Templates

function getDailySalesReportTemplate(
  date: Date,
  revenue: number,
  totalSales: number,
  onlineSales: number,
  retailSales: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .stat-card { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; color: #8B5CF6; }
          .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Daily Sales Report</h1>
            <p>${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <h2 style="margin-bottom: 20px;">Sales Summary</h2>
            
            <div class="stat-card">
              <div class="stat-value">$${revenue.toFixed(2)}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
              <div class="stat-card">
                <div class="stat-value">${totalSales}</div>
                <div class="stat-label">Total Sales</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${onlineSales}</div>
                <div class="stat-label">Online</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${retailSales}</div>
                <div class="stat-label">Retail</div>
              </div>
            </div>
            
            <p style="margin-top: 20px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/analytics" 
                 style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">
                View Full Analytics
              </a>
            </p>
            
            <p style="margin-top: 20px;">Best regards,<br>Dokimas Cosmetics System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getWeeklySalesReportTemplate(
  startDate: Date,
  endDate: Date,
  revenue: number,
  totalSales: number,
  topProducts: any[]
): string {
  const topProductsHTML = topProducts
    .map((p, i) => `
      <tr>
        <td style="padding: 8px;">${i + 1}</td>
        <td style="padding: 8px;">${p.name}</td>
        <td style="padding: 8px; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; text-align: right;">$${p.revenue.toFixed(2)}</td>
      </tr>
    `)
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .stat-card { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; text-align: center; }
          table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
          th { background: #f3f4f6; padding: 12px 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Weekly Sales Report</h1>
            <p>${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
          </div>
          <div class="content">
            <h2>Performance Summary</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div class="stat-card">
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">$${revenue.toFixed(2)}</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Total Revenue</div>
              </div>
              <div class="stat-card">
                <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${totalSales}</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Total Sales</div>
              </div>
            </div>
            
            <h3 style="margin-top: 30px;">Top 5 Products</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th style="text-align: center;">Units Sold</th>
                  <th style="text-align: right;">Revenue</th>
                </tr>
              </thead>
              <tbody>
                ${topProductsHTML}
              </tbody>
            </table>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/analytics" 
                 style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">
                View Full Analytics Dashboard
              </a>
            </p>
            
            <p style="margin-top: 20px;">Best regards,<br>Dokimas Cosmetics System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getLowStockReportTemplate(products: any[]): string {
  const productsHTML = products
    .map(
      (p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.category}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <strong style="color: #ef4444;">${p.stock}</strong>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.sku}</td>
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
            <p><strong>${products.length} products</strong> are running low on stock:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th style="text-align: center;">Stock</th>
                  <th>SKU</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/admin/inventory" class="button">
                View Inventory Dashboard
              </a>
            </p>
            
            <p>Best regards,<br>Dokimas Cosmetics System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}




