import { withSupabase } from 'npm:@supabase/server';
import webpush from 'npm:web-push';

// send-push: delivers notifications to members via two auth paths (auth:['user','secret'], first-match):
// 'user' writes an in-app row + history row + web-push per recipient; 'secret' (cron) is push-only since
// the SQL function already wrote history/rows. VAPID private key lives only here, as a function secret.

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:info@dutchanimecommunity.nl';
const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (pushEnabled) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface Body {
	user_ids?: unknown;
	audience?: unknown;
	kind?: unknown;
	type?: unknown;
	title?: unknown;
	body?: unknown;
	url?: unknown;
}

// Delivers web-push to userIds' subscribed devices; prunes expired subscriptions (404/410).
const deliverPush = async (
	admin: { from: (t: string) => any },
	userIds: string[],
	title: string,
	text: string | null,
	url?: string,
): Promise<number> => {
	if (!pushEnabled || userIds.length === 0) return 0;
	const { data: subs } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').in('user_id', userIds);
	const payload = JSON.stringify({ title, body: text ?? '', url });
	let pushed = 0;
	for (const sub of subs ?? []) {
		try {
			await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
			pushed += 1;
		} catch (e) {
			const status = (e as { statusCode?: number }).statusCode;
			if (status === 404 || status === 410) await admin.from('push_subscriptions').delete().eq('id', sub.id);
		}
	}
	return pushed;
}

const handler = {
	fetch: withSupabase({ auth: ['user', 'secret'] }, async (req: Request, ctx) => {
		const admin = ctx.supabaseAdmin;
		const body = (await req.json().catch(() => ({}))) as Body;
		const title = typeof body.title === 'string' ? body.title.trim() : '';
		const text = typeof body.body === 'string' && body.body.trim() ? body.body.trim() : null;
		const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : undefined;

		// System/cron path: only deliver web-push to the given user_ids.
		if (ctx.authMode === 'secret') {
			const userIds = Array.isArray(body.user_ids) ? (body.user_ids.filter((v) => typeof v === 'string') as string[]) : [];
			if (userIds.length === 0 || !title) return Response.json({ error: 'user_ids en title zijn verplicht' }, { status: 400 });
			const pushed = await deliverPush(admin, userIds, title, text, url);
			return Response.json({ pushed, pushEnabled });
		}

		// User path: permission check via the caller's RLS client (my_permissions = effective permissions).
		const { data: perms } = await ctx.supabase.rpc('my_permissions');
		if (!(Array.isArray(perms) && perms.includes('notifications.send'))) {
			return Response.json({ error: 'notifications.send vereist' }, { status: 403 });
		}

		const kind = typeof body.kind === 'string' && body.kind ? body.kind : 'message';
		const type = typeof body.type === 'string' && body.type ? body.type : 'handmatige-melding';

		// A disabled notification type may not be sent (the toggle also applies to manual sends).
		const { data: typeRow } = await admin.from('notification_types').select('enabled').eq('key', type).maybeSingle();
		if (typeRow && typeRow.enabled === false) {
			return Response.json({ error: 'dit meldingstype staat uit' }, { status: 400 });
		}

		// audience:'all' → the function resolves recipients itself (service-role), independent of RLS/pagination.
		let userIds: string[];
		let audience: Record<string, unknown>;
		if (body.audience === 'all') {
			const { data: members, error: memErr } = await admin.from('profiles').select('id');
			if (memErr) return Response.json({ error: memErr.message }, { status: 500 });
			userIds = (members ?? []).map((m) => m.id as string);
			audience = { kind: 'manual', audience: 'all', user_count: userIds.length };
		} else {
			userIds = Array.isArray(body.user_ids) ? (body.user_ids.filter((v) => typeof v === 'string') as string[]) : [];
			audience = { kind: 'manual', user_count: userIds.length };
		}
		if (userIds.length === 0 || !title) {
			return Response.json({ error: 'ontvangers en title zijn verplicht' }, { status: 400 });
		}

		// In-app notifications (realtime) — one row per recipient.
		const rows = userIds.map((id) => ({ user_id: id, kind, title, body: text, payload: url ? { url } : null }));
		const { error: insErr } = await admin.from('notifications').insert(rows);
		if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

		// History — sender = the caller (announcer).
		const { data: userData } = await ctx.supabase.auth.getUser();
		await admin.from('notification_history').insert({
			type_key: type,
			title,
			body: text,
			sender_user_id: userData.user?.id ?? null,
			audience,
		});

		const pushed = await deliverPush(admin, userIds, title, text, url);
		return Response.json({ inserted: rows.length, pushed, pushEnabled });
	}),
};

export default handler;
