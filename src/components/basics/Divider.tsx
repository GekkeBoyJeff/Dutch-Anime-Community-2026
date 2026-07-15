import type { Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { DividerProps as DividerSchemaProps } from '@/lib/content/schema/basics/divider';

type DividerProps = DividerSchemaProps;

// A separator with role="separator" and aria-orientation — a meaningful thematic break (like <hr>),
// so it stays in the accessibility tree rather than being aria-hidden. A horizontal divider may carry
// a centered label, which is exposed as the separator's accessible name (aria-label) so assistive tech
// announces the extra context; a vertical one stretches inside a flex/inline row.
const Divider = ({
	orientation = 'horizontal',
	label,
	className,
	ref,
}: DividerProps & { ref?: Ref<HTMLDivElement> }) => {
	const hasLabel = Boolean(label) && orientation === 'horizontal';

	return (
		<div
			ref={ref}
			role="separator"
			aria-orientation={orientation}
			aria-label={hasLabel ? label : undefined}
			className={classNames('divider', `is-${orientation}`, hasLabel && 'has-label', className)}
		>
			{hasLabel && (
				<span className="label" aria-hidden="true">
					{label}
				</span>
			)}
		</div>
	);
};

export default Divider;
