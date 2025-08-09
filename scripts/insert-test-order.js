/**
 * Script to insert a test order into the Supabase database
 * Run with: node scripts/insert-test-order.js
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Simple function to generate a unique ID without requiring uuid package
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Load environment variables from .env.local
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

/**
 * Insert a test order into the database
 */
async function insertTestOrder() {
  try {
    // Generate a unique payment intent ID
    const paymentIntentId = `pi_test_${Date.now()}`;
    
    // Create a test order
    const testOrder = {
      customer_info: {
        name: "Test Customer",
        email: "test@example.com",
        address: {
          line1: "123 Test St",
          city: "Test City",
          state: "TS",
          postal_code: "12345",
          country: "US"
        }
      },
      items: [
        {
          artwork_id: generateId(), // Random ID for artwork
          title: "Test Artwork",
          size: "8x10",
          price: 9900,
          edition_number: 1,
          quantity: 1
        }
      ],
      total: 9900,
      status: 'paid',
      payment_intent: paymentIntentId,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting test order...');
    
    // Insert the order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select();
    
    if (error) {
      console.error('Error inserting test order:', error);
      return;
    }
    
    console.log('Test order inserted successfully!');
    console.log('Order ID:', data[0].id);
    console.log('Payment Intent:', paymentIntentId);
    
    // Verify the order was inserted
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_intent', paymentIntentId);
    
    if (fetchError) {
      console.error('Error fetching the inserted order:', fetchError);
      return;
    }
    
    console.log('\nVerified order in database:');
    console.log(JSON.stringify(orders[0], null, 2));
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
insertTestOrder().catch(console.error);
