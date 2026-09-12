'use client';

import { Toast } from '@base-ui/react/toast';

import type { NotificationProviderProps as NotificationProviderSchemaProps } from './NotificationProvider.schema';

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
