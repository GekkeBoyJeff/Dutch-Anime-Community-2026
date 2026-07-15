import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Actions from '@/components/basics/Actions';
import { ActionsProps } from '@/lib/content/schema/basics/actions';

const meta: Meta<typeof Actions> = {
	title: 'Basics/Actions',
	component: Actions,
	parameters: {
		docs: { description: { component: 'The one CTA row: maps the shared `Action` content shape onto Buttons, so every block honors the same capabilities (variant, url, target, icon) without re-writing the loop. The row\'s layout (flex, gap) deliberately stays with the consuming block\'s stylesheet — this component owns only the mapping. `badge` opts primary actions into the circular icon-badge treatment, the house style for a leading CTA.' } },
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
				label: 'Word lid',
				url: '/word-lid',
			},
			{
				label: 'Bekijk evenementen',
				url: '/evenementen',
				variant: 'secondary',
			},
		],
	},
};

// The hero's row: `badge` gives the primary action the circular icon-badge treatment, falling back
// to the arrow-up-right glyph when the action doesn't name an icon itself.
export const WithBadge: Story = {
	...Default,
	args: {
		...Default.args,
		badge: true,
	},
};

export const WithIcons: Story = {
	...Default,
	args: {
		actions: [
			{
				label: 'Bekijk agenda',
				url: '/evenementen',
				icon: 'calendar',
			},
			{
				label: 'Ontdek de community',
				url: '/community',
				variant: 'secondary',
				icon: 'arrow-up-right',
			},
		],
	},
};

export const DefaultVariant: Story = {
	...Default,
	args: {
		actions: [
			{
				label: 'Alle evenementen',
				url: '/evenementen',
			},
			{
				label: 'Over ons',
				url: '/community',
			},
		],
		defaultVariant: 'secondary',
	},
};
