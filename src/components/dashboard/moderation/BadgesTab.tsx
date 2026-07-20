'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Drawer from '@/components/components/Drawer';
import BadgeCard from '@/components/dashboard/basics/BadgeCard';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { type Badge } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';
import { genUuid } from '@/lib/uuid';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean };
interface BadgeForm {
	title: string;
	description: string;
	awarded_on: string;
	file: File | null;
}

// Badges toekennen aan dit profiel (badges.manage). Afbeelding in de publieke badges-bucket (publieke URL,
// geen signed URL). Intrekken = archiveren.
const BadgesTab = ({ subjectId, sessionUserId, canManage }: Props) => {
	const toast = Toast.useToastManager();
	const [badges, setBadges] = useState<Badge[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<BadgeForm | null>(null);
	const [toArchive, setToArchive] = useState<Badge | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('badges')
			.select('id, subject_id, title, description, awarded_on, image_path, archived_at')
			.eq('subject_id', subjectId)
			.is('archived_at', null)
			.order('awarded_on', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon badges niet laden', description: error.message, type: 'error' });
					return;
				}
				setBadges((data ?? []) as Badge[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const imageUrl = (path: string): string => getBrowserClient().storage.from('badges').getPublicUrl(path).data.publicUrl;

	const award = async () => {
		if (!form || !form.title.trim() || !form.awarded_on) {
			toast.add({ title: 'Titel en datum zijn verplicht.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const db = getBrowserClient();
			const id = genUuid();
			let imagePath: string | null = null;
			if (form.file) {
				imagePath = `${id}/${form.file.name}`;
				const up = await db.storage.from('badges').upload(imagePath, form.file, { contentType: form.file.type, upsert: false });
				if (up.error) {
					toast.add({ title: 'Kon afbeelding niet uploaden', description: up.error.message, type: 'error' });
					return;
				}
			}
			const { error } = await db.from('badges').insert({
				id,
				subject_id: subjectId,
				title: form.title.trim(),
				description: form.description.trim() || null,
				awarded_on: form.awarded_on,
				image_path: imagePath,
				awarded_by: sessionUserId,
			});
			if (error) {
				if (imagePath) await db.storage.from('badges').remove([imagePath]);
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			setForm(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Badge toegekend', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const archive = async (badge: Badge) => {
		const { data, error } = await getBrowserClient()
			.from('badges')
			.update({ archived_at: new Date().toISOString(), archived_by: sessionUserId })
			.eq('id', badge.id)
			.select();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		if (!data || data.length === 0) {
			toast.add({ title: 'Intrekken niet gelukt', description: 'Je hebt geen rechten om badges te beheren.', type: 'error' });
			return;
		}
		toast.add({ title: 'Badge ingetrokken', type: 'success' });
	};

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="plus" onClick={() => setForm({ title: '', description: '', awarded_on: new Date().toLocaleDateString('en-CA'), file: null })}>
						Badge toekennen
					</Button>
				</div>
			)}
			<div className="badge-grid">
				{badges.length === 0 && <span className="con-note">Nog geen badges.</span>}
				{badges.map((b) => (
					<BadgeCard
						key={b.id}
						imageUrl={b.image_path ? imageUrl(b.image_path) : undefined}
						title={b.title}
						description={b.description}
						awardedOn={b.awarded_on}
						onArchive={canManage ? () => setToArchive(b) : undefined}
					/>
				))}
			</div>

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title="Badge toekennen"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={award} disabled={busy}>
							{busy ? 'Bezig…' : 'Toekennen'}
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="title">
							<Field.Label>Titel</Field.Label>
							<TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
						</Field>
						<Field name="description">
							<Field.Label>Omschrijving</Field.Label>
							<TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
						</Field>
						<Field name="awarded_on">
							<Field.Label>Toegekend op</Field.Label>
							<TextInput type="date" value={form.awarded_on} onChange={(e) => setForm({ ...form, awarded_on: e.currentTarget.value })} />
						</Field>
						<Field name="image">
							<Field.Label>Afbeelding (optioneel, PNG/JPG/WebP)</Field.Label>
							<TextInput type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setForm({ ...form, file: e.currentTarget.files?.[0] ?? null })} />
						</Field>
					</div>
				)}
			</Drawer>

			<ConfirmDialog
				open={toArchive !== null}
				onOpenChange={(o) => !o && setToArchive(null)}
				title="Badge intrekken?"
				description={toArchive ? `"${toArchive.title}" wordt ingetrokken.` : undefined}
				confirmLabel="Intrekken"
				destructive
				onConfirm={() => {
					if (toArchive) archive(toArchive);
					setToArchive(null);
				}}
			/>
		</div>
	);
};

export default BadgesTab;
