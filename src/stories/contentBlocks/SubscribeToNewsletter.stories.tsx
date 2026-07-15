import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SubscribeToNewsletter from '@/components/contentBlocks/SubscribeToNewsletter';
import { SubscribeToNewsletterProps } from '@/lib/content/schema/blocks/subscribeNewsletter';

const meta: Meta<typeof SubscribeToNewsletter> = {
	title: 'ContentBlocks/SubscribeToNewsletter',
	component: SubscribeToNewsletter,
	parameters: {
		docs: {
			description: {
				component:
					'Newsletter signup section: a heading cluster and description with a form that validates the email inline (shared zod schema), submits to `endpoint` and swaps to a success state. Only the form is a client island. Submit with no endpoint to see the success state.',
			},
		},
		jsonSchema: { schema: SubscribeToNewsletterProps },
	},
	argTypes: {
		placeholder: { control: 'text' },
		ctaLabel: { control: 'text' },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof SubscribeToNewsletter>;

export const Default: Story = {
	args: {
		heading: { value: 'Blijf op de hoogte', tagline: 'Nieuwsbrief' },
		description:
			'Eén mailtje per maand met aankomende meetups, watch parties en waar je onze stand vindt op conventies als Dutch Comic Con en Abunai!. Geen spam, uitschrijven kan altijd.',
		placeholder: 'jij@voorbeeld.nl',
		ctaLabel: 'Aanmelden',
		privacyText: 'We gaan zorgvuldig om met je gegevens. Lees ons <a href="/privacy">privacybeleid</a>.',
		successText: 'Gelukt! Check je inbox om je aanmelding te bevestigen.',
	},
};

export const NoPrivacyNote: Story = {
	...Default,
	args: {
		...Default.args,
		privacyText: undefined,
	},
};
