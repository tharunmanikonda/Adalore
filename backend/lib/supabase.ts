import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client
// Uses environment variables (works in Vercel serverless functions)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Create a dummy client that will throw clear errors
  console.error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
  supabase = new Proxy({} as SupabaseClient, {
    get() {
      throw new Error('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
  });
}

export { supabase };
