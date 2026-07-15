import type { Ref } from 'react';

import Accordion from '@/components/basics/Accordion';
import AccordionItem from '@/components/basics/AccordionItem';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { FaqAccordionProps, FaqItem } from '@/lib/content';

// Label for items without a `category` when grouping is on. Kept here as the single fallback so a
// CMS that omits a category still lands under one tidy heading.
const UNCATEGORISED = 'Overig';

// One rendered group: its label (null when ungrouped) and its items.
interface FaqGroup {
	category: string | null;
	items: FaqItem[];
}

// Groups items by `category` while preserving first-seen order, so the page author controls the
// section order simply by item order. Without grouping everything lands in one nameless group.
// Relies on Map keeping insertion order: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const buildGroups = (items: FaqItem[], groupByCategory?: boolean): FaqGroup[] => {
	const order: string[] = [];
	const buckets = new Map<string, FaqItem[]>();

	for (const item of items) {
		const key = groupByCategory ? item.category || UNCATEGORISED : '';
		if (!buckets.has(key)) {
			buckets.set(key, []);
			order.push(key);
		}
		buckets.get(key)?.push(item);
	}

	return order.map((key) => ({
		category: groupByCategory ? key : null,
		items: buckets.get(key) ?? [],
	}));
};

// FAQ section composed from the Accordion primitive (one Accordion per category group), so the
// disclosure behaviour, keyboard/ARIA wiring, chevron and states are the library's single source —
// not a second hand-rolled <details> implementation. `singleOpen` maps to Accordion's single-open mode
// (multiple={false}); numbering is a CSS counter on the section (no markup injection). AccordionItem
// keeps each answer in the DOM via hiddenUntilFound, so find-in-page and crawlers still reach it.
const FaqAccordion = ({
	heading,
	description,
	items = [],
	numbered = false,
	groupByCategory = false,
	singleOpen = false,
	colorset,
	ref,
}: FaqAccordionProps & { ref?: Ref<HTMLElement> }) => {
	const groups = buildGroups(items, groupByCategory);

	return (
		<Section ref={ref} colorset={colorset} className={classNames('faq-accordion', numbered && 'is-numbered')}>
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro ?? description}
					element="header"
					className="header"
				/>

				<div className="groups">
					{groups.map(({ category, items: groupItems }) => (
						<div key={category ?? 'all'} className="group">
							{category && <Title element="h3" size={5} className="group-title" value={category} />}

							<Accordion multiple={!singleOpen}>
								{groupItems.map((item) => (
									<AccordionItem key={item.id} value={String(item.id)} title={item.question} headingLevel={4}>
										<Content value={item.answer} />
									</AccordionItem>
								))}
							</Accordion>
						</div>
					))}
				</div>
			</Container>
		</Section>
	);
};

export default FaqAccordion;
