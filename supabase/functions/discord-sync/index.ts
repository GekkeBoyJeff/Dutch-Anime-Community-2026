import { withSupabase } from 'npm:@supabase/server';

// Discord guild-verrijking bij login. De client stuurt (alléén) het kortlevende provider_token; deze
// functie haalt zélf /users/@me + de guild-member op bij Discord (client-data wordt nooit vertrouwd) en
// schrijft guild_nick/roles/joined_at + global_name naar het eigen profiel. Best-effort: faalt 'ie, dan
// is de login toch al gelukt. auth:'user' → ctx.supabase draait onder de RLS van de beller (eigen rij).
const GUILD_ID = Deno.env.get('DISCORD_GUILD_ID');

const handler = {
	fetch: withSupabase({ auth: 'user' }, async (req: Request, ctx: { supabase: any }) => {
		if (!GUILD_ID) {
			return Response.json({ error: 'DISCORD_GUILD_ID niet geconfigureerd' }, { status: 500 });
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
		const member = memberRes.ok ? await memberRes.json() : null;

		const patch: Record<string, unknown> = { synced_at: new Date().toISOString() };
		if (me?.global_name) patch.global_name = me.global_name;
		if (member) {
			patch.guild_nick = member.nick ?? null;
			patch.guild_roles = member.roles ?? null;
			patch.guild_joined_at = member.joined_at ?? null;
		}

		const { error } = await ctx.supabase.from('profiles').update(patch).eq('id', userId);
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}

		return Response.json({ synced: true, inGuild: Boolean(member) });
	}),
};

export default handler;
