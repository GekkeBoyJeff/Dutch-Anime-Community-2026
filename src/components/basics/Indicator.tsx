import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { IndicatorProps } from '@/lib/content/schema/basics/indicator';

type Props = IndicatorProps & {
	/** The element the mark is attached to (Avatar, Icon, Button) */
	children?: ReactNode;
};

// Positions a small dot or count badge over its child (notification badge, online status). The child
// is the anchor; pair with a VisuallyHidden label on the host for an accessible count.
const Indicator = ({
	count,
	position = 'top-end',
	variant = 'primary',
	showZero = false,
	className,
	children,
	ref,
}: Props & { ref?: Ref<HTMLSpanElement> }) => {
	const hidden = count === 0 && !showZero;

	return (
		<span ref={ref} className={classNames('indicator-badge', `is-${position}`, `is-${variant}`, className)}>
			{children}
			{!hidden && (
				<span className={classNames('mark', count !== undefined && 'has-count')} aria-hidden="true">
					{count !== undefined && count}
				</span>
			)}
		</span>
	);
};

export default Indicator;
