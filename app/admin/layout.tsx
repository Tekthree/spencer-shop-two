"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession } from '@/lib/supabase/auth';
import AdminSidebar from '@/components/admin/admin-sidebar';

/**
 * Admin layout component that wraps all admin pages
 * Provides authentication check and sidebar navigation
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        
        // If no session and not on login page, redirect to login
        if (!session && !pathname?.includes('/admin/login')) {
          router.push('/admin/login');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Don't apply admin layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
