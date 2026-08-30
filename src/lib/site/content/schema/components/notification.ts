import { z } from 'zod';

export const NotificationProps = z
	.object({
		position: z
			.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'])
			.optional()
			.describe('Where the toast stack sits on screen; defaults to \'bottom-right\''),
		closeLabel: z.string().optional().describe('Accessible label for each toast\'s close button; defaults to \'Close\''),
		className: z.string().optional().describe('Additional classes on the viewport'),
	})
	.meta({ title: 'Notification' });
export type NotificationProps = z.infer<typeof NotificationProps>;
