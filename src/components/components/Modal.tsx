'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ModalProps as ModalSchemaProps } from '@/lib/content/schema/components/modal';

type ModalProps = ModalSchemaProps & {
	/** Fires whenever the modal opens or closes */
	onOpenChange?: (open: boolean) => void;
	/** Element that opens the modal (rendered as the Base UI trigger) */
	trigger?: ReactNode;
	/** Content above the body (replaces the default title/description block) */
	header?: ReactNode;
	/** The pinned action row at the bottom */
	footer?: ReactNode;
	/** The dialog body */
	children?: ReactNode;
};

// Thin SCSS-styled wrapper over Base UI's Dialog (focus trap, scroll lock, focus restore, aria-modal
// and inert background come free). `variant="alert"` swaps Dialog -> AlertDialog (same anatomy,
// role=alertdialog, never light-dismisses) so AlertDialog is a variant, not a new component.
const Modal = ({
	open,
	defaultOpen,
	onOpenChange,
	title,
	description,
	label,
	variant = 'modal',
	size = 'm',
	dismissible = true,
	trigger,
	header,
	footer,
	className,
	children,
	ref,
}: ModalProps & { ref?: Ref<HTMLDivElement> }) => {
	const isAlert = variant === 'alert';

	// Pick the matching part set up front; both share the same anatomy.
	const Root = isAlert ? AlertDialog.Root : Dialog.Root;
	const Trigger = isAlert ? AlertDialog.Trigger : Dialog.Trigger;
	const Portal = isAlert ? AlertDialog.Portal : Dialog.Portal;
	const Backdrop = isAlert ? AlertDialog.Backdrop : Dialog.Backdrop;
	const Popup = isAlert ? AlertDialog.Popup : Dialog.Popup;
	const TitlePart = isAlert ? AlertDialog.Title : Dialog.Title;
	const DescriptionPart = isAlert ? AlertDialog.Description : Dialog.Description;

	return (
		<Root
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			// AlertDialog must never light-dismiss; only block pointer dismissal for the plain modal.
			disablePointerDismissal={isAlert ? undefined : !dismissible}
		>
			{trigger && <Trigger render={trigger as React.ReactElement} />}

			<Portal>
				<Backdrop className="modal-backdrop" />

				<Popup
					ref={ref}
					className={classNames('modal', `is-${size}`, className)}
					aria-label={!title ? label : undefined}
				>
					{header ?? (
						<div className="modal-head">
							{title && <TitlePart className="modal-title">{title}</TitlePart>}
							{description && <DescriptionPart className="modal-description">{description}</DescriptionPart>}
						</div>
					)}

					{children && <div className="modal-body">{children}</div>}

					{footer && <div className="modal-footer">{footer}</div>}
				</Popup>
			</Portal>
		</Root>
	);
};

export default Modal;
