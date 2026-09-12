import type { ReactNode } from 'react';
import { z } from 'zod';

export const PersonStatus = z.enum(['online', 'busy', 'away', 'offline']).meta({ title: 'PersonStatus' });
export type PersonStatus = z.infer<typeof PersonStatus>;

export const PersonProps = z
	.object({
		name: z.string().min(1).describe('The person\'s name, on the first line'),
		role: z.string().optional().describe('Role or function, shown under the name'),
		avatarUrl: z.string().nullable().optional().describe('Portrait URL; null or omitted falls back to the initials'),
		initials: z.string().optional().describe('Avatar fallback; defaults to the first two letters of `name`'),
		status: PersonStatus.optional().describe('Presence dot on the avatar; omit when presence is not tracked'),
		trailing: z.custom<ReactNode>().optional().describe('Content pinned to the end of the row (a value, a badge, an action)'),
		href: z.string().optional().describe('Destination the whole row links to; omit to render it unlinked'),
		onClick: z.custom<() => void>().optional().describe('Fires when the row is activated'),
		chevron: z.boolean().optional().describe('Shows a chevron at the end of the row when it leads somewhere'),
		loading: z.boolean().optional().describe('Renders skeletons in place of the text while the data loads; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Person' });
export type PersonProps = z.infer<typeof PersonProps>;
