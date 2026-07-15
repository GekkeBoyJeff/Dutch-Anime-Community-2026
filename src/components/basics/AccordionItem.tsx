'use client';

import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { AccordionItemProps as AccordionItemSchemaProps } from '@/lib/content/schema/basics/accordionItem';

export type AccordionItemProps = AccordionItemSchemaProps & {
	/** The panel content; may contain HTML when a string. `children` wins when both are given */
	content?: ReactNode;
	/** Panel content as children (alternative to `content`) */
	children?: ReactNode;
};

// One collapsible row — header, trigger and panel in a single piece (Base UI provides the per-item
// open context, the aria-expanded/aria-controls wiring and the measured panel height). Render it as a
// child of Accordion, or let Accordion build a set of these from its `items` prop.
const AccordionItem = ({
	value,
	title,
	content,
	disabled,
	headingLevel = 3,
	icon = 'chevron-down',
	keepMounted = false,
	hiddenUntilFound = true,
	className,
	children,
	ref,
}: AccordionItemProps & { ref?: Ref<HTMLDivElement> }) => {
	const Heading = `h${headingLevel}` as React.ElementType;

	// hiddenUntilFound (hidden="until-found") keeps the panel mounted so browser find-in-page can reveal
	// it; Base UI then ignores keepMounted={false}, so fold it in to avoid the contradiction (and warning).
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden#the_hidden_until_found_state
	const panelKeepMounted = hiddenUntilFound || keepMounted;

	return (
		<BaseAccordion.Item ref={ref} className={classNames('accordion-item', className)} value={value} disabled={disabled}>
			<BaseAccordion.Header className="header" render={<Heading />}>
				<BaseAccordion.Trigger className="trigger">
					<Content element="span" className="label" value={title} />
					<Icon name={icon} className="chevron" />
				</BaseAccordion.Trigger>
			</BaseAccordion.Header>

			<BaseAccordion.Panel className="panel" keepMounted={panelKeepMounted} hiddenUntilFound={hiddenUntilFound}>
				<div className="body">{children ?? content}</div>
			</BaseAccordion.Panel>
		</BaseAccordion.Item>
	);
};

export default AccordionItem;
