"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

/**
 * Admin dashboard page
 * Provides overview of content and quick access to main sections
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    artworks: 0,
    collections: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch artwork count
        const { count: artworksCount, error: artworksError } = await supabase
          .from('artworks')
          .select('*', { count: 'exact', head: true });

        // Fetch collections count
        const { count: collectionsCount, error: collectionsError } = await supabase
          .from('collections')
          .select('*', { count: 'exact', head: true });

        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (artworksError || collectionsError || ordersError) {
          console.error('Error fetching stats:', { artworksError, collectionsError, ordersError });
          return;
        }

        setStats({
          artworks: artworksCount || 0,
          collections: collectionsCount || 0,
          orders: ordersCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickLinks = [
    { title: 'Add New Artwork', href: '/admin/artworks/new', description: 'Create a new art print with images and details' },
    { title: 'Create Collection', href: '/admin/collections/new', description: 'Group artworks into a new collection' },
    { title: 'Upload Images', href: '/admin/images', description: 'Add new images to your library' },
    { title: 'Edit About Page', href: '/admin/about', description: 'Update your artist biography and statement' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin panel. Manage your artwork, collections, and content.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Art Prints</h3>
          <p className="text-3xl font-serif">
            {loading ? (
              <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              stats.artworks
            )}
          </p>
          <Link href="/admin/artworks" className="text-sm text-black underline underline-offset-4 mt-4 inline-block">
            View all
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Collections</h3>
          <p className="text-3xl font-serif">
            {loading ? (
              <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              stats.collections
            )}
          </p>
          <Link href="/admin/collections" className="text-sm text-black underline underline-offset-4 mt-4 inline-block">
            View all
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Orders</h3>
          <p className="text-3xl font-serif">
            {loading ? (
              <span className="inline-block h-6 w-12 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              stats.orders
            )}
          </p>
          <Link href="/admin/orders" className="text-sm text-black underline underline-offset-4 mt-4 inline-block">
            View all
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <section className="mb-12">
        <h2 className="text-xl font-serif mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <Link 
              key={index} 
              href={link.href}
              className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium mb-2">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity (placeholder) */}
      <section>
        <h2 className="text-xl font-serif mb-6">Recent Activity</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">No recent activity to display.</p>
        </div>
      </section>
    </div>
  );
}
