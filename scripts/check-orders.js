/**
 * Script to check orders in Neon DB
 * Run with: node scripts/check-orders.js
 */
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('Error: Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkOrders() {
  console.log('Checking orders table...');

  try {
    const orders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 20
    `;

    console.log(`Found ${orders.length} orders (most recent 20):`);

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
      // Group by status
      const ordersByStatus = {};
      orders.forEach(order => {
        const s = order.status || 'unknown';
        if (!ordersByStatus[s]) ordersByStatus[s] = [];
        ordersByStatus[s].push(order);
      });

      console.log('\nOrders by status:');
      Object.keys(ordersByStatus).forEach(status => {
        console.log(`  ${status}: ${ordersByStatus[status].length} orders`);
      });

      console.log('\nDetailed order information:');
      orders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`);
        console.log(`  ID: ${order.id}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Created: ${new Date(order.created_at).toLocaleString()}`);
        console.log(`  Total: $${(order.total / 100).toFixed(2)}`);
        console.log(`  Payment Intent: ${order.payment_intent || 'N/A'}`);
        const ci = order.customer_info || {};
        console.log(`  Customer: ${ci.name || 'N/A'} (${ci.email || 'N/A'})`);
        if (order.items && order.items.length > 0) {
          console.log(`  Items (${order.items.length}):`);
          order.items.forEach((item, i) => {
            console.log(`    ${i + 1}. ${item.title || `Artwork #${item.artwork_id}`} - ${item.size} - $${(item.price / 100).toFixed(2)}`);
          });
        } else {
          console.log('  Items: None');
        }
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkOrders().catch(console.error);
