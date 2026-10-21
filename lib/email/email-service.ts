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
    imageUrl?: string;
    editionNumbers?: number[];
    editionLimit?: number;
  }[];
  total: number;
  date: string;
  requiresShipping: boolean;
  isTest?: boolean;
}

export interface ShippingConfirmationData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  carrier: string;
  trackingNumber: string;
}

export interface OperationalAlertData {
  eventId: number;
  source: string;
  message: string;
  occurredAt: string;
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
  const itemsHTML = data.items.map(item => {
    const imageUrl = item.imageUrl?.startsWith('https://') ? escapeHtml(item.imageUrl) : null;
    const editions = item.editionNumbers?.length
      ? `Edition${item.editionNumbers.length > 1 ? 's' : ''} ${item.editionNumbers.join(', ')}${item.editionLimit ? ` of ${item.editionLimit}` : ''}`
      : null;

    return `
      <tr>
        <td style="padding:24px 0;border-bottom:1px solid #dedbd5;vertical-align:top;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              ${imageUrl ? `<td width="116" style="width:116px;padding-right:20px;vertical-align:top;"><img src="${imageUrl}" width="116" alt="${escapeHtml(item.title)} by Spencer Grey" style="display:block;width:116px;height:auto;border:0;"></td>` : ''}
              <td style="vertical-align:top;">
                <p style="margin:0 0 5px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;color:#161616;">${escapeHtml(item.title)}</p>
                <p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:#626262;">Limited edition fine art print by Spencer Grey</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;line-height:1.6;color:#161616;">
                  <tr><td style="padding:0 22px 2px 0;color:#707070;">Print size</td><td style="padding:0 0 2px;font-weight:600;">${escapeHtml(item.size)}</td></tr>
                  <tr><td style="padding:0 22px 2px 0;color:#707070;">Quantity</td><td style="padding:0 0 2px;font-weight:600;">${item.quantity}</td></tr>
                  ${editions ? `<tr><td style="padding:0 22px 2px 0;color:#707070;">Your edition</td><td style="padding:0 0 2px;font-weight:600;">${escapeHtml(editions.replace(/^Editions? /, ''))}</td></tr>` : ''}
                </table>
                <p style="margin:18px 0 0;font-size:16px;font-weight:600;color:#161616;">${formatPrice(item.price * item.quantity)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join('');

  return `<!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order confirmation</title></head>
    <body style="margin:0;background:#f4f1ec;color:#161616;font-family:Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#fff;padding:40px 32px;border:1px solid #dedbd5;">
          <p style="margin:0 0 34px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1;letter-spacing:-.02em;">Spencer Grey</p>
          <h1 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;line-height:1.15;letter-spacing:-.02em;">${data.isTest ? 'Test order confirmation' : 'Thank you for your order'}</h1>
          <p style="margin:0 0 30px;font-size:15px;line-height:1.65;color:#4f4f4f;">${data.isTest
            ? `Hi ${customerName}, this is a preview of the confirmation a collector receives after purchase. No payment was taken and no order was created.`
            : `Hi ${customerName}, your payment was received and ${data.requiresShipping ? 'your artwork is now being prepared for shipment' : 'your purchase is confirmed'}.`}</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;font-size:13px;line-height:1.5;">
            <tr><td style="padding:0 0 5px;color:#707070;">Order</td><td style="padding:0 0 5px;text-align:right;font-weight:600;">${orderNumber}</td></tr>
            <tr><td style="padding:0;color:#707070;">Date</td><td style="padding:0;text-align:right;">${escapeHtml(data.date)}</td></tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #161616;">
            <tbody>${itemsHTML}</tbody>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;border-top:1px solid #161616;font-size:18px;">
            <tr><td style="padding-top:18px;font-weight:600;">Total paid</td><td style="padding-top:18px;text-align:right;font-weight:600;">${formatPrice(data.total)}</td></tr>
          </table>
          <div style="margin-top:30px;padding:20px;background:#f4f1ec;font-size:14px;line-height:1.65;color:#454545;">
            <p style="margin:0 0 6px;font-weight:600;color:#161616;">Made to be collected</p>
            <p style="margin:0;">Your print is hand-numbered and signed by Spencer Grey. A signed certificate of authenticity is included.</p>
          </div>
          <p style="margin:30px 0 0;font-size:14px;line-height:1.65;color:#555;">${data.requiresShipping ? 'We will email your tracking number when your artwork leaves the studio. ' : ''}Questions about your order? Reply to this email and we’ll help.</p>
        </div>
        <p style="margin:18px 0 0;text-align:center;font-size:12px;line-height:1.5;color:#6b6b6b;">Spencer Grey Art · Seattle, Washington</p>
      </div>
    </body>
  </html>`;
}

function generateOrderConfirmationText(data: OrderConfirmationData) {
  const items = data.items.map(item =>
    `${item.title}\nPrint size: ${item.size}\nQuantity: ${item.quantity}${item.editionNumbers?.length ? `\nEdition${item.editionNumbers.length > 1 ? 's' : ''}: ${item.editionNumbers.join(', ')}${item.editionLimit ? ` of ${item.editionLimit}` : ''}` : ''}\nPrice: ${formatPrice(item.price * item.quantity)}`
  ).join('\n');

  const nextStep = data.requiresShipping ? 'Your order is now being prepared for shipment.' : 'Your purchase is confirmed.';
  const introduction = data.isTest
    ? `This is a preview of the confirmation a collector receives after purchase. No payment was taken and no order was created.`
    : `Your payment was received. ${nextStep}`;
  return `${data.isTest ? 'Test order confirmation' : `Thank you for your order, ${data.customerName}.`}\n\n${introduction}\n\nOrder: ${data.orderNumber}\nDate: ${data.date}\n\n${items}\n\nTotal: ${formatPrice(data.total)}\n\nQuestions about your order? Reply to this email and we’ll help.`;
}

export async function sendOrderConfirmationEmail(
  data: OrderConfirmationData,
  options: EmailOptions = {}
) {
  return sendEmail({
    to: data.customerEmail,
    subject: `${data.isTest ? '[TEST] ' : ''}Order confirmation ${data.orderNumber}`,
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

export async function sendOperationalAlertEmail(
  data: OperationalAlertData,
  options: EmailOptions = {}
) {
  const adminEmail = options.adminEmail ?? process.env.ORDER_NOTIFICATION_EMAIL;
  if (!adminEmail) throw new Error('ORDER_NOTIFICATION_EMAIL is not configured');
  const siteUrl = options.siteUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SITE_URL;
  const dashboardUrl = `${siteUrl.replace(/\/$/, '')}/admin`;

  return sendEmail({
    to: adminEmail,
    subject: `Store alert: ${data.source}`,
    idempotencyKey: `operations/${data.eventId}`,
    html: `<h1>Spencer Grey Art store alert</h1><p><strong>Source:</strong> ${escapeHtml(data.source)}</p><p><strong>Time:</strong> ${escapeHtml(data.occurredAt)}</p><p>${escapeHtml(data.message)}</p><p><a href="${escapeHtml(dashboardUrl)}">Open the admin dashboard</a></p>`,
    text: `Spencer Grey Art store alert\n\nSource: ${data.source}\nTime: ${data.occurredAt}\n${data.message}\n\nAdmin dashboard: ${dashboardUrl}`
  }, options);
}
