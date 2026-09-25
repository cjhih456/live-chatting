import { getSupabaseClient } from './client';
import type { OAuthProvider } from '@lumen/structure';

export type { OAuthProvider };

export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string,
) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured');
  }

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }

  return data;
}
