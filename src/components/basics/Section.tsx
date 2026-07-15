import type { ComponentPropsWithoutRef, ElementType, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { SectionProps as SectionSchemaProps } from '@/lib/content/schema/basics/section';

type SectionProps = SectionSchemaProps & ComponentPropsWithoutRef<'section'>;

// Carries the colorset attribute, so everything beneath it adapts without a colour prop. An
// omitted colorset is left off the element, so it inherits from an ancestor instead.
const Section = ({
	element = 'section',
	colorset,
	className,
	children,
	ref,
	...rest
}: SectionProps & { ref?: Ref<HTMLElement> }) => {
	const Tag = element as ElementType;

	return (
		<Tag
			ref={ref}
			className={classNames('section', className)}
			data-colorset={colorset}
			data-reveal=""
			{...rest}
		>
			{children}
		</Tag>
	);
};

export default Section;
