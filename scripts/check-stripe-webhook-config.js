/**
 * Check Stripe webhook configuration
 * This script checks if the Stripe webhook is properly configured
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please add them to your .env.local file');
  process.exit(1);
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil'
});

async function checkWebhookConfig() {
  try {
    console.log('Checking Stripe webhook configuration...');
    
    // Get all webhooks
    const webhooks = await stripe.webhookEndpoints.list();
    
    // Check if we have any webhooks configured
    if (webhooks.data.length === 0) {
      console.error('No webhooks configured in Stripe!');
      console.log('You need to create a webhook endpoint in the Stripe dashboard:');
      console.log(`Endpoint URL: ${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`);
      console.log('Events to listen for: checkout.session.completed');
      return;
    }
    
    // Check if our webhook endpoint is configured
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const webhookPath = '/api/webhooks/stripe';
    const expectedEndpoint = `${appUrl}${webhookPath}`;
    
    const matchingWebhooks = webhooks.data.filter(webhook => 
      webhook.url === expectedEndpoint || 
      webhook.url.includes(webhookPath)
    );
    
    if (matchingWebhooks.length === 0) {
      console.error('No webhook configured for this application!');
      console.log('Existing webhook endpoints:');
      webhooks.data.forEach(webhook => {
        console.log(`- ${webhook.url} (${webhook.status})`);
      });
      console.log('\nYou need to create a webhook endpoint in the Stripe dashboard:');
      console.log(`Endpoint URL: ${expectedEndpoint}`);
      console.log('Events to listen for: checkout.session.completed');
      return;
    }
    
    // Check the matching webhooks
    console.log(`Found ${matchingWebhooks.length} matching webhook(s):`);
    
    for (const webhook of matchingWebhooks) {
      console.log(`\nWebhook ID: ${webhook.id}`);
      console.log(`URL: ${webhook.url}`);
      console.log(`Status: ${webhook.status}`);
      console.log(`Events:`);
      webhook.enabled_events.forEach(event => {
        console.log(`- ${event}`);
      });
      
      // Check if the webhook is listening for checkout.session.completed
      const hasCheckoutEvent = webhook.enabled_events.includes('checkout.session.completed') || 
                              webhook.enabled_events.includes('*');
      
      if (!hasCheckoutEvent) {
        console.warn('Warning: This webhook is not configured to listen for checkout.session.completed events!');
        console.log('You should update the webhook to include this event type.');
      }
      
      // Check if the webhook is enabled
      if (webhook.status !== 'enabled') {
        console.error(`Error: This webhook is not enabled (status: ${webhook.status})!`);
        console.log('You should enable this webhook in the Stripe dashboard.');
      }
    }
    
    // Check if the webhook secret matches
    console.log('\nWebhook Secret:');
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('✅ STRIPE_WEBHOOK_SECRET is set in your environment variables');
      console.log('Make sure it matches the secret from the Stripe dashboard');
    } else {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not set in your environment variables!');
    }
    
    console.log('\nWebhook configuration check complete.');
  } catch (error) {
    console.error('Error checking webhook configuration:', error);
  }
}

// Run the check
checkWebhookConfig();
