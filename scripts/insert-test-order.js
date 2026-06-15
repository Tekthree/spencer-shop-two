/**
 * Script to insert a test order into the Neon database
 * Run with: node scripts/insert-test-order.js
 */
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('Error: Missing DATABASE_URL environment variable');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function insertTestOrder() {
  try {
    const paymentIntentId = `pi_test_${Date.now()}`;

    const testOrder = {
      customer_info: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US'
        }
      },
      items: [
        {
          artwork_id: `id_${Date.now()}`,
          title: 'Test Artwork',
          size: '8x10',
          price: 9900,
          edition_number: 1,
          quantity: 1
        }
      ],
      total: 9900,
      status: 'paid',
      payment_intent: paymentIntentId
    };

    console.log('Inserting test order...');

    const [inserted] = await sql`
      INSERT INTO orders (customer_info, items, total, status, payment_intent)
      VALUES (
        ${JSON.stringify(testOrder.customer_info)},
        ${JSON.stringify(testOrder.items)},
        ${testOrder.total},
        ${testOrder.status},
        ${testOrder.payment_intent}
      )
      RETURNING id
    `;

    console.log('Test order inserted successfully!');
    console.log('Order ID:', inserted.id);
    console.log('Payment Intent:', paymentIntentId);

    // Verify
    const [verified] = await sql`
      SELECT * FROM orders WHERE payment_intent = ${paymentIntentId}
    `;

    console.log('\nVerified order in database:');
    console.log(JSON.stringify(verified, null, 2));
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

insertTestOrder().catch(console.error);
