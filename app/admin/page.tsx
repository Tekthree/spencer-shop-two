"use client";

import { useState, useEffect } from 'react';
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
    operationalEvents: [] as Array<{ id: number; severity: string; source: string; message: string; created_at: string }>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats({
          artworks: data.artworks ?? 0,
          collections: data.collections ?? 0,
          orders: data.orders ?? 0,
          operationalEvents: data.operationalEvents ?? [],
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Dashboard data could not be loaded. Refresh the page to try again.');
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

      {error && <div role="alert" className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

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

      {/* Operational monitoring */}
      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-xl font-serif">Store Health</h2>
          {!loading && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${stats.operationalEvents.length ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {stats.operationalEvents.length ? `${stats.operationalEvents.length} recent alert${stats.operationalEvents.length === 1 ? '' : 's'}` : 'All systems clear'}
            </span>
          )}
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Checking store health…</p>
          ) : stats.operationalEvents.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No checkout or webhook failures recorded in the last 30 days.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stats.operationalEvents.map(event => (
                <li key={event.id} className="p-5">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{event.source}</p>
                    <time className="text-xs text-gray-500" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time>
                  </div>
                  <p className="text-sm text-gray-600">{event.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
