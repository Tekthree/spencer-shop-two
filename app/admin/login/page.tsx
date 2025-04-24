"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import Link from 'next/link';

/**
 * Admin login page
 * Provides authentication for the admin panel
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Handle login form submission
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard on successful login
      router.push('/admin');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-serif text-2xl">Spencer Grey</h1>
          </Link>
          <h2 className="text-2xl font-serif mb-2">Admin Login</h2>
          <p className="text-gray-600 text-sm">Enter your credentials to access the admin panel</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-8 mb-4 border border-gray-100">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-black transition-colors">
            Return to website
          </Link>
        </div>
      </div>
    </div>
  );
}
