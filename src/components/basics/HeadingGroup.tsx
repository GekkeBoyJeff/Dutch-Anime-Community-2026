import type { ElementType, Ref } from 'react';

import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { HeadingGroupProps } from '@/lib/content/schema/basics/headingGroup';

type HeadingGroupComponentProps = HeadingGroupProps & {
	element?: ElementType;
};

// Tagline + Title + intro cluster — the section-heading composite blocks open with. Renders nothing
// when empty, so a block can pass its optional fields straight through.
const HeadingGroup = ({
	title,
	size = 2,
	tagline,
	intro,
	orientation = 'normal',
	align = 'start',
	element: Tag = 'div',
	className,
	ref,
}: HeadingGroupComponentProps & { ref?: Ref<HTMLElement> }) => {
	if (!title && !tagline && !intro) {
		return null;
	}

	return (
		<Tag
			ref={ref}
			className={classNames(
				'heading-group',
				orientation === 'reversed' && 'is-reversed',
				align === 'center' && 'is-center',
				className,
			)}
		>
			{tagline && <Content element="p" className="tagline" value={tagline} />}
			{title && <Title size={size} value={title} />}
			{intro && <Content className="intro" value={intro} />}
		</Tag>
	);
};

export default HeadingGroup;
