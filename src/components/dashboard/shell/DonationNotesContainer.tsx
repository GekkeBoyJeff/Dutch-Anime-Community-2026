'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import DonationNotesPanel, { type DonationNote, type DonationNoteDraft } from '@/components/dashboard/components/DonationNotesPanel';
import { getBrowserClient } from '@/lib/supabase/client';

// Thin data container for components/DonationNotesPanel, shared by "Mijn profiel" and the moderation
// person page — same query shape either way (RLS decides who may write).
const DonationNotesContainer = ({ userId, canManage }: { userId: string; canManage: boolean }) => {
	const toast = Toast.useToastManager();
	const [notes, setNotes] = useState<DonationNote[] | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
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

	const add = async (draft: DonationNoteDraft) => {
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
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Donatienotitie toegevoegd', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const remove = async (id: string) => {
		const { error } = await getBrowserClient().from('donation_notes').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Verwijderen mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Notitie verwijderd', type: 'success' });
	};

	return <DonationNotesPanel notes={notes} canManage={canManage} busy={busy} onAdd={add} onDelete={remove} />;
};

export default DonationNotesContainer;
