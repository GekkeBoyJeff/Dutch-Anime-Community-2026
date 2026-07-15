'use client';

import { Dialog } from '@base-ui/react/dialog';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { DrawerProps as DrawerSchemaProps } from '@/lib/content/schema/components/drawer';

type DrawerProps = DrawerSchemaProps & {
	/** Fires whenever the drawer opens or closes */
	onOpenChange?: (open: boolean) => void;
	/** Element that opens the drawer (rendered as the Base UI trigger) */
	trigger?: ReactNode;
	/** Content above the body (replaces the default title/description block) */
	header?: ReactNode;
	/** The pinned action row at the bottom */
	footer?: ReactNode;
	/** The drawer body */
	children?: ReactNode;
};

// Side/bottom slide-in panel over Base UI's Dialog parts (focus trap, scroll lock, focus restore and
// aria-modal come free). The slide direction is `position` (a CSS class); `size` sets --drawer-size.
// Enter/exit transitions hang off the [data-starting-style]/[data-ending-style] popup attributes.
const Drawer = ({
	open,
	defaultOpen,
	onOpenChange,
	position = 'right',
	title,
	description,
	label,
	size = '22rem',
	dismissible = true,
	trigger,
	header,
	footer,
	className,
	children,
	ref,
}: DrawerProps & { ref?: Ref<HTMLDivElement> }) => {
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
					ref={ref}
					className={classNames('drawer', `is-${position}`, className)}
					style={{ '--drawer-size': size } as React.CSSProperties}
					aria-label={!title ? label : undefined}
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
