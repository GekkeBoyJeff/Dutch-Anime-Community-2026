import { Accordion as BaseAccordion } from '@base-ui/react/accordion';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/shared/classNames';
import type { AccordionItemProps as AccordionItemSchemaProps } from '@/lib/site/content/schema/basics/accordionItem';

type AccordionItemProps = AccordionItemSchemaProps;

const AccordionItem = ({
	id,
	title,
	value,
	disabled,
	headingLevel = 3,
	icon = 'chevron-down',
	keepMounted = false,
	hiddenUntilFound = true,
	className,
}: AccordionItemProps) => {
	const Heading = `h${headingLevel}` as React.ElementType;

	// hiddenUntilFound (hidden="until-found") keeps the panel mounted so browser find-in-page can reveal
	// it; Base UI then ignores keepMounted={false}, so fold it in to avoid the contradiction (and warning).
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden#the_hidden_until_found_state
	const panelKeepMounted = hiddenUntilFound || keepMounted;

	return (
		<BaseAccordion.Item value={id} className={classNames('accordion-item', className)} disabled={disabled}>
			<BaseAccordion.Header className="accordion-item-header" render={<Heading />}>
				<BaseAccordion.Trigger className="accordion-item-trigger">
					<Content element="span" className="accordion-item-label" value={title} />
					<Icon name={icon} className="accordion-item-chevron" />
				</BaseAccordion.Trigger>
			</BaseAccordion.Header>

			<BaseAccordion.Panel className="accordion-item-panel" keepMounted={panelKeepMounted} hiddenUntilFound={hiddenUntilFound}>
				<div className="accordion-item-body">{value && <Content value={value} />}</div>
			</BaseAccordion.Panel>
		</BaseAccordion.Item>
	);
};

export default AccordionItem;
