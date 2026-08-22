import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProofTicker from '@/components/contentBlocks/ProofTicker';
import { ProofTickerProps } from '@/lib/content/schema/blocks/proofTicker';

const meta: Meta<typeof ProofTicker> = {
	title: 'ContentBlocks/ProofTicker',
	component: ProofTicker,
	parameters: {
		docs: {
			description: {
				component:
					'A strip of short facts that carries the claim above it. Pure CSS, pauses under prefers-reduced-motion. Only facts that stay true between two builds belong here — anything that reads as a live measurement would be a number nothing can check.',
			},
		},
		jsonSchema: { schema: ProofTickerProps },
	},
};

export default meta;

type Story = StoryObj<typeof ProofTicker>;

export const Default: Story = {
	args: {
		items: [
			{ label: 'Sinds 2019' },
			{ label: '4.500+ leden' },
			{ label: '4 cons per jaar' },
			{ label: 'Gratis, altijd' },
			{ label: 'Nederlands & Vlaams' },
			{ label: 'Geen account nodig' },
		],
	},
};

export const WithIcons: Story = {
	args: {
		items: [
			{ label: 'Sinds 2019', icon: 'calendar' },
			{ label: '4 cons per jaar', icon: 'star' },
			{ label: 'Gratis, altijd', icon: 'heart' },
			{ label: 'Geen account nodig', icon: 'check' },
		],
		direction: 'right',
	},
};
