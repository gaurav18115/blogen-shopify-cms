import { createClient } from '@supabase/supabase-js'

// Use server-side env vars first, fallback to client-side for build time
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Please set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase Anon Key. Please set SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)