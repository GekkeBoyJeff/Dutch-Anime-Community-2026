import { withSupabase } from 'npm:@supabase/server';
import webpush from 'npm:web-push';

// send-push (fase 8): een gebruiker met notifications.send stuurt een melding naar leden. Schrijft één
// in-app notificatie-rij per ontvanger (realtime bel) én verstuurt web-push naar hun geabonneerde apparaten.
// VAPID-privésleutel staat alléén hier als Edge-Function-secret. auth:'user' → verify_jwt mag aan blijven.

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:info@dutchanimecommunity.nl';
const pushEnabled = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
if (pushEnabled) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface Body {
	user_ids?: unknown;
	audience?: unknown;
	kind?: unknown;
	title?: unknown;
	body?: unknown;
	url?: unknown;
}

export default {
	fetch: withSupabase({ auth: 'user' }, async (req: Request, ctx) => {
		// Rechtencheck via de RLS-client van de beller (my_permissions bevat de effectieve permissies).
		const { data: perms } = await ctx.supabase.rpc('my_permissions');
		if (!(Array.isArray(perms) && perms.includes('notifications.send'))) {
			return Response.json({ error: 'notifications.send vereist' }, { status: 403 });
		}

		const body = (await req.json().catch(() => ({}))) as Body;
		const title = typeof body.title === 'string' ? body.title.trim() : '';
		const text = typeof body.body === 'string' && body.body.trim() ? body.body.trim() : null;
		const kind = typeof body.kind === 'string' && body.kind ? body.kind : 'message';
		const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : undefined;

		const admin = ctx.supabaseAdmin;

		// audience:'all' → de function bepaalt de ontvangers zelf (na de notifications.send-check hierboven), zodat
		// 'Alle leden' niet afhangt van de RLS-breedte of paginering van de client. Anders: de expliciete lijst.
		let userIds: string[];
		if (body.audience === 'all') {
			const { data: members, error: memErr } = await admin.from('profiles').select('id');
			if (memErr) return Response.json({ error: memErr.message }, { status: 500 });
			userIds = (members ?? []).map((m) => m.id as string);
		} else {
			userIds = Array.isArray(body.user_ids) ? (body.user_ids.filter((v) => typeof v === 'string') as string[]) : [];
		}
		if (userIds.length === 0 || !title) {
			return Response.json({ error: 'ontvangers en title zijn verplicht' }, { status: 400 });
		}

		// In-app notificaties (realtime) — één rij per ontvanger.
		const rows = userIds.map((id) => ({ user_id: id, kind, title, body: text, payload: url ? { url } : null }));
		const { error: insErr } = await admin.from('notifications').insert(rows);
		if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

		// Web-push naar geabonneerde apparaten; verlopen abonnementen (404/410) opruimen.
		let pushed = 0;
		if (pushEnabled) {
			const { data: subs } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').in('user_id', userIds);
			const payload = JSON.stringify({ title, body: text ?? '', url });
			for (const sub of subs ?? []) {
				try {
					await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
					pushed += 1;
				} catch (e) {
					const status = (e as { statusCode?: number }).statusCode;
					if (status === 404 || status === 410) await admin.from('push_subscriptions').delete().eq('id', sub.id);
				}
			}
		}

		return Response.json({ inserted: rows.length, pushed, pushEnabled });
	}),
};
