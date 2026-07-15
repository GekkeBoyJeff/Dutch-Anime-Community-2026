'use client';

import { Toast } from '@base-ui/react/toast';
import type { Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { NotificationProps as NotificationSchemaProps } from '@/lib/content/schema/components/notification';

export type NotificationPosition = NotificationSchemaProps['position'];

type NotificationProps = NotificationSchemaProps;

// The toast stack. Reads the live toasts from the surrounding Toast.Provider and maps each to a
// styled surface. Position is a data-attribute the SCSS reads, so placement is a CSS concern and the
// markup stays the same everywhere.
const Notification = ({ position = 'bottom-right', closeLabel = 'Close', className, ref }: NotificationProps & { ref?: Ref<HTMLDivElement> }) => {
	const { toasts } = Toast.useToastManager();

	return (
		<Toast.Portal>
			<Toast.Viewport ref={ref} className={classNames('notification', className)} data-position={position}>
				{toasts.map((toast) => (
					<Toast.Root key={toast.id} toast={toast} className="toast" data-type={toast.type}>
						<div className="body">
							{toast.title && <Toast.Title className="title" />}
							{toast.description && <Toast.Description className="description" />}
						</div>

						<Toast.Close
							render={
								<Interactive className="close" aria-label={closeLabel}>
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
