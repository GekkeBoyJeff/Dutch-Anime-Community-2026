import { withSupabase } from 'npm:@supabase/server';

// One-click "Publiceren naar live": the builder calls this with the author's JWT; it verifies the
// caller (auth: 'user'), confirms they hold the site.publish permission (via the my_permissions RPC,
// evaluated under their own RLS context), then fires a GitHub repository_dispatch that starts the
// deploy-directadmin workflow. The GitHub PAT stays a function secret and never reaches the browser.
const GITHUB_REPO = Deno.env.get('GITHUB_REPO');
const GITHUB_DISPATCH_TOKEN = Deno.env.get('GITHUB_DISPATCH_TOKEN');

const handler = {
	fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
		if (!GITHUB_REPO || !GITHUB_DISPATCH_TOKEN) {
			return Response.json({ error: 'Deploy function is not configured' }, { status: 500 });
		}

		const { data: permissions, error } = await ctx.supabase.rpc('my_permissions');
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}
		if (!Array.isArray(permissions) || !permissions.includes('site.publish')) {
			return Response.json({ error: 'Je hebt geen rechten om te publiceren.' }, { status: 403 });
		}

		const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${GITHUB_DISPATCH_TOKEN}`,
				Accept: 'application/vnd.github+json',
				'Content-Type': 'application/json',
				'User-Agent': 'dac-deploy-function',
			},
			body: JSON.stringify({ event_type: 'publish' }),
		});

		return Response.json({ triggered: res.ok }, { status: res.ok ? 200 : 502 });
	}),
};

export default handler;
