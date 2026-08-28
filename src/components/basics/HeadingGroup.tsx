import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { HeadingGroupProps as HeadingGroupSchemaProps } from '@/lib/site/content/schema/basics/headingGroup';

type HeadingGroupProps = HeadingGroupSchemaProps;

const HeadingGroup = ({
	element = 'div',
	title,
	size = 2,
	tagline,
	intro,
	orientation = 'normal',
	align = 'start',
	className,
}: HeadingGroupProps) => {
	if (!title && !tagline && !intro) {
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
			{tagline && <Content element="p" className="heading-group-tagline" value={tagline} />}
			{title && <Title size={size} value={title} />}
			{intro && <Content className="heading-group-intro" value={intro} />}
		</Tag>
	);
};

export default HeadingGroup;
