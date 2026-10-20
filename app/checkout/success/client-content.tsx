'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';

type OrderDetails = {
  fulfilled: boolean;
  paymentReceived: boolean;
  orderNumber: string | null;
  customer?: { name?: string; email?: string };
  total: number;
  status: string;
  requiresShipping: boolean;
  items: Array<{
    artwork_id: string;
    title?: string;
    size: string;
    price: number;
    edition_number?: number;
    edition_numbers?: number[];
    edition_limit?: number;
    quantity: number;
  }>;
  createdAt: string;
};

const money = (cents: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD'
}).format(cents / 100);

export function ClientSuccessContent() {
  const sessionId = useSearchParams().get('session_id');
  const { clearCart } = useCart();
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const cleared = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setError('This confirmation link is incomplete.');
      return;
    }

    let active = true;
    let attempts = 0;
    const verify = async () => {
      try {
        const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'We could not verify this payment.');
        if (!active) return;
        setDetails(data);

        if (data.fulfilled) {
          if (!cleared.current) {
            clearCart();
            cleared.current = true;
          }
          return;
        }

        attempts += 1;
        if (attempts < 20) window.setTimeout(verify, 1500);
        else setTimedOut(true);
      } catch (caught) {
        if (!active) return;
        attempts += 1;
        if (attempts < 5) window.setTimeout(verify, 1500);
        else setError(caught instanceof Error ? caught.message : 'We could not verify this payment.');
      }
    };
    verify();
    return () => { active = false; };
  }, [clearCart, sessionId]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-4 font-serif text-3xl">We could not load your order</h1>
        <p className="mb-8 text-gray-600">{error} If you were charged, your payment is still recorded. Contact us and we will confirm it.</p>
        <Link href="/contact" className="inline-flex min-h-11 items-center bg-black px-7 text-white">Contact us</Link>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center" aria-live="polite">
        <div className="mx-auto mb-6 h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
        <h1 className="mb-3 font-serif text-3xl">Confirming your order</h1>
        <p className="text-gray-600">Please keep this page open for a moment.</p>
      </main>
    );
  }

  const confirmed = details.fulfilled;
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <header className="mb-10 text-center" aria-live="polite">
        <div className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full ${confirmed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`} aria-hidden="true">
          {confirmed ? '✓' : '…'}
        </div>
        <h1 className="mb-3 font-serif text-3xl sm:text-4xl">
          {confirmed ? 'Thank you for your order' : 'Your payment is being confirmed'}
        </h1>
        <p className="mx-auto max-w-lg text-gray-600">
          {confirmed
            ? `A confirmation email has been sent to ${details.customer?.email || 'your email address'}.`
            : timedOut
              ? 'Your payment was received, but the order record is taking longer than expected. Do not pay again. We will confirm it by email.'
              : 'Payment was received. We are finishing your order record now, so please keep this page open.'}
        </p>
      </header>

      <section className="mb-8 border border-gray-200 bg-white p-5 sm:p-8" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="mb-6 font-serif text-2xl">Order summary</h2>
        <dl className="mb-7 grid gap-3 border-b border-gray-200 pb-6 text-sm sm:grid-cols-2">
          <div><dt className="text-gray-500">Order</dt><dd className="font-medium">{details.orderNumber || 'Confirming'}</dd></div>
          <div><dt className="text-gray-500">Date</dt><dd>{new Date(details.createdAt).toLocaleDateString()}</dd></div>
          <div className="min-w-0"><dt className="text-gray-500">Customer</dt><dd className="truncate">{details.customer?.name || details.customer?.email}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd className="capitalize">{details.status}</dd></div>
        </dl>

        <div className="space-y-5">
          {details.items.map((item, index) => (
            <div key={`${item.artwork_id}-${item.size}-${index}`} className="flex flex-col justify-between gap-2 border-b border-gray-100 pb-5 last:border-0 sm:flex-row">
              <div className="min-w-0">
                <h3 className="break-words font-medium">{item.title || 'Artwork'}</h3>
                <p className="text-sm text-gray-600">{item.size} · Quantity {item.quantity}</p>
                {item.edition_numbers?.length ? (
                  <p className="text-sm text-gray-600">Edition{item.edition_numbers.length > 1 ? 's' : ''} {item.edition_numbers.join(', ')}{item.edition_limit ? ` of ${item.edition_limit}` : ''}</p>
                ) : null}
              </div>
              <p className="shrink-0 font-medium">{money(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between border-t border-black pt-4 text-lg font-medium"><span>Total</span><span>{money(details.total)}</span></div>
      </section>

      {confirmed && (
        <section className="mb-9 bg-stone-50 p-5 sm:p-7" aria-labelledby="next-heading">
          <h2 id="next-heading" className="mb-3 font-serif text-xl">What happens next</h2>
          <p className="leading-7 text-gray-700">
            {details.requiresShipping
              ? 'Your artwork will be prepared for shipment. We will email your tracking number when it leaves the studio. A certificate of authenticity will be included.'
              : 'Your purchase is confirmed. Keep the confirmation email for your records.'}
          </p>
        </section>
      )}

      <div className="text-center">
        <Link href="/shop" className="inline-flex min-h-11 items-center bg-black px-8 text-white transition-colors hover:bg-gray-800">Continue shopping</Link>
      </div>
    </main>
  );
}
