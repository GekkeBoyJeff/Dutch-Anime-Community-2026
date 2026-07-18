'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import type { PersonOption } from '@/app/(admin)/dashboard/_components/PersonPicker';
import { generatePostDraft } from '@/app/(admin)/dashboard/events/_components/postDraft';
import Button from '@/components/basics/Button';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

interface Attendance {
	subject_id: string;
	status: string;
}
interface Assignment {
	assigned_user_id: string | null;
	assigned_label: string | null;
}
interface Draft {
	title: string;
	body: string;
	generated_at: string | null;
	updated_at: string;
}

type PostTabProps = {
	eventId: string;
	sessionUserId: string;
	eventName: string;
	startsOn: string | null;
	attendance: Attendance[];
	users: PersonOption[];
	subjectName: (id: string | null) => string;
};

// Aanwezigheidsstatussen die tellen als "heeft geholpen / was er".
const HELPED_STATUSES = ['present', 'late'];

const fmtMeta = (iso: string): string => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Post-tab: één bewerkbaar conceptbericht per editie. De eerste versie wordt uit de event-data
// gegenereerd (aanwezige helpers + item-brengers); daarna handmatig bijgeschaafd. Interne opslag.
const PostTab = ({ eventId, sessionUserId, eventName, startsOn, attendance, users, subjectName }: PostTabProps) => {
	const toast = Toast.useToastManager();
	const [draft, setDraft] = useState<Draft | null>(null);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [confirmRegen, setConfirmRegen] = useState(false);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('event_posts').select('title, body, generated_at, updated_at').eq('event_id', eventId).maybeSingle(),
			db.from('event_item_assignments').select('assigned_user_id, assigned_label').eq('event_id', eventId),
		]).then(([{ data: post }, { data: assigns }]) => {
			if (!active) return;
			const d = (post ?? null) as Draft | null;
			setDraft(d);
			setTitle(d?.title ?? '');
			setBody(d?.body ?? '');
			setAssignments((assigns ?? []) as Assignment[]);
			setLoaded(true);
		});
		return () => {
			active = false;
		};
	}, [eventId]);

	const buildDraft = useMemo(() => {
		const username = (id: string): string => users.find((u) => u.id === id)?.username ?? id.slice(0, 8);
		const helpers = attendance.filter((a) => HELPED_STATUSES.includes(a.status)).map((a) => subjectName(a.subject_id));
		const contributors = assignments.map((a) => (a.assigned_user_id ? username(a.assigned_user_id) : a.assigned_label ?? '')).filter((n) => n.trim());
		return () => generatePostDraft({ eventName, startsOn, helpers, contributors });
	}, [attendance, assignments, users, subjectName, eventName, startsOn]);

	const persist = async (next: { title: string; body: string; generated_at?: string }) => {
		const payload = {
			event_id: eventId,
			title: next.title,
			body: next.body,
			...(next.generated_at ? { generated_at: next.generated_at } : {}),
			updated_by: sessionUserId,
		};
		const { data, error } = await getBrowserClient()
			.from('event_posts')
			.upsert(payload, { onConflict: 'event_id' })
			.select('title, body, generated_at, updated_at')
			.maybeSingle();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return false;
		}
		const d = (data ?? null) as Draft | null;
		setDraft(d);
		setTitle(d?.title ?? next.title);
		setBody(d?.body ?? next.body);
		return true;
	};

	const generate = async () => {
		const generated = buildDraft();
		if (await persist({ ...generated, generated_at: new Date().toISOString() })) {
			toast.add({ title: 'Concept gegenereerd', type: 'success' });
		}
	};

	const regenerate = async () => {
		setConfirmRegen(false);
		const generated = buildDraft();
		if (await persist({ ...generated, generated_at: new Date().toISOString() })) {
			toast.add({ title: 'Concept opnieuw gegenereerd', type: 'success' });
		}
	};

	const save = async () => {
		if (!title.trim()) {
			toast.add({ title: 'Titel is verplicht.', type: 'error' });
			return;
		}
		if (await persist({ title: title.trim(), body })) {
			toast.add({ title: 'Opgeslagen', type: 'success' });
		}
	};

	if (!loaded) return <p className="con-note">Laden…</p>;

	if (!draft) {
		return (
			<div className="inventory-tab">
				<p className="con-note">
					Nog geen conceptbericht. Genereer een eerste versie op basis van de aanwezige helpers en de mensen die materiaal meebrachten; daarna kun je het vrij bijschaven.
				</p>
				<Button variant="primary" icon="heart" onClick={generate}>
					Genereer concept
				</Button>
			</div>
		);
	}

	return (
		<div className="inventory-tab">
			<div className="inventory-form">
				<Field name="title">
					<Field.Label>Titel</Field.Label>
					<TextInput value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
				</Field>
				<Field name="body">
					<Field.Label>Bericht</Field.Label>
					<TextArea rows={12} value={body} onChange={(e) => setBody(e.currentTarget.value)} />
				</Field>
				<p className="con-note">
					{draft.generated_at ? `Gegenereerd op ${fmtMeta(draft.generated_at)}. ` : ''}
					Laatst bewerkt op {fmtMeta(draft.updated_at)}.
				</p>
				<div className="inventory-row-actions">
					<Button variant="primary" onClick={save}>
						Opslaan
					</Button>
					<Button variant="secondary" onClick={() => setConfirmRegen(true)}>
						Opnieuw genereren
					</Button>
				</div>
			</div>

			<ConfirmDialog
				open={confirmRegen}
				onOpenChange={setConfirmRegen}
				title="Concept opnieuw genereren?"
				description="Dit overschrijft de huidige titel en tekst met een verse versie uit de event-data. Je bewerkingen gaan verloren."
				confirmLabel="Opnieuw genereren"
				onConfirm={regenerate}
			/>
		</div>
	);
};

export default PostTab;
