import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Actions from '@/components/basics/Actions';
import { ActionsProps } from '@/lib/site/content/schema/basics/actions';

const meta: Meta<typeof Actions> = {
	title: 'Basics/Actions',
	component: Actions,
	parameters: {
		docs: { description: { component: 'The one CTA row: maps the shared `Action` content shape onto Buttons, so every block honors the same capabilities (variant, url, target, icon) without re-writing the loop. The row itself is one flex row that wraps, styled in Actions.scss; a consuming block overrides only the gap or alignment it needs.' } },
		jsonSchema: { schema: ActionsProps },
	},
	argTypes: {
		defaultVariant: {
			control: 'inline-radio',
			options: ['primary', 'secondary', 'ghost'],
		},
	},
	decorators: [
		// Row layout is block-local by design; the workshop provides the minimal flex context.
		(Story) => (
			<div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Actions>;

export const Default: Story = {
	args: {
		actions: [
			{
				value: 'Get started',
				url: '/get-started',
			},
			{
				value: 'Learn more',
				url: '/about',
				variant: 'secondary',
			},
		],
	},
};

export const WithIcons: Story = {
	args: {
		actions: [
			{
				value: 'View the calendar',
				url: '/calendar',
				icon: 'calendar',
			},
			{
				value: 'Read the docs',
				url: '/docs',
				variant: 'secondary',
				icon: 'arrow-up-right',
			},
		],
	},
};

export const DefaultVariant: Story = {
	args: {
		actions: [
			{
				value: 'All articles',
				url: '/articles',
			},
			{
				value: 'About us',
				url: '/about',
			},
		],
		defaultVariant: 'secondary',
	},
};
