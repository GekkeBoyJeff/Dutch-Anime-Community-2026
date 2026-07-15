import type { Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import type { InteractiveProps, InteractiveRef } from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { PillProps as PillSchemaProps } from '@/lib/content/schema/basics/pill';

// Intersect with Interactive's TS type so the non-serializable extras (onClick, children, HTML
// passthrough) keep flowing through the ...rest spread; the schema owns only the data props.
type PillProps = PillSchemaProps & InteractiveProps;

// Compact, rounded variant of a clickable element (tags, filters), built on Interactive.
const Pill = ({
	active = false,
	className,
	children,
	ref,
	...rest
}: PillProps & { ref?: Ref<InteractiveRef> }) => {
	// Selected state belongs in the a11y tree, not only the colour. aria-pressed is valid only on a
	// button, so emit it only when this pill is a button (no url); a link pill conveys "current" via the
	// caller's own aria-current. The caller can still override by passing aria-pressed/aria-current.
	const ariaPressed = rest.url ? undefined : active;

	return (
		<Interactive ref={ref} className={classNames('pill', active && 'is-active', className)} aria-pressed={ariaPressed} {...rest}>
			{children}
		</Interactive>
	);
};

export default Pill;
