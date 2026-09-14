import Actions from '@/components/basics/Actions/Actions';
import Column from '@/components/basics/Column/Column';
import Columns from '@/components/basics/Columns/Columns';
import Content from '@/components/basics/Content/Content';
import Title from '@/components/basics/Title/Title';
import { classNames } from '@/lib/shared/classNames';

import type { HeadingGroupProps as HeadingGroupSchemaProps } from './HeadingGroup.schema';

import './HeadingGroup.scss';

type HeadingGroupProps = HeadingGroupSchemaProps;

const HeadingGroup = ({
	element = 'div',
	title,
	size = 2,
	tagline,
	intro,
	orientation = 'normal',
	align = 'start',
	actions = [],
	className,
}: HeadingGroupProps) => {
	if (!title && !tagline && !intro && !actions.length) {
		return null;
	}

	const Tag = element as React.ElementType;

	return (
		<Tag
			className={classNames(
				'heading-group',
				orientation === 'reversed' && 'is-reversed',
				align === 'center' && 'is-center',
				className,
			)}
		>
			{tagline && (
				<Content
					element="p"
					size="small"
					className="heading-group-tagline"
					value={tagline}
				/>
			)}
			{orientation === 'split' ? (
				<Columns gap="xl">
					<Column
						span={{
							default: 12,
							l: 6,
						}}
					>
						{title && (
							<Title size={size} value={title} />
						)}
					</Column>
					<Column
						span={{
							default: 12,
							l: 6,
						}}
						className="heading-group-aside"
					>
						{intro && (
							<Content className="heading-group-intro" value={intro} />
						)}
						<Actions actions={actions} className="heading-group-actions" />
					</Column>
				</Columns>
			) : (
				<>
					{title && (
						<Title size={size} value={title} />
					)}
					{intro && (
						<Content className="heading-group-intro" value={intro} />
					)}
					<Actions actions={actions} className="heading-group-actions" />
				</>
			)}
		</Tag>
	);
};

export default HeadingGroup;
