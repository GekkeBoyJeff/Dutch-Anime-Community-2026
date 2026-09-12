'use client';

import { Toast } from '@base-ui/react/toast';

import Interactive from '@/components/basics/Interactive/Interactive';
import { classNames } from '@/lib/shared/classNames';

import type { NotificationProps as NotificationSchemaProps } from './Notification.schema';

import './Notification.scss';

export type NotificationPosition = NotificationSchemaProps['position'];

type NotificationProps = NotificationSchemaProps;

const Notification = ({
	position = 'bottom-right',
	closeLabel = 'Close',
	className,
}: NotificationProps) => {
	const { toasts } = Toast.useToastManager();

	return (
		<Toast.Portal>
			<Toast.Viewport className={classNames('notification', className)} data-position={position}>
				{toasts.map((toast) => (
					<Toast.Root key={toast.id} toast={toast} className="notification-toast" data-type={toast.type}>
						<div className="notification-body">
							{toast.title && <Toast.Title className="title" />}
							{toast.description && <Toast.Description className="notification-description" />}
						</div>

						<Toast.Close
							render={
								<Interactive className="notification-close" ariaLabel={closeLabel}>
									&times;
								</Interactive>
							}
						/>
					</Toast.Root>
				))}
			</Toast.Viewport>
		</Toast.Portal>
	);
};

export default Notification;
