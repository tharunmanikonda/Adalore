import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
// Uses environment variables (works in Vercel serverless functions)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);
