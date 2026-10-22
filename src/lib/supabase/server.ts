import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';
import { formatSupabaseUrl } from './client';

function getSafeSupabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return 'https://placeholder.supabase.co';
  const formatted = formatSupabaseUrl(rawUrl);
  try {
    const parsed = new URL(formatted);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return formatted;
    }
  } catch {
    // Handle placeholder or invalid URL strings
  }
  return 'https://placeholder.supabase.co';
}

function getSafeSupabaseKey(isService = false): string {
  const rawKey = isService
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!rawKey || rawKey.includes('your_supabase_anon_key')) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
  }
  return rawKey;
}

/**
 * Creates a Supabase client for server-side usage in Server Components,
 * Server Actions, and Route Handlers (API routes).
 * 
 * Uses createServerClient from @supabase/ssr and reads cookies asynchronously.
 */
export async function createClient<T = any>() {
  const cookieStore = await cookies();
  const supabaseUrl = getSafeSupabaseUrl();
  const supabaseAnonKey = getSafeSupabaseKey();

  return createServerClient<T>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored if middleware is refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates an administrative / service client for background tasks and API routes
 * where session cookies are not required.
 */
export function createAdminClient<T = any>() {
  const supabaseUrl = getSafeSupabaseUrl();
  const serviceKey = getSafeSupabaseKey(true);

  return createServerClient<T>(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

export type { Database };
