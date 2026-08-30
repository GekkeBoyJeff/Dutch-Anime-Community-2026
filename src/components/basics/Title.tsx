import parse from 'html-react-parser';

import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { TitleProps as TitleSchemaProps } from '@/lib/site/content/schema/basics/title';

type TitleProps = TitleSchemaProps;

const Title = ({
	element,
	size = 2,
	className,
	value,
	href,
	linkClassName,
	id,
}: TitleProps) => {
	const Element = (element || `h${size}`) as React.ElementType;
	const content = value && parse(value);

	return (
		<Element className={classNames('title', `is-${size}`, className)} id={id}>
			{href ? (
				<Interactive url={href} className={linkClassName}>
					{content}
				</Interactive>
			) : (
				content
			)}
		</Element>
	);
};

export default Title;
