/**
 * Script to check orders in Supabase
 * Run with: node scripts/check-orders.js
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

async function checkOrders() {
  console.log('Checking orders table...');
  
  try {
    // Check if orders table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Error checking orders table:', tableError);
      return;
    }
    
    console.log('Orders table exists, found', tableInfo.length, 'sample records');
    
    // Get all orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return;
    }
    
    console.log(`Found ${orders.length} orders:`);
    
    if (orders.length === 0) {
      console.log('No orders found in the database.');
      console.log('\nPossible reasons:');
      console.log('1. No orders have been placed yet');
      console.log('2. Stripe webhook is not configured correctly');
      console.log('3. Webhook events are not being processed correctly');
      console.log('\nRecommendations:');
      console.log('- Check Stripe dashboard for webhook configuration');
      console.log('- Verify STRIPE_WEBHOOK_SECRET environment variable is set correctly');
      console.log('- Check server logs for webhook processing errors');
    } else {
      // Group orders by status
      const ordersByStatus = {};
      orders.forEach(order => {
        if (!ordersByStatus[order.status]) {
          ordersByStatus[order.status] = [];
        }
        ordersByStatus[order.status].push(order);
      });
      
      console.log('\nOrders by status:');
      Object.keys(ordersByStatus).forEach(status => {
        console.log(`${status}: ${ordersByStatus[status].length} orders`);
      });
      
      // Display detailed order information
      console.log('\nDetailed order information:');
      orders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`ID: ${order.id}`);
        console.log(`Status: ${order.status}`);
        console.log(`Created: ${new Date(order.created_at).toLocaleString()}`);
        console.log(`Total: $${(order.total / 100).toFixed(2)}`);
        console.log(`Payment Intent: ${order.payment_intent || 'N/A'}`);
        console.log(`Customer: ${order.customer_info?.name || 'N/A'} (${order.customer_info?.email || 'N/A'})`);
        
        // Display items
        if (order.items && order.items.length > 0) {
          console.log(`Items (${order.items.length}):`);
          order.items.forEach((item, i) => {
            console.log(`  ${i + 1}. ${item.title || `Artwork #${item.artwork_id}`} - ${item.size} - $${(item.price / 100).toFixed(2)}`);
          });
        } else {
          console.log('Items: None');
        }
      });
    }
    
    // Check RLS policies
    console.log('\nChecking RLS policies for orders table...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'orders' });
    
    if (policiesError) {
      console.error('Error fetching RLS policies:', policiesError);
      console.log('Note: The get_policies RPC function might not exist in your Supabase instance.');
      
      console.log('\nAlternative check: Trying to access orders with anon key...');
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      
      const { data: anonData, error: anonError } = await anonClient
        .from('orders')
        .select('count()')
        .limit(1);
      
      if (anonError) {
        console.log('Anonymous access to orders is restricted (expected behavior):', anonError.message);
      } else {
        console.log('Warning: Anonymous users can access orders table!', anonData);
      }
    } else {
      console.log('RLS Policies:', policies);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Execute the function
checkOrders().catch(console.error);
