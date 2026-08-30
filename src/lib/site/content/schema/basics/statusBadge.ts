import { z } from 'zod';

export const StatusDomain = z.enum(['warning', 'expense', 'attendance', 'request', 'survey']).meta({ title: 'StatusDomain' });
export type StatusDomain = z.infer<typeof StatusDomain>;

export const StatusBadgeProps = z
	.object({
		domain: StatusDomain.describe('The domain namespace the status key belongs to'),
		status: z.string().min(1).describe('The status key within the domain; an unknown key renders neutral with the key itself as label'),
		label: z.string().optional().describe('Overrides the label derived from domain + status'),
		dot: z.boolean().optional().describe('Shows a small leading status dot, so meaning is not colour-only; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'StatusBadge' });
export type StatusBadgeProps = z.infer<typeof StatusBadgeProps>;
