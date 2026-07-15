import { z } from 'zod';

// Props for the NotificationProvider component: wraps the app subtree so any client component
// beneath it can push toasts, and the Notification outlet can render the live stack.
export const NotificationProviderProps = z
	.object({
		timeout: z.number().optional().describe('Default time (ms) before a toast auto-dismisses; 0 keeps it open; defaults to 5000'),
		limit: z.number().optional().describe('How many toasts show at once before the oldest are marked limited; defaults to 3'),
	})
	.meta({ title: 'NotificationProvider' });
export type NotificationProviderProps = z.infer<typeof NotificationProviderProps>;
