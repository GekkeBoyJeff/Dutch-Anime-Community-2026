import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import FieldGroup from '@/components/forms/FieldGroup';
import TextInput from '@/components/forms/TextInput';

const meta: Meta<typeof FieldGroup> = {
	title: 'Forms/FieldGroup',
	component: FieldGroup,
	parameters: {
		docs: {
			description: {
				component:
					'A layout wrapper that stacks Fields with a consistent gap and opens a container-query context, so a child Field with orientation="horizontal" switches from stacked to side-by-side based on the group width, not the viewport. Stays a Server Component.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof FieldGroup>;

export const Default: Story = {
	render: () => (
		<FieldGroup>
			<Field name="email">
				<Field.Label>E-mailadres</Field.Label>
				<TextInput type="email" placeholder="you@example.com" />
			</Field>
			<Field name="phone">
				<Field.Label>Telefoonnummer</Field.Label>
				<TextInput type="tel" placeholder="+31 6 1234 5678" />
			</Field>
		</FieldGroup>
	),
};

export const HorizontalFields: Story = {
	render: () => (
		<FieldGroup>
			<Field orientation="horizontal" name="first">
				<Field.Label>Voornaam</Field.Label>
				<TextInput placeholder="Amelia" />
			</Field>
			<Field orientation="horizontal" name="last">
				<Field.Label>Achternaam</Field.Label>
				<TextInput placeholder="Jansen" />
			</Field>
		</FieldGroup>
	),
};
