import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

// Service-role Supabase client for build-time reads and the seed script. Requires Node 22+ (see
// .nvmrc / package.json "engines"): @supabase/supabase-js constructs a realtime client that needs a
// global WebSocket, which Node has natively from 22 on. The service-role key bypasses RLS, so this
// module MUST NEVER be imported from client code — the `server-only` import above turns any such import
// into a build error, keeping the key out of the browser bundle.
export const getAdminClient = (): SupabaseClient => {
	const url = env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceKey) {
		throw new Error('Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
	}
	return createClient(url, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
};
