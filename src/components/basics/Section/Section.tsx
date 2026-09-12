import type { ComponentPropsWithoutRef, ElementType } from 'react';

import { classNames } from '@/lib/shared/classNames';

import type { SectionProps as SectionSchemaProps } from './Section.schema';

import './Section.scss';

type SectionProps = SectionSchemaProps;

const Section = ({
	element = 'section',
	colorset,
	className,
	children,
	...rest
}: SectionProps) => {
	const Tag = element as ElementType;

	return (
		<Tag
			className={classNames('section', className)}
			data-colorset={colorset}
			{...rest}
		>
			{children}
		</Tag>
	);
};

export default Section;
