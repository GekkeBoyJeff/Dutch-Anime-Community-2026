'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useId, useState } from 'react';
import { z } from 'zod';

import Avatar from '@/components/basics/Avatar';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Spinner from '@/components/basics/Spinner';
import Form from '@/components/components/Form';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

// Organisatie-profielvelden, gedeeld door "Mijn profiel" (eigen rij) en de moderatie-persoonspagina
// (admin bewerkt andermans rij). RLS beslist wie mag schrijven: de eigenaar via "profiles self update",
// admin via "profiles admin update" (roles.manage). Bedoeld voor latere publieke surfacing (donateurs).
const ProfileFieldsSchema = z.object({
	public_name: z.string().trim().max(80, 'Max 80 tekens'),
	age: z.string().trim().regex(/^\d{0,3}$/, 'Alleen cijfers').refine((v) => v === '' || (Number(v) >= 13 && Number(v) <= 120), '13–120 jaar'),
	instagram: z.string().trim().max(40, 'Max 40 tekens'),
	about: z.string().trim().max(400, 'Max 400 tekens'),
});
type ProfileFieldsValues = z.infer<typeof ProfileFieldsSchema>;

interface ProfileRow {
	public_name: string | null;
	age: number | null;
	instagram: string | null;
	about: string | null;
	photo_path: string | null;
	username: string | null;
}

const photoUrl = (path: string): string => getBrowserClient().storage.from('avatars').getPublicUrl(path).data.publicUrl;

const ProfileFieldsForm = ({ userId, canEdit }: { userId: string; canEdit: boolean }) => {
	const toast = Toast.useToastManager();
	const photoInputId = useId();
	const [row, setRow] = useState<ProfileRow | null>(null);
	const [photoPath, setPhotoPath] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
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

	if (!row) return <Spinner label="Profiel laden" />;

	const initials = (row.public_name || row.username || '?').slice(0, 2).toUpperCase();

	const submit = async (values: ProfileFieldsValues) => {
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
			setFile(null);
			toast.add({ title: 'Profiel opgeslagen', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const initialValues: ProfileFieldsValues = {
		public_name: row.public_name ?? '',
		age: row.age != null ? String(row.age) : '',
		instagram: row.instagram ?? '',
		about: row.about ?? '',
	};

	return (
		<Form<ProfileFieldsValues, ProfileFieldsValues> schema={ProfileFieldsSchema} initialValues={initialValues} onSubmit={submit} validateOn="blur">
			{(form) => {
				const name = form.field('public_name');
				const age = form.field('age');
				const insta = form.field('instagram');
				const about = form.field('about');
				return (
					<div className="inventory-form">
						<div className="field">
							<Avatar src={photoPath ? photoUrl(photoPath) : undefined} initials={initials} size="l" alt="" />
						</div>
						{canEdit && (
							<Field name="photo">
								<Field.Label htmlFor={photoInputId}>Profielfoto (PNG/JPG/WebP)</Field.Label>
								<TextInput id={photoInputId} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)} />
							</Field>
						)}
						<Field name="public_name" invalid={name.invalid}>
							<Field.Label>Naam</Field.Label>
							<TextInput disabled={!canEdit} placeholder="Weergavenaam" aria-invalid={name.invalid || undefined} {...name.props} />
							{name.error && <Content element="p" className="error" role="alert" value={name.error} />}
						</Field>
						<Field name="age" invalid={age.invalid}>
							<Field.Label>Leeftijd</Field.Label>
							<TextInput disabled={!canEdit} inputMode="numeric" placeholder="bv. 24" aria-invalid={age.invalid || undefined} {...age.props} />
							{age.error && <Content element="p" className="error" role="alert" value={age.error} />}
						</Field>
						<Field name="instagram" invalid={insta.invalid}>
							<Field.Label>Instagram</Field.Label>
							<TextInput disabled={!canEdit} placeholder="@handle" aria-invalid={insta.invalid || undefined} {...insta.props} />
							{insta.error && <Content element="p" className="error" role="alert" value={insta.error} />}
						</Field>
						<Field name="about" invalid={about.invalid}>
							<Field.Label>Over mij</Field.Label>
							<TextArea disabled={!canEdit} rows={4} placeholder="Kort over jezelf" aria-invalid={about.invalid || undefined} {...about.props} />
							{about.error && <Content element="p" className="error" role="alert" value={about.error} />}
						</Field>
						{canEdit && (
							<Button type="submit" variant="primary" disabled={busy}>
								{busy ? 'Bezig…' : 'Profiel opslaan'}
							</Button>
						)}
					</div>
				);
			}}
		</Form>
	);
};

export default ProfileFieldsForm;
