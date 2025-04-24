/**
 * Supabase client configuration for Spencer Grey Artist Website
 * Provides typed access to Supabase services
 */
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
