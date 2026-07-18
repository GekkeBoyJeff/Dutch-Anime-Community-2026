'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import type { Database } from '@/types/database.types';

// The browser Supabase client, used by /login, /builder, /upload and the image picker. The anon key
// is public by design (Next inlines every NEXT_PUBLIC_ var into the browser bundle) — Row Level
// Security is the real boundary, so this client can only do what the signed-in author's JWT allows.
// See lib/supabase/admin.ts for the build-time service-role client that bypasses RLS.

let cached: SupabaseClient<Database> | undefined;

export const getBrowserClient = (): SupabaseClient<Database> => {
	if (!cached) {
		const url = env.NEXT_PUBLIC_SUPABASE_URL;
		const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		if (!url || !anonKey) {
			throw new Error('Supabase browser client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
		}
		// One client per tab; it persists the session in localStorage and refreshes the JWT on its own.
		// Explicit PKCE: the OAuth flow returns a ?code we exchange client-side (see /auth/callback).
		cached = createClient<Database>(url, anonKey, {
			auth: { persistSession: true, autoRefreshToken: true, flowType: 'pkce', detectSessionInUrl: true },
		});
	}
	return cached;
};
