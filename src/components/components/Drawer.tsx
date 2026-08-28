'use client';

import { Dialog } from '@base-ui/react/dialog';

import { classNames } from '@/lib/shared/classNames';
import type { DrawerProps as DrawerSchemaProps } from '@/lib/site/content/schema/components/drawer';

type DrawerProps = DrawerSchemaProps;

const Drawer = ({
	open,
	defaultOpen,
	onOpenChange,
	position = 'right',
	title,
	description,
	ariaLabel,
	size = '22rem',
	dismissible = true,
	trigger,
	header,
	footer,
	className,
	children,
}: DrawerProps) => {
	return (
		<Dialog.Root
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			disablePointerDismissal={!dismissible}
		>
			{trigger && <Dialog.Trigger render={trigger as React.ReactElement} />}

			<Dialog.Portal>
				<Dialog.Backdrop className="drawer-backdrop" />

				<Dialog.Popup
					className={classNames('drawer', `is-${position}`, className)}
					style={{ '--drawer-size': size } as React.CSSProperties}
					aria-label={!title ? ariaLabel : undefined}
				>
					{header ?? (
						<div className="drawer-head">
							{title && <Dialog.Title className="drawer-title">{title}</Dialog.Title>}
							{description && <Dialog.Description className="drawer-description">{description}</Dialog.Description>}
						</div>
					)}

					{children && <div className="drawer-body">{children}</div>}

					{footer && <div className="drawer-footer">{footer}</div>}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default Drawer;
