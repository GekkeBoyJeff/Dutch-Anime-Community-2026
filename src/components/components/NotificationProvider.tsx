'use client';

import { Toast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';

import type { NotificationProviderProps as NotificationProviderSchemaProps } from '@/lib/content/schema/components/notificationProvider';

type NotificationProviderProps = NotificationProviderSchemaProps & {
	/** The app subtree that can push and read toasts */
	children?: ReactNode;
};

// Wrap the app (e.g. in layout) once so any client component beneath it can call
// `Toast.useToastManager().add(...)` to push a toast imperatively, and the Notification outlet can
// render the live stack. Owns nothing visual — the styled surface lives in Notification.
const NotificationProvider = ({ timeout = 5000, limit = 3, children }: NotificationProviderProps) => {
	return (
		<Toast.Provider timeout={timeout} limit={limit}>
			{children}
		</Toast.Provider>
	);
};

export default NotificationProvider;
