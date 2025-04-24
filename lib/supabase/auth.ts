/**
 * Supabase authentication utilities for Spencer Grey Artist Website
 * Handles admin login/logout functionality
 */
import { supabase } from './client';

/**
 * Sign in with email and password
 * @param email - Admin email address
 * @param password - Admin password
 * @returns Authentication response from Supabase
 */
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out the current user
 * @returns Void promise
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Get the current session
 * @returns Current session or null if not authenticated
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
  return data.session;
}
