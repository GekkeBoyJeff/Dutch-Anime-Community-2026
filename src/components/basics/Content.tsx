import parse from 'html-react-parser';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ContentProps as ContentSchemaProps } from '@/lib/content/schema/basics/content';

// Extends the common HTML attribute surface so any text element can become a Content without losing
// its `id` / `role` / `aria-*` (e.g. a NumberField error `<p role="alert" id=…>` or a live counter).
type ContentProps = ContentSchemaProps &
	Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'> & {
		/** Child content; takes precedence over value */
		children?: ReactNode;
	};

// Renders body copy with the body role — the one primitive for text, so a component never hand-rolls a
// bare <p>/<span> (that would skip the type scale). `size` swaps the responsive curve. Content always
// carries `.content` (the standard role); `standard` needs no class, `.is-small` / `.is-large` opt in.
const Content = ({
	element: Element = 'div',
	size = 'standard',
	className,
	value,
	children,
	ref,
	...rest
}: ContentProps & { ref?: Ref<HTMLElement> }) => {
	const Tag = Element as React.ElementType;

	return (
		<Tag ref={ref} className={classNames('content', size !== 'standard' && `is-${size}`, className)} {...rest}>
			{children ? children : value && parse(value)}
		</Tag>
	);
};

export default Content;
