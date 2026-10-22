import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

/**
 * Formats a raw Supabase URL or project reference ID into a full URL.
 */
export function formatSupabaseUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (!trimmed.includes('your_supabase_project_url') && /^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return trimmed;
}

/**
 * Checks whether valid, live Supabase credentials are configured.
 */
export const isSupabaseConfigured = (): boolean => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  const url = formatSupabaseUrl(rawUrl);

  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your_supabase_project_url') &&
    !url.includes('placeholder.supabase.co') &&
    !key.includes('your_supabase_anon_key') &&
    (url.startsWith('https://') || url.startsWith('http://'))
  );
};

export function getSafeSupabaseUrl(): string {
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

export function getSafeSupabaseAnonKey(): string {
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!rawKey || rawKey.includes('your_supabase_anon_key')) {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';
  }
  return rawKey;
}

/**
 * Creates a Supabase client for client-side usage in Next.js App Router components.
 * Uses createBrowserClient from @supabase/ssr with environment variables.
 */
export function createClient<T = any>() {
  const supabaseUrl = getSafeSupabaseUrl();
  const supabaseAnonKey = getSafeSupabaseAnonKey();

  if (!isSupabaseConfigured() && typeof window !== 'undefined') {
    console.warn(
      '[Supabase Client] Placeholders detected in environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local to connect to your live project.'
    );
  }

  return createBrowserClient<T>(supabaseUrl, supabaseAnonKey);
}

// Singleton client instance for backwards compatibility and easy direct import
export const supabase = createClient<any>();
export type { Database };
