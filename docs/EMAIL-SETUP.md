# Email Integration Setup

This document explains how to set up and configure email confirmations for the Spencer Grey artist website.

## Overview

The website uses the Resend Email API to send transactional emails for:
- Order confirmations to customers
- Order notifications to administrators

## Environment Variables

Add the following variables to your `.env.local` file:

```
# Resend
RESEND_API_KEY=re_your_domain_scoped_key
RESEND_FROM_EMAIL="Spencer Grey Art <orders@mail.spencergreyart.com>"
RESEND_REPLY_TO=your_monitored_inbox@example.com
ORDER_NOTIFICATION_EMAIL=your_order_alert_inbox@example.com
```

## Resend Configuration

1. Add `mail.spencergreyart.com` in the Resend Domains dashboard.
2. Add the SPF, DKIM, and MX records shown by Resend to the domain's GoDaddy DNS settings.
3. Wait for the Resend domain status to show that sending is verified.
4. Create a new API key named `Spencer Grey Production` with **Sending access** restricted to the Spencer Grey domain.
5. Add the key to Vercel as the `RESEND_API_KEY` Production secret. Add the sender and reply-to values as Production configuration variables.
6. Redeploy after changing Vercel environment variables.

Do not reuse a full-access account key. A domain-scoped sending key limits the impact if the application credential is ever exposed.

## Testing Email Functionality

To test if emails are working correctly:

1. Make a test purchase on the website
2. Confirm the customer receives the order confirmation
3. Confirm the address in `ORDER_NOTIFICATION_EMAIL` receives the new-order notification
4. Check the Resend Emails dashboard for delivery status for both messages
5. Check the Vercel webhook logs for `Purchase emails accepted by Resend`

## Email Templates

The system includes two email templates:

1. **Order Confirmation Email** - Sent to customers after successful purchase
   - Includes order details, items purchased, and total amount
   - Follows the Spencer Grey minimalist aesthetic

2. **Admin Notification Email** - Sent to administrators for new orders
   - Includes customer information and order summary
   - Contains a link to view the order in the admin dashboard

## Troubleshooting

If emails are not being sent:

1. Check that all Resend environment variables are correctly set and scoped to Production
2. Verify that the Stripe webhook is receiving the `checkout.session.completed` event
3. Look for any errors in the console logs related to email sending
4. Ensure the customer email is being captured during checkout
5. Confirm the sending domain is verified in Resend and the From address uses that domain

## Implementation Details

The email functionality is implemented in:

- `lib/email/email-service.ts` - Core email service with templates and sending functions
- `app/api/webhooks/stripe/route.ts` - Integration with Stripe webhooks to trigger emails

## Future Enhancements

Potential improvements for the email system:

1. Add email templates for shipping notifications
2. Add a Resend webhook to record delivered, bounced, and complained events
3. Implement abandoned cart reminder emails
4. Create a newsletter subscription system
5. Add email verification for customer accounts (if implemented)
