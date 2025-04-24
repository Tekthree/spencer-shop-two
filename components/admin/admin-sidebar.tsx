"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';

/**
 * Admin sidebar component for navigation
 * Provides links to different admin sections
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="font-serif text-xl">
          Spencer Grey
        </Link>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="p-4">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 px-2">Content</p>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/artworks" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin/artworks') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Art Prints
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/collections" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin/collections') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Collections
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/about" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin/about') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                About Page
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 px-2">Media</p>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/images" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin/images') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Image Library
              </Link>
            </li>
          </ul>
        </div>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-4 px-2">Settings</p>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/settings" 
                className={`block px-2 py-2 rounded-md ${isActive('/admin/settings') ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                General Settings
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-2 py-2 text-gray-600 hover:text-black transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
}
