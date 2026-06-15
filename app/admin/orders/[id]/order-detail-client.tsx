"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { OrderItem, Order, Artwork, ArtworkImage } from '@/types/artwork';

/**
 * Admin Order Detail Client Component
 * Displays detailed information about a specific order
 */
export default function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [artworks, setArtworks] = useState<Record<string, Artwork>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  /**
   * Helper function to get the artwork image URL regardless of format
   */
  const getArtworkImage = (artwork?: Artwork): string | null => {
    if (!artwork) return null;
    if (!artwork.images) return null;

    // Handle object format with main/hover keys
    if (typeof artwork.images === 'object' && !Array.isArray(artwork.images)) {
      if ('main' in artwork.images && artwork.images.main) {
        return artwork.images.main;
      }
      const imageKeys = Object.keys(artwork.images);
      for (const key of imageKeys) {
        const value = artwork.images[key];
        if (typeof value === 'string' && value) {
          return value;
        }
      }
    }

    if (typeof artwork.images === 'string') {
      return artwork.images;
    }

    if (Array.isArray(artwork.images)) {
      if (artwork.images.length === 0) return null;

      if (typeof artwork.images[0] === 'object') {
        const firstItem = artwork.images[0];

        if (typeof firstItem === 'object' && firstItem !== null) {
          if ('type' in firstItem && 'url' in firstItem) {
            const mainImage = artwork.images.find(img =>
              typeof img === 'object' && 'type' in img && img.type === 'main'
            ) as ArtworkImage | undefined;

            if (mainImage && 'url' in mainImage) {
              return mainImage.url;
            }

            if ('url' in firstItem) {
              return firstItem.url;
            }
          }

          if (firstItem !== null) {
            const keys = Object.keys(firstItem);
            for (const key of keys) {
              const value = (firstItem as Record<string, unknown>)[key];
              if (typeof value === 'string' && value.includes('http')) {
                return value;
              }
            }
          }
        }
      }

      if (typeof artwork.images[0] === 'string') {
        return artwork.images[0];
      }
    }

    return null;
  };

  /**
   * Fetch artwork details for order items
   */
  const fetchArtworkDetails = useCallback(async (items: OrderItem[]) => {
    if (!items.length) return;
    try {
      const artworkMap: Record<string, Artwork> = {};
      await Promise.all(
        items.map(async (item) => {
          const response = await fetch(`/api/admin/artworks/${item.artwork_id}`);
          if (response.ok) {
            const artwork = await response.json() as Artwork;
            artworkMap[artwork.id] = artwork;
          }
        })
      );
      setArtworks(artworkMap);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching artwork details';
      console.error('Error fetching artwork details:', errorMessage);
    }
  }, []);

  /**
   * Fetch order details from API
   */
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json() as Order;

      setOrder(data);
      setNewStatus(data.status || 'paid');

      if (data.items && data.items.length > 0) {
        await fetchArtworkDetails(data.items);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      console.error('Error fetching order:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, fetchArtworkDetails]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /**
   * Format price from cents to dollars
   */
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  /**
   * Format date to readable format
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  /**
   * Update order status
   */
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      setOrder(prevOrder => {
        if (prevOrder && prevOrder.id === orderId) {
          return { ...prevOrder, status };
        }
        return prevOrder;
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Error updating order status:', err);
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Order Details</h1>
        <Link
          href="/admin/orders"
          className="text-sm text-gray-600 hover:text-black transition-colors"
        >
          &larr; Back to Orders
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : !order ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">Order Not Found</h2>
          <p className="text-gray-500">The order you are looking for does not exist or has been deleted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="md:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Order #{order.id.substring(0, 8)}...</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {order.items?.map((item, index) => {
                  const artwork = artworks[item.artwork_id];
                  return (
                    <div key={index} className="p-6 flex items-center">
                      {/* Artwork Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden mr-4">
                        {(() => {
                          const imageUrl = getArtworkImage(artwork);
                          return imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={artwork?.title || 'Artwork image'}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-xs text-gray-500">No image</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <h3 className="font-medium">
                          {artwork ? (
                            <Link
                              href={`/admin/artworks/${item.artwork_id}`}
                              className="hover:underline"
                            >
                              {artwork.title}
                            </Link>
                          ) : (
                            `Artwork (ID: ${item.artwork_id.substring(0, 8)}...)`
                          )}
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <p>Edition: {item.edition_number} of {item.edition_number + 10}</p>
                          <p>Size: {item.size || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 ml-4 text-right">
                        <p className="font-medium">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Shipping</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-base mt-4 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Update Status</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => updateOrderStatus(order.id, newStatus)}
                    className="ml-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Customer</h2>
              </div>

              <div className="px-6 py-4">
                <h3 className="font-medium">{order.customer_info?.name || 'N/A'}</h3>
                <p className="text-gray-500">{order.customer_info?.email || 'No email provided'}</p>

                {order.customer_info?.address && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h4>
                    <address className="not-italic text-sm">
                      {order.customer_info.address.line1}<br />
                      {order.customer_info.address.line2 && (
                        <>
                          {order.customer_info.address.line2}<br />
                        </>
                      )}
                      {order.customer_info.address.city}, {order.customer_info.address.state} {order.customer_info.address.postal_code}<br />
                      {order.customer_info.address.country}
                    </address>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Order Information</h4>
                <dl className="text-sm">
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">Date</dt>
                    <dd>{formatDate(order.created_at)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">Payment</dt>
                    <dd>{order.payment_intent ? 'Completed' : 'Pending'}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">Status</dt>
                    <dd>{order.status}</dd>
                  </div>
                </dl>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50">
                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-black transition-colors"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
