'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';

import AccordionItem from '@/components/basics/AccordionItem';
import { classNames } from '@/lib/shared/classNames';
import type { AccordionProps as AccordionSchemaProps } from '@/lib/site/content/schema/basics/accordion';

type AccordionProps = AccordionSchemaProps;

const Accordion = ({
	defaultOpen,
	multiple = false,
	disabled = false,
	items,
	headingLevel = 3,
	className,
}: AccordionProps) => {
	return (
		<BaseAccordion.Root
			className={classNames('accordion', className)}
			defaultValue={defaultOpen}
			multiple={multiple}
			disabled={disabled}
		>
			{items.map((item) => (
				<AccordionItem key={item.id} {...item} headingLevel={headingLevel} />
			))}
		</BaseAccordion.Root>
	);
};

export default Accordion;
