#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';

const TEST_PRODUCT = {
  id: 'c2e91c13-3c12-4c3f-91a8-ec7cc7910001',
  slug: 'private-checkout-test-2026',
  title: 'Private Checkout Test - $0.50',
  description: 'Temporary direct-link product for verifying the live checkout flow. This is not a physical artwork.',
  year: 2026,
  medium: 'Checkout test',
  images: [
    {
      url: '/images/og-image.jpg',
      alt: 'Spencer Grey Art checkout test',
      type: 'main'
    }
  ],
  sizes: [
    {
      size: 'Test purchase',
      price: 50,
      edition_limit: 3,
      editions_sold: 0
    }
  ]
};

const command = process.argv[2];

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be injected into this process');
}

if (!['create', 'update', 'status', 'remove'].includes(command)) {
  throw new Error('Usage: node scripts/manage-live-test-product.mjs <create|update|status|remove>');
}

const sql = neon(process.env.DATABASE_URL);

async function getProduct() {
  const rows = await sql`
    SELECT id, slug, title, sizes, is_hidden, requires_shipping, created_at
    FROM artworks
    WHERE id = ${TEST_PRODUCT.id}
    LIMIT 1
  `;

  return rows[0] || null;
}

async function getOrderReferences() {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM orders o
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(o.items) AS item
      WHERE item->>'artwork_id' = ${TEST_PRODUCT.id}
    )
  `;

  return rows[0]?.count || 0;
}

async function createProduct() {
  await sql`
    INSERT INTO artworks (
      id, slug, title, description, year, medium, featured, images, sizes,
      is_hidden, requires_shipping
    )
    VALUES (
      ${TEST_PRODUCT.id},
      ${TEST_PRODUCT.slug},
      ${TEST_PRODUCT.title},
      ${TEST_PRODUCT.description},
      ${TEST_PRODUCT.year},
      ${TEST_PRODUCT.medium},
      FALSE,
      ${JSON.stringify(TEST_PRODUCT.images)}::jsonb,
      ${JSON.stringify(TEST_PRODUCT.sizes)}::jsonb,
      TRUE,
      FALSE
    )
    ON CONFLICT (id) DO NOTHING
  `;

  const product = await getProduct();
  const size = product?.sizes?.[0];
  const valid = product
    && product.slug === TEST_PRODUCT.slug
    && product.is_hidden === true
    && product.requires_shipping === false
    && size?.price === TEST_PRODUCT.sizes[0].price
    && size?.edition_limit === 3;

  if (!valid) {
    throw new Error('The live test product exists but does not match the guarded configuration');
  }

  console.log(JSON.stringify({
    state: 'ready',
    id: product.id,
    slug: product.slug,
    price_cents: size.price,
    edition_limit: size.edition_limit,
    editions_sold: size.editions_sold,
    is_hidden: product.is_hidden,
    requires_shipping: product.requires_shipping
  }, null, 2));
}

async function updateProduct() {
  const product = await getProduct();
  const orderReferences = await getOrderReferences();
  const size = product?.sizes?.[0];
  const safeToUpdate = product
    && product.slug === TEST_PRODUCT.slug
    && product.is_hidden === true
    && product.requires_shipping === false
    && product.sizes?.length === 1
    && size?.size === 'Test purchase'
    && size?.edition_limit === 3
    && size?.editions_sold === 0
    && orderReferences === 0;

  if (!safeToUpdate) {
    throw new Error('The live test product is not in a safe state for a price update');
  }

  const updated = await sql`
    UPDATE artworks
    SET title = ${TEST_PRODUCT.title},
        sizes = ${JSON.stringify(TEST_PRODUCT.sizes)}::jsonb
    WHERE id = ${TEST_PRODUCT.id}
      AND slug = ${TEST_PRODUCT.slug}
      AND is_hidden = TRUE
      AND requires_shipping = FALSE
    RETURNING id, slug, title, sizes, is_hidden, requires_shipping
  `;

  if (updated.length !== 1 || updated[0].sizes?.[0]?.price !== TEST_PRODUCT.sizes[0].price) {
    throw new Error('Guarded update did not set the expected test price');
  }

  console.log(JSON.stringify({
    state: 'updated',
    product: updated[0],
    order_references: orderReferences
  }, null, 2));
}

async function showStatus() {
  const product = await getProduct();
  const orderReferences = await getOrderReferences();

  console.log(JSON.stringify({
    state: product ? 'present' : 'absent',
    product,
    order_references: orderReferences
  }, null, 2));
}

async function removeProduct() {
  if (process.env.CONFIRM_REMOVE_LIVE_TEST_PRODUCT !== 'YES') {
    throw new Error('Set CONFIRM_REMOVE_LIVE_TEST_PRODUCT=YES to remove the product');
  }

  const deleted = await sql`
    DELETE FROM artworks
    WHERE id = ${TEST_PRODUCT.id}
      AND slug = ${TEST_PRODUCT.slug}
      AND is_hidden = TRUE
    RETURNING id, slug
  `;

  if (deleted.length !== 1) {
    throw new Error('Guarded removal did not delete exactly one test product');
  }

  console.log(JSON.stringify({ state: 'removed', product: deleted[0] }, null, 2));
}

if (command === 'create') {
  await createProduct();
} else if (command === 'update') {
  await updateProduct();
} else if (command === 'status') {
  await showStatus();
} else {
  await removeProduct();
}
