'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import NotificationComposerForm, { type ComposerMember, type ComposerMessage } from '@/components/dashboard/forms/NotificationComposerForm';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

// Meldingen-composer (notifications.send): stuur een in-app melding (+ web-push) naar leden. Verstuurt via de
// send-push Edge Function, die per ontvanger een notificatie-rij schrijft en push uitstuurt.
const NotificationsComposer = () => {
	const { ready, fallback, session } = useDashboardGuard('notifications.send', { className: 'inventory', label: 'Meldingen laden' });
	const toast = Toast.useToastManager();
	const [members, setMembers] = useState<ComposerMember[]>([]);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		// Via RPC i.p.v. een directe profiles-read: notifications.send geeft geen brede profiles-toegang, dus
		// een announcer zonder roles.manage/moderation.view zou anders enkel zichzelf zien.
		getBrowserClient()
			.rpc('list_notifiable_members')
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon leden niet laden', description: error.message, type: 'error' });
					return;
				}
				setMembers((data ?? []) as ComposerMember[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session]);

	if (!ready || !session) return fallback;

	const handleSend = async (message: ComposerMessage): Promise<boolean> => {
		setBusy(true);
		try {
			// 'Alle leden' laat de Edge Function de ontvangers zelf bepalen (audience:'all', service-role) — dan
			// hangt de doelgroep niet af van de RLS-breedte of paginering van de client.
			const common = { kind: 'message', type: 'handmatige-melding', title: message.title, body: message.body || null, url: message.url || null };
			const payload = message.all ? { ...common, audience: 'all' } : { ...common, user_ids: message.userIds };
			const { data, error } = await getBrowserClient().functions.invoke('send-push', { body: payload });
			if (error) {
				// supabase-js verpakt een non-2xx in een FunctionsHttpError met een generieke .message; de echte
				// reden staat in de response-body (error.context).
				let reason = error.message;
				const ctx = (error as { context?: Response }).context;
				if (ctx && typeof ctx.json === 'function') {
					try {
						const parsed = (await ctx.json()) as { error?: string };
						if (parsed?.error) reason = parsed.error;
					} catch {
						reason = error.message;
					}
				}
				toast.add({ title: 'Versturen mislukt', description: reason, type: 'error' });
				return false;
			}
			const result = data as { inserted?: number; pushed?: number } | null;
			toast.add({
				title: `Verstuurd naar ${result?.inserted ?? 0} lid/leden`,
				description: `${result?.pushed ?? 0} push-melding(en) verzonden.`,
				type: 'success',
			});
			return true;
		} finally {
			setBusy(false);
		}
	};

	return <NotificationComposerForm members={members} busy={busy} onSend={handleSend} />;
};

export default NotificationsComposer;
