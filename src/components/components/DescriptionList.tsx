import parse from 'html-react-parser';

import { classNames } from '@/lib/shared/classNames';
import type { DescriptionListProps as DescriptionListSchemaProps } from '@/lib/site/content/schema/components/descriptionList';

type DescriptionListProps = DescriptionListSchemaProps;

const DescriptionList = ({
	items,
	layout = 'stacked',
	divided = false,
	className,
}: DescriptionListProps) => {
	return (
		<dl className={classNames('description-list', `is-${layout}`, divided && 'is-divided', className)}>
			{items.map((item) => (
				<div className="description-list-row" key={item.term}>
					<dt className="description-list-term">{parse(item.term)}</dt>
					<dd className="description-list-description">{parse(item.description)}</dd>
				</div>
			))}
		</dl>
	);
};

export default DescriptionList;
