/**
 * Server-side Supabase client
 * Used for server components and API routes
 */

import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client with the server-side credentials
 * @returns Supabase client instance
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return supabaseCreateClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
}
