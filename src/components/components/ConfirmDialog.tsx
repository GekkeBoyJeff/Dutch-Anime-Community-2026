'use client';

import Button from '@/components/basics/Button';
import Modal from '@/components/components/Modal';

type ConfirmDialogProps = {
	/** Controlled open state */
	open: boolean;
	/** Fires when the dialog requests to open or close (Escape, Cancel, or your own close) */
	onOpenChange: (open: boolean) => void;
	/** Visible heading */
	title?: string;
	/** Accessible name when there is no visible title; if that is omitted too, confirmLabel is used so
	 * the alertdialog is never nameless */
	label?: string;
	/** Supporting line under the title */
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Style the confirm button as destructive (red) */
	destructive?: boolean;
	/** Runs on confirm; the dialog does NOT auto-close — close via onOpenChange in your handler so it
	 * can stay open on error */
	onConfirm: () => void;
	/** Runs when the user dismisses the dialog (Cancel button or Escape), before it closes */
	onCancel?: () => void;
};

// A confirm/cancel dialog on Modal variant='alert' (role=alertdialog, never light-dismisses, so a
// destructive action cannot be lost to a stray backdrop click). Modal owns no confirm/cancel/close, so
// this composes the footer buttons and routes every dismissal (Cancel button + Escape) through one
// handler, so onCancel fires consistently. Confirm is consumer-driven (onConfirm), so it never counts
// as a cancel. Button has no danger variant, so destructive styling comes from the is-danger class.
const ConfirmDialog = ({
	open,
	onOpenChange,
	title,
	label,
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
			label={label ?? (title ? undefined : confirmLabel)}
			description={description}
			footer={
				<>
					<Button variant="secondary" onClick={dismiss}>
						{cancelLabel}
					</Button>
					<Button variant="primary" className={destructive ? 'is-danger' : undefined} onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</>
			}
		/>
	);
};

export default ConfirmDialog;
