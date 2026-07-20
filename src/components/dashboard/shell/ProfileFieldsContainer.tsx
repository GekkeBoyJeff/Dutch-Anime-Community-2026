'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import ProfileFields, { type ProfileFieldsValues } from '@/components/dashboard/forms/ProfileFields';
import { getBrowserClient } from '@/lib/supabase/client';

interface ProfileRow {
	public_name: string | null;
	age: number | null;
	instagram: string | null;
	about: string | null;
	photo_path: string | null;
	username: string | null;
}

const photoUrl = (path: string): string => getBrowserClient().storage.from('avatars').getPublicUrl(path).data.publicUrl;

// Thin data container for forms/ProfileFields, shared by "Mijn profiel" (own row) and the moderation
// person page (admin edits someone else's row) — same query shape either way, RLS decides who may write.
const ProfileFieldsContainer = ({ userId, canEdit }: { userId: string; canEdit: boolean }) => {
	const toast = Toast.useToastManager();
	const [row, setRow] = useState<ProfileRow | null>(null);
	const [photoPath, setPhotoPath] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('profiles')
			.select('public_name, age, instagram, about, photo_path, username')
			.eq('id', userId)
			.maybeSingle()
			.then(({ data }) => {
				if (!active) return;
				const r = (data ?? { public_name: null, age: null, instagram: null, about: null, photo_path: null, username: null }) as ProfileRow;
				setRow(r);
				setPhotoPath(r.photo_path);
			});
		return () => {
			active = false;
		};
	}, [userId]);

	const submit = async (values: ProfileFieldsValues, file?: File | null) => {
		setBusy(true);
		try {
			const db = getBrowserClient();
			let nextPath = photoPath;
			if (file) {
				const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
				const path = `${userId}/avatar-${Date.now()}.${ext}`;
				const up = await db.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false });
				if (up.error) {
					toast.add({ title: 'Kon foto niet uploaden', description: up.error.message, type: 'error' });
					return;
				}
				nextPath = path;
			}
			const { data, error } = await db
				.from('profiles')
				.update({
					public_name: values.public_name.trim() || null,
					age: values.age ? Number(values.age) : null,
					instagram: values.instagram.trim() || null,
					about: values.about.trim() || null,
					photo_path: nextPath,
				})
				.eq('id', userId)
				.select();
			if (error) {
				toast.add({ title: 'Opslaan mislukt', description: error.message, type: 'error' });
				return;
			}
			if (!data || data.length === 0) {
				toast.add({ title: 'Geen rechten', description: 'Je mag dit profiel niet bewerken.', type: 'error' });
				return;
			}
			setPhotoPath(nextPath);
			toast.add({ title: 'Profiel opgeslagen', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const initials = (row?.public_name || row?.username || '?').slice(0, 2).toUpperCase();
	const initialValues: ProfileFieldsValues = {
		public_name: row?.public_name ?? '',
		age: row?.age != null ? String(row.age) : '',
		instagram: row?.instagram ?? '',
		about: row?.about ?? '',
	};

	return (
		<ProfileFields
			loading={row === null}
			initialValues={initialValues}
			avatarUrl={photoPath ? photoUrl(photoPath) : undefined}
			initials={initials}
			canEdit={canEdit}
			busy={busy}
			onSubmit={submit}
		/>
	);
};

export default ProfileFieldsContainer;
