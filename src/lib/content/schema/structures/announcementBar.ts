import { z } from 'zod';

import { Action } from '@/lib/content/schema/primitives';

export const AnnouncementVariant = z.enum(['info', 'success', 'warning', 'accent']).meta({ title: 'AnnouncementVariant' });
export type AnnouncementVariant = z.infer<typeof AnnouncementVariant>;

export const AnnouncementBarProps = z
	.object({
		message: z.string().min(1).describe('The banner message; plain text'),
		cta: Action.optional().describe('Optional trailing call-to-action link'),
		dismissible: z.boolean().optional().describe('Whether the banner can be closed'),
		variant: AnnouncementVariant.optional().describe('Visual variant; tints the bar via the status tokens'),
		id: z.string().optional().describe('Stable id; the dismissal is remembered per id so a changed message shows again'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'AnnouncementBar' });
export type AnnouncementBarProps = z.infer<typeof AnnouncementBarProps>;
