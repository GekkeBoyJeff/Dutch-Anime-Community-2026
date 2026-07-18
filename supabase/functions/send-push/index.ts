import { withSupabase } from 'npm:@supabase/server';
import webpush from 'npm:web-push';

// send-push: verstuurt meldingen naar leden. Twee auth-paden (auth:['user','secret'], first-match):
//  • user  → een beller met notifications.send stuurt handmatig: schrijft een in-app rij per ontvanger
//            (realtime bel), een notification_history-rij, én web-push naar geabonneerde apparaten.
//  • secret → systeem/cron (run_shift_reminders via pg_net, apikey = service-key uit Vault). Push-only:
//            de SQL-functie schreef historie + in-app rijen al, dus hier alléén web-push afleveren. Géén
//            permissiecheck (de secret-key komt nooit in de browser), géén publiek ongeauth. pad.
// VAPID-privésleutel staat alléén hier als Edge-Function-secret.

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

// Levert web-push aan de geabonneerde apparaten van userIds; ruimt verlopen abonnementen (404/410) op.
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

		// Systeem/cron-pad: alléén web-push afleveren aan de meegegeven user_ids.
		if (ctx.authMode === 'secret') {
			const userIds = Array.isArray(body.user_ids) ? (body.user_ids.filter((v) => typeof v === 'string') as string[]) : [];
			if (userIds.length === 0 || !title) return Response.json({ error: 'user_ids en title zijn verplicht' }, { status: 400 });
			const pushed = await deliverPush(admin, userIds, title, text, url);
			return Response.json({ pushed, pushEnabled });
		}

		// Gebruiker-pad: rechtencheck via de RLS-client van de beller (my_permissions = effectieve permissies).
		const { data: perms } = await ctx.supabase.rpc('my_permissions');
		if (!(Array.isArray(perms) && perms.includes('notifications.send'))) {
			return Response.json({ error: 'notifications.send vereist' }, { status: 403 });
		}

		const kind = typeof body.kind === 'string' && body.kind ? body.kind : 'message';
		const type = typeof body.type === 'string' && body.type ? body.type : 'handmatige-melding';

		// Een uitgeschakeld meldingstype mag niet meer verstuurd worden (de toggle geldt ook manueel).
		const { data: typeRow } = await admin.from('notification_types').select('enabled').eq('key', type).maybeSingle();
		if (typeRow && typeRow.enabled === false) {
			return Response.json({ error: 'dit meldingstype staat uit' }, { status: 400 });
		}

		// audience:'all' → de function bepaalt de ontvangers zelf (service-role), los van RLS/paginering.
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

		// In-app notificaties (realtime) — één rij per ontvanger.
		const rows = userIds.map((id) => ({ user_id: id, kind, title, body: text, payload: url ? { url } : null }));
		const { error: insErr } = await admin.from('notifications').insert(rows);
		if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

		// Historie — sender = de beller (announcer).
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
