'use client';

import { useState } from 'react';

import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Entry from '@/components/components/Entry';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { formatDate } from '@/lib/formatDate';

export interface DonationNote {
	id: string;
	note: string;
	source: string | null;
	noted_on: string | null;
	created_at: string;
}

export interface DonationNoteDraft {
	note: string;
	source: string;
	noted_on: string;
}

export interface DonationNotesPanelProps {
	/** `null` while the list is loading */
	notes: DonationNote[] | null;
	/** Show the add/delete UI; false renders a read-only list */
	canManage: boolean;
	/** Add/delete mutation in flight */
	busy?: boolean;
	onAdd: (values: DonationNoteDraft) => void;
	onDelete: (id: string) => void;
}

// Presentational donation-notes list + draft form + delete confirm. Eigenaar leest read-only
// (canManage=false); beheer (roles.manage) voegt toe/verwijdert. The caller owns the query/mutations —
// RLS ("donation_notes …") is the real access boundary.
const DonationNotesPanel = ({ notes, canManage, busy, onAdd, onDelete }: DonationNotesPanelProps) => {
	const [draft, setDraft] = useState<DonationNoteDraft | null>(null);
	const [toDelete, setToDelete] = useState<DonationNote | null>(null);

	if (notes === null) {
		return (
			<div className="inventory-tab" aria-hidden="true">
				<Skeleton width="60%" height="0.9rem" />
				<Skeleton width="80%" height="0.9rem" />
			</div>
		);
	}

	const submitDraft = () => {
		if (!draft || !draft.note.trim()) return;
		onAdd(draft);
		setDraft(null);
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
								<Button variant="primary" onClick={submitDraft} disabled={busy}>
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
			<Entry.List>
				{notes.length === 0 && <li className="field-note">Geen donatienotities.</li>}
				{notes.map((n) => (
					<Entry
						key={n.id}
						main={n.note}
						sub={[n.source, n.noted_on ? formatDate(n.noted_on, { dateStyle: 'medium' }) : null].filter(Boolean).join(' · ')}
						trailing={
							canManage ? (
								<Button variant="ghost" onClick={() => setToDelete(n)}>
									Verwijderen
								</Button>
							) : undefined
						}
					/>
				))}
			</Entry.List>
			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(o) => !o && setToDelete(null)}
				title="Notitie verwijderen?"
				confirmLabel="Verwijderen"
				destructive
				onConfirm={() => {
					if (toDelete) onDelete(toDelete.id);
					setToDelete(null);
				}}
			/>
		</div>
	);
};

export default DonationNotesPanel;
