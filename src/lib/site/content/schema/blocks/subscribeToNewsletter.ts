import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const NewsletterSignup = z
	.object({
		email: z.email('Please enter a valid email address.').describe('Email address entered into the signup field'),
	})
	.meta({ title: 'NewsletterSignup' });
export type NewsletterSignup = z.infer<typeof NewsletterSignup>;

export const SubscribeToNewsletterProps = z.object({
	colorset: Colorset.optional(),
	heading: Heading.optional().describe('Heading cluster (tagline, title, intro) rendered above the form'),
	placeholder: z.string().optional().describe('Placeholder text shown inside the empty email field'),
	ctaLabel: z.string().optional().describe('Visible label on the submit button'),
	// Shown under the field; may contain HTML (a link to the privacy policy).
	privacyText: z.string().optional().describe('Privacy note rendered below the form'),
	successText: z.string().optional().describe('Message shown in place of the form after a successful signup'),
	endpoint: z.string().optional().describe('URL the form POSTs the { email } payload to'),
}).meta({ title: 'SubscribeToNewsletter' });
export type SubscribeToNewsletterProps = z.infer<typeof SubscribeToNewsletterProps>;

export const SubscribeToNewsletterBlock = SubscribeToNewsletterProps.extend({
	type: z.literal('subscribeNewsletter'),
	id: Id.optional(),
});
export type SubscribeToNewsletterBlock = z.infer<typeof SubscribeToNewsletterBlock>;
