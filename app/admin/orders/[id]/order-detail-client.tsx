'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/types/artwork';
import { formatOrderNumber } from '@/lib/orders/order-number';

const money = (cents: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD'
}).format(cents / 100);

const statusLabels: Record<string, string> = {
  paid: 'Paid', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered',
  completed: 'Completed', cancelled: 'Cancelled'
};

function nextStatuses(order: Order) {
  if (order.status === 'paid') return ['processing', 'cancelled'];
  if (order.status === 'processing') return [order.requires_shipping ? 'shipped' : 'completed', 'cancelled'];
  if (order.status === 'shipped') return ['delivered'];
  return [];
}

export default function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Order not found');
      setOrder(data);
      setCarrier(data.carrier || '');
      setTrackingNumber(data.tracking_number || '');
      setNewStatus(nextStatuses(data)[0] || '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  async function updateOrder(event: FormEvent) {
    event.preventDefault();
    if (!order || !newStatus) return;
    if (newStatus === 'cancelled' && !window.confirm('Refund this payment, cancel the order, and return its editions to inventory?')) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, carrier, trackingNumber })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Order update failed');
      setOrder(data);
      setNewStatus(nextStatuses(data)[0] || '');
      setNotice(data.notificationWarning || (newStatus === 'cancelled'
        ? 'Order cancelled, payment refunded, and inventory restored.'
        : newStatus === 'shipped'
          ? 'Order marked shipped and tracking email sent.'
          : `Order marked ${statusLabels[newStatus].toLowerCase()}.`));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Order update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-12 text-center" aria-live="polite">Loading order…</div>;
  if (!order) return <div className="p-12 text-center text-red-800">{error || 'Order not found'}</div>;

  const address = order.customer_info?.address;
  const choices = nextStatuses(order);
  const orderLabel = formatOrderNumber(order.order_number, order.created_at) || order.id.slice(0, 8);

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><p className="mb-1 text-sm text-gray-500">Order</p><h1 className="font-serif text-3xl">{orderLabel}</h1></div>
        <Link href="/admin/orders" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">← Back to orders</Link>
      </div>

      {error && <div role="alert" className="mb-6 border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
      {notice && <div role="status" className="mb-6 border border-green-200 bg-green-50 p-4 text-green-900">{notice}</div>}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-6">
          <section className="border border-gray-200 bg-white" aria-labelledby="items-heading">
            <div className="border-b border-gray-200 px-5 py-4"><h2 id="items-heading" className="font-serif text-xl">Purchased artwork</h2></div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => {
                const artwork = order.artworks?.[item.artwork_id];
                const imageUrl = item.image_url || (Array.isArray(artwork?.images)
                  ? typeof artwork.images[0] === 'string' ? artwork.images[0] : artwork.images[0]?.url
                  : typeof artwork?.images === 'string' ? artwork.images : artwork?.images?.main);
                const editions = item.edition_numbers?.length ? item.edition_numbers : item.edition_number ? [item.edition_number] : [];
                return (
                  <div key={`${item.artwork_id}-${item.size}-${index}`} className="flex gap-4 p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-stone-100">
                      {imageUrl ? <Image src={imageUrl} alt="" fill className="object-cover" unoptimized /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-medium">{item.title || artwork?.title || 'Artwork'}</h3>
                      <p className="mt-1 text-sm text-gray-600">{item.size} · Quantity {item.quantity || 1}</p>
                      {editions.length > 0 && <p className="text-sm text-gray-600">Edition{editions.length > 1 ? 's' : ''} {editions.join(', ')}{item.edition_limit ? ` of ${item.edition_limit}` : ''}</p>}
                    </div>
                    <p className="shrink-0 font-medium">{money(item.price * (item.quantity || 1))}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between border-t border-black bg-stone-50 px-5 py-4 text-lg font-medium"><span>Total</span><span>{money(order.total)}</span></div>
          </section>

          {choices.length > 0 && (
            <section className="border border-gray-200 bg-white p-5" aria-labelledby="status-heading">
              <h2 id="status-heading" className="mb-4 font-serif text-xl">Update order</h2>
              <form onSubmit={updateOrder} className="space-y-4">
                <div><label htmlFor="order-status" className="mb-1 block text-sm font-medium">Next status</label><select id="order-status" value={newStatus} onChange={event => setNewStatus(event.target.value)} className="min-h-11 w-full border border-gray-300 px-3">
                  {choices.map(status => <option key={status} value={status}>{status === 'cancelled' ? 'Cancel and refund' : statusLabels[status]}</option>)}
                </select></div>
                {newStatus === 'shipped' && <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="carrier" className="mb-1 block text-sm font-medium">Carrier</label><input id="carrier" value={carrier} onChange={event => setCarrier(event.target.value)} required className="min-h-11 w-full border border-gray-300 px-3" placeholder="UPS, USPS, FedEx…" /></div>
                  <div><label htmlFor="tracking" className="mb-1 block text-sm font-medium">Tracking number</label><input id="tracking" value={trackingNumber} onChange={event => setTrackingNumber(event.target.value)} required className="min-h-11 w-full border border-gray-300 px-3" /></div>
                </div>}
                <button disabled={saving} className={`min-h-11 px-6 text-white disabled:opacity-60 ${newStatus === 'cancelled' ? 'bg-red-700' : 'bg-black'}`}>{saving ? 'Saving…' : newStatus === 'cancelled' ? 'Refund and cancel order' : 'Save update'}</button>
              </form>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="border border-gray-200 bg-white p-5"><h2 className="mb-4 font-serif text-xl">Customer</h2><p className="font-medium">{order.customer_info?.name || 'Name unavailable'}</p><p className="break-all text-gray-600">{order.customer_info?.email || 'Email unavailable'}</p>{order.customer_info?.phone && <p className="mt-1 text-gray-600">{order.customer_info.phone}</p>}
            <h3 className="mb-2 mt-6 text-sm font-medium text-gray-500">Shipping address</h3>
            {!order.requires_shipping ? <p className="text-sm text-gray-600">No shipping required for this order.</p> : address ? <address className="not-italic leading-6">{[address.line1, address.line2, [address.city, address.state, address.postal_code].filter(Boolean).join(', '), address.country].filter(Boolean).map(line => <div key={line}>{line}</div>)}</address> : <p className="text-sm text-gray-600">Address unavailable. Verify in Stripe before shipping.</p>}
          </section>
          <section className="border border-gray-200 bg-white p-5"><h2 className="mb-4 font-serif text-xl">Order information</h2><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-gray-500">Placed</dt><dd className="text-right">{new Date(order.created_at).toLocaleString()}</dd></div><div className="flex justify-between"><dt className="text-gray-500">Payment</dt><dd>{order.payment_intent ? 'Completed' : 'Unavailable'}</dd></div><div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="capitalize">{order.status}</dd></div>{order.carrier && <div className="flex justify-between gap-4"><dt className="text-gray-500">Tracking</dt><dd className="break-all text-right">{order.carrier} {order.tracking_number}</dd></div>}</dl></section>
          <button type="button" onClick={() => window.print()} className="min-h-11 w-full bg-gray-900 px-4 text-white">Print order</button>
        </aside>
      </div>
    </main>
  );
}
