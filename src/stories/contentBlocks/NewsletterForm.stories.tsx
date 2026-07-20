import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';

import NewsletterForm from '@/components/contentBlocks/NewsletterForm';

const meta: Meta<typeof NewsletterForm> = {
	title: 'ContentBlocks/NewsletterForm',
	component: NewsletterForm,
	parameters: {
		docs: {
			description: {
				component:
					'The interactive island for SubscribeToNewsletter: the shared Form shell (react-hook-form + the NewsletterSignup zod schema) around a TextInput and submit button, with a local success/error status swap. With no `endpoint` it treats a submit as a successful no-op, so the success state is demonstrable in isolation.',
			},
		},
	},
	argTypes: {
		placeholder: { control: 'text' },
		ctaLabel: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof NewsletterForm>;

export const Default: Story = {
	args: {
		ctaLabel: 'Inschrijven',
		placeholder: 'jij@voorbeeld.nl',
		privacyText: 'We mailen alleen over events. Uitschrijven kan altijd.',
	},
};

export const Success: Story = {
	args: {
		ctaLabel: 'Inschrijven',
		successText: 'Bedankt voor je inschrijving!',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(canvas.getByRole('textbox'), 'jij@voorbeeld.nl');
		await userEvent.click(canvas.getByRole('button'));
	},
};

export const Error: Story = {
	args: {
		ctaLabel: 'Inschrijven',
		endpoint: 'https://invalid.invalid/subscribe',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(canvas.getByRole('textbox'), 'jij@voorbeeld.nl');
		await userEvent.click(canvas.getByRole('button'));
	},
};

export const ValidationError: Story = {
	name: 'Validation error',
	args: {
		ctaLabel: 'Inschrijven',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(canvas.getByRole('textbox'), 'geen-email');
		await userEvent.click(canvas.getByRole('button'));
	},
};
