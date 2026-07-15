import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';

interface SectionHeaderProps {
	/** Section heading, rendered with the h2 type role */
	title?: string;
	intro?: string;
}

// The shared heading group (title + intro) that opens a content block. Renders nothing when both are
// absent, so a block can pass its optional fields straight through. One definition, used by the blocks
// that share this "section intro" shape (FeatureCards, Reviews).
const SectionHeader = ({ title, intro, ref }: SectionHeaderProps & { ref?: Ref<HTMLElement> }) => {
	if (!title && !intro) {
		return null;
	}

	return (
		<header ref={ref} className="section-header">
			{title && <Title size={2} value={title} />}
			{intro && <Content value={intro} />}
		</header>
	);
};

export default SectionHeader;
