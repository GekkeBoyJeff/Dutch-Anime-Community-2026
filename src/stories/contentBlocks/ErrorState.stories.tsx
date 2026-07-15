import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ErrorState from '@/components/contentBlocks/ErrorState';

const meta: Meta<typeof ErrorState> = {
	title: 'ContentBlocks/ErrorState',
	component: ErrorState,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Presentational 404 / error / maintenance block to fill Next.js not-found.tsx and error.tsx. A Server Component composing Section + Title/Content + Button.',
			},
		},
	},
	argTypes: {
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof ErrorState>;

export const NotFound: Story = {
	args: {
		code: '404',
		title: 'Pagina niet gevonden',
		message: 'De pagina die je zocht bestaat niet (meer). Controleer de URL of ga terug naar de homepagina.',
		actions: [
			{ label: 'Terug naar home', url: '/', variant: 'primary' },
			{ label: 'Neem contact op', url: '/contact', variant: 'ghost' },
		],
	},
};

export const ServerError: Story = {
	...NotFound,
	args: {
		...NotFound.args,
		code: '500',
		title: 'Er ging iets mis',
		message: 'Onze server kon je verzoek niet verwerken. Probeer het zo nog eens.',
		actions: [{ label: 'Probeer opnieuw' }],
	},
};

export const Maintenance: Story = {
	...NotFound,
	args: {
		...NotFound.args,
		code: undefined,
		icon: 'settings',
		title: 'We zijn even offline',
		message: 'We voeren onderhoud uit en zijn snel weer terug. Bedankt voor je geduld.',
		actions: [],
	},
};
