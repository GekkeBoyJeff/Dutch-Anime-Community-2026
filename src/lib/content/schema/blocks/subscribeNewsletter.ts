import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

// The single source of truth for a newsletter signup payload — shared by the client island (inline
// validation) and any server handler the endpoint points at, so both validate identically.
export const NewsletterSignup = z
	.object({
		email: z.email('Please enter a valid email address.').describe('Email address entered into the signup field'),
	})
	.meta({ title: 'NewsletterSignup' });
export type NewsletterSignup = z.infer<typeof NewsletterSignup>;

// A newsletter signup section: a heading cluster, an email field with inline validation, a submit
// button, optional privacy note and a success state. `endpoint` is where the form POSTs.
export const SubscribeToNewsletterProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	heading: Heading.optional().describe('Heading cluster (tagline, title, intro) rendered above the form'),
	description: z.string().optional().describe('Supporting intro text rendered below the heading'),
	placeholder: z.string().optional().describe('Placeholder text shown inside the empty email field'),
	ctaLabel: z.string().optional().describe('Visible label on the submit button'),
	// Shown under the field; may contain HTML (a link to the privacy policy).
	privacyText: z.string().optional().describe('Privacy note rendered below the form'),
	successText: z.string().optional().describe('Message shown in place of the form after a successful signup'),
	endpoint: z.string().optional().describe('URL the form POSTs the { email } payload to'),
}).meta({ title: 'SubscribeToNewsletter' });
export type SubscribeToNewsletterProps = z.infer<typeof SubscribeToNewsletterProps>;

// The block adds the keys Blocks strips before spreading into props (`type` selects the
// component, `id` becomes the React key).
export const SubscribeToNewsletterBlock = SubscribeToNewsletterProps.extend({
	type: z.literal('subscribeNewsletter'),
	id: Id.optional(),
});
export type SubscribeToNewsletterBlock = z.infer<typeof SubscribeToNewsletterBlock>;
