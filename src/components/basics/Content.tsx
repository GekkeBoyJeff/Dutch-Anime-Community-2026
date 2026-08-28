import parse from 'html-react-parser';

import { classNames } from '@/lib/shared/classNames';
import { sanitizeHtml } from '@/lib/shared/sanitize';
import type { ContentProps as ContentSchemaProps } from '@/lib/site/content/schema/basics/content';

type ContentProps = ContentSchemaProps;

const Content = ({
	element: Element = 'div',
	size = 'standard',
	className,
	value,
	id,
	role,
	ariaCurrent,
	style,
}: ContentProps) => {
	const Tag = Element as React.ElementType;

	return (
		<Tag className={classNames('content', size !== 'standard' && `is-${size}`, className)} id={id} role={role} aria-current={ariaCurrent} style={style}>
			{value && parse(sanitizeHtml(value))}
		</Tag>
	);
};

export default Content;
