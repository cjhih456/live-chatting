import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readSupabaseEnv() {
  const url =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.EXPO_PUBLIC_SUPABASE_URL)) ||
    undefined;
  const anonKey =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)) ||
    undefined;
  return { url, anonKey };
}

let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = readSupabaseEnv();
  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }
  if (cachedClient === undefined) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

export function useSupabaseDataSource(): boolean {
  const source =
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_DATA_SOURCE ??
        process.env.EXPO_PUBLIC_DATA_SOURCE)) ||
    'mock';
  return source === 'supabase' && isSupabaseConfigured();
}
