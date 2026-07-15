'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ReactNode, Ref } from 'react';

import AccordionItem from '@/components/basics/AccordionItem';
import type { AccordionItemProps } from '@/components/basics/AccordionItem';
import { classNames } from '@/lib/classNames';
import type { AccordionProps as AccordionSchemaProps } from '@/lib/content/schema/basics/accordion';

type AccordionProps = AccordionSchemaProps & {
	/** Data-driven items, so a Server page can render from validated content (adds `content`, TS-only) */
	items?: Array<Pick<AccordionItemProps, 'value' | 'title' | 'content' | 'disabled' | 'icon'>>;
	/** Fires with the next open set whenever it changes */
	onValueChange?: (value: string[]) => void;
	/** AccordionItem children (alternative to `items`) */
	children?: ReactNode;
};

// A collapsible disclosure group built from AccordionItem. Pass `items` for the common data-driven
// case (a Server page stays a Server Component while only this subtree is the island), or compose
// <AccordionItem> children by hand. Wraps Base UI Accordion: keyboard/ARIA/id-linkage + height
// measurement come for free.
const Accordion = ({
	value,
	defaultValue,
	multiple = false,
	disabled = false,
	orientation = 'vertical',
	items,
	headingLevel = 3,
	onValueChange,
	className,
	children,
	ref,
}: AccordionProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseAccordion.Root
			ref={ref}
			className={classNames('accordion', className)}
			value={value}
			defaultValue={defaultValue}
			multiple={multiple}
			disabled={disabled}
			orientation={orientation}
			onValueChange={(next) => onValueChange?.(next as string[])}
		>
			{items
				? items.map((item) => <AccordionItem key={item.value} headingLevel={headingLevel} {...item} />)
				: children}
		</BaseAccordion.Root>
	);
};

export default Accordion;
