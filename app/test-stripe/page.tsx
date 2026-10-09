'use client';

import { useEffect, useState } from 'react';

type VerificationState = 'idle' | 'loading' | 'paid' | 'cancelled' | 'error';

type SessionSummary = {
  total: number;
  itemCount: number;
};

/**
 * Sandbox-only Stripe checkout verification.
 * The API refuses live Stripe keys and its webhook marker bypasses order work.
 */
export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationState>('idle');
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('result');
    const sessionId = params.get('session_id');

    if (result === 'cancel') {
      setVerification('cancelled');
      return;
    }

    if (result !== 'success') return;
    if (!sessionId) {
      setVerification('error');
      setError('Stripe returned without a session. Start a new sandbox checkout.');
      return;
    }

    const verifyPayment = async () => {
      setVerification('loading');

      try {
        const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'The Stripe session could not be verified.');
        }

        if (data.status !== 'paid' || data.livemode !== false) {
          throw new Error('The sandbox payment did not return a verified paid test session.');
        }

        setSummary({
          total: data.total || 0,
          itemCount: Array.isArray(data.items) ? data.items.length : 0
        });
        setVerification('paid');
      } catch (paymentError) {
        setVerification('error');
        setError(paymentError instanceof Error ? paymentError.message : 'The test payment could not be verified.');
      }
    };

    void verifyPayment();
  }, []);

  const startSandboxCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              id: 'test-artwork-id',
              title: 'Test Artwork',
              price: 9900,
              quantity: 1,
              size: 'medium',
              sizeDisplay: '12×16 inches',
              imageUrl: `${window.location.origin}/images/favicon.png`
            }
          ],
          customerInfo: {
            name: 'Checkout Test',
            email: 'checkout-test@example.com',
            address: {
              line1: '123 Test St',
              city: 'Seattle',
              state: 'WA',
              postal_code: '98101',
              country: 'US'
            }
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'The sandbox checkout could not be created.');
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'The sandbox checkout could not be created.');
      setLoading(false);
    }
  };

  const amount = summary
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(summary.total / 100)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="border border-[#020312]/15 bg-[#F6F4F0] p-6 sm:p-10">
        <h1 className="font-serif text-3xl tracking-tight text-[#020312] sm:text-4xl">Stripe checkout test</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#020312]/70">
          Run a $99 sandbox payment through Stripe. This page is disabled for live Stripe keys, and completed tests do
          not create orders, change edition inventory, or send email.
        </p>

        {verification === 'loading' && (
          <div className="mt-8 border-t border-[#020312]/15 pt-6" role="status" aria-live="polite">
            <p className="font-medium text-[#020312]">Verifying the Stripe payment…</p>
          </div>
        )}

        {verification === 'paid' && summary && (
          <div className="mt-8 border-t border-[#020312]/15 pt-6" role="status" aria-live="polite">
            <h2 className="font-serif text-2xl text-[#020312]">Sandbox payment verified</h2>
            <p className="mt-2 leading-7 text-[#020312]/70">
              Stripe reported a paid {amount} test session with {summary.itemCount} item. No production order was
              created.
            </p>
          </div>
        )}

        {verification === 'cancelled' && (
          <div className="mt-8 border-t border-[#020312]/15 pt-6" role="status">
            <h2 className="font-serif text-2xl text-[#020312]">Sandbox checkout cancelled</h2>
            <p className="mt-2 leading-7 text-[#020312]/70">No payment was made. You can start again below.</p>
          </div>
        )}

        {(verification === 'error' || error) && error && (
          <div className="mt-8 border border-red-900/25 bg-red-50 p-4 text-red-900" role="alert">
            <p className="font-medium">Checkout test failed</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={startSandboxCheckout}
          disabled={loading || verification === 'loading'}
          className="mt-8 min-h-11 bg-[#020312] px-6 py-3 font-medium text-white transition-colors hover:bg-[#020312]/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#020312] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading
            ? 'Opening Stripe sandbox…'
            : verification === 'paid'
              ? 'Run another sandbox test'
              : 'Start sandbox checkout'}
        </button>
      </div>
    </div>
  );
}
