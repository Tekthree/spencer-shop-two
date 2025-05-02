"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

interface Artwork {
  id: string;
  title: string;
  description: string;
  year: number;
  medium: string;
  featured: boolean;
  images: { url: string; alt: string }[];
  sizes: { size: string; price: number; edition_limit: number; editions_sold: number }[];
  created_at: string;
}

/**
 * Art Prints admin page
 * Lists all artworks with management options
 */
export default function ArtworksAdmin() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const { data, error } = await supabase
          .from('artworks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setArtworks(data || []);
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError('Failed to load artworks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Calculate total editions and sold editions for an artwork
  const calculateEditions = (sizes: { size: string; price: number; edition_limit: number; editions_sold: number }[]) => {
    return sizes.reduce(
      (acc, size) => {
        acc.total += size.edition_limit;
        acc.sold += size.editions_sold;
        return acc;
      },
      { total: 0, sold: 0 }
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif mb-2">Art Prints</h1>
          <p className="text-gray-600">Manage your artwork collection and editions</p>
        </div>
        <Link
          href="/admin/artworks/new"
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Add New Artwork
        </Link>
      </header>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="bg-gray-200 h-16 w-16 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : artworks.length === 0 ? (
        // Empty state
        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm text-center">
          <h3 className="text-lg font-medium mb-2">No artworks yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first artwork to the collection.
          </p>
          <Link
            href="/admin/artworks/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
          >
            Add New Artwork
          </Link>
        </div>
      ) : (
        // Artworks list
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artwork
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Editions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artworks.map((artwork) => {
                const editions = calculateEditions(artwork.sizes);
                return (
                  <tr key={artwork.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden relative">
                          {artwork.images && artwork.images.length > 0 ? (
                            <Image
                              src={artwork.images[0].url}
                              alt={artwork.images[0].alt || artwork.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{artwork.medium}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artwork.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editions.sold} / {editions.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {artwork.featured ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/artworks/${artwork.id}`} className="text-black hover:text-gray-600 mr-4">
                        Edit
                      </Link>
                      <Link href={`/artwork/${artwork.id}`} target="_blank" className="text-gray-600 hover:text-black">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
