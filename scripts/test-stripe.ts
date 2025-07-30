/**
 * Stripe API Test Script
 * Tests various Stripe API endpoints to verify functionality
 */

import stripe from '../lib/stripe/stripe-server';

async function testStripeConnection() {
  console.log('Testing Stripe API connection...');
  
  try {
    // Test 1: Retrieve account details
    console.log('\n--- Test 1: Retrieve Account Details ---');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Successfully connected to Stripe API');
    console.log(`Account ID: ${account.id}`);
    console.log(`Account Name: ${account.business_profile?.name || 'N/A'}`);
    
    // Test 2: List products
    console.log('\n--- Test 2: List Products ---');
    const products = await stripe.products.list({ limit: 5 });
    console.log(`✅ Retrieved ${products.data.length} products`);
    products.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.id})`);
    });
    
    // Test 3: List prices
    console.log('\n--- Test 3: List Prices ---');
    const prices = await stripe.prices.list({ limit: 5 });
    console.log(`✅ Retrieved ${prices.data.length} prices`);
    prices.data.forEach((price, index) => {
      console.log(`${index + 1}. ${price.nickname || 'Unnamed'} - ${(price.unit_amount || 0) / 100} ${price.currency.toUpperCase()}`);
    });
    
    // Test 4: Check webhook endpoint configuration
    console.log('\n--- Test 4: Check Webhook Endpoints ---');
    const webhookEndpoints = await stripe.webhookEndpoints.list();
    console.log(`✅ Retrieved ${webhookEndpoints.data.length} webhook endpoints`);
    webhookEndpoints.data.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${endpoint.url}`);
      console.log(`   Events: ${endpoint.enabled_events.join(', ')}`);
    });
    
    console.log('\n✅ All Stripe API tests completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Stripe API:', error);
  }
}

// Run the tests
testStripeConnection();
