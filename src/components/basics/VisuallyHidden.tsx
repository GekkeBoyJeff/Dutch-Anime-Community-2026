import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { VisuallyHiddenProps as VisuallyHiddenSchemaProps } from '@/lib/content/schema/basics/visuallyHidden';

type VisuallyHiddenProps = VisuallyHiddenSchemaProps &
	Omit<ComponentPropsWithoutRef<'span'>, 'className'> & {
		element?: ElementType;
	};

// Keeps content in the accessibility tree but out of sight — icon-button labels, skip links,
// live-region text. The global `.sr-only` utility does the hiding; this is the typed wrapper.
const VisuallyHidden = ({
	element: Tag = 'span',
	className,
	children,
	ref,
	...rest
}: VisuallyHiddenProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Tag ref={ref} className={classNames('sr-only', className)} {...rest}>
			{children}
		</Tag>
	);
};

export default VisuallyHidden;
