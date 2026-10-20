#!/usr/bin/env node

import assert from 'node:assert/strict';

import {
  sendAdminOrderNotification,
  sendEmail,
  sendOrderConfirmationEmail
} from '../lib/email/email-service.ts';

const calls = [];
const fakeFetch = async (url, options) => {
  calls.push({ url, options, body: JSON.parse(options.body) });
  return Response.json({ id: `email-${calls.length}` });
};

const data = {
  orderNumber: 'SG-1234',
  customerName: '<Collector & Friend>',
  customerEmail: 'collector@example.com',
  items: [{
    title: '<Artwork>',
    size: '12" × 18"',
    price: 100,
    quantity: 1
  }],
  total: 100,
  date: 'October 14, 2026'
};

const options = {
  apiKey: 'test-key',
  from: 'Spencer Grey Art <orders@mail.spencergreyart.com>',
  replyTo: 'support@spencergreyart.com',
  adminEmail: 'admin@example.com',
  siteUrl: 'https://www.spencergreyart.com/',
  fetcher: fakeFetch
};

await sendOrderConfirmationEmail(data, options);
await sendAdminOrderNotification(data, options);
await sendOrderConfirmationEmail(data, options);

assert.equal(calls.length, 3);
assert.equal(calls[0].url, 'https://api.resend.com/emails');
assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');
assert.equal(calls[0].options.headers['Idempotency-Key'], 'order/SG-1234/customer');
assert.equal(calls[1].options.headers['Idempotency-Key'], 'order/SG-1234/admin');
assert.equal(calls[2].options.headers['Idempotency-Key'], calls[0].options.headers['Idempotency-Key']);
assert.equal(calls[0].body.from, options.from);
assert.equal(calls[0].body.reply_to, options.replyTo);
assert.deepEqual(calls[0].body.to, ['collector@example.com']);
assert.deepEqual(calls[1].body.to, ['admin@example.com']);
assert.match(calls[0].body.html, /&lt;Collector &amp; Friend&gt;/);
assert.match(calls[0].body.html, /&lt;Artwork&gt;/);
assert.doesNotMatch(calls[0].body.html, /<Collector & Friend>/);
assert.match(calls[0].body.text, /Total: \$1\.00/);
assert.match(calls[1].body.html, /https:\/\/www\.spencergreyart\.com\/admin\/orders/);

await assert.rejects(
  () => sendEmail({
    to: 'collector@example.com',
    subject: 'Failure test',
    html: '<p>Failure</p>',
    text: 'Failure',
    idempotencyKey: 'failure/1'
  }, {
    ...options,
    fetcher: async () => new Response('{}', { status: 422 })
  }),
  /status 422/
);

console.log('Email service checks passed');
