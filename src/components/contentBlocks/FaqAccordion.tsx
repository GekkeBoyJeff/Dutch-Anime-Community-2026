import Accordion from '@/components/basics/Accordion';
import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { FaqAccordionProps as FaqAccordionSchemaProps, FaqItem } from '@/lib/site/content/schema/blocks/faqAccordion';

type FaqAccordionProps = FaqAccordionSchemaProps;

const UNCATEGORISED = 'Overig';

const buildGroups = (items: FaqItem[], groupByCategory?: boolean) => {
	const rows = items.map(({ category, ...row }) => ({ group: groupByCategory ? category || UNCATEGORISED : null, row }));

	return [...new Set(rows.map(({ group }) => group))].map((category) => ({
		category,
		items: rows.filter(({ group }) => group === category).map(({ row }) => row),
	}));
};

const FaqAccordion = ({
	heading,
	items,
	numbered = false,
	groupByCategory = false,
	singleOpen = false,
	colorset,
}: FaqAccordionProps) => {
	const groups = buildGroups(items, groupByCategory);

	return (
		<Section colorset={colorset} className={classNames('faq-accordion', numbered && 'is-numbered')}>
			<Container>
				<HeadingGroup {...heading} element="header" className="faq-accordion-header" />

				<div className="faq-accordion-groups">
					{groups.map(({ category, items: groupItems }) => (
						<div key={category ?? 'all'} className="faq-accordion-group">
							{category && <Title element="h3" size={5} className="faq-accordion-group-title" value={category} />}

							<Accordion multiple={!singleOpen} headingLevel={4} items={groupItems} />
						</div>
					))}
				</div>
			</Container>
		</Section>
	);
};

export default FaqAccordion;
