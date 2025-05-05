/**
 * Custom hook for using Supabase client in client components
 * Provides a cached instance of the Supabase client to prevent recreation on each render
 */
import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a singleton instance outside of the hook
let supabaseInstance: SupabaseClient | null = null;

export function useSupabaseClient() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // If we already have an instance, use it
      if (supabaseInstance) {
        setClient(supabaseInstance);
        return;
      }

      // Get environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Validate environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
      }

      // Create a new instance
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      setClient(supabaseInstance);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
    }
  }, []);

  return { client, error };
}
