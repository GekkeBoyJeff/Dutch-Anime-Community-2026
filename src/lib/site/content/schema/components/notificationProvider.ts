import type { ReactNode } from 'react';
import { z } from 'zod';

export const NotificationProviderProps = z
	.object({
		timeout: z.number().optional().describe('Default time (ms) before a toast auto-dismisses; 0 keeps it open; defaults to 5000'),
		limit: z.number().optional().describe('How many toasts show at once before the oldest are marked limited; defaults to 3'),
		children: z.custom<ReactNode>().optional().describe('The app subtree that can push and read toasts'),
	})
	.meta({ title: 'NotificationProvider' });
export type NotificationProviderProps = z.infer<typeof NotificationProviderProps>;
