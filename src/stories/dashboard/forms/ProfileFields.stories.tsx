import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';

import ProfileFields from '@/components/dashboard/forms/ProfileFields';

const meta: Meta<typeof ProfileFields> = {
	title: 'Dashboard/Forms/ProfileFields',
	component: ProfileFields,
	parameters: {
		docs: {
			description: {
				component:
					'Presentational organisation-profile form (avatar upload, naam/leeftijd/instagram/over-mij, Zod-validated). Shared by "Mijn profiel" and the moderation person page via ProfileFieldsContainer, which owns the Supabase read/write and storage upload.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '24rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ProfileFields>;

const initialValues = { public_name: 'Jasmijn de Vries', age: '24', instagram: '@jasmijn', about: 'Standteam sinds 2023.' };

export const Default: Story = {
	args: {
		initialValues,
		avatarUrl: undefined,
		initials: 'JV',
		canEdit: true,
	},
};

export const ReadOnly: Story = {
	name: 'Read-only',
	args: {
		...Default.args,
		canEdit: false,
	},
};

export const Loading: Story = {
	args: {
		loading: true,
		initialValues: { public_name: '', age: '', instagram: '', about: '' },
		initials: '?',
		canEdit: true,
	},
};

export const ValidationErrors: Story = {
	name: 'Validatiefouten',
	args: {
		initialValues: { public_name: 'Jasmijn', age: '999', instagram: '@jasmijn', about: '' },
		initials: 'JV',
		canEdit: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: /profiel opslaan/i }));
	},
};

export const WithAvatar: Story = {
	name: 'Met avatar',
	args: {
		...Default.args,
		avatarUrl: 'https://picsum.photos/seed/dac-avatar/128/128',
	},
};

export const WithoutAvatar: Story = {
	name: 'Zonder avatar',
	args: {
		...Default.args,
		avatarUrl: undefined,
	},
};
