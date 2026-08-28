'use client';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';

import { classNames } from '@/lib/shared/classNames';
import type { ModalProps as ModalSchemaProps } from '@/lib/site/content/schema/components/modal';

type ModalProps = ModalSchemaProps;

const Modal = ({
	open,
	defaultOpen,
	onOpenChange,
	title,
	description,
	ariaLabel,
	variant = 'modal',
	size = 'm',
	dismissible = true,
	trigger,
	header,
	footer,
	className,
	children,
}: ModalProps) => {
	const isAlert = variant === 'alert';

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
					className={classNames('modal', `is-${size}`, className)}
					aria-label={!title ? ariaLabel : undefined}
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
