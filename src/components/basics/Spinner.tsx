import type { Ref } from 'react';

import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/classNames';
import type { SpinnerProps } from '@/lib/content/schema/basics/spinner';

// Inline async indicator (CSS-only, no JS). role="status" + an sr-only label announce the loading
// state; the spin is gated by prefers-reduced-motion in the stylesheet.
const Spinner = ({
	size = 'm',
	label = 'Loading',
	className,
	ref,
}: SpinnerProps & { ref?: Ref<HTMLSpanElement> }) => {
	return (
		<span ref={ref} role="status" className={classNames('spinner', `is-${size}`, className)}>
			<span className="ring" aria-hidden="true" />
			<VisuallyHidden>{label}</VisuallyHidden>
		</span>
	);
};

export default Spinner;
