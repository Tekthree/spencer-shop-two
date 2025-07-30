# Email Integration Setup

This document explains how to set up and configure email confirmations for the Spencer Grey artist website.

## Overview

The website uses Nodemailer to send transactional emails for:
- Order confirmations to customers
- Order notifications to administrators

## Environment Variables

Add the following variables to your `.env.local` file:

```
# Email Configuration
EMAIL_HOST=live.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USERNAME=api_spencergrey
EMAIL_PASSWORD=YOUR_API_TOKEN
EMAIL_FROM=orders@spencergrey.com
EMAIL_SECURE=false
ADMIN_EMAIL=admin@spencergrey.com
```

## Email Service Configuration

Based on the Mailtrap configuration shown in your screenshot:

1. **Host**: `live.smtp.mailtrap.io`
2. **Port**: `587` (or `25` or `2525`)
3. **Username**: `api_spencergrey`
4. **Password**: Your API token from Mailtrap
5. **Auth**: `PLAIN, LOGIN`
6. **TLS**: Required, STARTTLS on ports 587, 2525 and 25, SSL on port 465

## Testing Email Functionality

To test if emails are working correctly:

1. Make a test purchase on the website
2. Check your Mailtrap inbox for the confirmation email
3. Verify that both customer and admin emails are being sent

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

1. Check that all environment variables are correctly set
2. Verify that the Stripe webhook is receiving the `checkout.session.completed` event
3. Look for any errors in the console logs related to email sending
4. Ensure the customer email is being captured during checkout

## Implementation Details

The email functionality is implemented in:

- `lib/email/email-service.ts` - Core email service with templates and sending functions
- `app/api/webhooks/stripe/route.ts` - Integration with Stripe webhooks to trigger emails

## Future Enhancements

Potential improvements for the email system:

1. Add email templates for shipping notifications
2. Implement abandoned cart reminder emails
3. Create a newsletter subscription system
4. Add email verification for customer accounts (if implemented)
