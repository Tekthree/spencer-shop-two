"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';
import { Order } from '@/types/artwork';

/**
 * Admin Orders Page
 * Displays all orders and allows for order management
 */
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Get Supabase client from hook
  const { client: supabase, error: supabaseError } = useSupabaseClient();
  
  /**
   * Fetch orders from Supabase
   */
  const fetchOrders = useCallback(async () => {
    try {
      if (!supabase) return;
      
      setLoading(true);
      console.log('Fetching orders with status filter:', statusFilter);
      
      // Debug: Check if orders table exists
      const { data: tableInfo, error: tableError } = await supabase
        .from('orders')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking orders table:', tableError);
        throw new Error(`Table check failed: ${tableError.message}`);
      }
      
      console.log('Orders table exists, sample data:', tableInfo);
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log('Orders fetched:', data ? data.length : 0, 'orders');
      if (data && data.length > 0) {
        console.log('Sample order:', data[0]);
      } else {
        console.log('No orders found');
      }
      
      setOrders(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      console.error('Error fetching orders:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, supabase]);
  
  useEffect(() => {
    // Check for Supabase client errors
    if (supabaseError) {
      setError(supabaseError.message);
      setLoading(false);
      return;
    }
    
    // Check authentication status
    const checkAuth = async () => {
      if (supabase) {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        console.log('Auth status:', session ? 'Authenticated' : 'Not authenticated');
        if (authError) {
          console.error('Auth error:', authError.message);
          setError('Authentication error: ' + authError.message);
        }
        if (!session) {
          setError('Not authenticated. Please log in to view orders.');
          setLoading(false);
          return;
        }
        // Fetch orders when authenticated
        fetchOrders();
      }
    };
    
    checkAuth();
  }, [fetchOrders, supabase, supabaseError]);
  
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
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Error updating order status:', err);
      setError(errorMessage);
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
  
  if (loading && orders.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-serif mb-8">Orders</h1>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-serif mb-8">Orders</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono overflow-auto">
            <p className="font-medium">Debugging Information:</p>
            <p>1. Check if you&apos;re logged in as admin</p>
            <p>2. Check if RLS policies are correctly set up</p>
            <p>3. Check if orders exist in the database</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try again
          </button>
          <button 
            onClick={async () => {
              if (!supabase) return;
              const { data, error } = await supabase.auth.getSession();
              console.log('Current session:', data.session);
              if (error) console.error('Session error:', error);
              alert(data.session ? 'Authenticated as: ' + data.session.user.email : 'Not authenticated');
            }}
            className="mt-4 ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Check Auth Status
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif">Orders</h1>
        
        <div className="flex items-center space-x-4">
          {/* Create test order button */}
          <button
            onClick={async () => {
              try {
                if (!supabase) return;
                
                const testOrder = {
                  customer_info: {
                    name: "Test Customer",
                    email: "test@example.com",
                    address: {
                      line1: "123 Test St",
                      city: "Test City",
                      state: "TS",
                      postal_code: "12345",
                      country: "US"
                    }
                  },
                  items: [{
                    artwork_id: "00000000-0000-0000-0000-000000000000",
                    size: "8x10",
                    price: 9900,
                    edition_number: 1,
                    quantity: 1,
                    title: "Test Artwork"
                  }],
                  total: 9900,
                  status: 'paid',
                  payment_intent: `pi_test_${Date.now()}`
                };
                
                const { data, error } = await supabase
                  .from('orders')
                  .insert(testOrder)
                  .select();
                  
                if (error) throw error;
                
                alert(`Test order created successfully! ID: ${data[0].id}`);
                fetchOrders();
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create test order';
                alert(`Error creating test order: ${errorMessage}`);
                console.error('Error creating test order:', err);
              }
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Create Test Order
          </button>
          
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.customer_info?.name || 'N/A'}
                    {order.customer_info?.email && (
                      <p className="text-gray-500 text-xs">{order.customer_info.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.items?.length || 0} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatPrice(order.total || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
