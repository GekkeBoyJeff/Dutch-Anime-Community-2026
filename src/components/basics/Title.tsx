import parse from 'html-react-parser';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { TitleProps as TitleSchemaProps } from '@/lib/content/schema/basics/title';

type TitleProps = TitleSchemaProps & {
	/** Child content; takes precedence over value */
	children?: ReactNode;
};

// Picks the semantic tag (h1–h6 when `element` is omitted) and the responsive type role via the
// .title.is-N class. Because the class — not the tag — drives the type, size and level decouple.
const Title = ({
	element,
	size = 2,
	className,
	value,
	children,
	ref,
}: TitleProps & { ref?: Ref<HTMLElement> }) => {
	const Element = (element || `h${size}`) as React.ElementType;

	return (
		<Element ref={ref} className={classNames('title', `is-${size}`, className)}>
			{children ? children : value && parse(value)}
		</Element>
	);
};

export default Title;
