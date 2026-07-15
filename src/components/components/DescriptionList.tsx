import parse from 'html-react-parser';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { DescriptionListProps as DescriptionListSchemaProps } from '@/lib/content/schema/components/descriptionList';

interface DescriptionItem {
	/** The term, e.g. "Venue" */
	term: string;
	/** The value; a string is parsed as HTML, otherwise rendered as-is */
	description: ReactNode;
}

type DescriptionListProps = Omit<DescriptionListSchemaProps, 'items'> & {
	/** The term/description pairs, in display order */
	items: DescriptionItem[];
};

// Semantic <dl> for spec/detail panels — event detail pages (date, venue, price, organizer) and the
// like. Each pair is wrapped in a <div> so the term and value can sit side by side in the inline
// layout. Pure CSS, server-safe.
const DescriptionList = ({
	items,
	layout = 'stacked',
	divided = false,
	className,
	ref,
}: DescriptionListProps & { ref?: Ref<HTMLDListElement> }) => {
	return (
		<dl ref={ref} className={classNames('description-list', `is-${layout}`, divided && 'is-divided', className)}>
			{items.map((item) => (
				<div className="row" key={item.term}>
					<dt className="term">{parse(item.term)}</dt>
					<dd className="description">
						{typeof item.description === 'string' ? parse(item.description) : item.description}
					</dd>
				</div>
			))}
		</dl>
	);
};

export default DescriptionList;
