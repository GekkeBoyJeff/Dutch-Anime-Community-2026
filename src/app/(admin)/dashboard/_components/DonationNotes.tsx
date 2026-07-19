'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

// Donatienotities per profiel. Eigenaar leest read-only (canManage=false); beheer (roles.manage) voegt
// toe/verwijdert — RLS ("donation_notes …") is de echte grens. Bron voor de latere publieke donateurspagina.
interface DonationNote {
	id: string;
	note: string;
	source: string | null;
	noted_on: string | null;
	created_at: string;
}

const DonationNotes = ({ userId, canManage }: { userId: string; canManage: boolean }) => {
	const toast = Toast.useToastManager();
	const [notes, setNotes] = useState<DonationNote[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [draft, setDraft] = useState<{ note: string; source: string; noted_on: string } | null>(null);
	const [toDelete, setToDelete] = useState<DonationNote | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('donation_notes')
			.select('id, note, source, noted_on, created_at')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.then(({ data }) => {
				if (active) setNotes((data ?? []) as DonationNote[]);
			});
		return () => {
			active = false;
		};
	}, [userId, refreshKey]);

	const add = async () => {
		if (!draft || !draft.note.trim()) {
			toast.add({ title: 'Notitie is verplicht.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const db = getBrowserClient();
			const { data: auth } = await db.auth.getUser();
			const { error } = await db.from('donation_notes').insert({
				user_id: userId,
				note: draft.note.trim(),
				source: draft.source.trim() || null,
				noted_on: draft.noted_on || null,
				created_by: auth.user?.id ?? null,
			});
			if (error) {
				toast.add({ title: 'Opslaan mislukt', description: error.message, type: 'error' });
				return;
			}
			setDraft(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Donatienotitie toegevoegd', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const remove = async (note: DonationNote) => {
		const { error } = await getBrowserClient().from('donation_notes').delete().eq('id', note.id);
		if (error) {
			toast.add({ title: 'Verwijderen mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Notitie verwijderd', type: 'success' });
	};

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					{draft ? (
						<div className="inventory-form">
							<Field name="note">
								<Field.Label>Notitie</Field.Label>
								<TextArea rows={3} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.currentTarget.value })} />
							</Field>
							<Field name="source">
								<Field.Label>Bron (optioneel)</Field.Label>
								<TextInput placeholder="bv. Ko-fi" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.currentTarget.value })} />
							</Field>
							<Field name="noted_on">
								<Field.Label>Datum (optioneel)</Field.Label>
								<TextInput type="date" value={draft.noted_on} onChange={(e) => setDraft({ ...draft, noted_on: e.currentTarget.value })} />
							</Field>
							<div className="inventory-row-actions">
								<Button variant="secondary" onClick={() => setDraft(null)}>
									Annuleren
								</Button>
								<Button variant="primary" onClick={add} disabled={busy}>
									{busy ? 'Bezig…' : 'Toevoegen'}
								</Button>
							</div>
						</div>
					) : (
						<Button variant="primary" icon="plus" onClick={() => setDraft({ note: '', source: '', noted_on: '' })}>
							Donatienotitie toevoegen
						</Button>
					)}
				</div>
			)}
			<ul className="con-list">
				{notes.length === 0 && <li className="con-note">Geen donatienotities.</li>}
				{notes.map((n) => (
					<li key={n.id} className="con-line">
						<div className="con-line-info">
							<span className="con-line-main">{n.note}</span>
							<span className="con-note">{[n.source, n.noted_on ? formatDate(n.noted_on, { dateStyle: 'medium' }) : null].filter(Boolean).join(' · ')}</span>
						</div>
						{canManage && (
							<Button variant="ghost" onClick={() => setToDelete(n)}>
								Verwijderen
							</Button>
						)}
					</li>
				))}
			</ul>
			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(o) => !o && setToDelete(null)}
				title="Notitie verwijderen?"
				confirmLabel="Verwijderen"
				destructive
				onConfirm={() => {
					if (toDelete) remove(toDelete);
					setToDelete(null);
				}}
			/>
		</div>
	);
};

export default DonationNotes;
