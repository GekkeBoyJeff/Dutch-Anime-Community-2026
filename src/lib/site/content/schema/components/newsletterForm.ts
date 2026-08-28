import { z } from 'zod';

export const NewsletterFormProps = z
	.object({
		placeholder: z.string().optional().describe('Placeholder text shown inside the empty email field; defaults to \'you@example.com\''),
		ctaLabel: z.string().optional().describe('Visible label on the submit button; defaults to \'Subscribe\''),
		privacyText: z.string().optional().describe('Privacy note rendered below the field; may contain HTML (a privacy-policy link)'),
		successText: z.string().optional().describe('Message shown in place of the form after a successful signup; defaults to \'Thanks for subscribing!\''),
		endpoint: z.string().optional().describe('URL the form POSTs the { email } payload to; omit to no-op (e.g. in Storybook)'),
	})
	.meta({ title: 'NewsletterForm' });
export type NewsletterFormProps = z.infer<typeof NewsletterFormProps>;
