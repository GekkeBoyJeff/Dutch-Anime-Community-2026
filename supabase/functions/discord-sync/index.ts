import { withSupabase } from 'npm:@supabase/server';
import { createClient } from 'npm:@supabase/supabase-js';

// Discord guild-verrijking bij login. De client stuurt (alléén) het kortlevende provider_token; deze
// functie haalt zélf /users/@me + de guild-member op bij Discord (client-data wordt nooit vertrouwd) en
// schrijft guild_nick/roles/joined_at + global_name via de SERVICE ROLE naar het eigen profiel — die
// kolommen zijn bewust niet client-schrijfbaar (zie migratie 090003). Best-effort: faalt 'ie, dan is de
// login toch al gelukt. auth:'user' → we lezen de identiteit van de beller (eigen user-id).
const GUILD_ID = Deno.env.get('DISCORD_GUILD_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const handler = {
	fetch: withSupabase({ auth: 'user' }, async (req: Request, ctx: { supabase: any }) => {
		if (!GUILD_ID || !SUPABASE_URL || !SERVICE_KEY) {
			return Response.json({ error: 'discord-sync niet geconfigureerd' }, { status: 500 });
		}

		let body: { provider_token?: string };
		try {
			body = await req.json();
		} catch {
			return Response.json({ error: 'ongeldige body' }, { status: 400 });
		}
		const token = body.provider_token;
		if (!token) {
			return Response.json({ error: 'geen provider_token' }, { status: 400 });
		}

		const { data: userData } = await ctx.supabase.auth.getUser();
		const userId = userData?.user?.id;
		if (!userId) {
			return Response.json({ error: 'niet ingelogd' }, { status: 401 });
		}

		const meRes = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token}` } });
		const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const me = meRes.ok ? await meRes.json() : null;

		const patch: Record<string, unknown> = { synced_at: new Date().toISOString() };
		if (me?.global_name) patch.global_name = me.global_name;
		if (memberRes.ok) {
			const member = await memberRes.json();
			patch.guild_nick = member.nick ?? null;
			patch.guild_roles = member.roles ?? null;
			patch.guild_joined_at = member.joined_at ?? null;
		} else if (memberRes.status === 404) {
			// Geen lid (meer) van de guild → wis verouderde guild-data; transiënte fouten (401/429/5xx)
			// laten we ongemoeid zodat een tijdelijke Discord-storing goede data niet wist.
			patch.guild_nick = null;
			patch.guild_roles = null;
			patch.guild_joined_at = null;
		}

		const admin = createClient(SUPABASE_URL, SERVICE_KEY);
		const { error } = await admin.from('profiles').update(patch).eq('id', userId);
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ synced: true, inGuild: memberRes.ok });
	}),
};

export default handler;
