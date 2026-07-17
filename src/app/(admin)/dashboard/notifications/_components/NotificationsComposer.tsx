'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import Switch from '@/components/components/Switch';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

interface Member {
	id: string;
	username: string | null;
}

// Meldingen-composer (notifications.send): stuur een in-app melding (+ web-push) naar leden. Verstuurt via de
// send-push Edge Function, die per ontvanger een notificatie-rij schrijft en push uitstuurt.
const NotificationsComposer = () => {
	const { ready, fallback, session } = useDashboardGuard('notifications.send', { className: 'inventory', label: 'Meldingen laden' });
	const toast = Toast.useToastManager();
	const [members, setMembers] = useState<Member[]>([]);
	const [all, setAll] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [url, setUrl] = useState('');
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
				setMembers((data ?? []) as Member[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session]);

	if (!ready || !session) return fallback;

	const send = async () => {
		if (!title.trim()) {
			toast.add({ title: 'Titel is verplicht.', type: 'error' });
			return;
		}
		if (!all && selected.length === 0) {
			toast.add({ title: 'Kies minstens één ontvanger.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			// 'Alle leden' laat de Edge Function de ontvangers zelf bepalen (audience:'all', service-role) — dan
			// hangt de doelgroep niet af van de RLS-breedte of paginering van de client.
			const common = { kind: 'message', title: title.trim(), body: body.trim() || null, url: url.trim() || null };
			const payload = all ? { ...common, audience: 'all' } : { ...common, user_ids: selected };
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
				return;
			}
			const result = data as { inserted?: number; pushed?: number } | null;
			toast.add({
				title: `Verstuurd naar ${result?.inserted ?? 0} lid/leden`,
				description: `${result?.pushed ?? 0} push-melding(en) verzonden.`,
				type: 'success',
			});
			setTitle('');
			setBody('');
			setUrl('');
			setSelected([]);
			setAll(false);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Container className="inventory">
			<Title size={2}>Meldingen versturen</Title>
			<div className="inventory-form">
				<Field name="title">
					<Field.Label>Titel</Field.Label>
					<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
				</Field>
				<Field name="body">
					<Field.Label>Bericht</Field.Label>
					<TextArea value={body} onChange={(e) => setBody(e.currentTarget.value)} />
				</Field>
				<Field name="url">
					<Field.Label>Link (optioneel)</Field.Label>
					<TextInput value={url} onChange={(e) => setUrl(e.currentTarget.value)} placeholder="/dashboard/…" />
				</Field>
				<label className="con-packed">
					<Switch checked={all} onCheckedChange={setAll} aria-label="Alle leden" />
					Alle leden
				</label>
				{!all && (
					<Field name="recipients">
						<Field.Label>Ontvangers</Field.Label>
						<Select
							multiple
							value={selected}
							onValueChange={(v) => setSelected((v as string[]) ?? [])}
							options={members.map((m) => ({ value: m.id, label: m.username ?? m.id.slice(0, 8) }))}
						/>
					</Field>
				)}
				<Content element="p" className="con-note">
					{all ? 'Alle leden' : `${selected.length} ontvanger(s)`}. Alleen leden met een account ontvangen de melding.
				</Content>
				<Button variant="primary" onClick={send} disabled={busy}>
					{busy ? 'Bezig…' : 'Versturen'}
				</Button>
			</div>
		</Container>
	);
};

export default NotificationsComposer;
