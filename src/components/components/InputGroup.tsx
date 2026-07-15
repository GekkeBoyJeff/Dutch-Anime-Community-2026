import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { InputGroupProps as InputGroupSchemaProps } from '@/lib/content/schema/components/inputGroup';

type InputGroupProps = InputGroupSchemaProps & {
	/** Addon shown before the control: an icon, a currency/prefix, or a button */
	leading?: ReactNode;
	/** Addon shown after the control: a clear/reveal button, a unit suffix, or a button */
	trailing?: ReactNode;
	/** The input/select control to wrap (e.g. a TextInput) */
	children?: ReactNode;
};

// Wraps a single control with leading and/or trailing addons in one bordered shell, so the icon,
// prefix or inline button sits visually inside the field. This is the composition pattern that
// covers a search field (trailing clear button), a password field (trailing reveal toggle) and a
// currency input (leading symbol) without a separate component for each. The control keeps its own
// id/name/aria wiring (e.g. from a Field) — the group only paints the surround and shares the
// focus ring via :focus-within. Stays a Server Component; any interactive addon is its own island.
const InputGroup = ({
	leading,
	trailing,
	disabled = false,
	invalid = false,
	className,
	children,
	ref,
}: InputGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<div
			ref={ref}
			className={classNames('input-group', invalid && 'is-invalid', className)}
			data-disabled={disabled || undefined}
		>
			{leading && (
				<span className="addon is-leading" aria-hidden={typeof leading === 'string' || undefined}>
					{leading}
				</span>
			)}
			<span className="control">{children}</span>
			{trailing && (
				<span className="addon is-trailing" aria-hidden={typeof trailing === 'string' || undefined}>
					{trailing}
				</span>
			)}
		</div>
	);
};

export default InputGroup;
