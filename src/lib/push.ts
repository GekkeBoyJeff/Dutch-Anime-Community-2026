import { env } from '@/lib/env';
import { getBrowserClient } from '@/lib/supabase/client';

// base64url VAPID-sleutel → Uint8Array voor applicationServerKey.
const urlBase64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
	const padding = '='.repeat((4 - (base64.length % 4)) % 4);
	const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(normalized);
	const out = new Uint8Array(new ArrayBuffer(raw.length));
	for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
	return out;
};

// Push is beschikbaar als de browser het ondersteunt én er een publieke VAPID-sleutel is geconfigureerd.
export const pushSupported = (): boolean =>
	typeof window !== 'undefined' &&
	'serviceWorker' in navigator &&
	'PushManager' in window &&
	'Notification' in window &&
	Boolean(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);

// "Aan" betekent: er is een browser-abonnement ÉN de ingelogde gebruiker heeft er een eigen rij voor. De
// RLS op push_subscriptions scoped op auth.uid(), dus een rij die bij een vorige gebruiker van dit apparaat
// hoort telt niet mee — zo staat de toggle voor de huidige gebruiker correct, niet op basis van het (per
// browser gedeelde) abonnement alleen.
export const getPushState = async (): Promise<boolean> => {
	if (!pushSupported()) return false;
	const reg = await navigator.serviceWorker.getRegistration();
	const sub = await reg?.pushManager.getSubscription();
	if (!sub) return false;
	const { data } = await getBrowserClient().from('push_subscriptions').select('id').eq('endpoint', sub.endpoint).maybeSingle();
	return Boolean(data);
};

export const subscribePush = async (): Promise<{ ok: boolean; error?: string }> => {
	const key = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
	if (!pushSupported() || !key) return { ok: false, error: 'Meldingen worden niet ondersteund.' };
	try {
		if ((await Notification.requestPermission()) !== 'granted') return { ok: false, error: 'Toestemming geweigerd.' };
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) });
		try {
			const json = sub.toJSON();
			const db = getBrowserClient();
			const { data: userData } = await db.auth.getUser();
			const userId = userData.user?.id;
			if (!userId) throw new Error('Niet ingelogd.');
			const { error } = await db
				.from('push_subscriptions')
				.upsert({ user_id: userId, endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' }, { onConflict: 'endpoint' });
			if (error) throw new Error(error.message);
			return { ok: true };
		} catch (e) {
			// Draai het browser-abonnement terug zodat de browserstaat niet uit de DB kan lopen (anders zou de
			// toggle "aan" tonen zonder rij, en zou er nooit een push aankomen).
			await sub.unsubscribe().catch(() => undefined);
			throw e;
		}
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : 'Kon meldingen niet aanzetten.' };
	}
};

export const unsubscribePush = async (): Promise<{ ok: boolean; error?: string }> => {
	if (!pushSupported()) return { ok: true };
	try {
		const reg = await navigator.serviceWorker.getRegistration();
		const sub = await reg?.pushManager.getSubscription();
		if (!sub) return { ok: true };
		await getBrowserClient().from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
		await sub.unsubscribe();
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : 'Kon meldingen niet uitzetten.' };
	}
};
