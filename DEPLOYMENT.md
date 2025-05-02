# Deployment Guide for Spencer Grey Artist Website

This guide outlines the steps to deploy the Spencer Grey artist website to production.

## Prerequisites

- A Vercel account (recommended for Next.js applications)
- A Supabase project set up with the required tables
- Stripe account with API keys
- GitHub repository with your code

## Environment Variables

The following environment variables need to be set in your deployment platform:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Site
NEXT_PUBLIC_SITE_URL=your_production_site_url
```

## Deployment Steps for Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy the application

### Detailed Steps

1. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Configure project settings (Next.js should be auto-detected)

2. **Configure Environment Variables**:
   - In the Vercel project settings, go to "Environment Variables"
   - Add all the variables listed above
   - Make sure to set the correct production URLs

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your application

4. **Set Up Webhooks**:
   - Update your Stripe webhook endpoint to point to your production URL
   - The endpoint should be: `https://your-domain.com/api/webhooks/stripe`

## Post-Deployment Checks

1. Verify the site loads correctly
2. Test the checkout process with Stripe's test mode
3. Confirm that the admin dashboard is working
4. Check that image uploads to Supabase storage are functioning

## Optimizations

1. **Image Optimization**:
   - Ensure all images use Next.js Image component
   - Consider using a CDN for large media files

2. **Performance**:
   - Run Lighthouse tests and address any issues
   - Enable caching where appropriate

3. **Security**:
   - Ensure Supabase Row Level Security policies are correctly set
   - Verify that admin routes are properly protected

## Troubleshooting

If you encounter issues during deployment:

1. Check Vercel build logs for errors
2. Verify all environment variables are correctly set
3. Ensure Supabase and Stripe connections are working
4. Check for any CORS issues with API endpoints

## Continuous Deployment

Vercel automatically deploys when changes are pushed to your main branch. To set up preview deployments:

1. Configure branch deployments in Vercel
2. Set up environment variables for preview environments

## Monitoring

1. Set up error tracking with Vercel Analytics
2. Monitor Stripe webhook events for payment processing
3. Set up database monitoring in Supabase
