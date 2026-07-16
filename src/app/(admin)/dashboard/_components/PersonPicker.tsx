'use client';

import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextInput from '@/components/forms/TextInput';

export interface PersonValue {
	userId: string | null;
	label: string | null;
}

export interface PersonOption {
	id: string;
	username: string | null;
}

// Reusable "owner / assigned-to" picker: link a DB user (Discord account) when possible, else a
// free-text name. Emits both so callers store owner_user_id + owner_label (or assigned_*).
const PersonPicker = ({
	users,
	value,
	onChange,
	labelText = 'Persoon',
}: {
	users: PersonOption[];
	value: PersonValue;
	onChange: (next: PersonValue) => void;
	labelText?: string;
}) => (
	<>
		<Field name="person-user">
			<Field.Label>{labelText} (account)</Field.Label>
			<Select
				native
				aria-label={`${labelText} account`}
				value={value.userId ?? ''}
				options={[
					{ value: '', label: '— vrije tekst / niemand —' },
					...users.map((user) => ({ value: user.id, label: user.username ?? user.id.slice(0, 8) })),
				]}
				onValueChange={(next) => onChange({ userId: (next as string) || null, label: (next as string) ? null : value.label })}
			/>
		</Field>
		{!value.userId && (
			<Field name="person-label">
				<Field.Label>…of naam (vrije tekst)</Field.Label>
				<TextInput value={value.label ?? ''} onChange={(event) => onChange({ userId: null, label: event.currentTarget.value || null })} />
			</Field>
		)}
	</>
);

export default PersonPicker;
