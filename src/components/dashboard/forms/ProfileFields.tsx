'use client';

import { useId, useState } from 'react';
import { z } from 'zod';

import Avatar from '@/components/basics/Avatar';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Skeleton from '@/components/basics/Skeleton';
import Form from '@/components/components/Form';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';

// Organisatie-profielvelden, gedeeld door "Mijn profiel" (eigen rij) en de moderatie-persoonspagina
// (admin bewerkt andermans rij). RLS beslist wie mag schrijven: de eigenaar via "profiles self update",
// admin via "profiles admin update" (roles.manage). Bedoeld voor latere publieke surfacing (donateurs).
export const ProfileFieldsSchema = z.object({
	public_name: z.string().trim().max(80, 'Max 80 tekens'),
	age: z.string().trim().regex(/^\d{0,3}$/, 'Alleen cijfers').refine((v) => v === '' || (Number(v) >= 13 && Number(v) <= 120), '13–120 jaar'),
	instagram: z.string().trim().max(40, 'Max 40 tekens'),
	about: z.string().trim().max(400, 'Max 400 tekens'),
});
export type ProfileFieldsValues = z.infer<typeof ProfileFieldsSchema>;

export interface ProfileFieldsProps {
	/** Still fetching the row — shows a skeleton form */
	loading?: boolean;
	initialValues: ProfileFieldsValues;
	/** Resolved public avatar URL, if a photo was uploaded */
	avatarUrl?: string;
	/** Fallback initials for the avatar */
	initials: string;
	/** Read-only when false — fields render disabled and no submit button shows */
	canEdit: boolean;
	/** Submit in flight */
	busy?: boolean;
	/** New avatar file, when the user picked one in this session */
	onSubmit: (values: ProfileFieldsValues, file?: File | null) => void;
}

// Presentational profile form: avatar upload UI + naam/leeftijd/instagram/over-mij with Zod
// validation. The caller owns the Supabase read/write and the storage upload.
const ProfileFields = ({ loading, initialValues, avatarUrl, initials, canEdit, busy, onSubmit }: ProfileFieldsProps) => {
	const photoInputId = useId();
	const [file, setFile] = useState<File | null>(null);

	if (loading) {
		return (
			<div className="inventory-form" aria-hidden="true">
				<div className="field">
					<Skeleton circle width="3.5rem" height="3.5rem" />
				</div>
				{Array.from({ length: 4 }, (_, i) => (
					<div key={i} className="field">
						<Skeleton width="30%" height="0.75rem" />
						<Skeleton width="100%" height="2.25rem" radius="m" />
					</div>
				))}
			</div>
		);
	}

	return (
		<Form<ProfileFieldsValues, ProfileFieldsValues>
			schema={ProfileFieldsSchema}
			initialValues={initialValues}
			onSubmit={(values) => onSubmit(values, file)}
			validateOn="blur"
		>
			{(form) => {
				const name = form.field('public_name');
				const age = form.field('age');
				const insta = form.field('instagram');
				const about = form.field('about');
				return (
					<div className="inventory-form">
						<div className="field">
							<Avatar src={avatarUrl} initials={initials} size="l" alt="" />
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

export default ProfileFields;
