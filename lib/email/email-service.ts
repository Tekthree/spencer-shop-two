/**
 * Transactional purchase emails sent through Resend.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_SITE_URL = 'https://www.spencergreyart.com';

export interface OrderConfirmationData {
  orderId: string;
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
  requiresShipping: boolean;
}

export interface ShippingConfirmationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  carrier: string;
  trackingNumber: string;
}

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

type EmailOptions = {
  apiKey?: string;
  from?: string;
  replyTo?: string;
  adminEmail?: string;
  siteUrl?: string;
  fetcher?: typeof fetch;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character] ?? character);

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function getEmailConfig(options: EmailOptions = {}) {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY;
  const from = options.from ?? process.env.RESEND_FROM_EMAIL;
  const replyTo = options.replyTo ?? process.env.RESEND_REPLY_TO;

  if (!apiKey || !from || !replyTo) {
    throw new Error('Resend email service is not configured');
  }

  return { apiKey, from, replyTo };
}

export async function sendEmail(message: EmailMessage, options: EmailOptions = {}) {
  const { apiKey, from, replyTo } = getEmailConfig(options);
  const response = await (options.fetcher ?? fetch)(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': message.idempotencyKey
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      reply_to: replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text
    }),
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) {
    throw new Error(`Resend rejected email with status ${response.status}`);
  }

  const result = await response.json() as { id?: string };
  if (!result.id) {
    throw new Error('Resend accepted the request without returning an email ID');
  }

  return { id: result.id };
}

function generateOrderConfirmationHTML(data: OrderConfirmationData) {
  const customerName = escapeHtml(data.customerName);
  const orderNumber = escapeHtml(data.orderNumber);
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.title)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.size)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;text-align:right;">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  return `<!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order confirmation</title></head>
    <body style="margin:0;background:#f6f4f0;color:#161616;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:#fff;padding:40px 32px;border:1px solid #e5e2dc;">
          <p style="margin:0 0 32px;font-size:22px;font-weight:700;letter-spacing:.04em;">SPENCER GREY</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Thank you for your order</h1>
          <p style="margin:0 0 24px;line-height:1.6;">Hi ${customerName}, your payment was received and ${data.requiresShipping ? 'your order is now being prepared for shipment' : 'your purchase is confirmed'}.</p>
          <p style="margin:0 0 8px;"><strong>Order:</strong> ${orderNumber}</p>
          <p style="margin:0 0 28px;"><strong>Date:</strong> ${escapeHtml(data.date)}</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead><tr><th align="left" style="padding-bottom:10px;border-bottom:2px solid #161616;">Artwork</th><th align="left" style="padding-bottom:10px;border-bottom:2px solid #161616;">Size</th><th style="padding-bottom:10px;border-bottom:2px solid #161616;">Qty</th><th align="right" style="padding-bottom:10px;border-bottom:2px solid #161616;">Price</th></tr></thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <p style="margin:24px 0 0;text-align:right;font-size:18px;"><strong>Total: ${formatPrice(data.total)}</strong></p>
          <p style="margin:36px 0 0;line-height:1.6;color:#555;">Questions about your order? Reply to this email and we’ll help.</p>
        </div>
      </div>
    </body>
  </html>`;
}

function generateOrderConfirmationText(data: OrderConfirmationData) {
  const items = data.items.map(item =>
    `${item.title} — ${item.size} × ${item.quantity}: ${formatPrice(item.price)}`
  ).join('\n');

  const nextStep = data.requiresShipping ? 'Your order is now being prepared for shipment.' : 'Your purchase is confirmed.';
  return `Thank you for your order, ${data.customerName}.\n\nYour payment was received. ${nextStep}\n\nOrder: ${data.orderNumber}\nDate: ${data.date}\n\n${items}\n\nTotal: ${formatPrice(data.total)}\n\nQuestions about your order? Reply to this email and we’ll help.`;
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData,
  options: EmailOptions = {}
) {
  return sendEmail({
    to: data.customerEmail,
    subject: `Order confirmation ${data.orderNumber}`,
    idempotencyKey: `order/${data.orderNumber}/customer`,
    html: generateOrderConfirmationHTML(data),
    text: generateOrderConfirmationText(data)
  }, options);
}

export async function sendAdminOrderNotification(
  data: OrderConfirmationData,
  options: EmailOptions = {}
) {
  const adminEmail = options.adminEmail ?? process.env.ORDER_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    throw new Error('ORDER_NOTIFICATION_EMAIL is not configured');
  }

  const siteUrl = options.siteUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SITE_URL;
  const orderNumber = escapeHtml(data.orderNumber);
  const customerName = escapeHtml(data.customerName);
  const customerEmail = escapeHtml(data.customerEmail);
  const ordersUrl = `${siteUrl.replace(/\/$/, '')}/admin/orders/${encodeURIComponent(data.orderId)}`;

  return sendEmail({
    to: adminEmail,
    subject: `New order ${data.orderNumber}`,
    idempotencyKey: `order/${data.orderNumber}/admin`,
    html: `<h1>New order received</h1><p><strong>Order:</strong> ${orderNumber}</p><p><strong>Customer:</strong> ${customerName} (${customerEmail})</p><p><strong>Total:</strong> ${formatPrice(data.total)}</p><p><strong>Date:</strong> ${escapeHtml(data.date)}</p><p><a href="${escapeHtml(ordersUrl)}">View this order in the admin dashboard</a></p>`,
    text: `New order received\n\nOrder: ${data.orderNumber}\nCustomer: ${data.customerName} (${data.customerEmail})\nTotal: ${formatPrice(data.total)}\nDate: ${data.date}\n\nView order: ${ordersUrl}`
  }, options);
}

export async function sendShippingConfirmationEmail(
  data: ShippingConfirmationData,
  options: EmailOptions = {}
) {
  const tracking = escapeHtml(data.trackingNumber);
  const carrier = escapeHtml(data.carrier);
  return sendEmail({
    to: data.customerEmail,
    subject: `Your order ${data.orderNumber} has shipped`,
    idempotencyKey: `order/${data.orderNumber}/shipped/${data.trackingNumber}`,
    html: `<h1>Your artwork is on its way</h1><p>Hi ${escapeHtml(data.customerName)}, order <strong>${escapeHtml(data.orderNumber)}</strong> has shipped.</p><p><strong>Carrier:</strong> ${carrier}<br><strong>Tracking number:</strong> ${tracking}</p><p>Questions? Reply to this email and we’ll help.</p>`,
    text: `Your artwork is on its way\n\nHi ${data.customerName}, order ${data.orderNumber} has shipped.\n\nCarrier: ${data.carrier}\nTracking number: ${data.trackingNumber}\n\nQuestions? Reply to this email and we’ll help.`
  }, options);
}
