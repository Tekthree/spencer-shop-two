-- SQL script to insert a test order into the database
-- Run this in the Supabase SQL Editor

-- Insert a test order
INSERT INTO orders (
  customer_info,
  items,
  total,
  status,
  payment_intent,
  created_at
) VALUES (
  '{"name": "Test Customer", "email": "test@example.com", "address": {"line1": "123 Test St", "city": "Test City", "state": "TS", "postal_code": "12345", "country": "US"}}',
  '[{"artwork_id": "00000000-0000-0000-0000-000000000000", "size": "8x10", "price": 9900, "edition_number": 1, "quantity": 1, "title": "Test Artwork"}]',
  9900,
  'paid',
  'pi_test_123456789',
  now()
);

-- Verify the order was inserted
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
