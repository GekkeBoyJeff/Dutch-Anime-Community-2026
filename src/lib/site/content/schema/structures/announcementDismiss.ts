import { z } from 'zod';

import { Action } from '@/lib/site/content/schema/basics/actions';
import { AnnouncementVariant } from '@/lib/site/content/schema/structures/announcementBar';

export const AnnouncementDismissProps = z
	.object({
		message: z.string().min(1).describe('The banner message; plain text'),
		cta: Action.optional().describe('Optional trailing call-to-action link'),
		variant: AnnouncementVariant.optional().describe('Visual variant; tints the bar via the status tokens; defaults to \'info\''),
		dismissible: z.boolean().optional().describe('Whether the close button is shown; defaults to true'),
		id: z.string().optional().describe('Stable id; remembers the dismissal in localStorage under this key'),
		onDismiss: z.custom<() => void>().optional().describe('Fires once the banner has finished closing and unmounted itself'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'AnnouncementDismiss' });
export type AnnouncementDismissProps = z.infer<typeof AnnouncementDismissProps>;
