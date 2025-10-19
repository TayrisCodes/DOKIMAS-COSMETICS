/**
 * Loyalty Email Templates
 */

export function getWelcomeEmail(customerName: string, points: number): {
  subject: string;
  html: string;
} {
  return {
    subject: `Welcome to Dokimas! Here are your ${points} bonus points`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .points-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 6px; }
            .points-value { font-size: 48px; font-weight: bold; color: #8B5CF6; text-align: center; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .feature { padding: 15px; margin: 10px 0; background: white; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Dokimas Cosmetics!</h1>
              <p>Your journey to beautiful skin starts here</p>
            </div>
            <div class="content">
              <h2>Hello ${customerName}! 🎉</h2>
              <p>We're thrilled to have you join our community of beauty enthusiasts!</p>
              
              <div class="points-box">
                <p style="text-align: center; margin: 0; font-size: 14px; color: #6b7280;">Your Welcome Bonus</p>
                <div class="points-value">${points}</div>
                <p style="text-align: center; margin: 0; font-size: 14px; color: #6b7280;">Loyalty Points</p>
              </div>

              <h3>How to Use Your Points:</h3>
              <div class="feature">
                <strong>🛍️ Earn Points:</strong> Get 1 point for every 10 ETB you spend
              </div>
              <div class="feature">
                <strong>💰 Redeem Rewards:</strong> Use points at checkout for instant discounts
              </div>
              <div class="feature">
                <strong>🎁 Exclusive Perks:</strong> Unlock special offers as you earn more
              </div>

              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Start Shopping</a>
              </p>

              <p>Visit your loyalty dashboard anytime to check your points balance and rewards!</p>
              
              <p>Best regards,<br>The Dokimas Cosmetics Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getPointsEarnedEmail(
  customerName: string,
  points: number,
  orderTotal: number,
  newBalance: number
): {
  subject: string;
  html: string;
} {
  return {
    subject: `You earned ${points} loyalty points! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .earn-box { background: #D1FAE5; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .points { font-size: 36px; font-weight: bold; color: #10B981; }
            .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Points Earned! 🎊</h1>
            </div>
            <div class="content">
              <h2>Great news, ${customerName}!</h2>
              <p>Your recent purchase of ${orderTotal} ETB has earned you rewards!</p>
              
              <div class="earn-box">
                <div class="points">+${points} Points</div>
                <p style="margin: 10px 0 0 0; color: #6b7280;">Added to your account</p>
              </div>

              <table style="width: 100%; margin: 20px 0;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0;"><strong>Your New Balance:</strong></td>
                  <td style="padding: 10px 0; text-align: right; color: #8B5CF6; font-size: 20px; font-weight: bold;">${newBalance} points</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">Points Value:</td>
                  <td style="padding: 10px 0; text-align: right;">~${(newBalance / 2).toFixed(2)} ETB</td>
                </tr>
              </table>

              <p style="background: #FEF3C7; padding: 15px; border-radius: 6px; border-left: 4px solid #F59E0B;">
                💡 <strong>Tip:</strong> You can redeem your points at checkout for instant discounts on your next order!
              </p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Shop & Earn More</a>
              </p>
              
              <p>Best regards,<br>Dokimas Cosmetics</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getRewardAvailableEmail(
  customerName: string,
  points: number,
  discount: number
): {
  subject: string;
  html: string;
} {
  return {
    subject: `Your ${discount} ETB discount is ready to use! 💰`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .reward-box { background: white; border: 3px dashed #F59E0B; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .discount { font-size: 48px; font-weight: bold; color: #EF4444; }
            .button { display: inline-block; padding: 15px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Reward Ready!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${customerName}!</h2>
              <p>You have enough points to claim an amazing discount!</p>
              
              <div class="reward-box">
                <div class="discount">${discount} ETB OFF</div>
                <p style="margin: 15px 0 0 0; font-size: 18px; color: #6b7280;">Using ${points} points</p>
              </div>

              <h3>How to Redeem:</h3>
              <ol style="line-height: 2;">
                <li>Add your favorite products to cart</li>
                <li>Go to checkout</li>
                <li>Select "Use Loyalty Points"</li>
                <li>Enjoy your instant discount!</li>
              </ol>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Redeem Now</a>
              </p>
              
              <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px;">
                Your points never expire. Redeem anytime!
              </p>
              
              <p>Happy Shopping!<br>Dokimas Cosmetics</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getInactivityReminderEmail(
  customerName: string,
  daysSinceOrder: number,
  couponCode?: string
): {
  subject: string;
  html: string;
} {
  return {
    subject: `We miss you, ${customerName}! Come back for 15% off`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EC4899; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .coupon { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .coupon-code { font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #EC4899; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We Miss You! 💜</h1>
            </div>
            <div class="content">
              <h2>Hello ${customerName},</h2>
              <p>It's been ${daysSinceOrder} days since we last saw you, and we'd love to welcome you back!</p>
              
              <p>Your skin deserves the best care, and we have some amazing new products you'll love.</p>

              ${
                couponCode
                  ? `
              <div class="coupon">
                <p style="margin: 0; font-size: 14px;">Welcome Back Offer</p>
                <div class="coupon-code">${couponCode}</div>
                <p style="margin: 0; font-size: 18px;">15% OFF Your Next Order</p>
              </div>
              <p style="text-align: center; font-size: 14px; color: #6b7280;">
                Use code at checkout. Valid for 7 days.
              </p>
              `
                  : ""
              }

              <h3>What's New:</h3>
              <ul>
                <li>🌟 New arrivals in skincare</li>
                <li>💰 Special promotions</li>
                <li>🎁 Earn loyalty points on every purchase</li>
              </ul>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Shop Now</a>
              </p>
              
              <p>We look forward to serving you again!</p>
              <p>Best regards,<br>The Dokimas Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function getTopBuyerAppreciationEmail(
  customerName: string,
  totalSpent: number,
  totalOrders: number,
  couponCode: string
): {
  subject: string;
  html: string;
} {
  return {
    subject: `Thank you for being a VIP customer! 🌟`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
            .vip-box { background: white; border: 3px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #8B5CF6; }
            .coupon { background: #FEF3C7; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
            .coupon-code { font-size: 24px; font-weight: bold; color: #F59E0B; letter-spacing: 2px; }
            .button { display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 VIP Customer Appreciation 🌟</h1>
            </div>
            <div class="content">
              <h2>Dear ${customerName},</h2>
              <p><strong>You are truly special to us!</strong></p>
              <p>We wanted to take a moment to express our heartfelt gratitude for your continued loyalty and support.</p>
              
              <div class="vip-box">
                <h3 style="text-align: center; margin-top: 0;">Your Shopping Journey</h3>
                <div class="stats">
                  <div class="stat">
                    <div class="stat-value">${totalOrders}</div>
                    <div style="color: #6b7280; font-size: 14px;">Orders Placed</div>
                  </div>
                  <div class="stat">
                    <div class="stat-value">${totalSpent} ETB</div>
                    <div style="color: #6b7280; font-size: 14px;">Total Invested</div>
                  </div>
                </div>
              </div>

              <p>As a token of our appreciation, here's an exclusive VIP offer just for you:</p>

              <div class="coupon">
                <p style="margin: 0 0 10px 0; font-weight: bold;">Exclusive VIP Discount</p>
                <div class="coupon-code">${couponCode}</div>
                <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">20% OFF - Valid for 30 days</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Shop with Your VIP Code</a>
              </p>

              <p style="margin-top: 30px;">Thank you for choosing Dokimas Cosmetics. Your trust and loyalty mean the world to us!</p>
              
              <p>With gratitude,<br>The Dokimas Cosmetics Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}



