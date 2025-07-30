/**
 * Email service for sending transactional emails
 * Handles order confirmations and other notifications
 */

import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email configuration schema
const EmailConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  from: z.string().email(),
  secure: z.boolean().optional().default(true),
});

type EmailConfig = z.infer<typeof EmailConfigSchema>;

// Email template data
export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    title: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  date: string;
}

/**
 * Initialize email transporter with configuration
 * @param config - Email service configuration
 * @returns Nodemailer transporter
 */
function createTransporter(config: EmailConfig) {
  try {
    const validatedConfig = EmailConfigSchema.parse(config);
    
    return nodemailer.createTransport({
      host: validatedConfig.host,
      port: validatedConfig.port,
      secure: validatedConfig.secure,
      auth: {
        user: validatedConfig.username,
        pass: validatedConfig.password,
      },
    });
  } catch (error) {
    console.error('Invalid email configuration:', error);
    throw new Error('Failed to create email transporter');
  }
}

/**
 * Get email configuration from environment variables
 * @returns Email configuration object
 */
function getEmailConfig(): EmailConfig {
  return {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    username: process.env.EMAIL_USERNAME || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'orders@spencergrey.com',
    secure: process.env.EMAIL_SECURE === 'true',
  };
}

/**
 * Generate HTML for order confirmation email
 * @param data - Order confirmation data
 * @returns HTML string for email body
 */
function generateOrderConfirmationHTML(data: OrderConfirmationData): string {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${item.title}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${item.size}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #020312;
          background-color: #F6F4F0;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #000000;
        }
        .content {
          padding: 20px 0;
        }
        .order-details {
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          text-align: left;
          padding: 12px 0;
          border-bottom: 2px solid #000000;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 14px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Spencer Grey</div>
        </div>
        <div class="content">
          <h2>Thank You for Your Order</h2>
          <p>Hello ${data.customerName},</p>
          <p>Thank you for your purchase. We're preparing your order and will notify you once it ships.</p>
          
          <div class="order-details">
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${data.date}</p>
            
            <h3>Order Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr>
                  <td colspan="3" style="padding: 12px 0; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 12px 0; text-align: right;"><strong>$${(data.total / 100).toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p>If you have any questions about your order, please contact us at <a href="mailto:support@spencergrey.com">support@spencergrey.com</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Spencer Grey. All rights reserved.</p>
          <p>This email was sent to ${data.customerEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send order confirmation email
 * @param data - Order confirmation data
 * @returns Promise resolving to send result
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  try {
    const config = getEmailConfig();
    const transporter = createTransporter(config);
    
    const result = await transporter.sendMail({
      from: `"Spencer Grey" <${config.from}>`,
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber}`,
      html: generateOrderConfirmationHTML(data),
    });
    
    console.log('Order confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send admin notification about new order
 * @param data - Order data
 * @returns Promise resolving to send result
 */
export async function sendAdminOrderNotification(data: OrderConfirmationData) {
  try {
    const config = getEmailConfig();
    const transporter = createTransporter(config);
    
    const result = await transporter.sendMail({
      from: `"Spencer Grey Orders" <${config.from}>`,
      to: process.env.ADMIN_EMAIL || 'admin@spencergrey.com',
      subject: `New Order #${data.orderNumber}`,
      html: `
        <h2>New Order Received</h2>
        <p>Customer: ${data.customerName} (${data.customerEmail})</p>
        <p>Order #: ${data.orderNumber}</p>
        <p>Total: $${(data.total / 100).toFixed(2)}</p>
        <p>Date: ${data.date}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">View in Admin Dashboard</a></p>
      `,
    });
    
    console.log('Admin notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
    return { success: false, error };
  }
}
