'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import { formatDate } from '@/lib/formatDate';
import { type ModNote } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean };

// Interne moderatie-notities (mod_notes): toevoegen + archiveren. Alleen zichtbaar voor moderatie.
const NotesTab = ({ subjectId, sessionUserId, canManage }: Props) => {
	const toast = Toast.useToastManager();
	const [notes, setNotes] = useState<ModNote[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<{ body: string } | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('mod_notes')
			.select('id, body, created_at, created_by, archived_at')
			.eq('subject_id', subjectId)
			.is('archived_at', null)
			.order('created_at', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon notities niet laden', description: error.message, type: 'error' });
					return;
				}
				setNotes((data ?? []) as ModNote[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const add = async () => {
		if (!form || !form.body.trim()) {
			toast.add({ title: 'Notitie is leeg.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const { error } = await getBrowserClient().from('mod_notes').insert({ subject_id: subjectId, body: form.body.trim(), created_by: sessionUserId });
			if (error) {
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			setForm(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Notitie toegevoegd', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const archive = async (id: string) => {
		const { error } = await getBrowserClient().from('mod_notes').update({ archived_at: new Date().toISOString(), archived_by: sessionUserId }).eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Notitie gearchiveerd', type: 'success' });
	};

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="plus" onClick={() => setForm({ body: '' })}>
						Notitie toevoegen
					</Button>
				</div>
			)}
			<ul className="con-list">
				{notes.length === 0 && <li className="con-note">Nog geen notities.</li>}
				{notes.map((n) => (
					<li key={n.id} className="con-line">
						<div className="con-line-info">
							<span className="con-line-main">{n.body}</span>
							<span className="con-note">{formatDate(n.created_at, { dateStyle: 'medium', timeStyle: 'short' }) ?? n.created_at}</span>
						</div>
						{canManage && (
							<Button variant="ghost" onClick={() => archive(n.id)}>
								Archiveren
							</Button>
						)}
					</li>
				))}
			</ul>

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title="Notitie toevoegen"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={add} disabled={busy}>
							{busy ? 'Bezig…' : 'Opslaan'}
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="body">
							<Field.Label>Notitie</Field.Label>
							<TextArea value={form.body} onChange={(e) => setForm({ body: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default NotesTab;
