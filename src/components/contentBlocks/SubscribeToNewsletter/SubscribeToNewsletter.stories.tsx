import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SubscribeToNewsletter from './SubscribeToNewsletter';
import { SubscribeToNewsletterProps } from './SubscribeToNewsletter.schema';

const meta: Meta<typeof SubscribeToNewsletter> = {
	title: 'ContentBlocks/SubscribeToNewsletter',
	component: SubscribeToNewsletter,
	parameters: {
		docs: {
			description: {
				component:
					'Newsletter signup section: a heading cluster with a form that validates the email inline (shared zod schema), submits to `endpoint` and swaps to a success state. Only the form is a client island. Submit with no endpoint to see the success state.',
			},
		},
		jsonSchema: { schema: SubscribeToNewsletterProps },
	},
};

export default meta;

type Story = StoryObj<typeof SubscribeToNewsletter>;

export const Default: Story = {
	args: {
		heading: {
			title: 'Blijf op de hoogte',
			tagline: 'Nieuwsbrief',
			intro: 'Eén mailtje per maand met aankomende meetups, watch parties en waar je onze stand vindt op conventies als Dutch Comic Con en Abunai!. Geen spam, uitschrijven kan altijd.',
		},
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
