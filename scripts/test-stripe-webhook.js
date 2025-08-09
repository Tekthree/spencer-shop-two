/**
 * Test script for Stripe webhook
 * This script simulates a Stripe webhook event to test the webhook handler
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createHmac } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Check required environment variables
const requiredEnvVars = [
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please add them to your .env.local file');
  process.exit(1);
}

// Load sample event from file or use default
let sampleEvent;
try {
  const samplePath = path.join(__dirname, 'sample-checkout-event.json');
  const fileContent = readFileSync(samplePath, 'utf8');
  sampleEvent = JSON.parse(fileContent);
  console.log('Loaded sample event from file');
} catch (err) {
  console.log('No sample event file found, using default event');
  // Create a sample checkout.session.completed event
  sampleEvent = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2025-04-30.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        object: 'checkout.session',
        payment_status: 'paid',
        customer_details: {
          email: 'test@example.com',
          name: 'Test Customer',
          address: {
            line1: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postal_code: '12345',
            country: 'US'
          }
        },
        metadata: {
          customer_name: 'Test Customer'
        },
        amount_total: 9900,
        payment_intent: `pi_test_${Date.now()}`,
        line_items: {
          data: [
            {
              price: {
                product: 'prod_test123'
              },
              quantity: 1
            }
          ]
        }
      }
    },
    type: 'checkout.session.completed'
  };
}

// Function to sign the payload with the webhook secret
function generateSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return {
    timestamp,
    signature
  };
}

async function sendWebhookEvent() {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`;
    console.log(`Sending webhook event to: ${webhookUrl}`);
    
    // Convert event to string
    const payload = JSON.stringify(sampleEvent);
    
    // Generate signature
    const { timestamp, signature } = generateSignature(
      payload,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Send request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`
      },
      body: payload
    });
    
    const responseText = await response.text();
    
    console.log(`Response status: ${response.status}`);
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      console.error('Webhook test failed');
    } else {
      console.log('Webhook test successful!');
    }
  } catch (error) {
    console.error('Error sending webhook event:', error);
  }
}

// Run the test
sendWebhookEvent();
