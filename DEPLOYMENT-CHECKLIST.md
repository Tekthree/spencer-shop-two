# Deployment Checklist for Spencer Grey Artist Website

Use this checklist to ensure your website is ready for production deployment.

## Pre-Deployment Checks

- [ ] All TypeScript errors are resolved
- [ ] ESLint passes without errors
- [ ] All tests pass successfully
- [ ] Environment variables are properly configured
- [ ] Stripe integration is tested in test mode
- [ ] Supabase tables and RLS policies are correctly set up
- [ ] All images are optimized and using Next.js Image component
- [ ] Responsive design works on all target devices
- [ ] Admin routes are properly secured

## Environment Variables

Ensure these environment variables are set in your deployment platform:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_SITE_URL`

## Build and Deploy

- [ ] Run `npm run deploy` to verify build succeeds locally
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy application

## Post-Deployment Verification

- [ ] Homepage loads correctly
- [ ] Artwork listings display properly
- [ ] Cart functionality works
- [ ] Checkout process completes successfully
- [ ] Admin dashboard is accessible and functional
- [ ] Contact form submits correctly
- [ ] Image uploads work in admin sections
- [ ] Stripe webhooks are receiving events
- [ ] 404 and error pages display correctly

## Performance and Security

- [ ] Run Lighthouse audit and address critical issues
- [ ] Verify SSL is properly configured
- [ ] Check that sensitive API routes are protected
- [ ] Ensure Supabase RLS policies are working as expected
- [ ] Verify that admin routes require authentication

## Final Steps

- [ ] Set up monitoring and error tracking
- [ ] Configure backup strategy for database
- [ ] Document any deployment-specific considerations
- [ ] Update DNS settings if using a custom domain
- [ ] Test the complete user journey on the live site

## Notes

- Remember to update the Stripe webhook URL to point to your production domain
- If using a custom domain, ensure DNS propagation is complete before testing
- Consider setting up a staging environment for future updates
