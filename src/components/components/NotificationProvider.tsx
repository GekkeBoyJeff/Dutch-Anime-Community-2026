'use client';

import { Toast } from '@base-ui/react/toast';

import type { NotificationProviderProps as NotificationProviderSchemaProps } from '@/lib/site/content/schema/components/notificationProvider';

type NotificationProviderProps = NotificationProviderSchemaProps;

const NotificationProvider = ({
	timeout = 5000,
	limit = 3,
	children,
}: NotificationProviderProps) => {
	return (
		<Toast.Provider timeout={timeout} limit={limit}>
			{children}
		</Toast.Provider>
	);
};

export default NotificationProvider;
