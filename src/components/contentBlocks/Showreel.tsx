import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import Swiper from '@/components/components/Swiper';
import type { ShowreelProps } from '@/lib/content';

// Case-style showreel: the shared Swiper (Embla, captions, video lightbox) promoted to a block,
// with the heading cluster every section block carries.
const Showreel = ({ heading, slides = [], ratio = '16 / 9', loop = true, showCounter = true, colorset, ref }: ShowreelProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="showreel">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						element="header"
						className="header"
					/>
				)}

				<Swiper
					slides={slides}
					ratio={ratio}
					rounded="xl"
					loop={loop}
					showCounter={showCounter}
					label={heading?.value ?? 'Showreel'}
				/>
			</Container>
		</Section>
	);
};

export default Showreel;
