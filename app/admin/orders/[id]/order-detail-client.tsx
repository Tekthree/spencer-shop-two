"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { OrderItem, Order, Artwork } from '@/types/artwork';

/**
 * Admin Order Detail Client Component
 * Displays detailed information about a specific order
 */
export default function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [artworks, setArtworks] = useState<Record<string, Artwork>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  /**
   * Fetch artwork details for order items
   */
  const fetchArtworkDetails = useCallback(async (items: OrderItem[]) => {
    try {
      const artworkIds = items.map(item => item.artwork_id);
      
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, images')
        .in('id', artworkIds);
      
      if (error) {
        throw error;
      }
      
      // Create a map of artwork details by ID
      const artworkMap: Record<string, Artwork> = {};
      data?.forEach(artwork => {
        artworkMap[artwork.id] = artwork as Artwork;
      });
      
      setArtworks(artworkMap);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching artwork details';
      console.error('Error fetching artwork details:', errorMessage);
    }
  }, [supabase]);

  /**
   * Fetch order details from Supabase
   */
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Order not found');
      }
      
      setOrder(data as Order);
      
      // Fetch artwork details for each item in the order
      if (data.items && data.items.length > 0) {
        await fetchArtworkDetails(data.items as OrderItem[]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order details';
      console.error('Error fetching order:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, supabase, fetchArtworkDetails]);
  
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  /**
   * Update order status
   */
  const updateOrderStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      if (order) {
        setOrder({ ...order, status: newStatus });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Error updating order status:', err);
      alert(errorMessage);
    }
  };
  
  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-serif mb-8">Order Details</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => fetchOrder()}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-serif mb-8">Order Details</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>Order not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Order Details</h1>
        <Link 
          href="/admin/orders" 
          className="text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-lg font-medium mb-1">Order #{order.id.substring(0, 8)}</h2>
            <p className="text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Order Items</h2>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {order.items?.map((item, index) => {
                const artwork = artworks[item.artwork_id];
                
                // Handle different possible formats of the images property
                let artworkImage = '/placeholder-artwork.jpg';
                if (artwork?.images) {
                  if (Array.isArray(artwork.images)) {
                    const firstImage = artwork.images[0];
                    if (typeof firstImage === 'string') {
                      artworkImage = firstImage;
                    } else if (firstImage && typeof firstImage === 'object' && 'url' in firstImage) {
                      artworkImage = firstImage.url;
                    }
                  } else if (typeof artwork.images === 'string') {
                    artworkImage = artwork.images;
                  } else if (typeof artwork.images === 'object' && 'main' in artwork.images && artwork.images.main) {
                    artworkImage = artwork.images.main;
                  }
                }
                
                return (
                  <li key={`${item.artwork_id}-${index}`} className="px-6 py-4 flex items-start">
                    {/* Artwork Image */}
                    <div className="w-16 h-16 relative flex-shrink-0 border border-gray-100">
                      <Image
                        src={artworkImage}
                        alt={artwork?.title || 'Artwork'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-medium">
                          <Link href={`/admin/artworks/${item.artwork_id}`} className="hover:underline">
                            {artwork?.title || 'Unknown Artwork'}
                          </Link>
                        </h3>
                        <p className="font-medium">{formatPrice(item.price)}</p>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-500">
                        <p>Size: {item.size}</p>
                        <p>Edition: {item.edition_number}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
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
    </div>
  );
}
