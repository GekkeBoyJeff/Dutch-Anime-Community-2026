'use client';

import Button from '@/components/basics/Button';
import Modal from '@/components/components/Modal';
import type { ConfirmDialogProps as ConfirmDialogSchemaProps } from '@/lib/site/content/schema/components/confirmDialog';

type ConfirmDialogProps = ConfirmDialogSchemaProps;

const ConfirmDialog = ({
	open,
	onOpenChange,
	title,
	ariaLabel,
	description,
	confirmLabel = 'Bevestigen',
	cancelLabel = 'Annuleren',
	destructive = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) => {
	const dismiss = () => {
		onCancel?.();
		onOpenChange(false);
	};

	return (
		<Modal
			variant="alert"
			size="s"
			open={open}
			// Base UI fires this only for user-initiated changes (Escape); a controlled close from the
			// parent after confirm does not, so onCancel never double-fires on a successful confirm.
			onOpenChange={(next) => (next ? onOpenChange(true) : dismiss())}
			title={title}
			ariaLabel={ariaLabel ?? (title ? undefined : confirmLabel)}
			description={description}
			footer={
				<>
					<Button variant="secondary" value={cancelLabel} onClick={dismiss} />
					<Button variant="primary" value={confirmLabel} className={destructive ? 'is-danger' : undefined} onClick={onConfirm} />
				</>
			}
		/>
	);
};

export default ConfirmDialog;
